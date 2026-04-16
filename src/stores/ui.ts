import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useUiStore = defineStore('ui', () => {
  const sidebarOpen = ref(true);
  const open = ref(true);

  function setSidebarOpen(value: boolean) {
    sidebarOpen.value = value;
  }

  function setOpen(value: boolean) {
    open.value = value;
  }

  function toggleSidebarOpen() {
    sidebarOpen.value = !sidebarOpen.value;
  }

  function toggleOpen() {
    open.value = !open.value;
  }

  function openBothSidebars() {
    sidebarOpen.value = true;
    open.value = true;
  }

  function closeBothSidebars() {
    sidebarOpen.value = false;
    open.value = false;
  }

  return {
    sidebarOpen,
    open,
    setSidebarOpen,
    setOpen,
    toggleSidebarOpen,
    toggleOpen,
    openBothSidebars,
    closeBothSidebars
  };
});

