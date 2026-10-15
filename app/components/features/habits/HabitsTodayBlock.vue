<script lang="ts" setup>
import type { HabitItem } from '~~/shared/types'
import { habitsProgress } from '~/utils/habits'

const props = defineProps<{ today: string }>()

const { t } = useI18n()
const toast = useAppToast()
const authStore = useAuthStore()

const { data: habits, isPending } = useHabitsQuery()
const { mutate: saveSettings } = useUpdateSettingsMutation()
const { fx, celebration, celebrating, toggle } = useHabitMarking(() => props.today)

const list = computed(() => habits.value ?? [])
const progress = computed(() => habitsProgress(list.value, props.today))
const allDone = computed(() => progress.value.all && !celebrating.value)

const sheetOpen = ref(false)

function mark(habit: HabitItem) {
  toggle(list.value, habit)
}

function setOnToday(value: boolean) {
  if (authStore.user) authStore.user.settings.habitsOnToday = value
  saveSettings({ habitsOnToday: value })
}

function hide() {
  setOnToday(false)
  toast.info(t('habits.today.hiddenToast'), {
    action: { label: t('general.undo'), run: () => setOnToday(true) }
  })
}
</script>

<template>
  <section class="flex flex-col">
    <template v-if="isPending">
      <div class="-mt-1.5 flex h-[38px] items-center px-1" data-skeleton>
        <UiSkeleton :w="70" :h="12" />
        <UiSkeleton class="ml-auto" :w="36" :h="12" />
      </div>
      <div class="flex justify-between">
        <div v-for="n in 5" :key="n" class="flex w-16 flex-col items-center gap-2">
          <UiSkeleton :w="56" :h="56" :r="9999" />
          <UiSkeleton :w="44" :h="10" :r="5" />
          <UiSkeleton :w="22" :h="10" :r="5" />
        </div>
      </div>
    </template>

    <template v-else-if="list.length">
      <button
        class="-mt-1.5 flex h-11 w-full items-center gap-2 pl-1 text-text-dim"
        type="button"
        data-open-list
        @click="navigateTo('/habits')"
      >
        <span class="font-display text-[13px] font-semibold tracking-[0.08em] uppercase">{{ t('habits.title') }}</span>
        <span class="ml-auto flex shrink-0 items-center gap-1 whitespace-nowrap">
          <span
            v-if="allDone"
            :key="`done-${celebration}`"
            class="inline-flex items-center gap-[5px] text-[13px] font-semibold text-success"
            :style="{ animation: celebration ? 'habit-badge 360ms var(--ease-spring) both' : 'none' }"
            data-all-done
          >
            <UIcon name="i-lucide-check" class="size-3.5" />
            {{ progress.weekly ? t('habits.today.weekDone') : t('habits.today.allDone') }}
          </span>
          <span v-else class="text-[13px] font-medium tabular-nums text-text-mute" data-progress>
            {{ progress.weekly ? `${t('habits.today.week')} · ` : '' }}{{ progress.done }} / {{ progress.total }}
          </span>
          <UIcon name="i-lucide-chevron-right" class="size-4.5" />
        </span>
      </button>

      <div
        class="ring-strip -mx-4 flex px-4 py-0.5"
        :class="[
          list.length === 5 ? 'justify-between' : 'gap-2.5',
          list.length > 5 ? 'is-scrolling overflow-x-auto' : '',
        ]"
      >
        <HabitRingItem
          v-for="habit in list"
          :key="habit.id"
          :habit="habit"
          :today="props.today"
          :fx="fx[habit.id]"
          @toggle="mark(habit)"
          @open="navigateTo(`/habits/${habit.id}`)"
        />
      </div>
    </template>

    <div
      v-else-if="habits"
      class="flex items-center gap-3 rounded-lg border-[1.5px] border-dashed border-hairline2 py-2.5 pr-1 pl-3"
      data-empty
    >
      <button class="flex min-w-0 flex-1 items-center gap-3 text-left text-text" type="button" data-add @click="sheetOpen = true">
        <span class="flex size-10 shrink-0 items-center justify-center rounded-full bg-accent-soft text-accent">
          <UIcon name="i-lucide-plus" class="size-5" />
        </span>
        <span class="min-w-0">
          <span class="block text-[15px] font-semibold">{{ t('habits.today.emptyTitle') }}</span>
          <span class="mt-px block text-[13px] leading-[18px] text-text-dim">{{ t('habits.today.emptySub') }}</span>
        </span>
      </button>
      <button
        class="flex size-11 shrink-0 items-center justify-center text-text-mute"
        type="button"
        :aria-label="t('habits.today.hide')"
        data-hide
        @click="hide"
      >
        <UIcon name="i-lucide-x" class="size-4.5" />
      </button>
    </div>

    <HabitSheet v-model:open="sheetOpen" />
  </section>
</template>

<style scoped>
.ring-strip.is-scrolling {
  scrollbar-width: none;
  mask-image: linear-gradient(90deg, #000 85%, transparent);
}

.ring-strip.is-scrolling::-webkit-scrollbar {
  display: none;
}
</style>
