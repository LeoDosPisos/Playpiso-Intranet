/** Chave da Google Maps JS API, ou undefined quando não configurada. */
export function getMapsApiKey(): string | undefined {
  const key = import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string | undefined
  return key && key.trim() !== '' ? key : undefined
}

/**
 * Fonte única de verdade para mostrar/esconder o seletor de mapa.
 * Sem key, a feature degrada graciosamente (campos seguem como texto livre).
 */
export function useMapsAvailable(): boolean {
  return getMapsApiKey() !== undefined
}
