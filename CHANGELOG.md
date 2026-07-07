# Changelog - StructBX v0.2.2

## Bug Fixes (Fixed)

* Fix Dockerfile and improve Github Actions (#143) (reopen).

---

# Changelog - StructBX v0.2.1

## Bug Fixes (Fixed)

* Fix Dockerfile and improve Github Actions (#143).

---

# Changelog - StructBX v0.2.0

## New Features & Enhancements (Added)

* **Security & Access Control:**
* Implemented a complete **Row-Level Security (RLS) system** to restrict data access at the row level based on user permissions and ownership (#129).

* **Data Management & Columns:**
* Added **mass editing and deletion** capabilities for efficient batch operations on table records (#58).
* Introduced a **Main column** concept for each table, serving as the primary identifying field (#92).
* Added an **enum Column Type** to allow constrained value selection from a predefined list (#36).
* Implemented **Setup Default View and Display Column** configuration to control which column is shown by default in linked contexts (#111).
* Allowed using either the record **identifier or column name** when performing Add or Modify operations (#123).

* **Frontend Enhancements:**
* Improved **realtime updates** across the frontend for live data synchronization (#116).
* Added **dark/light themes** with dark as the default theme (#126).
* Enhanced UI with **detailed info** displays for better data visibility (#124).
* Improved **error notification** handling and presentation in the frontend (#125).
* Translated backend error messages to English and added **frontend i18n translations** for all error codes (#117).

* **Developer Workflow & Build:**
* Changed the build output to produce a **statically linked binary** for easier distribution and deployment (#118).
* Created a **DB initializer** module to automate database schema setup and seeding (#119).
* Added **descriptive names to Controller actions** for clearer API endpoint documentation and debugging (#120).
* Renamed `main.cpp` to a **top-level name** aligning with the project's identity (#115).

---

## Bug Fixes (Fixed)

* Fixed import errors that prevented proper module loading (#122).
* Fixed forms not reloading to their **default values** after operations (#131).
* Ensured the **first created column** is automatically set as the default display column (#132).
* Resolved **column redimensioning** issues in the table layout (#133).
* Set **`utf8mb4_unicode_ci`** as the default collation for database creation to support full Unicode (#136).
* Fixed **record modification** failures when a column is of type `user` (#137).
* Fixed errors when a linked column's **display column** (in the referenced table) is of type `user` or `current-user` (#138).
* Fixed foreign key configuration on linked columns to use **`UPDATE CASCADE`** and **`DELETE SET NULL`** (#139).
* Added validation to **prevent deletion of the last remaining items** in critical contexts (#140).
* Fixed **database deletion** logic to properly clean up all associated resources (#141).

---

## Internal Build System (Under the Hood)

* Upgraded the **build system** to support static linking workflows and the new DB initializer module (#118, #119).


---

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