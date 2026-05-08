import { BaseController } from '../modules/base_controller.js';
import * as tools from '../classes/tools.js';
import * as DOME from '../classes/dom_elements.js';
import { ResponseManager } from '../classes/response_manager.js';
import { TableElements } from '../classes/table_elements.js';

import { TableData } from '../models/TableData.js';
import { TableColumn } from '../models/TableColumn.js';

export class DataController extends BaseController{
    constructor(onChangedCallback = () => {}) {
        super();
        this.onChanged = onChangedCallback;

        this.tableData = new TableData;
        this.tableColumn = new TableColumn;

        this.notification.read = new wtools.Notification('WARNING', 5000, '#component_data_read .notifications');
        this.notification.add = new wtools.Notification('WARNING', 5000, '#component_data_add .notifications');
        this.notification.modify = new wtools.Notification('WARNING', 5000, '#component_data_modify .notifications');
        this.notification.delete = new wtools.Notification('WARNING', 5000, '#component_data_delete .notifications');
        
        this.changeInt = 0;
        this.changeIntInit = false;
        this.data_read_page = 1;
        this.data_read_limit = 20;
        this.data_read_page_end = false;
        this.data_read_columns = [];
        this.users_in_database = {};
        this.read_mutex = false;
        this.colorsSelect = 
        [
            {color: '#4361ee', html: `<span class='small' style='background-color:#4361ee;color:#fff;padding:2px 8px;border-radius:4px;'>Azul Principal</span>`},
            {color: '#3a0ca3', html: `<span class='small' style='background-color:#3a0ca3;color:#fff;padding:2px 8px;border-radius:4px;'>Azul Oscuro</span>`},
            {color: '#4cc9f0', html: `<span class='small' style='background-color:#4cc9f0;color:#000;padding:2px 8px;border-radius:4px;'>Azul Claro</span>`},
            {color: '#7209b7', html: `<span class='small' style='background-color:#7209b7;color:#fff;padding:2px 8px;border-radius:4px;'>Púrpura</span>`},
            {color: '#f72585', html: `<span class='small' style='background-color:#f72585;color:#fff;padding:2px 8px;border-radius:4px;'>Rosa</span>`},
            {color: '#2ec4b6', html: `<span class='small' style='background-color:#2ec4b6;color:#fff;padding:2px 8px;border-radius:4px;'>Turquesa</span>`},
            {color: '#e71d36', html: `<span class='small' style='background-color:#e71d36;color:#fff;padding:2px 8px;border-radius:4px;'>Rojo</span>`},
            {color: '#ff9f1c', html: `<span class='small' style='background-color:#ff9f1c;color:#000;padding:2px 8px;border-radius:4px;'>Naranja</span>`},
            {color: '#ffd166', html: `<span class='small' style='background-color:#ffd166;color:#000;padding:2px 8px;border-radius:4px;'>Amarillo</span>`},
            {color: '#06d6a0', html: `<span class='small' style='background-color:#06d6a0;color:#000;padding:2px 8px;border-radius:4px;'>Verde</span>`},
            {color: '#118ab2', html: `<span class='small' style='background-color:#118ab2;color:#fff;padding:2px 8px;border-radius:4px;'>Azul Marino</span>`},
            {color: '#073b4c', html: `<span class='small' style='background-color:#073b4c;color:#fff;padding:2px 8px;border-radius:4px;'>Azul Noche</span>`},
            {color: '#ef476f', html: `<span class='small' style='background-color:#ef476f;color:#fff;padding:2px 8px;border-radius:4px;'>Coral</span>`},
            {color: '#9b5de5', html: `<span class='small' style='background-color:#9b5de5;color:#fff;padding:2px 8px;border-radius:4px;'>Lila</span>`},
            {color: '#00bbf9', html: `<span class='small' style='background-color:#00bbf9;color:#fff;padding:2px 8px;border-radius:4px;'>Celeste</span>`},
            {color: '#00f5d4', html: `<span class='small' style='background-color:#00f5d4;color:#000;padding:2px 8px;border-radius:4px;'>Cian</span>`},
            {color: '#fee440', html: `<span class='small' style='background-color:#fee440;color:#000;padding:2px 8px;border-radius:4px;'>Amarillo Limón</span>`},
            {color: '#f15bb5', html: `<span class='small' style='background-color:#f15bb5;color:#fff;padding:2px 8px;border-radius:4px;'>Rosa Fuerte</span>`},
            {color: '#9b2226', html: `<span class='small' style='background-color:#9b2226;color:#fff;padding:2px 8px;border-radius:4px;'>Rojo Vino</span>`},
            {color: '#005f73', html: `<span class='small' style='background-color:#005f73;color:#fff;padding:2px 8px;border-radius:4px;'>Verde Azulado</span>`},
            {color: '#0a9396', html: `<span class='small' style='background-color:#0a9396;color:#fff;padding:2px 8px;border-radius:4px;'>Verde Mar</span>`},
            {color: '#94d2bd', html: `<span class='small' style='background-color:#94d2bd;color:#000;padding:2px 8px;border-radius:4px;'>Verde Pastel</span>`},
            {color: '#e9d8a6', html: `<span class='small' style='background-color:#e9d8a6;color:#000;padding:2px 8px;border-radius:4px;'>Beige</span>`},
            {color: '#ee9b00', html: `<span class='small' style='background-color:#ee9b00;color:#000;padding:2px 8px;border-radius:4px;'>Ocre</span>`},
            {color: '#ca6702', html: `<span class='small' style='background-color:#ca6702;color:#fff;padding:2px 8px;border-radius:4px;'>Marrón</span>`},
            {color: '#bb3e03', html: `<span class='small' style='background-color:#bb3e03;color:#fff;padding:2px 8px;border-radius:4px;'>Terracota</span>`},
            {color: '#ae2012', html: `<span class='small' style='background-color:#ae2012;color:#fff;padding:2px 8px;border-radius:4px;'>Rojo Óxido</span>`},
            {color: '#9b5de5', html: `<span class='small' style='background-color:#9b5de5;color:#fff;padding:2px 8px;border-radius:4px;'>Púrpura Vibrante</span>`},
            {color: '#f3722c', html: `<span class='small' style='background-color:#f3722c;color:#fff;padding:2px 8px;border-radius:4px;'>Naranja Quemado</span>`},
            {color: '#577590', html: `<span class='small' style='background-color:#577590;color:#fff;padding:2px 8px;border-radius:4px;'>Gris Azulado</span>`},
            {color: '#43aa8b', html: `<span class='small' style='background-color:#43aa8b;color:#fff;padding:2px 8px;border-radius:4px;'>Verde Jade</span>`},
            {color: '#90be6d', html: `<span class='small' style='background-color:#90be6d;color:#000;padding:2px 8px;border-radius:4px;'>Verde Lima</span>`},
            {color: '#f9c74f', html: `<span class='small' style='background-color:#f9c74f;color:#000;padding:2px 8px;border-radius:4px;'>Amarillo Mostaza</span>`},
            {color: '#f8961e', html: `<span class='small' style='background-color:#f8961e;color:#000;padding:2px 8px;border-radius:4px;'>Naranja Calabaza</span>`},
            {color: '#f94144', html: `<span class='small' style='background-color:#f94144;color:#fff;padding:2px 8px;border-radius:4px;'>Rojo Fuego</span>`},
            {color: '#277da1', html: `<span class='small' style='background-color:#277da1;color:#fff;padding:2px 8px;border-radius:4px;'>Azul Cobalto</span>`},
            {color: '#8338ec', html: `<span class='small' style='background-color:#8338ec;color:#fff;padding:2px 8px;border-radius:4px;'>Violeta</span>`},
            {color: '#3a86ff', html: `<span class='small' style='background-color:#3a86ff;color:#fff;padding:2px 8px;border-radius:4px;'>Azul Brillante</span>`},
            {color: '#fb5607', html: `<span class='small' style='background-color:#fb5607;color:#fff;padding:2px 8px;border-radius:4px;'>Naranja Neón</span>`},
            {color: '#ff006e', html: `<span class='small' style='background-color:#ff006e;color:#fff;padding:2px 8px;border-radius:4px;'>Rosa Neón</span>`},
            {color: '#8338ec', html: `<span class='small' style='background-color:#8338ec;color:#fff;padding:2px 8px;border-radius:4px;'>Púrpura Eléctrico</span>`},
            {color: '#3a86ff', html: `<span class='small' style='background-color:#3a86ff;color:#fff;padding:2px 8px;border-radius:4px;'>Azul Eléctrico</span>`},
            {color: '#ffbe0b', html: `<span class='small' style='background-color:#ffbe0b;color:#000;padding:2px 8px;border-radius:4px;'>Amarillo Eléctrico</span>`},
            {color: '#fb5607', html: `<span class='small' style='background-color:#fb5607;color:#fff;padding:2px 8px;border-radius:4px;'>Naranja Eléctrico</span>`},
            {color: '#ff006e', html: `<span class='small' style='background-color:#ff006e;color:#fff;padding:2px 8px;border-radius:4px;'>Magenta</span>`},
            {color: '#4d908e', html: `<span class='small' style='background-color:#4d908e;color:#fff;padding:2px 8px;border-radius:4px;'>Verde Grisáceo</span>`},
            {color: '#577590', html: `<span class='small' style='background-color:#577590;color:#fff;padding:2px 8px;border-radius:4px;'>Azul Gris</span>`},
            {color: '#f9844a', html: `<span class='small' style='background-color:#f9844a;color:#000;padding:2px 8px;border-radius:4px;'>Salmón</span>`},
            {color: '#90be6d', html: `<span class='small' style='background-color:#90be6d;color:#000;padding:2px 8px;border-radius:4px;'>Verde Manzana</span>`},
            {color: '#f9c74f', html: `<span class='small' style='background-color:#f9c74f;color:#000;padding:2px 8px;border-radius:4px;'>Oro</span>`},
            {color: '#43aa8b', html: `<span class='small' style='background-color:#43aa8b;color:#fff;padding:2px 8px;border-radius:4px;'>Esmeralda</span>`},
            {color: '#f3722c', html: `<span class='small' style='background-color:#f3722c;color:#fff;padding:2px 8px;border-radius:4px;'>Calabaza</span>`},
            {color: '#577590', html: `<span class='small' style='background-color:#577590;color:#fff;padding:2px 8px;border-radius:4px;'>Pizarra</span>`},
            {color: '#277da1', html: `<span class='small' style='background-color:#277da1;color:#fff;padding:2px 8px;border-radius:4px;'>Azul Acero</span>`},
            {color: '#f94144', html: `<span class='small' style='background-color:#f94144;color:#fff;padding:2px 8px;border-radius:4px;'>Carmesí</span>`}
        ];

        this.row_cell = (contents) => {
            return `<div class="data-cell editable" style="width: 200px; flex: 0 0 200px;">${contents}</div>`;
        }
        this.column_cell = (identifier, contents) => {
            return `
                <div class="header-cell" column-identifier="${identifier}" style="width: 200px; flex: 0 0 200px;">
                    <div class="header-content">
                        <span>${contents}</span>
                    </div>
                    <div class="resize-handle"></div>
                </div>`;
        }

        this.column_placeholder = () => {
            return `
                <div class="" style="width: 200px; flex: 0 0 200px;">
                    <div class="placeholder-glow">
                        <span class="placeholder col-7 rounded-pill bg-secondary"></span>
                    </div>
                </div>`;
        }
        this.row_placeholder = () => {
            let cells = [
                `<div class="placeholder-glow" style="width: 200px; flex: 0 0 200px;">
                    <span class="placeholder col-9 rounded-pill bg-secondary"></span>
                </div>`
                ,`<div class="placeholder-glow" style="width: 200px; flex: 0 0 200px;">
                    <span class="placeholder col-5 rounded-pill bg-secondary"></span>
                </div>`
                ,`<div class="placeholder-glow" style="width: 200px; flex: 0 0 200px;">
                    <span class="placeholder col-9 rounded-pill bg-secondary"></span>
                </div>`
                ,`<div class="placeholder-glow" style="width: 200px; flex: 0 0 200px;">
                    <span class="placeholder col-5 rounded-pill bg-secondary"></span>
                </div>`
                ,`<div class="placeholder-glow" style="width: 200px; flex: 0 0 200px;">
                    <span class="placeholder col-9 rounded-pill bg-secondary"></span>
                </div>`
            ];
            cells.sort(() => Math.random() - 0.5);
            let final = '';
            for(const cell of cells)
                final += cell;
            return `<div class="data-row">${final}</div>`;
        }

        // Basic <td> row - creates a standard text cell with no special formatting.
        this.basic_row = (elements, row, column, link_color = undefined) => {
            // Get the header value from the row object using the specified column name.
            let header = row[column];
            
            // If a specific link color is provided and not an empty string, apply it to the header.
            if(link_color != undefined && link_color != "")
                header = tools.headerRowColor(link_color, row[column]);

            // Append the formatted header cell to the elements array.
            elements.push(this.row_cell(header));
        };

        // Header <td> row - creates a cell with styled text and color based on metadata.
        this.header_row = (elements, row, column) => {
            // Create a span element for the header.
            let header = `<span class="row-header">${row[column]}</span>`;
            
            // If there's specific color metadata for this column, apply it to the header.
            if(row["_structbx_column_colorHeader"] != undefined && row["_structbx_column_colorHeader"] != "")
                header = tools.headerRowColor(row["_structbx_column_colorHeader"], row[column]);

            // Append the styled header cell to the elements array.
            elements.push(this.row_cell(header));
        };

        // User <td> row - creates a cell with user names based on their IDs in the users_in_database object.
        this.user_row = (elements, row, column) => {
            // Check if the user ID exists in the users_in_database object. If so, display the user's name; otherwise, display the user ID itself.
            if(this.users_in_database[row[column]] != undefined)
                elements.push(this.row_cell(this.users_in_database[row[column]]));
            else
                elements.push(this.row_cell(row[column]));
        };

        // Image <td> row - creates a cell with an image based on the filepath provided in the row object.
        this.image_row = (elements, row, column) => {
            // Construct the URL for the image file and append it to the elements array.
            elements.push(this.row_cell(`<img class="" src="/api/tables/data/file/read?filepath=${row[column]}&table-identifier=${this.getTableIdentifier()}" alt="${column}" width="100px">`));
        };

        // File <td> row - creates a cell with truncated text for files longer than 10 characters.
        this.file_row = (elements, row, column) => {
            // If the file length exceeds 10 characters, truncate it and append to the elements array.
            if(row[column].length > 10){
                let new_content = "";
                let max = row[column].length - 1;
                for(let i = max; i > max - 10; i--)
                    new_content = row[column][i] + new_content;

                elements.push(this.row_cell(new_content));
            }
            else
                // Otherwise, create a basic row with the file name.
                this.basic_row(elements, row, column);
        };

        this.build();
    }

