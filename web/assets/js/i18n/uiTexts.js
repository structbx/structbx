// ═══════════════════════════════════════════════════════════════════════
// FRONTEND UI TEXT TRANSLATIONS
// ═══════════════════════════════════════════════════════════════════════
//
// Two usage patterns:
//
// 1. FROM JAVASCRIPT (controllers / submodules):
//      i18n.t('section.key')                   → "textContent"
//      i18n.t('section.key', {param: value})   → with ${param} interpolation
//      structbxi18n.t('section.key')                   → "textContent"
//      structbxi18n.t('section.key', {param: value})   → with ${param} interpolation
//
// 2. FROM HTML (data-i18n attributes):
//      data-i18n="section.key"                 → replaces textContent
//      data-i18n-html="section.key"            → replaces innerHTML
//      data-i18n-placeholder="section.key"     → replaces placeholder
//      data-i18n-title="section.key"           → replaces title
//      data-i18n-alt="section.key"             → replaces alt
//      data-i18n-aria-label="section.key"      → replaces aria-label
//
// HOW TO ADD A NEW TRANSLATION:
//   1. Pick a key with format:  section.descriptive_name
//      (e.g. "settings.database_name", "table.modal_add_column")
//   2. Decide whether it is used from JS (i18n.t()) or HTML (data-i18n)
//   3. Add it under the relevant section:
//        "settings.database_name": {
//            en: "Database",
//            es: "Base de datos"
//        }
//   4. For text containing HTML, suffix the key with _html
//      and use data-i18n-html in the HTML element.
//   5. For variable interpolation use ${name} in the string
//      and pass values as the second argument to i18n.t().
//
// NOTE: HTML-only keys are grouped at the bottom under "HTML static text".
// ═══════════════════════════════════════════════════════════════════════

