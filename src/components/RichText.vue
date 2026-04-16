<template>
    <div class="rich-text">
        <div ref="editorContainer" class="quill-editor" :test-id="testId"></div>
    </div>
</template>

<script setup lang="ts">
import Quill from 'quill'
import 'quill/dist/quill.snow.css'
import { ref, onMounted, onBeforeUnmount } from 'vue'

const editorContainer = ref<HTMLDivElement>()

const props = defineProps<{
    placeholder?: string
    readOnly?: boolean
    testId?: string
}>()
const model = defineModel<any>()

const quillEditor = ref<Quill>()

const updateContent = () => {
    const content = quillEditor.value?.root.innerHTML
    model.value = content || ''
}
onMounted(() => {
    if (editorContainer.value) {
        quillEditor.value = new Quill(editorContainer.value, {
            theme: props.readOnly ? 'bubble' : 'snow',
            modules: props.readOnly
                ? {}
                : {
                      toolbar: [
                          [{ font: [] }, { size: [] }],
                          ['bold', 'italic', 'underline', 'strike'],
                          [{ color: [] }, { background: [] }],
                          [{ script: 'super' }, { script: 'sub' }],
                          [{ header: '1' }, { header: '2' }, 'blockquote', 'code-block'],
                    [{ list: 'ordered' }, { list: 'bullet' }, { indent: '-1' }, { indent: '+1' }],
                    ['direction', { align: [] }],
                    ['link', 'image', 'video', 'formula'],
                    ['clean']
                ]
            },
            placeholder: props.readOnly ? '' : props.placeholder || 'Add template here ...',
            readOnly: !!props.readOnly
        })

        if (model.value) {
            try {
                const parsedContent = JSON.parse(model.value)
                quillEditor.value.root.innerHTML = parsedContent
            } catch (e) {
                quillEditor.value.root.innerHTML =
                    model.value || ''
            }
        }

        quillEditor.value.on('text-change', updateContent)
    }
})

onBeforeUnmount(() => {
    quillEditor.value?.off('text-change', updateContent)
})
</script>
