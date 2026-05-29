export class CustomSelect
{
    constructor(element)
    {
        // 1. Variables
        const self = this;
        this.open = false;
        
        // 2. Save the original selector/element
        this.originalElement = element;
        this.containerSelector = element;
        
        // 3. Create HTML first
        this.html_element = $(`
            <div class="custom-select-container">
                <input type="hidden" class="selectValue" name="selected_option" value="">
                <div class="custom-select-display form-control d-flex justify-content-between align-items-center shadow-sm" tabindex="0">
                    <span class="selectedText">Select an Option...</span>
                    <i class="fas fa-chevron-down"></i>
                </div>
                <div class="custom-select-dropdown shadow-lg d-none">
                    <div class="p-2 border-bottom">
                        <input type="text" class="form-control searchBox" placeholder="Search options...">
                    </div>
                    <ul class="selectOptions custom-select-list list-unstyled mb-0">
                    </ul>
                </div>
            </div>
        `);

        // 4. Add to DOM first
        this.Build_();
        
        // 5. Search elements INSIDE the already created container
        // Use find() instead of concatenated selectors
        this.container = $(element).find('.custom-select-container');
        this.display = this.container.find('.custom-select-display');
        this.dropdown = this.container.find('.custom-select-dropdown');
        this.options = this.container.find('.selectOptions');
        this.searchBox = this.container.find('.searchBox');
        this.hiddenInput = this.container.find('.selectValue');
        this.selectedText = this.container.find('.selectedText');

        // --- 1. Dropdown Toggle Handling ---
        this.display.on('click', (e) =>  // FIX: Use arrow function
        {
            e.stopPropagation(); // Prevent click from propagating to document
            this.dropdown.toggleClass('d-none');
            this.open = !this.dropdown.hasClass('d-none');
            
            // Focus on search box when opening
            if (!this.dropdown.hasClass('d-none'))
            {
                setTimeout(() => this.searchBox.focus(), 50); // Small delay to ensure visibility
            }
        });

        // --- 2. Close Dropdown when clicking outside ---
        $(document).on('click', function()
        {
            if(self.open)
                self.CloseDropdown_();
        });

        // --- 3. Option Selection and Update ---
        this.options.on('click', '.custom-select-item', function()
        {
            const $item = $(this);

            // a) Get data value and enriched HTML content
            const selectedValue = $item.data('value');
            const selectedHtml = $item.html();

            // b) Update hidden field for form submission
            self.hiddenInput.val(selectedValue);

            // c) Update visible display text with HTML content
            self.selectedText.html(selectedHtml);

            // d) Mark item as selected (visual style)
            self.options.find('.custom-select-item').removeClass('selected');
            $item.addClass('selected');

            // e) Close dropdown using method
            self.CloseDropdown_();

            // f) Trigger custom event so other scripts know
            self.container.trigger('customselect:change', [selectedValue, selectedHtml]);
        });

        // --- 4. Instant Search Functionality ---
        this.searchBox.on('keyup', function()
        {
            const searchText = $(this).val().toLowerCase().trim();

            self.options.find('.custom-select-item').each(function()
            {
                const $item = $(this);
                const itemText = $item.text().toLowerCase();

                if (itemText.includes(searchText))
                {
                    $item.removeClass('d-none'); // FIX: Use Bootstrap's d-none
                }
                else
                {
                    $item.addClass('d-none');
                }
            });
        });

        // 6. Handle Escape key to close
        this.searchBox.on('keydown', function(e)
        {
            if (e.key === 'Escape')
            {
                self.CloseDropdown_();
            }
        });
    }
    
    // Method to close dropdown (reusable)
    CloseDropdown_()
    {
        this.dropdown.addClass('d-none');
        
        // Clear search when closing
        this.searchBox.val('');
        this.options.find('.custom-select-item').removeClass('d-none');
    }
    
    // Improved Build method
    Build_()
    {
        // Clear original element first
        $(this.originalElement).empty().append(this.html_element);
        
        // If it's an existing input, copy initial value
        const originalInput = $(this.originalElement).find('input[type="hidden"]');
        if (originalInput.length)
        {
            const initialValue = originalInput.val();
            if (initialValue)
            {
                this.setValue(initialValue);
            }
        }
    }
    
    // Set value programmatically
    setValue(value)
    {
        const $item = this.options.find(`[data-value="${value}"]`);
        if ($item.length)
        {
            $item.trigger('click');
            return true;
        }
        return false;
    }
    
    // Get current value
    getValue()
    {
        return this.hiddenInput.val();
    }
    
    // Get current text
    getText()
    {
        return this.selectedText.text();
    }
    
    // Add option dynamically
    AddOption_(value, html, data = {})
    {
        const $newItem = $(`
            <li data-value="${value}" class="custom-select-item p-2">
                ${html}
            </li>
        `);
        
        // Add additional data if exists
        if (data.class) $newItem.addClass(data.class);
        if (data.icon) $newItem.prepend(`<i class="${data.icon} me-2"></i>`);
        
        this.options.append($newItem);
        return $newItem;
    }
    
    // Remove option
    RemoveOption_(value)
    {
        const $item = this.options.find(`[data-value="${value}"]`);
        if ($item.length)
        {
            // If it's the selected item, clear selection
            if ($item.hasClass('selected'))
            {
                this.hiddenInput.val('');
                this.selectedText.html('Select an Option...');
            }
            $item.remove();
            return true;
        }
        return false;
    }
    
    // Enable/disable
    setDisabled(disabled)
    {
        if (disabled)
        {
            this.display.addClass('disabled').attr('tabindex', '-1');
            this.container.addClass('disabled');
        }
        else
        {
            this.display.removeClass('disabled').attr('tabindex', '0');
            this.container.removeClass('disabled');
        }
    }
    
    // Destructor
    destroy()
    {
        // Remove event listeners
        this.display.off('click');
        $(document).off('click');
        this.options.off('click');
        this.searchBox.off('keyup keydown');
        
        // Remove HTML
        $(this.originalElement).empty();
        
        // Clear references
        this.container = null;
        this.display = null;
        this.dropdown = null;
        this.options = null;
        this.searchBox = null;
        this.hiddenInput = null;
        this.selectedText = null;
    }
};

