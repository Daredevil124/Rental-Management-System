import dotenv from 'dotenv';

dotenv.config();

const toNumber = (value: string | undefined, fallback: number): number => {
  if (!value) {
    return fallback;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

export const env = {
  nodeEnv: process.env.NODE_ENV ?? 'development',
  port: toNumber(process.env.PORT, 4000),
  apiVersion: process.env.API_VERSION ?? 'v1',
  corsOrigin: process.env.CORS_ORIGIN ?? 'http://localhost:3000',
  databaseUrl:
    process.env.DATABASE_URL ??
    'postgresql://rental_user:rental_password@localhost:5432/rental_management?schema=public',
  jwtSecret: process.env.JWT_SECRET ?? 'supersecretjwtkey',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN ?? '1d',
  
  // SMTP Settings
  smtpHost: process.env.SMTP_HOST,
  smtpPort: toNumber(process.env.SMTP_PORT, 587),
  smtpSecure: process.env.SMTP_SECURE === 'true',
  smtpUser: process.env.SMTP_USER,
  smtpPass: process.env.SMTP_PASS,
  smtpFrom: process.env.SMTP_FROM ?? '"RentOps Support" <support@rentops.com>'
};
