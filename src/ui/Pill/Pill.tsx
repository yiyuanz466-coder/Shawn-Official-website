import type { ButtonHTMLAttributes, MouseEventHandler, ReactNode } from 'react'
import { Link } from 'react-router'
import { cx } from '../../lib/cx'
import { Icon, type IconName } from '../Icon/Icon'
import styles from './Pill.module.css'

type BaseProps = {
  active?: boolean
  icon?: IconName
  variant?: 'ghost' | 'outlined'
  className?: string
  children: ReactNode
}

type LinkPillProps = BaseProps & {
  to: string
  onClick?: MouseEventHandler<HTMLAnchorElement>
  'aria-label'?: string
}

type ButtonPillProps = BaseProps & { to?: undefined } & ButtonHTMLAttributes<HTMLButtonElement>

export type PillProps = LinkPillProps | ButtonPillProps

function pillClass(variant: BaseProps['variant'], active: boolean | undefined, className?: string) {
  return cx(styles.pill, variant === 'outlined' && styles.outlined, active && styles.active, className)
}

/** 膠囊按鈕：有 to 時是連結（active 時標記 aria-current），否則是 button。 */
export function Pill(props: PillProps) {
  if (props.to !== undefined) {
    const { to, active, icon, variant = 'ghost', className, children, onClick } = props
    return (
      <Link to={to} className={pillClass(variant, active, className)} aria-current={active ? 'page' : undefined} onClick={onClick} aria-label={props['aria-label']}>
        {icon && <Icon name={icon} size={16} />}
        {children}
      </Link>
    )
  }

  // 解構出來但沒用到的 to 是為了不讓它進入 ...buttonProps（有 rest 時 TS 不會報 unused）
  const { to: _to, active, icon, variant = 'ghost', className, children, type = 'button', ...buttonProps } = props
  return (
    <button type={type} className={pillClass(variant, active, className)} {...buttonProps}>
      {icon && <Icon name={icon} size={16} />}
      {children}
    </button>
  )
}
