import { ApiProperty } from "@nestjs/swagger";

export class AddressDto {
   @ApiProperty({ description: 'The label of the address', example: 'Home' })
   label: string;
   @ApiProperty({ description: 'The latitude of the address', example: 40.7128 })
   latitude: number;
   @ApiProperty({ description: 'The longitude of the address', example: -74.0060 })
   longitude: number;
   @ApiProperty({ description: 'The full address of the address', example: '123 Main St, Anytown, USA' })
   full_address: string;
}

export class CreateOrderDto {
   @ApiProperty({ description: 'The start location of the order', example: AddressDto })
   pickup_address: AddressDto;
   @ApiProperty({ description: 'The end location of the order', example: AddressDto })
   dropoff_address: AddressDto;
   @ApiProperty({ description: 'The delivery fee of the order', example: 10.5 })
   delivery_fee: number;
}