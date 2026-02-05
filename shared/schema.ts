import { z } from "zod";

// User Roles
export const UserRole = {
  USER: "USER",
  ADMIN: "ADMIN",
} as const;

export const UserSchema = z.object({
  id: z.string(),
  username: z.string().min(3),
  email: z.string().email(),
  phone: z.string().min(10),
  password: z.string().min(6),
  role: z.nativeEnum(UserRole).default(UserRole.USER),
  coins: z.number().default(0),
});

export const insertUserSchema = UserSchema.omit({ id: true, coins: true, role: true });
export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

// Scrims
export const ScrimType = {
  SOLO: "SOLO",
  DUO: "DUO",
  SQUAD: "SQUAD",
} as const;

export const ScrimSchema = z.object({
  id: z.string(),
  title: z.string().min(1),
  type: z.nativeEnum(ScrimType),
  map: z.enum(["Erangel", "Miramar", "Sanhok", "Livik"]),
  entryFee: z.number().min(0),
  prizePool: z.number().min(0),
  matchDate: z.string(), // ISO Date string
  totalSlots: z.number().min(1),
  filledSlots: z.number().default(0),
  roomId: z.string().optional(),
  roomPassword: z.string().optional(),
  status: z.enum(["OPEN", "FULL", "COMPLETED", "CANCELLED"]).default("OPEN"),
});

export const insertScrimSchema = ScrimSchema.omit({ id: true, filledSlots: true, status: true, roomId: true, roomPassword: true });

// Transactions
export const TransactionType = {
  ADD: "ADD",
  DEDUCT: "DEDUCT",
  WIN: "WIN",
  WITHDRAW: "WITHDRAW",
} as const;

export const TransactionSchema = z.object({
  id: z.string(),
  userId: z.string(),
  amount: z.number(),
  type: z.nativeEnum(TransactionType),
  status: z.enum(["PENDING", "SUCCESS", "FAILED"]).default("SUCCESS"),
  date: z.string(),
});

// Withdrawals
export const WithdrawalSchema = z.object({
  id: z.string(),
  userId: z.string(),
  amount: z.number().min(50),
  upiId: z.string().min(3),
  status: z.enum(["PENDING", "APPROVED", "REJECTED"]).default("PENDING"),
  date: z.string(),
});

export const insertWithdrawalSchema = WithdrawalSchema.omit({ id: true, status: true, date: true, userId: true });

// Export types
export type User = z.infer<typeof UserSchema>;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type LoginUser = z.infer<typeof loginSchema>;
export type Scrim = z.infer<typeof ScrimSchema>;
export type InsertScrim = z.infer<typeof insertScrimSchema>;
export type Transaction = z.infer<typeof TransactionSchema>;
export type Withdrawal = z.infer<typeof WithdrawalSchema>;
