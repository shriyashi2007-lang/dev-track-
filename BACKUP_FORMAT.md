# DevTrack backup format

DevTrack JSON backups use a versioned envelope:

```json
{
  "app": "DevTrack",
  "schemaVersion": 1,
  "exportedAt": "2026-10-25T12:00:00.000Z",
  "appVersion": "1.6.0",
  "data": {
    "problems": [],
    "revisionQueue": [],
    "revisionHistory": [],
    "preferences": {},
    "dailyGoal": 3,
    "recentSearches": []
  },
  "counts": {}
}
```

`revisionQueue` is a portable view derived from the canonical revision state nested in each problem. On restore it is validated and written back into those problem records. Revision history may retain a deleted problem reference only when its record contains a non-empty `snapshotTitle`.

The optional `counts` block is preview metadata only. Import always recomputes counts from validated data. Unknown fields are dropped. Demo authentication (`devtrack:v1:demo_auth`) is never exported.

Merge matches records by ID. Imported problem or queue conflicts win only when their `updatedAt` value is later; ties keep the existing version. Revision history is unioned by ID without replacing an existing entry. Existing preferences remain unless the user explicitly chooses imported preferences. Re-importing the same backup is idempotent.

DevTrack currently persists several localStorage keys. Multi-key writes are not transactional, so restore and clear operations first keep the previous raw values in memory. On failure, DevTrack attempts to restore every previous raw value and verifies the rollback.

CSV exports use UTF-8 with a BOM, CRLF line endings, RFC 4180 quoting, local `YYYY-MM-DD` dates, and `Yes`/`No` revision flags. Text beginning with `=`, `+`, `-`, `@`, a tab, or a carriage return is prefixed with a single quote to prevent spreadsheet formula execution. This intentionally changes those exported cells for safety.
