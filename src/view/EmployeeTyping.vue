<script setup lang="ts">
import { reactive, ref, computed, nextTick, onMounted, watch, inject } from 'vue';
import WordInput from '@/components/WordInput.vue';
import { useExamStore } from '@/store/exam';
import { getArticles, getArticleById, saveRecord } from '@/request';
import type { TypingRecordType, TypingRecordItemType } from '@/types';

const message: any = inject('message');
const examStore = useExamStore();
const wordInputRef = ref<any>(null);

type Step = 'form' | 'select' | 'typing' | 'result';

const state = reactive({
  step: 'form' as Step,
  name: examStore.employeeName,
  group: examStore.employeeGroup,
  articles: [] as any[],
  articlesLoading: false,
  selectedArticle: null as any,
  countDown: 60,
  intervalId: null as null | number,
  isTyping: false,
  typingRecord: {} as TypingRecordType,
  totalWord: 0,
  wrongWord: 0,
  accuracy: '0%',
  wpm: 0,
  totalKeystrokes: 0,
  wrongKeystrokes: 0,
  strictWrongCount: 0,
});

watch(() => state.isTyping, (val) => {
  if (val && state.countDown > 0) {
    state.intervalId = setInterval(() => {
      state.countDown -= 1;
      if (state.countDown < 1) {
        finishTyping();
      }
    }, 1000);
  }
});

function finishTyping() {
  if (state.intervalId !== null) {
    clearInterval(state.intervalId);
    state.intervalId = null;
  }
  state.typingRecord = wordInputRef.value?.getTypingRecord() || {};
  state.strictWrongCount = wordInputRef.value?.getStrictWrongCount() || 0;
  wordInputRef.value?.typingEnd();
  calcResult();
  state.step = 'result';
}

function calcResult() {
  const keys = Object.keys(state.typingRecord).map(Number).sort((a, b) => a - b);
  const lastRecord: TypingRecordItemType[] = state.typingRecord[keys[keys.length - 1]] || [];
  let totalWord = 0;
  let wrongWord = 0;
  let totalKeystrokes = 0;
  let wrongKeystrokes = 0;

  for (const item of lastRecord) {
    if (item.isInput) {
      const len = item.word ? item.word.replace(/\s+/g, '').length : 0;
      totalWord += len;
      totalKeystrokes += len;
      if (item.wrongPos) {
        wrongWord += item.wrongPos.length;
        wrongKeystrokes += item.wrongPos.length;
      }
    }
  }

  state.totalWord = totalWord;
  state.wrongWord = wrongWord;
  state.totalKeystrokes = totalKeystrokes;
  state.wrongKeystrokes = wrongKeystrokes;
  state.accuracy = totalWord ? ((totalWord - wrongWord) / totalWord * 100).toFixed(0) + '%' : '0%';
  state.wpm = totalWord ? Math.round((totalWord - wrongWord) / 60 * 60) : 0;
}

async function saveResult() {
  if (!examStore.employeeName || !examStore.employeeGroup || !state.selectedArticle) return;
  try {
    await saveRecord({
      employee_name: examStore.employeeName,
      employee_group: examStore.employeeGroup,
      article_id: state.selectedArticle.id,
      article_title: state.selectedArticle.title,
      wpm: state.wpm,
      accuracy: state.accuracy,
      duration: 60,
      total_keystrokes: state.totalKeystrokes,
      wrong_keystrokes: state.wrongKeystrokes,
      strict_wrong_count: state.strictWrongCount,
    });
    message({ message: '成绩已保存' });
  } catch (e: any) {
    const msg = e.response?.data?.message || '保存失败';
    message({ message: msg, type: 'error' });
  }
}

function goToSelect() {
  state.step = 'select';
  loadArticles();
}

async function loadArticles() {
  state.articlesLoading = true;
  try {
    const res = await getArticles();
    state.articles = res.data?.result?.articles || [];
  } catch {
    message({ message: '加载文章失败', type: 'error' });
  } finally {
    state.articlesLoading = false;
  }
}

