import { BaseController } from '../modules/base_controller.js';
import * as Tools from '../classes/tools.js';
import * as DOME from '../classes/dom_elements.js';
import { ResponseManager } from '../classes/response_manager.js';
import { TableElements } from '../classes/table_elements.js';

import { Table } from '../models/Table.js';
import { TableColumn } from '../models/TableColumn.js';

export class ColumnsController extends BaseController{
    constructor() {
        super();
        this.table = new Table;
        this.tableColumn = new TableColumn;

        this.notification.read = new wtools.Notification('WARNING', 5000, '#component_columns_read .notifications');
        this.notification.add = new wtools.Notification('WARNING', 5000, '#component_columns_add .notifications');
        this.notification.modify = new wtools.Notification('WARNING', 5000, '#component_columns_modify .notifications');
        this.notification.delete = new wtools.Notification('WARNING', 5000, '#component_columns_delete .notifications');

        this.columns = []

        this.options_required = new wtools.SelectOptions([
            new wtools.OptionValue("0", "No", true)
            ,new wtools.OptionValue("1", "S&iacute;")
        ]);
        this.options_required.Build_('#component_columns_add select[name="required"]');
        this.options_required.Build_('#component_columns_modify select[name="required"]');

        this.options_column_type = new wtools.SelectOptions([
            new wtools.OptionValue("text", "Texto", true),
            new wtools.OptionValue("long-text", "Texto largo", false),
            new wtools.OptionValue("int-number", "Número entero", false),
            new wtools.OptionValue("decimal-number", "Número decimal", false),
            new wtools.OptionValue("date", "Fecha", false),
            new wtools.OptionValue("time", "Hora", false),
            new wtools.OptionValue("file", "Archivo", false),
            new wtools.OptionValue("image", "Imagen", false),
            new wtools.OptionValue("selection", "Selección", false),
            new wtools.OptionValue("user", "Usuario", false),
            new wtools.OptionValue("current-user", "Usuario actual", false),
            new wtools.OptionValue("created-date", "Fecha de creación", false),
            new wtools.OptionValue("updated-date", "Fecha de actualización", false)
        ]);
        this.options_column_type.Build_('#component_columns_add select[name="column_type"]');
        this.options_column_type.Build_('#component_columns_modify select[name="column_type"]');

        this.options_link_to = new wtools.SelectOptions();
        this.options_link_to_init = (options, callback) => this.table.readAll().then((response_data) =>
        {
            try
            {
                let tmp_options = [];
                tmp_options.push(new wtools.OptionValue('', '-- Ninguno --', true));
                for(let row of response_data.body.data)
                    tmp_options.push(new wtools.OptionValue(row.identifier, row.name));

                options.options = tmp_options;
                options.Build_('#component_columns_add select[name="link_to"]');
                options.Build_('#component_columns_modify select[name="link_to"]');
                callback();
            }
            catch(error){
                new wtools.Notification('WARNING').Show_('No se pudo acceder a los tabla a enlazar.');
                new wtools.Notification('WARNING', 0, '#component_columns_add .notifications').Show_('No se pudo acceder a los tabla a enlazar.');
                new wtools.Notification('WARNING', 0, '#component_columns_modify .notifications').Show_('No se pudo acceder a los tabla a enlazar.');
            }
        });
        this.options_link_to_init(this.options_link_to, () => {})

    }

    build(){

    }

    bindEvents(){
        // Sort columns position in view
        $(`#component_columns_read .contents`).sortable({
            update: ( event, ui) => {
                this.setPosition(ui);
            }
        });

        // Set visible column in view
        $(document).on('change'
            ,`#component_columns_read .contents input.form-check-input`, function(e){
                this.setVisible(e);
        });

        // Click on Add Button
        const read_table_columns_add = () => {
            $('#component_columns_add .notifications').html('');
            $('#component_columns_add form select[name="id_column_type"]').val("1");
            $('#component_columns_add form select[name="link_to"]').val("");
            $('#component_columns_add form select[name="link_to"]').prop('disabled', true);
            $('#component_columns_add').modal('show');
        }

        $('#component_columns_read .add').click(() => read_table_columns_add());
        $('a.column_add').click(() => read_table_columns_add());

        // Add Column
        $('#component_columns_add form').submit((e) => {
            e.preventDefault();
            this.add(e);
        });

        // Read column to modify
        $(document).on("click", '#component_columns_read a', (e) => {
            e.preventDefault();
            this.preModify(e);
        });

        // Modify column
        $('#component_columns_modify form').submit((e) => {
            e.preventDefault();
            this.modify(e);
        });
        
        // Read column to Delete
        $('#component_columns_modify .delete').click((e) => {
            e.preventDefault();
            this.preDelete();
        });
        
        // Delete column
        $('#component_columns_delete form').submit((e) => {
            e.preventDefault();
            this.delete();
        });
    }

