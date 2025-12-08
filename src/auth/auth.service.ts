import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { User } from 'src/generated/prisma/client';
import argon2 from 'argon2';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';

export type UserData = { name: string; email: string; password: string };
export type LoginUserData = Omit<User, 'name' | 'id'>;

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  // service --> Register (responsible for user register)
  // route --> /auth/register
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

  // service --> Login (responsible for user login)
  //route --> /auth/login
  async postLogin(
    userData: LoginUserData,
  ): Promise<{ access_token?: string; message?: string }> {
    const user = await this.prisma.user.findUnique({
      where: { email: userData.email },
    });

    if (user?.id) {
      // verifying the password is correct or not
      const isPasswordMatch = await argon2.verify(
        user.password,
        userData.password,
      );

      if (isPasswordMatch) {
        // actions for login
        const payload = { id: user.id, email: user.email };

        return {
          access_token: this.jwtService.sign(payload),
        };
      } else {
        // unauthorized for wrong password
        throw new UnauthorizedException('Wrong Password');
      }
    } else {
      // Handling user not found error
      throw new NotFoundException('User not found');
    }
  }

  // service --> get all users (responsible for viewing all users)
  // route --> /auth/all
  async getAll(): Promise<Omit<User, 'password'>[]> {
    const users = await this.prisma.user.findMany({
      select: { id: true, email: true, name: true },
    });
    return users;
  }

  async getProfile(req: Request): Promise<{
    id: number | string;
    email: string;
    name: string;
  }> {
    const userFromClient = req.user;

    const userFromDb = await this.prisma.user.findUnique({
      where: { id: userFromClient?.id },
      select: { id: true, name: true, email: true },
    });

    if (userFromDb?.id) {
      return userFromDb;
    } else {
      throw new NotFoundException('User Not Found');
    }
  }
}
