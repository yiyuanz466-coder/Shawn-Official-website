import type { Project } from './projects'
import type { Category, HomeCard } from './schema'

export const FILTERS = ['all', 'about', 'work', 'side'] as const
export type Filter = (typeof FILTERS)[number]

export function parseFilter(value: string | null): Filter {
  return FILTERS.includes(value as Filter) ? (value as Filter) : 'all'
}

export type WallItem = { kind: 'project'; project: Project } | { kind: 'card'; card: HomeCard }

/**
 * 首頁卡片牆：先依 order 排好作品卡，再把 home.json 的其他卡片插到各自的 position（從 0 開始的最終位置）。
 * 新增作品時不需要改 home.json，它會自動遞補到空位。
 */
export function buildWall(projects: Project[], cards: HomeCard[]): WallItem[] {
  const items: WallItem[] = projects.map((project) => ({ kind: 'project', project }))
  for (const card of [...cards].sort((a, b) => a.position - b.position)) {
    items.splice(Math.min(card.position, items.length), 0, { kind: 'card', card })
  }
  return items
}

export function categoryOf(item: WallItem): Category {
  return item.kind === 'project' ? item.project.meta.category : item.card.category
}

export function keyOf(item: WallItem): string {
  return item.kind === 'project' ? `project-${item.project.slug}` : `card-${item.card.id}`
}
