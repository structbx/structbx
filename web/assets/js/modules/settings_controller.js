import { BaseController } from './base_controller.js';
import * as Tools from '../classes/tools.js';
import * as DOME from '../classes/dom_elements.js';
import { ResponseManager } from '../classes/response_manager.js';
import { TableElements } from '../classes/table_elements.js';
import { I18n } from '../i18n/i18n.js';

// Data models
import { Session } from '../models/Session.js';
import { Instance } from '../models/Instance.js';
import { Group } from '../models/Group.js';
import { Permission } from '../models/Permission.js';
import { User } from '../models/User.js';
import { Database } from '../models/Database.js';
import { DatabaseUser } from '../models/DatabaseUser.js';

export class SettingsController extends BaseController{
    constructor() {
        super();

        // Models
        this.session = new Session;
        this.instance = new Instance;
        this.group = new Group;
        this.permission = new Permission;
        this.user = new User;
        this.database = new Database;
        this.databaseUser = new DatabaseUser;
        this.currentDatabaseIdentifier = null;
        this.currentDatabaseName = null;
        this.currentDatabaseDescription = null;

        // Notifications for each entity
        this.notifications = {
            groups: {
                read: new wtools.Notification('WARNING', 5000, '#component_groups_read .notifications'),
                add: new wtools.Notification('WARNING', 5000, '#component_groups_add .notifications'),
                modify: new wtools.Notification('WARNING', 5000, '#component_groups_modify .notifications'),
                delete: new wtools.Notification('WARNING', 5000, '#component_groups_delete .notifications')
            },
            permissions: {
                read: new wtools.Notification('WARNING', 5000, '#component_permissions_read .notifications'),
                add: new wtools.Notification('WARNING', 5000, '#component_permissions_add .notifications'),
                delete: new wtools.Notification('WARNING', 5000, '#component_permissions_delete .notifications')
            },
            users: {
                read: new wtools.Notification('WARNING', 5000, '#component_users_read .notifications'),
                add: new wtools.Notification('WARNING', 5000, '#component_users_add .notifications'),
                modify: new wtools.Notification('WARNING', 5000, '#component_users_modify .notifications'),
                delete: new wtools.Notification('WARNING', 5000, '#component_users_delete .notifications'),
                current: new wtools.Notification('WARNING', 5000, '#component_my_account_general .notifications'),
                changePassword: new wtools.Notification('WARNING', 5000, '#component_my_account_change_password .notifications')
            },
            databases: {
                read: new wtools.Notification('WARNING', 5000, '#component_databases_read .notifications'),
                add: new wtools.Notification('WARNING', 5000, '#component_databases_add .notifications'),
                modify: new wtools.Notification('WARNING', 5000, '#component_databases_modify .notifications'),
                delete: new wtools.Notification('WARNING', 5000, '#component_databases_delete .notifications')
            },
            databasesUsers: {
                read: new wtools.Notification('WARNING', 5000, '#component_databases_users_read .notifications'),
                add: new wtools.Notification('WARNING', 5000, '#component_databases_users_add .notifications'),
                delete: new wtools.Notification('WARNING', 5000, '#component_databases_users_delete .notifications')
            },
            apikey: {
                read: new wtools.Notification('WARNING', 5000, '#component_my_account_apikey .notifications'),
                generate: new wtools.Notification('WARNING', 5000, '#component_my_account_apikey .notifications'),
                revoke: new wtools.Notification('WARNING', 5000, '#component_my_account_apikey .notifications')
            }
        }

        this.options_user_status = new wtools.SelectOptions
        ([
            new wtools.OptionValue("active", window.structbxI18n ? window.structbxI18n.t('start.active') : 'Active', true)
            ,new wtools.OptionValue("inactive", window.structbxI18n ? window.structbxI18n.t('start.inactive') : 'Inactive')
        ]);
        this.options_user_status.Build_('#component_users_add select[name="status"]');
        this.options_user_status.Build_('#component_users_modify select[name="status"]');

    }

    build() {
        // Wait animation
        let wait = new wtools.ElementState('#wait_animation_page', true, 'block', new wtools.WaitAnimation().for_page);

        super.verifySession().then((result) => {
            if(!result){
                new wtools.ElementState('#wait_animation_page', true, 'block', new wtools.WaitAnimation().for_page);
                window.location.href = "/login/";
                return;
            }
        });

        new DOME.Headers().header();
        new DOME.Footers().footer();
        new wtools.MenuManager('#section_settings .sidebar', true);

        super.hideWithoutPermission();
        super.readInstanceName();
        super.readCurrentDatabase();
        super.readCurrentUser();

        this.readInstanceName();
        this.readGroups();
        this.readUsers();
        this.readCurrentUser();
        this.readApiKey();
        this.readDatabases();
        this.initPermissionsGroupSelect();

        wait.Off_();
    }

