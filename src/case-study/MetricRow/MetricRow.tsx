import styles from './MetricRow.module.css'

type Metric = { value: string; label: string }

/** 成果數字列。dt（說明）在前、dd（數字）在後，讓螢幕閱讀器先讀說明；視覺上數字在上。 */
export function MetricRow({ items, label }: { items: Metric[]; label?: string }) {
  return (
    <dl className={styles.row} aria-label={label}>
      {items.map((item) => (
        <div key={item.label} className={styles.item}>
          <dt className={styles.label}>{item.label}</dt>
          <dd className={styles.value}>{item.value}</dd>
        </div>
      ))}
    </dl>
  )
}
