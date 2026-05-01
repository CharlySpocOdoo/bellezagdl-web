export const theme = {
  colors: {
    // ─── Primario — Coral Rosa de Lima ────────────────────────
    primary: {
      50:  '#FEF0F2',
      100: '#FACDD4',
      200: '#F5A0AE',
      400: '#E8637A',
      600: '#C44A60',
      800: '#8F2E42',
      900: '#5C1A28',
    },
    // ─── Secundario — Azul marino Rosa de Lima ────────────────
    secondary: {
      50:  '#EBF0F7',
      100: '#C2D2E6',
      200: '#92AED0',
      400: '#4A7BAD',
      600: '#2A5585',
      800: '#1E3A5F',
      900: '#162D4A',
    },
    // ─── Acento — Coral cálido (se mantiene) ──────────────────
    accent: {
      50:  '#FAECE7',
      100: '#F5C4B3',
      200: '#F0997B',
      400: '#D85A30',
      600: '#993C1D',
      800: '#712B13',
      900: '#4A1B0C',
    },
    // ─── Neutros — Gris rosado cálido ─────────────────────────
    neutral: {
      50:  '#F4EFF2',
      100: '#E6D9DF',
      200: '#C8B8C0',
      400: '#9A8A92',
      600: '#6E5F66',
      800: '#3D3039',
      900: '#241A20',
    },
  },

  // ─── Roles semánticos ─────────────────────────────────────────
  // Estos son los valores que usan los componentes — nunca los hexadecimales directos
  semantic: {
    // Botón principal, links, íconos activos — Coral Rosa de Lima
    actionPrimary:      '#E8637A',
    actionPrimaryHover: '#C44A60',
    actionPrimaryLight: '#FEF0F2',

    // Fondos
    bgPage:             '#F4EFF2',
    bgCard:             '#FFFFFF',
    bgInput:            '#F9F5F7',

    // Textos
    textPrimary:        '#241A20',
    textSecondary:      '#6E5F66',
    textMuted:          '#9A8A92',
    textOnPrimary:      '#FFFFFF',

    // Bordes
    border:             '#E6D9DF',
    borderFocus:        '#E8637A',

    // Estados de pedido
    statusPending:      '#EBF0F7',
    statusPendingText:  '#1E3A5F',
    statusActive:       '#FEF0F2',
    statusActiveText:   '#8F2E42',
    statusAlert:        '#FAECE7',
    statusAlertText:    '#712B13',
    statusDone:         '#EAF3DE',
    statusDoneText:     '#27500A',
  }
}

export type Theme = typeof theme