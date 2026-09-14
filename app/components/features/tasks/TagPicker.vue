<script lang="ts" setup>
const model = defineModel<string[]>({ default: () => [] })

const { t } = useI18n()

const { data: tags } = useTagsQuery()
const { mutate: addTag, isPending: isTagging } = useAddTagMutation()

const newTag = ref('')

function toggle(id: string) {
  model.value = model.value.includes(id)
    ? model.value.filter(tagId => tagId !== id)
    : [...model.value, id]
}

function create() {
  const name = newTag.value.trim()
  if (!name || isTagging.value) return

  addTag({ name }, {
    onSuccess: (tag) => {
      model.value = [...model.value, tag.id]
      newTag.value = ''
    }
  })
}
</script>

<template>
  <div class="flex flex-col gap-2.5">
    <span class="text-[11px] font-semibold uppercase tracking-[0.08em] text-text-dim">
      {{ t('tasks.tags') }}
    </span>

    <div v-if="tags?.length" class="flex flex-wrap gap-2">
      <UiChip
        v-for="tag in tags"
        :key="tag.id"
        :label="tag.name"
        :active="model.includes(tag.id)"
        @click="toggle(tag.id)"
      />
    </div>

    <div class="flex items-center gap-2">
      <input
        v-model="newTag"
        class="flex-1 min-w-0 h-10 px-3.5 rounded-full border border-hairline bg-elev1 text-text text-sm outline-none"
        :placeholder="t('tasks.newTag')"
        type="text"
        @keydown.enter.prevent="create"
      >
      <UiRoundBtn :disabled="!newTag.trim() || isTagging" @click="create">
        <UIcon name="i-lucide-plus" class="w-4.5 h-4.5" />
      </UiRoundBtn>
    </div>
  </div>
</template>
