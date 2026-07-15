import { BaseController } from '../modules/base_controller.js';
import * as Tools from '../classes/tools.js';
import * as DOME from '../classes/dom_elements.js';
import { ResponseManager } from '../classes/response_manager.js';
import { TableElements } from '../classes/table_elements.js';
import { I18n } from '../i18n/i18n.js';

import { Table } from '../models/Table.js';
import { TableColumn } from '../models/TableColumn.js';

import { ColumnType } from '../constants/column_types.js';

export class ColumnsController extends BaseController{
    constructor(onChangedCallback = () => {}) {
        super();
        this.onChanged = onChangedCallback;

        this.table = new Table;
        this.tableColumn = new TableColumn;

        this.notification.read = new wtools.Notification('WARNING', 5000, '#component_columns_read .notifications');
        this.notification.add = new wtools.Notification('WARNING', 5000, '#component_columns_add .notifications');
        this.notification.modify = new wtools.Notification('WARNING', 5000, '#component_columns_modify .notifications');
        this.notification.delete = new wtools.Notification('WARNING', 5000, '#component_columns_delete .notifications');

        this.columns = []

        this.options_required = new wtools.SelectOptions([
            new wtools.OptionValue("0", window.structbxI18n ? window.structbxI18n.t('columns.no') : 'No', true)
            ,new wtools.OptionValue("1", window.structbxI18n ? window.structbxI18n.t('columns.yes') : 'Yes')
        ]);
        this.options_required.Build_('#component_columns_add select[name="required"]');
        this.options_required.Build_('#component_columns_modify select[name="required"]');

        this.options_column_type = new wtools.SelectOptions([
            new wtools.OptionValue(ColumnType.Text, window.structbxI18n ? window.structbxI18n.t('columns.type_text') : 'Text', true),
            new wtools.OptionValue(ColumnType.LongText, window.structbxI18n ? window.structbxI18n.t('columns.type_long_text') : 'Long Text', false),
            new wtools.OptionValue(ColumnType.IntNumber, window.structbxI18n ? window.structbxI18n.t('columns.type_integer') : 'Integer', false),
            new wtools.OptionValue(ColumnType.DecimalNumber, window.structbxI18n ? window.structbxI18n.t('columns.type_decimal') : 'Decimal', false),
            new wtools.OptionValue(ColumnType.Date, window.structbxI18n ? window.structbxI18n.t('columns.type_date') : 'Date', false),
            new wtools.OptionValue(ColumnType.Time, window.structbxI18n ? window.structbxI18n.t('columns.type_time') : 'Time', false),
            new wtools.OptionValue(ColumnType.File, window.structbxI18n ? window.structbxI18n.t('columns.type_file') : 'File', false),
            new wtools.OptionValue(ColumnType.Image, window.structbxI18n ? window.structbxI18n.t('columns.type_image') : 'Image', false),
            new wtools.OptionValue(ColumnType.Selection, window.structbxI18n ? window.structbxI18n.t('columns.type_select') : 'Selection', false),
            new wtools.OptionValue(ColumnType.User, window.structbxI18n ? window.structbxI18n.t('columns.type_user') : 'User', false),
            new wtools.OptionValue(ColumnType.CurrentUser, window.structbxI18n ? window.structbxI18n.t('columns.type_current_user') : 'Current User', false),
            new wtools.OptionValue(ColumnType.CreatedDate, window.structbxI18n ? window.structbxI18n.t('columns.type_created_at') : 'Created At', false),
            new wtools.OptionValue(ColumnType.UpdatedDate, window.structbxI18n ? window.structbxI18n.t('columns.type_updated_at') : 'Updated At', false)
        ]);
        this.options_column_type.Build_('#component_columns_add select[name="column_type"]');
        this.options_column_type.Build_('#component_columns_modify select[name="column_type"]');

        this.options_link_to = new wtools.SelectOptions();
        this.options_link_to_init = (options, callback) => this.table.readAll().then((response_data) =>
        {
            try
            {
                let tmp_options = [];
                tmp_options.push(new wtools.OptionValue('', window.structbxI18n ? window.structbxI18n.t('base.none_option') : '-- None --', true));
                for(let row of response_data.body.data)
                    tmp_options.push(new wtools.OptionValue(row.identifier, row.name));

                options.options = tmp_options;
                options.Build_('#component_columns_add select[name="link_to"]');
                options.Build_('#component_columns_modify select[name="link_to"]');
                callback();
            }
            catch(error){
                new wtools.Notification('WARNING').Show_(window.structbxI18n ? window.structbxI18n.t('columns.link_tables_failed') : 'Could not access tables to link.');
                new wtools.Notification('WARNING', 0, '#component_columns_add .notifications').Show_(window.structbxI18n ? window.structbxI18n.t('columns.link_tables_failed') : 'Could not access tables to link.');
                new wtools.Notification('WARNING', 0, '#component_columns_modify .notifications').Show_(window.structbxI18n ? window.structbxI18n.t('columns.link_tables_failed') : 'Could not access tables to link.');
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
            ,`#component_columns_read .contents input.form-check-input`, (e) => {
                this.setVisible(e);
        });

        // Column type selection on/off
        const change_column_type = (target) => {
            if($(`${target} select[name=column_type]`).val() == ColumnType.Selection)
            {
                $(`${target} .link_to_tr`).removeClass('d-none');
                $(`${target} form select[name="link_to"]`).prop('disabled', false);
            } else {
                $(`${target} .link_to_tr`).addClass('d-none');
                $(`${target} form select[name="link_to"]`).val("");
                $(`${target} form select[name="link_to"]`).prop('disabled', true);
            }
        }
        $(document).on('change', `#component_columns_add select[name=column_type]`, () => {
            change_column_type('#component_columns_add');
        });
        $(document).on('change', `#component_columns_modify select[name=column_type]`, () => {
            change_column_type('#component_columns_modify');
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

        // Fetch table info to get id_column_display
        this.table.read(this.getTableIdentifier()).then((table_response) => {
            let id_column_display = '';
            if(table_response.body && table_response.body.data && table_response.body.data.length > 0){
                id_column_display = table_response.body.data[0].id_column_display || '';
            }

            // Request columns
            this.tableColumn.read(this.getTableIdentifier(), this.getViewIdentifier()).then((response_data) => {
                // Clean
                wait.Off_();
                $('#component_columns_read .notifications').html('');
                $(`#component_columns_read .contents`).html('');

                // Manage response
                const result = new ResponseManager(response_data, '#component_columns_read .notifications', 'target.columns_read');
                if(!result.Verify_())
                    return;

                // Handle zero results
                if(response_data.body.data.length < 1){
                    new wtools.Notification('SUCCESS', 0, '#component_columns_read .notifications').Show_(window.structbxI18n ? window.structbxI18n.t('table.no_results') : 'No results.');
                    return;
                }

                // Results elements creator
                $('#component_columns_read .notifications').html('');
                $(`#component_columns_read .contents`).html('');

                new wtools.UIElementsCreator(`#component_columns_read .contents`, response_data.body.data).Build_((row) =>{
                    let table_icon = new TableElements(row.column_type, undefined, '').GetIcon_();
                    let description_title = row.description ? row.description : row.column_type;
                    let required_mark = row.required == 1 ? ' <span class="text-danger fw-bold">*</span>' : '';
                    let default_text = row.default_value ? ' <small class="text-muted">(' + window.structbxI18n.t('table.default_label') + ': ' + row.default_value + ')</small>' : '';

                    let display_mark = '';
                    if(id_column_display && row.identifier === id_column_display){
                        let tooltip = window.structbxI18n ? window.structbxI18n.t('table.column_display_indicator') : 'Display column';
                        display_mark = ` <i class="fas fa-star ms-1" style="color:#f59e0b;font-size:0.7rem;" title="${tooltip}"></i>`;
                    }

                    // Add column
                    this.columns.push({identifier: row.identifier, name: row.name, icon: table_icon});

                    // DOM element
                    return `
                        <div column-identifier="${row.identifier}" class="ui-state-default p-0 dropdown-item d-flex align-items-center" style="cursor:pointer;">
                            <a column-identifier="${row.identifier}" href="#" class="py-2 ps-4 text-dark text-decoration-none flex-fill me-2" title="${description_title}">
                                <i class="fas fa-sort me-2"></i>${table_icon}${row.name}${required_mark}${display_mark}
                                <small class="text-muted ms-1">(${row.column_type})</small>${default_text}
                            </a>
                            <div class="form-check form-switch pe-4">
                                <input class="form-check-input" type="checkbox" ${row.visible == 1? 'checked' : ""} column-identifier="${row.identifier}" column-name="${row.name}">
                                <label class="form-check-label"><i class="fas fa-eye"></i></label>
                            </div>
                        </div>
                    `;
                });
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
            this.notification.add.Show_(window.structbxI18n ? window.structbxI18n.t('login.invalid_fields') : 'There are invalid fields.');
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
        if(column_type == ColumnType.Selection && (link_to == null || link_to == "" || link_to == undefined)){
            wait.Off_();
            this.notification.add.Show_('Debe especificar la tabla a enlazar.');
            return;
        }

        // Request
        this.tableColumn.add(this.getTableIdentifier(), column_name, column_type, description, required, default_value, link_to).then((response_data) =>
        {
            wait.Off_();

            // Manage response
            const result = new ResponseManager(response_data, '#component_columns_add .notifications', 'target.columns_add');
            if(!result.Verify_())
                return;

            this.notification.ok.Show_(window.structbxI18n ? window.structbxI18n.t('columns.column_created') : 'Column created successfully.');
            $('#component_columns_add').modal('hide');
            Tools.CleanForm($('#component_columns_add form'));
            this.read();
            this.onChanged();
        });
    }

    setVisible(e){
        let column_identifier = $(e.target).attr('column-identifier');
        let visible = $(e.target)[0].checked;

        // Request
        this.tableColumn.modifyVisible(column_identifier, this.getViewIdentifier(), visible ? 1 : 0).then((response_data) => {
            // Manage response
            const result = new ResponseManager(response_data, '#notifications', 'target.columns_visibility_modify');
            if(!result.Verify_())
                return;
            this.onChanged();
        });
    }

    setPosition(ui){
        let column_identifier = $(ui.item).attr('column-identifier');
        let columnPrev = $(ui.item).prev().attr('column-identifier');
        let columnNext = $(ui.item).next().attr('column-identifier');

        // Request
        this.tableColumn.modifyPosition(column_identifier, this.getViewIdentifier(), columnPrev, columnNext).then((response_data) =>{
            // Manage response
            const result = new ResponseManager(response_data, '#notifications', 'target.columns_position_modify');
            if(!result.Verify_())
                return;
            this.onChanged();
        });
    }

    preModify(e){
        // Wait animation
        let wait = new wtools.ElementState('#wait_animation_page', true, 'block', new wtools.WaitAnimation().for_page);

        // Get ID
        let identifier = $(e.currentTarget).attr('column-identifier');
        if(identifier == undefined){
            wait.Off_();
            new wtools.Notification('WARNING').Show_(window.structbxI18n ? window.structbxI18n.t('columns.column_identifier_not_found') : 'Column identifier not found.');
            return;
        }

        // Request
        $('#component_data_modify table tbody').html('');
        this.tableColumn.readByIdentifier(identifier, this.getTableIdentifier()).then((response_data) => {
            // Manage response
            const result = new ResponseManager(response_data, '', 'target.columns_modify');
            if(!result.Verify_())
                return;

            // Handle no results or zero results
            if(response_data.body.data.length < 1){
                new wtools.Notification('SUCCESS').Show_(window.structbxI18n ? window.structbxI18n.t('table.no_results') : 'No results.');
                return;
            }

            // Set data
            $('#component_columns_modify .identifier').text(response_data.body.data[0].identifier);
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
            new wtools.Notification('WARNING', 5000, '#component_columns_modify .notifications').Show_(window.structbxI18n ? window.structbxI18n.t('login.invalid_fields') : 'There are invalid fields.');
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
        if(column_type == ColumnType.Selection && (link_to == null || link_to == "" || link_to == undefined)){
            wait.Off_();
            this.notification.add.Show_(window.structbxI18n ? window.structbxI18n.t('columns.link_table_required') : 'You must specify the table to link.');
            return;
        }

        // Helper to resend the modify request with confirm_data_loss=true
        const resendWithConfirm = () => {
            let data = new FormData();
            data.append("identifier", identifier);
            data.append("table-identifier", this.getTableIdentifier());
            data.append("name", column_name);
            data.append("column_type", column_type);
            data.append("description", description);
            data.append("required", required);
            data.append("default_value", default_value);
            data.append("link_to", link_to);
            data.append("confirm_data_loss", "1");

            let new_wait = new wtools.ElementState('#component_columns_modify form button[type=submit]', true, 'button', new wtools.WaitAnimation().for_button);

            new wtools.Request("/api/tables/columns/modify", "PUT", data, false).Exec_().then((response_data2) => {
                new_wait.Off_();
                const result = new ResponseManager(response_data2, '#component_columns_modify .notifications', 'target.columns_modify');
                if(!result.Verify_())
                    return;

                new wtools.Notification('SUCCESS').Show_(window.structbxI18n ? window.structbxI18n.t('columns.column_updated') : 'Column updated successfully.');
                $('#component_columns_modify').modal('hide');
                this.onChanged();
                this.read();
            });
        };

        // Request
        this.tableColumn.modify(identifier, this.getTableIdentifier(), column_name, column_type, description, required, default_value, link_to).then((response_data) =>{
            wait.Off_();

            // Issue #1: Handle data loss warning from backend
            if(response_data.body && response_data.body.error_code && response_data.body.error_code.indexOf('data_loss_risk') !== -1)
            {
                let message = window.structbxI18n ? window.structbxI18n.t('columns.type_change_data_loss_warning') : 'Changing the column type may cause data loss. Existing data could be truncated or lost. Do you want to continue?';
                if(confirm(message))
                {
                    resendWithConfirm();
                }
                return;
            }

            // Manage response
            const result = new ResponseManager(response_data, '#component_columns_modify .notifications', 'target.columns_modify');
            if(!result.Verify_())
                return;

            new wtools.Notification('SUCCESS').Show_(window.structbxI18n ? window.structbxI18n.t('columns.column_updated') : 'Column updated successfully.');
            $('#component_columns_modify').modal('hide');
            this.onChanged();
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
            const result = new ResponseManager(response_data, '#component_columns_delete .notifications', 'target.columns_delete');
            if(!result.Verify_())
                return;

            new wtools.Notification('SUCCESS').Show_(window.structbxI18n ? window.structbxI18n.t('columns.column_deleted') : 'Column deleted.');
            $('#component_columns_delete').modal('hide');
            $('#component_columns_modify').modal('hide');
            this.read();
            this.onChanged();
        });
    }
}