    bindEvents(){
        super.bindEvents();

        // ---- INSTANCE ----
        $(document).on('submit', '#component_instance_name_read form', (e) => {
            e.preventDefault();
            this.modifyInstanceName();
        });
        $(document).on('submit', '#component_instance_logo_read form', (e) => {
            e.preventDefault();
            this.modifyInstanceLogo();
        });

        // ---- USERS ----
        $(document).on('click', '#component_users_read .add', () => {
            this.initGroupSelect('#component_users_add form select[name=id_group]', () => {
                $('#component_users_add').modal('show');
            })
        });
        $(document).on('submit', '#component_users_add form', e => this.addUser(e));
        $(document).on('click', '#component_users_read table tbody tr', e => {
            this.preModifyUser(e)
        });
        $(document).on('submit', '#component_users_modify form', e => this.modifyUser(e));
        $(document).on('click', '#component_users_modify .delete', e => {
            e.preventDefault();
            const data = new FormData($('#component_users_modify form')[0]);
            $('#component_users_delete input[name=identifier]').val(data.get('identifier'));
            $('#component_users_delete strong.username').html(data.get('username'));
            $('#component_users_delete').modal('show');
        });
        $(document).on('submit', '#component_users_delete form', e => this.deleteUser(e));

        // My Account
        $(document).on('submit', '#component_my_account_general form', e => this.modifyCurrentUser(e));
        $(document).on('submit', '#component_my_account_change_password form', e => this.changePassword(e));

        // API Key
        $(document).on('click', '#component_my_account_apikey .generate', () => this.generateApiKey());
        $(document).on('click', '#component_my_account_apikey .revoke', () => this.revokeApiKey());
        $(document).on('click', '#component_my_account_apikey .toggle-show', function() {
            const input = $('#component_my_account_apikey input[name="api_key"]');
            const icon = $(this).find('i');
            if (input.attr('type') === 'password') {
                input.attr('type', 'text');
                icon.removeClass('fa-eye').addClass('fa-eye-slash');
            } else {
                input.attr('type', 'password');
                icon.removeClass('fa-eye-slash').addClass('fa-eye');
            }
        });
        $(document).on('click', '#component_my_account_apikey .copy', function() {
            const input = $('#component_my_account_apikey input[name="api_key"]')[0];
            input.select();
            document.execCommand('copy');
            new wtools.Notification('SUCCESS').Show_(window.structbxI18n ? window.structbxI18n.t('settings.api_key_copied') : 'API key copied to clipboard.');
        });

        // ---- GROUPS ----
        $(document).on('click', '#component_groups_read .add', (e) => {
            e.preventDefault();
            $('#component_groups_add').modal('show');
        });
        $(document).on('submit', '#component_groups_add form', e => this.addGroup(e));
        $(document).on('click', '#component_groups_read table tbody tr', e => {
            e.preventDefault();
            this.preModifyGroup(e);
        });
        $(document).on('submit', '#component_groups_modify form', e => this.modifyGroup(e));
        $(document).on('click', '#component_groups_modify .delete', e => {
            e.preventDefault();
            this.preDeleteGroup();
        });
        $(document).on('submit', '#component_groups_delete form', e => this.deleteGroup(e));

        // ---- DATABASES ----
        $(document).on('click', '#component_databases_read .add', (e) => {
            e.preventDefault();
            $('#component_databases_add').modal('show');
        });
        $(document).on('submit', '#component_databases_add form', e => this.addDatabase(e));
        $(document).on('click', '#component_databases_read table tbody tr', e => {
            e.preventDefault();
            this.showDatabaseUsers(e);
        });
        $(document).on('click', '#component_databases_users_read .add', (e) => {
            e.preventDefault();
            this.preAddDatabaseUser();
        });
        $(document).on('submit', '#component_databases_users_add form', e => this.addDatabaseUser(e));
        $(document).on('click', '#component_databases_users_read table tbody tr', e => {
            e.preventDefault();
            this.preDeleteDatabaseUser(e);
        });
        $(document).on('submit', '#component_databases_users_delete form', e => this.deleteDatabaseUser(e));
        $(document).on('click', '#component_databases_modify .delete', (e) => {
            e.preventDefault();
            this.preDeleteDatabase();
        });
        $(document).on('submit', '#component_databases_modify form', e => this.modifyDatabase(e));
        $(document).on('submit', '#component_databases_delete form', e => this.deleteDatabase(e));
        $(document).on('input', '#component_databases_delete input[name="confirm_name"]', function() {
            const expected = $('#component_databases_delete .database-name').text();
            const typed = $(this).val();
            $('#component_databases_delete button[type="submit"]').prop('disabled', typed !== expected);
        });

        // ---- PERMISSIONS ----
        $(document).on('change', '#component_permissions_read select[name=id_group]', () => {
            this.readPermissions();
        });
        $(document).on('click', '#component_permissions_read .add', (e) => {
            e.preventDefault();
            this.preAddPermission();
        });
        $(document).on('submit', '#component_permissions_add form', e => this.addPermission(e));
        $(document).on('click', '#component_permissions_read table tbody tr', e => {
            e.preventDefault();
            this.preDeletePermission(e);
        });
        $(document).on('submit', '#component_permissions_delete form', e => this.deletePermission(e));
    }

    // --------------------------------------------------
    // INSTANCE
    // --------------------------------------------------
    readInstanceName(){
        // Wait animation
        let wait = new wtools.ElementState('#component_instance_name_read .notifications', false, 'block', new wtools.WaitAnimation().for_block);

        // Request
        this.instance.readName().then((response_data) => {
            wait.Off_();

            // Manage response
            const result = new ResponseManager(response_data, '#component_instance_name_read .notifications', 'target.instance_name_read');
            if(!result.Verify_())
                return;

            // Handle zero results
            if(response_data.body.data.length < 1){
                new wtools.Notification('WARNING', 0, '#component_instance_name_read .notifications').Show_(window.structbxI18n ? window.structbxI18n.t('base.instance_name_failed') : 'Could not access instance name.');
                return;
            }

            $('#component_instance_name_read input[name="name"]').val(response_data.body.data[0].value);
        });
    }

    modifyInstanceName(){
        // Wait animation
        let wait = new wtools.ElementState('#component_instance_name_read form button[type=submit]', true, 'button', new wtools.WaitAnimation().for_button);

        // Form check
        const check = new wtools.FormChecker($('#component_instance_name_read form')[0]).Check_();
        if(!check){
            wait.Off_();
            $('#component_instance_name_read .notifications').html('');
            new wtools.Notification('WARNING', 5000, '#component_instance_name_read .notifications').Show_(window.structbxI18n ? window.structbxI18n.t('login.invalid_fields') : 'There are invalid fields.');
            return;
        }

        // Data collection
        const name = $('#component_instance_name_read input[name="name"]').val();

        // Request
        this.instance.modifyName(name).then((response_data) =>
        {
            wait.Off_();

            // Manage response
            const result = new ResponseManager(response_data, '#component_instance_name_read .notifications', 'target.instance_name_modify');
            if(!result.Verify_())
                return;

            new wtools.Notification('SUCCESS').Show_(window.structbxI18n ? window.structbxI18n.t('settings.instance_name_updated') : 'Instance name updated successfully.');
            new wtools.ElementState('#wait_animation_page', true, 'block', new wtools.WaitAnimation().for_page);
            location.reload();
        });
    }

