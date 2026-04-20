<template>
  <div id="root" class="min-h-screen bg-main">
    <BreadCrums
      :crumbs="[
        {
          name: 'Categories',
          path: '/resources/categories',
          icon: 'fa-solid fa-tags text-neutral-700 text-2xl'
        },
        {
          name: isEditMode ? 'Edit Category' : 'Add Category',
          path: '',
          icon: ''
        }
      ]"
    />

    <main id="main-content" class="p-4 sm:p-6 lg:p-8">
      <div id="edit-form" class="max-w-3xl mx-auto bg-secondary rounded-lg shadow-sm">
        <div class="p-6 border-b">
          <div class="flex items-center gap-4">
            <div v-if="!isEditMode">
              <h2 class="text-lg text-opposite">Add New Category</h2>
              <p class="text-neutral-500">Create a new email category</p>
            </div>
            <div v-else>
              <h2 class="text-lg text-opposite">Edit Category</h2>
              <p class="text-neutral-500">Edit category details</p>
            </div>
          </div>
        </div>

        <div v-if="isEditMode && !loaded" class="p-6 flex items-center justify-center h-60">
          <Spinner width="30" height="30" />
        </div>

        <Form v-else @submit="submitForm" class="p-6 space-y-6">
          <AppInputForm
            test-id="category-name"
            name="name"
            label="Category Name"
            placeholder="Enter category name"
            :value="initialValues.name"
            :rules="
              (v: any) =>
                !exists(v)
                  ? 'Category name is required'
                  : v.length > 255
                    ? 'Category name must be 255 characters or less'
                    : true
            "
            :required="true"
          />

          <AppTextareaForm
            name="description"
            label="Description"
            placeholder="Enter category description"
            :value="initialValues.description"
          />

          <AppTextareaForm
            name="resourceText"
            label="Resource Text"
            placeholder="Add text that helps define this category"
            :value="initialValues.resourceText"
          />

          <AppTextareaForm
            name="resourceLinks"
            label="Resource Links"
            placeholder="One URL per line"
            :value="initialValues.resourceLinks"
          />

          <div>
            <label class="block text-sm text-opposite mb-2">Resource Files</label>
            <input
              ref="fileInput"
              type="file"
              multiple
              class="w-full text-sm text-opposite file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:bg-main file:text-opposite border rounded-md p-2 bg-main"
              @change="onFilesSelected"
            />
            <p class="text-xs text-neutral-500 mt-2">
              Upload documents to use as category resources.
            </p>
            <ul v-if="selectedFiles.length" class="mt-3 space-y-2">
              <li
                v-for="(file, index) in selectedFiles"
                :key="`${file.name}-${index}`"
                class="flex items-center justify-between text-sm text-opposite bg-main border rounded-md px-3 py-2"
              >
                <span class="truncate mr-4">{{ file.name }}</span>
                <button
                  type="button"
                  class="text-red-400 hover:text-red-300"
                  @click="removeSelectedFile(index)"
                >
                  Remove
                </button>
              </li>
            </ul>
            <ul v-if="existingFileKeys.length" class="mt-3 space-y-2">
              <li
                v-for="(key, index) in existingFileKeys"
                :key="`${key}-${index}`"
                class="flex items-center justify-between text-sm text-opposite bg-main border rounded-md px-3 py-2"
              >
                <span class="truncate mr-4">{{ key }}</span>
                <button
                  type="button"
                  class="text-red-400 hover:text-red-300"
                  @click="removeExistingFile(index)"
                >
                  Remove
                </button>
              </li>
            </ul>
          </div>

          <div class="p-6 border-t flex items-center justify-end gap-4">
            <AppButton
              test-id="cancel-category-button"
              buttonStyle="secondary"
              type="button"
              @click="cancel"
            >
              Cancel
            </AppButton>
            <AppButton
              test-id="save-category-button"
              buttonStyle="primary"
              type="submit"
              :loading="isSubmitting"
            >
              Save Changes
            </AppButton>
          </div>
        </Form>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue";
