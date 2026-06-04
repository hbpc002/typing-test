<script setup lang="ts">
import { reactive, onMounted, inject } from 'vue';
import { getArticles, createArticle, updateArticle, deleteArticle } from '@/request';

const message: any = inject('message');

const state = reactive({
  articles: [] as any[],
  loading: false,
  showForm: false,
  editingId: null as number | null,
  form: {
    title: '',
    author: '',
    content: '',
    type: '文章',
  },
});

async function loadArticles() {
  state.loading = true;
  try {
    const res = await getArticles();
    state.articles = res.data?.result?.articles || [];
  } catch {
    message({ message: '加载文章失败', type: 'error' });
  } finally {
    state.loading = false;
  }
}

function openCreate() {
  state.editingId = null;
  state.form = { title: '', author: '', content: '', type: '文章' };
  state.showForm = true;
}

function openEdit(article: any) {
  state.editingId = article.id;
  state.form = {
    title: article.title,
    author: article.author || '',
    content: article.content || '',
    type: article.type || '文章',
  };
  state.showForm = true;
}

async function handleSave() {
  if (!state.form.title || !state.form.content) {
    message({ message: '标题和内容不能为空', type: 'error' });
    return;
  }
  try {
    if (state.editingId) {
      await updateArticle(state.editingId, state.form);
      message({ message: '更新成功' });
    } else {
      await createArticle(state.form);
      message({ message: '创建成功' });
    }
    state.showForm = false;
    loadArticles();
  } catch (e: any) {
    const msg = e.response?.data?.message || '操作失败';
    message({ message: msg, type: 'error' });
  }
}

async function handleDelete(id: number) {
  if (!confirm('确定删除该文章？')) return;
  try {
    await deleteArticle(id);
    message({ message: '删除成功' });
    loadArticles();
  } catch (e: any) {
    const msg = e.response?.data?.message || '删除失败';
    message({ message: msg, type: 'error' });
  }
}

onMounted(loadArticles);
</script>

<template>
  <main class="y-main" style="max-width: 800px">
    <div class="y-admin-header">
      <h2>文章管理</h2>
      <button class="y-admin-btn" @click="openCreate">新建文章</button>
    </div>

    <div v-if="state.showForm" class="y-admin-form">
      <input v-model="state.form.title" class="y-admin-input" placeholder="文章标题" />
      <input v-model="state.form.author" class="y-admin-input" placeholder="作者（选填）" />
      <textarea v-model="state.form.content" class="y-admin-textarea" placeholder="文章内容" rows="8" />
      <div class="y-admin-form-actions">
        <button class="y-admin-btn y-admin-btn--primary" @click="handleSave">保存</button>
        <button class="y-admin-btn y-admin-btn--cancel" @click="state.showForm = false">取消</button>
      </div>
    </div>

    <div v-if="state.loading" style="text-align: center; padding: 40px; color: $gray-04">
      加载中...
    </div>
    <div v-else class="y-admin-list">
      <div v-for="article in state.articles" :key="article.id" class="y-admin-list-item">
        <div class="y-admin-list-item__info">
          <div class="y-admin-list-item__title">{{ article.title }}</div>
          <div class="y-admin-list-item__meta">
            {{ article.author || '佚名' }} · {{ article.type }} · {{ article.created_at }}
          </div>
        </div>
        <div class="y-admin-list-item__actions">
          <button class="y-admin-btn y-admin-btn--small" @click="openEdit(article)">编辑</button>
          <button class="y-admin-btn y-admin-btn--small y-admin-btn--danger" @click="handleDelete(article.id)">删除</button>
        </div>
      </div>
      <div v-if="!state.articles.length" style="text-align: center; padding: 40px; color: $gray-04">
        暂无文章，请新建
      </div>
    </div>
  </main>
</template>

<style scoped lang="scss">
.y-admin-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}
.y-admin-btn {
  padding: 8px 16px;
  border: 1px solid $main-color;
  border-radius: 4px;
  background: transparent;
  color: $main-color;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s;
  &:hover {
    background: $main-color;
    color: $label-white;
  }
  &--primary {
    background: $main-color;
    color: $label-white;
  }
  &--cancel {
    border-color: $gray-04;
    color: $gray-04;
  }
  &--danger {
    border-color: #ff4d4f;
    color: #ff4d4f;
    &:hover {
      background: #ff4d4f;
      color: white;
    }
  }
  &--small {
    padding: 4px 10px;
    font-size: 12px;
  }
}
.y-admin-form {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 24px;
  padding: 16px;
  border: 1px solid $gray-04;
  border-radius: 4px;
}
.y-admin-input {
  padding: 10px 12px;
  border: 1px solid $gray-04;
  border-radius: 4px;
  font-size: 14px;
  background: transparent;
  color: $gray-08;
  outline: none;
  &:focus { border-color: $main-color; }
}
.y-admin-textarea {
  padding: 10px 12px;
  border: 1px solid $gray-04;
  border-radius: 4px;
  font-size: 14px;
  background: transparent;
  color: $gray-08;
  outline: none;
  resize: vertical;
  &:focus { border-color: $main-color; }
}
.y-admin-form-actions {
  display: flex;
  gap: 12px;
}
.y-admin-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.y-admin-list-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  border: 1px solid $gray-04;
  border-radius: 4px;
}
.y-admin-list-item__title {
  font-weight: bold;
  margin-bottom: 4px;
}
.y-admin-list-item__meta {
  font-size: 12px;
  color: $gray-04;
}
.y-admin-list-item__actions {
  display: flex;
  gap: 8px;
}
</style>
