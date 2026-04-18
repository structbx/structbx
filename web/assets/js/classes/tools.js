
// Read instance name
export var instance_name_read = () =>
{
    // Wait animation
    let wait = new wtools.ElementState('#instance_name', false, 'button', new wtools.WaitAnimation().for_button);

    // Request
    new wtools.Request(server_config.current.api + "/general/instanceName/read").Exec_((response_data) =>
    {
        // Clean
        wait.Off_();

        // Manage error
        if(response_data.status == 401 || response_data.status != 200 || response_data.body.data == undefined || response_data.body.data.length < 1)
        {
            new wtools.Notification('WARNING').Show_('No se pudo acceder al nombre de la instancia.');
            return;
        }
        
        // Setup database name
        $("#instance_name").html(response_data.body.data[0].value);
    });
};

// Read current Database
export var databases_read_id = () =>
{
    // Wait animation
    let wait = new wtools.ElementState('#database_name', false, 'button', new wtools.WaitAnimation().for_button);

    // Request
    new wtools.Request(server_config.current.api + "/databases/read/id").Exec_((response_data) =>
    {
        // Clean
        wait.Off_();

        // Manage error
        if(response_data.status == 401 || response_data.status != 200 || response_data.body.data == undefined || response_data.body.data.length < 1)
        {
            new wtools.Notification('WARNING').Show_('No se pudo acceder a la base de datos.');
            return;
        }
        
        // Setup database name
        $(".database_name").html(response_data.body.data[0].name);

        databases_read();
    });
};

// Read databases
export var databases_read = () =>
{
    // Wait animation
    let wait_sidebar = new wtools.ElementState('#component_sidebar_databases .contents', false, 'block', new wtools.WaitAnimation().for_block);
    let wait_header = new wtools.ElementState('#component_databases_selector', false, 'block', new wtools.WaitAnimation().for_block);

    // Request
    new wtools.Request(server_config.current.api + "/databases/read").Exec_((response_data) =>
    {
        // Clean
        wait_sidebar.Off_();
        wait_header.Off_();
        $('#component_sidebar_databases .contents').html('');
        $('#component_databases_selector').html('');

        // Manage error
        const result = new ResponseManager(response_data, '');
        if(!result.Verify_())
            return;
        
        // Results elements creator (Sidebar)
        new wtools.UIElementsCreator('#component_sidebar_databases .contents', response_data.body.data).Build_((row) =>
        {
            let element = '';
            if($('.database_name').html() == row.name)
            {
                element = `
                    <div class="nav-item">
                        <a class="nav-link mb-2 active" href="#" database_id="${row.identifier}">
                            <i class="fas fa-building"></i>
                            <span class="ms-2">${row.name}</span>
                        </a>
                    </div>`
            }
            else
            {
                element = `
                    <div class="nav-item">
                        <a class="nav-link mb-2" href="#" database_id="${row.identifier}">
                            <i class="fas fa-building"></i>
                            <span class="ms-2">${row.name}</span>
                        </a>
                    </div>`
            }

            return new wtools.UIElementsPackage('<li></li>', [element]).Pack_();
        });

        // Results elements creator (Header)
        new wtools.UIElementsCreator('#component_databases_selector', response_data.body.data).Build_((row) =>
        {
            let element = '';
            if($('.database_name').html() != row.name)
            {
                element = `
                    <li>
                        <a class="dropdown-item btn btn-ligth" href="#" database_id="${row.identifier}">
                            ${row.name}
                        </a>
                    </li>`
            }

            return new wtools.UIElementsPackage('<li></li>', [element]).Pack_();
        });
    });
};

export var change_current_database = (database_id) =>
{
    // Wait animation
    let wait = new wtools.ElementState('#wait_animation_page', true, 'block', new wtools.WaitAnimation().for_page);

    // Form data
    const new_data = new FormData();
    new_data.append("id_database", database_id);

    // Read dashboard to modify
    new wtools.Request(server_config.current.api + `/databases/change`, "POST", new_data).Exec_((response_data) =>
    {
        // Manage error
        const result = new ResponseManager(response_data, '');
        if(!result.Verify_())
            return;
        
        new wtools.ElementState('#wait_animation_page', true, 'block', new wtools.WaitAnimation().for_page);
        location.href = "/start/";

        wait.Off_();
    });
}

// Read username logued
export var username_logued_read = () =>
{
    // Wait animation
    let wait = new wtools.ElementState('#instance_name', false, 'button', new wtools.WaitAnimation().for_button);

    // Request
    new wtools.Request(server_config.current.api + "/general/users/current/read").Exec_((response_data) =>
    {
        // Clean
        wait.Off_();

        // Manage error
        if(response_data.status == 403 || response_data.status == 401 || response_data.status != 200 || response_data.body.data == undefined || response_data.body.data.length < 1)
        {
            logout();
            return;
        }
        
        // Setup username logued
        $(".username_logued").html(response_data.body.data[0].username);
    });
};