async function selectArticle(article: any) {
  state.selectedArticle = article;
  examStore.selectArticle(article.id);
  state.countDown = 60;
  state.step = 'typing';
  await nextTick();
  wordInputRef.value?.focusInput();
}

function restart() {
  state.countDown = 60;
  state.typingRecord = {};
  state.step = 'select';
  loadArticles();
}

function changePerson() {
  state.step = 'form';
  state.name = '';
  state.group = '';
  state.selectedArticle = null;
  examStore.reset();
}

function submitForm() {
  if (!state.name.trim() || !state.group.trim()) {
    message({ message: '请填写姓名和班组', type: 'error' });
    return;
  }
  examStore.setEmployee(state.name.trim(), state.group.trim());
  goToSelect();
}
</script>

<template>
  <main class="y-main y-exam">
    <!-- Step 1: 填写信息 -->
    <div v-if="state.step === 'form'" class="y-exam-form">
      <h2 style="text-align: center; margin-bottom: 32px">打字速度测试</h2>
      <div class="y-exam-form__field">
        <label>姓名</label>
        <input v-model="state.name" class="y-exam-input" placeholder="请输入姓名" @keyup.enter="submitForm" />
      </div>
      <div class="y-exam-form__field">
        <label>班组</label>
        <input v-model="state.group" class="y-exam-input" placeholder="请输入班组" @keyup.enter="submitForm" />
      </div>
      <button class="y-exam-btn y-exam-btn--primary" @click="submitForm">进入测试</button>
    </div>

    <!-- Step 2: 选择文章 -->
    <div v-else-if="state.step === 'select'" class="y-exam-select">
      <div class="y-exam-header">
        <span class="y-exam-user">{{ examStore.employeeName }} · {{ examStore.employeeGroup }}</span>
        <button class="y-exam-btn y-exam-btn--small" @click="changePerson">换人</button>
      </div>
      <h3 style="margin: 20px 0 16px">选择测试文章</h3>
      <div v-if="state.articlesLoading" style="text-align: center; padding: 40px; color: $gray-04">加载中...</div>
      <div v-else class="y-exam-article-list">
        <div
          v-for="article in state.articles"
          :key="article.id"
          class="y-exam-article-item"
          @click="selectArticle(article)"
        >
          <div class="y-exam-article-item__title">{{ article.title }}</div>
          <div class="y-exam-article-item__meta">{{ article.author || '佚名' }} · {{ article.type }}</div>
        </div>
        <div v-if="!state.articles.length" style="text-align: center; padding: 40px; color: $gray-04">
          暂无可测试文章，请联系管理员
        </div>
      </div>
    </div>

    <!-- Step 3: 打字 -->
    <div v-else-if="state.step === 'typing'" class="y-exam-typing">
      <div class="y-exam-typing__header">
        <div class="y-exam-user">{{ examStore.employeeName }} · {{ examStore.employeeGroup }}</div>
        <div class="y-exam-countdown" :class="{ 'y-exam-countdown--active': state.countDown <= 10 }">
          {{ state.countDown }}
        </div>
        <div class="y-exam-article-title">{{ state.selectedArticle?.title }}</div>
      </div>
      <WordInput
        ref="wordInputRef"
        :quote="state.selectedArticle?.content || ''"
        :is-strict-mode="true"
        :is-space-type="false"
        @is-typing="state.isTyping = true"
      />
    </div>

    <!-- Step 4: 结果 -->
    <div v-else-if="state.step === 'result'" class="y-exam-result">
      <div class="y-exam-result__header">
        <h2>{{ examStore.employeeName }} · {{ examStore.employeeGroup }}</h2>
        <div class="y-exam-result__article">{{ state.selectedArticle?.title }}</div>
      </div>
      <div class="y-exam-result__stats">
        <div class="y-exam-result-stat">
          <div class="y-exam-result-stat__value">{{ state.wpm }}</div>
          <div class="y-exam-result-stat__label">WPM</div>
        </div>
        <div class="y-exam-result-stat">
          <div class="y-exam-result-stat__value">{{ state.accuracy }}</div>
          <div class="y-exam-result-stat__label">正确率</div>
        </div>
        <div class="y-exam-result-stat">
          <div class="y-exam-result-stat__value">{{ state.totalWord }}</div>
          <div class="y-exam-result-stat__label">输入字数</div>
        </div>
        <div class="y-exam-result-stat">
          <div class="y-exam-result-stat__value">{{ state.wrongWord }}</div>
          <div class="y-exam-result-stat__label">错误字数</div>
        </div>
      </div>
      <div class="y-exam-result__actions">
        <button class="y-exam-btn y-exam-btn--primary" @click="saveResult">保存成绩</button>
        <button class="y-exam-btn" @click="restart">再测一次</button>
        <button class="y-exam-btn y-exam-btn--cancel" @click="changePerson">换人</button>
      </div>
    </div>
  </main>
