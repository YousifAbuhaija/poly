---
name: modern-ui-ux
description: Use this skill when designing, reviewing, or refining product interfaces so outputs follow modern UI/UX best practices with clean hierarchy, strong usability, accessibility, and implementation-aware design decisions.
---

# Modern UI/UX Skill

## Purpose
This skill helps produce interfaces that feel modern, polished, and usable rather than visually noisy, inconsistent, or hard to implement. Use it for:
- landing pages
- app screens
- dashboards
- flows and wireframes
- component design
- design critiques
- UI refactors
- frontend implementation guidance

The goal is not to chase trends. The goal is to create clear, high-confidence interfaces with:
- strong visual hierarchy
- clean spacing
- consistent patterns
- accessible interactions
- restrained use of color and effects
- implementation-aware details

## Core Product Design Principles

### 1. Clarity over decoration
Every element should have a job. Remove decoration that does not improve comprehension, affordance, trust, or brand tone.

Apply these rules:
- prefer fewer stronger elements over many competing elements
- use one obvious primary action per section
- reduce duplicate labels, helper text, and visual chrome
- let spacing create separation before adding borders, shadows, or backgrounds
- simplify wording before adding more UI

### 2. Strong hierarchy
Users should know what matters in under 3 seconds.

Always establish:
- one dominant focal point per screen
- clear distinction between page title, section title, labels, and body text
- obvious primary vs secondary actions
- grouped related controls
- predictable scan paths from top to bottom and left to right

### 3. Consistency creates trust
Inconsistent radius, spacing, typography, icon style, and button treatment make products feel unfinished.

Keep consistent:
- spacing scale
- border radius scale
- input and button heights
- icon sizing
- heading sizes
- surface treatments
- interaction states
- terminology

### 4. Design for real usage
Design for errors, edge cases, loading, empty states, long text, short text, dense data, and mobile constraints.

Always account for:
- skeleton or loading state
- empty state with next step
- error state with recovery action
- disabled state explanation where relevant
- destructive action confirmation
- success feedback
- realistic content lengths
- responsive collapse behavior

### 5. Accessibility is part of quality
A modern design that is hard to read or use is not good design.

Always ensure:
- sufficient color contrast
- visible focus states
- buttons and inputs with accessible sizes
- labels are clear and persistent
- color is not the only signal
- interactive elements are obviously interactive
- keyboard and screen-reader friendly structure when implementation is requested

## Visual System Rules

### Color
Use color with discipline.
- prefer a neutral base with one primary accent and limited semantic colors
- reserve saturated color for actions, highlights, and important status
- avoid using many bright colors at the same hierarchy level
- use subtle surface differentiation instead of loud fills
- semantic colors should be conventional and readable:
  - success = green
  - warning = amber/yellow
  - error = red
  - info = blue

Recommended structure:
- background
- elevated surface
- muted surface
- primary text
- secondary text
- border/subtle divider
- primary accent
- semantic success/warning/error

### Typography
Typography should do most of the hierarchy work.
- use fewer sizes, more deliberately
- keep body text highly readable
- avoid large jumps in style between neighboring text elements
- use medium or semibold for emphasis before increasing size
- avoid ultra-light weights in product UI
- keep line length reasonable in content-heavy areas

Recommended scale:
- display: only for hero moments
- h1: page title
- h2: section title
- h3: card/dialog title
- body
- secondary/body-small
- label/caption

### Spacing
Spacing is the fastest way to make an interface feel premium.
- use a defined spacing scale such as 4, 8, 12, 16, 24, 32, 40, 48
- use tighter spacing within components and larger spacing between groups
- increase padding before adding decorative dividers
- avoid accidental spacing values
- align to consistent vertical rhythm

Rule of thumb:
- 8–12 inside tight control groups
- 16–24 inside cards and sections
- 24–40 between major sections

### Radius and borders
- use one small radius and one larger radius consistently
- keep borders subtle
- do not stack border + heavy shadow + tinted fill unless intentionally emphasizing a component
- rounded corners should support the brand tone, not become the entire aesthetic

### Shadows and blur
- use shadows sparingly and softly
- prefer subtle elevation over dramatic floating
- use blur/glass only when it improves layering and still preserves readability
- if blur is used, increase contrast of text and controls placed on it

## Layout Guidelines

### General layout
- design from content structure first, then style
- maintain a clear container width
- align to a grid
- preserve generous whitespace around key content
- avoid edge-to-edge chaos unless the experience intentionally calls for immersion

### Responsive behavior
Define how the layout changes, not just how it shrinks.
- desktop: leverage whitespace and multi-column organization
- tablet: reduce columns and preserve touch comfort
- mobile: prioritize one-column flows, sticky CTA only when useful, and reduced chrome

For responsive decisions:
- move secondary info below primary content
- collapse dense controls into drawers or segmented steps
- keep primary actions reachable
- prevent cards from becoming overly wide or cramped

