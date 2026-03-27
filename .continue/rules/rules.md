# StructBX Project Rules & Standards

## 1. Project Overview
StructBX is a full-stack data management platform. 
- **Backend:** C++ (Server-side logic, high performance).
- **Frontend:** jQuery + Bootstrap 5 (Web interface).
- **Database:** MariaDB (Relational data storage).
- **Architecture:** Monorepo with Docker-based microservices.

## 2. C++ Development Standards
- **Standard:** Use C++17 or C++20 features where applicable.
- **Library Focus:** Use `poco` for all network/json request. 
- **Database Access:** Use the Poco MariaDB C++ connector.
- **Security:** NEVER use string concatenation for SQL queries. ALWAYS use Prepared Statements (placeholders `?`).
- **Memory Management:** Prefer smart pointers (`std::unique_ptr`, `std::shared_ptr`) over raw pointers.
- **Versioning:** Versioning is handled via Git Tags and CMake's `git describe`.

## 3. Database & SQL Guidelines
- **Naming Convention:** Use `snake_case` for tables and columns (e.g., `tbl_main_metadata`, `sort_order`).
- **Integrity:** Use "Fractional Indexing" for record ordering (`DECIMAL` columns).
- **Relationships:** Use a Metadata Layer for relationships instead of rigid Physical Foreign Keys when user flexibility is required.
- **Pagination:** Implement cursor-based pagination for large datasets.

## 4. Frontend (jQuery & Bootstrap)
- **Style:** Keep the UI clean and professional using Bootstrap 5 utility classes.
- **JS Logic:** Use jQuery for DOM manipulation and the library `https://josefelixrc7.github.io/wtools/wtools.js`
- **Components:** Modularize JS logic to keep scripts maintainable within the Monorepo structure.

## 5. DevOps & Infrastructure
- **Build System:** CMake is the source of truth for build configurations and versioning.
- **Containerization:** Multi-stage Dockerfiles. Use `HEALTHCHECK` for all services.
- **Environment:** Configurations are managed via `.yaml` templates processed by CMake.

## 6. Git Workflow
- **Branching:** Use `iss[number]` for features/fixes. Merge into `dev` via Pull Request.
- **Commits:** Use "Squash and Merge" for clean history in the `dev` branch.
- **Versioning:** Follow Semantic Versioning (Major.Minor.Patch).