    build(){
        this.clear();
        this.setupPlaceholders();

        this.colorSelectAdd = new DOME.CustomSelect('#component_data_add_colorHeader');
        this.colorSelectModify = new DOME.CustomSelect('#component_data_modify_colorHeader');

        this.colorSelectAdd.AddOption_('', '-- Ninguno --');
        this.colorSelectModify.AddOption_('', '-- Ninguno --');
        this.colorsSelect.forEach(colorOption => {
            this.colorSelectAdd.AddOption_(colorOption.color, colorOption.html);
            this.colorSelectModify.AddOption_(colorOption.color, colorOption.html);
        });
        this.colorSelectAdd.hiddenInput.attr('name', '_structbx_column_colorHeader');
        this.colorSelectModify.hiddenInput.attr('name', '_structbx_column_colorHeader');
    }

    bindEvents(){
        // Pagination
        $('#component_data_read .contents').on("scroll", function(e){
            if(e.currentTarget.scrollTop + e.currentTarget.clientHeight >= e.currentTarget.scrollHeight){
                if($('#component_data_read table tbody').html() != "")
                    this.read();
            }
        });
        
        // Data reload button
        $('#component_data_reload').click(() => this.read(true));
        
        // Click on add data button
        $('.data_add').click((e) => {
            e.preventDefault();
            this.preAdd();
        });

        // Add record
        $('#component_data_add form').submit((e) => {
            e.preventDefault();
            this.add(e);
        });
        
        // Read columns and data to modify
        $(document).on("click", '#component_data_read .data-row', (e) => {
            e.preventDefault();
            this.preModify(e);
        });
        
        // Modify record
        $('#component_data_modify form').submit((e) => {
            e.preventDefault();
            this.modify(e);
        });

        // Read record to Delete
        $('#component_data_modify .delete').click((e) => {
            e.preventDefault();
            this.preDelete(e);
        });
        
        // Delete record
        $('#component_data_delete form').submit((e) => {
            e.preventDefault();
            this.delete();
        });
        
        // Export Data
        $('.data_export').click((e) => {
            e.preventDefault();
            $('#component_data_export').modal('show');
        });

        $('#component_data_export .export').click((e) => {
            e.preventDefault();
            this.export();
        });
    }

