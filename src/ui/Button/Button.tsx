import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { Link } from 'react-router'
import { cx } from '../../lib/cx'
import { Icon, type IconName } from '../Icon/Icon'
import styles from './Button.module.css'

type Variant = 'primary' | 'secondary' | 'ghost'

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant; icon?: IconName }

export function Button({ variant = 'primary', icon, className, children, type = 'button', ...rest }: ButtonProps) {
  return (
    <button type={type} className={cx(styles.button, styles[variant], className)} {...rest}>
      {icon && <Icon name={icon} size={18} />}
      {children}
    </button>
  )
}

type ButtonLinkProps = {
  /** 站內路徑，例如 /zh/about */
  to?: string
  /** 外部網址、mailto: 或檔案 */
  href?: string
  download?: boolean
  variant?: Variant
  icon?: IconName
  iconPosition?: 'start' | 'end'
  className?: string
  children: ReactNode
}

export function ButtonLink({ to, href, download, variant = 'primary', icon, iconPosition = 'start', className, children }: ButtonLinkProps) {
  const content = (
    <>
      {icon && iconPosition === 'start' && <Icon name={icon} size={18} />}
      {children}
      {icon && iconPosition === 'end' && <Icon name={icon} size={18} />}
    </>
  )
  const classes = cx(styles.button, styles[variant], className)
  if (to) {
    return (
      <Link to={to} className={classes}>
        {content}
      </Link>
    )
  }
  const external = href?.startsWith('http')
  return (
    <a href={href} className={classes} download={download || undefined} target={external ? '_blank' : undefined} rel={external ? 'noreferrer' : undefined}>
      {content}
    </a>
  )
}
