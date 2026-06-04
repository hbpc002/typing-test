import { defineStore } from 'pinia';

export const useExamStore = defineStore('exam', {
  state: () => ({
    employeeName: '',
    employeeGroup: '',
    selectedArticleId: null as number | null,
  }),
  getters: {
    isReady(): boolean {
      return !!this.employeeName && !!this.employeeGroup;
    },
  },
  actions: {
    setEmployee(name: string, group: string) {
      this.employeeName = name;
      this.employeeGroup = group;
    },
    selectArticle(id: number) {
      this.selectedArticleId = id;
    },
    reset() {
      this.employeeName = '';
      this.employeeGroup = '';
      this.selectedArticleId = null;
    },
  },
});