    clear()
    {
        // Clear previous data
        $('#component_data_read #headerRow').html("");
        $('#component_data_read #tableBody').html("");
    }

    setupPlaceholders(){
        for(let cont = 0; cont < 5; cont++){
            $('#component_data_read #headerRow').append($(this.column_placeholder()));
            $('#component_data_read #tableBody').append($(this.row_placeholder()));
        }
    }

    start()
    {
        //this.ReadUsersInDatabase_(() => this.read());
        //setInterval(this.changeIntVerification.bind(this), 5000);
    }

    createColumn(response_data){
        // Variables
        let keys = response_data.body.columns_meta.data;

        // Setup columns meta
        new wtools.UIElementsCreator('#component_data_read #headerRow', keys)
        .Build_((column) => {
            if(column.identifier == "identifier")
                return undefined;

            if(column.visible == 0)
                return undefined;

            // Setup columns and icon
            let table_element_object = new TableElements(wtools.IFUndefined(column.column_type, "text"), column, this.getTableIdentifier());
            let table_icon = table_element_object.GetIcon_(false);

            return [this.column_cell(column.identifier, table_icon + column.name)];
        });
    }

    createRow(response_data, row)
    {
        let elements = [];

        // Loop through each column in the response_data.body.columns array.
        let key = 0;
        for(let column of response_data.body.columns){
            // Skip columns that start with "_structbx_column_" or are named "id".
            if(column.includes("_structbx_column") || column == "identifier")
                continue;

            // Get the metadata for this column from response_data.body.columns_meta.data.
            let column_meta = response_data.body.columns_meta.data[key];

            // If there's metadata and a value exists for this column, process it based on its type.
            if(column_meta != undefined && row[column] != ""){
                let link_color = row[`_structbx_column_${column_meta.identifier}_colorHeader`];

                // Determine the appropriate function to create the cell based on the column type.
                if(column_meta.column_type == "image")
                    this.image_row(elements, row, column);
                else if(column_meta.column_type == "file")
                    this.file_row(elements, row, column);
                else if(column_meta.column_type == "user" || column_meta.column_type == "current-user")
                    this.user_row(elements, row, column);
                else if(key == 0)
                    this.header_row(elements, row, column);
                else
                    this.basic_row(elements, row, column, link_color);
            }
            else
                // If no metadata or the value is empty, create a basic row.
                this.basic_row(elements, row, column);

            key++;
        }

        // Return the array of formatted <td> cells.
        return elements;
    }

