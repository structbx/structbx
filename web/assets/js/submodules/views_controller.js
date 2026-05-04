import { BaseController } from '../modules/base_controller.js';
import * as Tools from '../classes/tools.js';
import * as DOME from '../classes/dom_elements.js';
import { ResponseManager } from '../classes/response_manager.js';

import { View } from '../models/View.js';

export class ViewsController extends BaseController{
    constructor() {
        super();
        this.view = new View;
        this.notification.read = new wtools.Notification('WARNING', 5000, '#component_views_read .notifications');
        this.notification.add = new wtools.Notification('WARNING', 5000, '#component_views_add .notifications');
        this.notification.modify = new wtools.Notification('WARNING', 5000, '#component_views_modify .notifications');
        this.notification.delete = new wtools.Notification('WARNING', 5000, '#component_views_delete .notifications');
    }

    build(){

    }

    bindEvents(){
        // Select a view
        $(document).on('click', '#component_views_read .dropdown-item a', (e) => {
            e.preventDefault();
            const view_identifier = $(e.currentTarget).attr('view-identifier');
            this.selectView(view_identifier);
        });

        // Add a view
        $('#component_views_read .add').click(() => {
            $('#component_views_add').modal('show');
        });
        
        $('#component_views_add form').submit((e) => {
            e.preventDefault();
            this.add(e);
        });

        // Modify a view
        $(document).on('click', '#component_views_read .contents .modify', (e) => {
            const view_identifier = $(e.currentTarget).attr('view-identifier');
            const view_name = $(e.currentTarget).attr('view-name');
            if(view_identifier == undefined || view_name == undefined){
                this.notification.error.Show_('No se encontr&oacute; la vista.');
                return;
            }
            $('#component_views_modify input[name="name"]').val(view_name);
            $('#component_views_modify input[name="identifier"]').val(view_identifier);
            $('#component_views_modify').modal('show');
        });

        $('#component_views_modify form').submit((e) => {
            e.preventDefault();
            this.modify(e);
        });

        // Delete a view
        $(document).on('click', '#component_views_read .contents .delete', (e) => {
            const view_identifier = $(e.currentTarget).attr('view-identifier');
            const view_name = $(e.currentTarget).attr('view-name');
            if(view_identifier == undefined || view_name == undefined){
                this.notification.error.Show_('No se encontr&oacute; la vista.');
                return;
            }
            $('#component_views_delete .name').text(view_name);
            $('#component_views_delete input[name="identifier"]').val(view_identifier);
            $('#component_views_delete').modal('show');
        });

        $('#component_views_delete form').submit((e) => {
            e.preventDefault();
            this.delete(e);
        });
    }
    read(){
        // Wait animation
        let wait = new wtools.ElementState('#component_views_read .notifications', false, 'block', new wtools.WaitAnimation().for_block);

        const table_identifier = this.getTableIdentifier();

        // Request
        this.view.readAll(table_identifier).then((response_data) => {
            // Clean
            wait.Off_();
            $('#component_views_read .notifications').html('');
            $('#component_views_read .contents').html('');

            // Manage response
            const result = new ResponseManager(response_data, '#component_views_read .notifications', 'Vistas: Leer');
            if(!result.Verify_())
                return;

            // Results elements creator
            wait.Off_();
            $('#component_views_read .notifications').html('');
            $('#component_views_read .contents').html('');
            new wtools.UIElementsCreator('#component_views_read .contents', response_data.body.data).Build_((row) => {
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

            // Set view name in dropdown
            $('.view_name').html("");

            // Set current view as active
            const view_identifier = wtools.GetUrlSearchParam('v');
            if(view_identifier != undefined) {
                this.selectView(view_identifier);
            } else {
                // Set the first view as active
                const first_view_identifier = $('#component_views_read .contents .dropdown-item a').first().attr('view-identifier');
                if(first_view_identifier == undefined) {
                    //dataObject.Clear_();
                    //columnsObject.Clear_();
                    this.notification.warning.Show_('No se encontr&oacute; ninguna vista disponible.');
                    
                    // Create default view...
                }
                else
                    this.selectView(view_identifier);
            }

        });
    }
    
    selectView(view_identifier){
        // Get table identifier
        const table_identifier = this.getTableIdentifier();

        // Request
        this.view.readByIdentifier(view_identifier, table_identifier).then((response_data) => {
            // Manage response
            const result = new ResponseManager(response_data, '#component_views_read .notifications', 'Vistas: Leer');
            if(!result.Verify_())
                return;

            // Handle zero results
            if(response_data.body.data.length < 1){
                // Set the first view as active
                const view_identifier = $('#component_views_read .contents .dropdown-item a')
                    .first().attr('view-identifier');
                this.selectView(view_identifier);
                return;
            }
            const row = response_data.body.data[0];

            // Build URL params
            const url = new URL(window.location.href);
            url.searchParams.set('t', table_identifier);
            url.searchParams.set('v', row.identifier);
            history.pushState({}, '', url.toString());

            // Set view name in dropdown
            $('.view_name').html(row.name);

            // New data object
            /*dataObject = new Data();
            dataObject.Start_();
            columnsObject.read();
            filtersObject.read();*/
        });
    }

    add(e)
    {
        // Clean notifications
        $('#component_views_add .notifications').html('');

        // Wait animation
        let wait = new wtools.ElementState(
            '#component_views_add form button[type=submit]'
            , true, 'button', new wtools.WaitAnimation().for_button
        );

        // Form check
        const check = new wtools.FormChecker(e.target).Check_();
        if(!check){
            $('#component_views_add .notifications').html('');
            wait.Off_();
            this.notification.add.Show_('Hay campos inv&aacute;lidos.');
            return;
        }

        // Data collection
        const view_name = $('#component_views_add input[name=name]').val();
        const table_identifier = this.getTableIdentifier();

        // Request
        this.view.add(view_name, table_identifier).then((response_data) =>
        {
            wait.Off_();

            // Manage response
            const result = new ResponseManager(response_data, '#component_views_add .notifications', 'Vistas: A&ntilde;adir');
            if(!result.Verify_())
                return;

            this.notification.ok.Show_('Vista creada exitosamente.');
            $('#component_views_add').modal('hide');
            this.read();
        });
    }

    modify(e){
        // Clean notifications
        $('#component_views_modify .notifications').html('');

        // Wait animation
        let wait = new wtools.ElementState('#component_views_modify form button[type=submit]', true, 'button', new wtools.WaitAnimation().for_button);

        // Form check
        const check = new wtools.FormChecker(e.target).Check_();
        if(!check){
            $('#component_views_modify .notifications').html('');
            wait.Off_();
            new wtools.Notification('WARNING', 5000, '#component_views_modify .notifications').Show_('Hay campos inv&aacute;lidos.');
            return;
        }

        // Data collection
        const view_identifier = $('#component_views_modify input[name=identifier]').val();
        const view_name = $('#component_views_modify input[name=name]').val();
    
        // Request
        this.view.modify(view_name, view_identifier).then((response_data) =>
        {
            wait.Off_();

            // Manage response
            const result = new ResponseManager(response_data, '#component_views_modify .notifications', 'Vistas: Modificar');
            if(!result.Verify_())
                return;

            new wtools.Notification('SUCCESS').Show_('Vista modificada exitosamente.');
            $('#component_views_modify').modal('hide');
            this.read();
        });
    }

    delete(e)
    {
        // Wait animation
        let wait = new wtools.ElementState('#component_views_delete form button[type=submit]', true, 'button', new wtools.WaitAnimation().for_button);

        // Form check
        const check = new wtools.FormChecker(e.target).Check_();
        if(!check){
            $('#component_views_delete .notifications').html('');
            wait.Off_();
            this.notification.warning.Show_('Hay campos inv&aacute;lidos.');
            return;
        }

        // Request
        const current_view = wtools.GetUrlSearchParam('v');
        const view_identifier = $('#component_views_delete input[name="identifier"]').val();
        this.view.delete(view_identifier).then((response_data) =>
        {
            wait.Off_();

            // Manage response
            const result = new ResponseManager(response_data, '#component_views_delete .notifications', 'Vistas: Modificar');
            if(!result.Verify_())
                return;

            new wtools.Notification('SUCCESS').Show_('Vista eliminada exitosamente.');
            $('#component_views_delete').modal('hide');
            this.read();
            if(current_view == view_identifier)
            {
                const url = new URL(window.location.href);
                url.searchParams.set('t', this.getTableIdentifier());
                history.pushState({}, '', url.toString());
            }

        });
    }
}