# StructBX — Agent instructions

## Build & dev

- **Build system**: CMake 3.16+ with Conan (`conanfile.txt`) for C++ deps.
- **Dev setup** (required order):
  1. `./init_envDev.sh` — creates `build/Debug/`, runs `conan install`
  2. `cmake -S . -B build/Debug -DCMAKE_BUILD_TYPE=Debug`
  3. `cmake --build build/Debug`
- **Release build**: `./build.sh` (destroys/recreates `build/`, fresh cmake + install).
- **No in-source builds** — CMake enforces this (`cmake/build.cmake`).
- **Run**: `build/Debug/structbx-server --config build/Debug/config-files/properties.yaml`
- **Port**: 3001 (HTTPS, configurable in YAML).
- **Config**: CMake generates `properties.yaml`, `cert.pem`, `key.pem` from templates in `conf/`.
- **Version**: auto-derived via `git describe --tags`.
- **Docker**: multi-stage (gcc:12 → debian:12-slim). Build: `docker build -t structbx:latest .`

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

GitHub Actions (`.github/workflows/docker.yml`) — builds and pushes Docker image to `ghcr.io/structbx/structbx` **only on GitHub release**.

## Git conventions

- Branch: `iss[number]` (features/fixes), merge into `dev` via PR.
- Commit: `[feat|chore|doc|fix]: title \n\n body \n\n Rel: iss[number]`
- Versioning: semver via git tags.
