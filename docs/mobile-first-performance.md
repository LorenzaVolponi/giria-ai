# Mobile-first performance plan

## Objective

Keep the existing product and features while making the mobile experience fast, stable and simple, with a large slang database available through an efficient search layer.

## Priorities

1. Avoid rendering thousands of slang cards at once.
2. Build a reusable search index for terms, variations, categories and regions.
3. Normalize accents, casing and aliases only once.
4. Debounce user input and paginate or virtualize long lists.
5. Lazy-load heavy UI blocks and reduce motion on mobile.
6. Preserve favorites, history, chat, SEO pages and the existing slang data files.

## Acceptance criteria

- Search feels immediate on mid-range mobile devices.
- The glossaries do not render the complete database in one pass.
- Existing features remain available.
- No hydration or console errors.
- No relevant Lighthouse mobile regression.
- The data access layer can later move to an external database without rewriting the UI.