    // Modify instance logo
    modifyInstanceLogo(){
        // Wait animation
        let wait = new wtools.ElementState('#component_instance_logo_read form button[type=submit]', true, 'button', new wtools.WaitAnimation().for_button);

        // Form check
        const check = new wtools.FormChecker($('#component_instance_logo_read form')[0]).Check_();
        if(!check){
            wait.Off_();
            $('#component_instance_logo_read .notifications').html('');
            new wtools.Notification('WARNING', 5000, '#component_instance_logo_read .notifications').Show_(window.structbxI18n ? window.structbxI18n.t('login.invalid_fields') : 'There are invalid fields.');
            return;
        }

        // Data collection
        const data = new FormData($('#component_instance_logo_read form')[0]);

        // Request
        this.instance.modifyLogo(data).then((response_data) => {
            wait.Off_();

            // Manage response
            const result = new ResponseManager(response_data, '#component_instance_logo_read .notifications', 'target.instance_logo_modify');
            if(!result.Verify_())
                return;

            new wtools.Notification('SUCCESS').Show_(window.structbxI18n ? window.structbxI18n.t('settings.logo_updated') : 'Instance logo updated successfully.');
            new wtools.ElementState('#wait_animation_page', true, 'block', new wtools.WaitAnimation().for_page);
            location.reload();
        });
    }

    // --------------------------------------------------
    // USERS
    // --------------------------------------------------
    readUsers() {
        const wait = new wtools.ElementState('#component_users_read .notifications', false, 'block', new wtools.WaitAnimation().for_block);
        this.user.readAll().then(response => {
            wait.Off_();
            const result = new ResponseManager(response, '#component_users_read .notifications', 'target.users_read');
            if (!result.Verify_()) return;
            if (response.body.data.length < 1) {
                new wtools.Notification('SUCCESS', 0, '#component_users_read .notifications').Show_(window.structbxI18n ? window.structbxI18n.t('response.no_results') : 'No results.');
                return;
            }
            $('#component_users_read .notifications').html('');
            $('#component_users_read table tbody').html('');
            new wtools.UIElementsCreator('#component_users_read table tbody', response.body.data).Build_(row => {
                const statusText = row.status === 'active'
                    ? (window.structbxI18n ? window.structbxI18n.t('start.active') : 'Active')
                    : (window.structbxI18n ? window.structbxI18n.t('start.inactive') : 'Inactive');
                const elements = [
                    `<td scope="row">${row.username}</td>`,
                    `<td scope="row">${statusText}</td>`,
                    `<td scope="row">${row.group}</td>`,
                    `<td scope="row">${row.created_at}</td>`
                ];
                return new wtools.UIElementsPackage(`<tr user-identifier="${row.identifier}"></tr>`, elements).Pack_();
            });
        });
    }

    readCurrentUser() {
        const wait = new wtools.ElementState('#component_my_account_general .notifications', false, 'block', new wtools.WaitAnimation().for_block);
        this.user.current().then(response => {
            wait.Off_();
            const result = new ResponseManager(response, '#component_my_account_general .notifications', 'target.current_user_read');
            if (!result.Verify_()) return;
            if (response.body.data.length < 1) {
                new wtools.Notification('WARNING', 0, '#component_my_account_general .notifications').Show_(window.structbxI18n ? window.structbxI18n.t('settings.current_user_read_failed') : 'Could not access current user.');
                return;
            }
            $('#component_my_account_general input[name="username"]').val(response.body.data[0].username);
        });
    }

    modifyCurrentUser(e) {
        e.preventDefault();
        const wait = new wtools.ElementState('#component_my_account_general form button[type=submit]', true, 'button', new wtools.WaitAnimation().for_button);
        const check = new wtools.FormChecker(e.target).Check_();
        if (!check) {
            $('#component_my_account_general .notifications').html('');
            wait.Off_();
            new wtools.Notification('WARNING', 5000, '#component_my_account_general .notifications').Show_(window.structbxI18n ? window.structbxI18n.t('login.invalid_fields') : 'There are invalid fields.');
            return;
        }
        const data = new FormData($('#component_my_account_general form')[0]);
        this.user.modifyCurrentUsername(data.get('username')).then(response => {
            wait.Off_();
            const result = new ResponseManager(response, '#component_my_account_general .notifications', 'target.current_user_modify');
            if (!result.Verify_()) return;
            new wtools.Notification('SUCCESS').Show_(window.structbxI18n ? window.structbxI18n.t('settings.current_user_updated') : 'Current user updated successfully.');
        });
    }

    changePassword(e) {
        e.preventDefault();
        const wait = new wtools.ElementState('#component_my_account_change_password form button[type=submit]', true, 'button', new wtools.WaitAnimation().for_button);
        const check = new wtools.FormChecker(e.target).Check_();
        if (!check) {
            $('#component_my_account_change_password .notifications').html('');
            wait.Off_();
            new wtools.Notification('WARNING', 5000, '#component_my_account_change_password .notifications').Show_(window.structbxI18n ? window.structbxI18n.t('login.invalid_fields') : 'There are invalid fields.');
            return;
        }
        const data = new FormData($('#component_my_account_change_password form')[0]);
        this.user.changePassword(data.get('current_password'), data.get('new_password'), data.get('new_password2')).then(response => {
            wait.Off_();
            const result = new ResponseManager(response, '#component_my_account_change_password .notifications', 'target.password_modify');
            if (!result.Verify_()) return;
            new wtools.Notification('SUCCESS').Show_(window.structbxI18n ? window.structbxI18n.t('settings.password_updated') : 'Password updated successfully.');
            wtools.CleanForm($('#component_my_account_change_password form'));
            $('#component_my_account_change_password form').removeClass('was-validated');
        });
    }

