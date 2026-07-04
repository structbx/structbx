import { BaseController } from './base_controller.js';
import { I18n } from '../i18n/i18n.js';
import * as Tools from '../classes/tools.js';
import * as DOME from '../classes/dom_elements.js';
import { ResponseManager } from '../classes/response_manager.js';

import { Session } from '../models/Session.js';
import { Table } from '../models/Table.js';

export class StartController extends BaseController {
    constructor() {
        super();
        this.session = new Session;
        this.table = new Table;
    }

    onDatabaseInfoLoaded(){
        this.readDatabaseInfo();
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

        new DOME.Sidebars().sidebarMenu();
        new DOME.Headers().header();
        new DOME.Footers().footer();
        new wtools.MenuManager('#menu_main', true);

        super.hideWithoutPermission();
        super.readInstanceName();
        super.readCurrentDatabase();
        super.readCurrentUser();
        this.readTables();

        wait.Off_();
    }

    readDatabaseInfo(){
        if(!this.currentDatabaseFullData) return;

        const data = this.currentDatabaseFullData;
        const $card = $('#database_info_card');
        const state_dot = $card.find('.database_state_dot');
        const state_text = $card.find('.database_state_text');
        if(data.state == 'active'){
            state_dot.css('color', '#28a745');
            state_text.text(window.structbxI18n.t('start.state_active'));
        } else {
            state_dot.css('color', '#6c757d');
            state_text.text(window.structbxI18n.t('start.state_inactive'));
        }
        $card.find('.database_created_at').text(data.created_at || '-');
        $card.find('.database_size').text(data.size != null ? data.size + ' MB' : '-');
        $card.find('.database_directory_size').text(data.directory_size != null ? data.directory_size + ' MB' : '-');
        if(data.description){
            $card.find('.database_description_row').removeClass('d-none');
            $card.find('.database_description').text(data.description);
        } else {
            $card.find('.database_description_row').addClass('d-none');
        }
        $card.removeClass('d-none');
    }

    bindEvents() {
        super.bindEvents();

        // SELECT options
        const options_states = new wtools.SelectOptions
        ([
            new wtools.OptionValue("activo", window.structbxI18n.t('start.active'), true)
            ,new wtools.OptionValue("inactivo", window.structbxI18n.t('start.inactive'))
        ]);
        options_states.Build_('#component_tables_add select[name="state"]');
        options_states.Build_('#component_tables_modify select[name="state"]');

        const options_privacity = new wtools.SelectOptions
        ([
            new wtools.OptionValue("publico", window.structbxI18n.t('start.public'), true)
            ,new wtools.OptionValue("interno", window.structbxI18n.t('start.internal'))
        ]);
        options_privacity.Build_('#component_tables_add select[name="privacity"]');
        options_privacity.Build_('#component_tables_modify select[name="privacity"]');

        // Click on Add Button
        const click_add_button = () =>
        {
            $('#component_tables_add .notifications').html('');
            $('#component_tables_add').modal('show');
        }
        $(document).on('click', '.table_add', () => click_add_button());
        $('#component_tables_add form').submit((e) =>
        {
            e.preventDefault();
            this.addTable(e);
        });

        // Table search / filter
        const filterTables = () => {
            const query = $('#table_search').val().toLowerCase().trim();
            const $items = $('#component_tables_read .contents [table-identifier]');
            let visibleCount = 0;

            $items.each(function () {
                const name = $(this).find('h5').text().toLowerCase();
                const match = name.includes(query);
                $(this).toggle(match);
                if (match) visibleCount++;
            });

            // Remove existing no-results message
            $('#component_tables_read .contents .table-search-no-results').remove();

            if (query !== '' && visibleCount === 0) {
                const total = $items.length;
                const note = total === 0
                    ? window.structbxI18n.t('start.no_tables')
                    : window.structbxI18n.t('start.no_search_match');
                $('#component_tables_read .contents').append(`
                    <div class="table-search-no-results text-center">
                        <i class="fas fa-search mb-2 d-block"></i>
                        <span>${note}</span>
                    </div>
                `);
            }
        };

        $(document).on('keyup', '#table_search', filterTables);

        $(document).on('click', '#table_search_clear', function () {
            $('#table_search').val('').trigger('keyup').focus();
        });
    }

