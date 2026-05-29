Use o prompt em `Frontend/docs/proposta-comercial/system-prompt.md`.

mode: implementation

Implemente o produto `softplay` nos registries declarativos existentes, com base na documentação codável aprovada.

Atualize:
- fieldRegistry.ts
- fieldOptionsRegistry.ts
- sectionRegistry.ts
- productCatalog.ts
- conditionalRules.ts
- exportMappings.ts, se aplicável
- formEngine.ts e FormRenderer.tsx somente se houver acoplamento a seletores de variante de produtos anteriores

Ao final rode:
- npm run build
- npm run lint
