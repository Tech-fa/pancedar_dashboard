<template>
    <div class="flex items-center space-x-2">
      <div 
        class="bg-neutral-200 rounded-full transition-all duration-300 ease-in-out"
        :class="[`h-${height}`, `w-${width}`]"
      >
        <div 
          class="h-full rounded-full transition-all duration-300 ease-in-out"
          :class="[`bg-${color}`]"
          :style="{ width: `${percentage}%` }"
        ></div>
      </div>
      <span 
        v-if="showValue"
        class="text-sm text-neutral-900"
        :class="[`w-${valueWidth}`]"
      >
        {{ displayValue }}
      </span>
    </div>
  </template>
  
  <script setup lang="ts">
  import { computed } from 'vue'
  
  interface Props {
    percentage: number
    value?: string | number
    color?: 'neutral-300' | 'neutral-400' | 'neutral-500' | 'neutral-700' | 'neutral-900' | 'blue-500' | 'green-500' | 'red-500' | 'yellow-500'
    height?: '1' | '2' | '3' | '4' | '5'
    width?: '16' | '24' | '32' | '40' | '48' | '56' | '64'
    valueWidth?: '8' | '12' | '16' | '20' | '24'
    showValue?: boolean
    formatValue?: (value: string | number) => string
  }
  
  const props = withDefaults(defineProps<Props>(), {
    percentage: 0,
    color: 'neutral-900',
    height: '2',
    width: '32',
    valueWidth: '12',
    showValue: true,
    formatValue: (value: string | number) => String(value)
  })
  
  const displayValue = computed(() => {
    if (props.value !== undefined) {
      return props.formatValue(props.value)
    }
    return `${props.percentage}%`
  })
  </script> 