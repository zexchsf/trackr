import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { ApiError } from '../common/errors/api.error';
import { OrderStatus, Prisma, Role } from '@prisma/client';
import { FilterOrderDto } from './dto/filter-order.dto';

@Injectable()
export class OrderService {
   constructor(private readonly prisma: PrismaService) { }

   async createOrder(userId: string, role: Role, orderDto: CreateOrderDto) {
      try {
         const orderData: Prisma.OrderCreateInput = {
            pickup_address: {
               create: {
                  label: orderDto.pickup_address.label,
                  latitude: orderDto.pickup_address.latitude,
                  longitude: orderDto.pickup_address.longitude,
                  full_address: orderDto.pickup_address.full_address,
               },
            },
            dropoff_address: {
               create: {
                  label: orderDto.dropoff_address.label,
                  latitude: orderDto.dropoff_address.latitude,
                  longitude: orderDto.dropoff_address.longitude,
                  full_address: orderDto.dropoff_address.full_address,
               },
            },
            distance_km: 0, // TODO: Calculate distance
            delivery_fee: orderDto.delivery_fee, // this is estimated delivery fee provided by the user creating the order,
            platform_fee: 0, // TODO: Calculate platform fee
         };

         switch (role) {
            case Role.buyer:
               orderData.buyer = {
                  connect: {
                     id: userId,
                  },
               };
               break;
            case Role.seller:
               orderData.seller = {
                  connect: {
                     id: userId,
                  },
               };
               break;
            case Role.rider:
               orderData.rider = {
                  connect: {
                     id: userId,
                  },
               };
               break;
            default:
               throw new ApiError('Invalid role');
         }

         return this.prisma.order.create({
            data: orderData,
         });
      } catch (error) {
         throw ApiError.fromError(error);
      }
   }

   async getOrders(userId: string, role: Role, filterOrderDto: FilterOrderDto) {
      try {
         const { status, page, limit } = filterOrderDto;
         const pageNumber = page || 1;
         const limitNumber = limit || 10;
         const skip = (pageNumber - 1) * limitNumber;

         const orders = await this.prisma.order.findMany({
            where: {
               ...(status && { status: status }),
               ...(role === Role.buyer && { buyer_id: userId }),
               ...(role === Role.seller && { seller_id: userId }),
               ...(role === Role.rider && { rider_id: userId }),
            },
            skip: skip,
            take: limitNumber,
            include: {
               pickup_address: true,
               dropoff_address: true,
               buyer: {
                  select: {
                     id: true,
                     email: true,
                     phone_number: true,
                     profile: {
                        select: {
                           first_name: true,
                           last_name: true,
                           profile_picture: true,
                        }
                     }
                  }
               },
               seller: {
                  select: {
                     id: true,
                     email: true,
                     phone_number: true,
                     profile: {
                        select: {
                           first_name: true,
                           last_name: true,
                           profile_picture: true,
                        }
                     }
                  }
               },
               rider: {
                  select: {
                     id: true,
                     email: true,
                     phone_number: true,
                     profile: {
                        select: {
                           first_name: true,
                           last_name: true,
                           profile_picture: true,
                        }
                     },
                     rider_profile: {
                        select: {
                           vehicle_type: true,
                           license_number: true,
                           is_verified: true,
                           is_available: true,
                           rating: true,
                        }
                     }
                  }
               }
            },
         });


         return {
            data: orders,
            total: orders.length,
            page: pageNumber,
            limit: limitNumber,
            total_pages: Math.ceil(orders.length / limitNumber),
         }
      } catch (error) {
         throw ApiError.fromError(error);
      }
   }

   async cancelOrder(userId: string, role: Role, id: string) {
      try {
         const order = await this.prisma.order.findUnique({
            where: { id: id, ...(role === Role.buyer && { buyer_id: userId }), ...(role === Role.seller && { seller_id: userId }) },
         });

         if (!order) {
            throw new NotFoundException('Order not found');
         }

         if (order.status === OrderStatus.created) {
            await this.prisma.order.update({
               where: { id: id },
               data: { status: OrderStatus.cancelled },
            });
            return { message: 'Order cancelled successfully' };
         }

         // TODO: Handle other order statuses
         throw new BadRequestException('Order is not cancellable');
      } catch (error) {
         throw ApiError.fromError(error);
      }
   }
}
