<template>
    <div class="bg-white rounded-xl shadow-lg p-6">
      <div class="flex justify-between items-center mb-4">
        <h2 class="text-xl font-bold text-gray-800">Pending Documents</h2>
        <router-link 
          to="/Documentation/PendingDocuments"
          class="text-blue-600 hover:text-blue-800 text-sm font-medium"
        >
          View All →
        </router-link>
      </div>
  
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead>
            <tr>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Document Name</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200">
            <tr v-for="(doc, index) in documents" :key="index">
              <td class="px-4 py-2 text-sm text-gray-900">{{ doc.name }}</td>
              <td class="px-4 py-2 text-sm text-gray-500">
                <button 
                  @click="handleDocumentAction(doc.id)"
                  class="text-blue-600 hover:text-blue-900 mr-2"
                >
                  Review
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </template>
  
  <script setup>
  defineProps({
    documents: {
      type: Array,
      default: () => []
    }
  })
  
  const emit = defineEmits(['document-action'])
  
  const handleDocumentAction = (docId) => {
    emit('document-action', docId)
  }
  </script>