    addUser(e) {
        e.preventDefault();
        const wait = new wtools.ElementState('#component_users_add form button[type=submit]', true, 'button', new wtools.WaitAnimation().for_button);
        const check = new wtools.FormChecker(e.target).Check_();
        if (!check) {
            $('#component_users_add .notifications').html('');
            wait.Off_();
            new wtools.Notification('WARNING', 5000, '#component_users_add .notifications').Show_(window.structbxI18n ? window.structbxI18n.t('login.invalid_fields') : 'There are invalid fields.');
            return;
        }
        const data = new FormData($('#component_users_add form')[0]);
        this.user.add(data.get('username'), data.get('password'), data.get('id_group')).then(response => {
            wait.Off_();
            const result = new ResponseManager(response, '#component_users_add .notifications', 'target.users_add');
            if (!result.Verify_()) return;
            new wtools.Notification('SUCCESS').Show_(window.structbxI18n ? window.structbxI18n.t('settings.user_created') : 'User created successfully.');
            this.readUsers();
            wtools.CleanForm($('#component_users_add form'));
            $('#component_users_add').modal('hide');
        });
    }

    preModifyUser(e){
        const identifier = $(e.currentTarget).attr('user-identifier');
        if (!identifier) {
            new wtools.Notification('WARNING').Show_(window.structbxI18n ? window.structbxI18n.t('settings.user_identifier_not_found') : 'User identifier not found.');
            return;
        }
        const wait = new wtools.ElementState('#wait_animation_page', true, 'block', new wtools.WaitAnimation().for_page);
        this.initGroupSelect('#component_users_modify form select[name=id_group]', () => {
            this.user.readByIdentifier(identifier).then(response => {
                const result = new ResponseManager(response, '', 'target.users_modify');
                if (!result.Verify_()) return;
                if (response.body.data.length < 1) {
                    new wtools.Notification('SUCCESS').Show_(window.structbxI18n ? window.structbxI18n.t('table.no_results') : 'No results.');
                    wait.Off_();
                    return;
                }
                wtools.CleanForm($('#component_users_modify form'));
                $('#component_users_modify input[name="identifier"]').val(response.body.data[0].identifier);
                $('#component_users_modify input[name="username"]').val(response.body.data[0].username);
                $('#component_users_modify select[name="status"]').val(response.body.data[0].status);
                $('#component_users_modify select[name="id_group"]').val(response.body.data[0].id_group);
                wait.Off_();
                $('#component_users_modify').modal('show');
            });
        });
    }

    modifyUser(e) {
        e.preventDefault();
        const wait = new wtools.ElementState('#component_users_modify form button[type=submit]', true, 'button', new wtools.WaitAnimation().for_button);
        const check = new wtools.FormChecker(e.target).Check_();
        if (!check) {
            $('#component_users_modify .notifications').html('');
            wait.Off_();
            new wtools.Notification('WARNING', 5000, '#component_users_modify .notifications').Show_(window.structbxI18n ? window.structbxI18n.t('login.invalid_fields') : 'There are invalid fields.');
            return;
        }
        const data = new FormData($('#component_users_modify form')[0]);
        this.user.modify(data.get('identifier'), data.get('username'), data.get('status'), data.get('id_group'), data.get('password')).then(response => {
            wait.Off_();
            const result = new ResponseManager(response, '#component_users_modify .notifications', 'target.users_modify');
            if (!result.Verify_()) return;
            new wtools.Notification('SUCCESS').Show_(window.structbxI18n ? window.structbxI18n.t('settings.user_updated') : 'User updated successfully.');
            this.readUsers();
            wtools.CleanForm($('#component_users_modify form'));
            $('#component_users_modify').modal('hide');
        });
    }

    deleteUser(e) {
        e.preventDefault();
        const wait = new wtools.ElementState('#component_users_delete form button[type=submit]', true, 'button', new wtools.WaitAnimation().for_button);
        const identifier = $('#component_users_delete input[name=identifier]').val();
        this.user.delete(identifier).then(response => {
            wait.Off_();
            const result = new ResponseManager(response, '#component_users_delete .notifications', 'target.users_delete');
            if (!result.Verify_()) return;
            new wtools.Notification('SUCCESS').Show_(window.structbxI18n ? window.structbxI18n.t('settings.user_deleted') : 'User deleted.');
            $('#component_users_delete').modal('hide');
            $('#component_users_modify').modal('hide');
            this.readUsers();
        });
    }

    // --------------------------------------------------
    // GROUPS
    // --------------------------------------------------

    initGroupSelect(selector, callback) {
        const select = new wtools.SelectOptions();
        this.group.readAll().then(response => {
            try {
                const tmp = [];
                for (const row of response.body.data) {
                    tmp.push(new wtools.OptionValue(row.identifier, row.group));
                }
                select.options = tmp;
                select.Build_(selector);
                if (callback) callback();
            } catch (error) {
                new wtools.Notification('WARNING').Show_(window.structbxI18n ? window.structbxI18n.t('settings.groups_read_failed') : 'Could not access groups.');
            }
        });
    }

    readGroups() {
        const wait = new wtools.ElementState('#component_groups_read .notifications', false, 'block', new wtools.WaitAnimation().for_block);
        this.group.readAll().then(response => {
            wait.Off_();
            const result = new ResponseManager(response, '#component_groups_read .notifications', 'target.groups_read');
            if (!result.Verify_()) return;
            if (response.body.data.length < 1) {
                new wtools.Notification('SUCCESS', 0, '#component_groups_read .notifications').Show_(window.structbxI18n ? window.structbxI18n.t('response.no_results') : 'No results.');
                return;
            }
            $('#component_groups_read .notifications').html('');
            $('#component_groups_read table tbody').html('');
            new wtools.UIElementsCreator('#component_groups_read table tbody', response.body.data).Build_(row => {
                const elements = [
                    `<td scope="row">${row.group}</td>`
                ];
                return new wtools.UIElementsPackage(`<tr group-identifier="${row.identifier}"></tr>`, elements).Pack_();
            });
        });
    }