    getPath = (reload, clean = true) => {
        // Path request
        let path = "";
        if(reload){
            // Set current limit
            //this.data_read_limit = $('#component_data_read table tbody')[0].rows.length;
            this.data_read_limit = 20 * this.data_read_page;
            if(clean)
                $('#component_data_read table tbody').html('');

            // Setup path
            if(this.data_read_limit < 20)
                path = `&limit=20`;
            else
                path = `&limit=${this.data_read_limit}`;
        } else {
            // Setup path
            path = `&page=${this.data_read_page}`;
        }
        return path;
    }

    getBodyData = (response_data) => {
        if (response_data.body == undefined || response_data.body.data == undefined)
            return [];
        else
            return response_data.body.data;
    }

    freeMutex(){
        this.read_mutex = false;
    }

    read = (reload = false) => {
        try{
            // Verify mutex
            if(this.read_mutex)
                return;

            // Set mutex
            this.read_mutex = true;

            // Exit if end of results and no reload
            if(this.data_read_page_end && reload == false){
                this.freeMutex();
                return;
            }

            if(reload){
                this.clear();
                this.setupPlaceholders();
            }

            // Get path
            const path = this.getPath(reload);
            if(path == ""){
                this.freeMutex();
                return;
            }

            // Request
            this.tableData.readAll(this.getTableIdentifier(), this.getViewIdentifier(), path)
            .then((response_data) => {
                // Get data
                let data = this.getBodyData(response_data);

                // Clean
                $('#component_data_read .notifications').html('');
                if(reload)
                    this.clear();

                // Manage response
                const result = new ResponseManager(response_data, '#component_data_read .notifications', 'Data: Leer');
                if(!result.Verify_()){
                    this.freeMutex();
                    return;
                }

                // Results elements creator (Columns)
                if($('#component_data_read #headerRow').html() == "" && response_data.body.columns_meta != undefined){
                    this.createColumn(response_data);
                }

                // No end of results
                this.data_read_page_end = false;

                // Verify if results is lower than limit (data end reached)
                if(data.length < this.data_read_limit)
                    this.data_read_page_end = true;

                // Handle zero results
                if(data.length < 1){
                    // End of results reached
                    this.data_read_page_end = true;
                    this.freeMutex();
                    return;
                }

                // Results elements creator (Rows)
                new wtools.UIElementsCreator('#component_data_read #tableBody', data).Build_((row) => {
                    // Create rows
                    const elements = this.createRow(response_data, row);
                    return new wtools.UIElementsPackage(`<div id="${row.identifier}" class="data-row" identifier="${row.identifier}"></div>`, elements).Pack_();
                });

                // Next page if not reload
                if(!reload)
                    this.data_read_page++;

                // Change int verification
                this.changeIntVerification();

                // Free mutex
                this.freeMutex();
            });
        } catch(error) {
            // Free mutex
            this.freeMutex();

            new wtools.Notification('ERROR').Show_(`Ocurri&oacute; un error.`);
            return;
        }
    };

