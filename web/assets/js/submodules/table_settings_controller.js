import { BaseController } from '../modules/base_controller.js';
import { ResponseManager } from '../classes/response_manager.js';
import { I18n } from '../i18n/i18n.js';

import { Table } from '../models/Table.js';
import { TableColumn } from '../models/TableColumn.js';
import { TablePermission } from '../models/TablePermission.js';

export class TableSettingsController extends BaseController{
    constructor() {
        super();

        this.table = new Table;
        this.tableColumn = new TableColumn;
        this.tablePermission = new TablePermission;

        this.notification.read = new wtools.Notification('WARNING', 5000, '#component_settings_general .notifications');
        this.notification.add = new wtools.Notification('WARNING', 5000, '#component_settings_permissions_add .notifications');
        this.notification.modify = new wtools.Notification('WARNING', 5000, '#component_settings_permissions_modify .notifications');
        this.notification.delete = new wtools.Notification('WARNING', 5000, '#component_settings_delete .notifications');

        this.options_permissions = new wtools.SelectOptions([
            new wtools.OptionValue("0", window.structbxI18n ? window.structbxI18n.t('columns.no') : 'No', true),
            new wtools.OptionValue("1", window.structbxI18n ? window.structbxI18n.t('columns.yes') : 'Yes')
        ]);

        const perm_selectors = ['read', 'add', 'modify', 'delete', 'just_owner'];
        for(const perm of perm_selectors){
            this.options_permissions.Build_(`#component_settings_permissions_add select[name="${perm}"]`);
            this.options_permissions.Build_(`#component_settings_permissions_modify select[name="${perm}"]`);
        }

        this.options_public_form = new wtools.SelectOptions([
            new wtools.OptionValue("0", window.structbxI18n ? window.structbxI18n.t('columns.no') : 'No', true),
            new wtools.OptionValue("1", window.structbxI18n ? window.structbxI18n.t('columns.yes') : 'Yes')
        ]);
        this.options_public_form.Build_('#component_settings_general select[name="public_form"]');

        this.options_state = new wtools.SelectOptions([
            new wtools.OptionValue("active", window.structbxI18n ? window.structbxI18n.t('table_settings.state_active') : 'Active', true),
            new wtools.OptionValue("inactive", window.structbxI18n ? window.structbxI18n.t('table_settings.state_inactive') : 'Inactive')
        ]);
        this.options_state.Build_('#component_settings_general select[name="state"]');
    }

    build(){
    }

    bindEvents(){
        super.bindEvents();

        $(document).on('click', '.go_settings', (e) => {
            e.preventDefault();
            $('#component_settings').modal('show');
        });

        $(document).on('submit', '#component_settings_general form', e => this.modifySettings(e));

        $(document).on('click', '#component_settings_general_delete .delete', e => {
            e.preventDefault();
            this.preDeleteTable();
        });

        $(document).on('submit', '#component_settings_delete form', e => this.deleteTable(e));

        $(document).on('click', '#component_settings_permissions .add', e => {
            e.preventDefault();
            this.preAddPermission();
        });

        $(document).on('submit', '#component_settings_permissions_add form', e => this.addPermission(e));

        $(document).on('click', '#component_settings_permissions table tbody tr', e => {
            e.preventDefault();
            this.preModifyPermission(e);
        });

        $(document).on('submit', '#component_settings_permissions_modify form', e => this.modifyPermission(e));

        $(document).on('click', '#component_settings_permissions_modify .delete', e => {
            e.preventDefault();
            this.preDeletePermission();
        });

        $(document).on('submit', '#component_settings_permissions_delete form', e => this.deletePermission(e));
    }

    readSettings(){
        const wait = new wtools.ElementState('#component_settings_general .notifications', false, 'block', new wtools.WaitAnimation().for_block);
        const table_identifier = this.getTableIdentifier();
        if(table_identifier == undefined){
            wait.Off_();
            return;
        }
        this.table.read(table_identifier).then(response => {
            wait.Off_();
            $('#component_settings_general .notifications').html('');
            wtools.CleanForm($('#component_settings_general form'));
            const result = new ResponseManager(response, '#component_settings_general .notifications', 'target.settings_general');
            if(!result.Verify_()) return;
            if(response.body.data.length < 1){
                new wtools.Notification('SUCCESS', 5000, '#component_settings_general .notifications').Show_(window.structbxI18n ? window.structbxI18n.t('table.no_results') : 'No results.');
                return;
            }
            const row = response.body.data[0];
            $('#component_settings_general input[name="name"]').val(row.name);
            $('#component_settings_general select[name="public_form"]').val(row.public_form);
            $('#component_settings_general textarea[name="description"]').val(row.description);

            $('#component_settings_general select[name="state"]').val(row.state || 'active');
            $('#component_settings_general .table_identifier_display').text(row.identifier);
            $('#component_settings_general .table_created_at_display').text(row.created_at || '-');

            $('#component_settings_general span.link_form').html(`
                <a href="/form?identifier=${row.identifier}" target="_blank" class="mt-2 d-block form-link">
                    ${window.structbxI18n ? window.structbxI18n.t('table_settings.go_to_public_form') : 'Go to public form'}
                </a>
            `);

            this.populateColumnDisplaySelect(table_identifier, row.id_column_display);
        });
    }

