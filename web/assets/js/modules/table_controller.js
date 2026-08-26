import { BaseController } from './base_controller.js';
import * as Tools from '../classes/tools.js';
import * as DOME from '../classes/dom_elements.js';
import { ResponseManager } from '../classes/response_manager.js';
import { I18n } from '../i18n/i18n.js';

import { Session } from '../models/Session.js';

import { ViewsController } from '../submodules/views_controller.js';
import { TableSettingsController } from '../submodules/table_settings_controller.js';
import { DataImportController } from '../submodules/data_import_controller.js';

export class TableController extends BaseController {
    constructor() {
        super();
        this.session = new Session;

        this.views_controller = new ViewsController;
        this.table_settings_controller = new TableSettingsController;
        this.data_import_controller = new DataImportController;
    }

    build(){
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

        super.hideWithoutPermission();
        super.readInstanceName();
        super.readCurrentDatabase();
        super.readCurrentUser();

        this.readCurrentTableInfo();
        this.readSidebarTables();
        
        this.views_controller.read();
        this.table_settings_controller.readSettings();
        this.table_settings_controller.readPermissions();

        wait.Off_();
    }

    bindEvents() {
        super.bindEvents();
        this.views_controller.bindEvents();
        this.table_settings_controller.bindEvents();
        this.data_import_controller.bindEvents();

        // Go to table
        $(document).on('click', '.go_table', (e) => {
            e.preventDefault();

            const table_identifier = super.getTableIdentifier();
            new wtools.ElementState('#wait_animation_page', true, 'block', new wtools.WaitAnimation().for_page);
            document.location.href = `/table?t=${table_identifier}`;
        });

        $(document).off('submit', '#component_tables_add form').on('submit', '#component_tables_add form', (e) => {
            e.preventDefault();
            this.addTable(e, () => this.readSidebarTables());
        });

        // Sidebar table search / filter
        const filterSidebarTables = () => {
            const query = $('#sidebar_table_search').val().toLowerCase().trim();
            const $items = $('#component_sidebar_tables .contents a.menu_table');
            let visibleCount = 0;

            $items.each(function () {
                const name = $(this).find('span').text().toLowerCase();
                const match = name.includes(query);
                $(this).toggle(match);
                if (match) visibleCount++;
            });

            $('#component_sidebar_tables .contents .sidebar-search-no-results').remove();

            if (query !== '' && visibleCount === 0) {
                const note = $items.length === 0
                    ? window.structbxI18n ? window.structbxI18n.t('table.no_tables') : 'No tables available.'
                    : window.structbxI18n ? window.structbxI18n.t('table.no_search_match') : 'No tables match.';
                $('#component_sidebar_tables .contents').append(`
                    <div class="sidebar-search-no-results text-muted small text-center py-2">
                        ${note}
                    </div>
                `);
            }
        };

        $(document).on('keyup', '#sidebar_table_search', filterSidebarTables);

        // Click on TABLE (sidebar menu)
        $(document).on('click', '#component_sidebar_tables .contents a.menu_table', (e) => {
            e.preventDefault();

            // Get table identifier
            const new_table_identifier = $(e.currentTarget).attr('table-identifier');

            // Reset URL parameters and set new table identifier
            const url = new URL(window.location.href);
            url.searchParams.delete('v');
            url.searchParams.set('t', new_table_identifier);
            history.pushState({}, '', url.toString());

            // Reset table info and settings
            this.readCurrentTableInfo();
            
            this.views_controller.read();
            this.table_settings_controller.readSettings();
            this.table_settings_controller.readPermissions();

            // Set to active current tab
            $('#component_sidebar_tables .contents a.menu_table').removeClass('active');
            $(e.currentTarget).addClass('active');
        });
    }
}