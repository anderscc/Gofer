import { z } from 'zod';
import { User as GoogleUser } from '@react-native-google-signin/google-signin';

export const SignUpSchema = z.object({
  email: z.string().email(),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),
  firstName: z.string().min(2),
  lastName: z.string().min(2),
  phoneNumber: z.string().regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number'),
});

export const SignInSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

export const ResetPasswordSchema = z.object({
  email: z.string().email(),
});

export const ConfirmResetPasswordSchema = z.object({
  email: z.string().email(),
  code: z.string().length(6),
  newPassword: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),
});

export type SignUpInput = z.infer<typeof SignUpSchema>;
export type SignInInput = z.infer<typeof SignInSchema>;
export type ResetPasswordInput = z.infer<typeof ResetPasswordSchema>;
export type ConfirmResetPasswordInput = z.infer<typeof ConfirmResetPasswordSchema>;

interface GoogleSignInUser {
  id: string;
  email: string;
  name: string | null;
  givenName: string | null;
  familyName: string | null;
  photo: string | null;
}

export interface AuthUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  emailVerified: boolean;
  phoneVerified: boolean;
}

export interface SocialAuthUser {
  id: string;
  email: string;
  name: string | null;
  givenName: string | null;
  familyName: string | null;
  photo: string | null;
}

export interface SocialAuthCredentials {
  accessToken: string;
  idToken?: string;
  user: SocialAuthUser;
}
