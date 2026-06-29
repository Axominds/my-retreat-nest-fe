# AuthAdmin Protection Plan

Add `AuthAdmin` extractor to critical mutation endpoints across 3 files in `my_retreat_nest_be`.

## 1. `src/routes/categories.rs`

Add import:
```rust
use crate::utils::extractors::auth::AuthAdmin;
```

| Handler | Signature Change |
|---------|-----------------|
| `create_category` | Add `AuthAdmin(_): AuthAdmin` after `State(state)` |
| `update_category` | Add `AuthAdmin(_): AuthAdmin` after `State(state)` |
| `delete_category` | Add `AuthAdmin(_): AuthAdmin` after `State(state)` |

## 2. `src/routes/retreats.rs`

Add import:
```rust
use crate::utils::extractors::auth::AuthAdmin;
```

| Handler | Signature Change |
|---------|-----------------|
| `create_retreat` | Add `AuthAdmin(_): AuthAdmin` after `State(state)` |
| `update_retreat` | Add `AuthAdmin(_): AuthAdmin` after `State(state)` |
| `delete_retreat` | Add `AuthAdmin(_): AuthAdmin` after `State(state)` |
| `create_retreat_user` | Add `AuthAdmin(_): AuthAdmin` after `State(state)` |
| `update_retreat_user` | Add `AuthAdmin(_): AuthAdmin` after `State(state)` |
| `delete_retreat_user` | Add `AuthAdmin(_): AuthAdmin` after `State(state)` |

## 3. `src/routes/users.rs`

Add import:
```rust
use crate::utils::extractors::auth::AuthAdmin;
```

| Handler | Signature Change |
|---------|-----------------|
| `delete_user` | Add `AuthAdmin(_): AuthAdmin` after `State(state)` |

## Summary

- **10 handlers** across **3 files**
- Each gets one extra extractor parameter — no logic changes
- No new DB columns, no role checks

## Not changed (already protected or intentionally public)

- `update_user` stays `AuthUser` (own profile)
- Reviews stay `AuthUser` (own reviews)
- Galleries stay `AuthUser`
- Wishlists stay `AuthUser`
- All GET/list endpoints stay public
