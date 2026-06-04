import jwt from 'jsonwebtoken';
import type { Middleware } from 'koa';

const JWT_SECRET = process.env.JWT_SECRET || 'typing-admin-secret-key-2024';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';

export function validateAdminPassword(password: string): boolean {
  return password === ADMIN_PASSWORD;
}

export function signToken(): string {
  return jwt.sign({ role: 'admin' }, JWT_SECRET, { expiresIn: '24h' });
}

export function verifyToken(token: string): boolean {
  try {
    jwt.verify(token, JWT_SECRET);
    return true;
  } catch {
    return false;
  }
}

export const authMiddleware: Middleware = async (ctx, next) => {
  const authHeader = ctx.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    ctx.status = 401;
    ctx.body = { message: '未授权，请先登录' };
    return;
  }
  const token = authHeader.slice(7);
  if (!verifyToken(token)) {
    ctx.status = 401;
    ctx.body = { message: '登录已过期，请重新登录' };
    return;
  }
  await next();
};
