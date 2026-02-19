import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { AuthService } from './auth.service';
import {
  IUserRepository,
  USER_REPOSITORY,
  UserRecord,
} from '../../domain/repositories/user.repository.interface';

describe('AuthService', () => {
  let service: AuthService;
  let userRepo: jest.Mocked<IUserRepository>;

  const mockUser: UserRecord = {
    id: 'user-1',
    email: 'test@test.com',
    passwordHash: '', // will be set in beforeEach
    firstName: 'John',
    lastName: 'Doe',
    role: 'CUSTOMER',
    refreshTokenHash: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    mockUser.passwordHash = await bcrypt.hash('Valid@123', 12);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: USER_REPOSITORY,
          useValue: {
            findByEmail: jest.fn(),
            findById: jest.fn(),
            create: jest.fn(),
            updateRefreshTokenHash: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: {
            signAsync: jest.fn().mockResolvedValue('mock-token'),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn().mockReturnValue('test-secret'),
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    userRepo = module.get(USER_REPOSITORY);
  });

  describe('register', () => {
    it('should create a new user successfully', async () => {
      userRepo.findByEmail.mockResolvedValue(null);
      userRepo.create.mockResolvedValue(mockUser);

      const result = await service.register({
        email: 'new@test.com',
        password: 'Valid@123',
        firstName: 'John',
        lastName: 'Doe',
      });

      expect(result).toEqual({
        id: mockUser.id,
        email: mockUser.email,
        firstName: mockUser.firstName,
        lastName: mockUser.lastName,
        role: mockUser.role,
      });
      expect(userRepo.findByEmail).toHaveBeenCalledWith('new@test.com');
      expect(userRepo.create).toHaveBeenCalled();
    });

    it('should throw ConflictException when email is already registered', async () => {
      userRepo.findByEmail.mockResolvedValue(mockUser);

      await expect(
        service.register({
          email: 'test@test.com',
          password: 'Valid@123',
          firstName: 'John',
          lastName: 'Doe',
        }),
      ).rejects.toThrow(ConflictException);

      expect(userRepo.create).not.toHaveBeenCalled();
    });
  });

  describe('login', () => {
    it('should return tokens and user profile on valid credentials', async () => {
      userRepo.findByEmail.mockResolvedValue(mockUser);
      userRepo.updateRefreshTokenHash.mockResolvedValue(undefined);

      const result = await service.login({
        email: 'test@test.com',
        password: 'Valid@123',
      });

      expect(result.user.email).toBe('test@test.com');
      expect(result.tokens.accessToken).toBe('mock-token');
      expect(result.tokens.refreshToken).toBe('mock-token');
    });

    it('should throw UnauthorizedException when user is not found', async () => {
      userRepo.findByEmail.mockResolvedValue(null);

      await expect(
        service.login({ email: 'unknown@test.com', password: 'any' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException on wrong password', async () => {
      userRepo.findByEmail.mockResolvedValue(mockUser);

      await expect(
        service.login({ email: 'test@test.com', password: 'WrongPassword@1' }),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('refreshTokens', () => {
    it('should throw UnauthorizedException when user is not found', async () => {
      userRepo.findById.mockResolvedValue(null);

      await expect(
        service.refreshTokens('non-existent', 'token'),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException when refresh token hash is null', async () => {
      userRepo.findById.mockResolvedValue({
        ...mockUser,
        refreshTokenHash: null,
      });

      await expect(
        service.refreshTokens(mockUser.id, 'token'),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException when token does not match', async () => {
      const storedHash = await bcrypt.hash('correct-token', 12);
      userRepo.findById.mockResolvedValue({
        ...mockUser,
        refreshTokenHash: storedHash,
      });

      await expect(
        service.refreshTokens(mockUser.id, 'wrong-token'),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should return new tokens when refresh token is valid', async () => {
      const validToken = 'valid-refresh-token';
      const storedHash = await bcrypt.hash(validToken, 12);
      userRepo.findById.mockResolvedValue({
        ...mockUser,
        refreshTokenHash: storedHash,
      });
      userRepo.updateRefreshTokenHash.mockResolvedValue(undefined);

      const result = await service.refreshTokens(mockUser.id, validToken);

      expect(result.accessToken).toBe('mock-token');
      expect(result.refreshToken).toBe('mock-token');
    });
  });

  describe('logout', () => {
    it('should clear the refresh token hash', async () => {
      userRepo.updateRefreshTokenHash.mockResolvedValue(undefined);

      await service.logout(mockUser.id);

      expect(userRepo.updateRefreshTokenHash).toHaveBeenCalledWith(
        mockUser.id,
        null,
      );
    });
  });

  describe('isAdmin', () => {
    it('should return true for ADMIN role', () => {
      expect(service.isAdmin('ADMIN')).toBe(true);
    });

    it('should return false for CUSTOMER role', () => {
      expect(service.isAdmin('CUSTOMER')).toBe(false);
    });
  });
});
