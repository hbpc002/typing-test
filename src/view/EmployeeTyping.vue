<script setup lang="ts">
import { reactive, ref, computed, nextTick, onMounted, watch, inject } from 'vue';
import WordInput from '@/components/WordInput.vue';
import Tooltip from '@/components/ui/Tooltip.vue';
import YDropDown from '@/components/ui/DropDown.vue';
import YInput from '@/components/ui/Input.vue';
import YModal from '@/components/ui/Modal.vue';
import { useExamStore } from '@/store/exam';
import { storeToRefs } from 'pinia';
import { useConfigStore } from '@/store/config';
import { getArticles, saveRecord } from '@/request';
import type { TypingRecordType, TypingRecordItemType } from '@/types';

import IcoSetting from '@/assets/svg/setting.svg';
import IcoChange from '@/assets/svg/change.svg';
import IcoSelect from '@/assets/svg/select.svg';
import IcoUnSelect from '@/assets/svg/un-select.svg';

const message: any = inject('message');
const examStore = useExamStore();
const useConfig = useConfigStore();
const { currentFont, onlyShowMain } = storeToRefs(useConfig);
const wordInputRef = ref<any>(null);
const customTime = [15, 30, 60, 120];

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
  selectTime: 60,
  isStrictMode: false,
  isSpaceType: false,
  showCountDown: true,
  showSetTime: false,
  setCountDown: '',
  errorText: '',
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
  } else {
    if (state.intervalId) {
      clearInterval(state.intervalId);
      state.intervalId = null;
    }
  }
});