export class Footers
{
    constructor()
    {
        
    }
    footer()
    {
        let year = new Date().getFullYear();
        $(".main_footer").append
        (`
            <div class="py-3 my-4">
                <div class="d-flex align-items-center justify-content-between small">
                    <div class="text-muted">Copyright &copy; ${year} StructBX.</div>
                    <div>
                        <a target="_blank" href="https://structbx.com">structbx.com</a>
                        &middot;
                        <a target="_blank" href="https://structbx.com/assets/files/terms_and_conditions.pdf">Pol&iacute;tica de privacidad</a>
                        &middot;
                        <a target="_blank" href="https://structbx.com/assets/files/privacy_policy.pdf">T&eacute;rminos y condiciones</a>
                        &middot;
                        <a target="_blank" href="https://www.apache.org/licenses/LICENSE-2.0">Licencia Apache 2.0</a>
                    </div>
                </div>
            </div>
        `);
    }
}

export class Headers
{
    constructor(){}
    header()
    {
        $("#header_main").append
        (`
            <div class="container-xxl d-flex justify-content-between">
                <a class="navbar-brand d-flex align-items-center m-0 user-select-none" href="/">
                    <div class="container">
                        <img width="40px;" src="/api/general/instanceLogo/read?logo-color=white" alt="Logo">
                    </div>
                </a>
                <button class="navbar-toggler d-md-none collapsed btn-ligth text-end user-select-none" type="button" data-bs-toggle="collapse" data-bs-target=".sidebar" aria-controls="sidebar" aria-expanded="false" aria-label="Toggle navigation">
                    <i class="fas fa-bars" style="color:#fff;"></i>
                </button>
                <div class="sidebar d-md-flex justify-content-between collapse navbar-collapse text-center text-md-left user-select-none">
                    <ul class="navbar-nav">
                        <li class="nav-item ms-md-2 mt-2 mt-md-0">
                            <div class="d-flex align-items-center h-100">
                                <h5 id="instance_name" class="m-0 fw-bold"></h5>
                            </div>
                        </li>
                    </ul>
                </div>
                <div class="sidebar d-md-flex collapse navbar-collapse text-center text-md-left">
                    <ul class="navbar-nav ms-md-auto me-3 me-lg-4">
                        <li class="nav-item me-2">
                            <div class="dropdown">
                                <a class="btn btn-ligth dropdown-toggle" type="button" id="component_databases_selector_btn" data-bs-toggle="dropdown" aria-expanded="false">
                                    <i class="fas fa-building me-2"></i>
                                    <span class="database_name"></span>
                                </a>
                                <ul id="component_databases_selector" class="dropdown-menu bg-dark" aria-labelledby="component_databases_selector_btn">
                                </ul>
                            </div>
                        </li>
                        <div class="vr mx-4 d-none d-md-inline-block"></div>
                        <li class="nav-item me-2">
                            <div class="d-flex align-items-center h-100 text-center">
                                <a class="btn btn-sm btn-outline-light py-2 px-4 d-block d-md-inline-block w-100 mb-2 mb-md-0 go-button" go-path="/administration" go-hash="#my_account" href="#">
                                    <span class="me-2"><i class="fas fa-user"></i></span>
                                    <span class="username_logued"></span>
                                </a>
                            </div>
                        </li>
                        <div class="vr mx-4 d-none d-md-inline-block"></div>
                        <li class="nav-item me-2 text-light">
                            <a class="nav-link" href="#section_settings" data-bs-toggle="modal" data-bs-target="#section_settings">
                                <i class="fas fa-cog fa-fw text-light"></i>
                            </a>
                        </li>
                        <li class="nav-item me-2">
                            <a class="nav-link" href="#" id="logout-button">
                                <i class="fas fa-sign-out-alt text-light"></i>
                            </a>
                        </li>
                    </ul>
                </div>
            </div>
        `);    
    }
}