    populateColumnDisplaySelect(table_identifier, current_value){
        const select = $('#component_settings_general select[name="id_column_display"]');
        const none_text = window.structbxI18n ? window.structbxI18n.t('table.settings_column_display_none') : 'None';
        select.html(`<option value="">${none_text}</option>`);

        this.tableColumn.read(table_identifier, '').then(response => {
            if(response.body.data == undefined || response.body.data.length < 1) return;
            for(const col of response.body.data){
                select.append(`<option value="${col.identifier}">${col.name}</option>`);
            }
            select.val(current_value || '');
        });
    }

    modifySettings(e){
        e.preventDefault();

        const wait = new wtools.ElementState('#component_settings_general form button[type=submit]', true, 'button', new wtools.WaitAnimation().for_button);

        const check = new wtools.FormChecker(e.target).Check_();
        if(!check){
            wait.Off_();
            $('#component_settings_general .notifications').html('');
            new wtools.Notification('WARNING', 5000, '#component_settings_general .notifications').Show_(window.structbxI18n ? window.structbxI18n.t('login.invalid_fields') : 'There are invalid fields.');
            return;
        }

        const table_identifier = this.getTableIdentifier();
        if(table_identifier == undefined){
            wait.Off_();
            new wtools.Notification('WARNING').Show_(window.structbxI18n ? window.structbxI18n.t('base.table_identifier_not_found') : 'Table identifier not found.');
            return;
        }

        const name = $('#component_settings_general input[name="name"]').val();
        const public_form = $('#component_settings_general select[name="public_form"]').val();
        const description = $('#component_settings_general textarea[name="description"]').val();
        const id_column_display = $('#component_settings_general select[name="id_column_display"]').val();
        const state = $('#component_settings_general select[name="state"]').val();

        this.table.modify(table_identifier, name, public_form, description, id_column_display, state).then(response => {
            wait.Off_();
            const result = new ResponseManager(response, '#component_settings_general .notifications', 'target.table_edit');
            if(!result.Verify_()) return;
            $('#component_settings_general .notifications').html('');
            new wtools.Notification('SUCCESS').Show_(window.structbxI18n ? window.structbxI18n.t('table_settings.table_updated') : 'Table updated successfully.');
            this.readSettings();
        });
    }

    preDeleteTable(){
        const table_name = $('#component_settings_general input[name="name"]').val();
        $('#component_settings_delete strong.header').html(table_name);
        $('#component_settings_delete strong.name').html(table_name);
        $('#component_settings_delete .notifications').html('');
        $('#component_settings_delete').modal('show');
    }

    deleteTable(e){
        e.preventDefault();

        const wait = new wtools.ElementState('#component_settings_delete form button[type=submit]', true, 'button', new wtools.WaitAnimation().for_button);

        const table_identifier = this.getTableIdentifier();
        if(table_identifier == undefined){
            wait.Off_();
            new wtools.Notification('WARNING').Show_(window.structbxI18n ? window.structbxI18n.t('base.table_identifier_not_found') : 'Table identifier not found.');
            return;
        }

        this.table.delete(table_identifier).then(response => {
            wait.Off_();
            const result = new ResponseManager(response, '#component_settings_delete .notifications', 'target.table_delete');
            if(!result.Verify_()) return;
            new wtools.Notification('SUCCESS').Show_(window.structbxI18n ? window.structbxI18n.t('table_settings.table_deleted') : 'Table deleted successfully.');
            window.location.href = `/`;
        });
    }

