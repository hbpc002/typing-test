<script setup lang="ts">
import { useRoute } from 'vue-router';

const route = useRoute();

const tabs = [
  { name: 'AdminArticles', label: '文章管理' },
  { name: 'AdminScores', label: '成绩查询' },
];
</script>

<template>
  <nav class="y-admin-tabs">
    <router-link
      v-for="t in tabs"
      :key="t.name"
      :to="{ name: t.name }"
      class="y-admin-tabs__item"
      :class="{ 'y-admin-tabs__item--active': route.name === t.name }"
    >
      {{ t.label }}
    </router-link>
  </nav>
</template>

<style scoped lang="scss">
.y-admin-tabs {
  display: flex;
  gap: 4px;
  margin-bottom: 24px;
  border-bottom: 1px solid $gray-04;
}
.y-admin-tabs__item {
  padding: 8px 16px;
  font-size: 15px;
  color: $gray-06;
  text-decoration: none;
  border-bottom: 2px solid transparent;
  transition: color 0.2s, border-color 0.2s;
  &:hover {
    color: $main-color;
  }
  &--active {
    color: $main-color;
    border-bottom-color: $main-color;
    font-weight: 600;
  }
}
</style>
