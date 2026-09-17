<script lang="ts" setup>
import type { Category } from '~~/prisma/.generated/prisma'
import { categoryLabel } from '~/utils/categoryLabel'
import { categoryColors, categoryIcons, defaultCategoryColor, defaultCategoryIcon } from '~/utils/categoryPresets'

const props = defineProps<{
  open: boolean
  category?: Category | null
}>()

const emit = defineEmits<{ 'update:open': [value: boolean] }>()

const { t } = useI18n()
const toast = useAppToast()

const { mutate: addCategory, isPending: isAdding } = useAddCategoryMutation()
const { mutate: updateCategory, isPending: isUpdating } = useUpdateCategoryMutation()

const name = ref('')
const nameError = ref('')
const type = ref<'INCOME' | 'EXPENSE'>('EXPENSE')
const icon = ref<string>(defaultCategoryIcon)
const color = ref<string>(defaultCategoryColor)

const isEdit = computed(() => !!props.category)
const isSystem = computed(() => props.category?.isSystem ?? false)
const isPending = computed(() => isAdding.value || isUpdating.value)

const allTypeOptions = computed(() => [
  { value: 'EXPENSE', label: t('settings.categoriesScreen.expense'), color: 'var(--c-danger)', inkColor: '#F4F4F7' },
  { value: 'INCOME', label: t('settings.categoriesScreen.income'), color: 'var(--c-success)', inkColor: '#0F0F14' }
])

const typeOptions = computed(() => isSystem.value
  ? allTypeOptions.value.filter(option => option.value === props.category?.type)
  : allTypeOptions.value)

function reset() {
  const category = props.category

  name.value = category ? categoryLabel(category, t) : ''
  type.value = category?.type ?? 'EXPENSE'
  icon.value = category?.icon ?? defaultCategoryIcon
  color.value = category?.color ?? defaultCategoryColor
}

watch(() => props.open, (open) => {
  if (open) reset()
}, { immediate: true })

watch(name, () => {
  nameError.value = ''
})

function close() {
  emit('update:open', false)
}

function submit() {
  const trimmed = name.value.trim()

  if (!trimmed) {
    nameError.value = t('settings.categoriesScreen.nameRequired')
    toast.error(t('settings.categoriesScreen.nameRequired'))
    return
  }

  const payload = { name: trimmed, icon: icon.value, color: color.value, type: type.value }

  if (props.category) {
    const renamed = trimmed !== categoryLabel(props.category, t)

    updateCategory({
      id: props.category.id,
      ...payload,
      ...(renamed ? {} : { name: props.category.name })
    }, { onSuccess: close })
    return
  }

  addCategory(payload, { onSuccess: close })
}
</script>

<template>
  <UiSheet
    :open="props.open"
    :title="isEdit ? t('settings.categoriesScreen.edit') : t('settings.categoriesScreen.add')"
    @update:open="emit('update:open', $event)"
  >
    <form class="flex flex-col gap-5" @submit.prevent="submit">
      <div class="flex justify-center">
        <div
          class="size-20 flex items-center justify-center rounded-[20px] transition-colors duration-base"
          :style="{ backgroundColor: `${color}22` }"
        >
          <UIcon :name="icon" class="size-9" :style="{ color }" />
        </div>
      </div>

      <UiInput v-model="name" :label="t('settings.categoriesScreen.name')" type="text" :error="nameError" />

      <div class="flex flex-col gap-2.5">
        <span class="text-[11px] font-semibold uppercase tracking-[0.08em] text-text-dim">
          {{ t('settings.categoriesScreen.type') }}
        </span>
        <UiPillSelect
          v-model="type"
          :options="typeOptions"
          bg-class="bg-elev3"
          full
        />
        <span v-if="isSystem" class="text-xs text-text-mute">
          {{ t('settings.categoriesScreen.systemTypeLocked') }}
        </span>
      </div>

      <div class="flex flex-col gap-2.5">
        <span class="text-[11px] font-semibold uppercase tracking-[0.08em] text-text-dim">
          {{ t('settings.categoriesScreen.icon') }}
        </span>
        <div class="grid grid-cols-6 gap-2">
          <button
            v-for="option in categoryIcons"
            :key="option"
            class="aspect-square flex items-center justify-center rounded-xl bg-elev3 transition-transform duration-fast ease-spring"
            :class="icon === option ? 'scale-105' : 'active:scale-95'"
            :style="icon === option ? { backgroundColor: `${color}22` } : {}"
            type="button"
            @click="icon = option"
          >
            <UIcon :name="option" class="size-5" :style="{ color: icon === option ? color : 'var(--c-text-dim)' }" />
          </button>
        </div>
      </div>

      <div class="flex flex-col gap-2.5">
        <span class="text-[11px] font-semibold uppercase tracking-[0.08em] text-text-dim">
          {{ t('settings.categoriesScreen.color') }}
        </span>
        <div class="grid grid-cols-8 gap-2">
          <button
            v-for="option in categoryColors"
            :key="option"
            class="aspect-square flex items-center justify-center rounded-full transition-transform duration-fast ease-spring"
            :class="color === option ? 'scale-[1.08]' : 'active:scale-95'"
            :style="{
              backgroundColor: option,
              boxShadow: color === option ? `0 0 0 2.5px var(--c-elev2), 0 0 0 4.5px ${option}` : undefined
            }"
            type="button"
            @click="color = option"
          >
            <UIcon v-if="color === option" name="i-lucide-check" class="size-4 text-accent-ink" />
          </button>
        </div>
      </div>

      <UiButton class="w-full" type="submit" :loading="isPending">
        {{ t('general.save') }}
      </UiButton>
    </form>
  </UiSheet>
</template>