    updateRow(row_identifier){
        try{
            // Get Data Identifier
            if(row_identifier == undefined){
                new wtools.Notification('WARNING').Show_('No se encontr&oacute; el identificador del registro.');
                return;
            }

            $('#component_data_modify .notifications').html('');
            
            // Request row
            this.tableData.readByIdentifier(row_identifier, this.getTableIdentifier(), this.getViewIdentifier())
            .then((response_data) => {
                // Manage response
                const result = new ResponseManager(response_data, '', 'Data: Leer (1)');
                if(!result.Verify_())
                    return;
    
                // Handle no results or zero results
                if(response_data.body.data.length < 1)
                    return;

                // Results elements creator (Rows)
                const elements = this.createRow(response_data, response_data.body.data[0]);

                // Update row
                $('#' + row_identifier).html('');
                for(let element of elements){
                    $('#' + row_identifier).append(element);
                }
            });

        }
        catch(error){
            new wtools.Notification('ERROR').Show_(`Ocurri&oacute; un error: ${error}.`);
            return;
        }
    };
    
    changeIntVerification(){
        // Request
        this.tableData.changeInt(this.changeInt, this.getTableIdentifier()).then((response_data) =>
        {
            const data = response_data.body.data;
            if(data != undefined && data.length > 0){
                if(!this.changeIntInit){
                    // Firs init of changeInit (only update changeInt value to the last element id)
                    this.changeInt = data[data.length - 1].id;
                    this.changeIntInit = true;
                } else {
                    // If there is new changeInt, refresh rows
                    let reload = false;
                    for(let row of data) {
                        this.changeInt = row.id;
                        switch(row.operation){
                            case "insert":
                                reload = true;
                                break;
                            case "update":
                                this.updateRow(row.id_row);
                                break;
                            case "delete":
                                $(`#${row.id_row}`).remove();
                                break;
                            case "import":
                                reload = true;
                                break;
                        }
                    }
                    if(reload)
                        this.read(true);
                }
            }
        });
    };

