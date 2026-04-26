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

        this.verifySession();
        new DOME.Headers().Header_();
        this.readCurrentTableInfo();
        this.readSidebarTables();

        wait.Off_();
    }

    bindEvents() {
        super.bindEvents();
    }

    verifySession(){
        // Request
        this.session.login().then((response_data) => {
            if(response_data.status != 200){
                new wtools.ElementState('#wait_animation_page', true, 'block', new wtools.WaitAnimation().for_page);
                window.location.href = "/login/";
                return;
            }
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
                    <a class="menu_data nav-link mb-2 ${row.identifier == table_identifier ? "active" : ""}" href="/table?t=${row.identifier}" table-identifier="${row.identifier}">
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