    read()
    {
        // Wait animation
        let wait = new wtools.ElementState('#component_columns_read .notifications'
            ,false, 'block', new wtools.WaitAnimation().for_block);

        // Request
        this.tableColumn.read(this.getTableIdentifier(), this.getViewIdentifier()).then((response_data) => {
            // Clean
            wait.Off_();
            $('#component_columns_read .notifications').html('');
            $(`#component_columns_read .contents`).html('');

            // Manage response
            const result = new ResponseManager(response_data, '#component_columns_read .notifications', 'Columnas: Leer');
            if(!result.Verify_())
                return;

            // Handle zero results
            if(response_data.body.data.length < 1){
                new wtools.Notification('SUCCESS', 0, '#component_columns_read .notifications').Show_('Sin resultados.');
                return;
            }

            // Results elements creator
            wait.Off_();
            $('#component_columns_read .notifications').html('');
            $(`#component_columns_read .contents`).html('');

            // Sort elements by the position
            response_data.body.data.sort((a, b) => a.final_position - b.final_position);

            new wtools.UIElementsCreator(`#component_columns_read .contents`, response_data.body.data).Build_((row) =>{
                let table_icon = new TableElements(row.column_type, undefined, '').GetIcon_();

                // Add column
                this.columns.push({identifier: row.identifier, name: row.name, icon: table_icon});

                // DOM element
                return `
                    <div column-identifier="${row.identifier}" class="ui-state-default p-0 dropdown-item d-flex align-items-center" style="cursor:pointer;">
                        <a column-identifier="${row.identifier}" href="#" class="py-2 ps-4 text-dark text-decoration-none flex-fill me-2">
                            <i class="fas fa-sort me-2"></i>${table_icon}${row.name}
                        </a>
                        <div class="form-check form-switch pe-4">
                            <input class="form-check-input" type="checkbox" ${row.visible == 1? 'checked' : ""} column-identifier="${row.identifier}" column-name="${row.name}">
                            <label class="form-check-label"><i class="fas fa-eye"></i></label>
                        </div>
                    </div>
                `;
            });
        });
    }

    add(e){
        // Wait animation
        let wait = new wtools.ElementState('#component_columns_add form button[type=submit]', true, 'button', new wtools.WaitAnimation().for_button);

        // Form check
        const check = new wtools.FormChecker(e.target).Check_();
        if(!check){
            $('#component_columns_add .notifications').html('');
            wait.Off_();
            this.notification.add.Show_('Hay campos inv&aacute;lidos.');
            return;
        }

        // Data collection
        const column_name = $('#component_columns_add input[name=name]').val();
        const column_type = $('#component_columns_add select[name=column_type]').val();
        const description = $('#component_columns_add textarea[name=description]').val();
        const required = $('#component_columns_add select[name=required]').val();
        const default_value = $('#component_columns_add input[name=default_value]').val();
        const link_to = $('#component_columns_add select[name=link_to]').val();

        // Verify if column type is selection then link_to is required
        if(column_type == "selection" && (link_to == null || link_to == "" || link_to == undefined)){
            wait.Off_();
            this.notification.add.Show_('Debe especificar la tabla a enlazar.');
            return;
        }

        // Request
        this.tableColumn.add(this.getTableIdentifier(), column_name, column_type, description, required, default_value, link_to).then((response_data) =>
        {
            wait.Off_();

            // Manage response
            const result = new ResponseManager(response_data, '#component_columns_add .notifications', 'Columnas: A&ntilde;adir');
            if(!result.Verify_())
                return;

            this.notification.ok.Show_('Columna creada exitosamente.');
            $('#component_columns_add').modal('hide');
            $('#component_columns_add form input[name="name"]').val("Nueva columna");
            //$(`#component_nav_tables .tab-scroller .tab[id="${table_identifier}"]`).click();
            this.read();
        });
    }

    setVisible(e){
        let column_identifier = $(e.target).attr('column-identifier');
        let visible = $(e.target)[0].checked;

        // Get View identifier
        const view_identifier = wtools.GetUrlSearchParam('v');
        if(view_identifier == undefined)
        {
            wait.Off_();
            new wtools.Notification('WARNING').Show_('No se encontr&oacute; el identificador de la vista.');
            return;
        }

        // Data collection
        const new_data = new FormData();
        new_data.append('view-identifier', view_identifier);
        new_data.append('identifier', column_identifier);
        new_data.append('visible', visible ? 1 : 0);

        // Request
        new wtools.Request(server_config.current.api + "/tables/columns/visible/modify", "PUT", new_data, false).Exec_((response_data) =>
        {
            // Manage response
            const result = new ResponseManager(response_data, '#notifications', 'Columnas: Visible: Modificar');
            if(!result.Verify_())
                return;

            viewsObject.Read_();
        });
    }

    setPosition(ui){
        let column_identifier = $(ui.item).attr('column-identifier');
        let columnPrev = $(ui.item).prev().attr('column-identifier');
        let columnNext = $(ui.item).next().attr('column-identifier');

        // Request
        this.tableColumn.modifyPosition(column_identifier, this.getViewIdentifier(), columnPrev, columnNext).then((response_data) =>{
            // Manage response
            const result = new ResponseManager(response_data, '#notifications', 'Columnas: Posici&oacute;n: Modificar');
            if(!result.Verify_())
                return;

            this.read();
        });
    }

