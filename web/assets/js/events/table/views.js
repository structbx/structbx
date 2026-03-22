class Views
{
    
    GetOutOfView_()
    {
        // Get table identifier
        const table_identifier = wtools.GetUrlSearchParam('identifier');
        if(table_identifier == undefined)
            return;

        // Build URL params
        const url = new URL(window.location.href);
        url.searchParams.delete('conditions');
        url.searchParams.delete('order');
        url.searchParams.delete('view');
        history.pushState({}, '', url.toString());

        // Reload data
        $('#component_data_reload').click();
        $('.table_view').text('');
        $('#component_data_views .out-view').addClass('d-none');
    }

    ReadActiveView_()
    {
        // Get view id
        const view_id = wtools.GetUrlSearchParam('view');
        if(view_id == undefined)
        {
            $('.table_view').text('');
            return;
        }

        // Get Form identifier
        const table_identifier = wtools.GetUrlSearchParam('identifier');
        if(table_identifier == undefined)
        {
            new wtools.ElementState('#wait_animation_page', true, 'block', new wtools.WaitAnimation().for_page);
            window.location.href = "/start";
        }

        // Request
        new wtools.Request(server_config.current.api + `/tables/views/read/id?id=${view_id}&table-identifier=${table_identifier}`).Exec_((response_data) =>
        {
            // Manage response
            const result = new ResponseManager(response_data, '#component_data_views .notifications', 'Vistas: Leer');
            if(!result.Verify_())
                return;

            // Handle zero results
            if(response_data.body.data.length < 1)
            {
                new wtools.Notification('WARNING').Show_('Hubo un error al consultar la vista.');
                return;
            }

            // Set the current view
            const row = response_data.body.data[0];
            $('.table_view').text(` (${row.name})`);
            $('#component_data_views .out-view').removeClass('d-none');
        });
    };

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
                        <a class="py-2 ps-4 text-dark text-decoration-none flex-fill me-2" view-id="${row.id}" href="#">
                            ${row.name}
                        </a>
                        <div class="py-2 pe-4 btn-group" role="group">
                            <button type="button" class="btn btn-sm btn-secondary modify" view-id="${row.id}" view-name="${row.name}"><i class="fas fa-pen"></i></button>
                            <button type="button" class="btn btn-sm btn-secondary delete" view-id="${row.id}" view-name="${row.name}"><i class="fas fa-trash"></i></button>
                        </div>
                    </div>
                `;
            });
        });
    }
    
    SelectView_(e)
    {
        // Get view id
        const view_id = $(e.currentTarget).attr('view-id');
        if(view_id == undefined)
        {
            new wtools.Notification('ERROR').Show_('No se encontr&oacute; la vista.');
            return;
        }

        // Get Form identifier
        const table_identifier = wtools.GetUrlSearchParam('identifier');
        if(table_identifier == undefined)
        {
            new wtools.ElementState('#wait_animation_page', true, 'block', new wtools.WaitAnimation().for_page);
            window.location.href = "/start";
        }

        // Request
        new wtools.Request(server_config.current.api + `/tables/views/read/id?id=${view_id}&table-identifier=${table_identifier}`).Exec_((response_data) =>
        {
            // Manage response
            const result = new ResponseManager(response_data, '#component_data_views .notifications', 'Vistas: Leer');
            if(!result.Verify_())
                return;

            // Handle zero results
            if(response_data.body.data.length < 1)
            {
                new wtools.Notification('SUCCESS').Show_('Hubo un error al consultar la vista.');
                return;
            }
            const row = response_data.body.data[0];

            // Build URL params
            const url = new URL(window.location.href);
            url.searchParams.set('identifier', table_identifier);
            url.searchParams.set('conditions', row.conditions);
            url.searchParams.set('order', row.order);
            url.searchParams.set('view', row.id);
            history.pushState({}, '', url.toString());

            // Reload data
            $('#component_data_reload').click();
            this.ReadActiveView_();
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
        let conditions = wtools.GetUrlSearchParam('conditions');
        let order = wtools.GetUrlSearchParam('order');
        const data = new FormData($('#component_data_views_add form')[0]);
        data.append('conditions', conditions);
        data.append('order', order);
        data.append('table-identifier', table_identifier);

        // Verify that there is almost conditions or order
        if(conditions == "" && order == "")
        {
            wait.Off_();
            new wtools.Notification('WARNING', 5000, '#component_data_views_add .notifications').Show_('Debe establecer al menos condiciones u orden en los filtros.');
            return;
        }
        if(conditions == undefined && order == undefined)
        {
            wait.Off_();
            new wtools.Notification('WARNING', 5000, '#component_data_views_add .notifications').Show_('Debe establecer al menos condiciones u orden en los filtros.');
            return;
        }

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
        let conditions = wtools.GetUrlSearchParam('conditions');
        let order = wtools.GetUrlSearchParam('order');
        const data = new FormData($('#component_data_views_modify form')[0]);
        data.append('conditions', conditions);
        data.append('order', order);
        data.append('table-identifier', table_identifier);

        // Verify that there is almost conditions or order
        if(conditions == "" && order == "")
        {
            wait.Off_();
            new wtools.Notification('WARNING', 5000, '#component_data_views_modify .notifications').Show_('Debe establecer al menos condiciones u orden en los filtros.');
            return;
        }
        if(conditions == undefined && order == undefined)
        {
            wait.Off_();
            new wtools.Notification('WARNING', 5000, '#component_data_views_modify .notifications').Show_('Debe establecer al menos condiciones u orden en los filtros.');
            return;
        }
    
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
        const current_view = wtools.GetUrlSearchParam('view');
        const view_id = $('#component_data_views_delete input[name="id"]').val();
        new wtools.Request(server_config.current.api + `/tables/views/delete?id=${view_id}&table-identifier=${table_identifier}`, "DEL").Exec_((response_data) =>
        {
            wait.Off_();

            // Manage response
            const result = new ResponseManager(response_data, '#component_data_views_delete .notifications', 'Vistas: Modificar');
            if(!result.Verify_())
                return;

            new wtools.Notification('SUCCESS').Show_('Vista eliminada exitosamente.');
            $('#component_data_views_delete').modal('hide');
            this.Read_();
            if(current_view == view_id)
                this.GetOutOfView_();
        });
    }
}

var viewsObject = new Views();

$(function()
{
    // Out of the views
    $('#component_data_views .out-view').click(() => viewsObject.GetOutOfView_());

    // Read current view
    viewsObject.ReadActiveView_();

    // Read Views
    viewsObject.Read_();
    
    // Select a view
    $(document).on('click', '#component_data_views .dropdown-item a', (e) =>
    {
        e.preventDefault();
        viewsObject.SelectView_(e);
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
        const view_id = $(e.currentTarget).attr('view-id');
        const view_name = $(e.currentTarget).attr('view-name');
        if(view_id == undefined || view_name == undefined)
        {
            new wtools.Notification('WARNING').Show_('No se encontr&oacute; la vista.');
            return;
        }
        $('#component_data_views_modify input[name="name"]').val(view_name);
        $('#component_data_views_modify input[name="id"]').val(view_id);
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
        const view_id = $(e.currentTarget).attr('view-id');
        const view_name = $(e.currentTarget).attr('view-name');
        if(view_id == undefined || view_name == undefined)
        {
            new wtools.Notification('WARNING').Show_('No se encontr&oacute; la vista.');
            return;
        }
        $('#component_data_views_delete .name').text(view_name);
        $('#component_data_views_delete input[name="id"]').val(view_id);
        $('#component_data_views_delete').modal('show');
    });

    $('#component_data_views_delete form').submit((e) =>
    {
        e.preventDefault();

        viewsObject.Delete_(e);
    });
});