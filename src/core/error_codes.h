// ═══════════════════════════════════════════════════════════════════════
// ERROR CODE SYSTEM
// ═══════════════════════════════════════════════════════════════════════
//
// Every error uses the ERR_CODE macro which produces:
//     "file:func:task:error_id"
//
//   file     — the .cpp file name (e.g. "databases.cpp")
//   func     — the method name     (e.g. "createDatabase")
//   task     — the step that failed (e.g. "validate_input")
//   error_id — short error identifier (e.g. "name_empty")
//
// HOW TO ADD A NEW ERROR CODE:
//   1. Define the constant with the pattern ERR_AREA_DESCRIPTION
//   2. Group it under the relevant controller comment section
//   3. Example:
//        #define ERR_DB_NAME_EMPTY ERR_CODE("databases.cpp", "createDatabase", "validate_input", "name_empty")
//
// USAGE IN C++:
//   action()->set_custom_error_code(ERR_DB_NAME_EMPTY);
//   return JSONResponse_(..., ERR_DB_NAME_EMPTY);   (optional third parameter)
//
// SYNC REQUIREMENT:
//   Every constant here MUST have a matching entry in:
//     web/assets/js/i18n/errorCodes.js
//   using the exact same key string, with en/es translations.
// ═══════════════════════════════════════════════════════════════════════

#ifndef STRUCTBX_CORE_ERRORCODES
#define STRUCTBX_CORE_ERRORCODES

#define ERR_CODE(file, func, task, err_id) \
    file ":" func ":" task ":" err_id

// Databases controller
#define ERR_DB_NAME_EMPTY ERR_CODE("databases.cpp", "createDatabase", "validate_input", "name_empty")
#define ERR_DB_LAST_DELETE ERR_CODE("databases.cpp", "deleteDatabase", "validate_last", "cannot_delete_last")
#define ERR_DB_IDENT_EMPTY ERR_CODE("databases.cpp", "createDatabase", "validate_input", "ident_empty")
#define ERR_DB_NAME_SHORT ERR_CODE("databases.cpp", "createDatabase", "validate_input", "name_too_short")
#define ERR_DB_USER_NOT_OWNED ERR_CODE("databases.cpp", "modifyDatabase", "validate_ownership", "user_not_owner")
#define ERR_DB_DUP_IDENT ERR_CODE("databases.cpp", "createDatabase", "validate_uniqueness", "duplicate_ident")
#define ERR_DB_DUP_NAME ERR_CODE("databases.cpp", "createDatabase", "validate_uniqueness", "duplicate_name")
#define ERR_DB_SWITCH_IDENT_EMPTY ERR_CODE("databases.cpp", "switchDatabase", "validate_input", "ident_empty")
#define ERR_DB_NOT_FOUND ERR_CODE("databases.cpp", "switchDatabase", "validate_existence", "not_found")
#define ERR_DB_UPDATE_FAIL ERR_CODE("databases.cpp", "modifyDatabase", "execute_update", "update_failed")
#define ERR_DB_CREATE_FAIL ERR_CODE("databases.cpp", "createDatabase", "execute_create", "create_failed")
#define ERR_DB_DELETE_FAIL ERR_CODE("databases.cpp", "deleteDatabase", "execute_delete", "delete_failed")
#define ERR_DB_DIR_CREATE_FAIL ERR_CODE("databases.cpp", "createDatabase", "create_directory", "dir_create_failed")

// Users controller
#define ERR_USR_ID_EMPTY ERR_CODE("users.cpp", "modifyUser", "validate_input", "id_empty")
#define ERR_USR_SELF_DELETE ERR_CODE("users.cpp", "deleteUser", "validate_self_delete", "cannot_delete_self")
#define ERR_USR_LAST_DELETE ERR_CODE("users.cpp", "deleteUser", "validate_last", "cannot_delete_last")
#define ERR_USR_USERNAME_EMPTY ERR_CODE("users.cpp", "Create_", "validate_input", "username_empty")
#define ERR_USR_USERNAME_INVALID ERR_CODE("users.cpp", "Create_", "validate_format", "username_invalid")
#define ERR_USR_PASSWORD_EMPTY ERR_CODE("users.cpp", "Create_", "validate_input", "password_empty")
#define ERR_USR_PASSWORD_SHORT ERR_CODE("users.cpp", "Create_", "validate_input", "password_too_short")
#define ERR_USR_PASSWORD_MISMATCH ERR_CODE("users.cpp", "modifyPassword", "validate_input", "passwords_mismatch")
#define ERR_USR_STATUS_EMPTY ERR_CODE("users.cpp", "modifyUser", "validate_input", "status_empty")
#define ERR_USR_DUP_USERNAME ERR_CODE("users.cpp", "Create_", "validate_uniqueness", "duplicate_username")
#define ERR_USR_UPDATE_FAIL ERR_CODE("users.cpp", "modifyUser", "execute_update", "update_failed")
#define ERR_USR_CREATE_FAIL ERR_CODE("users.cpp", "Create_", "execute_create", "create_failed")
#define ERR_USR_PASSWORD_UPDATE_FAIL ERR_CODE("users.cpp", "modifyPassword", "execute_update", "update_failed")
#define ERR_USR_CURRENT_PASSWORD_WRONG ERR_CODE("users.cpp", "modifyPassword", "validate_current", "current_password_incorrect")

