export type PickedAddress = {
  /** Endereço formatado (vai para o campo de texto). */
  formattedAddress: string
  /** Município extraído do geocoding; '' quando não resolvido. */
  city: string
  /** UF (short_name, ex: 'SP'); '' quando não resolvido. */
  state: string
  /** Coordenadas — retornadas para reposicionar o marcador, não persistidas. */
  lat: number
  lng: number
}
