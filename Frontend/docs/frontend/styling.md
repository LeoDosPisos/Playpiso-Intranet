# Styling Guide

## Objective

This project uses a layered CSS architecture to keep styles predictable, reusable, and easy to maintain as the codebase grows.

The goals of this guide are:

- Define where each kind of style belongs
- Reduce style duplication
- Prevent global leakage and selector conflicts
- Make design tokens reusable across pages and components
- Keep the entry point for global styles easy to understand

## Current Style Entry Point

The application entry point is [src/main.tsx](/home/inteli/Documentos/Playpiso/kanban/00_Iniciativas/Proposta_Comercial_e_Orçamento_Automartizado/vite-project/src/main.tsx:1).

Global styles should be imported there so the whole app shares the same style foundation.

Recommended order:

1. `@/styles/tokens.css`
2. `@/styles/reset.css`
3. `@/styles/global.css`
4. `@/styles/utilities.css`

This order matters because:

- `tokens.css` defines reusable values
- `reset.css` removes browser defaults
- `global.css` establishes application-wide base rules
- `utilities.css` adds opt-in helper classes

## Folder Structure

Recommended structure:

```text
src/
  main.tsx
  styles/
    README.md
    tokens.css
    reset.css
    global.css
    utilities.css
  route/
    Root.tsx
    Root.css
    FormPropostaComercial.tsx
```

As the app grows, page or component-specific CSS should live close to the component that owns it.

Example:

```text
src/
  components/
    Button/
      Button.tsx
      Button.module.css
  route/
    FormPropostaComercial/
      FormPropostaComercial.tsx
      FormPropostaComercial.module.css
```

## Responsibility of Each Style File

### `tokens.css`

Purpose:

- Store design decisions as CSS custom properties
- Centralize colors, spacing, radius, typography, shadows, and z-index values

Should contain:

- `:root` variables such as `--color-text`, `--space-4`, `--radius-md`

Should not contain:

- Component classes
- Layout rules
- Element selectors like `h1`, `section`, or `form`

Example:

```css
:root {
  --color-bg: #f7f5ef;
  --color-text: #1f1d1a;
  --space-4: 16px;
  --radius-md: 12px;
}
```

### `reset.css`

Purpose:

- Neutralize inconsistent browser defaults
- Provide a predictable baseline for layout and spacing

Should contain:

- Margin and padding resets
- `box-sizing: border-box`
- Basic media defaults when needed

Should not contain:

- Brand colors
- Component styling
- Page-specific spacing rules

### `global.css`

Purpose:

- Define application-wide base behavior after reset
- Apply typography, background, text color, and base element rules

Should contain:

- `body` font-family, background, and text color
- Base heading and paragraph behavior if intended for the whole app
- Global anchor, button, and form defaults when they are true conventions

Should not contain:

- Route-specific layout
- Unique component classes
- One-off screen tweaks

### `utilities.css`

Purpose:

- Provide small, generic helper classes that can be reused intentionally

Good candidates:

- `.container`
- `.sr-only`
- `.text-center`
- `.visually-hidden`
- `.flex`

Should not contain:

- Business-specific classes like `.proposal-card-main-header`
- Large component definitions
- Complex visual styling that belongs to a component

### Local CSS Near Components or Routes

Purpose:

- Style a specific screen or component without turning global CSS into a dumping ground

Examples:

- `src/route/Root.css`
- `src/components/Button/Button.module.css`

Use local CSS when:

- The style only exists for one page
- The layout is specific to one component
- Reuse is not expected across unrelated parts of the app

Prefer CSS Modules for reusable components because they reduce global selector collisions.

## Decision Flow

Before adding any style, use this decision order:

1. If it is a reusable visual value, add it to `tokens.css`
2. If it is a browser normalization rule, add it to `reset.css`
3. If it must affect the whole application, add it to `global.css`
4. If it is a tiny helper class with broad reuse, add it to `utilities.css`
5. Otherwise, keep it next to the page or component that owns it

## Naming Conventions

Use names that express intent rather than appearance alone.

Prefer:

- `--color-text`
- `--space-4`
- `.page-shell`
- `.form-section`
- `.field-group`

Avoid:

- `--brown-1`
- `--margin-big`
- `.left-box`
- `.div1`

## Import Rules

Global style layers should be imported only once in `src/main.tsx`.

Do:

- Import global style files at the app entry point
- Import local CSS in the component that owns it

Do not:

- Import global CSS from inside route-specific files
- Duplicate the same global rule in multiple places

## Reuse Rules

Before creating a new class or variable:

- Check whether an existing token already solves the value
- Check whether a utility class already solves the behavior
- Check whether the style is truly global or should stay local

If a style starts local and later gets reused in multiple places, promote it carefully:

- value to `tokens.css`
- helper behavior to `utilities.css`
- base convention to `global.css`

## Anti-Patterns

Avoid these patterns:

- Putting global CSS inside route folders
- Styling generic tags everywhere without intent
- Repeating literal values like `16px` and `#1f1d1a` across many files
- Creating a single large stylesheet for unrelated areas
- Using utilities as a replacement for component styling
- Storing page-specific layout rules in `global.css`

## Review Checklist

When reviewing style changes, confirm:

- The style was added in the correct layer
- Tokens are reused instead of hard-coded values
- Global selectors are intentional and minimal
- Component-specific styling stays local
- Naming is semantic and understandable

## Suggested Next Step for This Repository

To align the codebase with this guide:

- Keep `src/styles` as the home for shared style layers
- Use `src/main.tsx` as the only global style import entry point
- Move future route-specific styling into files next to each route component
- Introduce CSS Modules when reusable UI components begin to appear