import { Form } from "vee-validate";
import { useRoute, useRouter } from "vue-router";
import AppInputForm from "@/components/AppInputForm.vue";
import AppTextareaForm from "@/components/AppTextareaForm.vue";
import { useAuthStore } from "@/stores/auth";
import { apiGet, apiPostFormData, apiPutFormData } from "@/util/api";
import { useToast } from "@/stores/notification";
import { exists } from "@/util/util";
import type { WorkflowEmailCategory } from "./category.interface";
import AppButton from "@/components/AppButton.vue";
import Spinner from "@/components/Spinner.vue";
import BreadCrums from "@/components/breadCrums.vue";

const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();
const isSubmitting = ref(false);
const toast = useToast();
const categoryId = route.params.categoryId as string | undefined;
const isEditMode = !!categoryId;
const loaded = ref(false);
const fileInput = ref<HTMLInputElement | null>(null);
const selectedFiles = ref<File[]>([]);
const existingResourceId = ref<string | undefined>(undefined);
const existingFileKeys = ref<string[]>([]);
const initialValues = ref<{
  name: string;
  description: string;
  resourceText: string;
  resourceLinks: string;
}>({
  name: "",
  description: "",
  resourceText: "",
  resourceLinks: "",
});

onMounted(async () => {
  if (!isEditMode) {
    loaded.value = true;
    return;
  }

  try {
    const response = await apiGet<WorkflowEmailCategory>(
      `/categories/${categoryId}`,
      authStore,
    );
    initialValues.value = {
      name: response.name,
      description: response.description || "",
      resourceText: response.resources?.[0]?.textResource || "",
      resourceLinks: (response.resources?.[0]?.links || []).join("\n"),
    };
    existingResourceId.value = response.resources?.[0]?.id;
    existingFileKeys.value = [...(response.resources?.[0]?.files || [])];
    loaded.value = true;
  } catch (error: any) {
    toast.showToast(
      "Error loading category",
      error?.response?.data?.message ||
        "An error occurred while loading the category",
      "error",
    );
    router.push("/resources/categories");
  }
});

const submitForm = async (values: any) => {
  isSubmitting.value = true;
  const formData = new FormData();
  formData.append("name", values.name);
  formData.append("description", values.description || "");

  const parsedLinks = String(values.resourceLinks || "")
    .split("\n")
    .map((link) => link.trim())
    .filter((link) => !!link);

  const resources = [
    {
      ...(existingResourceId.value ? { id: existingResourceId.value } : {}),
      textResource: values.resourceText || null,
      links: parsedLinks,
      files: existingFileKeys.value,
    },
  ];
  formData.append("resources", JSON.stringify(resources));
  selectedFiles.value.forEach((file) => {
    formData.append("files", file);
  });

  try {
    let response: WorkflowEmailCategory;
    if (isEditMode) {
      response = await apiPutFormData<WorkflowEmailCategory>(
        `/categories/${categoryId}`,
        formData,
        authStore,
      );
      toast.showToast(
        "Category updated successfully",
        "Category updated successfully",
        "success",
      );
    } else {
      response = await apiPostFormData<WorkflowEmailCategory>(
        "/categories",
        formData,
        authStore,
      );
      toast.showToast(
        "Category created successfully",
        "Category created successfully",
        "success",
      );
    }
    router.push(`/resources/categories/${response.id}`);
  } catch (error: any) {
    isSubmitting.value = false;
    toast.showToast(
      isEditMode ? "Error updating category" : "Error creating category",
      error?.response?.data?.message ||
        `An error occurred while ${isEditMode ? "updating" : "creating"} the category`,
      "error",
    );
  }
};

const onFilesSelected = (event: Event) => {
  const target = event.target as HTMLInputElement;
  if (!target.files?.length) {
    return;
  }
  selectedFiles.value = [...selectedFiles.value, ...Array.from(target.files)];
  if (fileInput.value) {
    fileInput.value.value = "";
  }
};

const removeSelectedFile = (index: number) => {
  selectedFiles.value.splice(index, 1);
};

const removeExistingFile = (index: number) => {
  existingFileKeys.value.splice(index, 1);
};

const cancel = () => {
  router.push("/resources/categories");
};
</script>
