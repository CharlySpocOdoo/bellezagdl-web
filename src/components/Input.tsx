import { theme } from '../theme'

interface InputProps {
  label: string
  type?: string
  value: string
  onChange: (value: string) => void
  placeholder?: string
  error?: string
  disabled?: boolean
}

export function Input({
  label,
  type = 'text',
  value,
  onChange,
  placeholder,
  error,
  disabled,
}: InputProps) {
  return (
    <div style={{ marginBottom: '16px' }}>
      <label style={{
        display: 'block',
        fontSize: '13px',
        fontWeight: 500,
        color: theme.semantic.textSecondary,
        marginBottom: '6px',
      }}>
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        style={{
          width: '100%',
          padding: '10px 14px',
          fontSize: '15px',
          color: theme.semantic.textPrimary,
          background: theme.semantic.bgInput,
          border: `1px solid ${error ? theme.semantic.statusAlertText : theme.semantic.border}`,
          borderRadius: '8px',
          outline: 'none',
          boxSizing: 'border-box',
          opacity: disabled ? 0.6 : 1,
          transition: 'border-color 0.15s',
        }}
        onFocus={(e) => {
          e.target.style.borderColor = theme.semantic.borderFocus
        }}
        onBlur={(e) => {
          e.target.style.borderColor = error
            ? theme.semantic.statusAlertText
            : theme.semantic.border
        }}
      />
      {error && (
        <p style={{
          fontSize: '12px',
          color: theme.semantic.statusAlertText,
          marginTop: '4px',
        }}>
          {error}
        </p>
      )}
    </div>
  )
}