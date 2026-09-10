export function russianPlural(choice: number): number {
  const count = Math.abs(choice)
  const tens = count % 100
  const units = count % 10

  if (tens > 10 && tens < 20) return 2
  if (units > 1 && units < 5) return 1
  if (units === 1) return 0

  return 2
}
