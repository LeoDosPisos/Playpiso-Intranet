import type { FormValue } from '../types/proposalForm'

const DISPLAY_LABELS: Record<string, string> = {
  solo_preparado:   'Solo Preparado',
  laje_concreto:    'Laje/Concreto',
  facil:            'Fácil',
  dificil:          'Difícil',
  muito_dificil:    'Muito difícil',
  obra_nova:        'Obra nova',
  reforma:          'Reforma',
}

export function renderSumarioText(
  template: string,
  values: Record<string, FormValue>,
  quantity: number,
): string {
  return template
    .replace(/\{quantity\}/g, String(quantity))
    .replace(/\{\?(\w+):(.*?)\}/g, (_, fieldId, text) => (values[fieldId] ? text : ''))
    .replace(/\(s\)/g, quantity === 1 ? '' : 's')
    .replace(/\{(\w+)\}/g, (_, fieldId) => {
      const raw = String(values[fieldId] ?? '')
      return DISPLAY_LABELS[raw] ?? raw
    })
    .replace(/,\s*,/g, ',')
    .replace(/,\s*\./g, '.')
    .replace(/\s{2,}/g, ' ')
    .trim()
}
