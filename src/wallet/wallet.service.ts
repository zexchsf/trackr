import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ApiError } from '../common/errors/api.error';

@Injectable()
export class WalletService {
   constructor(private readonly prismaService: PrismaService) { }


   async getWallet(user_id: string) {
      try {
         let wallet = await this.prismaService.wallet.findUnique({
            where: { user_id },
         });

         if (!wallet) {
            wallet = await this.prismaService.wallet.create({
               data: {
                  user_id,
                  balance: 0,
               },
            });
         }

         return wallet;
      } catch (error) {
         throw ApiError.fromError(error);
      }
   }
}

