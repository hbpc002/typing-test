import Router from 'koa-router';
import db from '../db';
import { authMiddleware } from '../auth';

const router = new Router({ prefix: '/api/articles' });

const articleCache = new Map<number, any>();
let cacheAll: any[] | null = null;

function invalidateCache() {
  cacheAll = null;
  articleCache.clear();
}

router.get('/', async (ctx) => {
  try {
    if (cacheAll) {
      ctx.body = { result: { articles: cacheAll } };
      return;
    }
    const rows = db.prepare('SELECT id, title, author, content, type, created_at FROM articles ORDER BY id DESC').all();
    cacheAll = rows;
    ctx.body = { result: { articles: rows } };
  } catch (e: any) {
    ctx.status = 500;
    ctx.body = { message: e.message };
  }
});

router.get('/:id', async (ctx) => {
  try {
    const id = Number(ctx.params.id);
    if (articleCache.has(id)) {
      ctx.body = { result: { article: articleCache.get(id) } };
      return;
    }
    const row = db.prepare('SELECT * FROM articles WHERE id = ?').get(id) as any;
    if (!row) {
      ctx.status = 404;
      ctx.body = { message: '文章不存在' };
      return;
    }
    articleCache.set(id, row);
    ctx.body = { result: { article: row } };
  } catch (e: any) {
    ctx.status = 500;
    ctx.body = { message: e.message };
  }
});

router.post('/', authMiddleware, async (ctx) => {
  try {
    const { title, author, content, type } = ctx.request.body as any;
    if (!title || !content) {
      ctx.status = 400;
      ctx.body = { message: '标题和内容不能为空' };
      return;
    }
    const info = db.prepare(
      'INSERT INTO articles (title, author, content, type) VALUES (?, ?, ?, ?)'
    ).run(title, author || '', content, type || '文章');
    invalidateCache();
    ctx.status = 201;
    ctx.body = { result: { id: info.lastInsertRowid }, message: '创建成功' };
  } catch (e: any) {
    ctx.status = 500;
    ctx.body = { message: e.message };
  }
});

router.put('/:id', authMiddleware, async (ctx) => {
  try {
    const id = Number(ctx.params.id);
    const { title, author, content, type } = ctx.request.body as any;
    const existing = db.prepare('SELECT id FROM articles WHERE id = ?').get(id);
    if (!existing) {
      ctx.status = 404;
      ctx.body = { message: '文章不存在' };
      return;
    }
    db.prepare(
      `UPDATE articles SET title = ?, author = ?, content = ?, type = ?, updated_at = datetime('now', 'localtime') WHERE id = ?`
    ).run(title, author || '', content, type || '文章', id);
    invalidateCache();
    ctx.body = { message: '更新成功' };
  } catch (e: any) {
    ctx.status = 500;
    ctx.body = { message: e.message };
  }
});

router.delete('/:id', authMiddleware, async (ctx) => {
  try {
    const id = Number(ctx.params.id);
    const existing = db.prepare('SELECT id FROM articles WHERE id = ?').get(id);
    if (!existing) {
      ctx.status = 404;
      ctx.body = { message: '文章不存在' };
      return;
    }
    db.prepare('DELETE FROM articles WHERE id = ?').run(id);
    invalidateCache();
    ctx.body = { message: '删除成功' };
  } catch (e: any) {
    ctx.status = 500;
    ctx.body = { message: e.message };
  }
});

export default router;
