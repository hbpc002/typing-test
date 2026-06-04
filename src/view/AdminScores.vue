<script setup lang="ts">
import { reactive, onMounted, inject } from 'vue';
import { getRecords, exportRecords, getStats } from '@/request';

const message: any = inject('message');

const state = reactive({
  records: [] as any[],
  total: 0,
  loading: false,
  filter: {
    name: '',
    group: '',
    start_date: '',
    end_date: '',
  },
  stats: {
    total_records: 0,
    total_people: 0,
    avg_wpm: 0,
    avg_accuracy: 0,
  },
});

async function loadRecords() {
  state.loading = true;
  try {
    const res = await getRecords(state.filter);
    state.records = res.data?.result?.records || [];
    state.total = res.data?.result?.total || 0;
  } catch {
    message({ message: '加载记录失败', type: 'error' });
  } finally {
    state.loading = false;
  }
}

async function loadStats() {
  try {
    const res = await getStats();
    Object.assign(state.stats, res.data?.result || {});
  } catch {}
}

async function handleExport() {
  try {
    const res = await exportRecords(state.filter);
    const blob = new Blob([res.data], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = '打字成绩.csv';
    a.click();
    URL.revokeObjectURL(url);
    message({ message: '导出成功' });
  } catch {
    message({ message: '导出失败', type: 'error' });
  }
}

onMounted(() => {
  loadRecords();
  loadStats();
});
</script>

<template>
  <main class="y-main" style="max-width: 1000px">
    <h2 style="margin-bottom: 16px">成绩查询</h2>

    <div class="y-admin-stats">
      <div class="y-admin-stat-item">
        <div class="y-admin-stat-value">{{ state.stats.total_records }}</div>
        <div class="y-admin-stat-label">总测试次数</div>
      </div>
      <div class="y-admin-stat-item">
        <div class="y-admin-stat-value">{{ state.stats.total_people }}</div>
        <div class="y-admin-stat-label">参与人数</div>
      </div>
      <div class="y-admin-stat-item">
        <div class="y-admin-stat-value">{{ state.stats.avg_wpm }}</div>
        <div class="y-admin-stat-label">平均 WPM</div>
      </div>
      <div class="y-admin-stat-item">
        <div class="y-admin-stat-value">{{ state.stats.avg_accuracy }}%</div>
        <div class="y-admin-stat-label">平均正确率</div>
      </div>
    </div>

    <div class="y-admin-filters">
      <input v-model="state.filter.name" class="y-admin-filter-input" placeholder="按姓名" @input="loadRecords" />
      <input v-model="state.filter.group" class="y-admin-filter-input" placeholder="按班组" @input="loadRecords" />
      <input v-model="state.filter.start_date" type="date" class="y-admin-filter-input" @change="loadRecords" />
      <input v-model="state.filter.end_date" type="date" class="y-admin-filter-input" @change="loadRecords" />
      <button class="y-admin-btn" @click="handleExport">导出 CSV</button>
    </div>

    <div v-if="state.loading" style="text-align: center; padding: 40px; color: $gray-04">
      加载中...
    </div>
    <div v-else class="y-admin-table-wrap">
      <table class="y-admin-table">
        <thead>
          <tr>
            <th>姓名</th>
            <th>班组</th>
            <th>文章</th>
            <th>WPM</th>
            <th>正确率</th>
            <th>用时</th>
            <th>总按键</th>
            <th>错误</th>
            <th>时间</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="r in state.records" :key="r.id">
            <td>{{ r.employee_name }}</td>
            <td>{{ r.employee_group }}</td>
            <td>{{ r.article_title }}</td>
            <td>{{ r.wpm }}</td>
            <td>{{ r.accuracy }}</td>
            <td>{{ r.duration }}s</td>
            <td>{{ r.total_keystrokes }}</td>
            <td>{{ r.wrong_keystrokes }}</td>
            <td style="font-size: 12px; white-space: nowrap">{{ r.created_at }}</td>
          </tr>
        </tbody>
      </table>
      <div v-if="!state.records.length" style="text-align: center; padding: 40px; color: $gray-04">
        暂无记录
      </div>
      <div v-if="state.total > 50" style="text-align: center; padding: 12px; color: $gray-04; font-size: 14px">
        共 {{ state.total }} 条记录，仅显示最近 50 条
      </div>
    </div>
  </main>
</template>

<style scoped lang="scss">
.y-admin-stats {
  display: flex;
  gap: 16px;
  margin-bottom: 24px;
}
.y-admin-stat-item {
  flex: 1;
  padding: 16px;
  border: 1px solid $gray-04;
  border-radius: 4px;
  text-align: center;
}
.y-admin-stat-value {
  font-size: 28px;
  font-weight: bold;
  color: $main-color;
}
.y-admin-stat-label {
  font-size: 12px;
  color: $gray-04;
  margin-top: 4px;
}
.y-admin-filters {
  display: flex;
  gap: 12px;
  margin-bottom: 16px;
  align-items: center;
  flex-wrap: wrap;
}
.y-admin-filter-input {
  padding: 8px 12px;
  border: 1px solid $gray-04;
  border-radius: 4px;
  font-size: 14px;
  background: transparent;
  color: $gray-08;
  outline: none;
  &:focus { border-color: $main-color; }
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
  white-space: nowrap;
  &:hover {
    background: $main-color;
    color: $label-white;
  }
}
.y-admin-table-wrap {
  overflow-x: auto;
}
.y-admin-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
  th, td {
    padding: 10px 12px;
    text-align: left;
    border-bottom: 1px solid $gray-04;
    white-space: nowrap;
  }
  th {
    font-weight: bold;
    color: $gray-06;
  }
  tr:hover td {
    background: rgba($main-color, 0.05);
  }
}
</style>
