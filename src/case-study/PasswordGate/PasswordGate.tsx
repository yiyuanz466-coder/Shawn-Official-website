import { useState, type FormEvent } from 'react'
import { useI18n } from '../../i18n/useI18n'
import { checkPassword, markUnlocked } from '../../lib/password'
import { Button } from '../../ui/Button/Button'
import { Icon } from '../../ui/Icon/Icon'
import styles from './PasswordGate.module.css'

export function PasswordGate({ onUnlock }: { onUnlock: () => void }) {
  const { t } = useI18n()
  const [value, setValue] = useState('')
  const [error, setError] = useState(false)
  const [busy, setBusy] = useState(false)

  async function submit(event: FormEvent) {
    event.preventDefault()
    setBusy(true)
    const ok = await checkPassword(value)
    setBusy(false)
    if (ok) {
      markUnlocked()
      onUnlock()
    } else {
      setError(true)
    }
  }

  return (
    <section className={styles.gate} aria-labelledby="gate-title">
      <span className={styles.icon}>
        <Icon name="lock" size={26} />
      </span>
      <h1 id="gate-title" className={styles.title}>
        {t.gate.title}
      </h1>
      <p className={styles.desc}>{t.gate.desc}</p>
      <form className={styles.form} onSubmit={submit}>
        <label htmlFor="gate-password" className={styles.label}>
          {t.gate.label}
        </label>
        <input
          id="gate-password"
          className={styles.input}
          type="password"
          autoComplete="current-password"
          value={value}
          onChange={(event) => {
            setValue(event.target.value)
            setError(false)
          }}
          aria-invalid={error}
          aria-describedby={error ? 'gate-error' : undefined}
          autoFocus
        />
        {error && (
          <p id="gate-error" className={styles.error} role="alert">
            {t.gate.error}
          </p>
        )}
        <Button type="submit" disabled={busy || !value}>
          {t.gate.submit}
        </Button>
      </form>
    </section>
  )
}
