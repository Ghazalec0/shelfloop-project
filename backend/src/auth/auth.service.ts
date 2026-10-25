import { Injectable, UnauthorizedException, ConflictException, NotFoundException, BadRequestException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { LoginDto } from './dto/login.dto';
import { Role } from '@prisma/client';
import { MailService } from '../mail/mail.service';
import Redis from 'ioredis';

@Injectable()
export class AuthService {
  private redis: Redis;

  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private mailService: MailService,
  ) {
    this.redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');
  }

  async register(dto: CreateUserDto) {
    const existing = await this.usersService.findByEmail(dto.email);
    if (existing) throw new ConflictException('Email already exists');

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const hashedPassword = await bcrypt.hash(dto.password, 10);

    const registrationData = {
      name: dto.name,
      email: dto.email,
      password: hashedPassword,
      role: dto.role || Role.USER,
      otp,
    };

    await this.redis.setex(
      `register:${dto.email}`,
      300,
      JSON.stringify(registrationData),
    );

    await this.mailService.sendOtp(dto.email, otp);

    return {
      message: 'OTP sent to your email for registration verification',
      email: dto.email,
    };
  }

  async verifyRegister(email: string, otp: string) {
    const dataStr = await this.redis.get(`register:${email}`);
    if (!dataStr) {
      throw new BadRequestException('OTP expired or registration session not found');
    }

    const registrationData = JSON.parse(dataStr);

    if (registrationData.otp !== otp) {
      throw new BadRequestException('Invalid OTP');
    }

    const existing = await this.usersService.findByEmail(email);
    if (existing) {
      await this.redis.del(`register:${email}`);
      throw new ConflictException('Email already exists');
    }

    await this.usersService.createPrehashed({
      name: registrationData.name,
      email: registrationData.email,
      password: registrationData.password,
      role: registrationData.role,
    });

    await this.redis.del(`register:${email}`);

    return {
      message: 'Account created successfully. Please sign in.',
    };
  }

  async login(dto: LoginDto) {
    const user = await this.usersService.findByEmail(dto.email);
    if (!user || user.isDeleted) throw new UnauthorizedException('Account disabled or invalid credentials');

    const isMatch = await bcrypt.compare(dto.password, user.password);
    if (!isMatch) throw new UnauthorizedException('Invalid credentials');

    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

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

    return {
      message: 'OTP sent to your email',
      email,
    };
  }

  async verifyOtp(email: string, otp: string) {
    const user = await this.usersService.findByEmail(email);
    if (!user || user.isDeleted || !user.otpCode) throw new BadRequestException('No OTP found, request forgot-password first');

    if (user.otpExpiresAt && user.otpExpiresAt < new Date()) {
      throw new BadRequestException('OTP expired, request new one');
    }

    if (user.otpCode !== otp) throw new BadRequestException('Invalid OTP');

    await this.usersService.updateByEmail(email, {
      otpVerified: true,
    });

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