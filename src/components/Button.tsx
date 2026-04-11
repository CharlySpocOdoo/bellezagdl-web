import { theme } from '../theme'

interface ButtonProps {
  label: string
  onClick?: () => void
  type?: 'button' | 'submit'
  variant?: 'primary' | 'ghost'
  isLoading?: boolean
  disabled?: boolean
  fullWidth?: boolean
}

export function Button({
  label,
  onClick,
  type = 'button',
  variant = 'primary',
  isLoading,
  disabled,
  fullWidth,
}: ButtonProps) {
  const isPrimary = variant === 'primary'

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || isLoading}
      style={{
        width: fullWidth ? '100%' : 'auto',
        padding: '11px 24px',
        fontSize: '15px',
        fontWeight: 500,
        color: isPrimary ? theme.semantic.textOnPrimary : theme.semantic.actionPrimary,
        background: isPrimary ? theme.semantic.actionPrimary : 'transparent',
        border: `1px solid ${isPrimary ? theme.semantic.actionPrimary : theme.semantic.actionPrimary}`,
        borderRadius: '8px',
        cursor: disabled || isLoading ? 'not-allowed' : 'pointer',
        opacity: disabled || isLoading ? 0.7 : 1,
        transition: 'background 0.15s, opacity 0.15s',
      }}
      onMouseEnter={(e) => {
        if (!disabled && !isLoading) {
          const el = e.currentTarget
          el.style.background = isPrimary
            ? theme.semantic.actionPrimaryHover
            : theme.semantic.actionPrimaryLight
        }
      }}
      onMouseLeave={(e) => {
        if (!disabled && !isLoading) {
          const el = e.currentTarget
          el.style.background = isPrimary
            ? theme.semantic.actionPrimary
            : 'transparent'
        }
      }}
    >
      {isLoading ? 'Cargando...' : label}
    </button>
  )
}