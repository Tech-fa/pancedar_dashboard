<template>
  <div class="history-view w-full">
    <div v-if="loading && !historyItems.length" class="loading">
      <span>Loading history...</span>
    </div>
    <div v-else-if="error && !historyItems.length" class="error">
      <span>{{ error }}</span>
    </div>
    <div v-else-if="!historyItems.length" class="no-history">
      <span>No history records found</span>
    </div>
    <div v-else>
      <div class="history-controls">
        <button @click="expandAllItems" class="control-button" :disabled="allExpanded">
          <i class="fa-solid fa-expand"></i> Expand All
        </button>
        <button @click="collapseAllItems" class="control-button" :disabled="allCollapsed">
          <i class="fa-solid fa-compress"></i> Collapse All
        </button>
      </div>
      
      <div class="history-timeline">
        <div v-for="item in historyItems" :key="item.id" class="history-item">
          <div class="history-header" @click="toggleItem(item.id)">
            <div class="header-left">
              <div class="expand-icon">
                <i :class="expandedItems.has(item.id) ? 'fa-solid fa-chevron-down' : 'fa-solid fa-chevron-right'"></i>
              </div>
              <div class="history-action" :class="actionClass(item.action)">{{ item.action }}</div>
            </div>
            <div class="history-meta">
              <span class="history-date">{{ formatDate(item.createdAt) }}</span>
              <span class="history-user">by {{ item.user?.name || item.user?.fname + ' ' + item.user?.lname || 'Unknown' }}</span>
            </div>
          </div>
          
          <div class="history-changes" v-if="expandedItems.has(item.id)">
            <div class="changes-summary">
              <span class="field-count">{{ Object.keys(item.changes).length }} changed field(s)</span>
            </div>
            <div v-for="(change, field) in item.changes" :key="field" class="field-change">
              <div class="field-name">{{ formatFieldName(field) }}</div>
              <div class="change-details">
                <div v-if="item.action === 'CREATE'" class="new-value">
                  <span class="value-label">Initial value:</span>
                  <span class="value">{{ formatValue(change.newValue) }}</span>
                </div>
                <div v-else-if="item.action === 'DELETE'" class="old-value">
                  <span class="value-label">Final value:</span>
                  <span class="value">{{ formatValue(change.oldValue) }}</span>
                </div>
                <template v-else>
                  <div class="old-value">
                    <span class="value-label">From:</span>
                    <span class="value">{{ formatValue(change.oldValue) }}</span>
                  </div>
                  <div class="new-value">
                    <span class="value-label">To:</span>
                    <span class="value">{{ formatValue(change.newValue) }}</span>
                  </div>
                </template>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Pagination controls -->
        <div class="pagination-controls">
          <div class="pagination-info">
            Showing {{ historyItems.length }} of {{ historyData.totalCount }} history records
          </div>
          
          <div class="pagination-buttons">
            <button 
              class="pagination-btn"
              :disabled="currentPage <= 1"
              @click="handlePreviousPage"
            >
              <i class="fa-solid fa-chevron-left"></i> Previous
            </button>
            
            <div class="pagination-pages">
              <button 
                v-for="page in displayedPages" 
                :key="page" 
                class="page-number" 
                :class="{ active: page === currentPage }"
                @click="setPage(page)"
              >
                {{ page }}
              </button>
            </div>
            
            <button 
              class="pagination-btn"
              :disabled="currentPage >= totalPages"
              @click="handleNextPage"
            >
              Next <i class="fa-solid fa-chevron-right"></i>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, computed } from 'vue';
import { apiGet } from '@/util/api';
import { useAuthStore } from '@/stores/auth';
import { formatDateToDay, snakeToCamelCase } from '@/util/util';

interface HistoryChange {
  oldValue: any;
  newValue: any;
}

interface HistoryItem {
  id: number;
  entityType: string;
  entityId: string;
  changes: Record<string, HistoryChange>;
  action: string;
  createdAt: number;
  user: {
    id: string;
    name?: string;
    fname?: string;
    lname?: string;
  };
}

interface PaginatedResponse {
  data: HistoryItem[];
  currentPage: number;
  totalCount: number;
  perPage: number;
}

const props = defineProps({
  entityType: {
    type: String,
    required: true
  },
  entityId: {
    type: String,
    required: true
  },
  perPageOptions: {
    type: Array as () => number[],
    default: () => [10, 25, 50, 100]
  },
  defaultExpanded: {
    type: Boolean,
    default: true
  },
  refreshTrigger: {
    type: [String, Number, Boolean],
    default: null
  }
});

