import { useState } from 'react'
import { theme } from '../theme'

interface PasswordInputProps {
  label: string
  value: string
  onChange: (value: string) => void
  placeholder?: string
  error?: string
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void
}

export function PasswordInput({
  label,
  value,
  onChange,
  placeholder = '••••••••',
  error,
  onKeyDown,
}: PasswordInputProps) {
  const [visible, setVisible] = useState(false)

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
      <div style={{ position: 'relative' }}>
        <input
          type={visible ? 'text' : 'password'}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          onKeyDown={onKeyDown}
          style={{
            width: '100%',
            padding: '10px 40px 10px 14px',
            fontSize: '16px',
            color: theme.semantic.textPrimary,
            background: theme.semantic.bgInput,
            border: `1px solid ${error ? theme.semantic.statusAlertText : theme.semantic.border}`,
            borderRadius: '8px',
            outline: 'none',
            boxSizing: 'border-box',
            transition: 'border-color 0.15s',
          }}
          onFocus={(e) => { e.target.style.borderColor = theme.semantic.borderFocus }}
          onBlur={(e) => { e.target.style.borderColor = error ? theme.semantic.statusAlertText : theme.semantic.border }}
        />
        <button
          type="button"
          onClick={() => setVisible(v => !v)}
          style={{
            position: 'absolute',
            right: '10px',
            top: '50%',
            transform: 'translateY(-50%)',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '0 2px',
            color: theme.semantic.textMuted,
            fontSize: '13px',
            lineHeight: 1,
          }}
        >
          {visible ? (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
              <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
              <line x1="1" y1="1" x2="23" y2="23"/>
            </svg>
          ) : (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
              <circle cx="12" cy="12" r="3"/>
            </svg>
          )}
        </button>
      </div>
      {error && (
        <p style={{ fontSize: '12px', color: theme.semantic.statusAlertText, marginTop: '4px' }}>
          {error}
        </p>
      )}
    </div>
  )
}
