import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  Inject,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import {
  IUserRepository,
  USER_REPOSITORY,
  UserRecord,
} from '../../domain/repositories/user.repository.interface';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { JwtPayload } from './interfaces/jwt-payload.interface';
import { Role } from '../../domain/entities/role.enum';

const SALT_ROUNDS = 12;

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface UserProfile {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
}

@Injectable()
export class AuthService {
  constructor(
    @Inject(USER_REPOSITORY) private readonly userRepository: IUserRepository,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async register(dto: RegisterDto): Promise<UserProfile> {
    const existing = await this.userRepository.findByEmail(dto.email);

    if (existing) {
      throw new ConflictException('Email already registered');
    }

    const passwordHash = await bcrypt.hash(dto.password, SALT_ROUNDS);

    const user = await this.userRepository.create({
      email: dto.email,
      passwordHash,
      firstName: dto.firstName,
      lastName: dto.lastName,
    });

    return this.toProfile(user);
  }

  async login(dto: LoginDto): Promise<{ tokens: AuthTokens; user: UserProfile }> {
    const user = await this.userRepository.findByEmail(dto.email);

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const passwordMatch = await bcrypt.compare(dto.password, user.passwordHash);

    if (!passwordMatch) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const tokens = await this.generateTokens(user);
    await this.persistRefreshTokenHash(user.id, tokens.refreshToken);

    return { tokens, user: this.toProfile(user) };
  }

  async refreshTokens(userId: string, incomingRefreshToken: string): Promise<AuthTokens> {
    const user = await this.userRepository.findById(userId);

    if (!user || !user.refreshTokenHash) {
      throw new UnauthorizedException();
    }

    const tokenMatch = await bcrypt.compare(incomingRefreshToken, user.refreshTokenHash);

    if (!tokenMatch) {
      throw new UnauthorizedException();
    }

    const tokens = await this.generateTokens(user);
    await this.persistRefreshTokenHash(user.id, tokens.refreshToken);

    return tokens;
  }

  async logout(userId: string): Promise<void> {
    await this.userRepository.updateRefreshTokenHash(userId, null);
  }

  private async generateTokens(user: UserRecord): Promise<AuthTokens> {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: this.configService.get<string>('JWT_SECRET'),
        expiresIn: this.configService.get<string>('JWT_ACCESS_EXPIRATION', '15m'),
      }),
      this.jwtService.signAsync(payload, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
        expiresIn: this.configService.get<string>('JWT_REFRESH_EXPIRATION', '7d'),
      }),
    ]);

    return { accessToken, refreshToken };
  }

  private async persistRefreshTokenHash(userId: string, refreshToken: string): Promise<void> {
    const hash = await bcrypt.hash(refreshToken, SALT_ROUNDS);
    await this.userRepository.updateRefreshTokenHash(userId, hash);
  }

  private toProfile(user: UserRecord): UserProfile {
    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
    };
  }

  isAdmin(role: string): boolean {
    return role === Role.ADMIN;
  }
}