    preModify(e){
        // Wait animation
        let wait = new wtools.ElementState('#wait_animation_page', true, 'block', new wtools.WaitAnimation().for_page);

        // Get ID
        let identifier = $(e.target).attr('column-identifier');
        if(identifier == undefined){
            wait.Off_();
            new wtools.Notification('WARNING').Show_('No se encontr&oacute; el identificador de la columna.');
            return;
        }

        // Request
        $('#component_data_modify table tbody').html('');
        this.tableColumn.readByIdentifier(identifier, this.getTableIdentifier()).then((response_data) => {
            // Manage response
            const result = new ResponseManager(response_data, '', 'Columnas: Modificar');
            if(!result.Verify_())
                return;

            // Handle no results or zero results
            if(response_data.body.data.length < 1){
                new wtools.Notification('SUCCESS').Show_('Sin resultados.');
                return;
            }

            // Set data
            $('#component_columns_modify input[name="identifier"]').val(response_data.body.data[0].identifier);
            $('#component_columns_modify input[name="name"]').val(response_data.body.data[0].name);
            $('#component_columns_modify select[name="required"]').val(response_data.body.data[0].required);
            $('#component_columns_modify input[name="position"]').val(response_data.body.data[0].position);
            $('#component_columns_modify input[name="default_value"]').val(response_data.body.data[0].default_value);
            $('#component_columns_modify textarea[name="description"]').val(response_data.body.data[0].description);
            $('#component_columns_modify select[name="column_type"]').val(response_data.body.data[0].column_type);
            $('#component_columns_modify select[name="link_to"]').val(response_data.body.data[0].link_to);
            if(response_data.body.data[0].link_to == "")
                $('#component_columns_modify form select[name="link_to"]').prop('disabled', true);

            wait.Off_();
            $('#component_columns_modify form').removeClass('was-validated');
            $('#component_columns_modify').modal('show');
        });
    }

    modify(e)
    {

        // Wait animation
        let wait = new wtools.ElementState('#component_columns_modify form button[type=submit]', true, 'button', new wtools.WaitAnimation().for_button);

        // Form check
        const check = new wtools.FormChecker(e.target).Check_();
        if(!check){
            wait.Off_();
            $('#component_columns_modify .notifications').html('');
            new wtools.Notification('WARNING', 5000, '#component_columns_modify .notifications').Show_('Hay campos inv&aacute;lidos.');
            return;
        }

        // Data collection
        const identifier = $('#component_columns_modify input[name=identifier]').val();
        const column_name = $('#component_columns_modify input[name=name]').val();
        const column_type = $('#component_columns_modify select[name=column_type]').val();
        const description = $('#component_columns_modify textarea[name=description]').val();
        const required = $('#component_columns_modify select[name=required]').val();
        const default_value = $('#component_columns_modify input[name=default_value]').val();
        const link_to = $('#component_columns_modify select[name=link_to]').val();

        // Verify if column type is selection then link_to is required
        if(column_type == "selection" && (link_to == null || link_to == "" || link_to == undefined)){
            wait.Off_();
            this.notification.add.Show_('Debe especificar la tabla a enlazar.');
            return;
        }

        // Request
        this.tableColumn.modify(identifier, this.getTableIdentifier(), column_name, column_type, description, required, default_value, link_to).then((response_data) =>{
            wait.Off_();

            // Manage response
            const result = new ResponseManager(response_data, '#component_columns_modify .notifications', 'Columnas: Modificar');
            if(!result.Verify_())
                return;

            new wtools.Notification('SUCCESS').Show_('Columna modificada exitosamente.');
            $('#component_columns_modify').modal('hide');
            //$(`#component_nav_tables .tab-scroller .tab[id="${table_identifier}"]`).click();
            this.read();
        });
    }

    preDelete()
    {
        // Wait animation
        let wait = new wtools.ElementState('#wait_animation_page', true, 'block', new wtools.WaitAnimation().for_page);

        // Data
        const identifier = $('#component_columns_modify input[name=identifier]').val();
        const name = $('#component_columns_modify input[name=name]').val();

        // Setup data to delete
        $('#component_columns_delete input[name=identifier]').val(identifier);
        $('#component_columns_delete strong.name').html(name);
        $('#component_columns_delete').modal('show');
        wait.Off_();
    }

    delete()
    {
        // Wait animation
        let wait = new wtools.ElementState('#component_columns_delete form button[type=submit]', true, 'button', new wtools.WaitAnimation().for_button);

        // Data
        const identifier = $('#component_columns_delete input[name=identifier]').val();

        // Request
        this.tableColumn.delete(identifier, this.getTableIdentifier()).then((response_data) =>
        {
            wait.Off_();
            
            // Manage response
            const result = new ResponseManager(response_data, '#component_columns_delete .notifications', 'Columnas: Eliminar');
            if(!result.Verify_())
                return;

            new wtools.Notification('SUCCESS').Show_('Columna eliminada.');
            $('#component_columns_delete').modal('hide');
            $('#component_columns_modify').modal('hide');
            this.read();
            //$(`#component_nav_tables .tab-scroller .tab[id="${table_identifier}"]`).click();
        });
    }
}