<template>
    <button
        v-if="!props.href"
        v-bind="$attrs"
        :class="classes"
        :disabled="props.loading || ($attrs.disabled as boolean)"
        @click="handleClick"
    >
        <Spinner v-if="props.loading" />
        <slot v-else></slot>
    </button>
    <template v-else>
        <span @click="router.push(props.href)" v-bind="$attrs" :class="classes">
            <slot></slot>
        </span>
    </template>
</template>
<script setup lang="ts">
import Spinner from './Spinner.vue'
import { useRouter } from 'vue-router'
import { computed } from 'vue'
import { useDialog } from '@/stores/dialog'
import ConfirmDialog from './ConfirmDialog.vue'
import { apiGet } from '@/util/api'
import { useAuthStore } from '@/stores/auth'
import { useToast } from '@/stores/notification'
const toast = useToast()
const authStore = useAuthStore()
const router = useRouter()
const props = defineProps<{
    buttonStyle:
        | 'primary'
        | 'secondary'
        | 'danger'
        | 'success'
        | 'warning'
        | 'info'
        | 'neutral'
        | 'void'
    loading?: boolean
    href?: string
    fullWidth?: boolean
    warnBefore?: string
    download?: string
}>()
const emit = defineEmits(['click'])

const classes = computed(() => {
    return [
        props.buttonStyle !== 'void'
            ? `px-4 py-1  ${props.fullWidth ? 'w-full' : ''} rounded-lg flex items-center justify-center cursor-pointer lg:text-base text-xs`
            : '',
        props.buttonStyle == 'primary' ? 'bg-main text-opposite' : '',
        props.buttonStyle == 'secondary' ? 'bg-secondary text-opposite' : '',
        props.buttonStyle == 'danger' ? 'bg-red-500 text-white' : '',
        props.buttonStyle == 'success' ? 'bg-green-500 text-white' : '',
        props.buttonStyle == 'warning' ? 'bg-yellow-500 text-black' : '',
        props.buttonStyle == 'info' ? 'bg-blue-500' : '',
        props.buttonStyle == 'neutral' ? 'bg-white text-black' : ''
    ]
})

const handleClick = async () => {
    if (props.warnBefore) {
        useDialog().openDialog(ConfirmDialog, {
            message: props.warnBefore,
            onConfirm: async () => {
                await emit('click')
                useDialog().closeDialog()
            },
            onCancel: () => {
                useDialog().closeDialog()
            }
        })
    } else if (props.download) {
        downloadFile()
    } else {
        await emit('click')
    }
}

const downloadFile = async () => {
    try {
        const response = await apiGet<string>(
            `/files/${encodeURIComponent(props?.download || '')}`,
            authStore
        )

        const link = document.createElement('a')
        link.href = response
        link.download = props?.download || 'file'
        link.target = '_blank'
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
    } catch (error) {
        console.error('Error downloading document:', error)
        toast.showToast('Error', 'Failed to download file', 'error')
    }
}
</script>
