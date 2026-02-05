import { z } from 'zod';
import { 
  insertUserSchema, 
  loginSchema, 
  insertScrimSchema, 
  insertWithdrawalSchema,
  UserSchema,
  ScrimSchema,
  TransactionSchema,
  WithdrawalSchema
} from './schema';

export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
  }),
  notFound: z.object({
    message: z.string(),
  }),
  internal: z.object({
    message: z.string(),
  }),
  unauthorized: z.object({
    message: z.string(),
  }),
};

export const api = {
  auth: {
    register: {
      method: 'POST' as const,
      path: '/api/auth/register',
      input: insertUserSchema,
      responses: {
        201: z.object({ token: z.string(), user: UserSchema }),
        400: errorSchemas.validation,
      },
    },
    login: {
      method: 'POST' as const,
      path: '/api/auth/login',
      input: loginSchema,
      responses: {
        200: z.object({ token: z.string(), user: UserSchema }),
        401: errorSchemas.unauthorized,
      },
    },
    me: {
      method: 'GET' as const,
      path: '/api/auth/me',
      responses: {
        200: UserSchema,
        401: errorSchemas.unauthorized,
      },
    },
  },
  scrims: {
    list: {
      method: 'GET' as const,
      path: '/api/scrims',
      responses: {
        200: z.array(ScrimSchema),
      },
    },
    get: {
      method: 'GET' as const,
      path: '/api/scrims/:id',
      responses: {
        200: ScrimSchema,
        404: errorSchemas.notFound,
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/scrims',
      input: insertScrimSchema,
      responses: {
        201: ScrimSchema,
        400: errorSchemas.validation,
        401: errorSchemas.unauthorized,
      },
    },
    join: {
      method: 'POST' as const,
      path: '/api/scrims/:id/join',
      responses: {
        200: z.object({ message: z.string(), scrim: ScrimSchema }),
        400: z.object({ message: z.string() }), // e.g., Not enough coins
        404: errorSchemas.notFound,
      },
    },
    update: {
      method: 'PUT' as const,
      path: '/api/scrims/:id',
      input: insertScrimSchema.partial().extend({ 
        roomId: z.string().optional(), 
        roomPassword: z.string().optional(),
        status: z.enum(["OPEN", "FULL", "COMPLETED", "CANCELLED"]).optional()
      }),
      responses: {
        200: ScrimSchema,
        404: errorSchemas.notFound,
      },
    }
  },
  wallet: {
    balance: {
      method: 'GET' as const,
      path: '/api/wallet',
      responses: {
        200: z.object({ coins: z.number() }),
      },
    },
    transactions: {
      method: 'GET' as const,
      path: '/api/wallet/transactions',
      responses: {
        200: z.array(TransactionSchema),
      },
    },
    deposit: {
      method: 'POST' as const,
      path: '/api/wallet/deposit',
      input: z.object({ amount: z.number().min(1), paymentId: z.string() }),
      responses: {
        200: z.object({ success: z.boolean(), newBalance: z.number() }),
      },
    },
    withdraw: {
      method: 'POST' as const,
      path: '/api/wallet/withdraw',
      input: insertWithdrawalSchema,
      responses: {
        201: WithdrawalSchema,
        400: errorSchemas.validation,
      },
    },
  },
  admin: {
    withdrawals: {
      method: 'GET' as const,
      path: '/api/admin/withdrawals',
      responses: {
        200: z.array(WithdrawalSchema.extend({ user: UserSchema.pick({ username: true, email: true }) })),
      },
    },
    processWithdrawal: {
      method: 'POST' as const,
      path: '/api/admin/withdrawals/:id',
      input: z.object({ status: z.enum(["APPROVED", "REJECTED"]) }),
      responses: {
        200: WithdrawalSchema,
      },
    }
  }
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}
