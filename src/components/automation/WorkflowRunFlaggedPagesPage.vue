<template>
    <div class="bg-secondary min-h-screen">
        <BreadCrums :crumbs="crumbs" />

        <div class="px-6 pb-6 pt-4">
            <div class="max-w-7xl mx-auto space-y-4">
                <div class="flex items-center justify-between gap-3">
                    <div>
                        <h3 class="text-lg font-medium text-opposite">Flagged pages</h3>
                        <p class="text-sm text-opposite/60">
                            Keyword matches from this Google Business scrape run.
                            Run ID: <span class="font-mono">{{ runId }}</span>
                        </p>
                    </div>
                    <AppButton buttonStyle="secondary" type="button" @click="goBack">
                        Back
                    </AppButton>
                </div>

                <div v-if="loading" class="flex items-center justify-center py-12">
                    <Spinner width="3" height="3" />
                </div>

                <div v-else-if="totalPageCount === 0"
                    class="text-center py-12 text-opposite/50 bg-main rounded-lg border border-gray-800">
                    No flagged pages were recorded for this run.
                </div>

                <div v-else class="space-y-4">
                    <div v-if="allKeywords.length > 0 || groupsWithOutreachCount > 0 || groupsWithLinkedinCompanyCount > 0"
                        class="bg-main rounded-lg border border-gray-800 p-4 space-y-3">
                        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                            <div class="text-xs uppercase text-opposite/50 tracking-wide">
                                Filters
                                <span v-if="hasActiveFilters" class="normal-case text-opposite/70">
                                    ({{ filteredPageCount }} of {{ totalPageCount }})
                                </span>
                            </div>
                            <button v-if="hasActiveFilters" type="button"
                                class="text-xs text-blue-400 hover:text-blue-300 shrink-0"
                                @click="clearFilters">
                                Clear filters
                            </button>
                        </div>
                        <div v-if="groupsWithOutreachCount > 0 || groupsWithLinkedinCompanyCount > 0"
                            class="flex flex-wrap gap-2">
                            <button v-if="groupsWithLinkedinCompanyCount > 0" type="button"
                                class="text-xs px-2 py-1 rounded border transition-colors"
                                :class="onlyWithLinkedinCompany
                                    ? 'border-sky-600 text-sky-800 bg-sky-500/25'
                                    : 'border-gray-700 text-opposite/70 bg-secondary hover:border-gray-600'"
                                @click="onlyWithLinkedinCompany = !onlyWithLinkedinCompany">
                                Has LinkedIn company ({{ groupsWithLinkedinCompanyCount }})
                            </button>
                            <button v-if="groupsWithOutreachCount > 0" type="button"
                                class="text-xs px-2 py-1 rounded border transition-colors"
                                :class="onlyWithLinkedinOutreachSummary
                                    ? 'border-sky-600 text-sky-800 bg-sky-500/25'
                                    : 'border-gray-700 text-opposite/70 bg-secondary hover:border-gray-600'"
                                @click="onlyWithLinkedinOutreachSummary = !onlyWithLinkedinOutreachSummary">
                                Has outreach message ({{ groupsWithOutreachCount }})
                            </button>
                        </div>
                        <div v-if="allKeywords.length > 0" class="space-y-2">
                            <div class="text-xs uppercase text-opposite/50 tracking-wide">Keywords</div>
                            <div class="flex flex-wrap gap-2">
                                <button v-for="kw in allKeywords" :key="kw" type="button"
                                    class="text-xs px-2 py-1 rounded border transition-colors"
                                    :class="isKeywordSelected(kw)
                                        ? 'border-amber-600 text-amber-800 bg-amber-500/25'
                                        : 'border-gray-700 text-opposite/70 bg-secondary hover:border-gray-600'"
                                    @click="toggleKeyword(kw)">
                                    {{ kw }}
                                </button>
                            </div>
                        </div>
                    </div>

                    <div v-if="filteredPageCount === 0"
                        class="text-center py-12 text-opposite/50 bg-main rounded-lg border border-gray-800">
                        No flagged pages match the selected filters.
                    </div>

                    <div v-for="(group, gIdx) in filteredGroups"
                        :key="pagesUnderRootKey(group, gIdx)"
                        class="bg-main rounded-lg border border-gray-800 overflow-hidden">
                        <div class="p-4 space-y-3">
                            <div v-if="group.websiteUrl" class="space-y-3">
                                <div class="space-y-1">
                                    <div class="text-xs uppercase text-opposite/50 tracking-wide">Website root</div>
                                    <a :href="group.websiteUrl" target="_blank" rel="noopener noreferrer"
                                        class="text-sm text-blue-400/90 hover:underline break-all">
                                        {{ group.websiteUrl }}
                                    </a>
                                </div>
                                <div v-if="group.googleMapsSearchUrl" class="space-y-1">
                                    <div class="text-xs uppercase text-opposite/50 tracking-wide">Maps search</div>
                                    <a :href="group.googleMapsSearchUrl" target="_blank"
                                        rel="noopener noreferrer"
                                        class="text-sm text-blue-400/90 hover:underline break-all">
                                        {{ group.googleMapsSearchUrl }}
                                    </a>
                                </div>
                                <div v-if="group.phones?.length"
                                    class="text-sm text-opposite/70">
                                    <span class="text-xs uppercase text-opposite/50 tracking-wide block mb-1">Phones</span>
                                    <span>{{ group.phones.join(', ') }}</span>
                                </div>
                                <div v-if="group.emails?.length"
                                    class="text-sm text-opposite/70">
                                    <span class="text-xs uppercase text-opposite/50 tracking-wide block mb-1">Emails</span>
                                    <span>{{ group.emails.join(', ') }}</span>
                                </div>
                                <div v-if="group.linkedinUrl" class="space-y-1">
                                    <div class="text-xs uppercase text-opposite/50 tracking-wide">LinkedIn company</div>
                                    <a :href="group.linkedinUrl" target="_blank" rel="noopener noreferrer"
                                        class="text-sm text-blue-400/90 hover:underline break-all">
                                        {{ group.linkedinUrl }}
                                    </a>
                                </div>
                                <div v-if="group.linkedinContactProfileUrl" class="space-y-1">
                                    <div class="text-xs uppercase text-opposite/50 tracking-wide">LinkedIn contact</div>
                                    <a :href="group.linkedinContactProfileUrl" target="_blank"
                                        rel="noopener noreferrer"
                                        class="text-sm text-blue-400/90 hover:underline break-all">
                                        {{ group.linkedinContactProfileUrl }}
                                    </a>
                                </div>
                                <div v-if="group.linkedinOutreachSummary" class="space-y-1">
                                    <div class="text-xs uppercase text-opposite/50 tracking-wide">Outreach message</div>
                                    <pre
                                        class="text-sm text-opposite/90 bg-secondary border border-gray-800 rounded p-3 overflow-x-auto whitespace-pre-wrap">{{
                                            group.linkedinOutreachSummary }}</pre>
                                </div>
                            </div>

                            <div v-else class="space-y-1">
                                <div class="text-xs uppercase text-opposite/50 tracking-wide">Legacy group</div>
                                <p class="text-sm text-opposite/60">
                                    Root URL was not stored for this run; website links appear on each page below.
                                </p>
                            </div>
                        </div>

                        <div class="border-t border-gray-800">
                            <button type="button"
                                class="w-full flex items-center justify-between gap-3 px-4 py-3 text-left text-sm text-opposite/90 hover:bg-secondary/40 transition-colors"
                                :aria-expanded="isPagesUnderRootExpanded(group, gIdx)"
                                @click="togglePagesUnderRoot(group, gIdx)">
                                <span>
                                    Pages under root
                                    <span class="text-opposite/50 font-normal">
                                        ({{ group.pages.length }})
                                    </span>
                                </span>
                                <i class="fa-solid fa-chevron-down text-opposite/50 transition-transform duration-200 shrink-0"
                                    :class="{ '-rotate-90': !isPagesUnderRootExpanded(group, gIdx) }"
                                    aria-hidden="true" />
                            </button>

                            <div v-show="isPagesUnderRootExpanded(group, gIdx)"
                                class="px-4 pb-4 pt-1 space-y-4 border-t border-gray-800/80 bg-secondary/20">
                                <div v-for="row in group.pages" :key="row.id"
                                    class="rounded-lg border border-gray-800 bg-main p-4 space-y-3">
                                    <div class="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                                        <div class="space-y-1 min-w-0">
                                            <div class="text-xs uppercase text-opposite/50 tracking-wide">Page</div>
                                            <a :href="row.pageUrl" target="_blank" rel="noopener noreferrer"
                                                class="text-sm text-blue-400 hover:underline break-all">
                                                {{ row.pageUrl }}
                                            </a>
                                        </div>
                                        <div class="text-sm text-opposite/70 shrink-0">
                                            {{ formatDateToTime(row.createdAt) }}
                                        </div>
                                    </div>

                                    <div v-if="!group.websiteUrl" class="space-y-1">
                                        <div class="text-xs uppercase text-opposite/50 tracking-wide">Website root</div>
                                        <a :href="row.websiteUrl" target="_blank" rel="noopener noreferrer"
                                            class="text-sm text-blue-400/90 hover:underline break-all">
                                            {{ row.websiteUrl }}
                                        </a>
                                    </div>

                                    <div v-if="!group.websiteUrl && row.googleMapsSearchUrl" class="space-y-1">
                                        <div class="text-xs uppercase text-opposite/50 tracking-wide">Maps search</div>
                                        <a :href="row.googleMapsSearchUrl" target="_blank" rel="noopener noreferrer"
                                            class="text-sm text-blue-400/90 hover:underline break-all">
                                            {{ row.googleMapsSearchUrl }}
                                        </a>
                                    </div>

                                    <div>
                                        <div class="text-xs uppercase text-opposite/50 tracking-wide mb-2">Matched keywords
                                        </div>
                                        <div class="flex flex-wrap gap-2">
                                            <span v-for="kw in row.matchedKeywords" :key="kw"
                                                class="text-xs px-2 py-1 rounded border"
                                                :class="isKeywordSelected(kw)
                                                    ? 'border-amber-600 text-amber-800 bg-amber-500/25'
                                                    : 'border-amber-800/40 text-amber-500 bg-amber-500/10'">
                                                {{ kw }}
                                            </span>
                                        </div>
                                    </div>

                                    <div v-if="row.textSnippet" class="space-y-1">
                                        <div class="text-xs uppercase text-opposite/50 tracking-wide">Snippet</div>
                                        <pre
                                            class="text-sm text-opposite/90 bg-secondary border border-gray-800 rounded p-3 overflow-x-auto whitespace-pre-wrap">{{
                                                row.textSnippet }}</pre>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import BreadCrums from '@/components/breadCrums.vue'
