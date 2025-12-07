import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { User } from 'src/generated/prisma/client';
import argon2 from 'argon2';

export type UserData = { name: string; email: string; password: string };

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService) {}

  async postRegister(userData: UserData): Promise<{ message: string }> {
    console.log(userData);

    const passwordHash = await argon2.hash(userData.password);

    const newUser = await this.prisma.user.create({
      data: { ...userData, password: passwordHash },
    });

    if (newUser.id) {
      return { message: 'User created successfully' };
    } else {
      return { message: 'User creation failed' };
    }
  }

  async getAll(): Promise<User[]> {
    const users = await this.prisma.user.findMany();
    return users;
  }
}
