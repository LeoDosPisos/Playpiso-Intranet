import type { FormValue } from '../types/proposalForm'

export type InvestimentoRow = { label: string }

export function resolveInvestimentoRows(
  productId: string,
  values: Record<string, FormValue>,
): InvestimentoRow[] {
  if (productId === 'beach_tenis') {
    return [
      { label: 'Quadra de Beach Tennis' },
      ...(values.possui_alambrado ? [{ label: 'Alambrado' }] : []),
      ...(values.possui_iluminacao ? [{ label: 'Iluminação' }] : []),
      { label: 'Acessórios' },
      ...(values.possui_eva ? [{ label: 'Proteção EVA (opcional)' }] : []),
    ]
  }

  if (productId === 'quadra_tenis') {
    return [
      { label: 'Piso — Quadra de Tênis — Base Asfáltica' },
      { label: 'Acessório Tênis' },
      ...(values.possui_alambrado ? [{ label: 'Alambrado' }] : []),
      ...(values.possui_iluminacao ? [{ label: 'Iluminação' }] : []),
      ...(values.possui_playcushion ? [{ label: 'Playcushion (opcional)' }] : []),
    ]
  }

  if (productId === 'quadra_poliesportiva') {
    const sports: string[] = []
    if (values.possui_basquete_adulto) {
      const est = values.estrutura_basquete_adulto as string | undefined
      const estruturaLabel =
        est === 'metalica'   ? 'Metálica'  :
        est === 'hidraulica' ? 'Hidráulica' :
        est === 'comum'      ? 'Comum'      : ''
      sports.push(estruturaLabel ? `Basquete Adulto (${estruturaLabel})` : 'Basquete Adulto')
    }
    if (values.possui_basquete_juvenil) sports.push('Basquete Juvenil')
    if (values.possui_volei) sports.push('Vôlei')
    if (values.possui_futebol_futsal) {
      const tipoFutsal = values.tipo_futsal as string | undefined
      sports.push(tipoFutsal === 'mini_trave' ? 'Futebol/Futsal – Mini Trave' : 'Futebol/Futsal')
    }
    if (values.possui_tenis) sports.push('Tênis')

    return [
      { label: 'Quadra Poliesportiva — Piso Asfáltico' },
      ...(sports.length > 0 ? [{ label: `Acessórios – ${sports.join(', ')}` }] : []),
      ...(values.possui_alambrado || values.possui_iluminacao || values.possui_tela_superior || values.possui_tela_sombreamento
        ? [{ label: 'Alambrado, Iluminação e Telas' }]
        : []),
    ]
  }

  return []
}
