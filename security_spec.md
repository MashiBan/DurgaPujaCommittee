# Security Specification for Agamani Pandal Application

## 1. Data Invariants
- Only verified administrators (`nonchalantlycool0@gmail.com` with `email_verified == true` or registered in `/admins/{uid}`) can create, update, or delete festival records (gallery, schedule, stories, organisers, pandal information).
- Unauthenticated visitors can view public festival content (read-only) for cultural exploration.
- Documents must conform to schema size limits and valid ID formats (alphanumeric, hyphens, underscores up to 128 chars).

## 2. Dirty Dozen Attack Payloads
1. **Unauthenticated Write**: Anonymous visitor trying to create a gallery image -> PERMISSION_DENIED
2. **Email Spoofing Attack**: Attacker claiming `nonchalantlycool0@gmail.com` without `email_verified == true` -> PERMISSION_DENIED
3. **Ghost Fields Injection**: Adding arbitrary malicious property `isAdmin: true` into a gallery photo -> PERMISSION_DENIED
4. **Denial of Wallet Payload**: Submitting a 5MB payload into a small string property -> PERMISSION_DENIED
5. **Path Variable Poisoning**: Injecting SQL/Script or oversized ID (`/gallery/../../etc/passwd`) -> PERMISSION_DENIED
6. **Self-Escalation Attack**: Normal user attempting to write themselves into `/admins/{uid}` -> PERMISSION_DENIED
7. **Cross-Tenant Schedule Tampering**: Non-admin attempting to delete ritual days -> PERMISSION_DENIED
8. **Invalid Enum Attack**: Updating a photo category to `invalid_category` -> PERMISSION_DENIED
9. **Blanket Query Scraping**: Malicious user trying to query unauthorized admin collections -> PERMISSION_DENIED
10. **ID Mismatch Mutation**: Changing immutable document ID field during update -> PERMISSION_DENIED
11. **Null/Empty Key Payload**: Submitting empty payload without required fields -> PERMISSION_DENIED
12. **System Root Write**: Attempting write to `{document=**}` catch-all -> PERMISSION_DENIED
