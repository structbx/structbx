// ═══════════════════════════════════════════════════════════════════════
// BACKEND ERROR CODE TRANSLATIONS
// ═══════════════════════════════════════════════════════════════════════
//
// Each key MUST exactly match the string produced by ERR_CODE in
// src/core/error_codes.h (format: "file:func:task:error_id").
//
// HOW TO ADD:
//   1. Find the new constant in error_codes.h (e.g. ERR_DB_NAME_EMPTY)
//   2. The macro produces: "databases.cpp:createDatabase:validate_input:name_empty"
//   3. Add an entry with that exact string as key:
//        "databases.cpp:createDatabase:validate_input:name_empty": {
//            en: "English message.",
//            es: "Spanish message."
//        }
//
// RULES:
//   - Always provide both "en" (default) and "es".
//   - Plain text only — no HTML allowed.
//   - Group entries by section (// Databases, // Users, etc.).
//   - Keep alphabetical order within each section.
// ═══════════════════════════════════════════════════════════════════════

export const errorCodes = {
    // Databases
    "databases.cpp:createDatabase:validate_input:name_empty": {
        en: "The database name cannot be empty.",
        es: "El nombre de la base de datos no puede estar vacío."
    },
    "databases.cpp:createDatabase:validate_input:ident_empty": {
        en: "The database identifier cannot be empty.",
        es: "El identificador de base de datos no puede estar vacío."
    },
    "databases.cpp:createDatabase:validate_input:name_too_short": {
        en: "The database name must be more than 3 characters.",
        es: "El nombre de la base de datos debe tener más de 3 caracteres."
    },
    "databases.cpp:modifyDatabase:validate_ownership:user_not_owner": {
        en: "The current user does not belong to the database they are trying to modify.",
        es: "El usuario actual no pertenece a la base de datos que intenta modificar."
    },
    "databases.cpp:createDatabase:validate_uniqueness:duplicate_ident": {
        en: "A database with this identifier already exists.",
        es: "Una base de datos con este identificador ya existe."
    },
    "databases.cpp:createDatabase:validate_uniqueness:duplicate_name": {
        en: "A database with this name already exists.",
        es: "Una base de datos con este nombre ya existe."
    },
    "databases.cpp:switchDatabase:validate_input:ident_empty": {
        en: "The database switch identifier cannot be empty.",
        es: "El identificador de cambio de base de datos no puede estar vacío."
    },
    "databases.cpp:switchDatabase:validate_existence:not_found": {
        en: "The user is not in any database.",
        es: "El usuario no está en alguna base de datos."
    },
    "databases.cpp:modifyDatabase:execute_update:update_failed": {
        en: "Failed to update database.",
        es: "Error al actualizar la base de datos."
    },
    "databases.cpp:createDatabase:execute_create:create_failed": {
        en: "Failed to create the database.",
        es: "No se pudo crear la base de datos."
    },
    "databases.cpp:deleteDatabase:execute_delete:delete_failed": {
        en: "Failed to delete database.",
        es: "Error al eliminar la base de datos."
    },
    "databases.cpp:createDatabase:create_directory:dir_create_failed": {
        en: "Database file directory could not be created.",
        es: "No se pudo crear el directorio de archivos de la base de datos."
    },
    "databases.cpp:deleteDatabase:validate_last:cannot_delete_last": {
        en: "Cannot delete the last database. You must belong to at least one database.",
        es: "No se puede eliminar la última base de datos. Debes pertenecer al menos a una base de datos."
    },

    // Users
    "users.cpp:deleteUser:validate_self_delete:cannot_delete_self": {
        en: "You cannot delete yourself.",
        es: "No puedes eliminarte a ti mismo."
    },
    "users.cpp:deleteUser:validate_last:cannot_delete_last": {
        en: "Cannot delete the last user. There must be at least one user.",
        es: "No se puede eliminar el último usuario. Debe existir al menos un usuario."
    },
    "users.cpp:modifyUser:validate_input:id_empty": {
        en: "The user ID cannot be empty.",
        es: "El id de usuario no puede estar vacío."
    },
    "users.cpp:Create_:validate_input:username_empty": {
        en: "The username cannot be empty.",
        es: "El nombre de usuario no puede estar vacío."
    },
    "users.cpp:Create_:validate_format:username_invalid": {
        en: "The username can only contain a-z, A-Z, 0-9, '_', '.', '@', no spaces.",
        es: "El nombre de usuario solo puede tener a-z, A-Z, 0-9, '_', '.', '@', sin espacios en blanco."
    },
    "users.cpp:Create_:validate_input:password_empty": {
        en: "The password cannot be empty.",
        es: "La contraseña no puede estar vacía."
    },
    "users.cpp:Create_:validate_input:password_too_short": {
        en: "The password must be at least 8 characters.",
        es: "La contraseña no puede ser menor a 8 dígitos."
    },
    "users.cpp:modifyPassword:validate_input:passwords_mismatch": {
        en: "The passwords do not match.",
        es: "Las contraseñas no coinciden."
    },
    "users.cpp:modifyPassword:validate_current:current_password_incorrect": {
        en: "The current password is incorrect.",
        es: "La contraseña actual es incorrecta."
    },
    "users.cpp:modifyUser:validate_input:status_empty": {
        en: "The status cannot be empty.",
        es: "El estado no puede estar vacío."
    },
    "users.cpp:Create_:validate_uniqueness:duplicate_username": {
        en: "This username is already registered.",
        es: "Este nombre de usuario ya está registrado."
    },
    "users.cpp:modifyUser:execute_update:update_failed": {
        en: "Failed to update user.",
        es: "Error al modificar el usuario."
    },
    "users.cpp:Create_:execute_create:create_failed": {
        en: "An error occurred while saving the user.",
        es: "Hubo un error al guardar el usuario."
    },
    "users.cpp:modifyPassword:execute_update:update_failed": {
        en: "An error occurred while modifying the password.",
        es: "Hubo un error al modificar la contraseña."
    },

    // Groups
    "groups.cpp:deleteGroup:validate_last:cannot_delete_last": {
        en: "Cannot delete the last group. There must be at least one group.",
        es: "No se puede eliminar el último grupo. Debe existir al menos un grupo."
    },
    "groups.cpp:Create_:validate_input:name_empty": {
        en: "The group name cannot be empty.",
        es: "El nombre de grupo no puede estar vacío."
    },
    "groups.cpp:Create_:validate_uniqueness:duplicate_name": {
        en: "This group is already registered.",
        es: "Este grupo ya está registrado."
    },
    "groups.cpp:Create_:execute_create:create_failed": {
        en: "Failed to create group.",
        es: "Error al crear el grupo."
    },

    // Permissions
    "permissions.cpp:Create_:validate_input:endpoint_empty": {
        en: "The endpoint cannot be empty.",
        es: "El endpoint no puede estar vacío."
    },
    "permissions.cpp:Create_:validate_uniqueness:duplicate_in_group": {
        en: "This permission is already registered in this group.",
        es: "Este permiso ya está registrado en este grupo."
    },
    "permissions.cpp:Create_:validate_ownership:user_not_owner": {
        en: "The permission you are trying to delete does not exist.",
        es: "El permiso al que intenta borrar no existe."
    },
    "permissions.cpp:Create_:execute_create:create_failed": {
        en: "Failed to create permission.",
        es: "Error al crear el permiso."
    },

    // Columns
    "columns.cpp:deleteColumn:validate_last:cannot_delete_last": {
        en: "Cannot delete the last column. A table must have at least one column.",
        es: "No se puede eliminar la última columna. Una tabla debe tener al menos una columna."
    },

    // Views
    "views.cpp:deleteView:validate_last:cannot_delete_last": {
        en: "Cannot delete the last view. A table must have at least one view.",
        es: "No se puede eliminar la última vista. Una tabla debe tener al menos una vista."
    },

    // Tables
    "tables.cpp:readTable:validate_input:id_empty": {
        en: "The table identifier cannot be empty.",
        es: "El identificador de tabla no puede estar vacío."
    },
    "tables.cpp:readTable:validate_existence:not_found": {
        en: "The requested table does not exist.",
        es: "La tabla solicitada no existe."
    },
    "tables.cpp:Create_:execute_create:create_failed": {
        en: "Failed to create the table.",
        es: "No se pudo crear la tabla."
    },
    "tables.cpp:modifyTable:execute_update:update_failed": {
        en: "Failed to update the table.",
        es: "Error al actualizar la tabla."
    },
    "tables.cpp:deleteTable:execute_delete:delete_failed": {
        en: "Failed to delete the table.",
        es: "Error al eliminar la tabla."
    },

    // Auth
    "backend_handler.cpp:handleRequest:validate_session:session_not_found": {
        en: "Session not found.",
        es: "Sesión no encontrada."
    },
    "backend_handler.cpp:handleRequest:validate_endpoint:endpoint_not_found": {
        en: "The requested endpoint is not available.",
        es: "El endpoint solicitado no está disponible."
    },
    "backend_handler.cpp:handleRequest:validate_permission:no_permission": {
        en: "The user does not have permissions to perform this operation.",
        es: "No posee los permisos para realizar esta operación."
    },
    "backend_handler.cpp:handleRequest:validate_user:user_inactive": {
        en: "The user is inactive.",
        es: "El usuario está inactivo."
    },
    "backend_handler.cpp:handleRequest:validate_method:bad_method": {
        en: "The client provided a bad HTTP method.",
        es: "El cliente proporcionó un método HTTP incorrecto."
    },
    "login_handler.cpp:handleLogin:authenticate:login_failed": {
        en: "Login failed. Invalid credentials.",
        es: "Error de inicio de sesión. Credenciales inválidas."
    },
    "login_handler.cpp:handleLogin:authorize:unauthorized": {
        en: "Unauthorized user or wrong username/password.",
        es: "Usuario no autorizado o usuario/contraseña incorrectos."
    },

    // Server
    "root_handler.cpp:handleRequest:catch_all:internal_error": {
        en: "An unexpected error occurred.",
        es: "Ocurrió un error inesperado."
    },
    "root_handler.cpp:handleRequest:catch_mysql:mysql_error": {
        en: "MySQL error occurred.",
        es: "Error de MySQL."
    },
    "root_handler.cpp:handleRequest:catch_json:json_error": {
        en: "JSON error occurred.",
        es: "Error de JSON."
    },
    "root_handler.cpp:handleRequest:catch_runtime:runtime_error": {
        en: "Runtime error occurred.",
        es: "Error de ejecución."
    },
    "root_handler.cpp:handleRequest:catch_out_of_range:out_of_range": {
        en: "Out of range error occurred.",
        es: "Error de fuera de rango."
    },
    "root_handler.cpp:handleRequest:unexpected:service_unavailable": {
        en: "Service unavailable.",
        es: "Servicio no disponible."
    },
    "root_handler.cpp:handleRequest:setup:no_request": {
        en: "Server request not available.",
        es: "Solicitud del servidor no disponible."
    },
    "root_handler.cpp:handleRequest:setup:no_response": {
        en: "Server response not available.",
        es: "Respuesta del servidor no disponible."
    },
    "function.cpp:Process_:switch_method:bad_http_method": {
        en: "The client provided a bad HTTP method.",
        es: "El cliente proporcionó un método HTTP incorrecto."
    },

    // General
    "general.cpp:readLogo:execute_read:logo_read_failed": {
        en: "Error reading the logo.",
        es: "Error al leer el logo."
    },
    "general.cpp:saveLogo:execute_save:logo_save_failed": {
        en: "Error saving the logo.",
        es: "Error al guardar el logo."
    },
    "general.cpp:generateApiKey:execute_generate:api_key_failed": {
        en: "Error generating the API key.",
        es: "Error al generar la API key."
    },
    "general.cpp:uploadFile:validate_type:file_not_supported": {
        en: "File not supported, must be png, jpg or jpeg format.",
        es: "Archivo no soportado, debe ser formato png, jpg o jpeg."
    },
    "general.cpp:uploadFile:validate_size:size_exceeded": {
        en: "The file must be less than 5 MB.",
        es: "El archivo debe ser de menos de 5 MB."
    },

    // Forms
    "forms.cpp:readForm:validate_existence:form_not_found": {
        en: "Form not found.",
        es: "Formulario no encontrado."
    },

    // Action/Function
    "action.cpp:Work_:execute_action:action_failed": {
        en: "Action failed.",
        es: "La acción falló."
    },
    "action.cpp:Work_:setup_request:setup_request_failed": {
        en: "Failed to set up the request.",
        es: "Error al configurar la solicitud."
    },
    "action.cpp:Work_:setup_response:setup_response_failed": {
        en: "Failed to set up the response.",
        es: "Error al configurar la respuesta."
    },
    "function.cpp:Process_:setup_request:setup_request_failed": {
        en: "Failed to set up the request.",
        es: "Error al configurar la solicitud."
    },
    "function.cpp:Process_:setup_response:setup_response_failed": {
        en: "Failed to set up the response.",
        es: "Error al configurar la respuesta."
    },

    // Row Policies
    "row_policy.cpp:validatePolicy:validate_input:table_id_empty": {
        en: "The table identifier cannot be empty.",
        es: "El identificador de tabla no puede estar vacío."
    },
    "row_policy.cpp:validatePolicy:validate_input:column_empty": {
        en: "The filter column cannot be empty.",
        es: "La columna de filtro no puede estar vacía."
    },
    "row_policy.cpp:validatePolicy:validate_input:operator_invalid": {
        en: "The filter operator is invalid.",
        es: "El operador de filtro no es válido."
    },
    "row_policy.cpp:validatePolicy:validate_input:value_empty": {
        en: "The filter value cannot be empty.",
        es: "El valor de filtro no puede estar vacío."
    },
    "row_policy.cpp:validatePolicy:validate_input:target_type_invalid": {
        en: "The target type is invalid.",
        es: "El tipo de destino no es válido."
    },
    "row_policy.cpp:validatePolicy:validate_input:action_type_invalid": {
        en: "The action type is invalid.",
        es: "El tipo de acción no es válido."
    },
    "row_policy.cpp:modifyPolicy:validate_existence:not_found": {
        en: "The row policy was not found.",
        es: "La política de fila no fue encontrada."
    },
    "row_policy.cpp:addPolicy:execute_create:create_failed": {
        en: "Failed to create the row policy.",
        es: "Error al crear la política de fila."
    },
    "row_policy.cpp:modifyPolicy:execute_update:update_failed": {
        en: "Failed to update the row policy.",
        es: "Error al actualizar la política de fila."
    },
    "row_policy.cpp:deletePolicy:execute_delete:delete_failed": {
        en: "Failed to delete the row policy.",
        es: "Error al eliminar la política de fila."
    },
    "row_policy.cpp:loadPolicies:execute_load:load_failed": {
        en: "Failed to load row policies.",
        es: "Error al cargar las políticas de fila."
    }
};
