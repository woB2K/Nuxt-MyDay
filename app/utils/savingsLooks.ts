export const savingsEntryLooks = {
  DEPOSIT: { icon: 'i-lucide-arrow-up', tile: 'bg-success/14', ink: 'text-success', sign: '+', title: 'finance.savings.deposit', caption: 'finance.savings.add' },
  WITHDRAWAL: { icon: 'i-lucide-arrow-down', tile: 'bg-warning/14', ink: 'text-warning', sign: '−', title: 'finance.savings.withdrawal', caption: 'finance.savings.withdraw' },
  OPENING: { icon: 'i-lucide-flag', tile: 'bg-accent-soft', ink: 'text-accent', sign: '', title: 'finance.savings.opening', caption: 'finance.savings.startPoint' },
  ADJUSTMENT: { icon: 'i-lucide-scale', tile: 'bg-accent-soft', ink: 'text-accent', sign: '', title: 'finance.savings.adjustment', caption: 'finance.savings.adjustmentCaption' }
} as const

export function savingsEntryLook(entry: { type: keyof typeof savingsEntryLooks, amount: number }) {
  const looks = savingsEntryLooks[entry.type]

  if (entry.type !== 'ADJUSTMENT') return { ...looks, amount: entry.amount }

  return { ...looks, sign: entry.amount < 0 ? '−' : '+', amount: Math.abs(entry.amount) }
}