import AppButton from '@/components/AppButton.vue'
import Spinner from '@/components/Spinner.vue'
import { useAuthStore } from '@/stores/auth'
import { useToast } from '@/stores/notification'
import {
    getGoogleFlaggedPages,
    type GoogleFlaggedPagesGroup,
} from '@/components/automation/endpoints'
import { formatDateToTime } from '@/util/util'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const toast = useToast()

const runId = computed(() => route.params.runId as string)

const loading = ref(false)
const groups = ref<GoogleFlaggedPagesGroup[]>([])
const selectedKeywords = ref<string[]>([])
const onlyWithLinkedinOutreachSummary = ref(false)
const onlyWithLinkedinCompany = ref(false)
/** Group keys (see `pagesUnderRootKey`) with collapsed page lists; omitted keys are expanded. */
const collapsedPagesUnderRootKeys = ref<Set<string>>(new Set())

function pagesUnderRootKey(group: GoogleFlaggedPagesGroup, gIdx: number): string {
    return group.websiteUrl ?? `legacy-${gIdx}`
}

function isPagesUnderRootExpanded(group: GoogleFlaggedPagesGroup, gIdx: number): boolean {
    return !collapsedPagesUnderRootKeys.value.has(pagesUnderRootKey(group, gIdx))
}

function togglePagesUnderRoot(group: GoogleFlaggedPagesGroup, gIdx: number): void {
    const key = pagesUnderRootKey(group, gIdx)
    const next = new Set(collapsedPagesUnderRootKeys.value)
    if (next.has(key)) {
        next.delete(key)
    } else {
        next.add(key)
    }
    collapsedPagesUnderRootKeys.value = next
}

