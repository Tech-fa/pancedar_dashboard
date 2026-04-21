<template>
  <div id="root" class="min-h-screen bg-main">
    <BreadCrums :crumbs="[
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
    ]" />

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
          <AppInputForm test-id="category-name" name="name" label="Category Name" placeholder="Enter category name"
            :value="initialValues.name" :rules="(v: any) =>
              !exists(v)
                ? 'Category name is required'
                : v.length > 255
                  ? 'Category name must be 255 characters or less'
                  : true
              " :required="true" />



          <AppTextareaForm name="resourceText" label="Resource Text"
            placeholder="Add text that helps define this category" :value="initialValues.resourceText" />

          <div>
            <label class="block text-sm text-opposite mb-2">Resource Links</label>
            <div class="space-y-2">
              <div v-for="(_, index) in linksInputs" :key="`resource-link-${index}`">
                <div class="flex items-center gap-2">
                  <input v-model="linksInputs[index]" type="text" placeholder="https://example.com/resource"
                    class="w-full rounded-md border px-3 py-2 bg-main text-opposite"
                    :class="linkErrors[index] ? 'border-red-500' : 'border-neutral-300'" />
                  <button v-if="linksInputs.length > 1" type="button"
                    class="px-2 py-1 text-xs rounded-md border border-neutral-300 hover:bg-main"
                    @click="removeLinkInput(index)">
                    Remove
                  </button>
                </div>
                <p v-if="linkErrors[index]" class="text-xs text-red-500 mt-1">{{ linkErrors[index] }}</p>
              </div>
            </div>
            <button type="button" class="mt-2 px-2 py-1 text-xs rounded-md border border-neutral-300 hover:bg-main"
              @click="addLinkInput">
              + Add Link
            </button>
          </div>

          <div>
            <label class="block text-sm text-opposite mb-2">Resource Files</label>
            <MultiFileUploader v-model="selectedFiles" :files="existingFileKeys" input-id="category-resource-files"
              accept=".pdf,.doc,.docx,.xls,.xlsx,.txt" @update:removedFiles="onRemovedFilesUpdated" />
          </div>

          <div class="p-6 border-t flex items-center justify-end gap-4">
            <AppButton test-id="cancel-category-button" buttonStyle="secondary" type="button" @click="cancel">
              Cancel
            </AppButton>
            <AppButton test-id="save-category-button" buttonStyle="primary" type="submit" :loading="isSubmitting">
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
import MultiFileUploader from "@/components/MultiFileUploader.vue";

const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();
const isSubmitting = ref(false);
const toast = useToast();
const categoryId = route.params.categoryId as string | undefined;
const isEditMode = !!categoryId;
const loaded = ref(false);
const selectedFiles = ref<File[]>([]);
const existingResourceId = ref<string | undefined>(undefined);
const existingFileKeys = ref<string[]>([]);
const removedExistingFiles = ref<string[]>([]);
const linksInputs = ref<string[]>([""]);
const linkErrors = ref<string[]>([""]);
const initialValues = ref<{
  name: string;
  description: string;
  resourceText: string;
}>({
  name: "",
  description: "",
  resourceText: "",
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
      resourceText: response.resource?.textResource || "",
    };
    existingResourceId.value = response.resource?.id;
    existingFileKeys.value = [...(response.resource?.files || [])];
    linksInputs.value = response.resource?.links?.length
      ? [...response.resource.links]
      : [""];
    linkErrors.value = linksInputs.value.map(() => "");
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
  if (!validateLinks()) {
    toast.showToast("Invalid links", "Please fix invalid resource link URLs.", "error");
    return;
  }

  isSubmitting.value = true;
  const formData = new FormData();
  formData.append("name", values.name);
  formData.append("description", values.description || "");

  const parsedLinks = linksInputs.value
    .map((link) => link.trim())
    .filter((link) => !!link);

  const activeExistingFileKeys = existingFileKeys.value.filter(
    (key) => !removedExistingFiles.value.includes(key),
  );

  const resource =
  {
    ...(existingResourceId.value ? { id: existingResourceId.value } : {}),
    textResource: values.resourceText || null,
    links: parsedLinks,
    files: activeExistingFileKeys,
  };
  formData.append("resource", JSON.stringify(resource));
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

const isValidUrl = (url: string) => {
  try {
    const parsed = new URL(url);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
};

const validateLinks = () => {
  linkErrors.value = linksInputs.value.map((link) => {
    const trimmed = link.trim();
    if (!trimmed) {
      return "";
    }
    return isValidUrl(trimmed) ? "" : "Please enter a valid URL (http/https).";
  });
  return !linkErrors.value.some((error) => !!error);
};

const addLinkInput = () => {
  linksInputs.value.push("");
  linkErrors.value.push("");
};

const removeLinkInput = (index: number) => {
  if (linksInputs.value.length === 1) {
    linksInputs.value[0] = "";
    linkErrors.value[0] = "";
    return;
  }
  linksInputs.value.splice(index, 1);
  linkErrors.value.splice(index, 1);
};

const onRemovedFilesUpdated = (removedFiles: string[]) => {
  removedExistingFiles.value = [...removedFiles];
};

const cancel = () => {
  router.push("/resources/categories");
};
</script>
