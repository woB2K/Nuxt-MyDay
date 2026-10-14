import type { HouseholdMemberItem, InvitePreviewResponse } from '~~/shared/types'
import { statusOf } from '~/utils/httpStatus'

export type IconDiscTone = 'accent' | 'success' | 'warning' | 'danger' | 'neutral'

export interface Consequence {
  icon: string
  tone: IconDiscTone
  title: string
  sub: string
}

export interface TxAuthor {
  name: string | null
  colorIndex: number | null
  named: boolean
}

export type JoinState = 'ok' | 'busy' | 'invalid' | 'already'

const PENDING_INVITE_KEY = 'myday:pendingInvite'
const JOIN_PATH = '/family/join/'

type Member = Pick<HouseholdMemberItem, 'userId' | 'name' | 'colorIndex'>

function initialOf(name: string): string {
  return name.trim().charAt(0).toLocaleUpperCase()
}

export function othersOf<T extends Member>(members: T[], myId: string | undefined): T[] {
  return members.filter(member => member.userId !== myId)
}

export function authorOf(members: Member[], myId: string | undefined, userId: string): TxAuthor | undefined {
  if (members.length < 2 || userId === myId) return undefined

  const author = members.find(member => member.userId === userId)

  if (!author) return { name: null, colorIndex: null, named: false }

  const named = othersOf(members, myId).some(member =>
    member.userId !== userId && initialOf(member.name) === initialOf(author.name)
  )

  return { name: author.name, colorIndex: author.colorIndex, named }
}

export function nextOwnerOf<T extends Member & { joinedAt: Date | string }>(members: T[], myId: string | undefined): T | undefined {
  return [...othersOf(members, myId)]
    .sort((a, b) => new Date(a.joinedAt).getTime() - new Date(b.joinedAt).getTime())[0]
}

export function joinStateOf(preview: InvitePreviewResponse | undefined, error: unknown): JoinState | undefined {
  if (error) return statusOf(error) === 404 ? 'invalid' : undefined
  if (!preview) return undefined

  if (preview.state === 'mustLeave') return 'busy'
  if (preview.state === 'alreadyMember') return 'already'
  return 'ok'
}

export function joinPath(token: string): string {
  return `${JOIN_PATH}${encodeURIComponent(token)}`
}

export function inviteTokenOf(path: string): string | undefined {
  if (!path.startsWith(JOIN_PATH)) return undefined

  const token = decodeURIComponent(path.slice(JOIN_PATH.length))

  return token || undefined
}

export function inviteLink(origin: string, token: string): string {
  return `${origin}${joinPath(token)}`
}

export function savePendingInvite(token: string) {
  try {
    sessionStorage.setItem(PENDING_INVITE_KEY, token)
  } catch {}
}

export function pendingInvite(): string | undefined {
  try {
    return sessionStorage.getItem(PENDING_INVITE_KEY) ?? undefined
  } catch {
    return undefined
  }
}

export function clearPendingInvite() {
  try {
    sessionStorage.removeItem(PENDING_INVITE_KEY)
  } catch {}
}

export function homePath(): string {
  const token = pendingInvite()

  return token ? joinPath(token) : '/today'
}
