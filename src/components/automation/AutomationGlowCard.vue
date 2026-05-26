<template>
    <component
        :is="tag"
        v-bind="rootAttrs"
        class="automation-glow-card"
        :class="{ 'automation-glow-card--static': !interactive }"
    >
        <div class="automation-glow-card__border" aria-hidden="true" />
        <div class="automation-glow-card__content">
            <slot />
        </div>
    </component>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(
    defineProps<{
        tag?: string
        href?: string
        target?: string
        interactive?: boolean
    }>(),
    {
        tag: 'article',
        interactive: true,
    },
)

const rootAttrs = computed(() => {
    const attrs: Record<string, string> = {}
    if (props.href) {
        attrs.href = props.href
    }
    if (props.target) {
        attrs.target = props.target
    }
    return attrs
})
</script>
