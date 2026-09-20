# AuditDefend Phase-1 evidence model

Status: **non-production design contract**. No PHI may be loaded until production security/compliance gates are separately approved.

## Core entities

### Organization
- `orgId`
- practice name
- allowed users / roles
- payer-rule jurisdictions

### Audit case
- `caseId`
- payer
- audit type
- received date
- response deadline
- requested period
- claimed exposure
- allegations[]
- source audit letter metadata
- review state

### Claim / date of service
- `claimId`
- patient reference (internal pseudonymous ID in analytical layers)
- date of service
- CPT/HCPCS
- units
- billed / paid amount
- rendering provider
- payer adjudication metadata

### Evidence artifact
- immutable `artifactId`
- source system
- source record ID
- source filename/hash
- imported timestamp
- document type
- effective dates
- signer / signature metadata when actually available
- extraction confidence
- review state
- version / supersedes reference

Evidence types initially include:
- session note
- treatment plan
- authorization
- EVV / attendance evidence where applicable
- provider credentialing / enrollment evidence
- supervision evidence
- payer correspondence
- remittance / payment evidence

### Evidence link
Links an artifact to one or more claims/DOS and records **why** it was linked.
- exact source key match
- patient + DOS match
- effective-date coverage
- human-confirmed match

### Evidence verification thread
Preserves the comparison without turning it into a legal conclusion.
- `threadId`
- payer allegation text + source locator
- affected claim(s) / DOS
- provider evidence references
- document location pointer or immutable artifact reference
- version context: current copy / original payer submission / rebuttal submission / unknown
- factual comparison status
- attorney disposition + reviewer + timestamp

Allowed factual comparison statuses:
- potential contradiction — attorney review required
- evidence appears to address payer finding
- unresolved — additional evidence required
- payer finding supported by current record

### Collaboration item
- author role
- claim-specific or case-wide scope
- type: counsel analysis / document / provider message / evidence request
- visibility: `counsel-only` or `shared-with-provider`
- optional artifact reference
- created / shared timestamps

Counsel-created material defaults to `counsel-only`. Provider access requires an explicit share action. Sharing creates an in-workspace notification; external notification copy contains no claim or patient detail.

### Finding
A finding is a **review signal, not a legal conclusion**.
- category: documentation / authorization / signature / provider / network / billing / quality
- severity
- affected claims
- source evidence
- applicable payer-rule citation/version if verified
- machine rationale
- human disposition

### Payer rule
Rules must be versioned and source-cited.
- payer / plan / program
- jurisdiction
- effective dates
- rule type
- source URL/document/page
- extracted rule text summary
- verification status
- reviewer

### Provider chronology event
- provider / supervisor
- event type
- date/effective period
- source artifact
- status: evidence / disputed / verified

### Binder manifest
A generated response binder must preserve:
- case version
- included claim IDs
- included artifact IDs + hashes
- issue matrix version
- generated timestamp
- generating user/process
- human approval state

## Phase-1 architecture rule

The evidence graph is source-agnostic. PowerGM is currently only the session-note source. Billing, treatment plans, authorizations, credentialing, network status and payer correspondence may come from separate systems/files.
