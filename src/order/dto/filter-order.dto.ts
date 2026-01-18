import { OrderStatus } from "@prisma/client";
import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsEnum, IsNumber } from "class-validator";

export class FilterOrderDto {
   @ApiPropertyOptional({ description: 'The status of the order', example: OrderStatus.created })
   @IsEnum(OrderStatus)
   status?: OrderStatus;

   @ApiPropertyOptional({ description: 'The page number', example: 1 })
   @IsNumber()
   page?: number;

   @ApiPropertyOptional({ description: 'The page size', example: 10 })
   @IsNumber()
   limit?: number;
}