export default [
  { path: '/', name: 'TimeLimit', component: () => import('@/view/TimeLimit.vue') },
  { path: '/words', name: 'WordsLimit', component: () => import('@/view/WordsLimit.vue') },
  { path: '/quote', name: 'QuoteLimit', component: () => import('@/view/QuoteLimit.vue') },
  { path: '/keyboard', name: 'TypingKeyboard', component: () => import('@/view/TypingKeyboard.vue') },
  { path: '/custom', name: 'Custom', component: () => import('@/view/CustomPage.vue') },
  { path: '/user/:id', name: 'User', component: () => import('@/view/User.vue') },
  { path: '/log', name: 'Log', component: () => import('@/view/Log.vue') },
  { path: '/statement', name: 'statement', component: () => import('@/view/StatementLog.vue') },
  { path: '/leaderboard', name: 'LeaderBoard', component: () => import('@/view/LeaderBoard.vue') },
  { path: '/game', name: 'Game', component: () => import('@/view/Game.vue') },
  { path: '/game/:id', name: 'GameRoom', component: () => import('@/view/GameRoom.vue') },
  {
    path: '/:catchAll(.*)',
    redirect: '/'
  }
];
