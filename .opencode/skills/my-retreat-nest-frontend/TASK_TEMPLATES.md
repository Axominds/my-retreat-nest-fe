# TASK_TEMPLATES.md

Below are reusable task prompts for the My Retreat Nest frontend agent.

---

# 1. Inspect the project first
Use this before asking the agent to build anything significant.

## Prompt
Analyze this Next.js codebase and identify the frontend architecture used for My Retreat Nest.

Your task:
1. Inspect the routing structure, shared UI components, styling system, API utilities, auth handling, and data-fetching patterns.
2. Identify whether the app uses App Router or Pages Router.
3. Identify where API calls are currently implemented.
4. Identify how authentication tokens are stored and refreshed.
5. Identify any existing retreat listing/detail UI, wishlist logic, review UI, or gallery UI.
6. Summarize the recommended way to implement new features in this repo without breaking existing conventions.

Output:
- project structure summary
- detected conventions
- risky areas
- recommended implementation approach for future tasks

---

# 2. Build retreat listing page
## Prompt
Build or improve the retreat listing page for My Retreat Nest.

Requirements:
- First inspect the codebase and reuse existing route, card, and API patterns.
- Fetch retreat data from the retreats listing endpoint using the project’s API conventions.
- Support paginated retreat listing if pagination metadata exists.
- Render a responsive retreat grid/list using reusable retreat card components.
- Each card should display the most useful available fields such as retreat image, name, location, category, budget/price, and short description snippet if present.
- Add loading, empty, and error states.
- If the codebase already has filters/search UI, integrate with it; otherwise keep the page extensible for filters without overbuilding.
- Do not redesign unrelated pages.
- Before coding, tell me which files you plan to create or modify.

Output:
- implementation plan
- code changes
- assumptions about retreat fields or pagination

---

# 3. Build retreat detail page
## Prompt
Build or improve the retreat detail page for My Retreat Nest.

Requirements:
- Inspect the existing codebase and reuse current routing, layout, and API conventions.
- Fetch retreat detail data from the retreat detail endpoint.
- Structure the page into modular sections rather than one giant file.
- Include a main retreat information section, gallery section, reviews section, and wishlist action if the app supports it.
- Gracefully handle missing optional fields.
- Add loading/error states consistent with the existing project.
- Reuse existing UI components where possible.
- Before coding, tell me the files you will create or modify.

Output:
- plan
- implementation
- changed files
- assumptions

---

# 4. Add wishlist toggle to retreat cards and detail page
## Prompt
Add wishlist functionality for My Retreat Nest retreats.

Requirements:
- First inspect the existing auth flow and API layer.
- Implement or reuse a centralized wishlist API helper for:
  - add retreat to wishlist
  - remove retreat from wishlist
  - fetch wishlist page if needed
- Add a wishlist toggle UI that can be used on retreat cards and the retreat detail page.
- Handle authenticated vs unauthenticated behavior gracefully.
- Avoid duplicate requests when users click repeatedly.
- Keep the UI consistent with the existing design system.
- Do not create a separate competing auth or API pattern.
- Before coding, explain which files will change and how you plan to share wishlist logic.

Output:
- plan
- implementation
- changed files
- follow-up notes

---

# 5. Build wishlist page
## Prompt
Create a user wishlist page for My Retreat Nest.

Requirements:
- Inspect the existing codebase for auth guards, account pages, and retreat card reuse opportunities.
- Use the authenticated wishlist endpoint to fetch the current user’s saved retreats.
- Render wishlist items using the same retreat card design system used elsewhere if possible.
- Support empty state, loading state, and auth-required state.
- If the project already has account navigation, integrate the page there instead of inventing a separate structure.
- Before coding, tell me the files you plan to create or modify.

Output:
- implementation plan
- code changes
- any auth assumptions

---

# 6. Build login page
## Prompt
Create or improve the login page for My Retreat Nest.

Requirements:
- Inspect the existing auth utilities, token storage approach, and form patterns before coding.
- Use the backend login endpoint and integrate with the current auth strategy rather than inventing a new one.
- Build a typed login form with loading, error, and success handling as appropriate.
- Keep the implementation modular so auth submission logic is not tightly coupled to page layout.
- If refresh-token helpers or authorized fetch utilities already exist, reuse them.
- Before coding, explain how auth currently works in this repo and which files you will change.

Output:
- auth inspection summary
- plan
- implementation
- changed files

---

# 7. Build signup page
## Prompt
Create or improve the signup page for My Retreat Nest.

Requirements:
- Inspect the current auth and form patterns first.
- Use the create user endpoint for signup.
- Keep validation and API submission logic clean and typed.
- Preserve user-entered values on validation error.
- Reuse shared form components if they exist.
- Do not implement a separate competing auth flow.
- Before coding, list the files you will create or modify.

Output:
- plan
- implementation
- changed files
- assumptions about signup response behavior

---

# 8. Add reviews section to retreat detail page
## Prompt
Implement the reviews section for a retreat detail page in My Retreat Nest.

Requirements:
- Inspect the current retreat detail page and existing auth utilities first.
- Fetch retreat reviews from the reviews list endpoint.
- Render a review list with rating and review content.
- Include empty/loading/error states.
- If authenticated review creation is in scope, add a review form using the create review endpoint.
- Keep review list and review form in separate components if the feature is non-trivial.
- If edit/delete own review is already supported elsewhere in the app, reuse the same patterns.
- Before coding, tell me the files you plan to create or modify.

Output:
- plan
- implementation
- changed files
- assumptions about review shape

---

