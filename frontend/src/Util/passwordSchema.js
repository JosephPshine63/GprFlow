import { z } from "zod";

// Messages are i18n keys, resolved by i18nResolver.
// OTP + new password, shared by the reset page and the profile dialog.
export const resetPasswordSchema = z
  .object({
    password: z.string().min(8, "validation.passwordMin"),
    confirmPassword: z.string().min(1, "validation.passwordConfirm"),
    otp: z.string().length(6, "validation.otpLength"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "validation.passwordMismatch",
  });