    readPermissions(){
        const wait = new wtools.ElementState('#component_settings_permissions .notifications', false, 'block', new wtools.WaitAnimation().for_block);

        const table_identifier = this.getTableIdentifier();
        if(table_identifier == undefined){
            wait.Off_();
            return;
        }

        this.tablePermission.read(table_identifier).then(response => {
            wait.Off_();
            $('#component_settings_permissions .notifications').html('');
            $('#component_settings_permissions table tbody').html('');

            const result = new ResponseManager(response, '#component_settings_permissions .notifications', 'target.settings_permissions');
            if(!result.Verify_()) return;

            if(response.body.data.length < 1){
                new wtools.Notification('SUCCESS', 5000, '#component_settings_permissions .notifications').Show_(window.structbxI18n ? window.structbxI18n.t('table.no_results') : 'No results.');
                return;
            }

            new wtools.UIElementsCreator('#component_settings_permissions table tbody', response.body.data).Build_(row => {
                const elements = [
                    `<th scope="row">${row.username}</th>`,
                    `<td scope="row">${this.options_permissions.ValueToOption_(row.read)}</td>`,
                    `<td scope="row">${this.options_permissions.ValueToOption_(row.add)}</td>`,
                    `<td scope="row">${this.options_permissions.ValueToOption_(row.modify)}</td>`,
                    `<td scope="row">${this.options_permissions.ValueToOption_(row.delete)}</td>`,
                    `<td scope="row">${this.options_permissions.ValueToOption_(row.just_owner)}</td>`
                ];
                return new wtools.UIElementsPackage(`<tr permission-identifier="${row.identifier}"></tr>`, elements).Pack_();
            });
        });
    }

    preAddPermission(){
        const table_identifier = this.getTableIdentifier();
        if(table_identifier == undefined){
            new wtools.Notification('WARNING').Show_(window.structbxI18n ? window.structbxI18n.t('base.table_identifier_not_found') : 'Table identifier not found.');
            return;
        }

        const select = new wtools.SelectOptions();
        this.tablePermission.readUsersOut(table_identifier).then(response => {
            try {
                const tmp = [];
                if(response.body.data.length < 1){
                    tmp.push(new wtools.OptionValue("", window.structbxI18n ? window.structbxI18n.t('settings.no_users_available') : 'No users available.'));
                } else {
                    for(const row of response.body.data){
                        tmp.push(new wtools.OptionValue(row.identifier, row.username));
                    }
                }
                select.options = tmp;
                select.Build_('#component_settings_permissions_add select[name="id_user"]');
                $('#component_settings_permissions_add .notifications').html('');
                $('#component_settings_permissions_add form select[name="read"]').val("1");
                $('#component_settings_permissions_add form select[name="add"]').val("1");
                $('#component_settings_permissions_add form select[name="modify"]').val("1");
                $('#component_settings_permissions_add form select[name="delete"]').val("1");
                $('#component_settings_permissions_add form select[name="just_owner"]').val("0");
                $('#component_settings_permissions_add').modal('show');
            } catch(error){
                new wtools.Notification('WARNING').Show_(window.structbxI18n ? window.structbxI18n.t('table_settings.db_users_failed') : 'Could not access database users.');
                new wtools.Notification('WARNING', 0, '#component_settings_permissions_add .notifications').Show_(window.structbxI18n ? window.structbxI18n.t('table_settings.db_users_failed') : 'Could not access database users.');
            }
        });
    }

    addPermission(e){
        e.preventDefault();

        const wait = new wtools.ElementState('#component_settings_permissions_add form button[type=submit]', true, 'button', new wtools.WaitAnimation().for_button);

        const check = new wtools.FormChecker(e.target).Check_();
        if(!check){
            $('#component_settings_permissions_add .notifications').html('');
            wait.Off_();
            new wtools.Notification('WARNING', 5000, '#component_settings_permissions_add .notifications').Show_(window.structbxI18n ? window.structbxI18n.t('login.invalid_fields') : 'There are invalid fields.');
            return;
        }

        const data = new FormData($('#component_settings_permissions_add form')[0]);
        data.append('table-identifier', this.getTableIdentifier());

        this.tablePermission.add(data).then(response => {
            wait.Off_();
            const result = new ResponseManager(response, '#component_settings_permissions_add .notifications', 'target.table_permissions_add');
            if(!result.Verify_()) return;
            new wtools.Notification('SUCCESS').Show_(window.structbxI18n ? window.structbxI18n.t('table_settings.permission_created') : 'Table permission created successfully.');
            this.readPermissions();
            $('#component_settings_permissions_add').modal('hide');
        });
    }