# 9. Build review submission form
## Prompt
Add a review submission form for My Retreat Nest retreat pages.

Requirements:
- First inspect the auth flow and current form component patterns.
- Submit reviews to the authenticated retreat review endpoint.
- Provide rating input and review text input.
- Show validation, pending, success, and error states.
- Preserve user input when submission fails.
- Keep the review form logic separate from the static retreat detail UI.
- If the codebase already uses a form library or schema validation approach, follow it.
- Before coding, explain how you will integrate the form into the existing detail page architecture.

Output:
- plan
- implementation
- changed files

---

# 10. Build retreat gallery section
## Prompt
Build or improve the gallery section on the retreat detail page for My Retreat Nest.

Requirements:
- Inspect how retreat detail data and image assets are currently handled.
- Fetch retreat gallery items from the backend gallery endpoint if they are not already included in the retreat detail response.
- Render a responsive gallery UI consistent with the existing project style.
- Handle missing images or empty galleries gracefully.
- Keep the gallery UI modular and separate from unrelated page concerns.
- Before coding, list the files you plan to create or modify.

Output:
- plan
- implementation
- changed files
- image URL assumptions

---

# 11. Build retreat gallery management/upload UI
## Prompt
Create an authenticated retreat gallery management UI for My Retreat Nest.

Requirements:
- Inspect current auth, API utilities, and any existing dashboard/management screens first.
- Implement gallery upload using multipart form submission to the retreat gallery upload endpoint.
- Add support for viewing current gallery items, uploading new ones, and deleting items if in scope.
- Show upload pending state and clear error handling.
- Keep gallery upload logic separate from gallery display logic.
- Reuse shared form/input/button components if available.
- Before coding, explain which files you plan to create or modify and how you will keep upload logic isolated.

Output:
- plan
- implementation
- changed files
- assumptions about gallery metadata fields

---

# 12. Build category-based retreat browsing
## Prompt
Build a category browsing experience for My Retreat Nest.

Requirements:
- Inspect existing category pages, filters, or homepage sections first.
- Use the categories endpoint and retreat listing endpoint according to existing project conventions.
- Build either:
  - a category index page,
  - category filters on the retreat listing page,
  - or category detail/listing pages,
  depending on the existing route structure and current task.
- Reuse retreat cards and pagination patterns where possible.
- Do not invent a second listing architecture if one already exists.
- Before coding, explain the existing listing structure and your planned file changes.

Output:
- plan
- implementation
- changed files

---

# 13. Add search and filters to retreat listing
## Prompt
Add search and filtering UX to the retreat listing page for My Retreat Nest.

Requirements:
- First inspect whether the backend already supports query parameters for filtering or whether existing frontend filtering is local-only.
- Reuse the current listing page and API patterns.
- Add search/filter UI only in a way that matches supported backend fields or the project’s current UX.
- Keep filters and query-state logic separate from retreat card rendering.
- Support loading and empty states when filters change.
- Before coding, tell me:
  - which filters are actually supported by the backend or existing frontend data
  - which files you will create or modify

Output:
- plan
- implementation
- changed files
- backend filter assumptions

---

# 14. Build account/profile page
## Prompt
Build a user account/profile page for My Retreat Nest.

Requirements:
- Inspect current auth guards, user API utilities, and account-related routes first.
- Use the existing authenticated user context or token strategy already present in the app.
- Show relevant user details and optionally allow profile editing if the task includes it.
- Keep account UI consistent with wishlist and other user pages.
- Before coding, explain the current auth/account structure and the files you plan to change.

Output:
- plan
- implementation
- changed files

---

# 15. Build owner/admin retreat management UI
## Prompt
Build a retreat management UI for authenticated owners/admins in My Retreat Nest.

Requirements:
- First inspect whether the codebase already has protected dashboard routes or management screens.
- Use existing auth and API patterns.
- Build CRUD-oriented UI for retreat management only within the existing route structure or a clearly scoped new protected area.
- Keep management pages separate from public retreat discovery pages.
- Reuse form components and gallery management patterns if they already exist.
- Do not redesign the public website while building admin features.
- Before coding, provide a file-level implementation plan.

Output:
- plan
- implementation
- changed files
- assumptions about owner/admin permissions

---

# 16. Create shared API client for My Retreat Nest
## Prompt
Refactor or create a centralized API client layer for the My Retreat Nest frontend.

Requirements:
- First inspect all existing API calls in the codebase.
- Identify whether the project already has a shared fetch helper or domain-specific API modules.
- If the API layer is fragmented, consolidate it carefully without breaking existing behavior.
- Account for the backend response envelope `{ data, message, meta }`.
- Add typed helpers for key domains such as auth, retreats, reviews, wishlist, and categories as appropriate for the current codebase size.
- Do not perform a massive rewrite if a smaller incremental improvement is safer.
- Before coding, explain the current API architecture and the migration plan.

Output:
- architecture inspection summary
- plan
- implementation
- changed files

---

# 17. Audit the frontend against the backend contract
## Prompt
Audit the current My Retreat Nest frontend against the backend API contract.

Requirements:
- Compare the frontend routes, types, auth handling, API calls, and UI flows against the known backend endpoints and response patterns.
- Identify missing features, inconsistent endpoint usage, missing auth handling, broken assumptions, and opportunities for shared abstractions.
- Pay special attention to:
  - retreat listing/detail
  - reviews
  - galleries
  - wishlist
  - login/signup
  - pagination handling
  - response envelope handling
- Do not change code yet unless explicitly asked.
- Produce a practical action list prioritized by impact.

Output:
- findings
- risks
- missing pieces
- recommended implementation order