### Section design
Each section should answer:
- what is this?
- why does it matter?
- what can I do here?

A strong section typically has:
- title
- brief supporting copy only if needed
- content block
- one main action or clear next step

## Component Guidance

### Buttons
- one primary button style per screen context
- secondary buttons should be visually quieter but still obvious
- destructive buttons should be distinct and used sparingly
- button text should be action-oriented and specific
- avoid too many equal-weight CTAs in the same area

### Inputs and forms
- labels should stay visible; do not rely on placeholders as labels
- group related fields logically
- show validation near the relevant field
- reduce unnecessary fields
- prefer smart defaults, inline help, and progressive disclosure
- reflect field states clearly: default, focus, filled, error, disabled, success

### Cards
Cards should group content, not merely decorate it.
- keep card content aligned to a clear structure
- maintain consistent padding
- avoid stuffing cards with too many unrelated actions
- if every item becomes a card, question whether a simpler list would be better

### Tables and data-heavy UI
- prioritize readability over decoration
- align numbers consistently
- use row density appropriate to the task
- keep actions predictable
- freeze or pin only what materially helps the task
- avoid turning simple data into over-styled card grids without reason

### Navigation
Navigation should make location and movement obvious.
- keep top-level navigation limited
- use progressive disclosure for deeper complexity
- highlight the current location clearly
- avoid mixing unrelated navigation patterns without a clear reason
- mobile navigation should prioritize the few most valuable destinations

### Modals and drawers
Use them only when they reduce context switching.
- keep dialogs focused on one task
- avoid long complex forms in small modals if a full page would be clearer
- provide obvious close/cancel behavior
- for destructive actions, be explicit about consequences

### Empty states
A good empty state includes:
- what happened
- why it is empty if useful
- the next action

Avoid generic emptiness. Make it actionable.

## Interaction Design

### Motion
Motion should clarify, not distract.
Use it to:
- confirm cause and effect
- show continuity between states
- draw attention gently
- smooth layout changes

Avoid:
- long animations
- excessive bouncing
- decorative motion on every element
- delayed interactions that make the UI feel sluggish

### Feedback
Users should never wonder whether something worked.
Always provide:
- hover or press feedback where appropriate
- focus indication
- loading feedback
- success confirmation for meaningful actions
- clear error explanation with next step

### Affordance
Make clickable things look clickable.
- links should read like links
- buttons should look pressable
- drag handles should suggest dragging
- editable regions should not look like static text

## Modern Aesthetic Direction

Use these tendencies, but apply with restraint:
- neutral backgrounds with selective accent color
- layered surfaces with subtle contrast
- generous whitespace
- larger radius on containers, moderate radius on controls
- concise copy
- icon usage that supports scanning rather than decoration
- subtle micro-interactions
- carefully chosen typography with visible hierarchy
- low-noise backgrounds
- one standout hero visual rather than many competing visual tricks

Avoid these anti-patterns:
- too many gradients
- too many shadows
- overuse of glassmorphism
- tiny low-contrast text
- too many card variants
- center-aligning large blocks of body copy
- multiple accent colors fighting for attention
- unlabeled icons
- fake complexity used to appear “advanced”

## UX Decision Heuristics

When deciding between options, prefer the one that:
- reduces cognitive load
- makes the next step clearer
- uses a familiar pattern unless novelty adds real value
- preserves accessibility
- is easier to implement consistently
- scales better across states and screen sizes

## Implementation-Aware Guidance

When the task includes frontend code or component specs:
- define tokens before writing components:
  - spacing
  - color roles
  - typography scale
  - radius
  - elevation
- build reusable patterns before one-off variants
- keep component APIs simple
- design state coverage from the start
- avoid fragile layouts dependent on perfect content length
- test with realistic text and data
- ensure keyboard support and semantic structure

## Output Style Instructions
When using this skill, produce deliverables that are practical and structured.

If asked for a design concept, provide:
1. screen goal
2. target user action
3. information hierarchy
4. layout structure
5. component recommendations
6. interaction notes
7. accessibility notes
8. visual style direction
9. responsive behavior

If asked to critique a UI, structure the review as:
1. what works
2. what weakens clarity or usability
3. highest-impact improvements
4. quick wins
5. implementation notes

If asked to generate frontend UI, ensure:
- clean component structure
- restrained styling
- clear hierarchy
- polished states
- accessible semantics
- responsive behavior
- no unnecessary visual noise

## Design Review Checklist
Before finalizing any design, verify:
- Is the primary action immediately obvious?
- Is the hierarchy clear at a glance?
- Is the spacing consistent?
- Are colors restrained and purposeful?
- Is the text readable and concise?
- Are states covered: loading, empty, error, success, disabled?
- Is the design accessible?
- Does it feel cohesive, not assembled?
- Could any section lose 20% of its elements and improve?
- Is the design still strong without trendy effects?

## References
See:
- `references/ui-review-checklist.md`
- `references/component-patterns.md`
- `assets/design-brief-template.md`
