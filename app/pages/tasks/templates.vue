<script lang="ts" setup>
import type { TemplateItem } from '~~/shared/types'
import { useFabAction } from '~/composables/useFabAction'

const { t } = useI18n()

const { data: templates, isPending } = useTemplatesQuery()
const { mutate: addTask } = useAddTaskMutation()

const sheetOpen = ref(false)
const editing = ref<TemplateItem | null>(null)

function openSheet(template: TemplateItem | null = null) {
  editing.value = template
  sheetOpen.value = true
}

function use(template: TemplateItem) {
  addTask({
    title: template.title,
    notes: template.notes ?? '',
    priority: template.priority,
    tagIds: template.tags.map(tag => tag.id)
  })
}

useFabAction(() => openSheet())
</script>

<template>
  <div class="flex flex-col p-4 gap-3">
    <UiRoundBtn class="mb-1" @click="navigateTo('/tasks')">
      <UIcon name="i-lucide-chevron-left" class="w-4.5 h-4.5" />
    </UiRoundBtn>

    <div class="flex flex-col gap-1">
      <h1 class="text-3xl font-bold text-text">
        {{ t('tasks.templates.title') }}
      </h1>
      <span class="text-sm text-text-dim">{{ t('tasks.templates.subtitle') }}</span>
    </div>

    <template v-if="isPending">
      <UiSkeletonRow v-for="n in 4" :key="n" />
    </template>

    <UiEmptyState
      v-else-if="!templates?.length"
      icon="i-lucide-repeat"
      :title="t('tasks.templates.empty')"
      :subtitle="t('tasks.templates.emptySub')"
    />

    <div v-else class="flex flex-col gap-2">
      <UiTaskTemplateRow
        v-for="template in templates"
        :key="template.id"
        :template="template"
        @use="use(template)"
        @edit="openSheet(template)"
      />
    </div>

    <TemplateSheet v-model:open="sheetOpen" :template="editing" />
  </div>
</template>
