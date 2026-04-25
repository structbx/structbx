import { BaseController } from './base_controller.js';
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

    bindEvents() {
        // Wait animation
        let wait = new wtools.ElementState('#wait_animation_page', true, 'block', new wtools.WaitAnimation().for_page);

        super.bindEvents();
        
        this.verifySession();

        new DOME.Sidebars().SidebarMenu_();
        new DOME.Headers().Header_();
        new DOME.Footers().Footer_();
        new wtools.MenuManager('#menu_main', true);

        super.hideWithoutPermission();

        super.readInstanceName();
        super.readCurrentDatabase();
        super.readCurrentUser();

        // SELECT options
        const options_states = new wtools.SelectOptions
        ([
            new wtools.OptionValue("activo", "Activo", true)
            ,new wtools.OptionValue("inactivo", "Inactivo")
        ]);
        options_states.Build_('#component_tables_add select[name="state"]');
        options_states.Build_('#component_tables_modify select[name="state"]');

        const options_privacity = new wtools.SelectOptions
        ([
            new wtools.OptionValue("publico", "P&uacute;blico", true)
            ,new wtools.OptionValue("interno", "Interno")
        ]);
        options_privacity.Build_('#component_tables_add select[name="privacity"]');
        options_privacity.Build_('#component_tables_modify select[name="privacity"]');

        this.readTables();

        wait.Off_();
    }

    async verifySession()
    {
        // Request
        const response_data = await this.session.login();
        if(response_data.status != 200)
        {
            new wtools.ElementState('#wait_animation_page', true, 'block', new wtools.WaitAnimation().for_page);
            window.location.href = "/login/";
            return;
        }
    };

    async readTables(){
        // Wait animation
        let wait = new wtools.ElementState('#component_tables_read .notifications', false, 'block', new wtools.WaitAnimation().for_block);

        // Request
        const response_data = this.table.read();
    
        // Clean
        wait.Off_();
        $('#component_tables_read .notifications').html('');
        $('#component_tables_read .contents').html('');

        // Manage response
        const result = new ResponseManager(response_data, '#component_tables_read .notifications', 'Tablas: Leer');
        if(!result.Verify_())
            return;

        if(response_data.body.data.length < 1)
        {
            $('#component_tables_read .contents').html('');
            $('#component_tables_read .contents').append(`
                <div class="p-2 text-center">
                    <button class="btn btn-primary table_add">
                        <i class="fas fa-plus"></i> Crear tabla
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
            if(cont < 2)
            {
                elements.push(`
                    <div class="col-md-4 col-lg-3 mb-4" table-identifier="${row.identifier}">
                        <div class="card card-table-item h-100 shadow-sm d-flex flex-column">
                            
                            <a href="/table?identifier=${row.identifier}" class="p-3 flex-grow-1 text-decoration-none text-dark">
                                <div class="border-start border-3 border-primary ps-2">
                                    <h5 class="mb-1">${row.name}</h5>
                                    <p class="text-muted small mb-3">${row.description}</p>
                                </div>
                                
                                <div class="mt-2">
                                    <span class="badge rounded-pill bg-dark me-2"><i class="fas fa-pen fa-fw"></i> ${row.total}</span>
                                </div>
                            </a>
                            
                            <div class="card-footer d-flex justify-content-end bg-light border-0 pt-0">
                                <a href="/table/columns?identifier=${row.identifier}" class="btn btn-outline-secondary btn-sm me-2" title="Columnas">
                                    <i class="fas fa-columns"></i>
                                </a>
                                <a href="/table/settings?identifier=${row.identifier}" class="btn btn-outline-secondary btn-sm" title="Ajustes">
                                    <i class="fas fa-cog"></i>
                                </a>
                            </div>
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
        await super.hideTablesWithoutPermission();
        $('#component_tables_read .contents').show();
    };
}