$(function()
{

    // SELECT options
    const options_required = new wtools.SelectOptions
    ([
        new wtools.OptionValue("0", "No", true)
        ,new wtools.OptionValue("1", "S&iacute;")
    ]);
    options_required.Build_('#component_columns_add select[name="required"]');
    options_required.Build_('#component_columns_modify select[name="required"]');

    let options_column_type = new wtools.SelectOptions();
    const options_column_type_init = (options, callback) => new wtools.Request(server_config.current.api + "/tables/columns/types/read").Exec_((response_data) =>
    {
        try
        {
            let tmp_options = [];
            for(let row of response_data.body.data)
                tmp_options.push(new wtools.OptionValue(row.id, row.name));

            options.options = tmp_options;
            options.Build_('#component_columns_add select[name="id_column_type"]');
            options.Build_('#component_columns_modify select[name="id_column_type"]');
            callback();
        }
        catch(error)
        {
            new wtools.Notification('WARNING').Show_('No se pudo acceder a los tipos de columnas.');
            new wtools.Notification('WARNING', 0, '#component_columns_add .notifications').Show_('No se pudo acceder a los tipos de columnas.');
            new wtools.Notification('WARNING', 0, '#component_columns_modify .notifications').Show_('No se pudo acceder a los tipos de columnas.');
        }
    });
    options_column_type_init(options_column_type, () => {})

    let options_link_to = new wtools.SelectOptions();
    const options_link_to_init = (options, callback) => new wtools.Request(server_config.current.api + "/tables/read").Exec_((response_data) =>
    {
        try
        {
            let tmp_options = [];
            tmp_options.push(new wtools.OptionValue('', '-- Ninguno --', true));
            for(let row of response_data.body.data)
                tmp_options.push(new wtools.OptionValue(row.id, row.name));

            options.options = tmp_options;
            options.Build_('#component_columns_add select[name="link_to"]');
            options.Build_('#component_columns_modify select[name="link_to"]');
            callback();
        }
        catch(error)
        {
            new wtools.Notification('WARNING').Show_('No se pudo acceder a los tabla a enlazar.');
            new wtools.Notification('WARNING', 0, '#component_columns_add .notifications').Show_('No se pudo acceder a los tabla a enlazar.');
            new wtools.Notification('WARNING', 0, '#component_columns_modify .notifications').Show_('No se pudo acceder a los tabla a enlazar.');
        }
    });
    options_link_to_init(options_link_to, () => {})

    // Read columns
    const columns_read = () =>
    {
        // Wait animation
        let wait = new wtools.ElementState('#component_columns_read .notifications', false, 'block', new wtools.WaitAnimation().for_block);

        // Get Form identifier
        const table_identifier = wtools.GetUrlSearchParam('identifier');
        if(table_identifier == undefined)
            return;

        // Request
        new wtools.Request(server_config.current.api + `/tables/columns/read?table-identifier=${table_identifier}`).Exec_((response_data) =>
        {
            // Clean
            wait.Off_();
            $('#component_columns_read .notifications').html('');
            $('#component_columns_read table tbody').html('');

            // Manage response
            const result = new ResponseManager(response_data, '#component_columns_read .notifications', 'Columnas: Leer');
            if(!result.Verify_())
                return;

            // Handle zero results
            if(response_data.body.data.length < 1)
            {
                new wtools.Notification('SUCCESS', 0, '#component_columns_read .notifications').Show_('Sin resultados.');
                return;
            }

            // Results elements creator
            wait.Off_();
            $('#component_columns_read .notifications').html('');
            $('#component_columns_read table tbody').html('');
            new wtools.UIElementsCreator('#component_columns_read table tbody', response_data.body.data).Build_((row) =>
            {
                let elements = [
                    `<td scope="row">${row.name}</td>`
                    ,`<td scope="row">${row.column_type_name}</td>`
                    ,`<td scope="row">${row.position}</td>`
                    ,`<td scope="row">${row.length}</td>`
                    ,`<td scope="row">${options_required.ValueToOption_(row.required)}</td>`
                    ,`<td scope="row">${row.default_value}</td>`
                    ,`<td scope="row">${row.link_to_table_name}</td>`
                    ,`<td scope="row">${row.description}</td>`
                    ,`<td scope="row">${row.created_at}</td>`
                ];

                return new wtools.UIElementsPackage(`<tr column-id="${row.id}"></tr>`, elements).Pack_();
            });
        });
    };
    columns_read();
    
    // Setup avanced values
    const SetupAvancedValues = (target) =>
    {
        const value = $(target + ' form select[name="id_column_type"]').val();
        if(value == undefined)
        {
            new wtools.Notification('WARNING', 0, target + ' .notifications').Show_('Error al configurar los valores avanzados.');
            return;
        }
        
        if(value == "2" || value == "5" || value == "6" || value == "7" || value == "8")
            $(target + ' form input[name="length"]').val("");
        else if(value == "3" || value == "9")
            $(target + ' form input[name="length"]').val("11");
        else if(value == "4")
            $(target + ' form input[name="length"]').val("10,2");
        else if(value == "1")
            $(target + ' form input[name="length"]').val("100");
        else
            $(target + ' form input[name="length"]').val("");

        if(value == "9")
        {
            $(target + ' form select[name="link_to"]').val("");
            $(target + ' form select[name="link_to"]').prop('disabled', false);
            $(target + ' form .link_to_tr').removeClass('d-none');
        }
        else
        {
            $(target + ' form select[name="link_to"]').val("");
            $(target + ' form select[name="link_to"]').prop('disabled', true);
            $(target + ' form .link_to_tr').addClass('d-none');
        }
    }

    // Setup Avanced values in Add
    $('#component_columns_add form select[name="id_column_type"]').change((e) =>
    {
        SetupAvancedValues('#component_columns_add');
    });

    // Click on Add Button
    const read_table_columns_add = () =>
    {
        const add = () =>
        {
            $('#component_columns_add .notifications').html('');
            $('#component_columns_add form select[name="id_column_type"]').val("1");
            $('#component_columns_add form select[name="required"]').val("0");
            $('#component_columns_add form input[name="length"]').val("100");
            $('#component_columns_add form select[name="link_to"]').val("");
            $('#component_columns_add form select[name="link_to"]').prop('disabled', true);
            $('#component_columns_add').modal('show');
        }
        options_column_type_init(options_column_type, add);
    }

    $('#component_columns_read .add').click(() => read_table_columns_add());
    $('a.column_add').click(() => read_table_columns_add());

    // Add Column
    $('#component_columns_add form').submit((e) =>
    {
        e.preventDefault();

        // Wait animation
        let wait = new wtools.ElementState('#component_columns_add form button[type=submit]', true, 'button', new wtools.WaitAnimation().for_button);

        // Form check
        const check = new wtools.FormChecker(e.target).Check_();
        if(!check)
        {
            $('#component_columns_add .notifications').html('');
            wait.Off_();
            new wtools.Notification('WARNING', 5000, '#component_columns_add .notifications').Show_('Hay campos inv&aacute;lidos.');
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
        const data = new FormData($('#component_columns_add form')[0]);
        data.append('table-identifier', table_identifier);

        // Verify if column type is selection then link_to is required
        if(data.get('id_column_type') == "9" && (data.get('link_to') == null || data.get('link_to') == ""))
        {
            wait.Off_();
            new wtools.Notification('WARNING', 5000, '#component_columns_add .notifications').Show_('Debe especificar la tabla a enlazar.');
            return;
        }

        // Request
        new wtools.Request(server_config.current.api + "/tables/columns/add", "POST", data, false).Exec_((response_data) =>
        {
            wait.Off_();

            // Manage response
            const result = new ResponseManager(response_data, '#component_columns_add .notifications', 'Columnas: A&ntilde;adir');
            if(!result.Verify_())
                return;

            new wtools.Notification('SUCCESS').Show_('Columna creada exitosamente.');
            $('#component_columns_add').modal('hide');
            columns_read();
            $('#component_columns_add form input[name="name"]').val("Nueva columna");
        });
    });

    // Read column to modify
    $(document).on("click", '#component_columns_read table tbody tr', (e) =>
    {
        const read_modify = () => 
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
            let id = $(e.currentTarget).attr('column-id');
            if(id == undefined)
            {
                wait.Off_();
                new wtools.Notification('WARNING').Show_('No se encontr&oacute; el identificador de la columna.');
                return;
            }

            // Setup form to modify
            $('#component_data_modify table tbody').html('');
            
            // Read form to modify
            new wtools.Request(server_config.current.api + `/tables/columns/read/id?id=${id}&table-identifier=${table_identifier}`).Exec_((response_data) =>
            {
                // Manage response
                const result = new ResponseManager(response_data, '', 'Columnas: Modificar');
                if(!result.Verify_())
                    return;
    
                // Handle no results or zero results
                if(response_data.body.data.length < 1)
                {
                    new wtools.Notification('SUCCESS').Show_('Sin resultados.');
                    return;
                }

                // Set data
                $('#component_columns_modify input[name="id"]').val(response_data.body.data[0].id);
                $('#component_columns_modify input[name="name"]').val(response_data.body.data[0].name);
                $('#component_columns_modify input[name="length"]').val(response_data.body.data[0].length);
                $('#component_columns_modify select[name="required"]').val(response_data.body.data[0].required);
                $('#component_columns_modify input[name="position"]').val(response_data.body.data[0].position);
                $('#component_columns_modify input[name="default_value"]').val(response_data.body.data[0].default_value);
                $('#component_columns_modify textarea[name="description"]').val(response_data.body.data[0].description);
                $('#component_columns_modify select[name="id_column_type"]').val(response_data.body.data[0].id_column_type);
                $('#component_columns_modify select[name="link_to"]').val(response_data.body.data[0].link_to);
                if(response_data.body.data[0].link_to == "")
                    $('#component_columns_modify form select[name="link_to"]').prop('disabled', true);
    
                wait.Off_();
                $('#component_columns_modify form').removeClass('was-validated');
                $('#component_columns_modify').modal('show');
            });
        }
        options_column_type_init(options_column_type, read_modify);
    });

    // Setup Avanced values in Modify
    $('#component_columns_modify form select[name="id_column_type"]').change((e) =>
    {
        SetupAvancedValues('#component_columns_modify');
    });
    
    // Modify column
    $('#component_columns_modify form').submit((e) =>
    {
        e.preventDefault();

        // Wait animation
        let wait = new wtools.ElementState('#component_columns_modify form button[type=submit]', true, 'button', new wtools.WaitAnimation().for_button);

        // Form check
        const check = new wtools.FormChecker(e.target).Check_();
        if(!check)
        {
            wait.Off_();
            $('#component_columns_modify .notifications').html('');
            new wtools.Notification('WARNING', 5000, '#component_columns_modify .notifications').Show_('Hay campos inv&aacute;lidos.');
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
        const new_data = new FormData($('#component_columns_modify form')[0]);
        new_data.append('table-identifier', table_identifier);

        // Request
        new wtools.Request(server_config.current.api + "/tables/columns/modify", "PUT", new_data, false).Exec_((response_data) =>
        {
            wait.Off_();

            // Manage response
            const result = new ResponseManager(response_data, '#component_columns_modify .notifications', 'Columnas: Modificar');
            if(!result.Verify_())
                return;

            new wtools.Notification('SUCCESS').Show_('Columna modificada exitosamente.');
            $('#component_columns_modify').modal('hide');
            columns_read();
        });
    });
    
    // Read column to Delete
    $('#component_columns_modify .delete').click((e) =>
    {
        e.preventDefault();

        // Wait animation
        let wait = new wtools.ElementState('#wait_animation_page', true, 'block', new wtools.WaitAnimation().for_page);

        // Data
        let data = new FormData($('#component_columns_modify form')[0]);
        const id = data.get('id');
        const name = data.get('name');

        // Setup data to delete
        $('#component_columns_delete input[name=id]').val(id);
        $('#component_columns_delete strong.name').html(name);
        $('#component_columns_delete').modal('show');
        wait.Off_();
    });
    
    // Delete column
    $('#component_columns_delete form').submit((e) =>
    {
        e.preventDefault();

        // Wait animation
        let wait = new wtools.ElementState('#component_columns_delete form button[type=submit]', true, 'button', new wtools.WaitAnimation().for_button);

        // Get Form identifier
        const table_identifier = wtools.GetUrlSearchParam('identifier');

        if(table_identifier == undefined)
        {
            wait.Off_();
            new wtools.Notification('WARNING').Show_('No se encontr&oacute; el identificador de la tabla.');
            return;
        }

        // Data
        const id = $('#component_columns_delete input[name=id]').val();

        // Request
        new wtools.Request(server_config.current.api + `/tables/columns/delete?id=${id}&table-identifier=${table_identifier}`, "DEL").Exec_((response_data) =>
        {
            wait.Off_();
            
            // Manage response
            const result = new ResponseManager(response_data, '#component_columns_delete .notifications', 'Columnas: Eliminar');
            if(!result.Verify_())
                return;

            new wtools.Notification('SUCCESS').Show_('Columna eliminada.');
            $('#component_columns_delete').modal('hide');
            $('#component_columns_modify').modal('hide');
            columns_read();
        });
    });
    
});