    addGroup(e) {
        e.preventDefault();
        const wait = new wtools.ElementState('#component_groups_add form button[type=submit]', true, 'button', new wtools.WaitAnimation().for_button);
        const check = new wtools.FormChecker(e.target).Check_();
        if (!check) {
            $('#component_groups_add .notifications').html('');
            wait.Off_();
            new wtools.Notification('WARNING', 5000, '#component_groups_add .notifications').Show_(window.structbxI18n ? window.structbxI18n.t('login.invalid_fields') : 'There are invalid fields.');
            return;
        }
        const group = $('#component_groups_add form input[name=group]').val();
        this.group.add(group).then(response => {
            wait.Off_();
            const result = new ResponseManager(response, '#component_groups_add .notifications', 'target.groups_add');
            if (!result.Verify_()) return;
            new wtools.Notification('SUCCESS').Show_(window.structbxI18n ? window.structbxI18n.t('settings.group_added') : 'Group added successfully.');
            this.readGroups();
            wtools.CleanForm($('#component_groups_add form'));
            $('#component_groups_add').modal('hide');
        });
    }
    preModifyGroup(e){
        const identifier = $(e.currentTarget).attr('group-identifier');
        if (!identifier) {
            new wtools.Notification('WARNING').Show_(window.structbxI18n ? window.structbxI18n.t('settings.group_identifier_not_found') : 'Group identifier not found.');
            return;
        }
        const wait = new wtools.ElementState('#wait_animation_page', true, 'block', new wtools.WaitAnimation().for_page);
        this.group.readByIdentifier(identifier).then(response => {
            const result = new ResponseManager(response, '', 'target.groups_modify');
            if (!result.Verify_()) return;
            if (response.body.data.length < 1) {
                new wtools.Notification('SUCCESS').Show_(window.structbxI18n ? window.structbxI18n.t('table.no_results') : 'No results.');
                return;
            }
            wtools.CleanForm($('#component_groups_modify form'));
            $('#component_groups_modify input[name="identifier"]').val(response.body.data[0].identifier);
            $('#component_groups_modify input[name="group"]').val(response.body.data[0].group);
            $('#component_groups_modify').modal('show');
            wait.Off_();
        });
    }
    modifyGroup(e) {
        e.preventDefault();
        const wait = new wtools.ElementState('#component_groups_modify form button[type=submit]', true, 'button', new wtools.WaitAnimation().for_button);
        const check = new wtools.FormChecker(e.target).Check_();
        if (!check) {
            $('#component_groups_modify .notifications').html('');
            wait.Off_();
            new wtools.Notification('WARNING', 5000, '#component_groups_modify .notifications').Show_(window.structbxI18n ? window.structbxI18n.t('login.invalid_fields') : 'There are invalid fields.');
            return;
        }
        const identifier = $('#component_groups_modify form input[name=identifier]').val();
        const group = $('#component_groups_modify form input[name=group]').val();
        this.group.modify(identifier, group).then(response => {
            wait.Off_();
            const result = new ResponseManager(response, '#component_groups_modify .notifications', 'target.groups_modify');
            if (!result.Verify_()) return;
            new wtools.Notification('SUCCESS').Show_(window.structbxI18n ? window.structbxI18n.t('settings.group_updated') : 'Group updated successfully.');
            this.readGroups();
            wtools.CleanForm($('#component_groups_modify form'));
            $('#component_groups_modify').modal('hide');
        });
    }

    preDeleteGroup(){
        const data = new FormData($('#component_groups_modify form')[0]);
        $('#component_groups_delete input[name=identifier]').val(data.get('identifier'));
        $('#component_groups_delete strong.group').html(data.get('group'));
        $('#component_groups_delete').modal('show');
    }

    deleteGroup(e) {
        e.preventDefault();
        const wait = new wtools.ElementState('#component_groups_delete form button[type=submit]', true, 'button', new wtools.WaitAnimation().for_button);
        const identifier = $('#component_groups_delete input[name=identifier]').val();
        this.group.delete(identifier).then(response => {
            wait.Off_();
            const result = new ResponseManager(response, '#component_groups_delete .notifications', 'target.groups_delete');
            if (!result.Verify_()) return;
            new wtools.Notification('SUCCESS').Show_(window.structbxI18n ? window.structbxI18n.t('settings.group_deleted') : 'Group deleted.');
            $('#component_groups_modify').modal('hide');
            $('#component_groups_delete').modal('hide');
            this.readGroups();
        });
    }

    // --------------------------------------------------
    // DATABASES
    // --------------------------------------------------
    readDatabases() {
        const wait = new wtools.ElementState('#component_databases_read .notifications', false, 'block', new wtools.WaitAnimation().for_block);

        this.database.read().then(response => {
            wait.Off_();
            $('#component_databases_read .notifications').html('');
            $('#component_databases_read table tbody').html('');

            const result = new ResponseManager(response, '#component_databases_read .notifications', 'target.databases_read');
            if(!result.Verify_())
                return;

            if(response.body.data.length < 1) {
                new wtools.Notification('SUCCESS', 0, '#component_databases_read .notifications').Show_(window.structbxI18n ? window.structbxI18n.t('table.no_results') : 'No results.');
                return;
            }

            new wtools.UIElementsCreator('#component_databases_read table tbody', response.body.data).Build_(row => {
                const elements = [
                    `<th scope="row">${row.name}</th>`,
                    `<td scope="row">${row.size} MB</td>`,
                    `<td scope="row">${row.directory_size} MB</td>`,
                    `<td scope="row">${row.description}</td>`,
                    `<td scope="row">${row.created_at}</td>`
                ];
                return new wtools.UIElementsPackage(`<tr database-identifier="${row.identifier}" database-name="${row.name}"></tr>`, elements).Pack_();
            });
        });
    }

