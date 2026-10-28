import { email, z } from "zod";

export const loginSchema = z.object({
  identifier: z
    .string()
    .trim()
    .min(1, "Vui lòng nhập email hoặc số điện thoại")
    .max(255, "Thông tin đăng nhập quá dài"),

  password: z.string().min(1, "Vui lòng nhập mật khẩu"),
});

export const registerSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, "Vui lòng nhập email.")
    .email("Email không đúng định dạng.")
    .max(255, "Email không được vượt quá 255 ký tự."),
  phone: z
    .string()
    .trim()
    .min(1, "Vui lòng nhập số điện thoại.")
    .regex(/^(0[369]\d{8,9})$/, "Số điện thoại không đúng định dạng."),
  name: z
    .string()
    .trim()
    .min(2, "Họ và tên phải có ít nhất 2 ký tự.")
    .max(255, "Họ và tên không được vượt quá 255 ký tự."),
  password: z
    .string()
    .trim()
    .min(8, "Mật khẩu phải có ít nhất 8 ký tự.")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).+$/,
      "Mật khẩu phải bao gồm chữ hoa, chữ thường, số và ký tự đặc biệt.",
    ),
});
export const forgotPasswordSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, "Vui lòng nhập email")
    .email("Email không hợp lệ"),
});

export const newPasswordSchema = z
  .object({
    newPassword: z
      .string()
      .min(8, "Mật khẩu phải có ít nhất 8 ký tự")
      .regex(/[a-z]/, "Mật khẩu phải có ít nhất 1 chữ thường")
      .regex(/[A-Z]/, "Mật khẩu phải có ít nhất 1 chữ hoa")
      .regex(/\d/, "Mật khẩu phải có ít nhất 1 chữ số")
      .regex(/[^A-Za-z\d]/, "Mật khẩu phải có ít nhất 1 ký tự đặc biệt"),

    confirmPassword: z.string().min(1, "Vui lòng xác nhận mật khẩu"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Mật khẩu xác nhận không khớp",
    path: ["confirmPassword"],
  });
export type LoginFormValues = z.infer<typeof loginSchema>;

export type RegisterFormValues = z.infer<typeof registerSchema>;

export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

export type NewPasswordFormData = z.infer<typeof newPasswordSchema>;