watch(() => state.setCountDown, () => {
  if (!/\d+/.test(Number(state.setCountDown))) {
    state.errorText = '请输入数字';
  } else {
    state.errorText = '';
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
      duration: state.selectTime,
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

async function refresh() {
  state.isTyping = false;
  state.countDown = state.selectTime || 60;
  state.typingRecord = {};
}

function selectTime(time: number) {
  state.countDown = time;
  state.isTyping = false;
}

function isTypingFunc() {
  state.isTyping = true;
}

function toggleStrictMode() {
  if (state.isTyping) refresh();
  state.isStrictMode = !state.isStrictMode;
}

async function changePunctuation() {
  if (state.isTyping) refresh();
  await nextTick();
  state.isSpaceType = !state.isSpaceType;
}

function setTime() {
  if (!state.setCountDown) {
    state.showSetTime = false;
    return;
  }
  if (!/\d+/.test(Number(state.setCountDown))) {
    state.errorText = '请输入数字';
    return;
  }
  state.isTyping = false;
  state.showSetTime = false;
  state.countDown = Number(state.setCountDown);
}

async function selectArticle(article: any) {
  state.selectedArticle = article;
  examStore.selectArticle(article.id);
  state.countDown = state.selectTime || 60;
  state.step = 'typing';
  await nextTick();
  wordInputRef.value?.focusInput();
}

function restart() {
  state.countDown = state.selectTime || 60;
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
  <main class="y-exam">
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
      <div v-show="!onlyShowMain" class="y-exam-typing__setting">
        <div class="y-exam-typing__setting-item y-exam-typing__refresh" @click="refresh">
          <Tooltip content="刷新">
            <IcoChange></IcoChange>
          </Tooltip>
        </div>
        <div class="y-exam-typing__setting-item y-exam-typing__time">
          <Tooltip :content="$t('select_countdown')">
            <span
              v-for="item in customTime"
              :key="item"
              class="y-exam-typing__time-item"
              :class="{ 'y-exam-typing__time-item--active': state.countDown === item }"
              @click="selectTime(item)"
            >{{ item }}</span>
          </Tooltip>
        </div>
        <div
          class="y-exam-typing__setting-item y-exam-typing__set-time"
          :class="{ 'y-exam-typing__time-item--active': state.isStrictMode }"
          @click="toggleStrictMode"
        >
          <span>{{ $t('strict_mode') }}</span>
        </div>
        <div class="y-exam-typing__setting-item y-exam-typing__settings">
          <YDropDown>
            <template #title>
              <Tooltip content="设置">
                <IcoSetting></IcoSetting>
              </Tooltip>
            </template>
            <template #menu>
              <div class="y-exam-typing__settings-menu">
                <div class="y-exam-typing__settings-item" @click="state.showCountDown = !state.showCountDown">
                  <component :is="state.showCountDown ? IcoSelect : IcoUnSelect" />
                  <span>{{ $t('display_countdown') }}</span>
                </div>
                <div class="y-exam-typing__settings-item" @click="changePunctuation">
                  <component :is="state.isSpaceType ? IcoSelect : IcoUnSelect" />
                  <span>{{ state.isSpaceType ? $t('space_to_punctuation') : $t('punctuation_to_space') }}</span>
                </div>
                <div class="y-exam-typing__settings-item" @click="state.showSetTime = true">
                  <span>{{ $t('custom_countdown') }}</span>
                </div>
              </div>
            </template>
          </YDropDown>
        </div>
      </div>
      <WordInput
        ref="wordInputRef"
        :quote="state.selectedArticle?.content || ''"
        :is-strict-mode="state.isStrictMode"
        :is-space-type="state.isSpaceType"
        @is-typing="isTypingFunc"
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
  <YModal :show="state.showSetTime" @close="state.showSetTime = false" @confirm="setTime">
    <template #header>
      <h3>{{ $t('custom_countdown') }}</h3>
    </template>
    <template #body>
      <div class="time-limit__container">
        <YInput
          :error-text="state.errorText"
          class="time-limit__q"
          v-model="state.setCountDown"
          :placeholder="$t('enter_countdown')"
        ></YInput>
      </div>
    </template>
  </YModal>
</template>

<style scoped lang="scss">

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
.y-exam-typing {
  :deep(.y-word-input__wrap),
  :deep(.y-word-input) {
    height: 280px;
  }
  :deep(.y-word-input) {
    width: 100%;
  }
}
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

.y-exam-typing__setting {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  height: 24px;
  margin-bottom: 30px;
}
.y-exam-typing__setting-item:not(:last-child) {
  position: relative;
  margin-right: 30px;
  &::after {
    content: '';
    position: absolute;
    width: 1px;
    height: 12px;
    background: $gray-02;
    right: -15px;
    top: 50%;
    transform: translateY(-50%);
  }
}
.y-exam-typing__time {
  display: inline-flex;
  align-items: center;
  color: $gray-06;
  font-size: 16px;
  line-height: 24px;
  height: 24px;
}
.y-exam-typing__time-item {
  margin-right: 10px;
  cursor: pointer;
  width: 30px;
  height: 30px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  &:hover { color: $main-color; }
}
.y-exam-typing__time-item--active {
  color: $main-color;
}
.y-exam-typing__refresh {
  cursor: pointer;
  svg {
    fill: $gray-06;
    width: 18px;
    height: 18px;
  }
}
.y-exam-typing__set-time {
  display: inline-flex;
  align-items: center;
  color: $gray-04;
  font-size: 14px;
  line-height: 24px;
  height: 24px;
  cursor: pointer;
  transition: color 0.2s ease;
  &:hover { color: $main-color; }
  &.y-exam-typing__time-item--active { color: $main-color; }
}
.y-exam-typing__settings-menu {
  min-width: 160px;
  padding: 6px 0;
  font-size: 14px;
}
.y-exam-typing__settings-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 14px;
  cursor: pointer;
  white-space: nowrap;
  transition: background 0.15s ease, color 0.15s ease;
  svg {
    width: 14px;
    height: 14px;
    flex-shrink: 0;
  }
  &:hover {
    background: $background-gray;
    color: $gray-08;
  }
}
.time-limit__container {
  color: $gray-04;
  font-size: 14px;
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