    addDatabase(e) {
        e.preventDefault();

        const wait = new wtools.ElementState('#component_databases_add form button[type=submit]', true, 'button', new wtools.WaitAnimation().for_button);

        const check = new wtools.FormChecker(e.target).Check_();
        if(!check) {
            $('#component_databases_add .notifications').html('');
            wait.Off_();
            new wtools.Notification('WARNING', 5000, '#component_databases_add .notifications').Show_(window.structbxI18n ? window.structbxI18n.t('login.invalid_fields') : 'There are invalid fields.');
            return;
        }

        const data = new FormData($('#component_databases_add form')[0]);

        this.database.add(data.get('name'), data.get('description')).then(response => {
            wait.Off_();

            const result = new ResponseManager(response, '#component_databases_add .notifications', 'target.databases_add');
            if(!result.Verify_())
                return;

            new wtools.Notification('SUCCESS').Show_(window.structbxI18n ? window.structbxI18n.t('settings.database_created') : 'Database created successfully.');
            new wtools.ElementState('#wait_animation_page', true, 'block', new wtools.WaitAnimation().for_page);
            location.reload();
        });
    }

    modifyDatabase(e) {
        e.preventDefault();

        const wait = new wtools.ElementState('#component_databases_modify form button[type=submit]', true, 'button', new wtools.WaitAnimation().for_button);

        const check = new wtools.FormChecker(e.target).Check_();
        if(!check) {
            $('#component_databases_modify .notifications').html('');
            wait.Off_();
            new wtools.Notification('WARNING', 5000, '#component_databases_modify .notifications').Show_(window.structbxI18n ? window.structbxI18n.t('login.invalid_fields') : 'There are invalid fields.');
            return;
        }

        const identifier = $('#component_databases_modify input[name="identifier"]').val();
        const name = $('#component_databases_modify input[name="name"]').val();
        const description = $('#component_databases_modify textarea[name="description"]').val();

        this.database.modify(identifier, name, description).then(response => {
            wait.Off_();

            const result = new ResponseManager(response, '#component_databases_modify .notifications', 'target.databases_modify');
            if(!result.Verify_())
                return;

            new wtools.Notification('SUCCESS').Show_(window.structbxI18n ? window.structbxI18n.t('settings.database_modified') : 'Database modified successfully.');
            this.readDatabases();
            wtools.CleanForm($('#component_databases_modify form'));
        });
    }

    preDeleteDatabase() {
        const identifier = $('#component_databases_modify input[name="identifier"]').val();
        const name = $('#component_databases_modify .database-name').text();
        if (!identifier || !name) {
            new wtools.Notification('WARNING').Show_(window.structbxI18n ? window.structbxI18n.t('settings.database_identifier_not_found') : 'Database identifier not found.');
            return;
        }
        $('#component_databases_delete input[name="identifier"]').val(identifier);
        $('#component_databases_delete .database-name').text(name);
        $('#component_databases_delete input[name="confirm_name"]').val('');
        $('#component_databases_delete button[type="submit"]').prop('disabled', true);
        $('#component_databases_delete .notifications').html('');
        $('#component_databases_delete').modal('show');
    }

    deleteDatabase(e) {
        e.preventDefault();

        const identifier = $('#component_databases_delete input[name="identifier"]').val();
        const typed = $('#component_databases_delete input[name="confirm_name"]').val();
        const expected = $('#component_databases_delete .database-name').text();

        if (typed !== expected) {
            new wtools.Notification('WARNING', 5000, '#component_databases_delete .notifications').Show_(window.structbxI18n ? window.structbxI18n.t('login.invalid_fields') : 'The database name does not match.');
            return;
        }

        const wait = new wtools.ElementState('#component_databases_delete button[type="submit"]', true, 'button', new wtools.WaitAnimation().for_button);

        this.database.delete(identifier).then(response => {
            wait.Off_();

            const result = new ResponseManager(response, '#component_databases_delete .notifications', 'target.databases_delete');
            if(!result.Verify_())
                return;

            new wtools.Notification('SUCCESS').Show_(window.structbxI18n ? window.structbxI18n.t('settings.database_deleted') : 'Database deleted.');
            $('#component_databases_delete').modal('hide');
            $('#component_databases_modify').addClass('d-none');
            $('#component_databases_users_read').addClass('d-none');
            this.currentDatabaseIdentifier = null;
            this.currentDatabaseName = null;
            this.currentDatabaseDescription = null;
            this.readDatabases();
        });
    }

    // --------------------------------------------------
    // DATABASE USERS
    // --------------------------------------------------
    showDatabaseUsers(e){
        const identifier = $(e.currentTarget).attr('database-identifier');
        const name = $(e.currentTarget).attr('database-name');
        const description = $(e.currentTarget).find('td:nth-child(4)').text().trim();
        if (!identifier) {
            new wtools.Notification('WARNING').Show_(window.structbxI18n ? window.structbxI18n.t('settings.database_identifier_not_found') : 'Database identifier not found.');
            return;
        }
        this.currentDatabaseIdentifier = identifier;
        this.currentDatabaseName = name;
        this.currentDatabaseDescription = description;
        $('#component_databases_modify .database-name').text(name);
        $('#component_databases_modify input[name="identifier"]').val(identifier);
        $('#component_databases_modify input[name="name"]').val(name);
        $('#component_databases_modify textarea[name="description"]').val(description);
        $('#component_databases_modify').removeClass('d-none');
        $('#component_databases_users_read .database-name').text(name);
        $('#component_databases_users_read').removeClass('d-none');
        this.readDatabaseUsers();
    }

    readDatabaseUsers(){
        const wait = new wtools.ElementState('#component_databases_users_read .notifications', false, 'block', new wtools.WaitAnimation().for_block);
        this.databaseUser.read(this.currentDatabaseIdentifier).then(response => {
            wait.Off_();
            const result = new ResponseManager(response, '#component_databases_users_read .notifications', 'target.db_users_read');
            if (!result.Verify_()) return;
            if (response.body.data.length < 1) {
                $('#component_databases_users_read table tbody').html('');
                $('#component_databases_users_read .notifications').html('');
                new wtools.Notification('SUCCESS', 0, '#component_databases_users_read .notifications').Show_(window.structbxI18n ? window.structbxI18n.t('table.no_results') : 'No results.');
                return;
            }
            $('#component_databases_users_read .notifications').html('');
            $('#component_databases_users_read table tbody').html('');
            new wtools.UIElementsCreator('#component_databases_users_read table tbody', response.body.data).Build_(row => {
                const elements = [
                    `<td scope="row">${row.username}</td>`,
                    `<td scope="row">${row.created_at}</td>`
                ];
                return new wtools.UIElementsPackage(`<tr user-identifier="${row.identifier}" user-username="${row.username}"></tr>`, elements).Pack_();
            });
        });
    }

