<template>
  <div id="root" class="min-h-screen bg-main">
    <BreadCrums
      :crumbs="[
        {
          name: 'Categories',
          path: '/resources/categories',
          icon: 'fa-solid fa-tags text-neutral-700 text-2xl'
        },
        { name: 'Category Details', path: '', icon: '' }
      ]"
    >
      <div class="flex items-center gap-4">
        <Can :subject="'email_workflow_categories'" :actions="['update']">
          <AppButton
            :href="`/resources/categories/${categoryId}/edit`"
            button-style="secondary"
            test-id="edit-category-button"
          >
            <i class="fa-solid fa-pen-to-square"></i>
            <span class="ml-2">Edit</span>
          </AppButton>
        </Can>
        <Can :subject="'email_workflow_categories'" :actions="['delete']">
          <AppButton
            button-style="primary"
            @click="handleDeleteCategory"
            test-id="delete-category-button"
          >
            <i class="fa-solid fa-trash"></i>
            <span class="ml-2">Delete Category</span>
          </AppButton>
        </Can>
      </div>
    </BreadCrums>

    <main id="main-content" class="p-4 sm:p-6 lg:p-8">
      <div v-if="loading" class="flex justify-center items-center py-12">
        <Spinner width="10" />
      </div>

      <template v-else>
        <div class="bg-secondary rounded-lg border p-6 mb-6">
          <div class="flex items-center gap-4 mb-6">
            <i class="fa-solid fa-tags text-5xl text-opposite"></i>
            <div>
              <h2 class="text-2xl text-opposite">{{ category.name }}</h2>
              <p class="text-opposite text-sm">
                Created {{ formatDateToDay(category.createdAt) }}
              </p>
            </div>
          </div>
          <div class="rounded-md bg-main p-4 border">
            <h3 class="text-opposite text-sm font-semibold mb-2">Description</h3>
            <p class="text-opposite whitespace-pre-wrap">
              {{ category.description || "-" }}
            </p>
          </div>
        </div>
      </template>
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useAuthStore } from "@/stores/auth";
import { apiDelete, apiGet } from "@/util/api";
import type { WorkflowEmailCategory } from "./category.interface";
import AppButton from "@/components/AppButton.vue";
import Spinner from "@/components/Spinner.vue";
import BreadCrums from "@/components/breadCrums.vue";
import Can from "@/components/Can.vue";
import { useToast } from "@/stores/notification";
import { useDialog } from "@/stores/dialog";
import ConfirmDialog from "@/components/ConfirmDialog.vue";
import { formatDateToDay } from "@/util/util";

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();
const toast = useToast();
const dialog = useDialog();
const loading = ref(true);

const category = ref<WorkflowEmailCategory>({
  id: "",
  name: "",
  description: null,
  createdAt: 0,
  updatedAt: 0,
});

const categoryId = computed(() => route.params.categoryId as string);

async function fetchCategory() {
  loading.value = true;
  try {
    const response = await apiGet<WorkflowEmailCategory>(
      `/categories/${categoryId.value}`,
      authStore,
    );
    category.value = response;
  } catch {
    toast.showToast("Error", "Failed to load category data", "error");
    router.push("/resources/categories");
  } finally {
    loading.value = false;
  }
}

function handleDeleteCategory() {
  dialog.openDialog(ConfirmDialog, {
    message: `Are you sure you want to delete category "${category.value.name}"? This action cannot be undone.`,
    onConfirm: async () => {
      try {
        await apiDelete(`/categories/${categoryId.value}`, authStore);
        toast.showToast("Success", "Category deleted successfully", "success");
        router.push("/resources/categories");
      } catch (error: any) {
        toast.showToast(
          "Error",
          error?.response?.data?.message || "Failed to delete category.",
          "error",
        );
      } finally {
        dialog.closeDialog();
      }
    },
    onCancel: () => {
      dialog.closeDialog();
    },
  });
}

onMounted(() => {
  fetchCategory();
});
</script>