// Logout
export var logout = () =>
{
    // Wait animation
    let wait = new wtools.ElementState('#wait_animation_page', true, 'block', new wtools.WaitAnimation().for_page);

    // Request
    new wtools.Request(server_config.current.api + "/auth/logout", "POST").Exec_((response_data) =>
    {
        wait.Off_();

        // Notifications
        if(response_data.status == 200)
        {
            new wtools.ElementState('#wait_animation_page', true, 'block', new wtools.WaitAnimation().for_page);
            window.location.href = "/login/";
        }
        else
        {
            new wtools.Notification('WARNING').Show_('No se pudo cerrar la sesi&oacute;n.');
        }
    });
}

export var GetTableIdentifier = () =>
{
    // Get Form identifier
    const table_identifier = wtools.GetUrlSearchParam('identifier');
    if(table_identifier == undefined)
    {
        new wtools.Notification('ERROR').Show_('No se encontr&oacute; el identificador de la tabla.');
        return undefined;
    }
    return table_identifier;
}

export function OptionsLinkSelection(element, link_to_table, column_name, target, selected = undefined, form = '', main_table = '')
{
    new wtools.Request(server_config.current.api + `${form}/tables/data/read?table-identifier=${link_to_table}&from=link&main-table-identifier=${main_table}`).Exec_((response_data) =>
    {
        try
        {
            // Add empty <option>
            element.AddOption_('', '-- Ninguno --');

            // Verify status
            if(response_data.status == 401) throw new Error(`No posee los permisos necesarios para acceder a <b>${column_name}</b>`);
            if(response_data.status != 200) throw new Error(`Hubo un error al acceder a la columna enlazada <b>${column_name}</b>`);
            if(response_data.body == undefined || response_data.body.data == undefined) throw new Error(`No se encontraron datos en la columna enlazada <b>${column_name}</b>`);

            // Add select or not selected <option>
            for(let row of response_data.body.data)
            {
                const col_id = response_data.body.columns[0];
                const col_name = response_data.body.columns[1];
                
                let final_value = row[col_name];
                if(row._structbx_column_colorHeader != "")
                    final_value = getHeaderColor(row._structbx_column_colorHeader, row[col_name]);

                element.AddOption_(row[col_id], final_value);
                if(selected == row[col_name])
                    element.setValue(row[col_id]);
            }
        }
        catch(error)
        {
            new wtools.Notification('WARNING', 0, target).Show_(error);
        }
    });
}

export function OptionsLinkUsersInDatabase(element, target, selected = undefined, form = '')
{
    let options = new wtools.SelectOptions();

    new wtools.Request(server_config.current.api + `${form}/databases/users/current/read`).Exec_((response_data) =>
    {
        try
        {
            let tmp_options = [];

            // Add empty <option>
            if(selected == undefined)
                tmp_options.push(new wtools.OptionValue('', '-- Ninguno --', true));
            else
                tmp_options.push(new wtools.OptionValue('', '-- Ninguno --', false));

            // Verify status
            if(response_data.status == 401) throw new Error(`No posee los permisos necesarios para acceder a los usuarios de la base de datos`);
            if(response_data.status != 200) throw new Error(`Hubo un error al acceder a los usuarios de la base de datos`);
            if(response_data.body == undefined || response_data.body.data == undefined) throw new Error(`No se encontraron datos al consultar los usuarios de la base de datos`);

            // Add select or not selected <option>
            for(let row of response_data.body.data)
            {
                if(selected == row.id)
                    tmp_options.push(new wtools.OptionValue(row.id, row.username, true));
                else
                    tmp_options.push(new wtools.OptionValue(row.id, row.username));
            }

            // Build <option>s
            options.options = tmp_options;
            let element_building = $(element).find('select');
            options.Build_(element_building);
        }
        catch(error)
        {
            new wtools.Notification('WARNING', 0, target).Show_(error);
        }
    });
}

export function GenerateRandomName(l)
{
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let randomName = '';
    for (let i = 0; i < l; i++) {
        const randI = Math.floor(Math.random() * chars.length);
        randomName += chars[randI];
    }
    return randomName;
}

export function getContrastColor(hexColor)
{
    // Convertir hex a RGB
    const r = parseInt(hexColor.substr(1, 2), 16);
    const g = parseInt(hexColor.substr(3, 2), 16);
    const b = parseInt(hexColor.substr(5, 2), 16);
    
    // Calcular luminancia (fórmula WCAG)
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    
    // Si el fondo es oscuro (luminancia < 0.5), usar texto blanco
    // Si el fondo es claro (luminancia >= 0.5), usar texto negro
    return luminance < 0.5 ? '#fff' : '#333';
}

export function getHeaderColor(link_color, value)
{
    return  `
        <span class='small' style='background-color:${link_color};color:${getContrastColor(link_color)};padding:2px 8px;border-radius:4px;'>
            ${value}
        </span>
    `;
}