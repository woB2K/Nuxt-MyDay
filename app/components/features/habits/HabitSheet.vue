<script lang="ts" setup>
import type { HabitColor, HabitIcon, HabitItem } from '~~/shared/types'
import { habitColors, habitIcons, MAX_NAME_LENGTH, MAX_PER_WEEK, MIN_PER_WEEK } from '~~/shared/schemas'
import { defaultHabitColor, defaultHabitIcon, defaultPerWeek, habitColor, habitIconName, habitSoft } from '~/utils/habits'

const props = defineProps<{
  open: boolean
  habit?: HabitItem | null
}>()

const emit = defineEmits<{ 'update:open': [value: boolean] }>()

const { t } = useI18n()
const labels = useHabitLabels()

const { mutate: addHabit, isPending: isAdding } = useAddHabitMutation()
const { mutate: updateHabit, isPending: isUpdating } = useUpdateHabitMutation()
const { mutate: deleteHabit } = useDeleteHabitMutation()

const name = ref('')
const icon = ref<HabitIcon>(defaultHabitIcon)
const color = ref<HabitColor>(defaultHabitColor)
const weekly = ref(false)
const perWeek = ref(defaultPerWeek)

const isEdit = computed(() => !!props.habit)
const isPending = computed(() => isAdding.value || isUpdating.value)
const canSave = computed(() => name.value.trim().length > 0)

const schedules = computed(() => [
  { weekly: false, label: t('habits.plan.daily') },
  { weekly: true, label: labels.plan(perWeek.value) }
])

function reset() {
  const habit = props.habit

  name.value = habit?.name ?? ''
  icon.value = habit?.icon ?? defaultHabitIcon
  color.value = habit?.color ?? defaultHabitColor
  weekly.value = habit ? habit.perWeek !== null : false
  perWeek.value = habit?.perWeek ?? defaultPerWeek
}

watch(() => props.open, (open) => {
  if (open) reset()
}, { immediate: true })

function close() {
  emit('update:open', false)
}

function step(delta: number) {
  perWeek.value = Math.min(MAX_PER_WEEK, Math.max(MIN_PER_WEEK, perWeek.value + delta))
}

function submit() {
  const trimmed = name.value.trim()
  if (!trimmed) return

  const payload = {
    name: trimmed,
    icon: icon.value,
    color: color.value,
    perWeek: weekly.value ? perWeek.value : null
  }

  if (props.habit) {
    updateHabit({ id: props.habit.id, ...payload }, { onSuccess: close })
    return
  }

  addHabit(payload, { onSuccess: close })
}

function remove() {
  const habit = props.habit
  if (!habit) return

  close()
  deleteHabit({ id: habit.id, name: habit.name })
}
</script>

