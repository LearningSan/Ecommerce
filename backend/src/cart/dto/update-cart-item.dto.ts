  import { Type } from 'class-transformer';
  import { IsInt, IsPositive, Max } from 'class-validator';

  export class UpdateCartItemDto {
    @Type(() => Number)
    @IsInt()
    @IsPositive()
    @Max(5)
    quantity: number;
  }
