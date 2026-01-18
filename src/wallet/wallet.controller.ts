import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import * as client from '@prisma/client';
import { JwtAuthGuard } from 'src/auth/guards/jwt.guard';
import { CurrentUser } from 'src/common/decorators/current-user';
import { WalletService } from './wallet.service';

@Controller('wallet')
@ApiTags("Wallet")
@UseGuards(JwtAuthGuard)
export class WalletController {
  constructor(private readonly walletService: WalletService) { }

  @Get()
  @ApiOperation({ summary: 'Get wallet' })
  @ApiResponse({ status: 200, description: 'Wallet retrieved successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Wallet not found' })
  @ApiBearerAuth()
  getWallet(@CurrentUser() user: client.User) {
    return this.walletService.getWallet(user.id);
  }
}
