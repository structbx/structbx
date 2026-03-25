class Views
{
    Read_()
    {
        // Wait animation
        let wait = new wtools.ElementState('#component_data_views .notifications', false, 'block', new wtools.WaitAnimation().for_block);

        // Get Form identifier
        const table_identifier = wtools.GetUrlSearchParam('identifier');
        if(table_identifier == undefined)
            return;

        // Request
        new wtools.Request(server_config.current.api + `/tables/views/read?table-identifier=${table_identifier}`).Exec_((response_data) =>
        {
            // Clean
            wait.Off_();
            $('#component_data_views .notifications').html('');
            $('#component_data_views .contents').html('');

            // Manage response
            const result = new ResponseManager(response_data, '#component_data_views .notifications', 'Vistas: Leer');
            if(!result.Verify_())
                return;

            // Handle zero results
            if(response_data.body.data.length < 1)
                return;

            // Results elements creator
            wait.Off_();
            $('#component_data_views .notifications').html('');
            $('#component_data_views .contents').html('');
            new wtools.UIElementsCreator('#component_data_views .contents', response_data.body.data).Build_((row) =>
            {
                return `
                    <div class="p-0 dropdown-item d-flex align-items-center" style="cursor:pointer;">
                        <a class="py-2 ps-4 text-dark text-decoration-none flex-fill me-2" view-identifier="${row.identifier}" href="#">
                            ${row.name}
                        </a>
                        <div class="py-2 pe-4 btn-group" role="group">
                            <button type="button" class="btn btn-sm btn-dark-shadow modify" view-identifier="${row.identifier}" view-name="${row.name}"><i class="fas fa-pen"></i></button>
                            <button type="button" class="btn btn-sm btn-dark-shadow delete" view-identifier="${row.identifier}" view-name="${row.name}"><i class="fas fa-trash"></i></button>
                        </div>
                    </div>
                `;
            });

            // Set current view as active
            const view_identifier = wtools.GetUrlSearchParam('v');
            if(view_identifier != undefined)
            {
                this.SelectView_(view_identifier);
            }
            else
            {
                // Set the first view as active
                const view_identifier = $('#component_data_views .contents .dropdown-item a').first().attr('view-identifier');
                this.SelectView_(view_identifier);
            }

        });
    }
    
    SelectView_(view_identifier)
    {
        // Get table identifier
        const table_identifier = wtools.GetUrlSearchParam('identifier');
        if(table_identifier == undefined)
        {
            new wtools.ElementState('#wait_animation_page', true, 'block', new wtools.WaitAnimation().for_page);
            window.location.href = "/start";
        }

        // Request
        new wtools.Request(server_config.current.api + `/tables/views/read/identifier?identifier=${view_identifier}&table-identifier=${table_identifier}`).Exec_((response_data) =>
        {
            // Manage response
            const result = new ResponseManager(response_data, '#component_data_views .notifications', 'Vistas: Leer');
            if(!result.Verify_())
                return;

            // Handle zero results
            if(response_data.body.data.length < 1)
            {
                // Set the first view as active
                const view_identifier = $('#component_data_views .contents .dropdown-item a').first().attr('view-identifier');
                this.SelectView_(view_identifier);
                return;
            }
            const row = response_data.body.data[0];

            // Build URL params
            const url = new URL(window.location.href);
            url.searchParams.set('identifier', table_identifier);
            url.searchParams.set('v', row.identifier);
            history.pushState({}, '', url.toString());

            // Set view name in dropdown
            $('.view_name').html(row.name);

            // New data object
            dataObject = new Data();
            dataObject.Start_();
            columnsObject.Read_();
        });
    }

    Add_(e)
    {
        // Clean notifications
        $('#component_data_views_add .notifications').html('');

        // Wait animation
        let wait = new wtools.ElementState('#component_data_views_add form button[type=submit]', true, 'button', new wtools.WaitAnimation().for_button);

        // Form check
        const check = new wtools.FormChecker(e.target).Check_();
        if(!check)
        {
            $('#component_data_views_add .notifications').html('');
            wait.Off_();
            new wtools.Notification('WARNING', 5000, '#component_data_views_add .notifications').Show_('Hay campos inv&aacute;lidos.');
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
        const data = new FormData($('#component_data_views_add form')[0]);
        data.append('table-identifier', table_identifier);

        // Request
        new wtools.Request(server_config.current.api + "/tables/views/add", "POST", data, false).Exec_((response_data) =>
        {
            wait.Off_();

            // Manage response
            const result = new ResponseManager(response_data, '#component_data_views_add .notifications', 'Vistas: A&ntilde;adir');
            if(!result.Verify_())
                return;

            new wtools.Notification('SUCCESS').Show_('Vista creada exitosamente.');
            $('#component_data_views_add').modal('hide');
            this.Read_();
        });
    }

    Modify_(e)
    {
        // Clean notifications
        $('#component_data_views_modify .notifications').html('');

        // Wait animation
        let wait = new wtools.ElementState('#component_data_views_modify form button[type=submit]', true, 'button', new wtools.WaitAnimation().for_button);

        // Form check
        const check = new wtools.FormChecker(e.target).Check_();
        if(!check)
        {
            $('#component_data_views_modify .notifications').html('');
            wait.Off_();
            new wtools.Notification('WARNING', 5000, '#component_data_views_modify .notifications').Show_('Hay campos inv&aacute;lidos.');
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
        const data = new FormData($('#component_data_views_modify form')[0]);
    
        // Request
        new wtools.Request(server_config.current.api + "/tables/views/modify", "PUT", data, false).Exec_((response_data) =>
        {
            wait.Off_();

            // Manage response
            const result = new ResponseManager(response_data, '#component_data_views_modify .notifications', 'Vistas: Modificar');
            if(!result.Verify_())
                return;

            new wtools.Notification('SUCCESS').Show_('Vista modificada exitosamente.');
            $('#component_data_views_modify').modal('hide');
            this.Read_();
        });
    }

    Delete_(e)
    {
        // Wait animation
        let wait = new wtools.ElementState('#component_data_views_delete form button[type=submit]', true, 'button', new wtools.WaitAnimation().for_button);

        // Form check
        const check = new wtools.FormChecker(e.target).Check_();
        if(!check)
        {
            $('#component_data_views_delete .notifications').html('');
            wait.Off_();
            new wtools.Notification('WARNING', 5000, '#component_data_views_delete .notifications').Show_('Hay campos inv&aacute;lidos.');
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

        // Request
        const current_view = wtools.GetUrlSearchParam('v');
        const view_identifier = $('#component_data_views_delete input[name="identifier"]').val();
        new wtools.Request(server_config.current.api + `/tables/views/delete?identifier=${view_identifier}`, "DEL").Exec_((response_data) =>
        {
            wait.Off_();

            // Manage response
            const result = new ResponseManager(response_data, '#component_data_views_delete .notifications', 'Vistas: Modificar');
            if(!result.Verify_())
                return;

            new wtools.Notification('SUCCESS').Show_('Vista eliminada exitosamente.');
            $('#component_data_views_delete').modal('hide');
            this.Read_();
            //if(current_view == view_identifier)
                //this.GetOutOfView_();
        });
    }
}

var viewsObject = new Views();

$(function()
{
    // Read current view
    viewsObject.Read_();

    // Select a view
    $(document).on('click', '#component_data_views .dropdown-item a', (e) =>
    {
        e.preventDefault();
        const view_identifier = $(e.currentTarget).attr('view-identifier');
        viewsObject.SelectView_(view_identifier);
    });

    // Add a view
    $('#component_data_views .add').click(() => 
    {
        $('#component_data_views_add').modal('show');
    });
    
    $('#component_data_views_add form').submit((e) =>
    {
        e.preventDefault();

        viewsObject.Add_(e);
    });

    // Modify a view
    $(document).on('click', '#component_data_views .contents .modify', (e) => 
    {
        const view_identifier = $(e.currentTarget).attr('view-identifier');
        const view_name = $(e.currentTarget).attr('view-name');
        if(view_identifier == undefined || view_name == undefined)
        {
            new wtools.Notification('WARNING').Show_('No se encontr&oacute; la vista.');
            return;
        }
        $('#component_data_views_modify input[name="name"]').val(view_name);
        $('#component_data_views_modify input[name="identifier"]').val(view_identifier);
        $('#component_data_views_modify').modal('show');
    });

    $('#component_data_views_modify form').submit((e) =>
    {
        e.preventDefault();

        viewsObject.Modify_(e);
    });

    // Delete a view
    $(document).on('click', '#component_data_views .contents .delete', (e) => 
    {
        const view_identifier = $(e.currentTarget).attr('view-identifier');
        const view_name = $(e.currentTarget).attr('view-name');
        if(view_identifier == undefined || view_name == undefined)
        {
            new wtools.Notification('WARNING').Show_('No se encontr&oacute; la vista.');
            return;
        }
        $('#component_data_views_delete .name').text(view_name);
        $('#component_data_views_delete input[name="identifier"]').val(view_identifier);
        $('#component_data_views_delete').modal('show');
    });

    $('#component_data_views_delete form').submit((e) =>
    {
        e.preventDefault();

        viewsObject.Delete_(e);
    });
});