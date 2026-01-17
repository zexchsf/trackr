import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import {
  UserProfileDto,
  RiderProfileDto,
} from './dto/complete-profile.dto';
import { ApiError } from '../common/errors/api.error';
import * as bcrypt from 'bcrypt';
import { TokenService } from '../token/token.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly tokenService: TokenService,
  ) {}

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
          email: registerDto.email,
          phone_number: registerDto.phone_number,
          password: hashedPassword,
          role: registerDto.role,
        },
      });

      const { password, ...userWithoutPassword } = user;
      return userWithoutPassword;
    } catch (error) {
      throw ApiError.fromError(error);
    }
  }

  async completeProfile(userId: string, profileDto: UserProfileDto | RiderProfileDto) {
    try {
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        include: {
          profile: true,
          rider_profile: true,
        }
      });

      if (!user) {
        throw new NotFoundException('User not found');
      }

      if (user.role === 'rider') {
        if (user.rider_profile) {
          throw new BadRequestException('Rider profile already exists');
        }

        const riderDto = profileDto as RiderProfileDto;
        
        await this.prisma.userProfile.create({
          data: {
            user_id: userId,
            first_name: riderDto.first_name,
            last_name: riderDto.last_name,
            profile_picture: riderDto.profile_picture,
          },
        });

        const riderProfile = await this.prisma.riderProfile.create({
          data: {
            rider_id: userId,
            vehicle_type: riderDto.vehicle_type,
            license_number: riderDto.license_number,
          },
        });
        return riderProfile;
      } else {
        if (user.profile) {
          throw new BadRequestException('User profile already exists');
        }

        const userProfile = await this.prisma.userProfile.create({
          data: {
            user_id: userId,
            first_name: profileDto.first_name,
            last_name: profileDto.last_name,
            profile_picture: profileDto.profile_picture,
          },
        });
        return userProfile;
      }
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
        include: {
          profile: true,
          rider_profile: true,
        }
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

      const hasProfile =
        user.role === 'rider' ? !!user.rider_profile : !!user.profile;

      return {
        user: userWithoutPassword,
        tokens,
        require_profile_completion: !hasProfile,
      };
    } catch (error) {
      throw ApiError.fromError(error);
    }
  }
}