// Get auth store for API calls
const authStore = useAuthStore();

// State
const historyData = ref<PaginatedResponse>({
  data: [],
  currentPage: 1,
  totalCount: 0,
  perPage: 5
});
const historyItems = computed(() => historyData.value.data);
const loading = ref(true);
const error = ref<string | null>(null);
const currentPage = ref(1);
const perPage = ref(5);
const expandedItems = ref<Set<number>>(new Set());

// Computed
const totalPages = computed(() => Math.ceil(historyData.value.totalCount / perPage.value));
const allExpanded = computed(() => {
  return historyItems.value.length > 0 && 
         historyItems.value.every(item => expandedItems.value.has(item.id));
});
const allCollapsed = computed(() => expandedItems.value.size === 0);

const displayedPages = computed(() => {
  const pages = [];
  const maxPagesToShow = 5;
  
  if (totalPages.value <= maxPagesToShow) {
    // Show all pages if there are fewer than maxPagesToShow
    for (let i = 1; i <= totalPages.value; i++) {
      pages.push(i);
    }
  } else {
    // Always show page 1
    pages.push(1);
    
    // Calculate the range of pages to show around current page
    let startPage = Math.max(2, currentPage.value - 1);
    let endPage = Math.min(totalPages.value - 1, currentPage.value + 1);
    
    // If we're at the beginning, show more pages after
    if (currentPage.value <= 2) {
      endPage = Math.min(totalPages.value - 1, 4);
    }
    
    // If we're at the end, show more pages before
    if (currentPage.value >= totalPages.value - 1) {
      startPage = Math.max(2, totalPages.value - 3);
    }
    
    // Add ellipsis if needed
    if (startPage > 2) {
      pages.push('...');
    }
    
    // Add the range of pages
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    
    // Add ellipsis if needed
    if (endPage < totalPages.value - 1) {
      pages.push('...');
    }
    
    // Always show the last page
    if (totalPages.value > 1) {
      pages.push(totalPages.value);
    }
  }
  
  return pages;
});

// Methods
const toggleItem = (itemId: number) => {
  if (expandedItems.value.has(itemId)) {
    expandedItems.value.delete(itemId);
  } else {
    expandedItems.value.add(itemId);
  }
};

const expandAllItems = () => {
  expandedItems.value = new Set(historyItems.value.map(item => item.id));
};

const collapseAllItems = () => {
  expandedItems.value.clear();
};

const fetchHistory = async () => {
  if (!props.entityId || !props.entityType) return;
  
  loading.value = true;
  error.value = null;
  
  try {
    const response = await apiGet<PaginatedResponse>(
      `/histories/${props.entityType}/${props.entityId}?page=${currentPage.value}&perPage=${perPage.value}`,
      authStore
    );
    
    historyData.value = response;
    
    // Set initial expanded state for new items
    if (props.defaultExpanded) {
      response.data.forEach(item => {
        expandedItems.value.add(item.id);
      });
    }
  } catch (err) {
    console.error('Error fetching history:', err);
    error.value = 'Failed to load history records';
    historyData.value = {
      data: [],
      currentPage: 1,
      totalCount: 0,
      perPage: perPage.value
    };
  } finally {
    loading.value = false;
  }
};

const handleNextPage = () => {
  if (currentPage.value < totalPages.value) {
    currentPage.value++;
  }
};

const handlePreviousPage = () => {
  if (currentPage.value > 1) {
    currentPage.value--;
  }
};

const setPage = (page: number | string) => {
  if (typeof page === 'number') {
    currentPage.value = page;
  }
};

const formatDate = (timestamp: number) => {
  if (!timestamp) return 'Unknown date';
  const date = new Date(Number(timestamp));
  return date.toLocaleString();
};

const formatFieldName = (field: string) => {
  // Convert camelCase to Title Case with spaces
  return field
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, (str) => str.toUpperCase());
};

const formatValue = (value: any) => {
  if (value === null || value === undefined) return 'None';
  if (typeof value === 'object') {
    try {
      return JSON.stringify(value, null, 2);
    } catch (e) {
      return String(value);
    }
  }
  if (formatDateToDay(value) !== 'Invalid DateTime') {
    return formatDateToDay(value)
  }
  return snakeToCamelCase(String(value));
};