export class Sidebars
{
    constructor() {}
    sidebarMenu ()
    {
        let sidebar_menu = $('<nav class="nav nav-pills flex-column justify-contents-between pt-4"></nav>');
        sidebar_menu.append($(`
            <h5 class="small text-uppercase text-muted">BASES DE DATOS</h5>
            <div id="component_sidebar_databases">
                <div class="notifications"></div>
                <div class="contents"></div>
            </div>
        `));

        $("#menu_main").append(sidebar_menu);
    }
    sidebarSettings ()
    {
        let sidebar_menu = $('<nav class="nav nav-pills flex-column justify-contents-between pt-4"></nav>');
        sidebar_menu.append($(`
            <div class="nav-item" permission-endpoint="/api/databases/read">
                <a class="menu_databases nav-link mb-2" href="#databases" menu="databases">
                    <i class="fas fa-building"></i>
                    <span class="ms-2">Bases de datos</span>
                </a>
            </div>
            <div class="nav-item">
                <a class="menu_my_account nav-link mb-2" href="#my_account" menu="my_account">
                    <i class="fas fa-user"></i>
                    <span class="ms-2">Mi cuenta</span>
                </a>
            </div>
            <div class="nav-item" permission-endpoint="/api/general/instanceName/modify">
                <a class="menu_instance nav-link mb-2" href="#instance" menu="instance">
                    <i class="fas fa-home"></i>
                    <span class="ms-2">Instancia</span>
                </a>
            </div>
            <div class="nav-item" permission-endpoint="/api/general/users/read">
                <a class="menu_users nav-link mb-2" href="#users" menu="users">
                    <i class="fas fa-users"></i>
                    <span class="ms-2">Usuarios</span>
                </a>
            </div>
            <div class="nav-item" permission-endpoint="/api/general/groups/read">
                <a class="menu_groups nav-link mb-2" href="#groups" menu="groups">
                    <i class="fas fa-users-cog"></i>
                    <span class="ms-2">Grupos</span>
                </a>
            </div>
            <div class="nav-item" permission-endpoint="/api/general/permissions/read">
                <a class="menu_permissions nav-link mb-2" href="#permissions" menu="permissions">
                    <i class="fas fa-user-lock"></i>
                    <span class="ms-2">Permisos</span>
                </a>
            </div>
        `));

        $("#section_settings .sidebar").append(sidebar_menu);
    }
}

