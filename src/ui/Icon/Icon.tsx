type IconDef = { d: string; filled?: boolean }

const ICONS = {
  mail: { d: 'M3 6.5A1.5 1.5 0 0 1 4.5 5h15A1.5 1.5 0 0 1 21 6.5v11a1.5 1.5 0 0 1-1.5 1.5h-15A1.5 1.5 0 0 1 3 17.5z M3.5 6.5 12 13l8.5-6.5' },
  linkedin: {
    filled: true,
    d: 'M4.98 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5zM3 9.75h4V21H3zM9.5 9.75h3.8v1.6h.06c.53-1 1.84-2.05 3.78-2.05 4.04 0 4.79 2.66 4.79 6.12V21h-4v-4.98c0-1.19-.02-2.72-1.66-2.72-1.66 0-1.91 1.3-1.91 2.63V21h-4z',
  },
  sun: { d: 'M12 16a4 4 0 1 0 0-8 4 4 0 0 0 0 8z M12 2.5v2 M12 19.5v2 M4.6 4.6 6 6 M18 18l1.4 1.4 M2.5 12h2 M19.5 12h2 M4.6 19.4 6 18 M18 6l1.4-1.4' },
  moon: { d: 'M20 14.5A8 8 0 0 1 9.5 4 8 8 0 1 0 20 14.5z' },
  wave: { d: 'M2 12c1.7-2.7 3.3-2.7 5 0s3.3 2.7 5 0 3.3-2.7 5 0 3.3 2.7 5 0' },
  globe: { d: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18z M3 12h18 M12 3c2.5 2.6 3.8 5.6 3.8 9s-1.3 6.4-3.8 9 M12 3C9.5 5.6 8.2 8.6 8.2 12s1.3 6.4 3.8 9' },
  lock: { d: 'M6 11h12v9.5H6z M8.5 11V8a3.5 3.5 0 0 1 7 0v3' },
  arrowUp: { d: 'M12 19V5 M5.5 11.5 12 5l6.5 6.5' },
  arrowRight: { d: 'M5 12h14 M12.5 5.5 19 12l-6.5 6.5' },
  arrowLeft: { d: 'M19 12H5 M11.5 5.5 5 12l6.5 6.5' },
  sliders: { d: 'M4 7h9 M17 7h3 M15 5v4 M4 17h3 M11 17h9 M9 15v4' },
  download: { d: 'M12 4v11 M7 10.5l5 5 5-5 M5 20h14' },
  close: { d: 'M6 6l12 12 M18 6 6 18' },
  quote: {
    filled: true,
    d: 'M9.6 6C6.5 7.3 4.5 10 4.5 13.4V18h5.8v-5.6H7.6c.2-1.9 1.4-3.4 3.2-4.3zm9 0c-3.1 1.3-5.1 4-5.1 7.4V18h5.8v-5.6h-2.7c.2-1.9 1.4-3.4 3.2-4.3z',
  },
} satisfies Record<string, IconDef>

export type IconName = keyof typeof ICONS

type IconProps = {
  name: IconName
  size?: number
  /** 有 label 時對螢幕閱讀器宣告為圖片；沒有時視為裝飾。 */
  label?: string
}

export function Icon({ name, size = 20, label }: IconProps) {
  const icon: IconDef = ICONS[name]
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={icon.filled ? 'currentColor' : 'none'}
      stroke={icon.filled ? 'none' : 'currentColor'}
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      role={label ? 'img' : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      focusable="false"
    >
      <path d={icon.d} />
    </svg>
  )
}
