// src/config/configuration.ts

export default () => ({
  environment: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '3000', 10),
  database: {
    url: process.env.DATABASE_URL,
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    username: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'postgres',
    poolSize: parseInt(process.env.DB_POOL_SIZE || '10', 10),
    ssl: process.env.DB_SSL === 'true',
    logging: process.env.DB_LOGGING === 'true',
  },
  jwt: {
    accessSecret: process.env.JWT_ACCESS_SECRET || 'default_jwt_access_secret',
    accessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '15m',
    refreshSecret: process.env.JWT_REFRESH_SECRET || 'default_jwt_refresh_secret',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  },
  cookies: {
    domain: process.env.COOKIE_DOMAIN || 'localhost',
    secure: process.env.COOKIE_SECURE === 'true',
    sameSite: (process.env.COOKIE_SAME_SITE || 'lax') as 'lax' | 'strict' | 'none',
  },
  csrf: {
    secret: process.env.CSRF_SECRET || 'default_csrf_secret',
  },
  security: {
    bcryptSaltRounds: parseInt(process.env.BCRYPT_SALT_ROUNDS || '10', 10),
    captchaSecret: process.env.CAPTCHA_SECRET,
  },
  payments: {
    provider: process.env.PAYMENT_PROVIDER || 'mock',
  },
  mail: {
    host: process.env.MAIL_HOST || 'localhost',
    port: parseInt(process.env.MAIL_PORT || '1025', 10),
    user: process.env.MAIL_USER,
    password: process.env.MAIL_PASSWORD,
    from: process.env.MAIL_FROM || 'soporte@riwicine.com',
  },
});