<template>
  <UiSheet
    :open="props.open"
    :title="isEdit ? t('habits.sheet.editTitle') : t('habits.sheet.newTitle')"
    @update:open="emit('update:open', $event)"
  >
    <form class="flex flex-col" @submit.prevent="submit">
      <div class="flex justify-center">
        <span
          :key="`${icon}-${color}`"
          class="flex size-18 items-center justify-center rounded-full"
          :style="{
            backgroundColor: habitSoft(color),
            color: habitColor(color),
            animation: 'habit-pop 320ms var(--ease-spring) both',
          }"
          data-preview
        >
          <UIcon :name="habitIconName(icon)" class="size-8" />
        </span>
      </div>

      <span class="mt-5 mb-2.5 text-[11px] font-semibold tracking-[0.08em] uppercase text-text-dim">
        {{ t('habits.sheet.name') }}
      </span>
      <UiInput
        v-model="name"
        :placeholder="t('habits.sheet.namePlaceholder')"
        type="text"
        :maxlength="MAX_NAME_LENGTH"
      />

      <span class="mt-5 mb-2.5 text-[11px] font-semibold tracking-[0.08em] uppercase text-text-dim">
        {{ t('habits.sheet.icon') }}
      </span>
      <div class="grid grid-cols-7 gap-1.5">
        <button
          v-for="option in habitIcons"
          :key="option"
          class="flex aspect-square items-center justify-center rounded-xl transition-transform duration-150 ease-spring"
          :class="icon === option ? 'scale-105' : 'bg-elev1 text-text-dim'"
          :style="icon === option ? { backgroundColor: habitSoft(color), color: habitColor(color) } : undefined"
          type="button"
          :aria-pressed="icon === option"
          :data-icon="option"
          @click="icon = option"
        >
          <UIcon :name="habitIconName(option)" class="size-5.5" />
        </button>
      </div>

      <span class="mt-5 mb-2.5 text-[11px] font-semibold tracking-[0.08em] uppercase text-text-dim">
        {{ t('habits.sheet.color') }}
      </span>
      <div class="flex justify-between">
        <button
          v-for="option in habitColors"
          :key="option"
          class="flex size-[34px] items-center justify-center rounded-full transition-transform duration-150 ease-spring"
          :class="color === option ? 'scale-[1.08]' : ''"
          :style="{
            backgroundColor: habitColor(option),
            color: 'var(--c-h-ink)',
            boxShadow: color === option ? `0 0 0 2.5px var(--c-elev2), 0 0 0 4.5px ${habitColor(option)}` : undefined,
          }"
          type="button"
          :aria-label="option"
          :aria-pressed="color === option"
          :data-color="option"
          @click="color = option"
        >
          <UIcon v-if="color === option" name="i-lucide-check" class="size-4" />
        </button>
      </div>

      <span class="mt-5 mb-2.5 text-[11px] font-semibold tracking-[0.08em] uppercase text-text-dim">
        {{ t('habits.sheet.schedule') }}
      </span>
      <div class="flex gap-1 rounded-xl border border-hairline bg-elev1 p-[3px]" role="radiogroup">
        <button
          v-for="option in schedules"
          :key="String(option.weekly)"
          class="h-10 min-w-0 flex-1 truncate rounded-[9px] text-sm font-semibold transition-colors duration-150"
          :class="weekly === option.weekly ? 'bg-elev3 text-text' : 'text-text-dim'"
          type="button"
          role="radio"
          :aria-checked="weekly === option.weekly"
          :data-schedule="option.weekly ? 'weekly' : 'daily'"
          @click="weekly = option.weekly"
        >
          {{ option.label }}
        </button>
      </div>

      <template v-if="weekly">
        <div class="mt-2 flex h-14 items-center gap-2.5 rounded-lg border border-hairline bg-elev1 pr-2.5 pl-4 animate-step-in" data-per-week>
          <span class="flex-1 text-[15px] font-medium text-text">{{ t('habits.sheet.perWeek') }}</span>
          <UiRoundBtn :disabled="perWeek <= MIN_PER_WEEK" :aria-label="t('habits.sheet.fewer')" data-minus @click="step(-1)">
            <UIcon name="i-lucide-minus" class="size-4.5" />
          </UiRoundBtn>
          <span class="w-7 text-center font-display text-xl font-bold tabular-nums text-text" data-count>{{ perWeek }}</span>
          <UiRoundBtn :disabled="perWeek >= MAX_PER_WEEK" :aria-label="t('habits.sheet.more')" data-plus @click="step(1)">
            <UIcon name="i-lucide-plus" class="size-4.5" />
          </UiRoundBtn>
        </div>
        <span class="mt-2 text-xs leading-4 text-text-mute">{{ t('habits.sheet.scheduleHint') }}</span>
      </template>

      <UiButton class="mt-6 w-full" type="submit" :disabled="!canSave" :loading="isPending">
        {{ isEdit ? t('habits.sheet.save') : t('habits.sheet.create') }}
      </UiButton>

      <button
        v-if="isEdit"
        class="mt-2 flex h-12 w-full items-center justify-center gap-2 rounded-xl text-[15px] font-semibold text-danger"
        type="button"
        data-delete
        @click="remove"
      >
        <UIcon name="i-lucide-trash-2" class="size-4" />
        {{ t('habits.sheet.delete') }}
      </button>
    </form>
  </UiSheet>
</template>