    setupColumn(row, elements, first, target, value = undefined){
        // If column type is a NORMAL type
        let table_element_object = new TableElements(wtools.IFUndefined(row.column_type, "text"), row, this.getTableIdentifier());
        let table_element = $(table_element_object.Get_());
        let table_icon = table_element_object.GetIcon_();

        if(table_element == undefined){
            new wtools.Notification('ERROR').Show_('Error al crear un elemento de tabla.');
            return false;
        }

        // If column type is SELECTION
        if(row.column_type == "selection"){
            table_element = $('<td></td>');
            let customSelect = new DOME.CustomSelect(table_element);
            customSelect.hiddenInput.attr('name', row.identifier);
            this.linkSelectionOptions(customSelect, row.link_to, row.name, `${target} .notifications`, value);
        }
        else if(row.column_type == "user")
            this.linkUsersInDatabaseOptions(table_element, `${target} .notifications`, value);

        // Final elements
        elements.push(`<th scope="row">${table_icon}${row.name}</th>`);
        elements.push(table_element);

        if(first){
            $(`${target} .form_input_header`).append(`<h5 class="mb-2">${table_icon}${row.name}</h5>`);
            $(`${target} .form_input_header`).append($(table_element).children().first());
            return false;
        }

        return true;
    }

    preAdd(){
        try{
            $('#component_data_add .notifications').html('');

            // Wait animation
            let wait = new wtools.ElementState('#wait_animation_page', true, 'block', new wtools.WaitAnimation().for_page);

            // Setup data columns
            $('#component_data_add .form_input_header').html('');
            $('#component_data_add table tbody').html('');
            
            // Read and setup columns
            this.tableColumn.read(this.getTableIdentifier(), this.getViewIdentifier())
            .then((response_data) => {
                // Manage response
                const result = new ResponseManager(response_data, '', 'Data: Columnas: Leer');
                if(!result.Verify_())
                    return;    

                // Handle zero results
                if(response_data.body.data.length < 1){
                    wait.Off_();
                    new wtools.Notification('WARNING').Show_('Debe crear columnas para agregar registros.');
                    return;
                }
                
                // Results elements creator
                let first = true;
                new wtools.UIElementsCreator('#component_data_add table tbody', response_data.body.data)
                .Build_((row) => {
                    if(row.identifier == "identifier")
                        return undefined;

                    let elements = [];
                    if(!this.setupColumn(row, elements, first, '#component_data_add')){
                        first = false;
                        return;
                    }
                    
                    return new wtools.UIElementsPackage('<tr></tr>', elements).Pack_();
                });

                wait.Off_();
                $('#component_data_add form').removeClass('was-validated');
                $('#component_data_add').modal('show');
            });

        } catch(error) {
            new wtools.Notification('ERROR').Show_(`Ocurri&oacute; un error: ${error}.`);
            return;
        }
    };