// Groups controller
#define ERR_GRP_NAME_EMPTY ERR_CODE("groups.cpp", "Create_", "validate_input", "name_empty")
#define ERR_GRP_DUP_NAME ERR_CODE("groups.cpp", "Create_", "validate_uniqueness", "duplicate_name")
#define ERR_GRP_CREATE_FAIL ERR_CODE("groups.cpp", "Create_", "execute_create", "create_failed")
#define ERR_GRP_LAST_DELETE ERR_CODE("groups.cpp", "deleteGroup", "validate_last", "cannot_delete_last")

// Permissions controller
#define ERR_PER_ENDPOINT_EMPTY ERR_CODE("permissions.cpp", "Create_", "validate_input", "endpoint_empty")
#define ERR_PER_DUP_IN_GROUP ERR_CODE("permissions.cpp", "Create_", "validate_uniqueness", "duplicate_in_group")
#define ERR_PER_NOT_OWNED ERR_CODE("permissions.cpp", "Create_", "validate_ownership", "user_not_owner")
#define ERR_PER_CREATE_FAIL ERR_CODE("permissions.cpp", "Create_", "execute_create", "create_failed")

// Tables controller
#define ERR_TBL_ID_EMPTY ERR_CODE("tables.cpp", "readTable", "validate_input", "id_empty")
#define ERR_TBL_NOT_FOUND ERR_CODE("tables.cpp", "readTable", "validate_existence", "not_found")
#define ERR_TBL_CREATE_FAIL ERR_CODE("tables.cpp", "Create_", "execute_create", "create_failed")
#define ERR_TBL_UPDATE_FAIL ERR_CODE("tables.cpp", "modifyTable", "execute_update", "update_failed")
#define ERR_TBL_DELETE_FAIL ERR_CODE("tables.cpp", "deleteTable", "execute_delete", "delete_failed")

// Data controller
#define ERR_DATA_TABLE_ID_EMPTY ERR_CODE("data.cpp", "readRecords", "validate_input", "table_id_empty")
#define ERR_DATA_NO_PERMISSION ERR_CODE("data.cpp", "readRecords", "validate_permission", "no_permission")

// Columns controller
#define ERR_COL_TABLE_ID_EMPTY ERR_CODE("columns.cpp", "readColumns", "validate_input", "table_id_empty")
#define ERR_COL_LAST_DELETE ERR_CODE("columns.cpp", "deleteColumn", "validate_last", "cannot_delete_last")
#define ERR_COL_COL_ID_EMPTY ERR_CODE("columns.cpp", "validateColumn", "validate_input", "col_id_empty")
#define ERR_COL_NAME_NOT_STRING ERR_CODE("columns.cpp", "validateName", "validate_input", "name_not_string")
#define ERR_COL_NAME_EMPTY ERR_CODE("columns.cpp", "validateName", "validate_input", "name_empty")
#define ERR_COL_NAME_SHORT ERR_CODE("columns.cpp", "validateName", "validate_input", "name_too_short")
#define ERR_COL_REQUIRED_NOT_BOOL ERR_CODE("columns.cpp", "validateRequired", "validate_input", "required_not_bool")
#define ERR_COL_TYPE_EMPTY ERR_CODE("columns.cpp", "validateType", "validate_input", "type_empty")
#define ERR_COL_NOT_FOUND ERR_CODE("columns.cpp", "modifyColumn", "validate_existence", "not_found")
#define ERR_COL_NOT_IN_TABLE ERR_CODE("columns.cpp", "deleteColumn", "validate_existence", "not_in_table")
#define ERR_COL_POSITION_MOVE_FAIL ERR_CODE("columns.cpp", "modifyPosition", "execute", "position_move_failed")
#define ERR_COL_VISIBLE_EMPTY ERR_CODE("columns.cpp", "modifyVisible", "validate_input", "visible_empty")