const totalPageCount = computed(() =>
    groups.value.reduce((n, g) => n + g.pages.length, 0),
)

const allKeywords = computed(() => {
    const keywords = new Set<string>()
    for (const group of groups.value) {
        for (const page of group.pages) {
            for (const kw of page.matchedKeywords) {
                keywords.add(kw)
            }
        }
    }
    return [...keywords].sort((a, b) => a.localeCompare(b))
})

const groupsWithOutreachCount = computed(() =>
    groups.value.filter((g) => !!g.linkedinOutreachSummary).length,
)

const groupsWithLinkedinCompanyCount = computed(() =>
    groups.value.filter((g) => !!g.linkedinUrl).length,
)

const hasActiveFilters = computed(() =>
    selectedKeywords.value.length > 0
    || onlyWithLinkedinOutreachSummary.value
    || onlyWithLinkedinCompany.value,
)

const filteredGroups = computed((): GoogleFlaggedPagesGroup[] => {
    let result = groups.value

    if (onlyWithLinkedinCompany.value) {
        result = result.filter((g) => !!g.linkedinUrl)
    }

    if (onlyWithLinkedinOutreachSummary.value) {
        result = result.filter((g) => !!g.linkedinOutreachSummary)
    }

    if (selectedKeywords.value.length > 0) {
        const selected = new Set(selectedKeywords.value)
        result = result
            .map((group) => ({
                ...group,
                pages: group.pages.filter((page) =>
                    page.matchedKeywords.some((kw) => selected.has(kw)),
                ),
            }))
            .filter((g) => g.pages.length > 0)
    }

    return result
})

