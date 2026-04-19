class CustomSelect
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

class Footers
{
    constructor()
    {
        
    }
    Footer_()
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

class Headers
{
    constructor(){}
    Header_()
    {
        $("#header_main").append
        (`
            <div class="container-xxl d-flex justify-content-between">
                <a class="navbar-brand d-flex align-items-center m-0 user-select-none" href="/start/">
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
                            <a class="nav-link dropdown-toggle" href="#" data-bs-toggle="dropdown">
                                <i class="fas fa-tools fa-fw text-light"></i>
                            </a>
                            <ul class="dropdown-menu dropdown-menu-end p-2 bg-dark" style="z-index:1050;">
                                <li permission-endpoint="/api/databases/read">
                                    <a class="dropdown-item btn btn-ligth py-2 px-4 go-button" go-path="/administration" go-hash="#databases" href="#">
                                        <i class="fas fa-building"></i>
                                        <span class="ms-2">Bases de datos</span>
                                    </a>
                                </li>
                                <li>
                                    <a class="dropdown-item btn btn-ligth py-2 px-4 go-button" go-path="/administration" go-hash="#my_account"href="#">
                                        <i class="fas fa-user"></i>
                                        <span class="ms-2">Mi cuenta</span>
                                    </a>
                                </li>
                                <li permission-endpoint="/api/general/instanceName/modify">
                                    <a class="dropdown-item btn btn-ligth py-2 px-4 go-button" go-path="/administration" go-hash="#instance" href="#">
                                        <i class="fas fa-home"></i>
                                        <span class="ms-2">Instancia</span>
                                    </a>
                                </li>
                                <li permission-endpoint="/api/general/users/read">
                                    <a class="dropdown-item btn btn-ligth py-2 px-4 go-button" go-path="/administration" go-hash="#users" href="#">
                                        <i class="fas fa-users"></i>
                                        <span class="ms-2">Usuarios</span>
                                    </a>
                                </li>
                                <li permission-endpoint="/api/general/groups/read">
                                    <a class="dropdown-item btn btn-ligth py-2 px-4 go-button" go-path="/administration" go-hash="#groups" href="#">
                                        <i class="fas fa-cog"></i>
                                        <span class="ms-2">Grupos</span>
                                    </a>
                                </li>
                                <li permission-endpoint="/api/general/permissions/read">
                                    <a class="dropdown-item btn btn-ligth py-2 px-4 go-button" go-path="/administration" go-hash="#permissions" href="#">
                                        <i class="fas fa-user-lock"></i>
                                        <span class="ms-2">Permisos</span>
                                    </a>
                                </li>
                            </ul>
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

class Sidebars
{
    constructor() {}
    SidebarMenu_ ()
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
    SidebarMenuAdministration_ ()
    {
        let sidebar_menu = $('<nav class="nav nav-pills flex-column justify-contents-between pt-4"></nav>');
        sidebar_menu.append($(`
            <div class="nav-item">
                <a class="nav-link mb-2 go-button" go-path="/start" go-hash="" href="#">
                    <i class="fas fa-arrow-left"></i>
                    <span class="ms-2">Ir a inicio</span>
                </a>
            </div>
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

        $("#menu_main").append(sidebar_menu);
    }
    SidebarMenuDatabase_ ()
    {
        let sidebar_menu = $('<nav class="nav nav-pills flex-column justify-contents-between pt-4"></nav>');
        sidebar_menu.append($(`
            <div class="nav-item">
                <a class="nav-link mb-2 go-button" go-path="/start" go-hash="" href="#">
                    <i class="fas fa-arrow-left"></i>
                    <span class="ms-2">Ir a inicio</span>
                </a>
            </div>
            <div class="nav-item">
                <a class="nav-link mb-2 go-button" go-path="/administration" go-hash="#databases" href="#">
                    <i class="fas fa-arrow-left"></i>
                    <span class="ms-2">Ir a Bases de datos</span>
                </a>
            </div>
            <div class="nav-item">
                <a class="menu_database nav-link mb-2" href="#database" menu="database">
                    <i class="fas fa-building"></i>
                    <span class="ms-2">Base de datos</span>
                </a>
            </div>
            <div class="nav-item" permission-endpoint="/api/databases/users/read">
                <a class="menu_users nav-link mb-2" href="#users" menu="users">
                    <i class="fas fa-users"></i>
                    <span class="ms-2">Usuarios</span>
                </a>
            </div>
        `));

        $("#menu_main").append(sidebar_menu);
    }
    SidebarMenutable_()
    {
        let sidebar_menu = $('<nav class="nav nav-pills flex-column justify-contents-between pt-4"></nav>');
        sidebar_menu.append($(`
            <div class="nav-item">
                <a class="nav-link mb-2 go-button" go-path="/start" go-hash="" href="#">
                    <i class="fas fa-arrow-left"></i>
                    <span class="ms-2">Ir a inicio</span>
                </a>
            </div>
            <h5 class="small text-uppercase text-muted">TABLAS</h5>
            <div id="component_sidebar_tables">
                <div class="notifications"></div>
                <div class="contents"></div>
            </div>
        `));

        $("#menu_main").append(sidebar_menu);
    }
    SidebarMenuFormSettings_()
    {
        let sidebar_menu = $('<nav class="nav nav-pills flex-column justify-contents-between pt-4"></nav>');
        sidebar_menu.append($(`
            <div class="nav-item">
                <a class="nav-link mb-2 go-button" go-path="/start" go-hash="" href="#">
                    <i class="fas fa-arrow-left"></i>
                    <span class="ms-2">Ir a inicio</span>
                </a>
            </div>
            <div class="nav-item">
                <a class="nav-link mb-2 go-form-button" href="#">
                    <i class="fas fa-arrow-left"></i>
                    <span class="ms-2">Ir a la tabla</span>
                </a>
            </div>
            <h5 class="small text-uppercase text-muted">TABLAS</h5>
            <div id="component_sidebar_tables">
                <div class="notifications"></div>
                <div class="contents"></div>
            </div>
        `));

        $("#menu_main").append(sidebar_menu);
    }
}