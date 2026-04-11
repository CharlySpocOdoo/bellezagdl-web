export const theme = {
  colors: {
    // ─── Primario — Rosa elegante ─────────────────────────────
    primary: {
      50:  '#FBEAF0',
      100: '#F4C0D1',
      200: '#ED93B1',
      400: '#D4537E',
      600: '#993556',
      800: '#72243E',
      900: '#4B1528',
    },
    // ─── Secundario — Morado suave ────────────────────────────
    secondary: {
      50:  '#EEEDFE',
      100: '#CECBF6',
      200: '#AFA9EC',
      400: '#7F77DD',
      600: '#534AB7',
      800: '#3C3489',
      900: '#26215C',
    },
    // ─── Acento — Coral cálido ────────────────────────────────
    accent: {
      50:  '#FAECE7',
      100: '#F5C4B3',
      200: '#F0997B',
      400: '#D85A30',
      600: '#993C1D',
      800: '#712B13',
      900: '#4A1B0C',
    },
    // ─── Neutros — Gris cálido ────────────────────────────────
    neutral: {
      50:  '#F1EFE8',
      100: '#D3D1C7',
      200: '#B4B2A9',
      400: '#888780',
      600: '#5F5E5A',
      800: '#444441',
      900: '#2C2C2A',
    },
  },

  // ─── Roles semánticos ─────────────────────────────────────────
  // Estos son los valores que usan los componentes — nunca los hexadecimales directos
  semantic: {
    // Botón principal, links, íconos activos
    actionPrimary:     '#D4537E',
    actionPrimaryHover:'#993556',
    actionPrimaryLight:'#FBEAF0',

    // Fondos
    bgPage:            '#F1EFE8',
    bgCard:            '#FFFFFF',
    bgInput:           '#FFFFFF',

    // Textos
    textPrimary:       '#2C2C2A',
    textSecondary:     '#5F5E5A',
    textMuted:         '#888780',
    textOnPrimary:     '#FFFFFF',

    // Bordes
    border:            '#D3D1C7',
    borderFocus:       '#D4537E',

    // Estados de pedido
    statusPending:     '#EEEDFE',
    statusPendingText: '#3C3489',
    statusActive:      '#FBEAF0',
    statusActiveText:  '#72243E',
    statusAlert:       '#FAECE7',
    statusAlertText:   '#712B13',
    statusDone:        '#EAF3DE',
    statusDoneText:    '#27500A',
  }
}

export type Theme = typeof theme