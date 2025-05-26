\
import { z } from 'zod';

export const phoneSchema = z.object({
  phone: z.string().min(10, "Phone number must be at least 10 digits").regex(/^\+[1-9]\d{1,14}$/, "Invalid phone number format (e.g., +11234567890)"),
});

export const otpSchema = z.object({
  otp: z.string().length(6, "OTP must be 6 digits"),
});
