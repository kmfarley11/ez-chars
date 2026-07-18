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
- `characters`: all locally stored character documents, serialized through each system's current typed character schema. D&D 5e 2014 exports currently use character data layout `dnd5e-2014.v2`.

The export envelope `version` and each character's `meta.schemaVersion` have separate responsibilities. Envelope version `1` identifies this backup container. Character schema versions identify the data layout inside each character and can advance without changing the envelope.

## Import Semantics

The MVP import flow should accept only this export envelope shape. It should not treat arbitrary JSON arrays, raw localStorage envelopes, or partial character fragments as supported backup files.

An import is valid only when:

- the envelope has the expected `kind` and `version`
- `characters` is an array
- every character hydrates through the same schema boundary used for stored character documents

For D&D 5e 2014, imports accept the explicitly supported historical character versions, migrate them into the current validated model, and reject unknown future versions. Migration does not make the backup envelope itself more permissive: raw arrays, storage envelopes, partial fragments, and unknown character versions remain invalid imports.

The UI makes the write behavior explicit before changing local data:

- `replace`: discard current local characters and use the imported characters
- `merge`: add imported characters whose `meta.id` is not already present; skip imported characters with duplicate IDs

Invalid files are non-destructive: failed parsing or failed character validation leaves current local characters unchanged and surfaces a clear user-visible error.

## Current Code Contract

The shared contract lives in [src/schema/importExport.ts](../src/schema/importExport.ts):

- `createCharacterExportEnvelope(characters)` validates current characters and creates the versioned export envelope.
- `safeParseCharacterExportEnvelope(input)` validates the envelope and hydrates contained character documents.

Shared character dispatch and serialization live in [src/schema/storedCharacters.ts](../src/schema/storedCharacters.ts). The D&D 5e 2014 historical schemas and pure migration live under [src/schema/migrations/](../src/schema/migrations/); feature and UI code should consume only hydrated current characters.
