/**
 * Helpers puros de geocoding. Lidam com os dois formatos de address component:
 * - Place (novo Places API): { longText, shortText, types }
 * - Geocoder: { long_name, short_name, types }
 */

type NormalizedComponent = {
  long: string
  short: string
  types: readonly string[]
}

type RawComponent =
  | google.maps.places.AddressComponent
  | google.maps.GeocoderAddressComponent

function normalize(component: RawComponent): NormalizedComponent {
  if ('longText' in component) {
    return {
      long: component.longText ?? '',
      short: component.shortText ?? '',
      types: component.types ?? [],
    }
  }

  return {
    long: component.long_name,
    short: component.short_name,
    types: component.types,
  }
}

function findByType(components: NormalizedComponent[], type: string) {
  return components.find((component) => component.types.includes(type))
}

/**
 * Extrai município e UF dos address components (regras Brasil):
 * - estado = administrative_area_level_1 (short_name → UF, ex: 'SP')
 * - cidade = administrative_area_level_2 → fallback locality → level_3
 */
export function parseCityState(
  components: readonly RawComponent[] | null | undefined,
): { city: string; state: string } {
  if (!components || components.length === 0) {
    return { city: '', state: '' }
  }

  const normalized = components.map(normalize)

  const stateComponent = findByType(normalized, 'administrative_area_level_1')
  const cityComponent =
    findByType(normalized, 'administrative_area_level_2') ??
    findByType(normalized, 'locality') ??
    findByType(normalized, 'administrative_area_level_3')

  return {
    city: cityComponent?.long ?? '',
    state: stateComponent?.short ?? '',
  }
}

/**
 * Reverse geocoding (clique no mapa / marcador arrastado → endereço).
 * Retorna null quando nenhum resultado é encontrado.
 */
export async function reverseGeocode(
  geocoder: google.maps.Geocoder,
  location: google.maps.LatLngLiteral,
): Promise<google.maps.GeocoderResult | null> {
  try {
    const { results } = await geocoder.geocode({
      location,
      language: 'pt-BR',
      region: 'br',
    })
    return results[0] ?? null
  } catch {
    return null
  }
}