export const uiTexts = {
    // Response Manager
    "response.no_permissions": {
        en: "You do not have permissions to access this resource.",
        es: "No tiene permisos para acceder a este recurso."
    },
    "response.server_error": {
        en: "There was an error communicating with the server.",
        es: "Hubo un error en la comunicación con el servidor."
    },
    "response.operation_error": {
        en: "There was an error performing the operation.",
        es: "Hubo un error al realizar la operación."
    },
    "response.target": {
        en: "Target",
        es: "Destino"
    },
    "response.server_response": {
        en: "Server response",
        es: "Respuesta del servidor"
    },
    "response.no_results": {
        en: "No results.",
        es: "Sin resultados."
    },
    "response.http_status": {
        en: "HTTP Status",
        es: "Estado HTTP"
    },
    "response.error_code": {
        en: "Error code",
        es: "Código de error"
    },
    "response.file": {
        en: "File",
        es: "Archivo"
    },
    "response.function_": {
        en: "Function",
        es: "Función"
    },
    "response.task": {
        en: "Task",
        es: "Tarea"
    },
    "response.error_id": {
        en: "Error ID",
        es: "ID de error"
    },
    "response.category": {
        en: "Category",
        es: "Categoría"
    },
    "response.error": {
        en: "Error",
        es: "Error"
    },

    // Response Manager - Targets
    "target.data_read": {
        en: "Data: Read",
        es: "Data: Leer"
    },
    "target.data_read_secondary": {
        en: "Data: Read",
        es: "Data: Leer (1)"
    },
    "target.data_add": {
        en: "Data: Add",
        es: "Data: Añadir"
    },
    "target.data_modify": {
        en: "Data: Modify",
        es: "Data: Modificar"
    },
    "target.data_delete": {
        en: "Data: Delete",
        es: "Data: Eliminar"
    },
    "target.data_import": {
        en: "Data: Import",
        es: "Data: Importar"
    },
    "target.data_columns_read": {
        en: "Data: Columns: Read",
        es: "Data: Columnas: Leer"
    },
    "target.tables_read": {
        en: "Tables: Read",
        es: "Tablas: Leer"
    },
    "target.tables_add": {
        en: "Tables: Add",
        es: "Tablas: Añadir"
    },
    "target.table_edit": {
        en: "Table: Edit",
        es: "Tablas: Editar"
    },
    "target.table_delete": {
        en: "Table: Delete",
        es: "Tablas: Eliminar"
    },
    "target.columns_read": {
        en: "Columns: Read",
        es: "Columnas: Leer"
    },
    "target.columns_add": {
        en: "Columns: Add",
        es: "Columnas: Añadir"
    },
    "target.columns_modify": {
        en: "Columns: Modify",
        es: "Columnas: Modificar"
    },
    "target.columns_delete": {
        en: "Columns: Delete",
        es: "Columnas: Eliminar"
    },
    "target.columns_visibility_modify": {
        en: "Columns: Visibility: Modify",
        es: "Columnas: Visible: Modificar"
    },
    "target.columns_position_modify": {
        en: "Columns: Position: Modify",
        es: "Columnas: Posición: Modificar"
    },
    "target.views_read": {
        en: "Views: Read",
        es: "Vistas: Leer"
    },
    "target.views_add": {
        en: "Views: Add",
        es: "Vistas: Añadir"
    },
    "target.views_modify": {
        en: "Views: Modify",
        es: "Vistas: Modificar"
    },
    "target.sorts_read": {
        en: "Sorts: Read",
        es: "Ordenamientos: Leer"
    },
    "target.sorts_add": {
        en: "Sorts: Add",
        es: "Ordenamientos: Añadir"
    },
    "target.sorts_modify": {
        en: "Sorts: Modify",
        es: "Ordenamientos: Modificar"
    },
    "target.sorts_delete": {
        en: "Sorts: Delete",
        es: "Ordenamientos: Eliminar"
    },
    "target.sorts_position_modify": {
        en: "Sorts: Position: Modify",
        es: "Ordenamientos: Posición: Modificar"
    },
    "target.sorts_visibility_modify": {
        en: "Sorts: Visibility: Modify",
        es: "Ordenamientos: Visibilidad: Modificar"
    },
    "target.filters_read": {
        en: "Filters: Read",
        es: "Filtros: Leer"
    },
    "target.filters_add": {
        en: "Filters: Add",
        es: "Filtros: Añadir"
    },
    "target.filters_modify": {
        en: "Filters: Modify",
        es: "Filtros: Modificar"
    },
    "target.filters_position_modify": {
        en: "Filters: Position: Modify",
        es: "Filtros: Posición: Modificar"
    },
    "target.instance_name_read": {
        en: "Instance name: Read",
        es: "Nombre de instancia: Leer"
    },
    "target.instance_name_modify": {
        en: "Instance name: Modify",
        es: "Nombre de instancia: Modificar"
    },
    "target.instance_logo_modify": {
        en: "Instance logo: Modify",
        es: "Logo de instancia: Modificar"
    },
    "target.current_user_read": {
        en: "Current user: Read",
        es: "Usuario actual: Leer"
    },
    "target.current_user_modify": {
        en: "Current user: Modify",
        es: "Usuario actual: Modificar"
    },
    "target.password_modify": {
        en: "Password: Modify",
        es: "Contraseña: Modificar"
    },
    "target.users_read": {
        en: "Users: Read",
        es: "Usuarios: Leer"
    },
    "target.users_add": {
        en: "Users: Add",
        es: "Usuarios: Añadir"
    },
    "target.users_modify": {
        en: "Users: Modify",
        es: "Usuarios: Modificar"
    },
    "target.users_delete": {
        en: "Users: Delete",
        es: "Usuarios: Eliminar"
    },
    "target.groups_read": {
        en: "Groups: Read",
        es: "Grupos: Leer"
    },
    "target.groups_add": {
        en: "Groups: Add",
        es: "Grupos: Añadir"
    },
    "target.groups_modify": {
        en: "Groups: Modify",
        es: "Grupos: Modificar"
    },
    "target.groups_delete": {
        en: "Groups: Delete",
        es: "Grupos: Eliminar"
    },
    "target.databases_read": {
        en: "Databases: Read",
        es: "Bases de datos: Leer"
    },
    "target.databases_add": {
        en: "Databases: Add",
        es: "Bases de datos: Añadir"
    },
    "target.db_users_read": {
        en: "DB Users: Read",
        es: "Usuarios de BD: Leer"
    },
    "target.db_users_add": {
        en: "DB Users: Add",
        es: "Usuarios de BD: Añadir"
    },
    "target.db_users_delete": {
        en: "DB Users: Delete",
        es: "Usuarios de BD: Eliminar"
    },
    "target.permissions_read": {
        en: "Permissions: Read",
        es: "Permisos: Leer"
    },
    "target.permissions_add": {
        en: "Permissions: Add",
        es: "Permisos: Añadir"
    },
    "target.permissions_delete": {
        en: "Permissions: Delete",
        es: "Permisos: Eliminar"
    },
    "target.api_key_read": {
        en: "API Key: Read",
        es: "API Key: Leer"
    },
    "target.api_key_generate": {
        en: "API Key: Generate",
        es: "API Key: Generar"
    },
    "target.api_key_revoke": {
        en: "API Key: Revoke",
        es: "API Key: Revocar"
    },
    "target.settings_general": {
        en: "Settings: General",
        es: "Configuraciones: General"
    },
    "target.settings_permissions": {
        en: "Settings: Permissions",
        es: "Configuraciones: Permisos"
    },
    "target.table_permissions_add": {
        en: "Table permissions: Add",
        es: "Permisos de tabla: Añadir"
    },
    "target.table_permissions_modify": {
        en: "Table permissions: Modify",
        es: "Permisos de tabla: Modificar"
    },
    "target.table_permission_modify": {
        en: "Table permission: Modify",
        es: "Permiso de tabla: Modificar"
    },
    "target.table_permission_delete": {
        en: "Table permission: Delete",
        es: "Permiso de tabla: Eliminar"
    },
    "target.form_columns_read": {
        en: "Form: Columns: Read",
        es: "Formulario: Columnas: Leer"
    },

    // Login
    "login.database_access_failed": {
        en: "Could not access the database.",
        es: "No se pudo acceder a la base de datos."
    },
    "login.logout_failed": {
        en: "Could not log out.",
        es: "No se pudo cerrar la sesión."
    },
    "login.invalid_fields": {
        en: "There are invalid fields.",
        es: "Hay campos inválidos."
    },
    "login.success": {
        en: "Login successful. Please wait...",
        es: "Inicio de sesión exitoso. Espere..."
    },
    "login.invalid_credentials": {
        en: "Incorrect username or password.",
        es: "Usuario o contraseña incorrectos."
    },
    "login.error": {
        en: "Error logging in.",
        es: "Error al iniciar sesión."
    },

    // Base Controller
    "base.instance_name_failed": {
        en: "Could not access the instance name.",
        es: "No se pudo acceder al nombre de la instancia."
    },
    "base.database_access_failed": {
        en: "Could not access the database.",
        es: "No se pudo acceder a la base de datos."
    },
    "base.logout_failed": {
        en: "Could not log out.",
        es: "No se pudo cerrar la sesión."
    },
    "base.table_identifier_not_found": {
        en: "Table identifier not found.",
        es: "No se encontró el identificador de la tabla."
    },
    "base.none_option": {
        en: "-- None --",
        es: "-- Ninguno --"
    },
    "base.no_more_databases": {
        en: "No more databases",
        es: "No hay más bases de datos"
    },
    "base.linked_column_no_permission": {
        en: "You do not have the necessary permissions to access <b>${column_name}</b>",
        es: "No posee los permisos necesarios para acceder a <b>${column_name}</b>"
    },
    "base.linked_column_error": {
        en: "An error occurred while accessing the linked column <b>${column_name}</b>",
        es: "Hubo un error al acceder a la columna enlazada <b>${column_name}</b>"
    },
    "base.linked_column_no_data": {
        en: "No data found in the linked column <b>${column_name}</b>",
        es: "No se encontraron datos en la columna enlazada <b>${column_name}</b>"
    },
    "base.db_users_no_permission": {
        en: "You do not have the necessary permissions to access database users.",
        es: "No posee los permisos necesarios para acceder a los usuarios de la base de datos"
    },
    "base.db_users_error": {
        en: "An error occurred while accessing database users.",
        es: "Hubo un error al acceder a los usuarios de la base de datos"
    },
    "base.db_users_no_data": {
        en: "No data found when querying database users.",
        es: "No se encontraron datos al consultar los usuarios de la base de datos"
    },

    // Start Controller
    "start.active": {
        en: "Active",
        es: "Activo"
    },
    "start.inactive": {
        en: "Inactive",
        es: "Inactivo"
    },
    "start.public": {
        en: "Public",
        es: "Público"
    },
    "start.internal": {
        en: "Internal",
        es: "Interno"
    },
    "start.no_tables": {
        en: "No tables available.",
        es: "No hay tablas disponibles."
    },
    "start.no_search_match": {
        en: "No tables match the search.",
        es: "Ninguna tabla coincide con la búsqueda."
    },
    "start.create_table": {
        en: "Create table",
        es: "Crear tabla"
    },
    "start.table_created": {
        en: "Table created successfully.",
        es: "Tabla creada exitosamente."
    },
    "start.table_state": {
        en: "Status",
        es: "Estado"
    },
    "start.table_records": {
        en: "Records",
        es: "Registros"
    },
    "start.created_at": {
        en: "Created at",
        es: "Creada el"
    },
    "start.database_info": {
        en: "Database Information",
        es: "Información de la base de datos"
    },
    "start.db_state": {
        en: "State",
        es: "Estado"
    },
    "start.db_size": {
        en: "DB Size",
        es: "Tamaño BD"
    },
    "start.files_size": {
        en: "Files Storage",
        es: "Almacenamiento archivos"
    },
    "start.db_description": {
        en: "Description",
        es: "Descripción"
    },
    "start.state_active": {
        en: "Active",
        es: "Activo"
    },
    "start.state_inactive": {
        en: "Inactive",
        es: "Inactivo"
    },
    "start.public_form_enabled": {
        en: "Public form enabled",
        es: "Formulario público habilitado"
    },

    // Table Controller
    "table.no_results": {
        en: "No results.",
        es: "Sin resultados."
    },
    "table.no_tables": {
        en: "No tables available.",
        es: "Sin tablas disponibles."
    },
    "table.no_search_match": {
        en: "No tables match.",
        es: "Ninguna tabla coincide."
    },
    "table.table_state": {
        en: "Status",
        es: "Estado"
    },
    "table.table_created": {
        en: "Created",
        es: "Creada"
    },
    "table.type_label": {
        en: "Type",
        es: "Tipo"
    },
    "table.required_label": {
        en: "Required",
        es: "Obligatorio"
    },
    "table.default_label": {
        en: "Default",
        es: "Por defecto"
    },
    "table.created_label": {
        en: "Created at",
        es: "Creada el"
    },
    "table.state_active": {
        en: "Active",
        es: "Activo"
    },
    "table.state_inactive": {
        en: "Inactive",
        es: "Inactivo"
    },

    // Forms Controller
    "forms.identifier_not_found": {
        en: "Form identifier not found.",
        es: "No se encontró el identificador del formulario."
    },
    "forms.cannot_access": {
        en: 'Cannot access the form, go to <a href="/">Home</a>',
        es: 'No se puede acceder al formulario, ve a <a href="/">Inicio</a>'
    },

    // Settings Controller
    "settings.api_key_copied": {
        en: "API key copied to clipboard.",
        es: "API key copiada al portapapeles."
    },
    "settings.instance_name_updated": {
        en: "Instance name updated successfully.",
        es: "Nombre de instancia modificada exitosamente."
    },
    "settings.logo_updated": {
        en: "Instance logo updated successfully.",
        es: "Logo de instancia modificada exitosamente."
    },
    "settings.users_read_failed": {
        en: "Could not access users.",
        es: "No se pudo acceder a los usuarios."
    },
    "settings.current_user_read_failed": {
        en: "Could not access the current user.",
        es: "No se pudo acceder al usuario actual."
    },
    "settings.current_user_updated": {
        en: "Current user updated successfully.",
        es: "Usuario actual modificado exitosamente."
    },
    "settings.password_updated": {
        en: "Password updated successfully.",
        es: "Contraseña modificada exitosamente."
    },
    "settings.user_created": {
        en: "User created successfully.",
        es: "Usuario creado exitosamente."
    },
    "settings.user_identifier_not_found": {
        en: "User identifier not found.",
        es: "No se encontró el identificador de usuario."
    },
    "settings.user_updated": {
        en: "User updated successfully.",
        es: "Usuario modificado exitosamente."
    },
    "settings.user_deleted": {
        en: "User deleted.",
        es: "Usuario eliminado."
    },
    "settings.groups_read_failed": {
        en: "Could not access groups.",
        es: "No se pudo acceder a grupos."
    },
    "settings.group_added": {
        en: "Group added successfully.",
        es: "Grupo agregado exitosamente."
    },
    "settings.group_identifier_not_found": {
        en: "Group identifier not found.",
        es: "No se encontró el identificador de grupo."
    },
    "settings.group_updated": {
        en: "Group updated successfully.",
        es: "Grupo modificado exitosamente."
    },
    "settings.group_deleted": {
        en: "Group deleted.",
        es: "Grupo eliminado."
    },
    "settings.database_created": {
        en: "Database created successfully.",
        es: "Base de datos creada exitosamente."
    },
    "settings.database_identifier_not_found": {
        en: "Database identifier not found.",
        es: "No se encontró el identificador de la base de datos."
    },
    "settings.database_not_found": {
        en: "Selected database not found.",
        es: "No se encontró la base de datos seleccionada."
    },
    "settings.users_available_read_failed": {
        en: "Could not access available users.",
        es: "No se pudo acceder a los usuarios disponibles."
    },
    "settings.no_users_available": {
        en: "No users available.",
        es: "No hay usuarios disponibles."
    },
    "settings.user_added": {
        en: "User added successfully.",
        es: "Usuario agregado exitosamente."
    },
    "settings.user_info_not_found": {
        en: "User information not found.",
        es: "No se encontró la información del usuario."
    },
    "settings.select_group_first": {
        en: "You must select a group first.",
        es: "Debe seleccionar un grupo primero."
    },
    "settings.database_modified": {
        en: "Database modified successfully.",
        es: "Base de datos modificada exitosamente."
    },
    "settings.database_deleted": {
        en: "Database deleted.",
        es: "Base de datos eliminada."
    },
    "settings.endpoints_read_failed": {
        en: "Could not access endpoints.",
        es: "No se pudo acceder a los endpoints."
    },
    "settings.no_endpoints_available": {
        en: "No endpoints available.",
        es: "No hay endpoints disponibles."
    },
    "settings.permission_added": {
        en: "Permission added successfully.",
        es: "Permiso agregado exitosamente."
    },
    "settings.permission_endpoint_not_found": {
        en: "Permission endpoint not found.",
        es: "No se encontró el endpoint de permiso."
    },
    "settings.permission_deleted": {
        en: "Permission deleted.",
        es: "Permiso eliminado."
    },
    "settings.api_key_generated": {
        en: "API key generated successfully.",
        es: "API key generada exitosamente."
    },
    "settings.api_key_revoked": {
        en: "API key revoked successfully.",
        es: "API key revocada exitosamente."
    },

    // Data Controller
    "data.error_occurred": {
        en: "An error occurred.",
        es: "Ocurrió un error."
    },
    "data.record_identifier_not_found": {
        en: "Record identifier not found.",
        es: "No se encontró el identificador del registro."
    },
    "data.error_with_detail": {
        en: "An error occurred: ${error}.",
        es: "Ocurrió un error: ${error}."
    },
    "data.table_element_create_error": {
        en: "Error creating a table element.",
        es: "Error al crear un elemento de tabla."
    },
    "data.create_columns_first": {
        en: "You must create columns to add records.",
        es: "Debe crear columnas para agregar registros."
    },
    "data.record_saved": {
        en: "Record saved.",
        es: "Registro guardado."
    },
    "data.record_updated": {
        en: "Record updated.",
        es: "Registro Actualizado."
    },
    "data.record_deleted": {
        en: "Record deleted.",
        es: "Registro eliminado."
    },
    "data.export_successful": {
        en: "Export successful.",
        es: "Exportación exitosa."
    },
    "data.download_error": {
        en: "Error downloading file: ${error}.",
        es: "Error al descargar el archivo: ${error}."
    },

    // Color names (for data_controller.js color picker)
    "color.primary_blue": { en: "Primary Blue", es: "Azul Principal" },
    "color.dark_blue": { en: "Dark Blue", es: "Azul Oscuro" },
    "color.light_blue": { en: "Light Blue", es: "Azul Claro" },
    "color.purple": { en: "Purple", es: "Púrpura" },
    "color.pink": { en: "Pink", es: "Rosa" },
    "color.turquoise": { en: "Turquoise", es: "Turquesa" },
    "color.red": { en: "Red", es: "Rojo" },
    "color.orange": { en: "Orange", es: "Naranja" },
    "color.yellow": { en: "Yellow", es: "Amarillo" },
    "color.green": { en: "Green", es: "Verde" },
    "color.navy_blue": { en: "Navy Blue", es: "Azul Marino" },
    "color.night_blue": { en: "Night Blue", es: "Azul Noche" },
    "color.coral": { en: "Coral", es: "Coral" },
    "color.lilac": { en: "Lilac", es: "Lila" },
    "color.sky_blue": { en: "Sky Blue", es: "Celeste" },
    "color.cyan": { en: "Cyan", es: "Cian" },
    "color.lime_yellow": { en: "Lime Yellow", es: "Amarillo Limón" },
    "color.hot_pink": { en: "Hot Pink", es: "Rosa Fuerte" },
    "color.wine_red": { en: "Wine Red", es: "Rojo Vino" },
    "color.teal": { en: "Teal", es: "Verde Azulado" },
    "color.sea_green": { en: "Sea Green", es: "Verde Mar" },
    "color.pastel_green": { en: "Pastel Green", es: "Verde Pastel" },
    "color.beige": { en: "Beige", es: "Beige" },
    "color.ochre": { en: "Ochre", es: "Ocre" },
    "color.brown": { en: "Brown", es: "Marrón" },
    "color.terracotta": { en: "Terracotta", es: "Terracota" },
    "color.rust_red": { en: "Rust Red", es: "Rojo Óxido" },
    "color.vibrant_purple": { en: "Vibrant Purple", es: "Púrpura Vibrante" },
    "color.burnt_orange": { en: "Burnt Orange", es: "Naranja Quemado" },
    "color.blue_gray": { en: "Blue Gray", es: "Gris Azulado" },
    "color.jade_green": { en: "Jade Green", es: "Verde Jade" },
    "color.lime_green": { en: "Lime Green", es: "Verde Lima" },
    "color.mustard_yellow": { en: "Mustard Yellow", es: "Amarillo Mostaza" },
    "color.pumpkin_orange": { en: "Pumpkin Orange", es: "Naranja Calabaza" },
    "color.fire_red": { en: "Fire Red", es: "Rojo Fuego" },
    "color.cobalt_blue": { en: "Cobalt Blue", es: "Azul Cobalto" },
    "color.violet": { en: "Violet", es: "Violeta" },
    "color.bright_blue": { en: "Bright Blue", es: "Azul Brillante" },
    "color.neon_orange": { en: "Neon Orange", es: "Naranja Neón" },
    "color.neon_pink": { en: "Neon Pink", es: "Rosa Neón" },
    "color.electric_purple": { en: "Electric Purple", es: "Púrpura Eléctrico" },
    "color.electric_blue": { en: "Electric Blue", es: "Azul Eléctrico" },
    "color.electric_yellow": { en: "Electric Yellow", es: "Amarillo Eléctrico" },
    "color.electric_orange": { en: "Electric Orange", es: "Naranja Eléctrico" },
    "color.magenta": { en: "Magenta", es: "Magenta" },
    "color.grayish_green": { en: "Grayish Green", es: "Verde Grisáceo" },
    "color.gray_blue": { en: "Gray Blue", es: "Azul Gris" },
    "color.salmon": { en: "Salmon", es: "Salmón" },
    "color.apple_green": { en: "Apple Green", es: "Verde Manzana" },
    "color.gold": { en: "Gold", es: "Oro" },
    "color.emerald": { en: "Emerald", es: "Esmeralda" },
    "color.pumpkin": { en: "Pumpkin", es: "Calabaza" },
    "color.slate": { en: "Slate", es: "Pizarra" },
    "color.steel_blue": { en: "Steel Blue", es: "Azul Acero" },
    "color.crimson": { en: "Crimson", es: "Carmesí" },

    // Columns Controller
    "columns.no": { en: "No", es: "No" },
    "columns.yes": { en: "Yes", es: "Sí" },
    "columns.type_text": { en: "Text", es: "Texto" },
    "columns.type_long_text": { en: "Long Text", es: "Texto largo" },
    "columns.type_integer": { en: "Integer", es: "Número entero" },
    "columns.type_decimal": { en: "Decimal", es: "Número decimal" },
    "columns.type_date": { en: "Date", es: "Fecha" },
    "columns.type_time": { en: "Time", es: "Hora" },
    "columns.type_file": { en: "File", es: "Archivo" },
    "columns.type_image": { en: "Image", es: "Imagen" },
    "columns.type_select": { en: "Selection", es: "Selección" },
    "columns.type_user": { en: "User", es: "Usuario" },
    "columns.type_current_user": { en: "Current User", es: "Usuario actual" },
    "columns.type_created_at": { en: "Created At", es: "Fecha de creación" },
    "columns.type_updated_at": { en: "Updated At", es: "Fecha de actualización" },
    "columns.link_tables_failed": {
        en: "Could not access tables to link.",
        es: "No se pudo acceder a los tabla a enlazar."
    },
    "columns.link_table_required": {
        en: "You must specify the table to link.",
        es: "Debe especificar la tabla a enlazar."
    },
    "columns.column_created": {
        en: "Column created successfully.",
        es: "Columna creada exitosamente."
    },
    "columns.new_column": {
        en: "New column",
        es: "Nueva columna"
    },
    "columns.column_identifier_not_found": {
        en: "Column identifier not found.",
        es: "No se encontró el identificador de la columna."
    },
    "columns.column_updated": {
        en: "Column updated successfully.",
        es: "Columna modificada exitosamente."
    },
    "columns.column_deleted": {
        en: "Column deleted.",
        es: "Columna eliminada."
    },

    // Sorts Controller
    "sorts.no_sorts": {
        en: "No sorts.",
        es: "No hay ordenamientos"
    },
    "sorts.all_fields_required": {
        en: "All sort fields are required.",
        es: "Todos los campos del ordenamiento son obligatorios."
    },
    "sorts.invalid_type": {
        en: "Sort type must be ASC or DESC.",
        es: "El tipo de ordenamiento debe ser ASC o DESC."
    },
    "sorts.identifier_not_found": {
        en: "Sort identifier not found.",
        es: "No se encontró el identificador del ordenamiento."
    },

    // Filters Controller
    "filters.op_contains": { en: "Contains", es: "Contiene" },
    "filters.op_equals": { en: "Equals", es: "Igual" },
    "filters.op_not_equals": { en: "Not Equal", es: "No igual" },
    "filters.op_greater_than": { en: "Greater Than", es: "Mayor que" },
    "filters.op_less_than": { en: "Less Than", es: "Menor que" },
    "filters.op_greater_equal": { en: "Greater or Equal", es: "Mayor o igual que" },
    "filters.op_less_equal": { en: "Less or Equal", es: "Menor o igual que" },
    "filters.op_in": { en: "In", es: "Dentro de" },
    "filters.op_not_in": { en: "Not In", es: "No dentro de" },
    "filters.op_is_null": { en: "Is Null", es: "Es nulo" },
    "filters.op_is_not_null": { en: "Is Not Null", es: "No es nulo" },
    "filters.value_placeholder": {
        en: "Value",
        es: "Valor"
    },
    "filters.no_filters": {
        en: "No filters.",
        es: "No hay filtros"
    },
    "filters.all_fields_required": {
        en: "All filter fields are required.",
        es: "Todos los campos del filtro son obligatorios."
    },
    "filters.identifier_not_found": {
        en: "Filter identifier not found.",
        es: "No se encontró el identificador del filtro."
    },

    // Views Controller
    "views.not_found": {
        en: "View not found.",
        es: "No se encontró la vista."
    },
    "views.created": {
        en: "View created successfully.",
        es: "Vista creada exitosamente."
    },
    "views.updated": {
        en: "View updated successfully.",
        es: "Vista modificada exitosamente."
    },
    "views.deleted": {
        en: "View deleted successfully.",
        es: "Vista eliminada exitosamente."
    },
    "views.no_views_available": {
        en: "No views available.",
        es: "No se encontró ninguna vista disponible."
    },

    // Data Import Controller
    "import.table_identifier_not_found": {
        en: "Table identifier not found.",
        es: "No se encontró el identificador de la tabla."
    },
    "import.skip": {
        en: "-- SKIP --",
        es: "-- SKIP --"
    },
    "import.message": {
        en: "Message: ${message}",
        es: "Mensaje: ${message}"
    },
    "import.saved": {
        en: "Total saved: ${saved}",
        es: "Total guardados: ${saved}"
    },
    "import.errors": {
        en: "Total not saved: ${errors}",
        es: "Total no guardados: ${errors}"
    },
    "import.error_lines": {
        en: "Rows not saved: ${error_lines}",
        es: "Filas no guardadas: ${error_lines}"
    },

    // Table Settings Controller
    "table_settings.table_updated": {
        en: "Table updated successfully.",
        es: "Tabla actualizada correctamente."
    },
    "table_settings.identifier": {
        en: "Identifier",
        es: "Identificador"
    },
    "table_settings.state": {
        en: "Status",
        es: "Estado"
    },
    "table_settings.created_at": {
        en: "Created at",
        es: "Creada el"
    },
    "table_settings.state_active": {
        en: "Active",
        es: "Activo"
    },
    "table_settings.state_inactive": {
        en: "Inactive",
        es: "Inactivo"
    },
    "table_settings.table_deleted": {
        en: "Table deleted successfully.",
        es: "Tabla eliminada exitosamente."
    },
    "table_settings.go_to_public_form": {
        en: "Go to public form",
        es: "Ir al formulario público"
    },
    "table_settings.permission_created": {
        en: "Table permission created successfully.",
        es: "Permiso de tabla creado exitosamente."
    },
    "table_settings.permission_identifier_not_found": {
        en: "Table permission identifier not found.",
        es: "No se encontró el identificador de permiso de tabla."
    },
    "table_settings.permission_not_found": {
        en: "Table permission not found.",
        es: "No se encontró el permiso de tabla."
    },
    "table_settings.permission_updated": {
        en: "Table permission updated successfully.",
        es: "Permiso de tabla modificado exitosamente."
    },
    "table_settings.permission_deleted": {
        en: "Table permission deleted.",
        es: "Permiso de tabla eliminado."
    },
    "table_settings.db_users_failed": {
        en: "Could not access database users.",
        es: "No se pudo acceder a los usuarios de la base de datos."
    },

    // Custom Select
    "custom_select.select_option": {
        en: "Select an Option...",
        es: "Seleccione una opción..."
    },
    "custom_select.search": {
        en: "Search options...",
        es: "Buscar opciones..."
    },

    // Footer
    "footer.copyright": {
        en: "Copyright &copy; ${year} StructBX.",
        es: "Copyright &copy; ${year} StructBX."
    },
    "footer.privacy_policy": {
        en: "Privacy Policy",
        es: "Política de privacidad"
    },
    "footer.terms_conditions": {
        en: "Terms and Conditions",
        es: "Términos y condiciones"
    },
    "footer.license": {
        en: "Apache 2.0 License",
        es: "Licencia Apache 2.0"
    },

    // Sidebar
    "sidebar.databases": {
        en: "DATABASES",
        es: "BASES DE DATOS"
    },

    // Table elements
    "table_elements.view": {
        en: "View",
        es: "Ver"
    },

    // CSV Reader
    "csv.select_file": {
        en: "Please select a CSV file.",
        es: "Por favor, selecciona un archivo CSV."
    },
    "csv.read_error": {
        en: "Error reading file: ${error}",
        es: "Error al leer el archivo: ${error}"
    },

    // Language selector
    "language.en": {
        en: "English",
        es: "Inglés"
    },
    "language.es": {
        en: "Spanish",
        es: "Español"
    },

    // Theme
    "theme.toggle": {
        en: "Toggle theme",
        es: "Cambiar tema"
    },
    "theme.dark": {
        en: "Dark mode",
        es: "Modo oscuro"
    },
    "theme.light": {
        en: "Light mode",
        es: "Modo claro"
    },

    // ──────────────────────────────
    // HTML static text (data-i18n)
    // ──────────────────────────────

    // Login page
    "login.page_title": { en: "Login - StructBX", es: "Iniciar sesión - StructBX" },
    "login.welcome_back": { en: "Welcome back", es: "Bienvenido de nuevo" },
    "login.welcome_message": { en: "Log in to access your database management platform", es: "Inicia sesión para acceder a tu plataforma de gestión de bases de datos" },
    "login.email_label": { en: "Email", es: "Correo electrónico" },
    "login.email_placeholder": { en: "name@example.com", es: "nombre@ejemplo.com" },
    "login.email_invalid": { en: "Please enter a valid email.", es: "Por favor ingresa un correo electrónico válido." },
    "login.password_label": { en: "Password", es: "Contraseña" },
    "login.password_placeholder": { en: "Enter your password", es: "Ingresa tu contraseña" },
    "login.password_required": { en: "Please enter your password.", es: "Por favor ingresa tu contraseña." },
    "login.submit": { en: "Log in", es: "Iniciar sesión" },
    "login.feature_db_title": { en: "Database Management", es: "Gestión de Bases de Datos" },
    "login.feature_db_desc": { en: "Create and manage your databases intuitively", es: "Crea y administra tus bases de datos de forma intuitiva" },
    "login.feature_table_title": { en: "Related Tables", es: "Tablas Relacionadas" },
    "login.feature_table_desc": { en: "Easily establish relationships between tables", es: "Establece relaciones entre tablas fácilmente" },
    "login.feature_views_title": { en: "Custom Views", es: "Vistas Personalizadas" },
    "login.feature_views_desc": { en: "Create views with predefined filters for quick access", es: "Crea vistas con filtros predefinidos para un acceso rápido" },
    "login.feature_discover_html": { en: 'Don\'t know StructBX yet? <a href="https://structbx.com" class="text-white fw-bold">Discover more</a>', es: '¿Aún no conoces StructBX? <a href="https://structbx.com" class="text-white fw-bold">Descubre más</a>' },
    "login.brand_logo_alt": { en: "StructBX Logo", es: "StructBX Logo" },

    // Home page (index.html)
    "index.page_title": { en: "Home - StructBX", es: "Inicio - StructBX" },
    "index.breadcrumb_tables": { en: "Tables", es: "Tablas" },
    "index.search_placeholder": { en: "Search tables by name...", es: "Buscar tablas por nombre..." },
    "index.search_clear_title": { en: "Clear search", es: "Limpiar búsqueda" },
    "index.add_table_title": { en: "Add new table", es: "Añadir nueva tabla" },
    "index.modal_add_title": { en: "Add new table", es: "Añadir nueva tabla" },
    "index.modal_name": { en: "Name", es: "Nombre" },
    "index.modal_description": { en: "Description", es: "Descripción" },
    "index.cancel": { en: "Cancel", es: "Cancelar" },
    "index.create": { en: "Create", es: "Crear" },

    // Form page
    "form.page_title": { en: "Form - StructBX", es: "Formulario - StructBX" },
    "form.form_description": { en: "Add a new record by submitting this form", es: "Agrega un nuevo registro enviando este formulario" },
    "form.required_indicator_html": { en: '<span class="required-indicator">*</span> Indicates a required field', es: '<span class="required-indicator">*</span> Indica un campo requerido' },
    "form.submit": { en: "Submit form", es: "Enviar formulario" },
    "form.success_title": { en: "Form submitted!", es: "¡Formulario enviado!" },
    "form.success_message": { en: "Your record has been saved in the corresponding table.", es: "Su registro ha sido guardado en la correspondiente tabla." },
    "form.form_continue": { en: "Continue", es: "Continuar" },

    // Table page
    "table.page_title": { en: "Table - StructBX", es: "Tabla - StructBX" },
    "table.sidebar_search": { en: "Search...", es: "Buscar..." },
    "table.create_view": { en: "Create new view", es: "Crear nueva vista" },
    "table.no_views": { en: "No views", es: "No hay vistas" },
    "table.add_column": { en: "New column", es: "Nueva columna" },
    "table.no_columns": { en: "No columns", es: "No hay columnas" },
    "table.add_filter": { en: "Add filter", es: "Agregar filtro" },
    "table.no_filters": { en: "No filters", es: "No hay filtros" },
    "table.add_sort": { en: "Add sort", es: "Agregar ordenamiento" },
    "table.no_sorts": { en: "No sorts", es: "No hay ordenamientos" },
    "table.import_data": { en: "Import data", es: "Importar data" },
    "table.export_data": { en: "Export data", es: "Exportar data" },
    "table.go_settings": { en: "Settings", es: "Configuración" },
    "table.modal_add_column": { en: "Add column", es: "Añadir columna" },
    "table.modal_column_name": { en: "Column name", es: "Nombre de columna" },
    "table.modal_column_type": { en: "Type", es: "Tipo" },
    "table.modal_column_link": { en: "Link to", es: "Enlazar a" },
    "table.modal_column_advanced": { en: "Advanced", es: "Avanzado" },
    "table.modal_column_description": { en: "Description", es: "Descripción" },
    "table.modal_column_required": { en: "Required", es: "Obligatorio" },
    "table.modal_column_default": { en: "Default value", es: "Valor por defecto" },
    "table.modal_add_column_btn": { en: "Add column", es: "Agregar columna" },
    "table.modal_modify_column": { en: "Modify column", es: "Modificar columna" },
    "table.modal_identifier": { en: "Identifier", es: "Identificador" },
    "table.modal_delete_column": { en: "Delete column", es: "Borrar columna" },
    "table.modal_modify": { en: "Modify", es: "Modificar" },
    "table.modal_confirm_delete_column": { en: "Are you sure you want to delete the column", es: "Seguro desea eliminar la columna" },
    "table.cancel": { en: "Cancel", es: "Cancelar" },
    "table.modal_add_record": { en: "New record", es: "Nuevo registro" },
    "table.modal_options": { en: "Options", es: "Opciones" },
    "table.modal_color": { en: "Color", es: "Color" },
    "table.modal_add_record_btn": { en: "Add record", es: "Agregar registro" },
    "table.modal_modify_record": { en: "Modify record", es: "Modificar registro" },
    "table.modal_modify_record_btn": { en: "Save", es: "Guardar" },
    "table.modal_delete_record": { en: "Delete record", es: "Borrar registro" },
    "table.modal_confirm_delete_record": { en: "Are you sure you want to delete the record ID", es: "Seguro desea eliminar el registro ID" },
    "table.modal_import_title": { en: "Import data", es: "Importar data" },
    "table.import_data_source": { en: "Data source", es: "Fuente de datos" },
    "table.import_source_file": { en: "Source file", es: "Archivo fuente" },
    "table.import_separator": { en: "Separator", es: "Separador" },
    "table.import_tab": { en: "TAB", es: "TAB" },
    "table.import_space": { en: "Space", es: "Espacio" },
    "table.import_map_columns": { en: "Map columns", es: "Mapear columnas" },
    "table.import_source_col": { en: "Source column", es: "Columna fuente" },
    "table.import_target_col": { en: "Target column", es: "Columna objetivo" },
    "table.import_preview": { en: "Preview", es: "Previsualización" },
    "table.import_import": { en: "Import data", es: "Importar data" },
    "table.import_message_title": { en: "Import message", es: "Mensaje de importación" },
    "table.close": { en: "Close", es: "Cerrar" },
    "table.export_confirm": { en: "Confirm to export the data along with the applied filters:", es: "Confirmar exportar la data junto con los filtros aplicados:" },
    "table.export_export": { en: "Export data", es: "Exportar data" },
    "table.modal_add_view": { en: "New view", es: "Nueva vista" },
    "table.modal_view_name_placeholder": { en: "View name", es: "Nombre de la vista" },
    "table.add": { en: "Add", es: "Agregar" },
    "table.modal_modify_view": { en: "Modify view", es: "Modificar vista" },
    "table.modal_view_change_name": { en: "Change the view name", es: "Cambie el nombre de la vista" },
    "table.update": { en: "Update", es: "Actualizar" },
    "table.modal_delete_view": { en: "Delete view", es: "Borrar vista" },
    "table.modal_confirm_delete_view": { en: "Are you sure you want to delete the view", es: "Seguro desea eliminar la vista" },
    "table.modal_settings_title": { en: "Settings", es: "Configuraciones" },
    "table.settings_general": { en: "General", es: "General" },
    "table.settings_name": { en: "Name", es: "Nombre" },
    "table.settings_public_form": { en: "Public form", es: "Formulario público" },
    "table.settings_save": { en: "Save", es: "Guardar" },
    "table.settings_permissions": { en: "Table permissions", es: "Permisos de la tabla" },
    "table.settings_permissions_user": { en: "User", es: "Usuario" },
    "table.settings_permissions_read": { en: "Read", es: "Leer" },
    "table.settings_permissions_add": { en: "Add", es: "Añadir" },
    "table.settings_permissions_modify": { en: "Modify", es: "Modificar" },
    "table.settings_permissions_delete": { en: "Delete", es: "Eliminar" },
    "table.settings_permissions_just_owner": { en: "Owner only", es: "Solo si es dueño" },
    "table.modal_add_permission": { en: "Add table permission", es: "Añadir permiso de tabla" },
    "table.modal_permission_read": { en: "Read permission", es: "Permiso de lectura" },
    "table.modal_permission_create": { en: "Permission to create entries", es: "Permiso para crear entradas" },
    "table.modal_permission_modify": { en: "Permission to modify entries", es: "Permiso para modificar entradas" },
    "table.modal_permission_delete": { en: "Permission to delete entries", es: "Permiso para borrar entradas" },
    "table.modal_permission_owner": { en: "Owner only permission", es: "Permiso solo si es dueño" },
    "table.modal_modify_permission": { en: "Modify table permission", es: "Modificar permiso de tabla" },
    "table.modal_user": { en: "User", es: "Usuario" },
    "table.modal_delete_permission": { en: "Delete table permission", es: "Eliminar permiso de tabla" },
    "table.modal_confirm_delete_permission": { en: "Are you sure you want to delete this table permission:", es: "Seguro desea eliminar este permiso de tabla:" },
    "table.settings_delete_table": { en: "Delete table", es: "Eliminar tabla" },
    "table.settings_irreversible": { en: "This action cannot be undone:", es: "Esta acción no se puede deshacer:" },
    "table.settings_delete_btn": { en: "Delete table", es: "Eliminar tabla" },
    "table.modal_confirm_delete_table": { en: "Are you sure you want to delete the table <strong class=\"name\"></strong>, this will delete all records in it", es: "Seguro desea eliminar la tabla <strong class=\"name\"></strong>, esto eliminará todos los registros en él" },
    "table.delete": { en: "Delete", es: "Eliminar" },

    // Settings page
    "settings.page_title": { en: "Settings - StructBX", es: "Configuraciones - StructBX" },
    "settings.breadcrumb": { en: "Settings", es: "Configuraciones" },
    "settings.menu_databases": { en: "Databases", es: "Bases de datos" },
    "settings.menu_my_account": { en: "My Account", es: "Mi cuenta" },
    "settings.menu_instance": { en: "Instance", es: "Instancia" },
    "settings.menu_users": { en: "Users", es: "Usuarios" },
    "settings.menu_groups": { en: "Groups", es: "Grupos" },
    "settings.menu_permissions": { en: "Permissions", es: "Permisos" },
    "settings.my_databases": { en: "My databases", es: "Mis bases de datos" },
    "settings.database_name": { en: "Database", es: "Base de datos" },
    "settings.db_storage_db": { en: "DB Storage", es: "Almacenamiento en DB" },
    "settings.db_storage_disk": { en: "Disk Storage", es: "Almacenamiento en Disco" },
    "settings.description": { en: "Description", es: "Descripción" },
    "settings.created_at": { en: "Created at", es: "Fecha de creación" },
    "settings.modal_create_db": { en: "Create new database", es: "Crear nueva base de datos" },
    "settings.name": { en: "Name", es: "Nombre" },
    "settings.cancel": { en: "Cancel", es: "Cancelar" },
    "settings.create": { en: "Create", es: "Crear" },
    "settings.db_users": { en: "Database users:", es: "Usuarios de base de datos:" },
    "settings.user": { en: "User", es: "Usuario" },
    "settings.created": { en: "Created", es: "Creado" },
    "settings.modal_add_db_user": { en: "Add user to database", es: "Añadir usuario a base de datos" },
    "settings.add": { en: "Add", es: "Añadir" },
    "settings.modal_remove_db_user": { en: "Remove user from database", es: "Eliminar usuario de base de datos" },
    "settings.confirm_remove_user": { en: "Are you sure you want to remove the user <strong class=\"username\"></strong> from this database?", es: "Seguro desea eliminar al usuario <strong class=\"username\"></strong> de esta base de datos?" },
    "settings.delete": { en: "Delete", es: "Eliminar" },
    "settings.my_account_general": { en: "General Information", es: "Información general" },
    "settings.email": { en: "Email", es: "Correo electrónico" },
    "settings.save": { en: "Save", es: "Guardar" },
    "settings.change_password": { en: "Change password", es: "Cambiar contraseña" },
    "settings.current_password": { en: "Current password", es: "Contraseña actual" },
    "settings.new_password": { en: "New password", es: "Nueva contraseña" },
    "settings.repeat_password": { en: "Repeat new password", es: "Repetir contraseña actual" },
    "settings.api_key": { en: "API Key", es: "API Key" },
    "settings.your_api_key": { en: "Your API Key", es: "Tu API Key" },
    "settings.copy_clipboard_title": { en: "Copy to clipboard", es: "Copiar al portapapeles" },
    "settings.toggle_show_title": { en: "Show/Hide", es: "Mostrar/Ocultar" },
    "settings.api_key_usage_html": { en: "Use this header in your requests: <code>X-API-Key: &lt;your_key&gt;</code>", es: "Usa este header en tus peticiones: <code>X-API-Key: &lt;tu_key&gt;</code>" },
    "settings.generate_new": { en: "Generate new", es: "Generar nueva" },
    "settings.revoke": { en: "Revoke", es: "Revocar" },
    "settings.instance_name": { en: "Instance name", es: "Nombre de instancia" },
    "settings.instance_name_label": { en: "Instance name", es: "Nombre de la instancia" },
    "settings.instance_logo": { en: "Instance logo", es: "Logo de la instancia" },
    "settings.instance_logo_current_alt": { en: "Current instance logo", es: "Logo actual de la instancia" },
    "settings.instance_logo_upload": { en: "Image (Only .png, .jpeg or .jpg < 5 MB)", es: "Imagen (Solo .png, jpeg o jpg < 5 MB)" },
    "settings.users": { en: "Users", es: "Usuarios" },
    "settings.status": { en: "Status", es: "Estado" },
    "settings.group": { en: "Group", es: "Grupo" },
    "settings.modal_add_user": { en: "Add new user", es: "Añadir nuevo usuario" },
    "settings.password": { en: "Password", es: "Contraseña" },
    "settings.modal_edit_user": { en: "Edit user", es: "Editar usuario" },
    "settings.modal_delete_user": { en: "Delete user", es: "Eliminar usuario" },
    "settings.confirm_delete_user": { en: "Are you sure you want to delete the user", es: "Seguro desea eliminar el usuario" },
    "settings.groups": { en: "Groups", es: "Grupos" },
    "settings.modal_add_group": { en: "Add new group", es: "Añadir nuevo grupo" },
    "settings.modal_edit_group": { en: "Edit group", es: "Editar grupo" },
    "settings.eliminar_grupo": { en: "Delete group", es: "Eliminar grupo" },
    "settings.confirm_delete_group": { en: "Are you sure you want to delete the group", es: "Seguro desea eliminar el grupo" },
    "settings.borrar": { en: "Delete", es: "Borrar" },
    "settings.permissions": { en: "Permissions", es: "Permisos" },
    "settings.permission_col": { en: "Permission", es: "Permiso" },
    "settings.action_col": { en: "Action", es: "Acción" },
    "settings.modal_add_permission": { en: "Add new permission", es: "Añadir nuevo permiso" },
    "settings.modal_endpoint": { en: "Endpoint", es: "Endpoint" },
    "settings.modal_delete_permission": { en: "Delete permission", es: "Eliminar permiso" },
    "settings.confirm_delete_permission": { en: "Are you sure you want to delete the permission", es: "Seguro desea eliminar el permiso" },
    "settings.modal_edit_db": { en: "Edit database", es: "Editar base de datos" },
    "settings.modal_delete_db": { en: "Delete database", es: "Eliminar base de datos" },
    "settings.confirm_delete_db": { en: "To delete this database, type its name: <strong class=\"database-name\"></strong>", es: "Para eliminar esta base de datos, escriba su nombre: <strong class=\"database-name\"></strong>" },
    "settings.type_name_to_confirm": { en: "Type the database name to confirm", es: "Escriba el nombre de la base de datos para confirmar" },
};
