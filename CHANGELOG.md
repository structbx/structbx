# Changelog - StructBX v0.1.5

## New Features & Enhancements (Added)

* **Dynamic Headless API & Security:**
* Implemented an **API Key system**, allowing external software, mobile apps, or third-party integrations to securely connect and query data views (#107).

* **Data Layout & Discovery Engine:**
* Added a native **Dynamic Filter system** to allow runtime row isolation and on-the-fly query narrowing (#108).
* Implemented a specialized **Filters interpreter** (#90) and **Sorts interpreter** (#96) to translate user-defined UI constraints cleanly into backend actions.
* Added support for standard metadata record tracing by setting up `created-date` and `updated-date` column data types (#110).

* **Developer Workflow:**
* Integrated the **Continue AI Code Agent** configurations into the local VS Code workspace pipeline to accelerate backend and frontend code generation scaffolding (#98).

---

## Architectural & Interface Refactoring (Changed)

* **Web Interface Modernization (The JavaScript MVC Shift):**
* Successfully implemented a full **MVC (Model-View-Controller) architecture on the Web Interface**, establishing strict separation of concerns, modular files, and decoupled callbacks (#102, #106).
* Refactored the web frontend packaging lifecycle by transitioning to standard node module management, setting up explicit **npm dependencies** for the `web/` directory (#104).
* Established **universal classes** for JavaScript event orchestration across the interface DOM elements, standardizing interaction lifetimes (#93).

* **Data Normalization & Core Decoupling:**
* Optimized view loading pipelines to **make exactly one unified network request** to the target Table Identifier or View Identifier, vastly reducing API roundtripping overhead (#101).
* Simplified table column runtime initialization and structural layouts (#82).
* Migrated internal schema definitions to **stop using native database foreign keys**, handling structural metadata integrity directly via the C++ meta-model layer (#85).
* Upgraded core schemas to replace raw `id` fields with explicit, unified `identifier` metadata tracking fields (#97).
* Renamed system reference properties from `id_naf_user` to the cleaner, standardized `id_user` pattern (#63).
* Polished UI layout presentation pipelines and general **View Improvements** (#86).

---

## Bug Fixes (Fixed)

* Fixed structural resolution type issues regarding `user` and `current-user` column configurations, enforcing proper contextual mapping (#109).
* Resolved interpreter parsing discrepancies and general bug boundaries found during filter edge-case handling (#99).

---

## Internal Build System (Under the Hood)

* Implemented a native, robust **git/cmake based tag assignment system** to automatically bind release version metadata to binary compilation outputs (#79, #80, #91).

---

> **Note on Pull Requests & Merges:** This release consolidates the integration branches for multiple core feature sequences including Iss79, Iss86, Iss90, Iss97, and Iss102.


---

# Changelog - StructBX v0.1.4

## Issues closed

- Disable viewing of any module if you do not have read permissionen #9 
- Add color backgrounds to Fieldsenhancement #66
- Setup header color for data recordsenhancement #71
- Add intermediate permission to just read data for selects #72 
- Setup monorepo and Improve Build system #76 
- Setup organization image #10 
- Rename Main classes to Base #28
- Setup input data form #59
- Change table identifier to readonly and random 20 characters #62
- Add endpoint to read the permissions enabled to the current user #68
- Improve Data::Read to read specific records and delete Data::ReadSpecific #69 
- Add table permission to set if user can manage just his owned records #70 


---

# Changelog - StructBX v0.1.3

## Issues

- Configure data import from files #2
- Add functions controller to read and modify the instance logo #48
- Add custom file size verification to Files::FileManager #49
- Improve Error and Debug messages to can track issues easily #50
- Create Script Bash for Configuration and Installation of the Project #47
- Change CommonResponses to ResponseManager #51
- Change 'Forms' To 'Tables' #56
- Create views #52
- Add Doxygen documentation #57
- Information recharge without updating the page completely #54
- Change 'Spaces' to 'Databases' #60