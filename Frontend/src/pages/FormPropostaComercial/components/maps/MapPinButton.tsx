import styles from '../FormRenderer.module.css'

type MapPinButtonProps = {
  label: string
  onClick: () => void
  disabled?: boolean
}

/** Botão trailing com pin (SVG inline — segue a convenção de glyphs do projeto). */
function MapPinButton({ label, onClick, disabled }: MapPinButtonProps) {
  return (
    <button
      aria-label={label}
      className={styles.mapPinButton}
      disabled={disabled}
      onClick={onClick}
      title={label}
      type="button"
    >
      <svg aria-hidden="true" fill="none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path
          d="M12 21s-6-5.3-6-10a6 6 0 1 1 12 0c0 4.7-6 10-6 10Z"
          stroke="currentColor"
          strokeLinejoin="round"
          strokeWidth="1.8"
        />
        <circle cx="12" cy="11" r="2.2" stroke="currentColor" strokeWidth="1.8" />
      </svg>
    </button>
  )
}

export { MapPinButton }