// Views controller
#define ERR_VIEW_TABLE_ID_EMPTY ERR_CODE("views.cpp", "readViews", "validate_input", "table_id_empty")
#define ERR_VIEW_VIEW_ID_EMPTY ERR_CODE("views.cpp", "readViews", "validate_input", "view_id_empty")
#define ERR_VIEW_NAME_EMPTY ERR_CODE("views.cpp", "addView", "validate_input", "name_empty")
#define ERR_VIEW_LAST_DELETE ERR_CODE("views.cpp", "deleteView", "validate_last", "cannot_delete_last")

// Filters controller
#define ERR_FILT_VIEW_ID_EMPTY ERR_CODE("filters.cpp", "readFilters", "validate_input", "view_id_empty")
#define ERR_FILT_TABLE_ID_EMPTY ERR_CODE("filters.cpp", "readFilters", "validate_input", "table_id_empty")
#define ERR_FILT_OP_EMPTY ERR_CODE("filters.cpp", "validateFilter", "validate_input", "op_empty")
#define ERR_FILT_VALUE_EMPTY ERR_CODE("filters.cpp", "validateFilter", "validate_input", "value_empty")
#define ERR_FILT_POSITION_EMPTY ERR_CODE("filters.cpp", "validateFilter", "validate_input", "position_empty")
#define ERR_FILT_ACTIVE_EMPTY ERR_CODE("filters.cpp", "validateFilter", "validate_input", "active_empty")
#define ERR_FILT_COL_ID_EMPTY ERR_CODE("filters.cpp", "validateFilter", "validate_input", "col_id_empty")
#define ERR_FILT_ID_EMPTY ERR_CODE("filters.cpp", "validateFilter", "validate_input", "id_empty")
#define ERR_FILT_POSITION_MOVE_FAIL ERR_CODE("filters.cpp", "modifyPosition", "execute", "position_move_failed")

// Sorts controller
#define ERR_SORT_VIEW_ID_EMPTY ERR_CODE("sorts.cpp", "readSorts", "validate_input", "view_id_empty")
#define ERR_SORT_TABLE_ID_EMPTY ERR_CODE("sorts.cpp", "readSorts", "validate_input", "table_id_empty")
#define ERR_SORT_TYPE_EMPTY ERR_CODE("sorts.cpp", "validateSort", "validate_input", "type_empty")
#define ERR_SORT_TYPE_INVALID ERR_CODE("sorts.cpp", "validateSort", "validate_input", "type_invalid")
#define ERR_SORT_POSITION_EMPTY ERR_CODE("sorts.cpp", "validateSort", "validate_input", "position_empty")
#define ERR_SORT_ACTIVE_EMPTY ERR_CODE("sorts.cpp", "validateSort", "validate_input", "active_empty")
#define ERR_SORT_COL_ID_EMPTY ERR_CODE("sorts.cpp", "validateSort", "validate_input", "col_id_empty")
#define ERR_SORT_ID_EMPTY ERR_CODE("sorts.cpp", "validateSort", "validate_input", "id_empty")
#define ERR_SORT_POSITION_MOVE_FAIL ERR_CODE("sorts.cpp", "modifyPosition", "execute", "position_move_failed")

// General controller
#define ERR_GEN_LOGO_READ_FAIL ERR_CODE("general.cpp", "readLogo", "execute_read", "logo_read_failed")
#define ERR_GEN_LOGO_SAVE_FAIL ERR_CODE("general.cpp", "saveLogo", "execute_save", "logo_save_failed")
#define ERR_GEN_API_KEY_FAIL ERR_CODE("general.cpp", "generateApiKey", "execute_generate", "api_key_failed")

// File upload
#define ERR_FILE_NOT_SUPPORTED ERR_CODE("general.cpp", "uploadFile", "validate_type", "file_not_supported")
#define ERR_FILE_SIZE_EXCEEDED ERR_CODE("general.cpp", "uploadFile", "validate_size", "size_exceeded")

// Auth / Login
#define ERR_AUTH_SESSION_NOT_FOUND ERR_CODE("backend_handler.cpp", "handleRequest", "validate_session", "session_not_found")
#define ERR_AUTH_ENDPOINT_NOT_FOUND ERR_CODE("backend_handler.cpp", "handleRequest", "validate_endpoint", "endpoint_not_found")
#define ERR_AUTH_NO_PERMISSION ERR_CODE("backend_handler.cpp", "handleRequest", "validate_permission", "no_permission")
#define ERR_AUTH_USER_INACTIVE ERR_CODE("backend_handler.cpp", "handleRequest", "validate_user", "user_inactive")
#define ERR_AUTH_BAD_METHOD ERR_CODE("backend_handler.cpp", "handleRequest", "validate_method", "bad_method")
#define ERR_AUTH_LOGIN_FAIL ERR_CODE("login_handler.cpp", "handleLogin", "authenticate", "login_failed")
#define ERR_AUTH_UNAUTHORIZED ERR_CODE("login_handler.cpp", "handleLogin", "authorize", "unauthorized")

