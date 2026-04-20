<template>
  <div id="root" class="min-h-screen bg-dark">
    <BreadCrums
      :crumbs="[
        {
          name: 'Categories',
          path: '/resources/categories',
          icon: 'fa-solid fa-tags text-neutral-700 text-2xl'
        }
      ]"
    >
      <div class="flex items-center gap-4">
        <Can :subject="'email_workflow_categories'" :actions="['create']">
          <AppButton
            test-id="categories-add-category"
            buttonStyle="primary"
            href="/resources/categories/add"
          >
            <i class="fa-solid fa-plus"></i>
            <span class="ml-2">Add Category</span>
          </AppButton>
        </Can>
      </div>
    </BreadCrums>

    <div test-id="categories-table-wrapper" class="p-4">
      <Table
        :cols="['Name', 'Description', 'Created At']"
        :rows="rows"
        :page="page"
        :total="total"
        :per-page="perPage"
        :total-pages="totalPages"
        :on-next-page="onNextPage"
        :on-previous-page="onPreviousPage"
        :set-page="setPage"
        :entities="categories"
        entity-name="Category"
        :on-success="fetchCategories"
        :on-search="
          (val: string) => {
            query = val
          }
        "
        :loading="loading"
        :subject="'email_workflow_categories'"
        :search-placeholder="'Search by category name'"
        :handleDelete="handleDelete"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, watch } from "vue";
import Table from "@/components/Table.vue";
import { apiDelete, apiGet } from "@/util/api";
import { useAuthStore } from "@/stores/auth";
import type { WorkflowEmailCategory } from "./category.interface";
import type { PaginatedResponse } from "@/util/interfaces";
import AppButton from "@/components/AppButton.vue";
import BreadCrums from "@/components/breadCrums.vue";
import Can from "@/components/Can.vue";
import { useToast } from "@/stores/notification";
import { useDialog } from "@/stores/dialog";
import ConfirmDialog from "@/components/ConfirmDialog.vue";
import { formatDateToDay } from "@/util/util";

const categories = ref<WorkflowEmailCategory[]>([]);
const page = ref(1);
const perPage = ref(15);
const total = ref(0);
const totalPages = ref(1);
const query = ref("");
const loading = ref(true);
const rows = ref<{ [key: string]: any }[]>([]);
const authStore = useAuthStore();
const toast = useToast();
const dialog = useDialog();

const mapRows = (items: WorkflowEmailCategory[]) => {
  return items.map((category) => ({
    id: category.id,
    Name: category.name,
    Description: category.description || "-",
    "Created At": formatDateToDay(category.createdAt),
  }));
};

const handleDelete = async (entity: WorkflowEmailCategory) => {
  dialog.openDialog(ConfirmDialog, {
    message: `Are you sure you want to delete category "${entity.name}"? This action cannot be undone.`,
    onConfirm: async () => {
      try {
        await apiDelete(`/categories/${entity.id}`, authStore);
        toast.showToast("Success", "Category deleted successfully", "success");
        await fetchCategories();
      } catch (error: any) {
        toast.showToast(
          "Error",
          error?.response?.data?.message ||
            "Failed to delete category. Please try again.",
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
};

const fetchCategories = async () => {
  loading.value = true;
  try {
    const data = await apiGet<WorkflowEmailCategory[]>(
      "/categories",
      authStore,
    );
    let filtered = data;
    if (query.value.trim()) {
      const searchValue = query.value.trim().toLowerCase();
      filtered = data.filter((category) =>
        category.name.toLowerCase().includes(searchValue),
      );
    }
    total.value = filtered.length;
    totalPages.value = Math.max(1, Math.ceil(filtered.length / perPage.value));
    const start = (page.value - 1) * perPage.value;
    const end = start + perPage.value;
    categories.value = filtered.slice(start, end);
    rows.value = mapRows(categories.value);
  } catch {
    categories.value = [];
    rows.value = [];
  } finally {
    loading.value = false;
  }
};

const onNextPage = () => {
  if (page.value < totalPages.value) {
    page.value = page.value + 1;
    fetchCategories();
  }
};

const onPreviousPage = () => {
  if (page.value > 1) {
    page.value = page.value - 1;
    fetchCategories();
  }
};

const setPage = (newPage: number) => {
  if (newPage !== page.value) {
    page.value = newPage;
    fetchCategories();
  }
};

onMounted(() => {
  fetchCategories();
});

watch(query, () => {
  page.value = 1;
  fetchCategories();
});

watch(perPage, () => {
  page.value = 1;
  fetchCategories();
});
</script>
