import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class UserLoginDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  identifier: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  password: string;
}
