import Router from 'koa-router';
import db from '../db';
import { authMiddleware } from '../auth';

const router = new Router({ prefix: '/api/records' });

router.post('/', async (ctx) => {
  try {
    const { employee_name, employee_group, article_id, article_title, wpm, accuracy, duration, total_keystrokes, wrong_keystrokes, strict_wrong_count } = ctx.request.body as any;

    if (!employee_name || !employee_group || !article_id) {
      ctx.status = 400;
      ctx.body = { message: '姓名、班组和文章不能为空' };
      return;
    }

    db.prepare(`
      INSERT INTO records (employee_name, employee_group, article_id, article_title, wpm, accuracy, duration, total_keystrokes, wrong_keystrokes, strict_wrong_count)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      employee_name, employee_group, article_id, article_title || '',
      Number(wpm) || 0, String(accuracy) || '0%', Number(duration) || 0,
      Number(total_keystrokes) || 0, Number(wrong_keystrokes) || 0,
      Number(strict_wrong_count) || 0
    );

    ctx.status = 201;
    ctx.body = { message: '成绩保存成功' };
  } catch (e: any) {
    ctx.status = 500;
    ctx.body = { message: e.message };
  }
});

router.get('/', async (ctx) => {
  try {
    const { name, group, start_date, end_date, page, page_size } = ctx.query as any;

    let sql = 'SELECT * FROM records WHERE 1=1';
    const params: any[] = [];

    if (name) {
      sql += ' AND employee_name LIKE ?';
      params.push(`%${name}%`);
    }
    if (group) {
      sql += ' AND employee_group LIKE ?';
      params.push(`%${group}%`);
    }
    if (start_date) {
      sql += ' AND created_at >= ?';
      params.push(start_date);
    }
    if (end_date) {
      sql += ' AND created_at <= ?';
      params.push(end_date + ' 23:59:59');
    }

    const countRow = db.prepare(`SELECT COUNT(*) as total FROM (${sql})`).get(...params) as any;

    sql += ' ORDER BY id DESC';

    const p = Number(page) || 1;
    const ps = Number(page_size) || 50;
    const offset = (p - 1) * ps;
    sql += ' LIMIT ? OFFSET ?';
    params.push(ps, offset);

    const rows = db.prepare(sql).all(...params);

    ctx.body = {
      result: {
        records: rows,
        total: countRow.total,
        page: p,
        page_size: ps
      }
    };
  } catch (e: any) {
    ctx.status = 500;
    ctx.body = { message: e.message };
  }
});

router.get('/export', authMiddleware, async (ctx) => {
  try {
    const { name, group, start_date, end_date } = ctx.query as any;

    let sql = 'SELECT * FROM records WHERE 1=1';
    const params: any[] = [];

    if (name) {
      sql += ' AND employee_name LIKE ?';
      params.push(`%${name}%`);
    }
    if (group) {
      sql += ' AND employee_group LIKE ?';
      params.push(`%${group}%`);
    }
    if (start_date) {
      sql += ' AND created_at >= ?';
      params.push(start_date);
    }
    if (end_date) {
      sql += ' AND created_at <= ?';
      params.push(end_date + ' 23:59:59');
    }

    sql += ' ORDER BY id DESC';

    const rows = db.prepare(sql).all(...params) as any[];

    const header = '姓名,班组,文章,WPM,正确率,用时(秒),总按键,错误按键,严格错误,完成时间';
    const csv = rows.map(r =>
      `"${r.employee_name}","${r.employee_group}","${r.article_title}",${r.wpm},"${r.accuracy}",${r.duration},${r.total_keystrokes},${r.wrong_keystrokes},${r.strict_wrong_count},"${r.created_at}"`
    );

    ctx.set('Content-Type', 'text/csv; charset=utf-8');
    ctx.set('Content-Disposition', 'attachment; filename=typing-scores.csv');
    ctx.body = '\uFEFF' + header + '\n' + csv.join('\n');
  } catch (e: any) {
    ctx.status = 500;
    ctx.body = { message: e.message };
  }
});

router.get('/stats', authMiddleware, async (ctx) => {
  try {
    const totalRecords = (db.prepare('SELECT COUNT(*) as c FROM records').get() as any).c;
    const totalPeople = (db.prepare('SELECT COUNT(DISTINCT employee_name) as c FROM records').get() as any).c;
    const avgWpm = (db.prepare('SELECT ROUND(AVG(wpm), 1) as a FROM records').get() as any).a || 0;
    const avgAccuracy = (db.prepare('SELECT ROUND(AVG(CAST(REPLACE(accuracy,\'%\',\'\') AS REAL)), 1) as a FROM records').get() as any).a || 0;

    ctx.body = {
      result: {
        total_records: totalRecords,
        total_people: totalPeople,
        avg_wpm: avgWpm,
        avg_accuracy: avgAccuracy
      }
    };
  } catch (e: any) {
    ctx.status = 500;
    ctx.body = { message: e.message };
  }
});

export default router;