// Server errors
#define ERR_SRV_INTERNAL ERR_CODE("root_handler.cpp", "handleRequest", "catch_all", "internal_error")
#define ERR_SRV_BAD_GATEWAY ERR_CODE("root_handler.cpp", "handleRequest", "upstream", "bad_gateway")
#define ERR_SRV_UNAVAILABLE ERR_CODE("root_handler.cpp", "handleRequest", "unexpected", "service_unavailable")
#define ERR_SRV_OUT_OF_RANGE ERR_CODE("root_handler.cpp", "handleRequest", "catch_out_of_range", "out_of_range")
#define ERR_SRV_RUNTIME ERR_CODE("root_handler.cpp", "handleRequest", "catch_runtime", "runtime_error")
#define ERR_SRV_MYSQL ERR_CODE("root_handler.cpp", "handleRequest", "catch_mysql", "mysql_error")
#define ERR_SRV_JSON ERR_CODE("root_handler.cpp", "handleRequest", "catch_json", "json_error")
#define ERR_SRV_BAD_METHOD ERR_CODE("function.cpp", "Process_", "switch_method", "bad_http_method")
#define ERR_SRV_NO_REQUEST ERR_CODE("root_handler.cpp", "handleRequest", "setup", "no_request")
#define ERR_SRV_NO_RESPONSE ERR_CODE("root_handler.cpp", "handleRequest", "setup", "no_response")

// Permissions controller (tables)
#define ERR_PERM_TABLE_ID_EMPTY ERR_CODE("permissions.cpp", "validatePermission", "validate_input", "table_id_empty")
#define ERR_PERM_ID_EMPTY ERR_CODE("permissions.cpp", "validatePermission", "validate_input", "perm_id_empty")
#define ERR_PERM_USER_ID_EMPTY ERR_CODE("permissions.cpp", "validatePermission", "validate_input", "user_id_empty")

// Row Policy controller
#define ERR_ROW_POLICY_TABLE_ID_EMPTY ERR_CODE("row_policy.cpp", "validatePolicy", "validate_input", "table_id_empty")
#define ERR_ROW_POLICY_COLUMN_EMPTY ERR_CODE("row_policy.cpp", "validatePolicy", "validate_input", "column_empty")
#define ERR_ROW_POLICY_OP_INVALID ERR_CODE("row_policy.cpp", "validatePolicy", "validate_input", "operator_invalid")
#define ERR_ROW_POLICY_VALUE_EMPTY ERR_CODE("row_policy.cpp", "validatePolicy", "validate_input", "value_empty")
#define ERR_ROW_POLICY_TARGET_INVALID ERR_CODE("row_policy.cpp", "validatePolicy", "validate_input", "target_type_invalid")
#define ERR_ROW_POLICY_ACTION_INVALID ERR_CODE("row_policy.cpp", "validatePolicy", "validate_input", "action_type_invalid")
#define ERR_ROW_POLICY_NOT_FOUND ERR_CODE("row_policy.cpp", "modifyPolicy", "validate_existence", "not_found")
#define ERR_ROW_POLICY_CREATE_FAIL ERR_CODE("row_policy.cpp", "addPolicy", "execute_create", "create_failed")
#define ERR_ROW_POLICY_UPDATE_FAIL ERR_CODE("row_policy.cpp", "modifyPolicy", "execute_update", "update_failed")
#define ERR_ROW_POLICY_DELETE_FAIL ERR_CODE("row_policy.cpp", "deletePolicy", "execute_delete", "delete_failed")
#define ERR_ROW_POLICY_LOAD_FAIL ERR_CODE("row_policy.cpp", "loadPolicies", "execute_load", "load_failed")

// Forms controller
#define ERR_FORM_NOT_FOUND ERR_CODE("forms.cpp", "readForm", "validate_existence", "form_not_found")

// Database users
#define ERR_DBUSR_ID_EMPTY ERR_CODE("database_users.cpp", "modifyDatabaseUser", "validate_input", "user_id_empty")

// Function / Action errors
#define ERR_ACTION_FAILED ERR_CODE("action.cpp", "Work_", "execute_action", "action_failed")
#define ERR_ACTION_SETUP_REQ ERR_CODE("action.cpp", "Work_", "setup_request", "setup_request_failed")
#define ERR_ACTION_SETUP_RES ERR_CODE("action.cpp", "Work_", "setup_response", "setup_response_failed")
#define ERR_FUNCTION_SETUP_REQ ERR_CODE("function.cpp", "Process_", "setup_request", "setup_request_failed")
#define ERR_FUNCTION_SETUP_RES ERR_CODE("function.cpp", "Process_", "setup_response", "setup_response_failed")

#endif // STRUCTBX_CORE_ERRORCODES
