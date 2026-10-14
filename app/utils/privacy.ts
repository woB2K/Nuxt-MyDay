export const amountsHiddenStorageKey = 'myday:hideAmounts'

export function readAmountsHidden(): boolean {
  try {
    return localStorage.getItem(amountsHiddenStorageKey) === '1'
  } catch {
    return false
  }
}

export function writeAmountsHidden(hidden: boolean): void {
  try {
    localStorage.setItem(amountsHiddenStorageKey, hidden ? '1' : '0')
  } catch {}
}