    preAddDatabaseUser(){
        if (!this.currentDatabaseIdentifier) {
            new wtools.Notification('WARNING').Show_(window.structbxI18n ? window.structbxI18n.t('settings.database_not_found') : 'Selected database not found.');
            return;
        }
        const select = new wtools.SelectOptions();
        this.databaseUser.readOut(this.currentDatabaseIdentifier).then(response => {
            try {
                const tmp = [];
                if (response.body.data.length < 1) {
                    tmp.push(new wtools.OptionValue("", window.structbxI18n ? window.structbxI18n.t('settings.no_users_available') : 'No users available.'));
                } else {
                    for (const row of response.body.data) {
                        tmp.push(new wtools.OptionValue(row.identifier, row.username));
                    }
                }
                select.options = tmp;
                select.Build_('#component_databases_users_add select[name="id_user"]');
                $('#component_databases_users_add').modal('show');
            } catch (error) {
                new wtools.Notification('WARNING').Show_(window.structbxI18n ? window.structbxI18n.t('settings.users_available_read_failed') : 'Could not access available users.');
            }
        });
    }

    addDatabaseUser(e){
        e.preventDefault();
        const wait = new wtools.ElementState('#component_databases_users_add form button[type=submit]', true, 'button', new wtools.WaitAnimation().for_button);
        const check = new wtools.FormChecker(e.target).Check_();
        if (!check) {
            $('#component_databases_users_add .notifications').html('');
            wait.Off_();
            new wtools.Notification('WARNING', 5000, '#component_databases_users_add .notifications').Show_(window.structbxI18n ? window.structbxI18n.t('login.invalid_fields') : 'There are invalid fields.');
            return;
        }
        const id_user = $('#component_databases_users_add select[name=id_user]').val();
        this.databaseUser.add(id_user, this.currentDatabaseIdentifier).then(response => {
            wait.Off_();
            const result = new ResponseManager(response, '#component_databases_users_add .notifications', 'target.db_users_add');
            if (!result.Verify_()) return;
            new wtools.Notification('SUCCESS').Show_(window.structbxI18n ? window.structbxI18n.t('settings.user_added') : 'User added successfully.');
            this.readDatabaseUsers();
            wtools.CleanForm($('#component_databases_users_add form'));
            $('#component_databases_users_add').modal('hide');
        });
    }

    preDeleteDatabaseUser(e){
        const identifier = $(e.currentTarget).attr('user-identifier');
        const username = $(e.currentTarget).attr('user-username');
        if (!identifier || !username) {
            new wtools.Notification('WARNING').Show_(window.structbxI18n ? window.structbxI18n.t('settings.user_info_not_found') : 'User information not found.');
            return;
        }
        $('#component_databases_users_delete input[name=id]').val(identifier);
        $('#component_databases_users_delete strong.username').html(username);
        $('#component_databases_users_delete').modal('show');
    }

    deleteDatabaseUser(e){
        e.preventDefault();
        const wait = new wtools.ElementState('#component_databases_users_delete form button[type=submit]', true, 'button', new wtools.WaitAnimation().for_button);
        const identifier = $('#component_databases_users_delete input[name=id]').val();
        this.databaseUser.delete(identifier, this.currentDatabaseIdentifier).then(response => {
            wait.Off_();
            const result = new ResponseManager(response, '#component_databases_users_delete .notifications', 'target.db_users_delete');
            if (!result.Verify_()) return;
            new wtools.Notification('SUCCESS').Show_(window.structbxI18n ? window.structbxI18n.t('settings.user_deleted') : 'User deleted.');
            $('#component_databases_users_delete').modal('hide');
            this.readDatabaseUsers();
        });
    }

    // --------------------------------------------------
    // PERMISSIONS
    // --------------------------------------------------
    initPermissionsGroupSelect() {
        const select = new wtools.SelectOptions();
        this.group.readAll().then(response => {
            try {
                const tmp = [];
                for (const row of response.body.data) {
                    tmp.push(new wtools.OptionValue(row.identifier, row.group));
                }
                select.options = tmp;
                select.Build_('#component_permissions_read select[name="id_group"]');
                this.readPermissions();
            } catch (error) {
                new wtools.Notification('WARNING').Show_(window.structbxI18n ? window.structbxI18n.t('settings.groups_read_failed') : 'Could not access groups.');
            }
        });
    }

    readPermissions() {
        const wait = new wtools.ElementState('#component_permissions_read .notifications', false, 'block', new wtools.WaitAnimation().for_block);

        const id_group = $('#component_permissions_read select[name=id_group]').val();
        if (!id_group) {
            wait.Off_();
            return;
        }

        this.permission.readByGroup(id_group).then(response => {
            wait.Off_();

            const result = new ResponseManager(response, '#component_permissions_read .notifications', 'target.permissions_read');
            if(!result.Verify_())
                return;

            if(response.body.data.length < 1) {
                $('#component_permissions_read table tbody').html('');
                $('#component_permissions_read .notifications').html('');
                new wtools.Notification('SUCCESS', 0, '#component_permissions_read .notifications').Show_(window.structbxI18n ? window.structbxI18n.t('table.no_results') : 'No results.');
                return;
            }

            $('#component_permissions_read .notifications').html('');
            $('#component_permissions_read table tbody').html('');
            new wtools.UIElementsCreator('#component_permissions_read table tbody', response.body.data).Build_(row => {
                const elements = [
                    `<td scope="row">${row.title}</td>`,
                    `<td scope="row">${row.action}</td>`,
                    `<td scope="row">${row.created_at}</td>`
                ];
                return new wtools.UIElementsPackage(`<tr permission-endpoint="${row.endpoint}" permission-endpoint-name="${row.title}"></tr>`, elements).Pack_();
            });
        });
    }

