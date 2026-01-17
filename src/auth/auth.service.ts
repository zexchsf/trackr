import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { ApiError } from '../common/errors/api.error';
import * as bcrypt from 'bcrypt';
import { TokenService } from '../token/token.service';
@Injectable()
export class AuthService {
  constructor(private readonly prisma: PrismaService, private readonly tokenService: TokenService) {}

  async register(registerDto: RegisterDto) {
    try {
      const userExists = await this.prisma.user.findUnique({
        where: {
          email: registerDto.email,
        },
      });
      if (userExists) {
        throw new BadRequestException('User with this email already exists');
      }

      const hashedPassword = await bcrypt.hash(registerDto.password, 10);

      const user = await this.prisma.user.create({
        data: {
          ...registerDto,
          password: hashedPassword,
        },
      });

      const { password, ...userWithoutPassword } = user;
      return userWithoutPassword;
    } catch (error) {
      throw ApiError.fromError(error);
    }
  }

  async login(loginDto: LoginDto) {
    try {
      const user = await this.prisma.user.findUnique({
        where: {
          email: loginDto.email,
        },
      });
      if (!user) {
        throw new UnauthorizedException('Invalid credentials');
      }
      const isPasswordValid = await bcrypt.compare(
        loginDto.password,
        user.password,
      );
      if (!isPasswordValid) {
        throw new UnauthorizedException('Invalid credentials');
      }
      const { password, ...userWithoutPassword } = user;

      const tokens = await this.tokenService.generateAuthTokens({
        sub: user.id,
        email: user.email,
      });
      return {
        user: userWithoutPassword,
        tokens,
      }
    } catch (error) {
      throw ApiError.fromError(error);
    }
  }
}
