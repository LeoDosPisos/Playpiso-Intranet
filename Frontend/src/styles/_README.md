# Styles Directory

This folder contains the shared style foundation for the application.

## File Responsibilities

- `tokens.css`: design tokens such as colors, spacing, radius, and other reusable values
- `reset.css`: browser normalization and baseline reset rules
- `global.css`: app-wide base styles that should affect the whole interface
- `utilities.css`: small reusable helper classes with generic purpose

## Usage Rules

- Import shared global style layers only from `src/main.tsx`
- Keep page or route-specific CSS next to the component that owns it
- Add reusable values to `tokens.css` before hard-coding them in local styles
- Avoid placing one-off screen rules in `global.css`

## Decision Rule

- Shared value: `tokens.css`
- Reset or browser fix: `reset.css`
- Whole-app convention: `global.css`
- Small reusable helper: `utilities.css`
- Single page or component concern: local CSS beside that component

See [docs/frontend/styling.md](/home/inteli/Documentos/Playpiso/kanban/00_Iniciativas/Proposta_Comercial_e_Orçamento_Automartizado/Frontend/docs/frontend/styling.md:1) for the full guide.
