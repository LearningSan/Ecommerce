import { Type } from 'class-transformer';
import { IsInt, IsPositive, IsString, Matches, Max } from 'class-validator';

export class AddCartItemDto {
  @IsString()
  @Matches(/^[1-9]\d*$/, {
    message: 'variantId phải là ID số nguyên dương hợp lệ.',
  })
  variantId: string;

  @Type(() => Number)
  @IsInt()
  @IsPositive()
  @Max(5)
  quantity: number = 1;
}
