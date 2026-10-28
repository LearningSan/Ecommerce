import {
  IsNotEmpty,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';
export class ResetPasswordConfirmDto {
  @IsString()
  @IsNotEmpty({ message: 'Token không được để trống' })
  token: string;
  @IsString()
  @IsNotEmpty({ message: 'Vui lòng nhập mật khẩu mới' })
  @MinLength(6, { message: 'Mật khẩu phải có ít nhất 6 ký tự' })
  @MaxLength(100, { message: 'Mật khẩu không được vượt quá 100 ký tự' })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).+$/, {
    message: 'Mật khẩu phải có chữ thường, chữ hoa, số và ký tự đặc biệt',
  })
  newPassword: string;
  @IsString()
  @IsNotEmpty({ message: 'Vui lòng xác nhận mật khẩu' })
  confirmPassword: string;
}
