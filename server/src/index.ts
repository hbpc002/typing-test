import './env';
import Koa from 'koa';
import cors from '@koa/cors';
import { koaBody } from 'koa-body';
import Router from 'koa-router';
import articlesRouter from './routes/articles';
import recordsRouter from './routes/records';
import settingsRouter from './routes/settings';
import { validateAdminPassword, signToken } from './auth';

const app = new Koa();
const router = new Router();

const PORT = Number(process.env.PORT) || 8000;

app.use(cors({ origin: '*' }));
app.use(koaBody());

router.post('/api/admin/login', async (ctx) => {
  const { password } = ctx.request.body as any;
  if (!password) {
    ctx.status = 400;
    ctx.body = { message: '请输入密码' };
    return;
  }
  if (validateAdminPassword(password)) {
    const token = signToken();
    ctx.body = { result: { token }, message: '登录成功' };
  } else {
    ctx.status = 401;
    ctx.body = { message: '密码错误' };
  }
});

router.get('/api/health', async (ctx) => {
  ctx.body = { status: 'ok' };
});

app.use(router.routes());
app.use(router.allowedMethods());
app.use(articlesRouter.routes());
app.use(articlesRouter.allowedMethods());
app.use(recordsRouter.routes());
app.use(recordsRouter.allowedMethods());
app.use(settingsRouter.routes());
app.use(settingsRouter.allowedMethods());

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
