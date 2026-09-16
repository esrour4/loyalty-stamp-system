# Security Specification: Menu Persistence & Access Controls

## 1. Data Invariants
1. A menu item must have a valid non-empty string ID, a valid categoryId referencing an existing category format, non-empty names in English and Arabic, and a non-negative price.
2. A menu category must have a valid non-empty string ID, non-empty names in English and Arabic, and a non-negative order index.
3. String fields must enforce maximum length limits (max 128 characters for IDs, max 120 for item names, max 500 for descriptions/images) to prevent storage and memory exhaustion attacks.
4. Menu categories and items are publicly readable by clients (customers, baristas, visitors) so that menu exploration works seamlessly without requiring administrative authentication.
5. Direct client modifications to menu data require authenticated requests or must route through the server backend API which validates payloads against schema bounds.

## 2. The "Dirty Dozen" Threat Payloads
1. **Malicious ID injection**: Attempting to insert a document with an ID containing path traversal or 10,000 characters. (Rejected by `isValidId`).
2. **Negative Price**: Submitting a menu item with `price: -50`. (Rejected by schema validation `price >= 0`).
3. **Empty Names**: Submitting `{ nameEn: "", nameAr: "" }`. (Rejected by length constraint `>= 1`).
4. **Massive payload injection**: Submitting a description with 500KB of spam. (Rejected by `description.size() <= 1000`).
5. **Ghost field injection**: Injecting `{ isAdmin: true }` or `{ secretKey: "hacked" }` into a menu category. (Rejected by strict keys constraint).
6. **Non-numeric order index**: Submitting `order: "first"`. (Rejected by type check `order is number`).
7. **Type confusion on price**: Submitting `price: "free"`. (Rejected by `price is number`).
8. **Invalid category reference**: Submitting a menu item with non-string categoryId. (Rejected by `categoryId is string`).
9. **Unauthenticated delete attempt**: Attempting direct client-side delete of all categories without valid credentials. (Rejected by security rules).
10. **Corrupted boolean isAvailable**: Submitting `isAvailable: "yes"`. (Rejected by `isAvailable is bool`).
11. **Timestamp spoofing**: Writing future timestamps or non-datetime strings to `createdAt`. (Guarded by server-generated timestamps).
12. **Null property write**: Writing `nameEn: null`. (Rejected by `is string` type check).
