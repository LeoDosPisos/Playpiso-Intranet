# Integração Google Maps nos campos de endereço

Documento de arquitetura da feature que adiciona seleção de endereço via mapa Google aos
campos da seção **"Dados da obra"** do formulário de proposta comercial.

## Objetivo

Os campos `endereco_cliente` e `local_obra` eram texto livre. Digitar endereço à mão é
lento e gera inconsistência (grafias diferentes, cidade/estado divergentes). A feature
adiciona um **ícone de pin** no canto direito de cada campo; ao clicar, abre um **dialog
com mapa Google + busca de endereço**. O usuário busca/arrasta o marcador, confirma, e o
endereço formatado volta para o campo.

## Decisões

1. **Escopo de campos:** o seletor de mapa aparece em `endereco_cliente` **e** `local_obra`.
2. **Persistência:** grava apenas o **texto** do endereço formatado no campo existente.
   **Sem mudanças de backend/DB**, sem persistir latitude/longitude. Escopo 100% frontend.
3. **Auto-preenchimento:** ao escolher endereço para `endereco_cliente`, preenche também
   `cidade` e `estado` (UF) a partir dos `address_components` do geocoding. Para
   `local_obra`, preenche só o campo de endereço.
4. **Biblioteca:** [`@vis.gl/react-google-maps`](https://visgl.github.io/react-google-maps/)
   (mantida pelo Google, compatível com React 19).

## APIs Google usadas

- **Maps JavaScript API** — renderização do mapa (`<Map>`).
- **Places API (New)** — autocomplete de endereço.
- **Geocoding API** — reverse geocoding (marcador arrastado/clique no mapa → endereço) e
  extração de cidade/estado.

Todas precisam estar habilitadas no projeto Google Cloud, com billing ativo, na mesma
API key.

## Constraint técnico decisivo

O widget legado `google.maps.places.Autocomplete` / `AutocompleteService` **não está
disponível para API keys novas** (corte da Google em 01/03/2025). Como usamos uma key
nova, a integração é construída sobre o **novo Places API**:

- `google.maps.places.AutocompleteSuggestion.fetchAutocompleteSuggestions(request)` →
  predições.
- `suggestion.placePrediction.toPlace().fetchFields({ fields: [...] })` → resolve um
  `Place` com `location`, `formattedAddress` e `addressComponents`.

O autocomplete é um componente **custom** (input + dropdown) sobre essa API — não o
`<PlaceAutocompleteElement>` (web component ainda alpha em React/TS).

`<AdvancedMarker>` exige um `mapId` de mapa vetorial; usamos `mapId="DEMO_MAP_ID"` (sem
setup no Cloud Console). Trocar por um `mapId` próprio depois, se quiser estilo da marca.

## Configuração (env)

Variável Vite, lida via `import.meta.env.VITE_GOOGLE_MAPS_API_KEY`:

```
VITE_GOOGLE_MAPS_API_KEY=<sua-key>
```

Fica **em branco** no `.env.development` versionado; cada dev preenche localmente.

### Degradação graciosa

Sem a key, `useMapsAvailable()` retorna `false`: o botão de pin não é renderizado, o
`<APIProvider>` não é montado (nenhum script Google carrega) e os campos continuam
editáveis por digitação — sem erros no console e sem requisições.

## Estrutura de código

```
Frontend/src/pages/FormPropostaComercial/
  index.tsx                         # monta <APIProvider> (condicional à key) em volta do form
  components/
    SectionRenderer.tsx             # FieldRenderer usa AddressFieldControl p/ os 2 campos
    FormRenderer.module.css         # .addressInputRow, .mapPinButton
    maps/
      types.ts                      # PickedAddress
      useMapsAvailable.ts           # boolean a partir da env var
      geocoding.ts                  # parseCityState(), reverseGeocode()
      MapPinButton.tsx              # botão com SVG inline de pin
      AddressAutocomplete.tsx       # input + dropdown sobre o novo Places API
      AddressPickerDialog.tsx       # dialog (portal) com mapa + autocomplete
      AddressPickerDialog.module.css
      AddressFieldControl.tsx       # wrapper por-campo (input + pin + dialog)
```

Viés Brasil aplicado em 3 camadas: `<APIProvider region="BR" language="pt-BR">`, request do
autocomplete (`includedRegionCodes: ['br']`) e geocoder (`region: 'br'`).

Parsing BR dos `address_components`: estado = `administrative_area_level_1` (short_name → UF);
cidade = `administrative_area_level_2` → fallback `locality` → `administrative_area_level_3`.