export class SettingsSection{
    build(){
        const settings = `

            <!-- Databases section -->
            <section class="section_databases d-none" permission-endpoint="/api/databases/read">
                <div class="pb-2 mb-3 border-bottom">
                    <ol class="breadcrumb h4">
                        <li class="breadcrumb-item">Configuraciones</li>
                        <li class="breadcrumb-item active" aria-current="page">Bases de datos</li>
                    </ol>
                </div>

                <!-- Databases: Read -->
                <section id="component_databases_read">
                    <article class="card p-4 bg-white mb-4">
                        <!-- Card header -->
                        <header class="mb-4 px-4 py-2 primary-background rounded d-flex">
                            <div class="flex-grow-1 align-self-center">
                                <span class="fw-bold">Mis bases de datos</span>
                            </div>
                            <div class="p-2">
                                <button class="btn btn-dark-shadow add">
                                    <i class="fas fa-plus"></i>
                                </button>
                            </div>
                        </header>
                        <!-- /Card header -->
                        <!-- Contents -->
                        <div class="mb-2 mt-4">
                            
                            <div class="notifications"></div>
                            <div class="table-responsive">
                                <table class="table table-hover table-bordered">
                                    <thead class="table-light text-center align-middle text-nowrap">
                                        <tr>
                                            <th scope="col">Base de datos</th>
                                            <th scope="col">Almacenamiento en DB</th>
                                            <th scope="col">Almacenamiento en Disco</th>
                                            <th scope="col">Descripci&oacute;n</th>
                                            <th scope="col">Fecha de creaci&oacute;n</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                    </tbody>
                                </table>
                            </div>

                        </div>
                        <!-- /Contents -->
                        
                    </article>
                </section>
                <!-- /Databases: Read -->

                <!-- Databases: Add -->
                <div class="modal right-side-modal fade" id="component_databases_add" tabindex="-1" aria-labelledby="component_databases_add_label" aria-hidden="true">
                    <div class="modal-dialog modal-lg">
                        <form class="modal-content" novalidate>
                            <div class="modal-header">
                                <h5 class="modal-title">
                                    <i class="fas fa-plus-circle me-2"></i>Crear nueva base de datos
                                </h5>
                                <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
                            </div>
                            <div class="modal-body">
                                <div class="notifications"></div>
                                <table class="table">
                                    <tbody>
                                        <tr>
                                            <td>Nombre</td>
                                            <td><input class="form-control" type="text" name="name" required></td>
                                        </tr>
                                        <tr>
                                            <td>Descripci&oacute;n</td>
                                            <td><textarea class="form-control" type="text" name="description"></textarea></td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                            <div class="modal-footer">
                                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">
                                    <i class="fas fa-arrow-left me-2"></i>Cancelar
                                </button>
                                <button type="submit" class="btn btn-primary">
                                    <i class="fas fa-plus-circle me-2"></i>Crear
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
                <!-- /Databases: Add -->

            </section>
            <!-- /Databases section -->

            <!-- My Account section -->
            <section class="section_my_account d-none">
                <div class="pb-2 mb-3 border-bottom">
                    <ol class="breadcrumb h4">
                        <li class="breadcrumb-item">Configuraciones</li>
                        <li class="breadcrumb-item active" aria-current="page">Mi cuenta</li>
                    </ol>
                </div>

                <!-- My Account: General -->
                <article id="component_my_account_general" class="card p-4 bg-white mb-4">
                    <!-- Card header -->
                    <header class="mb-4 px-4 py-2 primary-background rounded d-flex">
                        <div class="flex-grow-1 align-self-center">
                            <span class="fw-bold">Informaci&oacute;n general</span>
                        </div>
                    </header>
                    <!-- /Card header -->
                    <!-- Contents -->
                    <div class="mb-2 mt-4">

                        <div class="notifications"></div>
                        <form novalidate>
                            <table class="table">
                                <tbody>
                                    <tr>
                                        <th scope="row">Correo electr&oacute;nico</th>
                                        <td scope="row"><input type="email" class="form-control" name="username"></td>
                                    </tr>
                                </tbody>
                            </table>
                            <div class="mt-2">
                                <button type="submit" class="btn btn-primary">Guardar</button>
                            </div>
                        </form>

                    </div>
                    <!-- /Contents -->
                    
                </article>
                <!-- /My Account: General -->

                <!-- My Account: Change password -->
                <article id="component_my_account_change_password" class="card p-4 bg-white mb-4">
                    <!-- Card header -->
                    <header class="mb-4 px-4 py-2 primary-background rounded d-flex">
                        <div class="flex-grow-1 align-self-center">
                            <span class="fw-bold">Cambiar contrase&ntilde;a</span>
                        </div>
                    </header>
                    <!-- /Card header -->
                    <!-- Contents -->
                    <div class="mb-2 mt-4">

                        <div class="notifications"></div>
                        <form novalidate>
                            <table class="table">
                                <tbody>
                                    <tr>
                                        <th scope="row">Contrase&ntilde;a actual</th>
                                        <td scope="row"><input type="password" class="form-control" name="current_password" required></td>
                                    </tr>
                                    <tr>
                                        <th scope="row">Nueva contrase&ntilde;a</th>
                                        <td scope="row"><input type="password" class="form-control" name="new_password" required></td>
                                    </tr>
                                    <tr>
                                        <th scope="row">Repetir contrase&ntilde;a actual</th>
                                        <td scope="row"><input type="password" class="form-control" name="new_password2" required></td>
                                    </tr>
                                </tbody>
                            </table>
                            <div class="mt-2">
                                <button type="submit" class="btn btn-primary">Guardar</button>
                            </div>
                        </form>
                        
                    </div>
                    <!-- /Contents -->
                    
                </article>
                <!-- /My Account: Change password -->

            </section>
            <!-- /My Account section -->

            <!-- Instance section -->
            <section class="section_instance d-none" permission-endpoint="/api/general/instanceName/read">
                <div class="pb-2 mb-3 border-bottom">
                    <ol class="breadcrumb h4">
                        <li class="breadcrumb-item">Configuraciones</li>
                        <li class="breadcrumb-item active" aria-current="page">Instancia</li>
                    </ol>
                </div>

                <!-- Instancia: Name: Read -->
                <section  id="component_instance_name_read">
                    <article class="card p-4 bg-white mb-4">
                        <!-- Card header -->
                        <header class="mb-4 px-4 py-2 primary-background rounded d-flex">
                            <div class="flex-grow-1 align-self-center">
                                <span class="fw-bold">Nombre de instancia</span>
                            </div>
                        </header>
                        <!-- /Card header -->
                        <!-- Contents -->
                        <div class="mb-2 mt-4">

                            <div class="notifications"></div>
                            <form novalidate>
                                <table class="table">
                                    <tbody>
                                        <tr>
                                            <th scope="row">Nombre de la instancia</th>
                                            <td scope="row"><input type="text" class="form-control" name="name"></td>
                                        </tr>
                                    </tbody>
                                </table>
                                <div class="mt-2">
                                    <button type="submit" class="btn btn-primary">Guardar</button>
                                </div>    
                            </form>

                        </div>
                        <!-- /Contents -->
                        
                    </article>
                </section>
                <!-- /Instance: Name: Read -->

                <!-- Instancia: Logo: Read -->
                <section  id="component_instance_logo_read" permission-endpoint="/api/general/instanceLogo/modify">
                    <article class="card p-4 bg-white mb-4">
                        <!-- Card header -->
                        <header class="mb-4 px-4 py-2 primary-background rounded d-flex">
                            <div class="flex-grow-1 align-self-center">
                                <span class="fw-bold">Logo de la instancia</span>
                            </div>
                        </header>
                        <!-- /Card header -->
                        <!-- Contents -->
                        <div class="mb-2 mt-4">

                            <div class="notifications"></div>
                            <div class="text-center mb-4">
                                <img src="/api/general/instanceLogo/read" width="200px" src="" alt="Logo actual de la instancia">
                            </div>
                            <form novalidate>
                                <table class="table">
                                    <tbody>
                                        <tr>
                                            <th scope="row">Imagen (Solo .png, jpeg o jpg < 5 MB)</th>
                                            <td scope="row"><input type="file" class="form-control" name="logo" required></td>
                                        </tr>
                                    </tbody>
                                </table>
                                <div class="mt-2">
                                    <button type="submit" class="btn btn-primary">Guardar</button>
                                </div>    
                            </form>

                        </div>
                        <!-- /Contents -->
                        
                    </article>
                </section>
                <!-- /Instance: Logo: Read -->

            </section>
            <!-- /Instance section -->

            <!-- Users section -->
            <section class="section_users d-none" permission-endpoint="/api/general/users/read">
                <div class="pb-2 mb-3 border-bottom">
                    <ol class="breadcrumb h4">
                        <li class="breadcrumb-item">Configuraciones</li>
                        <li class="breadcrumb-item active" aria-current="page">Usuarios</li>
                    </ol>
                </div>

                <!-- Users: Read -->
                <section id="component_users_read">
                    <article class="card p-4 bg-white mb-4">
                        <!-- Card header -->
                        <header class="mb-4 px-4 py-2 primary-background rounded d-flex">
                            <div class="flex-grow-1 align-self-center">
                                <span class="fw-bold">Usuarios</span>
                            </div>
                            <div class="p-2">
                                <button class="btn btn-dark-shadow add">
                                    <i class="fas fa-plus"></i>
                                </button>
                            </div>
                        </header>
                        <!-- /Card header -->
                        <!-- Contents -->
                        <div class="mb-2 mt-4">

                            <div class="notifications"></div>
                            <div class="table-responsive">
                                <table class="table table-hover table-bordered">
                                    <thead class="table-light text-center align-middle text-nowrap">
                                        <tr>
                                            <th scope="col">Usuario</th>
                                            <th scope="col">Estado</th>
                                            <th scope="col">Grupo</th>
                                            <th scope="col">Creado</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                    </tbody>
                                </table>
                            </div>

                        </div>
                        <!-- /Contents -->
                        
                    </article>
                </section>
                <!-- /Users: Read -->

                <!-- Users: Add -->
                <div id="component_users_add" class="modal right-side-modal fade" tabindex="-1" aria-hidden="true">
                    <div class="modal-dialog modal-lg">
                        <form class="modal-content" novalidate>
                            <div class="modal-header">
                                <h5 class="modal-title">
                                    <i class="fas fa-plus-circle me-2"></i>A&ntilde;adir nuevo usuario
                                </h5>
                                <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
                            </div>
                            <div class="modal-body">
                                <div class="notifications"></div>
                                <table class="table">
                                    <tbody>
                                        <tr>
                                            <td>Correo</td>
                                            <td><input class="form-control" type="email" name="username" required></td>
                                        </tr>
                                        <tr>
                                            <td>Contrase&ntilde;a</td>
                                            <td><input class="form-control" type="password" name="password" required></td>
                                        </tr>
                                        <tr>
                                            <td>Grupo</td>
                                            <td>
                                                <select class="form-select" name="id_group" required></select>
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                            <div class="modal-footer">
                                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">
                                    <i class="fas fa-arrow-left me-2"></i>Cancelar
                                </button>
                                <button type="submit" class="btn btn-primary">
                                    <i class="fas fa-plus-circle me-2"></i>A&ntilde;adir
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
                <!-- /Users: Add -->

                <!-- Users: Modify -->
                <div id="component_users_modify" class="modal right-side-modal fade" tabindex="-1" aria-hidden="true">
                    <div class="modal-dialog">
                        <form class="modal-content" novalidate>
                            <div class="modal-header">
                                <h5 class="modal-title">
                                    <i class="fas fa-pen me-2"></i>Editar usuario
                                </h5>
                                <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
                            </div>
                            <div class="modal-body">

                                <div class="notifications"></div>
                                <input type="hidden" name="id" required>
                                <table class="table">
                                    <tbody>
                                        <tr>
                                            <td>Correo</td>
                                            <td><input class="form-control" type="email" name="username" required></td>
                                        </tr>
                                        <tr>
                                            <td>Contrase&ntilde;a</td>
                                            <td><input class="form-control" type="password" name="password"></td>
                                        </tr>
                                        <tr>
                                            <td>Estado</td>
                                            <td>
                                                <select class="form-select" name="status" required></select>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td>Grupo</td>
                                            <td>
                                                <select class="form-select" name="id_group" required></select>
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                            <div class="modal-footer">
                                <button type="button" class="delete btn btn-danger me-auto">
                                    <i class="fas fa-times me-2"></i>Eliminar usuario
                                </button>
                                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">
                                    <i class="fas fa-arrow-left me-2"></i>Cancelar
                                </button>
                                <button type="submit" class="btn btn-primary">
                                    <i class="fas fa-pen me-2"></i>Modificar
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
                <!-- /Users: Modify -->

                <!-- Users: Delete -->
                <div class="modal right-side-modal fade" id="component_users_delete" tabindex="-1" aria-labelledby="component_users_delete_label" aria-hidden="true">
                    <div class="modal-dialog">
                        <form class="modal-content" novalidate>
                            <div class="modal-header">
                                <h5 class="modal-title" id="component_users_delete_label">
                                    <i class="fas fa-times me-2"></i>Eliminar usuario
                                </h5>
                                <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
                            </div>
                            <div class="modal-body">
                                <div class="notifications"></div>
                                <input type="hidden" name="id" required>
                                <p>Seguro desea eliminar el usuario <strong class="username"></strong></p>
                            </div>
                            <div class="modal-footer">
                                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">
                                    <i class="fas fa-arrow-left me-2"></i>Cancelar
                                </button>
                                <button type="submit" class="btn btn-danger">
                                    <i class="fas fa-times me-2"></i>Borrar
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
                <!-- /Users: Delete -->

            </section>
            <!-- /Users section -->

            <!-- Groups section -->
            <section class="section_groups d-none" permission-endpoint="/api/general/groups/read">
                <div class="pb-2 mb-3 border-bottom">
                    <ol class="breadcrumb h4">
                        <li class="breadcrumb-item">Configuraciones</li>
                        <li class="breadcrumb-item active" aria-current="page">Grupos</li>
                    </ol>
                </div>

                <!-- Groups: Read -->
                <section id="component_groups_read">
                    <article class="card p-4 bg-white mb-4">
                        <!-- Card header -->
                        <header class="mb-4 px-4 py-2 primary-background rounded d-flex">
                            <div class="flex-grow-1 align-self-center">
                                <span class="fw-bold">Grupos</span>
                            </div>
                            <div class="p-2">
                                <button class="btn btn-dark-shadow add">
                                    <i class="fas fa-plus"></i>
                                </button>
                            </div>
                        </header>
                        <!-- /Card header -->
                        <!-- Contents -->
                        <div class="mb-2 mt-4">
                            
                            <div class="notifications"></div>
                            <div class="table-responsive">
                                <table class="table table-hover table-bordered">
                                    <thead class="table-light text-center align-middle text-nowrap">
                                        <tr>
                                            <th scope="col">ID</th>
                                            <th scope="col">Grupo</th>
                                            <th scope="col">Creado</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                    </tbody>
                                </table>
                            </div>

                        </div>
                        <!-- /Contents -->
                        
                    </article>
                </section>
                <!-- /Groups: Read -->

                <!-- Groups: Add -->
                <div id="component_groups_add" class="modal right-side-modal fade" tabindex="-1" aria-hidden="true">
                    <div class="modal-dialog">
                        <form class="modal-content" novalidate>
                            <div class="modal-header">
                                <h5 class="modal-title">
                                    <i class="fas fa-plus-circle me-2"></i>A&ntilde;adir nuevo grupo
                                </h5>
                                <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
                            </div>
                            <div class="modal-body">
                                <div class="notifications"></div>
                                <table class="table">
                                    <tbody>
                                        <tr>
                                            <td>Nombre</td>
                                            <td><input class="form-control" type="text" name="group" required maxlength="100"></td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                            <div class="modal-footer">
                                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">
                                    <i class="fas fa-arrow-left me-2"></i>Cancelar
                                </button>
                                <button type="submit" class="btn btn-primary">
                                    <i class="fas fa-plus-circle me-2"></i>A&ntilde;adir
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
                <!-- /Groups: Add -->

                <!-- Groups: Modify -->
                <div id="component_groups_modify" class="modal right-side-modal fade" tabindex="-1" aria-hidden="true">
                    <div class="modal-dialog modal-lg">
                        <form class="modal-content" novalidate>
                            <div class="modal-header">
                                <h5 class="modal-title">
                                    <i class="fas fa-pen me-2"></i>Editar grupo
                                </h5>
                                <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
                            </div>
                            <div class="modal-body">

                                <div class="notifications"></div>
                                <input type="hidden" name="id" required>
                                <table class="table">
                                    <tbody>
                                        <tr>
                                            <td>Nombre</td>
                                            <td><input class="form-control" type="text" name="group" required maxlength="100"></td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                            <div class="modal-footer">
                                <button type="button" class="delete btn btn-danger me-auto">
                                    <i class="fas fa-times me-2"></i>Eliminar grupo
                                </button>
                                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">
                                    <i class="fas fa-arrow-left me-2"></i>Cancelar
                                </button>
                                <button type="submit" class="btn btn-primary">
                                    <i class="fas fa-pen me-2"></i>Modificar
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
                <!-- /Groups: Modify -->

                <!-- Groups: Delete -->
                <div class="modal right-side-modal fade" id="component_groups_delete" tabindex="-1" aria-hidden="true">
                    <div class="modal-dialog">
                        <form class="modal-content" novalidate>
                            <div class="modal-header">
                                <h5 class="modal-title">
                                    <i class="fas fa-times me-2"></i>Eliminar grupo
                                </h5>
                                <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
                            </div>
                            <div class="modal-body">
                                <div class="notifications"></div>
                                <input type="hidden" name="id" required>
                                <p>Seguro desea eliminar el grupo <strong class="group"></strong></p>
                            </div>
                            <div class="modal-footer">
                                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">
                                    <i class="fas fa-arrow-left me-2"></i>Cancelar
                                </button>
                                <button type="submit" class="btn btn-danger">
                                    <i class="fas fa-times me-2"></i>Borrar
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
                <!-- /Groups: Delete -->

            </section>
            <!-- /Groups section -->

            <!-- Permissions section -->
            <section class="section_permissions d-none" permission-endpoint="/api/general/permissions/read">
                <div class="pb-2 mb-3 border-bottom">
                    <ol class="breadcrumb h4">
                        <li class="breadcrumb-item">Configuraciones</li>
                        <li class="breadcrumb-item active" aria-current="page">Permisos</li>
                    </ol>
                </div>

                <!-- Permissions: Read -->
                <section id="component_permissions_read">
                    <article class="card p-4 bg-white mb-4">
                        <!-- Card header -->
                        <header class="mb-4 px-4 py-2 primary-background rounded d-flex">
                            <div class="flex-grow-1 align-self-center">
                                <span class="fw-bold">Permisos</span>
                            </div>
                            <div class="p-2">
                                <select class="form-select" name="id_group" required></select>
                            </div>
                            <div class="p-2">
                                <button class="btn btn-dark-shadow add">
                                    <i class="fas fa-plus"></i>
                                </button>
                            </div>
                        </header>
                        <!-- /Card header -->
                        <!-- Contents -->
                        <div class="mb-2 mt-4">
                            
                            <div class="notifications"></div>
                            <div class="table-responsive">
                                <table class="table table-hover table-bordered">
                                    <thead class="table-light text-center align-middle text-nowrap">
                                        <tr>
                                            <th scope="col">ID</th>
                                            <th scope="col">Permiso</th>
                                            <th scope="col">Acci&oacute;n</th>
                                            <th scope="col">Creado</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                    </tbody>
                                </table>
                            </div>

                        </div>
                        <!-- /Contents -->
                        
                    </article>
                </section>
                <!-- /Permissions: Read -->

                <!-- Permissions: Add -->
                <div id="component_permissions_add" class="modal right-side-modal fade" tabindex="-1" aria-hidden="true">
                    <div class="modal-dialog">
                        <form class="modal-content" novalidate>
                            <div class="modal-header">
                                <h5 class="modal-title">
                                    <i class="fas fa-plus-circle me-2"></i>A&ntilde;adir nuevo permiso
                                </h5>
                                <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
                            </div>
                            <div class="modal-body">
                                <div class="notifications"></div>
                                <input type="hidden" name="id_group" required>
                                <table class="table">
                                    <tbody>
                                        <tr>
                                            <td>Endpoint</td>
                                            <td>
                                                <select class="form-select" name="endpoint" required></select>
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                            <div class="modal-footer">
                                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">
                                    <i class="fas fa-arrow-left me-2"></i>Cancelar
                                </button>
                                <button type="submit" class="btn btn-primary">
                                    <i class="fas fa-plus-circle me-2"></i>A&ntilde;adir
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
                <!-- /Permissions: Add -->

                <!-- Permissions: Delete -->
                <div class="modal right-side-modal fade" id="component_permissions_delete" tabindex="-1" aria-hidden="true">
                    <div class="modal-dialog">
                        <form class="modal-content" novalidate>
                            <div class="modal-header">
                                <h5 class="modal-title">
                                    <i class="fas fa-times me-2"></i>Eliminar permiso
                                </h5>
                                <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
                            </div>
                            <div class="modal-body">
                                <div class="notifications"></div>
                                <input type="hidden" name="id" required>
                                <p>Seguro desea eliminar el permiso <strong class="value"></strong></p>
                            </div>
                            <div class="modal-footer">
                                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">
                                    <i class="fas fa-arrow-left me-2"></i>Cancelar
                                </button>
                                <button type="submit" class="btn btn-danger">
                                    <i class="fas fa-times me-2"></i>Borrar
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
                <!-- /Permissions: Delete -->

            </section>
            <!-- /Permissions section -->

        `;

        $('#section_settings .contents').append(settings);
    }
}