    readTables(){
        // Wait animation
        let wait = new wtools.ElementState('#component_tables_read .notifications', false, 'block', new wtools.WaitAnimation().for_block);

        // Request
        this.table.readAll().then((response_data) => {
            // Clean
            wait.Off_();
            $('#component_tables_read .notifications').html('');
            $('#component_tables_read .contents').html('');

            // Manage response
            const result = new ResponseManager(response_data, '#component_tables_read .notifications', 'target.tables_read');
            if(!result.Verify_())
                return;

            if(response_data.body.data.length < 1)
            {
                $('#component_tables_read .contents').html('');
                $('#component_tables_read .contents').append(`
                    <div class="p-2 text-center">
                        <button class="btn btn-primary table_add">
                            <i class="fas fa-plus"></i> ${window.structbxI18n.t('start.create_table')}
                        </button>
                    </div>
                `)
                return;
            }
            
            // Results elements creator
            $('#component_tables_read .contents').html('');
            $('#component_tables_read .contents').hide();
            let elements = []; let cont = 0;
            for(let row of response_data.body.data)
            {
                const state_badge_class = row.state == 'active' ? 'bg-success' : 'bg-secondary';
                const state_text = row.state == 'active'
                    ? window.structbxI18n.t('start.state_active')
                    : window.structbxI18n.t('start.state_inactive');
                const public_icon = row.public_form == 1
                    ? '<span class="badge bg-info ms-1" title="' + window.structbxI18n.t('start.public_form_enabled') + '"><i class="fas fa-globe"></i></span>'
                    : '';
                const created_html = row.created_at
                    ? '<small class="text-muted d-block mt-1"><i class="far fa-calendar-alt"></i> ' + window.structbxI18n.t('start.created_at') + ': ' + row.created_at + '</small>'
                    : '';

                if(cont < 2)
                {
                    elements.push(`
                        <div class="col-md-4 col-lg-3 mb-4" table-identifier="${row.identifier}">
                            <div class="card card-table-item h-100 shadow-sm d-flex flex-column">
                                
                                <a href="/table?t=${row.identifier}" class="p-3 flex-grow-1 text-decoration-none text-dark">
                                    <div class="d-flex align-items-center gap-2 mb-2">
                                        <span class="badge ${state_badge_class}">${state_text}</span>
                                        ${public_icon}
                                    </div>
                                    <div class="border-start border-3 border-primary ps-2">
                                        <h5 class="mb-1">${row.name}</h5>
                                        <p class="text-muted small mb-3">${row.description}</p>
                                    </div>
                                    
                                    <div class="mt-2 d-flex align-items-center gap-2 flex-wrap">
                                        <span class="badge rounded-pill bg-dark me-2"><i class="fas fa-pen fa-fw"></i> ${row.total}</span>
                                    </div>
                                    ${created_html}
                                </a>
                            </div>
                        </div>
                    `);
                }
                else
                {
                    let ui_element = new wtools.UIElementsPackage('<div class="row row-cols-1 row-cols-sm-2 row-cols-md-4 g-4"></div>', elements).Pack_();
                    $('#component_tables_read .contents').append(ui_element);
                    cont = 0;
                    elements = [];
                }
            }
            if(elements.length > 0)
            {
                let ui_element = new wtools.UIElementsPackage('<div class="row"></div>', elements).Pack_();
                $('#component_tables_read .contents').append(ui_element);
            }
            super.hideTablesWithoutPermission();
            $('#component_tables_read .contents').show();
            if ($('#table_search').val().trim() !== '') {
                $('#table_search').trigger('keyup');
            }
        });
    };

    addTable(e){
        // Wait animation
        let wait = new wtools.ElementState('#component_tables_add form button[type=submit]', true, 'button', new wtools.WaitAnimation().for_button);

        // Form check
        const check = new wtools.FormChecker(e.target).Check_();
        if(!check)
        {
            $('#component_tables_add .notifications').html('');
            wait.Off_();
            new wtools.Notification('WARNING', 5000, '#component_tables_add .notifications').Show_(window.structbxI18n.t('login.invalid_fields'));
            return;
        }

        // Request
        const name = $('#component_tables_add form input[name=name]').val();
        const description = $('#component_tables_add form input[name=name]').val();
        this.table.add(name, description).then((response_data) => {
            wait.Off_();

            // Manage error
            const result = new ResponseManager(response_data, '#component_tables_add .notifications', 'target.tables_add');
            if(!result.Verify_())
                return;
            
            new wtools.Notification('SUCCESS').Show_(window.structbxI18n.t('start.table_created'));
            $('#component_tables_add').modal('hide');
            Tools.CleanForm('#component_tables_add form');
            this.readTables();
        });
    }
}