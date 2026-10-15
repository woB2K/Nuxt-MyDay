<script lang="ts" setup>
interface Props {
  size: number
  stroke: number
  segments: number
  filled: number
  color: string
  gap?: number
}

const props = withDefaults(defineProps<Props>(), { gap: 4 })

const radius = computed(() => (props.size - props.stroke) / 2)
const circumference = computed(() => 2 * Math.PI * radius.value)
const center = computed(() => props.size / 2)
const full = computed(() => props.filled >= props.segments)

const arcs = computed(() => {
  const gap = props.stroke + props.gap
  const segment = circumference.value / props.segments

  return Array.from({ length: props.segments }, (_, index) => ({
    on: index < props.filled,
    length: segment - gap,
    offset: -(index * segment + gap / 2)
  }))
})
</script>

<template>
  <svg
    class="pointer-events-none absolute inset-0 -rotate-90"
    :width="props.size"
    :height="props.size"
    aria-hidden="true"
  >
    <template v-if="props.segments <= 1">
      <circle
        :cx="center"
        :cy="center"
        :r="radius"
        fill="none"
        stroke="var(--c-hairline2)"
        :stroke-width="props.stroke"
      />
      <circle
        :cx="center"
        :cy="center"
        :r="radius"
        fill="none"
        :stroke="props.color"
        :stroke-width="props.stroke"
        stroke-linecap="round"
        :stroke-dasharray="circumference"
        :stroke-dashoffset="full ? 0 : circumference"
        :style="{ transition: `stroke-dashoffset ${full ? 320 : 200}ms var(--ease-out)` }"
        data-progress
      />
    </template>

    <template v-else>
      <g v-for="(arc, index) in arcs" :key="index">
        <circle
          :cx="center"
          :cy="center"
          :r="radius"
          fill="none"
          stroke="var(--c-hairline2)"
          :stroke-width="props.stroke"
          stroke-linecap="round"
          :stroke-dasharray="`${arc.length} ${circumference}`"
          :stroke-dashoffset="arc.offset"
        />
        <circle
          :cx="center"
          :cy="center"
          :r="radius"
          fill="none"
          :stroke="props.color"
          :stroke-width="props.stroke"
          stroke-linecap="round"
          :stroke-dasharray="`${arc.on ? arc.length : 0} ${circumference}`"
          :stroke-dashoffset="arc.offset"
          :style="{
            opacity: arc.on ? 1 : 0,
            transition: `stroke-dasharray ${arc.on ? 320 : 200}ms var(--ease-out), opacity ${arc.on ? 80 : 200}ms var(--ease-out)`,
          }"
          :data-segment="arc.on ? 'on' : 'off'"
        />
      </g>
      <circle
        :cx="center"
        :cy="center"
        :r="radius"
        fill="none"
        :stroke="props.color"
        :stroke-width="props.stroke"
        :style="{ opacity: full ? 1 : 0, transition: `opacity 200ms var(--ease-out) ${full ? 300 : 0}ms` }"
        data-full
      />
    </template>
  </svg>
</template>