    preAddPermission() {
        const id_group = $('#component_permissions_read select[name=id_group]').val();
        if (!id_group) {
            new wtools.Notification('WARNING').Show_(window.structbxI18n ? window.structbxI18n.t('settings.select_group_first') : 'You must select a group first.');
            return;
        }

        const select = new wtools.SelectOptions();
        this.permission.readAvailableEndpoints(id_group).then(response => {
            try {
                const tmp = [];
                if (response.body.data.length < 1) {
                    tmp.push(new wtools.OptionValue("", window.structbxI18n ? window.structbxI18n.t('settings.no_endpoints_available') : 'No endpoints available.'));
                } else {
                    for (const row of response.body.data) {
                        tmp.push(new wtools.OptionValue(row.endpoint, row.title));
                    }
                }
                select.options = tmp;
                select.Build_('#component_permissions_add select[name="endpoint"]');

                $('#component_permissions_add input[name=id_group]').val(id_group);
                $('#component_permissions_add').modal('show');
            } catch (error) {
                new wtools.Notification('WARNING').Show_(window.structbxI18n ? window.structbxI18n.t('settings.endpoints_read_failed') : 'Could not access endpoints.');
            }
        });
    }

    addPermission(e) {
        e.preventDefault();

        const wait = new wtools.ElementState('#component_permissions_add form button[type=submit]', true, 'button', new wtools.WaitAnimation().for_button);

        const check = new wtools.FormChecker(e.target).Check_();
        if(!check) {
            $('#component_permissions_add .notifications').html('');
            wait.Off_();
            new wtools.Notification('WARNING', 5000, '#component_permissions_add .notifications').Show_(window.structbxI18n ? window.structbxI18n.t('login.invalid_fields') : 'There are invalid fields.');
            return;
        }

        const data = new FormData($('#component_permissions_add form')[0]);

        this.permission.add(data.get('id_group'), data.get('endpoint')).then(response => {
            wait.Off_();

            const result = new ResponseManager(response, '#component_permissions_add .notifications', 'target.permissions_add');
            if(!result.Verify_())
                return;

            new wtools.Notification('SUCCESS').Show_(window.structbxI18n ? window.structbxI18n.t('settings.permission_added') : 'Permission added successfully.');
            this.readPermissions();
            wtools.CleanForm($('#component_permissions_add form'));
            $('#component_permissions_add').modal('hide');
        });
    }

    preDeletePermission(e) {
        const endpoint = $(e.currentTarget).attr('permission-endpoint');
        const endpoint_name = $(e.currentTarget).attr('permission-endpoint-name');
        if (!endpoint) {
            new wtools.Notification('WARNING').Show_(window.structbxI18n ? window.structbxI18n.t('settings.permission_endpoint_not_found') : 'Permission endpoint not found.');
            return;
        }

        $('#component_permissions_delete input[name=endpoint]').val(endpoint);
        $('#component_permissions_delete strong.value').html(endpoint_name);
        $('#component_permissions_delete').modal('show');
    }

    deletePermission(e) {
        e.preventDefault();

        const wait = new wtools.ElementState('#component_permissions_delete form button[type=submit]', true, 'button', new wtools.WaitAnimation().for_button);

        const endpoint = $('#component_permissions_delete input[name=endpoint]').val();
        const id_group = $('#component_permissions_read select[name=id_group]').val();

        this.permission.delete(endpoint, id_group).then(response => {
            wait.Off_();

            const result = new ResponseManager(response, '#component_permissions_delete .notifications', 'target.permissions_delete');
            if(!result.Verify_())
                return;

            new wtools.Notification('SUCCESS').Show_(window.structbxI18n ? window.structbxI18n.t('settings.permission_deleted') : 'Permission deleted.');
            $('#component_permissions_delete').modal('hide');
            this.readPermissions();
        });
    }

    // --------------------------------------------------
    // API KEY
    // --------------------------------------------------
    readApiKey() {
        const wait = new wtools.ElementState('#component_my_account_apikey .notifications', false, 'block', new wtools.WaitAnimation().for_block);
        this.user.apiKeyRead().then(response => {
            wait.Off_();
            const result = new ResponseManager(response, '#component_my_account_apikey .notifications', 'target.api_key_read');
            if (!result.Verify_()) return;

            const input = $('#component_my_account_apikey input[name="api_key"]');
            if (response.body.data.length > 0 && response.body.data[0].api_key) {
                const key = response.body.data[0].api_key;
                const masked = '*'.repeat(key.length - 4) + key.slice(-4);
                input.val(masked).data('full', key).attr('type', 'password');
            } else {
                input.val('').data('full', '');
            }
        });
    }

    generateApiKey() {
        const wait = new wtools.ElementState('#component_my_account_apikey .generate', true, 'button', new wtools.WaitAnimation().for_button);
        this.user.apiKeyGenerate().then(response => {
            wait.Off_();
            const result = new ResponseManager(response, '#component_my_account_apikey .notifications', 'target.api_key_generate');
            if (!result.Verify_()) return;

            const key = response.body.api_key;
            const input = $('#component_my_account_apikey input[name="api_key"]');
            input.val(key).data('full', key).attr('type', 'text');
            new wtools.Notification('SUCCESS').Show_(window.structbxI18n ? window.structbxI18n.t('settings.api_key_generated') : 'API key generated successfully.');
        });
    }

    revokeApiKey() {
        const wait = new wtools.ElementState('#component_my_account_apikey .revoke', true, 'button', new wtools.WaitAnimation().for_button);
        this.user.apiKeyRevoke().then(response => {
            wait.Off_();
            const result = new ResponseManager(response, '#component_my_account_apikey .notifications', 'target.api_key_revoke');
            if (!result.Verify_()) return;

            const input = $('#component_my_account_apikey input[name="api_key"]');
            input.val('').data('full', '');
            new wtools.Notification('SUCCESS').Show_(window.structbxI18n ? window.structbxI18n.t('settings.api_key_revoked') : 'API key revoked successfully.');
        });
    }
}
