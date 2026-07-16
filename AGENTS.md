# StructBX — Agent instructions

## Build & dev

- **Build system**: CMake 3.16+ with Conan (`conanfile.txt`) for C++ deps.
- **Static linking**: Enabled by default (`BUILD_STATIC=ON`). The binary is self-contained.
  - To disable (faster dev iterations): `cmake ... -DBUILD_STATIC=OFF`
- **Dev setup** (required order):
  1. `./init_envDev.sh` — creates `build/Debug/`, runs `conan install`
  2. `cmake -S . -B build/Debug -DCMAKE_BUILD_TYPE=Debug`
  3. `cmake --build build/Debug`
- **Release build**: `./build.sh` (destroys/recreates `build/`, fresh cmake + install).
- **Quick build** (without Conan, using system packages):
  ```
  sudo apt install cmake g++ libpoco-dev libmariadb-dev libyaml-cpp-dev libssl-dev zlib1g-dev
  cmake -S . -B build -DCMAKE_BUILD_TYPE=Release
  cmake --build build --parallel $(nproc)
  ```
- **No in-source builds** — CMake enforces this (`cmake/build.cmake`).
- **Run**: `build/Debug/structbx-server --config build/Debug/config-files/properties.yaml`
- **Port**: 3001 (HTTPS, configurable in YAML).
- **Config**: CMake generates `properties.yaml`, `cert.pem`, `key.pem` from templates in `conf/`.
- **Version**: auto-derived via `git describe --tags`.
- **Docker**: multi-stage (gcc:12 → debian:12-slim). Build: `docker build -t structbx:latest .`
- **Install from pre-built binary** (any Linux):
  ```sh
  curl -fsSL https://structbx.ai/install.sh | sh
  ```

## Project layout

- `src/structbx-server.cpp` — entrypoint
- `src/` — C++ server (controllers/, core/, handlers/, http/, query/, security/, sessions/, tools/)
- `web/` — jQuery + Bootstrap 5 frontend (static files served by the C++ server)
- `cmake/` — CMake modules (build, find_packages, version, source, install)
- `conf/` — YAML config templates, DB schema (`db.sql`), SSL cert/key templates
- `.continue/rules/rules.md` — detailed coding standards (Allman style, Poco conventions, DB naming, commit format)

## Dependencies

| Layer | Manager | Install |
|-------|---------|---------|
| C++ (Poco, yaml-cpp, MariaDB) | Conan or system packages | `apt install cmake g++ libssl-dev libpoco-dev libmariadb-dev libyaml-cpp-dev` |
| JS (jQuery, Bootstrap 5, wtools) | npm | Run `npm install` in `web/` |

## Tests, lint, format

**None configured.** No test framework, test targets, linter, or formatter.

## CI

GitHub Actions (`.github/workflows/docker.yml`) — **only on GitHub release**:
1. Builds and pushes Docker image to `ghcr.io/structbx/structbx` (dynamic linking)
2. Builds **static binary** + web tarball and uploads them as release assets (used by `install.sh`)

## Internationalization (i18n) & error messages

The project supports **English** and **Spanish** (and more languages may be added later).  
Every user-facing text MUST go through the i18n system — never hardcode strings.

### Frontend (JavaScript / HTML)

- **Translation file**: `web/assets/js/i18n/uiTexts.js`
- **Usage from JS**: `window.structbxI18n.t('section.key')` or `i18n.t('section.key')`
- **Usage from HTML**: `data-i18n="section.key"` (textContent), `data-i18n-html="section.key"` (innerHTML), `data-i18n-placeholder="section.key"`, `data-i18n-title="section.key"`
- **Adding a new translation**: Add an entry under the relevant section in `uiTexts.js` with `en` and `es` keys.
- **Variable interpolation**: Use `${param}` in the string and pass `{param: value}` as second arg to `i18n.t()`.

### Backend (C++)

- **Error code file**: `src/core/error_codes.h`
- **Error code format**: `ERR_AREA_DESCRIPTION` → produces `"file:func:task:error_id"`
- **Usage**: `action->set_custom_error_code(ERR_MY_ERROR);` or `self.JSONResponse_(..., ERR_MY_ERROR);`
- **Sync requirement**: Every constant in `error_codes.h` MUST have a matching entry in `web/assets/js/i18n/errorCodes.js` with en/es translations.

### Rule of thumb

If a string is visible to the user (text, error, tooltip, placeholder, title, aria-label) it MUST
use the i18n system. Hardcoded display strings in any language are forbidden.

## Database schema patches

Every structural change to the metadata database (new tables, columns, indexes,
constraints, seed data) **MUST** be implemented as a patch instead of modifying
`CREATE TABLE IF NOT EXISTS` statements alone, because existing installations
already have the schema and `CREATE TABLE IF NOT EXISTS` is a no-op.

### CLI flags

Two flags control schema operations:

| Flag | What it does | When to use |
|------|-------------|-------------|
| `--db-init` | Full initialization: tables → indexes → foreign keys → seed data → patches | **New installations only** (empty database) |
| `--db-update` | Lightweight: connects and applies only pending patches | **Existing installations** (adds incremental schema changes) |

On an existing database **always use `--db-update`**. Using `--db-init` on an
existing installation produces warnings for indexes and foreign keys that
already exist, though it is not destructive.

### How to add a patch

1. Open `src/query/schema_initializer.cpp` and locate the `kPatches` vector in
   the anonymous namespace.
2. Append a new `PatchDef` entry **at the end** with:
   - `id`: zero-padded 3-digit sequential number + underscore + short name
     (e.g. `002_add_user_avatar_column`)
   - `description`: human-readable summary
   - `sql`: the exact MySQL statement(s) to execute. For multiple statements,
     wrap in a `BEGIN` / `END` block or use a single statement per patch.
3. The patch is automatically applied by `--db-init` on next server start.
   Already-applied patches are skipped (tracked in `schema_patches` table).

### Rules

- **Never** edit an already-released patch — write a new one.
- **Never** put seed data changes (INSERT/UPDATE/DELETE of user-facing data) in
  a patch. Seed data belongs in `InsertSeedData_()` (idempotent via `INSERT
  IGNORE` or `SELECT COUNT(*)` check).
- A patch may contain `ALTER TABLE`, `CREATE INDEX`, `DROP INDEX`, `CREATE
  TABLE`, or any DDL that modifies the metadata schema.
- If a patch fails, the error is logged but init continues (failures are
  non-fatal for backwards compatibility).

## Git conventions

- Branch: `iss[number]` (features/fixes), merge into `dev` via PR.
- Commit: `[feat|chore|doc|fix]: title \n\n body \n\n Rel: iss[number]`
- Versioning: semver via git tags.
