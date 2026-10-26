import { Injectable, UnauthorizedException, ConflictException, NotFoundException, BadRequestException, Logger, OnModuleDestroy } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { LoginDto } from './dto/login.dto';
import { Role } from '@prisma/client';
import { MailService } from '../mail/mail.service';
import Redis from 'ioredis';

type RegistrationData = {
  name: string;
  email: string;
  password: string;
  role: Role;
  otp: string;
  createdAt: number;
};

@Injectable()
export class AuthService implements OnModuleDestroy {
  private redis: Redis | null = null;
  private readonly logger = new Logger(AuthService.name);
  private memoryStore = new Map<string, { data: string; expiresAt: number }>();
  private redisEnabled = false;

  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private mailService: MailService,
  ) {
    this.initRedis();
    setInterval(() => this.cleanMemoryStore(), 60 * 1000);
  }

  private initRedis() {
    const redisUrl = process.env.REDIS_URL;
    const isProduction = process.env.NODE_ENV === 'production';
    const isLocalhost = !redisUrl || redisUrl.includes('localhost') || redisUrl.includes('127.0.0.1');

    if (isProduction && isLocalhost) {
      this.logger.warn('REDIS_URL is localhost in production - using in-memory fallback. Please set Upstash Redis URL in Vercel env.');
      this.redisEnabled = false;
      return;
    }

    if (!redisUrl) {
      this.logger.warn('REDIS_URL not set - using in-memory fallback');
      this.redisEnabled = false;
      return;
    }

    try {
      this.redis = new Redis(redisUrl, {
        maxRetriesPerRequest: 3,
        enableReadyCheck: false,
        enableOfflineQueue: false,
        retryStrategy: (times) => {
          if (times > 3) {
            this.logger.error('Redis retry failed, switching to memory fallback');
            return null;
          }
          return Math.min(times * 200, 1000);
        },
        lazyConnect: true,
        connectTimeout: 3000,
        commandTimeout: 3000,
      });

      this.redis.on('connect', () => {
        this.logger.log('Redis connected successfully');
        this.redisEnabled = true;
      });

      this.redis.on('error', (err) => {
        this.logger.error(`Redis error: ${err.message} - using memory fallback`);
        this.redisEnabled = false;
      });

      this.redis.on('close', () => {
        this.redisEnabled = false;
      });

      this.redis.connect().catch((err) => {
        this.logger.error(`Redis connect failed: ${err.message} - using memory fallback`);
        this.redisEnabled = false;
      });
    } catch (err: any) {
      this.logger.error(`Redis init failed: ${err.message} - using memory fallback`);
      this.redisEnabled = false;
      this.redis = null;
    }
  }

  private cleanMemoryStore() {
    const now = Date.now();
    for (const [key, value] of this.memoryStore.entries()) {
      if (value.expiresAt < now) this.memoryStore.delete(key);
    }
  }

  private async safeSetEx(key: string, ttlSeconds: number, value: string): Promise<void> {
    if (this.redisEnabled && this.redis) {
      try {
        await this.redis.setex(key, ttlSeconds, value);
        return;
      } catch (e: any) {
        this.logger.warn(`Redis setex failed, using memory: ${e.message}`);
      }
    }
    this.memoryStore.set(key, { data: value, expiresAt: Date.now() + ttlSeconds * 1000 });
  }

  private async safeGet(key: string): Promise<string | null> {
    if (this.redisEnabled && this.redis) {
      try {
        const val = await this.redis.get(key);
        if (val !== null) return val;
      } catch (e: any) {
        this.logger.warn(`Redis get failed, trying memory: ${e.message}`);
      }
    }
    const mem = this.memoryStore.get(key);
    if (!mem) return null;
    if (mem.expiresAt < Date.now()) {
      this.memoryStore.delete(key);
      return null;
    }
    return mem.data;
  }

  private async safeDel(key: string): Promise<void> {
    if (this.redisEnabled && this.redis) {
      try {
        await this.redis.del(key);
      } catch {}
    }
    this.memoryStore.delete(key);
  }

  async onModuleDestroy() {
    if (this.redis) {
      try {
        await this.redis.quit();
      } catch {}
    }
  }

  async register(dto: CreateUserDto) {
    const existing = await this.usersService.findByEmail(dto.email);
    if (existing) throw new ConflictException('Email already exists');

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const hashedPassword = await bcrypt.hash(dto.password, 10);

    const registrationData: RegistrationData = {
      name: dto.name,
      email: dto.email,
      password: hashedPassword,
      role: dto.role || Role.USER,
      otp,
      createdAt: Date.now(),
    };

    await this.safeSetEx(`register:${dto.email}`, 300, JSON.stringify(registrationData));

    try {
      await this.mailService.sendOtp(dto.email, otp);
    } catch (mailErr: any) {
      this.logger.error(`Failed to send OTP email: ${mailErr.message}`);
      throw new BadRequestException('Failed to send OTP email, please try again');
    }

    return {
      message: 'OTP sent to your email for registration verification',
      email: dto.email,
    };
  }

  async verifyRegister(email: string, otp: string) {
    const dataStr = await this.safeGet(`register:${email}`);
    if (!dataStr) {
      throw new BadRequestException('OTP expired or registration session not found. Please register again.');
    }

    const registrationData = JSON.parse(dataStr) as RegistrationData;

    if (registrationData.otp !== otp) {
      throw new BadRequestException('Invalid OTP');
    }

    const existing = await this.usersService.findByEmail(email);
    if (existing) {
      await this.safeDel(`register:${email}`);
      throw new ConflictException('Email already exists');
    }

    await this.usersService.createPrehashed({
      name: registrationData.name,
      email: registrationData.email,
      password: registrationData.password,
      role: registrationData.role,
    });

    await this.safeDel(`register:${email}`);

    return {
      message: 'Account created successfully. Please sign in.',
    };
  }

  async login(dto: LoginDto) {
    const user = await this.usersService.findByEmail(dto.email);
    if (!user || user.isDeleted) throw new UnauthorizedException('Account disabled or invalid credentials');

    const isMatch = await bcrypt.compare(dto.password, user.password);
    if (!isMatch) throw new UnauthorizedException('Invalid credentials');

    const payload = { sub: user.id, email: user.email, role: user.role };

    return {
      access_token: this.jwtService.sign(payload),
      user: { id: user.id, email: user.email, name: user.name, role: user.role },
    };
  }

  async forgotPassword(email: string) {
    const user = await this.usersService.findByEmail(email);
    if (!user || user.isDeleted) throw new NotFoundException('User not found');

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    await this.usersService.updateByEmail(email, {
      otpCode: otp,
      otpExpiresAt: expiresAt,
      otpVerified: false,
    });

    await this.mailService.sendOtp(email, otp);

    return { message: 'OTP sent to your email', email };
  }

  async verifyOtp(email: string, otp: string) {
    const user = await this.usersService.findByEmail(email);
    if (!user || user.isDeleted || !user.otpCode) throw new BadRequestException('No OTP found, request forgot-password first');

    if (user.otpExpiresAt && user.otpExpiresAt < new Date()) {
      throw new BadRequestException('OTP expired, request new one');
    }

    if (user.otpCode !== otp) throw new BadRequestException('Invalid OTP');

    await this.usersService.updateByEmail(email, { otpVerified: true });

    return { message: 'OTP verified successfully, you can now reset password' };
  }

  async resetPasswordWithOtp(email: string, otp: string, newPassword: string) {
    const user = await this.usersService.findByEmail(email);
    if (!user || user.isDeleted || !user.otpCode) throw new BadRequestException('No OTP found');

    if (user.otpExpiresAt && user.otpExpiresAt < new Date()) {
      throw new BadRequestException('OTP expired');
    }

    if (user.otpCode !== otp) throw new BadRequestException('Invalid OTP');
    if (!user.otpVerified) throw new BadRequestException('OTP not verified, verify first');

    const hashed = await bcrypt.hash(newPassword, 10);

    await this.usersService.updateByEmail(email, {
      password: hashed,
      otpCode: null,
      otpExpiresAt: null,
      otpVerified: false,
    });

    return { message: 'Password reset successfully' };
  }
}
