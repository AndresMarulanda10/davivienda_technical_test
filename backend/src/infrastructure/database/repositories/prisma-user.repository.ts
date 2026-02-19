import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import {
  IUserRepository,
  UserRecord,
  CreateUserData,
} from '../../../domain/repositories/user.repository.interface';

@Injectable()
export class PrismaUserRepository implements IUserRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<UserRecord | null> {
    return this.prisma.user.findUnique({ where: { id } });
  }

  async findByEmail(email: string): Promise<UserRecord | null> {
    return this.prisma.user.findUnique({ where: { email } });
  }

  async create(data: CreateUserData): Promise<UserRecord> {
    return this.prisma.user.create({ data });
  }

  async updateRefreshTokenHash(id: string, hash: string | null): Promise<void> {
    await this.prisma.user.update({
      where: { id },
      data: { refreshTokenHash: hash },
    });
  }
}