    preModifyPermission(e){
        const wait = new wtools.ElementState('#wait_animation_page', true, 'block', new wtools.WaitAnimation().for_page);

        const table_identifier = this.getTableIdentifier();
        if(table_identifier == undefined){
            wait.Off_();
            new wtools.Notification('WARNING').Show_(window.structbxI18n ? window.structbxI18n.t('base.table_identifier_not_found') : 'Table identifier not found.');
            return;
        }

        const identifier = $(e.currentTarget).attr('permission-identifier');
        if(identifier == undefined){
            wait.Off_();
            new wtools.Notification('WARNING').Show_(window.structbxI18n ? window.structbxI18n.t('table_settings.permission_identifier_not_found') : 'Table permission identifier not found.');
            return;
        }

        this.tablePermission.readByIdentifier(identifier, table_identifier).then(response => {
            const result = new ResponseManager(response, '', 'target.table_permissions_modify');
            if(!result.Verify_()){
                wait.Off_();
                return;
            }

            if(response.body.data.length < 1){
                new wtools.Notification('WARNING').Show_(window.structbxI18n ? window.structbxI18n.t('table_settings.permission_not_found') : 'Table permission not found.');
                wait.Off_();
                return;
            }

            $('#component_settings_permissions_modify input[name="identifier"]').val(response.body.data[0].identifier);
            $('#component_settings_permissions_modify input[name="id_user"]').val(response.body.data[0].username);
            $('#component_settings_permissions_modify select[name="read"]').val(response.body.data[0].read);
            $('#component_settings_permissions_modify select[name="add"]').val(response.body.data[0].add);
            $('#component_settings_permissions_modify select[name="modify"]').val(response.body.data[0].modify);
            $('#component_settings_permissions_modify select[name="delete"]').val(response.body.data[0].delete);
            $('#component_settings_permissions_modify select[name="just_owner"]').val(response.body.data[0].just_owner);

            wait.Off_();
            $('#component_settings_permissions_modify form').removeClass('was-validated');
            $('#component_settings_permissions_modify').modal('show');
        });
    }

    modifyPermission(e){
        e.preventDefault();

        const wait = new wtools.ElementState('#component_settings_permissions_modify form button[type=submit]', true, 'button', new wtools.WaitAnimation().for_button);

        const check = new wtools.FormChecker(e.target).Check_();
        if(!check){
            $('#component_settings_permissions_modify .notifications').html('');
            wait.Off_();
            new wtools.Notification('WARNING', 5000, '#component_settings_permissions_modify .notifications').Show_(window.structbxI18n ? window.structbxI18n.t('login.invalid_fields') : 'There are invalid fields.');
            return;
        }

        const data = new FormData($('#component_settings_permissions_modify form')[0]);
        data.append('table-identifier', this.getTableIdentifier());

        this.tablePermission.modify(data).then(response => {
            wait.Off_();
            const result = new ResponseManager(response, '#component_settings_permissions_modify .notifications', 'target.table_permission_modify');
            if(!result.Verify_()) return;
            new wtools.Notification('SUCCESS').Show_(window.structbxI18n ? window.structbxI18n.t('table_settings.permission_updated') : 'Table permission updated successfully.');
            $('#component_settings_permissions_modify').modal('hide');
            this.readPermissions();
        });
    }

    preDeletePermission(){
        const data = new FormData($('#component_settings_permissions_modify form')[0]);
        const identifier = data.get('identifier');
        $('#component_settings_permissions_delete input[name=identifier]').val(identifier);
        $('#component_settings_permissions_delete').modal('show');
    }

    deletePermission(e){
        e.preventDefault();

        const wait = new wtools.ElementState('#component_settings_permissions_delete form button[type=submit]', true, 'button', new wtools.WaitAnimation().for_button);

        const table_identifier = this.getTableIdentifier();
        if(table_identifier == undefined){
            wait.Off_();
            new wtools.Notification('WARNING').Show_(window.structbxI18n ? window.structbxI18n.t('base.table_identifier_not_found') : 'Table identifier not found.');
            return;
        }

        const identifier = $('#component_settings_permissions_delete input[name=identifier]').val();

        this.tablePermission.delete(identifier, table_identifier).then(response => {
            wait.Off_();
            const result = new ResponseManager(response, '#component_settings_permissions_delete .notifications', 'target.table_permission_delete');
            if(!result.Verify_()) return;
            new wtools.Notification('SUCCESS').Show_(window.structbxI18n ? window.structbxI18n.t('table_settings.permission_deleted') : 'Table permission deleted.');
            $('#component_settings_permissions_delete').modal('hide');
            $('#component_settings_permissions_modify').modal('hide');
            this.readPermissions();
        });
    }
}