const actionClass = (action: string) => {
  return {
    'CREATE': 'action-create',
    'UPDATE': 'action-update',
    'DELETE': 'action-delete'
  }[action] || '';
};

// Watch for changes
watch(() => props.entityId, () => {
  currentPage.value = 1;
  fetchHistory();
});

watch(() => props.entityType, () => {
  currentPage.value = 1;
  fetchHistory();
});

watch(() => currentPage.value, () => {
  fetchHistory();
});

watch(() => perPage.value, () => {
  currentPage.value = 1;
  fetchHistory();
});

watch(() => props.refreshTrigger, () => {
  if (props.refreshTrigger !== null) {
    fetchHistory();
  }
});

// Initialize
onMounted(fetchHistory);
</script>

<style scoped>
.history-view {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
  color: #333;
  margin: 0 auto;
}

.loading, .error, .no-history {
  padding: 20px;
  text-align: center;
  background: #f9f9f9;
  border-radius: 4px;
  margin: 10px 0;
}

.error {
  color: #d32f2f;
  background-color: #ffebee;
}

.history-controls {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 16px;
  gap: 8px;
}

.control-button {
  padding: 6px 12px;
  background-color: #f5f5f5;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  font-size: 14px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
}

.control-button:hover:not(:disabled) {
  background-color: #eeeeee;
}

.control-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.history-timeline {
  border-left: 2px solid #e0e0e0;
  padding-left: 20px;
  margin-left: 10px;
}

.history-item {
  position: relative;
  margin-bottom: 25px;
  background: #fff;
  border-radius: 6px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24);
}

.history-item:before {
  content: '';
  position: absolute;
  left: -26px;
  top: 25px;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: #e0e0e0;
}

.history-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px;
  cursor: pointer;
  border-bottom: 1px solid transparent;
  transition: background-color 0.2s;
  border-radius: 6px;
}

.history-header:hover {
  background-color: #f9f9f9;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.expand-icon {
  width: 16px;
  display: flex;
  justify-content: center;
  color: #757575;
  transition: transform 0.2s;
}

.history-action {
  font-weight: bold;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  text-transform: uppercase;
}

.action-create {
  background-color: #e8f5e9;
  color: #2e7d32;
}

.action-update {
  background-color: #e3f2fd;
  color: #1565c0;
}

.action-delete {
  background-color: #ffebee;
  color: #c62828;
}

.history-meta {
  font-size: 12px;
  color: #757575;
  display: flex;
  align-items: center;
  gap: 12px;
}

.history-date {
  white-space: nowrap;
}

.history-changes {
  padding: 0 15px 15px;
  overflow: hidden;
  transition: max-height 0.3s ease;
}

.changes-summary {
  margin: 8px 0 16px;
  padding-bottom: 8px;
  border-bottom: 1px dashed #eee;
  color: #757575;
  font-size: 14px;
}

.field-change {
  margin-bottom: 12px;
  padding-bottom: 12px;
  border-bottom: 1px dashed #eee;
}

.field-change:last-child {
  border-bottom: none;
  margin-bottom: 0;
  padding-bottom: 0;
}

.field-name {
  font-weight: 600;
  margin-bottom: 6px;
  color: #546e7a;
}

.change-details {
  padding-left: 10px;
  font-size: 14px;
}

.old-value, .new-value {
  display: flex;
  margin: 4px 0;
}

.value-label {
  width: 70px;
  color: #757575;
  font-weight: 500;
}

.value {
  flex: 1;
  word-break: break-all;
}

/* Pagination styles */
.pagination-controls {
  margin-top: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

.pagination-info {
  font-size: 14px;
  color: #616161;
}

.pagination-buttons {
  display: flex;
  align-items: center;
  gap: 8px;
}

.pagination-btn {
  background-color: #f5f5f5;
  border: 1px solid #e0e0e0;
  color: #616161;
  padding: 6px 12px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 4px;
}

.pagination-btn:hover:not(:disabled) {
  background-color: #eeeeee;
  border-color: #bdbdbd;
}

.pagination-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.pagination-pages {
  display: flex;
  gap: 4px;
}

.page-number {
  min-width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  font-size: 14px;
  background-color: #f5f5f5;
  border: 1px solid #e0e0e0;
  cursor: pointer;
}

.page-number.active {
  background-color: #1976d2;
  color: white;
  border-color: #1976d2;
}

.page-number:hover:not(.active) {
  background-color: #eeeeee;
}
</style>