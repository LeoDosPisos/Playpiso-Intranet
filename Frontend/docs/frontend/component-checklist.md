# Component Checklist

## Objective

This checklist defines the minimum criteria for proposing, reviewing, and implementing UI components in this repository.

It exists to help the team:

- reduce ambiguity before development starts
- keep visual and behavioral consistency across the platform
- improve accessibility and reusability
- review components using objective criteria instead of subjective preference

This checklist should be used:

- during refinement of a new component request
- before implementation starts
- during design review
- during frontend review

## How To Use

Use this checklist in three moments:

1. During discovery, to confirm whether the component is well defined
2. During design review, to validate whether the proposed solution is aligned with product and UX expectations
3. During implementation review, to confirm the delivered component matches the expected standard

If several items cannot be answered, the component is probably not ready for implementation yet.

## Checklist

### 1. Objective

- The component solves a real interface problem
- The component purpose is described in one clear sentence
- It is clear whether this is a new component or a variation of an existing one

### 2. Usage Context

- The screens or flows where the component will appear are identified
- It is clear whether the component is standalone or part of a larger composition
- Primary and secondary usage scenarios are documented

### 3. Content

- The supported content types are defined
- Required content and optional content are differentiated
- Rules for long text, icons, images, actions, and metadata are defined when applicable

### 4. Visual Hierarchy

- The intended visual prominence of the component is clear
- The information priority inside the component is defined
- The component follows the platform's typography, spacing, and color conventions

### 5. Variants

- Necessary variants are explicitly listed
- Each variant has a functional purpose
- Redundant or cosmetic-only variants are avoided

### 6. States

- The required visual states are defined
- The component includes at least `default`, `hover`, `focus`, and `disabled` when applicable
- Additional states such as `active`, `loading`, `error`, `success`, `selected`, or `empty` are defined when needed

### 7. Behavior

- The interaction behavior is documented
- User-triggered events are clear, such as click, focus, typing, expand, or select
- Transitions and animations, if any, have a clear functional purpose

### 8. Responsiveness

- The behavior on mobile, tablet, and desktop is defined
- Layout adjustments for narrow widths are documented
- The component remains legible and usable on smaller screens

### 9. Accessibility

- The correct semantic HTML element is identified
- Keyboard interaction is supported where needed
- Visible focus treatment is defined
- Accessibility requirements such as labels, instructions, status messaging, and `aria-*` usage are documented when applicable

### 10. Reusability

- The component is designed for actual reuse, not only one isolated case
- Expected configuration points or props are defined
- There is a healthy balance between flexibility and consistency

### 11. Design System Alignment

- The component uses approved design tokens for color, spacing, radius, and typography
- Hard-coded values are avoided unless justified
- The component is visually consistent with similar patterns in the platform

### 12. Constraints

- Invalid or discouraged uses are documented
- Visual and behavioral limits are defined
- The component scope is clear, including what it should not do

### 13. Acceptance Criteria

- Approval criteria are objective and testable
- The team can validate the component without relying on subjective interpretation
- The definition of done is clear for both design and development

### 14. Evidence

- A visual reference exists, such as a mockup, wireframe, or screenshot
- Expected states are represented visually when possible
- Examples of correct usage are available

## Review Questions

Before approving a component request, ask:

1. Is the component sufficiently defined to avoid avoidable implementation guesswork?
2. Are accessibility, responsiveness, and states covered clearly enough?
3. Is this truly a new component, or should an existing one be extended instead?
4. Are the acceptance criteria specific enough to support review?

## Implementation Readiness Signal

A component is usually ready to implement when:

- its purpose is clear
- its states and variants are defined
- its responsive behavior is documented
- its accessibility expectations are documented
- its design token usage is understood
- its acceptance criteria are testable

If those conditions are not met, the team should refine the request before implementation starts.

## Related Documentation

- [Styling Guide](/home/inteli/Documentos/Playpiso/kanban/00_Iniciativas/Proposta_Comercial_e_Orçamento_Automartizado/Frontend/docs/frontend/styling.md:1)
- [Styles Directory README](/home/inteli/Documentos/Playpiso/kanban/00_Iniciativas/Proposta_Comercial_e_Orçamento_Automartizado/Frontend/src/styles/README.md:1)
