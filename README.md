# Typing
> [https://typing.yasinchan.com](https://typing.yasinchan.com)

> 技术分享 [https://yasinchan.com/tags/typing/](https://yasinchan.com/tags/typing/)

> 这是一个简约风格的可自定义主题的打字记录和键盘测试网站，可以用来测试打字速度，统计打字错误率，支持回放打字过程，同时也支持自定义主题，切换字体，登录记录数据等等功能。网站也包含一套用户反馈系统记录反馈信息，后续也将以此持续迭代优化，继续开发更多有趣的功能，欢迎体验，也欢迎贡献你的想法或者代码~

整个项目包含前端和后端，前端 Vue3 + Vite，后端使用 Koa2 + [Leancloud](https://leancloud.cn)。该项目是前端部分，后端也将在未来开源。

### 2026.06.05
- 管理员后台：新增顶部 Tab（`AdminTabs`）组件，统一 `文章管理` / `成绩查询` 入口，避免 `/admin/scores` 不可达。
- 安全加固：移除管理员密码 `ADMIN_PASSWORD` 与 JWT 签名密钥 `JWT_SECRET` 的默认值。服务启动时强制读取环境变量，缺失或 `JWT_SECRET` 长度不足 32 字符会直接退出。`server/.env.example` 提供配置模板，`docker-compose.yml` 通过 `env_file` 注入。

### 2026.04.21
- 工程优化：路由懒加载、构建分包（vue / echarts / utils）、生产环境自动 drop console。
- 移除未使用依赖（lodash、@vitejs/plugin-legacy）与重复字体大文件，构建体积与时间均显著减小。
- 抽离 `useTypingChartSampler` composable，简化 `WordInput.vue`；修复 `App.vue` 全局事件监听未解绑问题。
- 合并 `ThemeModal` 9 个冗余 watch；`chart.ts` 合并 `localStorage` 读写。
### 2025.03.11
- 提供传统浏览器兼容性支持
### 2024.12.25
- 增加多语言
### 2024.5.14
- 个人中心增加反馈记录和定制主题
### 2024.5.12
- 个人中心增加打字记录
### 2024.4.7
- 增加结算页面的图表，用于统计打字准确率和速度。
- 实现图表历史数据，每次结算都可以与上次的打字记录进行对比。
### 2024.2.19
- 优化结算页面展示样式。
- 增加媒体查询，实现响应式页面。
### 2024.2.18
- 增加标点符号转空格模式，适合更多中国宝宝的打字习惯。
- 自定义模式中自定义文案从之前「空格会被转为逗号，换行会被转为句号」的逻辑调整为「支持空格，换行会被转成空格」。
### 2024.2.8
- 字体选择新增 `得意黑`、`阿里巴巴普惠体` 两种字体
### 2024.2.2
- 调整界面底部布局，将主题、字体、建议与反馈也在底部增加入口，同时将设置中的声明与设置挪动到底部；
- 建议与反馈中增加“主题”筛选项，目前已支持“最新”、“最热”、“主题”三种筛选项；
- 优化自定义主题生成至建议与反馈中的路径提示，支持了「主题」弹框与『建议与反馈』弹框双向进入的路径提示；
- 根据用户建议，结算页面保存记录后不再直接跳转到到打字页面，从而避免跳出结算页面后无法查看上次的记录。
- 优化键盘测试页面界面展示
### 2024.1.22
- 实现自定义主题生成至建议与反馈中
### 2024.1.21
- 重构主题系统，增加自定义主题色功能
### 2024.1.14
- 新增自定义模式
### 2024.1.13
- 新增计时模式
- 增加大写键开启提示
### 2024.1.2
- 新增右下角建议反馈功能
### 2023.12.27 更新
- 实现输入回放功能
### 2023.12.20 更新
- 新增限时模式
### 2023.12.10 更新
- 键盘测试新增 mac 键位适配
### 2023.7.20 更新
- 实现键盘测试功能
### 2023.7.17 更新
- 实现登录系统

## 素材来源
- icon-font 来源 [iconfont.cn](https://www.iconfont.cn/)
- 字体 来源
  - [free-font](https://wordshub.github.io/free-font/)
  - [Google Fonts](https://fonts.google.com/)
  - [得意黑](https://github.com/atelier-anchor/smiley-sans)
  - [阿里巴巴普惠体](https://fonts.alibabagroup.com/#/home)
- 词句来源互联网

## 参考
- 模式参考
    - https://monkeytype.com
    - https://dazi.kukuw.com
    - https://barneyzhao.gitee.io/typing-cn
    - https://typetest.io/
- 键盘相关知识
    - https://zhuanlan.zhihu.com/p/397003447
    - https://www.zfrontier.com/app/flow/4okzKBndN774

## 反馈
有兴趣可以加入 QQ 群：1028763853 交流反馈。

## 部署

### 后端环境变量（必填）

后端在启动时会强制校验以下环境变量，缺失或不符合要求会直接退出，不会用任何默认值兜底：

| 变量 | 必填 | 校验 | 说明 |
| --- | --- | --- | --- |
| `ADMIN_PASSWORD` | ✅ | 非空 | 管理员登录密码，生产环境必须使用强密码 |
| `JWT_SECRET` | ✅ | 非空且 ≥ 32 字符 | JWT 签名密钥，丢失即所有 token 失效 |
| `PORT` | ❌ | 默认 `8000` | 服务监听端口 |
| `DB_PATH` | ❌ | 默认 `/data/typing.db` | SQLite 数据库文件路径 |

### 本地启动后端

```bash
cd server
cp .env.example .env
# 编辑 .env，至少修改 ADMIN_PASSWORD 与 JWT_SECRET
openssl rand -hex 32          # 生成 JWT_SECRET
pnpm start
```

### Docker Compose 部署

`docker-compose.yml` 已配置 `env_file: ./server/.env`，部署时只需：

```bash
cp server/.env.example server/.env
# 编辑 server/.env，至少修改 ADMIN_PASSWORD 与 JWT_SECRET
docker compose up -d
```

> ⚠️ **生产环境必看**：千万不要使用 `.env.example` 中的占位符；推荐用 `openssl rand -base64 24` 生成 `ADMIN_PASSWORD`、`openssl rand -hex 32` 生成 `JWT_SECRET`。如果服务启动时打印 `[FATAL] Missing required environment variable: ...`，说明变量未注入。
