import { z } from "zod";

// OTP + new password, shared by the reset page and the profile dialog.
export const resetPasswordSchema = z
  .object({
    password: z.string().min(8, "La password deve avere almeno 8 caratteri"),
    confirmPassword: z.string().min(1, "Conferma la password"),
    otp: z.string().length(6, "Il codice deve avere 6 cifre"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "Le password non coincidono",
  });