const filteredPageCount = computed(() =>
    filteredGroups.value.reduce((n, g) => n + g.pages.length, 0),
)

const crumbs = computed(() => ([
    { name: 'Automation', path: '/automation/workflows', icon: 'fa-solid fa-robot text-neutral-700 text-2xl' },
    { name: 'Workflow Runs', path: '/automation/workflows' },
    { name: 'Flagged pages', path: '' },
]))

const isKeywordSelected = (keyword: string) => selectedKeywords.value.includes(keyword)

const toggleKeyword = (keyword: string) => {
    const index = selectedKeywords.value.indexOf(keyword)
    if (index === -1) {
        selectedKeywords.value = [...selectedKeywords.value, keyword]
    } else {
        selectedKeywords.value = selectedKeywords.value.filter((kw) => kw !== keyword)
    }
}

const clearFilters = () => {
    selectedKeywords.value = []
    onlyWithLinkedinOutreachSummary.value = false
    onlyWithLinkedinCompany.value = false
}

const load = async () => {
    loading.value = true
    selectedKeywords.value = []
    onlyWithLinkedinOutreachSummary.value = false
    onlyWithLinkedinCompany.value = false
    collapsedPagesUnderRootKeys.value = new Set()
    try {
        groups.value = await getGoogleFlaggedPages(authStore, {
            workflowRunId: runId.value,
            limit: 500,
        })
    } catch {
        groups.value = []
        toast.showToast('Error', 'Failed to load flagged pages', 'error')
    } finally {
        loading.value = false
    }
}

const goBack = () => {
    router.back()
}

watch(runId, () => {
    void load()
}, { immediate: true })
</script>
