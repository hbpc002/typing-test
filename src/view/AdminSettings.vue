<script setup lang="ts">
import { reactive, onMounted, inject } from 'vue';
import { getSettings, updateSetting } from '@/request';
import AdminTabs from '@/components/AdminTabs.vue';

const message: any = inject('message');

const state = reactive({
  loading: false,
  saving: false,
  allowStrictModeToggle: true,
});

async function loadSettings() {
  state.loading = true;
  try {
    const res = await getSettings();
    const map = res.data?.result || {};
    state.allowStrictModeToggle = (map.allow_strict_mode_toggle ?? '1') === '1';
  } catch {
    message({ message: '加载设置失败', type: 'error' });
  } finally {
    state.loading = false;
  }
}

async function handleToggle(checked: boolean) {
  if (state.saving) return;
  state.saving = true;
  const previous = state.allowStrictModeToggle;
  state.allowStrictModeToggle = checked;
  try {
    await updateSetting('allow_strict_mode_toggle', checked ? '1' : '0');
    message({ message: checked ? '已开启：员工可切换严格模式' : '已关闭：员工端严格模式强制开启且不可切换' });
  } catch {
    state.allowStrictModeToggle = previous;
    message({ message: '更新失败', type: 'error' });
  } finally {
    state.saving = false;
  }
}

onMounted(loadSettings);
</script>

<template>
  <main class="y-main" style="max-width: 800px">
    <AdminTabs />
    <h2 style="margin-bottom: 16px">系统设置</h2>

    <div v-if="state.loading" style="text-align: center; padding: 40px; color: $gray-04">
      加载中...
    </div>
    <div v-else class="y-admin-setting-list">
      <div class="y-admin-setting-item">
        <div class="y-admin-setting-item__info">
          <div class="y-admin-setting-item__title">允许员工切换严格模式</div>
          <div class="y-admin-setting-item__desc">
            开启后，员工可在打字页面的设置栏点击「严格模式」按钮自行切换；关闭后，员工端的「严格模式」按钮将变灰且不可点击，系统始终以严格模式运行。
          </div>
        </div>
        <label class="y-admin-switch">
          <input
            type="checkbox"
            :checked="state.allowStrictModeToggle"
            :disabled="state.saving"
            @change="handleToggle(($event.target as HTMLInputElement).checked)"
          />
          <span class="y-admin-switch__slider"></span>
        </label>
      </div>
    </div>
  </main>
</template>

<style scoped lang="scss">
.y-admin-setting-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.y-admin-setting-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
  padding: 16px 20px;
  border: 1px solid $gray-04;
  border-radius: 4px;
  &__info { flex: 1; }
  &__title {
    font-size: 15px;
    font-weight: 600;
    color: $gray-08;
    margin-bottom: 6px;
  }
  &__desc {
    font-size: 13px;
    color: $gray-04;
    line-height: 1.5;
  }
}
.y-admin-switch {
  position: relative;
  display: inline-block;
  width: 48px;
  height: 24px;
  flex-shrink: 0;
  input {
    opacity: 0;
    width: 0;
    height: 0;
    &:disabled + .y-admin-switch__slider {
      opacity: 0.5;
      cursor: not-allowed;
    }
  }
  &__slider {
    position: absolute;
    cursor: pointer;
    inset: 0;
    background-color: $gray-04;
    border-radius: 24px;
    transition: background-color 0.2s;
    &::before {
      content: '';
      position: absolute;
      left: 2px;
      top: 2px;
      width: 20px;
      height: 20px;
      background: white;
      border-radius: 50%;
      transition: transform 0.2s;
    }
  }
  input:checked + .y-admin-switch__slider {
    background-color: $main-color;
    &::before {
      transform: translateX(24px);
    }
  }
}
</style>
