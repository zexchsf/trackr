import { ApiProperty } from '@nestjs/swagger';
import { VehicleType } from '@prisma/client';
import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class UserProfileDto {
  @ApiProperty({ description: 'User first name', example: 'John' })
  @IsString()
  @IsNotEmpty()
  first_name: string;

  @ApiProperty({ description: 'User last name', example: 'Doe' })
  @IsString()
  @IsNotEmpty()
  last_name: string;

  @ApiProperty({
    description: 'Profile picture URL',
    example: 'https://example.com/profile.jpg',
    required: false,
  })
  @IsString()
  @IsOptional()
  profile_picture?: string;
}

export class RiderProfileDto extends UserProfileDto {
  @ApiProperty({
    description: 'Vehicle type',
    example: 'bike',
    enum: VehicleType,
    default: 'bike',
  })
  @IsEnum(VehicleType)
  @IsNotEmpty()
  vehicle_type: VehicleType;

  @ApiProperty({ description: 'License number', example: 'LIC123456' })
  @IsString()
  @IsNotEmpty()
  license_number: string;
}
