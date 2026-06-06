import { createRouter, createWebHistory } from 'vue-router';
import routes from '@/router/routes';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: routes
});

const DEFAULT_TITLE =
  '在线打字练习与打字速度测试（WPM）| 键盘测试 - Typing';
const DEFAULT_DESCRIPTION =
  '免费的在线中英文打字练习与打字速度测试（WPM）网站。提供限时、计时、自定义文本、键盘测试四种模式，实时统计准确率与速度，支持回放、自定义主题与字体。';

function setMetaDescription(content: string) {
  let el = document.querySelector('meta[name="description"]');
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute('name', 'description');
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

function setMetaRobots(noindex: boolean) {
  let el = document.querySelector('meta[name="robots"]');
  if (noindex) {
    if (!el) {
      el = document.createElement('meta');
      el.setAttribute('name', 'robots');
      document.head.appendChild(el);
    }
    el.setAttribute('content', 'noindex, nofollow');
  } else if (el) {
    el.parentNode?.removeChild(el);
  }
}

router.afterEach((to) => {
  document.title = (to.meta?.title as string | undefined) || DEFAULT_TITLE;
  setMetaDescription((to.meta?.description as string | undefined) || DEFAULT_DESCRIPTION);
  setMetaRobots(Boolean(to.meta?.noindex));
});

export default router;
