import Router from 'koa-router';
import db from '../db';
import { authMiddleware } from '../auth';

const router = new Router({ prefix: '/api/settings' });

router.get('/', authMiddleware, async (ctx) => {
  try {
    const rows = db.prepare('SELECT key, value FROM settings').all() as any[];
    const result: Record<string, string> = {};
    for (const r of rows) {
      result[r.key] = r.value;
    }
    ctx.body = { result };
  } catch (e: any) {
    ctx.status = 500;
    ctx.body = { message: e.message };
  }
});

router.get('/:key', authMiddleware, async (ctx) => {
  try {
    const row = db.prepare('SELECT value FROM settings WHERE key = ?').get(ctx.params.key) as any;
    if (!row) {
      ctx.status = 404;
      ctx.body = { message: '设置项不存在' };
      return;
    }
    ctx.body = { result: { key: ctx.params.key, value: row.value } };
  } catch (e: any) {
    ctx.status = 500;
    ctx.body = { message: e.message };
  }
});

router.put('/:key', authMiddleware, async (ctx) => {
  try {
    const { value } = ctx.request.body as any;
    if (value === undefined || value === null) {
      ctx.status = 400;
      ctx.body = { message: 'value 不能为空' };
      return;
    }
    const stringValue = String(value);
    const existing = db.prepare('SELECT key FROM settings WHERE key = ?').get(ctx.params.key);
    if (existing) {
      db.prepare(`UPDATE settings SET value = ?, updated_at = datetime('now', 'localtime') WHERE key = ?`).run(
        stringValue,
        ctx.params.key
      );
    } else {
      db.prepare('INSERT INTO settings (key, value) VALUES (?, ?)').run(ctx.params.key, stringValue);
    }
    ctx.body = { message: '更新成功', result: { key: ctx.params.key, value: stringValue } };
  } catch (e: any) {
    ctx.status = 500;
    ctx.body = { message: e.message };
  }
});

export default router;
