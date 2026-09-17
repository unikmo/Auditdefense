# PowerGM session-note adapter — discovery stub

PowerGM is currently treated only as a **session-note source**.

## Known
- Product role: source of session notes.
- Current partner workflow: manually verifies/downloads notes and matches them to audit requests.

## BLOCKED pending exact PowerGM export/API details
- export format(s): CSV / PDF / JSON / API
- stable note ID
- patient identifier format
- date-of-service field
- rendering clinician identifier
- author identifier
- created timestamp
- signed timestamp
- locked/finalized timestamp
- supervisor signature/identifier
- amendment/version history
- source audit trail
- bulk export capability

No production parser should be written until a real redacted export/sample schema is provided.
