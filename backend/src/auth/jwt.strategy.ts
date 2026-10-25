import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UsersService } from '../users/users.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly usersService: UsersService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'supersecretkey123',
    });
  }

  async validate(payload: any) {
    const userId = payload.sub || payload.id;
    const user = await this.usersService.findById(userId);

    if (!user || user.isDeleted) {
      throw new UnauthorizedException('Account disabled or no longer exists');
    }

    return { 
      id: user.id, 
      email: user.email, 
      role: user.role 
    };
  }
}

