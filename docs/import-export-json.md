# JSON Import/Export

This document defines the MVP JSON backup contract for `p0-020`.

## Export Shape

Exports are a public backup envelope, not the raw localStorage value.

```json
{
	"kind": "ez-chars.character-export",
	"version": 1,
	"exportedAt": "2026-05-14T12:00:00.000Z",
	"app": {
		"name": "ez-chars"
	},
	"characters": []
}
```

Fields:

- `kind`: literal `ez-chars.character-export`; distinguishes app backups from unrelated JSON.
- `version`: export envelope version; MVP starts at `1`.
- `exportedAt`: ISO timestamp generated when the file is exported.
- `app`: optional producer metadata; MVP uses `{ "name": "ez-chars" }`.
- `characters`: all locally stored character documents, using the current typed character schema.

## Import Semantics

The MVP import flow should accept only this export envelope shape. It should not treat arbitrary JSON arrays, raw localStorage envelopes, or partial character fragments as supported backup files.

An import is valid only when:

- the envelope has the expected `kind` and `version`
- `characters` is an array
- every character validates through the same schema boundary used for stored character documents

The UI makes the write behavior explicit before changing local data:

- `replace`: discard current local characters and use the imported characters
- `merge`: add imported characters whose `meta.id` is not already present; skip imported characters with duplicate IDs

Invalid files are non-destructive: failed parsing or failed character validation leaves current local characters unchanged and surfaces a clear user-visible error.

## Current Code Contract

The shared contract lives in [src/schema/importExport.ts](../src/schema/importExport.ts):

- `createCharacterExportEnvelope(characters)` creates the versioned export envelope.
- `safeParseCharacterExportEnvelope(input)` validates the envelope and contained character documents.
