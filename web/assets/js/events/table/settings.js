$(function()
{
    // SELECT options
    const options_permissions = new wtools.SelectOptions
    ([
        new wtools.OptionValue("0", "No", true)
        ,new wtools.OptionValue("1", "S&iacute;")
    ]);
    options_permissions.Build_('#component_settings_permissions_add select[name="read"]');
    options_permissions.Build_('#component_settings_permissions_modify select[name="read"]');
    options_permissions.Build_('#component_settings_permissions_add select[name="add"]');
    options_permissions.Build_('#component_settings_permissions_modify select[name="add"]');
    options_permissions.Build_('#component_settings_permissions_add select[name="modify"]');
    options_permissions.Build_('#component_settings_permissions_modify select[name="modify"]');
    options_permissions.Build_('#component_settings_permissions_add select[name="delete"]');
    options_permissions.Build_('#component_settings_permissions_modify select[name="delete"]');
    options_permissions.Build_('#component_settings_permissions_add select[name="just_owner"]');
    options_permissions.Build_('#component_settings_permissions_modify select[name="just_owner"]');

    let options_permissions_users = new wtools.SelectOptions();
    const options_permissions_users_init = (options, callback) => new wtools.Request(server_config.current.api + `/tables/permissions/users/out/read?table-identifier=${wtools.GetUrlSearchParam('identifier')}`).Exec_((response_data) =>
    {
        try
        {
            let tmp_options = [];
            if(response_data.body.data.length < 1)
                tmp_options.push(new wtools.OptionValue("", "No hay usuarios disponibles"));
            for(let row of response_data.body.data)
                tmp_options.push(new wtools.OptionValue(row.id, row.username));

            options.options = tmp_options;
            options.Build_('#component_settings_permissions_add select[name="id_user"]');
            callback();
        }
        catch(error)
        {
            new wtools.Notification('WARNING').Show_('No se pudo acceder a los usuarios de la base de datos.');
            new wtools.Notification('WARNING', 0, '#component_settings_permissions_add .notifications').Show_('No se pudo acceder a los usuarios de la base de datos.');
            new wtools.Notification('WARNING', 0, '#component_settings_permissions_modify .notifications').Show_('No se pudo acceder a los usuarios de la base de datos.');
        }
    });
    options_permissions_users_init(options_permissions_users, () => {})

    const options_public_form = new wtools.SelectOptions
    ([
        new wtools.OptionValue("0", "No", true)
        ,new wtools.OptionValue("1", "S&iacute;")
    ]);
    options_public_form.Build_('#component_settings_general select[name="public_form"]');

    /* --- General settings --- */

    // Read
    const settings_read = () =>
    {
        // Wait animation
        let wait = new wtools.ElementState('#component_settings_general .notifications', false, 'block', new wtools.WaitAnimation().for_block);

        // Get Form identifier
        const table_identifier = wtools.GetUrlSearchParam('identifier');
        if(table_identifier == undefined)
        {
            wait.Off_();
            new wtools.Notification('WARNING').Show_('No se encontr&oacute; el identificador de la tabla.');
            return;
        }
        
        // Request
        new wtools.Request(server_config.current.api + `/tables/read/identifier?identifier=${table_identifier}`).Exec_((response_data) =>
        {
            // Clean
            wait.Off_();
            $('#component_settings_general .notifications').html('');
            wtools.CleanForm($('#component_settings_general form'));

            // Manage response
            const result = new ResponseManager(response_data, '#component_settings_general .notifications', 'Configuraciones: General');
            if(!result.Verify_())
                return;

            if(response_data.body.data.length < 1)
            {
                new wtools.Notification('SUCCESS', 5000, '#component_settings_general .notifications').Show_('Sin resultados.');
                return;
            }
            
            $('#component_settings_general input[name="identifier"]').val(response_data.body.data[0].identifier);
            $('#component_settings_general input[name="name"]').val(response_data.body.data[0].name);
            $('#component_settings_general select[name="public_form"]').val(response_data.body.data[0].public_form);
            $('#component_settings_general textarea[name="description"]').val(response_data.body.data[0].description);
            $('#component_settings_general span.link_form').html(`
                <a href="/form?identifier=${response_data.body.data[0].identifier}" target="_blank" class="mt-2 d-block form-link">
                    Ir al formulario p&uacute;blico
                </a>
            `);
        });
    };
    settings_read();

    // Modify form
    $('#component_settings_general form').submit((e) =>
    {
        e.preventDefault();

        // Wait animation
        let wait = new wtools.ElementState('#component_settings_general form button[type=submit]', true, 'button', new wtools.WaitAnimation().for_button);

        // Form check
        const check = new wtools.FormChecker(e.target).Check_();
        if(!check)
        {
            wait.Off_();
            $('#component_settings_general .notifications').html('');
            new wtools.Notification('WARNING', 5000, '#component_settings_general .notifications').Show_('Hay campos inv&aacute;lidos.');
            return;
        }

        // Get Form identifier
        const table_identifier = wtools.GetUrlSearchParam('identifier');
        if(table_identifier == undefined)
        {
            wait.Off_();
            new wtools.Notification('WARNING').Show_('No se encontr&oacute; el identificador de la tabla.');
            return;
        }

        // Data collection
        const data = new FormData($('#component_settings_general form')[0]);
        data.append('identifier', table_identifier);

        // Request
        new wtools.Request(server_config.current.api + "/tables/modify", "PUT", data, false).Exec_((response_data) =>
        {
            wait.Off_();
            
            // Manage error
            const result = new ResponseManager(response_data, '#component_settings_general .notifications', 'Tablas: Editar');
            if(!result.Verify_())
                return;

            $('#component_settings_general .notifications').html('');
            new wtools.Notification('SUCCESS', 5000, '#component_settings_general .notifications').Show_('Tabla actualizado correctamente.');

            const identifier = data.get('identifier');
            new wtools.ElementState('#wait_animation_page', true, 'block', new wtools.WaitAnimation().for_page);
            window.location.href = `/table/settings?identifier=${identifier}`
        });
    });

    // Read table to Delete
    $(document).on("click", '#component_settings_general_delete .delete', (e) =>
    {
        e.preventDefault();

        // Wait animation
        let wait = new wtools.ElementState('#wait_animation_page', true, 'block', new wtools.WaitAnimation().for_page);

        // Form data
        const table_name = $('#component_settings_general input[name="name"]').val();

        // Setup table to delete
        $('#component_settings_delete strong.header').html(table_name);
        $('#component_settings_delete strong.name').html(table_name);
        $('#component_settings_delete .notifications').html('');
        $('#component_settings_delete').modal('show');
        wait.Off_();
    });

    // Delete table
    $('#component_settings_delete form').submit((e) =>
    {
        e.preventDefault();

        // Wait animation
        let wait = new wtools.ElementState('#component_settings_delete form button[type=submit]', true, 'button', new wtools.WaitAnimation().for_button);

        const table_identifier = wtools.GetUrlSearchParam('identifier');
        if(table_identifier == undefined)
        {
            wait.Off_();
            new wtools.Notification('WARNING').Show_('No se encontr&oacute; el identificador de la tabla.');
            return;
        }
        
        // Request
        new wtools.Request(server_config.current.api + `/tables/delete?identifier=${table_identifier}`, "DEL").Exec_((response_data) =>
        {
            wait.Off_();

            // Manage error
            const result = new ResponseManager(response_data, '#component_settings_delete .notifications', 'Tablas: Eliminar');
            if(!result.Verify_())
                return;

            new wtools.Notification('SUCCESS').Show_('Tabla eliminada exitosamente.');
            window.location.href = `/start`
        });
    });


    /* --- Permissions settings --- */

    // Read form permissions
    const settings_permissions_read = () =>
    {
        // Wait animation
        let wait = new wtools.ElementState('#component_settings_permissions .notifications', false, 'block', new wtools.WaitAnimation().for_block);

        // Get Form identifier
        const table_identifier = wtools.GetUrlSearchParam('identifier');
        if(table_identifier == undefined)
        {
            wait.Off_();
            new wtools.Notification('WARNING').Show_('No se encontr&oacute; el identificador de la tabla.');
            return;
        }
        
        // Request
        new wtools.Request(server_config.current.api + `/tables/permissions/read?table-identifier=${table_identifier}`).Exec_((response_data) =>
        {
            // Clean
            wait.Off_();
            $('#component_settings_permissions .notifications').html('');
            $('#component_settings_permissions table tbody').html('');

            // Manage response
            const result = new ResponseManager(response_data, '#component_settings_permissions .notifications', 'Configuraciones: Permisos');
            if(!result.Verify_())
                return;

            if(response_data.body.data.length < 1)
            {
                new wtools.Notification('SUCCESS', 5000, '#component_settings_permissions .notifications').Show_('Sin resultados.');
                return;
            }
            
            new wtools.UIElementsCreator('#component_settings_permissions table tbody', response_data.body.data).Build_((row) =>
            {
                let elements = [
                    `<th scope="row">${row.username}</th>`
                    ,`<td scope="row">${options_permissions.ValueToOption_(row.read)}</td>`
                    ,`<td scope="row">${options_permissions.ValueToOption_(row.add)}</td>`
                    ,`<td scope="row">${options_permissions.ValueToOption_(row.modify)}</td>`
                    ,`<td scope="row">${options_permissions.ValueToOption_(row.delete)}</td>`
                    ,`<td scope="row">${options_permissions.ValueToOption_(row.just_owner)}</td>`
                ];

                return new wtools.UIElementsPackage(`<tr permission-id="${row.id}"></tr>`, elements).Pack_();
            });
        });
    };
    settings_permissions_read();
    
    // Click on Add Form permission Button
    const permissions_settings_add_pre = () =>
    {
        const add = () =>
        {
            $('#component_settings_permissions_add .notifications').html('');
            $('#component_settings_permissions_add form select[name="read"]').val("1");
            $('#component_settings_permissions_add form select[name="add"]').val("1");
            $('#component_settings_permissions_add form select[name="modify"]').val("1");
            $('#component_settings_permissions_add form select[name="delete"]').val("1");
            $('#component_settings_permissions_add form select[name="just_owner"]').val("0");
            $('#component_settings_permissions_add').modal('show');
        }
        options_permissions_users_init(options_permissions_users, add);
    }
    $('#component_settings_permissions .add').click(() => permissions_settings_add_pre());

    // Add Forms permissions
    $('#component_settings_permissions_add form').submit((e) =>
    {
        e.preventDefault();

        // Wait animation
        let wait = new wtools.ElementState('#component_settings_permissions_add form button[type=submit]', true, 'button', new wtools.WaitAnimation().for_button);

        // Form check
        const check = new wtools.FormChecker(e.target).Check_();
        if(!check)
        {
            $('#component_settings_permissions_add .notifications').html('');
            wait.Off_();
            new wtools.Notification('WARNING', 5000, '#component_settings_permissions_add .notifications').Show_('Hay campos inv&aacute;lidos.');
            return;
        }

        // Get Form identifier
        if(wtools.GetUrlSearchParam('identifier') == undefined)
        {
            wait.Off_();
            new wtools.Notification('WARNING').Show_('No se encontr&oacute; el identificador de la tabla.');
            return;
        }

        // Data collection
        const data = new FormData($('#component_settings_permissions_add form')[0]);
        data.append('table-identifier', wtools.GetUrlSearchParam('identifier'));

        // Request
        new wtools.Request(server_config.current.api + "/tables/permissions/add", "POST", data, false).Exec_((response_data) =>
        {
            wait.Off_();

            // Manage response
            const result = new ResponseManager(response_data, '#component_settings_permissions_add .notifications', 'Permisos de tabla: A&ntilde;adir');
            if(!result.Verify_())
                return;

            new wtools.Notification('SUCCESS').Show_('Permiso de tabla creado exitosamente.');
            settings_permissions_read();
            $('#component_settings_permissions_add').modal('hide');
        });
    });
    
    // Read form permission to modify
    $(document).on("click", '#component_settings_permissions table tbody tr', (e) =>
    {
        e.preventDefault();

        // Wait animation
        let wait = new wtools.ElementState('#wait_animation_page', true, 'block', new wtools.WaitAnimation().for_page);

        // Get Form identifier
        const table_identifier = wtools.GetUrlSearchParam('identifier');
        if(table_identifier == undefined)
        {
            wait.Off_();
            new wtools.Notification('WARNING').Show_('No se encontr&oacute; el identificador de la tabla.');
            return;
        }

        // Get ID
        let id = $(e.currentTarget).attr('permission-id');
        if(id == undefined)
        {
            wait.Off_();
            new wtools.Notification('WARNING').Show_('No se encontr&oacute; el identificador de permiso de tabla.');
            return;
        }

        // Read form permission to modify
        new wtools.Request(server_config.current.api + `/tables/permissions/read/id?id=${id}&table-identifier=${table_identifier}`).Exec_((response_data) =>
        {
            // Manage response
            const result = new ResponseManager(response_data, '', 'Permisos de tabla: Modificar');
            if(!result.Verify_())
                return;

            // Handle no results or zero results
            if(response_data.body.data.length < 1)
            {
                new wtools.Notification('WARNING').Show_('No se encontr&oacute; el permiso de tabla.');
                return;
            }

            // Set data
            $('#component_settings_permissions_modify input[name="id"]').val(response_data.body.data[0].id);
            $('#component_settings_permissions_modify input[name="id_user"]').val(response_data.body.data[0].username);
            $('#component_settings_permissions_modify select[name="read"]').val(response_data.body.data[0].read);
            $('#component_settings_permissions_modify select[name="add"]').val(response_data.body.data[0].add);
            $('#component_settings_permissions_modify select[name="modify"]').val(response_data.body.data[0].modify);
            $('#component_settings_permissions_modify select[name="delete"]').val(response_data.body.data[0].delete);
            $('#component_settings_permissions_modify select[name="just_owner"]').val(response_data.body.data[0].just_owner);

            wait.Off_();
            $('#component_settings_permissions_modify form').removeClass('was-validated');
            $('#component_settings_permissions_modify').modal('show');
        });
    });

    // Modify form permission
    $('#component_settings_permissions_modify form').submit((e) =>
    {
        e.preventDefault();

        // Wait animation
        let wait = new wtools.ElementState('#component_settings_permissions_modify form button[type=submit]', true, 'button', new wtools.WaitAnimation().for_button);

        // Form check
        const check = new wtools.FormChecker(e.target).Check_();
        if(!check)
        {
            wait.Off_();
            $('#component_settings_permissions_modify .notifications').html('');
            new wtools.Notification('WARNING', 5000, '#component_settings_permissions_modify .notifications').Show_('Hay campos inv&aacute;lidos.');
            return;
        }

        // Get Form identifier
        const table_identifier = wtools.GetUrlSearchParam('identifier');
        if(table_identifier == undefined)
        {
            wait.Off_();
            new wtools.Notification('WARNING').Show_('No se encontr&oacute; el identificador de la tabla.');
            return;
        }

        // Data collection
        const new_data = new FormData($('#component_settings_permissions_modify form')[0]);
        new_data.append('table-identifier', table_identifier);

        // Request
        new wtools.Request(server_config.current.api + "/tables/permissions/modify", "PUT", new_data, false).Exec_((response_data) =>
        {
            wait.Off_();

            // Manage response
            const result = new ResponseManager(response_data, '#component_settings_permissions_modify .notifications', 'Permiso de tabla: Modificar');
            if(!result.Verify_())
                return;

            new wtools.Notification('SUCCESS').Show_('Permiso de tabla modificado exitosamente.');
            $('#component_settings_permissions_modify').modal('hide');
            settings_permissions_read();
        });
    });
    
    // Read form permission to Delete
    $('#component_settings_permissions_modify .delete').click((e) =>
    {
        e.preventDefault();

        // Wait animation
        let wait = new wtools.ElementState('#wait_animation_page', true, 'block', new wtools.WaitAnimation().for_page);

        // Data
        let data = new FormData($('#component_settings_permissions_modify form')[0]);
        const id = data.get('id');

        // Setup form permission to delete
        $('#component_settings_permissions_delete input[name=id]').val(id);
        $('#component_settings_permissions_delete').modal('show');
        wait.Off_();
    });
    
    // Delete form permission
    $('#component_settings_permissions_delete form').submit((e) =>
    {
        e.preventDefault();

        // Wait animation
        let wait = new wtools.ElementState('#component_settings_permissions_delete form button[type=submit]', true, 'button', new wtools.WaitAnimation().for_button);

        // Get Form identifier
        const table_identifier = wtools.GetUrlSearchParam('identifier');
        if(table_identifier == undefined)
        {
            wait.Off_();
            new wtools.Notification('WARNING').Show_('No se encontr&oacute; el identificador de la tabla.');
            return;
        }

        // Data
        const id = $('#component_settings_permissions_delete input[name=id]').val();

        // Request
        new wtools.Request(server_config.current.api + `/tables/permissions/delete?id=${id}&table-identifier=${table_identifier}`, "DEL").Exec_((response_data) =>
        {
            wait.Off_();
            
            // Manage response
            const result = new ResponseManager(response_data, '#component_settings_permissions_delete .notifications', 'Permiso de tabla: Eliminar');
            if(!result.Verify_())
                return;

            new wtools.Notification('SUCCESS').Show_('Permiso de tabla eliminado.');
            $('#component_settings_permissions_delete').modal('hide');
            $('#component_settings_permissions_modify').modal('hide');
            settings_permissions_read();
        });
    });
    
});