</template>

<style scoped lang="scss">
.y-exam {
  max-width: 680px;
}

/* Form */
.y-exam-form {
  max-width: 360px;
  margin: 60px auto 0;
}
.y-exam-form__field {
  margin-bottom: 20px;
  label {
    display: block;
    margin-bottom: 8px;
    font-size: 14px;
    color: $gray-06;
  }
}
.y-exam-input {
  width: 100%;
  padding: 12px 16px;
  border: 1px solid $gray-04;
  border-radius: 4px;
  font-size: 16px;
  background: transparent;
  color: $gray-08;
  outline: none;
  box-sizing: border-box;
  &:focus { border-color: $main-color; }
}

/* Buttons */
.y-exam-btn {
  padding: 10px 24px;
  border: 1px solid $main-color;
  border-radius: 4px;
  background: transparent;
  color: $main-color;
  cursor: pointer;
  font-size: 15px;
  transition: all 0.2s;
  &:hover {
    background: $main-color;
    color: $label-white;
  }
  &--primary {
    background: $main-color;
    color: $label-white;
    &:hover { opacity: 0.9; }
  }
  &--small {
    padding: 4px 12px;
    font-size: 13px;
  }
  &--cancel {
    border-color: $gray-04;
    color: $gray-04;
    &:hover {
      background: $gray-04;
      color: white;
    }
  }
}

/* Header user info */
.y-exam-user {
  font-size: 14px;
  color: $gray-06;
}

/* Select articles */
.y-exam-select {
  .y-exam-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
}
.y-exam-article-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.y-exam-article-item {
  padding: 14px 18px;
  border: 1px solid $gray-04;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s;
  &:hover {
    border-color: $main-color;
    background: rgba($main-color, 0.05);
  }
}
.y-exam-article-item__title {
  font-size: 16px;
  font-weight: bold;
  margin-bottom: 4px;
}
.y-exam-article-item__meta {
  font-size: 13px;
  color: $gray-04;
}

/* Typing */
.y-exam-typing__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
  padding: 0 4px;
}
.y-exam-countdown {
  font-size: 40px;
  font-weight: bold;
  color: $gray-04;
  font-variant-numeric: tabular-nums;
  &.y-exam-countdown--active {
    color: #ff4d4f;
    animation: pulse 0.5s infinite alternate;
  }
}
.y-exam-article-title {
  font-size: 14px;
  color: $gray-04;
}

@keyframes pulse {
  from { opacity: 1; }
  to { opacity: 0.4; }
}

/* Result */
.y-exam-result {
  text-align: center;
  padding-top: 40px;
}
.y-exam-result__header {
  margin-bottom: 32px;
  h2 { font-size: 22px; }
}
.y-exam-result__article {
  font-size: 14px;
  color: $gray-04;
  margin-top: 4px;
}
.y-exam-result__stats {
  display: flex;
  gap: 16px;
  justify-content: center;
  margin-bottom: 40px;
}
.y-exam-result-stat {
  padding: 20px 28px;
  border: 1px solid $gray-04;
  border-radius: 6px;
}
.y-exam-result-stat__value {
  font-size: 32px;
  font-weight: bold;
  color: $main-color;
}
.y-exam-result-stat__label {
  font-size: 13px;
  color: $gray-04;
  margin-top: 4px;
}
.y-exam-result__actions {
  display: flex;
  gap: 16px;
  justify-content: center;
}
</style>