    add(e){
        // Wait animation
        let wait = new wtools.ElementState('#component_data_add form button[type=submit]', true, 'button', new wtools.WaitAnimation().for_button);

        // Form check
        const check = new wtools.FormChecker(e.target).Check_();
        if(!check){
            wait.Off_();
            $('#component_data_add .notifications').html('');
            new wtools.Notification('WARNING', 5000, '#component_data_add .notifications').Show_('Hay campos inv&aacute;lidos.');
            return;
        }

        // Data collection
        let data = new FormData($('#component_data_add form')[0]);
        data.append('table-identifier', this.getTableIdentifier());

        // Request
        this.tableData.add(data).then((response_data) =>
        {
            wait.Off_();
            
            // Manage response
            const result = new ResponseManager(response_data, '#component_data_add .notifications', 'Data: A&ntilde;adir');
            if(!result.Verify_())
                return;

            new wtools.Notification('SUCCESS').Show_('Registro guardado.');
            $('#component_data_add').modal('hide');
            this.changeIntVerification();
        });
    }

    preModify(e){
        try{
            // Wait animation   
            let wait = new wtools.ElementState('#wait_animation_page', true, 'block', new wtools.WaitAnimation().for_page);

            // Get Data ID
            let identifier = $(e.currentTarget).attr('identifier');
            if(identifier == undefined){
                wait.Off_();
                new wtools.Notification('WARNING').Show_('No se encontr&oacute; el identificador del registro.');
                return;
            }
            $('#component_data_modify input[name="identifier"]').val(identifier);

            // Setup form to modify
            $('#component_data_modify .form_input_header').html('');
            $('#component_data_modify table tbody').html('');
            $('#component_data_modify .notifications').html('');
            
            // Read form to modify
            this.tableData.readByIdentifier(identifier, this.getTableIdentifier(), this.getViewIdentifier())
            .then((response_data) => {
                // Manage response
                const result = new ResponseManager(response_data, '', 'Data: Modificar');
                if(!result.Verify_()){
                    wait.Off_();
                    return;
                }
    
                // Handle no results or zero results
                if(response_data.body.data.length < 1){
                    wait.Off_();
                    new wtools.Notification('SUCCESS').Show_('Sin resultados.');
                    return;
                }

                // Add values to columns_data
                let data = response_data.body.columns_meta.data;
                for(let it of data)
                    it.value = response_data.body.data[0][it.name];

                // Setup color header
                this.colorSelectModify.setValue(response_data.body.data[0]._structbx_column_colorHeader);

                // Results elements creator
                let first = true;
                new wtools.UIElementsCreator('#component_data_modify table tbody', data)
                .Build_((row) => {
                    let elements = [];
                    if(!this.setupColumn(row, elements, first, '#component_data_modify', row.value)){
                        first = false;
                        return;
                    }
                    
                    return new wtools.UIElementsPackage('<tr></tr>', elements).Pack_();
                });

                wait.Off_();
                $('#component_data_modify form').removeClass('was-validated');
                $('#component_data_modify').modal('show');
            });

        } catch(error) {
            new wtools.Notification('ERROR').Show_(`Ocurri&oacute; un error: ${error}.`);
            return;
        }
    }

    modify(e){
        // Wait animation
        let wait = new wtools.ElementState('#component_data_modify form button[type=submit]', true, 'button', new wtools.WaitAnimation().for_button);

        // Form check
        const check = new wtools.FormChecker(e.target).Check_();
        if(!check){
            wait.Off_();
            $('#component_data_modify .notifications').html('');
            new wtools.Notification('WARNING', 5000, '#component_data_modify .notifications').Show_('Hay campos inv&aacute;lidos.');
            return;
        }

        // Data collection
        let data = new FormData($('#component_data_modify form')[0]);
        data.append('table-identifier', this.getTableIdentifier());

        // Request
        this.tableData.modify(data).then((response_data) => {
            wait.Off_();
            
            // Manage response
            const result = new ResponseManager(response_data, '#component_data_modify .notifications', 'Data: Modificar');
            if(!result.Verify_())
                return;

            new wtools.Notification('SUCCESS').Show_('Registro Actualizado.');
            $('#component_data_modify').modal('hide');
            this.changeIntVerification();
        });
    }
}