import { BaseController } from './base_controller.js';
import * as Tools from '../classes/tools.js';
import * as DOME from '../classes/dom_elements.js';
import { ResponseManager } from '../classes/response_manager.js';

import { Session } from '../models/Session.js';
import { Table } from '../models/Table.js';

export class TableController extends BaseController {
    constructor() {
        super();
        this.session = new Session;
        this.table = new Table;
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

        new DOME.Headers().Header_();
        this.readCurrentTableInfo();
        this.readSidebarTables();
        super.hideWithoutPermission();

        wait.Off_();
    }

    bindEvents() {
        super.bindEvents();

        // Go to table
        $(document).on('click', '.go_table', (e) => {
            e.preventDefault();

            const table_identifier = super.getTableIdentifier();
            new wtools.ElementState('#wait_animation_page', true, 'block', new wtools.WaitAnimation().for_page);
            document.location.href = `/table?t=${table_identifier}`;
        });

        // Click on TABLE (sidebar menu)
        $(document).on('click', '#component_sidebar_tables .contents a.menu_table', (e) => {
            e.preventDefault();

            // Get Form identifier
            const new_table_identifier = $(e.currentTarget).attr('table-identifier');

            // Reset URL parameters and set new form identifier
            const url = new URL(window.location.href);
            url.searchParams.delete('v');
            url.searchParams.set('t', new_table_identifier);
            history.pushState({}, '', url.toString());

            // Reset views
            //viewsObject.readCurrentTableInfo();

            // Read Table
            //objectTableGeneral.readCurrentTableInfo();

            // Set to active current tab
            $('#component_sidebar_tables .contents a.menu_table').removeClass('active');
            $(e.currentTarget).addClass('active');
        });
    }

    readCurrentTableInfo(){
        // Wait animation
        let wait = new wtools.ElementState('#table_name', false, 'button', new wtools.WaitAnimation().for_button);

        // Get Form identifier
        const table_identifier = super.getTableIdentifier();

        // Request
        this.table.read(table_identifier).then((response_data) => {
            // Clean
            wait.Off_();
            $('#table_name').html('');

            // Manage response
            const result = new ResponseManager(response_data, '#wait_animation_page', 'Data: A&ntilde;adir');
            if(!result.Verify_()){
                new wtools.ElementState('#wait_animation_page', true, 'block', new wtools.WaitAnimation().for_page);
                window.location.href = "/start/";
                return;
            }
            
            // Setup table name
            const table_name = response_data.body.data[0].name;
            if(table_name == undefined){
                new wtools.ElementState('#wait_animation_page', true, 'block', new wtools.WaitAnimation().for_page);
                window.location.href = "/start/";
            }else{
                $('#table_name').html(table_name);
                $('.table_title').html(table_name);
            }
        });
    }

    readSidebarTables(){
        // Wait animation
        let wait = new wtools.ElementState('#component_sidebar_tables .notifications', false, 'block', new wtools.WaitAnimation().for_block);

        // Get Form identifier
        const table_identifier = super.getTableIdentifier();

        // Request
        this.table.readAll().then((response_data) => {
            // Clean
            wait.Off_();

            // Manage response
            const result = new ResponseManager(response_data, '#notifications', '');
            if(!result.Verify_())
                return;

            // Handle zero results
            if(response_data.body.data == undefined || response_data.body.data.length < 1){
                new wtools.Notification('SUCCESS', 0, '#component_sidebar_tables .notifications').Show_('Sin resultados.');
                return;
            }

            // Results elements creator: Sidebar
            $('#component_sidebar_tables .contents').html('');
            $('#component_sidebar_tables .contents').hide();
            let elements = [];
            for(let row of response_data.body.data){
                elements.push(`
                    <a class="menu_table nav-link mb-2 ${row.identifier == table_identifier ? "active" : ""}" href="/table?t=${row.identifier}" table-identifier="${row.identifier}">
                        <i class="fas fa-table"></i>
                        <span class="ms-2">${row.name}</span>
                    </a>
                `);
            }

            let ui_element = new wtools.UIElementsPackage('<div class="nav-item"></div>', elements).Pack_();
            $('#component_sidebar_tables .contents').append(ui_element);

            super.hideTablesWithoutPermission();
            $('#component_sidebar_tables .contents').show();
        });
    };
}