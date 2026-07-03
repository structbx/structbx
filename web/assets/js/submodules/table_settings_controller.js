import { BaseController } from '../modules/base_controller.js';
import { ResponseManager } from '../classes/response_manager.js';
import { I18n } from '../i18n/i18n.js';

import { Table } from '../models/Table.js';
import { TableColumn } from '../models/TableColumn.js';
import { TablePermission } from '../models/TablePermission.js';
import { RowPolicy } from '../models/RowPolicy.js';
import { User } from '../models/User.js';
import { Group } from '../models/Group.js';

export class TableSettingsController extends BaseController{
    constructor() {
        super();

        this.table = new Table;
        this.tableColumn = new TableColumn;
        this.tablePermission = new TablePermission;
        this.rowPolicy = new RowPolicy;
        this.user = new User;
        this.group = new Group;

        this.notification.read = new wtools.Notification('WARNING', 5000, '#component_settings_general .notifications');
        this.notification.add = new wtools.Notification('WARNING', 5000, '#component_settings_permissions_add .notifications');
        this.notification.modify = new wtools.Notification('WARNING', 5000, '#component_settings_permissions_modify .notifications');
        this.notification.delete = new wtools.Notification('WARNING', 5000, '#component_settings_delete .notifications');
        this.notification.row_policy_add = new wtools.Notification('WARNING', 5000, '#component_settings_row_policies_add .notifications');
        this.notification.row_policy_modify = new wtools.Notification('WARNING', 5000, '#component_settings_row_policies_modify .notifications');
        this.notification.row_policy_delete = new wtools.Notification('WARNING', 5000, '#component_settings_row_policies_delete .notifications');

        this.options_permissions = new wtools.SelectOptions([
            new wtools.OptionValue("0", window.structbxI18n ? window.structbxI18n.t('columns.no') : 'No', true),
            new wtools.OptionValue("1", window.structbxI18n ? window.structbxI18n.t('columns.yes') : 'Yes')
        ]);

        const perm_selectors = ['read', 'add', 'modify', 'delete'];
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

        $(document).on('click', '#component_settings_row_policies .add', e => {
            e.preventDefault();
            this.preAddRowPolicy();
        });

        $(document).on('change', '#component_settings_row_policies_add select[name="target_type"]', e => this.toggleTargetIdInput(e));
        $(document).on('change', '#component_settings_row_policies_add select[name="action_type"]', e => this.toggleFilterRows(e));
        $(document).on('change', '#component_settings_row_policies_add .filter-column-path-container select', e => this.onPathLevelChange(e));
        $(document).on('change', '#component_settings_row_policies_modify select[name="target_type"]', e => this.toggleTargetIdInput(e));
        $(document).on('change', '#component_settings_row_policies_modify select[name="action_type"]', e => this.toggleFilterRows(e));
        $(document).on('change', '#component_settings_row_policies_modify .filter-column-path-container select', e => this.onPathLevelChange(e));

        $(document).on('submit', '#component_settings_row_policies_add form', e => this.addRowPolicy(e));

        $(document).on('click', '#component_settings_row_policies table tbody tr', e => {
            e.preventDefault();
            this.preModifyRowPolicy(e);
        });

        $(document).on('submit', '#component_settings_row_policies_modify form', e => this.modifyRowPolicy(e));

        $(document).on('click', '#component_settings_row_policies_modify .delete', e => {
            e.preventDefault();
            this.preDeleteRowPolicy();
        });

        $(document).on('submit', '#component_settings_row_policies_delete form', e => this.deleteRowPolicy(e));
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
            this.readPermissions();
            this.readRowPolicies();
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
                    `<td scope="row">${this.options_permissions.ValueToOption_(row.delete)}</td>`
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

    readRowPolicies(){
        const wait = new wtools.ElementState('#component_settings_row_policies .notifications', false, 'block', new wtools.WaitAnimation().for_block);

        const table_identifier = this.getTableIdentifier();
        if(table_identifier == undefined){
            wait.Off_();
            return;
        }

        this.rowPolicy.read(table_identifier).then(response => {
            wait.Off_();
            $('#component_settings_row_policies .notifications').html('');
            $('#component_settings_row_policies table tbody').html('');

            const result = new ResponseManager(response, '#component_settings_row_policies .notifications', 'target.settings_row_policies');
            if(!result.Verify_()) return;

            if(response.body.data.length < 1){
                new wtools.Notification('SUCCESS', 5000, '#component_settings_row_policies .notifications').Show_(window.structbxI18n ? window.structbxI18n.t('table.no_results') : 'No results.');
                return;
            }

            new wtools.UIElementsCreator('#component_settings_row_policies table tbody', response.body.data).Build_(row => {
                const target_label = row.target_type == 'all'
                    ? (window.structbxI18n ? window.structbxI18n.t('table.settings_row_policy_target_all') : 'All')
                    : row.target_type + ': ' + (row.target_id || '-');
                const action_label = row.action_type == 'bypass'
                    ? (window.structbxI18n ? window.structbxI18n.t('table.settings_row_policy_action_bypass') : 'Bypass')
                    : (window.structbxI18n ? window.structbxI18n.t('table.settings_row_policy_action_filter') : 'Filter');
                const columnDisplay = row.filter_column_name
                    ? row.filter_column_name + ' (' + row.filter_column + ')'
                    : row.filter_column;
                const condition = row.action_type == 'filter'
                    ? (columnDisplay + ' ' + row.filter_operator + ' ' + row.filter_value)
                    : '-';
                const active = row.is_active == 1
                    ? (window.structbxI18n ? window.structbxI18n.t('columns.yes') : 'Yes')
                    : (window.structbxI18n ? window.structbxI18n.t('columns.no') : 'No');

                const elements = [
                    `<th scope="row">${row.policy_name || '-'}</th>`,
                    `<td>${target_label}</td>`,
                    `<td>${action_label}</td>`,
                    `<td>${condition}</td>`,
                    `<td>${active}</td>`
                ];
                return new wtools.UIElementsPackage(`<tr policy-identifier="${row.identifier}"></tr>`, elements).Pack_();
            });
        });
    }

    preAddRowPolicy(){
        const table_identifier = this.getTableIdentifier();
        if(table_identifier == undefined){
            new wtools.Notification('WARNING').Show_(window.structbxI18n ? window.structbxI18n.t('base.table_identifier_not_found') : 'Table identifier not found.');
            return;
        }

        const container = $('#component_settings_row_policies_add .filter-column-path-container');
        const hiddenInput = $('#component_settings_row_policies_add input[name="filter_column"]');
        this.renderColumnPathSelects(container, hiddenInput, table_identifier, '', (lastColType, lastLinkTo) => {
            $('#component_settings_row_policies_add .notifications').html('');
            wtools.CleanForm($('#component_settings_row_policies_add form'));
            $('#component_settings_row_policies_add select[name="is_active"]').val("1");
            $('#component_settings_row_policies_add select[name="priority"]').val("0");
            $('#component_settings_row_policies_add .target-id-row').addClass('d-none');
            $('#component_settings_row_policies_add .target-id-wrapper').html('');
            $('#component_settings_row_policies_add select[name="target_type"]').val('all');
            $('#component_settings_row_policies_add .filter-row').show();
            this.populateFilterValueField(
                $('#component_settings_row_policies_add .filter-value-wrapper'),
                '',
                '',
                ''
            );
            $('#component_settings_row_policies_add').modal('show');
        });
    }

    populateTargetIdField(container, targetType, selectedValue){
        container.html('');
        if(targetType == 'all') return;

        if(targetType == 'user'){
            const select = $('<select class="form-select" name="target_id" required></select>');
            select.append('<option value="">' + (window.structbxI18n ? window.structbxI18n.t('table.settings_row_policy_select_user') : 'Select user...') + '</option>');
            container.append(select);
            this.user.readAll().then(response => {
                if(response.body.data){
                    for(const user of response.body.data){
                        select.append(`<option value="${user.identifier}">${user.username}</option>`);
                    }
                }
                if(selectedValue) select.val(selectedValue);
            });
        } else if(targetType == 'group'){
            const select = $('<select class="form-select" name="target_id" required></select>');
            select.append('<option value="">' + (window.structbxI18n ? window.structbxI18n.t('table.settings_row_policy_select_group') : 'Select group...') + '</option>');
            container.append(select);
            this.group.readAll().then(response => {
                if(response.body.data){
                    for(const group of response.body.data){
                        select.append(`<option value="${group.identifier}">${group.group}</option>`);
                    }
                }
                if(selectedValue) select.val(selectedValue);
            });
            } else if(targetType == 'user_type'){
                const select = $('<select class="form-select" name="target_id" required></select>');
                select.append('<option value="admin">admin</option>');
                select.append('<option value="default">default</option>');
                container.append(select);
                if(selectedValue) select.val(selectedValue);
            }
        }

        populateFilterValueField(wrapper, columnType, linkTo, selectedValue){
            wrapper.html('');
            if(columnType == 'selection' || columnType == 'user' || columnType == 'current-user'){
                const select = $('<select class="form-select" name="filter_value"></select>');
                select.append('<option value="">' + (window.structbxI18n ? window.structbxI18n.t('table.settings_row_policy_select_value') : 'Select value or placeholder...') + '</option>');
                select.append('<option value="{current_user_id}">{current_user_id}</option>');
                select.append('<option value="{current_username}">{current_username}</option>');
                select.append('<option value="{user_type}">{user_type}</option>');
                select.append('<option value="{user_group}">{user_group}</option>');
                select.append('<option value="" disabled>──────────</option>');
                wrapper.append(select);
                if(columnType == 'user' || columnType == 'current-user'){
                    this.user.readAll().then(response => {
                        if(response.body.data){
                            for(const user of response.body.data){
                                select.append(`<option value="${user.identifier}">${user.username}</option>`);
                            }
                        }
                        if(selectedValue) select.val(selectedValue);
                    });
                } else if(columnType == 'selection' && linkTo){
                    this.linkSelectionOptionsSimple(select, linkTo, selectedValue);
                }
            } else {
                const input = $('<input type="text" class="form-control" name="filter_value" placeholder="e.g. {current_user_id}">');
                wrapper.append(input);
                if(selectedValue) input.val(selectedValue);
            }
        }

        linkSelectionOptionsSimple(select, linkTo, selectedValue){
            this.table_data.readToLinkSelectionOptions(linkTo, '').then(response => {
                if(response.body.data && response.body.columns && response.body.columns.length > 1){
                    const idCol = response.body.columns[0];
                    const displayCol = response.body.columns[1];
                    for(const row of response.body.data){
                        select.append(`<option value="${row[idCol]}">${row[displayCol] || row[idCol]}</option>`);
                    }
                }
                if(selectedValue) select.val(selectedValue);
            });
        }

        renderColumnPathSelects(container, hiddenInput, tableIdentifier, existingPath, callback){
            container.html('');
            hiddenInput.val('');

            const segments = existingPath ? existingPath.split('>') : [];
            this.tableColumn.read(tableIdentifier, '').then(response => {
                if(!response.body.data || response.body.data.length === 0){
                    if(callback) callback('', '');
                    return;
                }
                const columns = response.body.data;
                this._buildPathLevel(container, hiddenInput, columns, tableIdentifier, segments, 0, callback);
            });
        }

        _buildPathLevel(container, hiddenInput, columns, tableIdentifier, segments, level, callback){
            const select = $(`<select class="form-select form-select-sm mb-1" data-level="${level}"></select>`);
            select.append('<option value="">' + (window.structbxI18n ? window.structbxI18n.t('table.settings_row_policy_select_column') : 'Select column...') + '</option>');
            for(const col of columns){
                const selected = (segments[level] === col.identifier) ? ' selected' : '';
                select.append(`<option value="${col.identifier}" data-column-type="${col.column_type || ''}" data-link-to="${col.link_to || ''}" data-table-name="${col.link_to_table_name || ''}"${selected}>${col.name}</option>`);
            }
            container.append(select);
            this._updatePathAndContinue(container, hiddenInput, columns, tableIdentifier, segments, level, callback);
        }

        _updatePathAndContinue(container, hiddenInput, columns, tableIdentifier, segments, level, callback){
            const selects = container.find('select');
            const path = [];
            let lastColType = '';
            let lastLinkTo = '';
            selects.each(function(){
                const val = $(this).val();
                if(val){
                    path.push(val);
                    const opt = $(this).find('option:selected');
                    lastColType = opt.data('column-type') || '';
                    lastLinkTo = opt.data('link-to') || '';
                }
            });
            hiddenInput.val(path.join('>'));

            const currentSelect = container.find(`select[data-level="${level}"]`);
            if(!currentSelect.val()){
                if(callback) callback(lastColType, lastLinkTo);
                return;
            }

            const isLastSegment = (level === segments.length - 1);
            if(!isLastSegment && lastColType === 'selection' && lastLinkTo){
                this.tableColumn.read(lastLinkTo, '').then(linkedResp => {
                    if(linkedResp.body.data){
                        this._buildPathLevel(container, hiddenInput, linkedResp.body.data, tableIdentifier, segments, level + 1, callback);
                    }
                });
            } else if(level < segments.length - 1){
                const nextTable = lastLinkTo || tableIdentifier;
                this.tableColumn.read(nextTable, '').then(linkedResp => {
                    if(linkedResp.body.data){
                        this._buildPathLevel(container, hiddenInput, linkedResp.body.data, tableIdentifier, segments, level + 1, callback);
                    }
                });
            } else {
                if(callback) callback(lastColType, lastLinkTo);
            }
        }

        onPathLevelChange(e){
            const changedSelect = $(e.currentTarget);
            const modal = changedSelect.closest('.modal');
            const container = modal.find('.filter-column-path-container');
            const hiddenInput = modal.find('input[name="filter_column"]');
            const level = parseInt(changedSelect.data('level'));
            const selectedOption = changedSelect.find('option:selected');
            const columnType = selectedOption.data('column-type') || '';
            const linkTo = selectedOption.data('link-to') || '';

            container.find('select').each(function(){
                if(parseInt($(this).data('level')) > level){
                    $(this).remove();
                }
            });

            const selects = container.find('select');
            const path = [];
            selects.each(function(){
                const val = $(this).val();
                if(val) path.push(val);
            });
            hiddenInput.val(path.join('>'));

            if(columnType === 'selection' && linkTo){
                const tableIdentifier = this.getTableIdentifier();
                this.tableColumn.read(tableIdentifier, '').then(response => {
                    if(!response.body.data) return;
                    this.tableColumn.read(linkTo, '').then(linkedResp => {
                        if(linkedResp.body.data){
                            this._buildPathLevel(container, hiddenInput, linkedResp.body.data, tableIdentifier, [], level + 1, (lastType, lastLink) => {
                                const wrapper = modal.find('.filter-value-wrapper');
                                this.populateFilterValueField(wrapper, lastType || columnType, lastLink || linkTo, '');
                            });
                        }
                    });
                });
            } else {
                const wrapper = modal.find('.filter-value-wrapper');
                this.populateFilterValueField(wrapper, columnType, linkTo, '');
            }
        }

        toggleTargetIdInput(e){
        const target_type = $(e.currentTarget).val();
        const modal = $(e.currentTarget).closest('.modal');
        const container = modal.find('.target-id-wrapper');
        if(target_type == 'all'){
            modal.find('.target-id-row').addClass('d-none');
            container.html('');
        } else {
            modal.find('.target-id-row').removeClass('d-none');
            this.populateTargetIdField(container, target_type);
        }
    }

    toggleFilterRows(e){
        const action_type = $(e.currentTarget).val();
        const modal = $(e.currentTarget).closest('.modal');
        if(action_type == 'bypass'){
            modal.find('.filter-row').hide();
        } else {
            modal.find('.filter-row').show();
        }
    }

    addRowPolicy(e){
        e.preventDefault();

        const wait = new wtools.ElementState('#component_settings_row_policies_add form button[type=submit]', true, 'button', new wtools.WaitAnimation().for_button);

        const check = new wtools.FormChecker(e.target).Check_();
        if(!check){
            $('#component_settings_row_policies_add .notifications').html('');
            wait.Off_();
            new wtools.Notification('WARNING', 5000, '#component_settings_row_policies_add .notifications').Show_(window.structbxI18n ? window.structbxI18n.t('login.invalid_fields') : 'There are invalid fields.');
            return;
        }

        const data = new FormData($('#component_settings_row_policies_add form')[0]);
        data.append('table-identifier', this.getTableIdentifier());

        this.rowPolicy.add(data).then(response => {
            wait.Off_();
            const result = new ResponseManager(response, '#component_settings_row_policies_add .notifications', 'target.row_policy_add');
            if(!result.Verify_()) return;
            new wtools.Notification('SUCCESS').Show_(window.structbxI18n ? window.structbxI18n.t('table_settings.row_policy_created') : 'Row policy created successfully.');
            this.readRowPolicies();
            $('#component_settings_row_policies_add').modal('hide');
        });
    }

    preModifyRowPolicy(e){
        const wait = new wtools.ElementState('#wait_animation_page', true, 'block', new wtools.WaitAnimation().for_page);

        const table_identifier = this.getTableIdentifier();
        if(table_identifier == undefined){
            wait.Off_();
            new wtools.Notification('WARNING').Show_(window.structbxI18n ? window.structbxI18n.t('base.table_identifier_not_found') : 'Table identifier not found.');
            return;
        }

        const identifier = $(e.currentTarget).attr('policy-identifier');
        if(identifier == undefined){
            wait.Off_();
            new wtools.Notification('WARNING').Show_(window.structbxI18n ? window.structbxI18n.t('table_settings.policy_identifier_not_found') : 'Row policy identifier not found.');
            return;
        }

        this.rowPolicy.readByIdentifier(identifier).then(response => {
            const result = new ResponseManager(response, '', 'target.row_policy_modify');
            if(!result.Verify_()){
                wait.Off_();
                return;
            }

            if(response.body.data.length < 1){
                new wtools.Notification('WARNING').Show_(window.structbxI18n ? window.structbxI18n.t('table_settings.policy_not_found') : 'Row policy not found.');
                wait.Off_();
                return;
            }

            const data = response.body.data[0];
            $('#component_settings_row_policies_modify input[name="identifier"]').val(data.identifier);
            $('#component_settings_row_policies_modify input[name="policy_name"]').val(data.policy_name || '');
            $('#component_settings_row_policies_modify select[name="target_type"]').val(data.target_type);
            $('#component_settings_row_policies_modify select[name="action_type"]').val(data.action_type);
            $('#component_settings_row_policies_modify select[name="is_active"]').val(String(data.is_active));
            $('#component_settings_row_policies_modify input[name="priority"]').val(data.priority || 0);

            if(data.target_type == 'all'){
                $('#component_settings_row_policies_modify .target-id-row').addClass('d-none');
                $('#component_settings_row_policies_modify .target-id-wrapper').html('');
            } else {
                $('#component_settings_row_policies_modify .target-id-row').removeClass('d-none');
            }

            if(data.action_type == 'bypass'){
                $('#component_settings_row_policies_modify .filter-row').hide();
            } else {
                $('#component_settings_row_policies_modify .filter-row').show();
            }

            const filterPathContainer = $('#component_settings_row_policies_modify .filter-column-path-container');
            const filterHiddenInput = $('#component_settings_row_policies_modify input[name="filter_column"]');
            const filterPath = data.filter_column || '';

            this.renderColumnPathSelects(filterPathContainer, filterHiddenInput, table_identifier, filterPath, (lastColType, lastLinkTo) => {
                $('#component_settings_row_policies_modify select[name="filter_operator"]').val(data.filter_operator || '=');
                this.populateFilterValueField(
                    $('#component_settings_row_policies_modify .filter-value-wrapper'),
                    lastColType,
                    lastLinkTo,
                    data.filter_value || ''
                );

                this.populateTargetIdField(
                    $('#component_settings_row_policies_modify .target-id-wrapper'),
                    data.target_type,
                    data.target_id || ''
                );

                wait.Off_();
                $('#component_settings_row_policies_modify form').removeClass('was-validated');
                $('#component_settings_row_policies_modify').modal('show');
            });
        });
    }

    modifyRowPolicy(e){
        e.preventDefault();

        const wait = new wtools.ElementState('#component_settings_row_policies_modify form button[type=submit]', true, 'button', new wtools.WaitAnimation().for_button);

        const check = new wtools.FormChecker(e.target).Check_();
        if(!check){
            $('#component_settings_row_policies_modify .notifications').html('');
            wait.Off_();
            new wtools.Notification('WARNING', 5000, '#component_settings_row_policies_modify .notifications').Show_(window.structbxI18n ? window.structbxI18n.t('login.invalid_fields') : 'There are invalid fields.');
            return;
        }

        const data = new FormData($('#component_settings_row_policies_modify form')[0]);
        data.append('table-identifier', this.getTableIdentifier());

        this.rowPolicy.modify(data).then(response => {
            wait.Off_();
            const result = new ResponseManager(response, '#component_settings_row_policies_modify .notifications', 'target.row_policy_modify');
            if(!result.Verify_()) return;
            new wtools.Notification('SUCCESS').Show_(window.structbxI18n ? window.structbxI18n.t('table_settings.row_policy_updated') : 'Row policy updated successfully.');
            $('#component_settings_row_policies_modify').modal('hide');
            this.readRowPolicies();
        });
    }

    preDeleteRowPolicy(){
        const data = new FormData($('#component_settings_row_policies_modify form')[0]);
        const identifier = data.get('identifier');
        $('#component_settings_row_policies_delete input[name=identifier]').val(identifier);
        $('#component_settings_row_policies_delete').modal('show');
    }

    deleteRowPolicy(e){
        e.preventDefault();

        const wait = new wtools.ElementState('#component_settings_row_policies_delete form button[type=submit]', true, 'button', new wtools.WaitAnimation().for_button);

        const table_identifier = this.getTableIdentifier();
        if(table_identifier == undefined){
            wait.Off_();
            new wtools.Notification('WARNING').Show_(window.structbxI18n ? window.structbxI18n.t('base.table_identifier_not_found') : 'Table identifier not found.');
            return;
        }

        const identifier = $('#component_settings_row_policies_delete input[name=identifier]').val();

        this.rowPolicy.delete(identifier, table_identifier).then(response => {
            wait.Off_();
            const result = new ResponseManager(response, '#component_settings_row_policies_delete .notifications', 'target.row_policy_delete');
            if(!result.Verify_()) return;
            new wtools.Notification('SUCCESS').Show_(window.structbxI18n ? window.structbxI18n.t('table_settings.row_policy_deleted') : 'Row policy deleted.');
            $('#component_settings_row_policies_delete').modal('hide');
            $('#component_settings_row_policies_modify').modal('hide');
            this.readRowPolicies();
        });
    }
}
