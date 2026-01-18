import { Body, Controller, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import * as client from '@prisma/client';
import { Role } from '@prisma/client';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';
import { CurrentUser } from '../common/decorators/current-user';
import { CreateOrderDto } from './dto/create-order.dto';
import { FilterOrderDto } from './dto/filter-order.dto';
import { OrderService } from './order.service';
import { RolesGuard } from '../auth/guards/role.guard';

@Controller('order')
@ApiTags('Orders')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
export class OrderController {
  constructor(private readonly orderService: OrderService) { }

  @Post('create')
  @Roles(Role.buyer, Role.seller)
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'Create a new order' })
  @ApiResponse({ status: 201, description: 'Order successfully created' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiBody({ type: CreateOrderDto })
  async createOrder(@CurrentUser() user: client.User, @Body() orderDto: CreateOrderDto) {
    return this.orderService.createOrder(user.id, user.role, orderDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all orders' })
  @ApiResponse({ status: 200, description: 'Orders successfully fetched' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  async getOrders(@CurrentUser() user: client.User, @Query() filterOrderDto: FilterOrderDto) {
    return this.orderService.getOrders(user.id, user.role, filterOrderDto);
  }

  @Post('cancel/:id')
  @Roles(Role.buyer, Role.seller)
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'Cancel an order' })
  @ApiResponse({ status: 200, description: 'Order successfully cancelled' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  cancelOrder(@CurrentUser() user: client.User, @Param('id') id: string) {
    return this.orderService.cancelOrder(user.id, user.role, id);
  }
}
