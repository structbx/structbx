import { BaseController } from '../modules/base_controller.js';
import * as tools from '../classes/tools.js';
import * as DOME from '../classes/dom_elements.js';
import { ResponseManager } from '../classes/response_manager.js';
import { TableElements } from '../classes/table_elements.js';
import { I18n } from '../i18n/i18n.js';

import { TableData } from '../models/TableData.js';
import { TableColumn } from '../models/TableColumn.js';
import { Table } from '../models/Table.js';

import { ColumnType } from '../constants/column_types.js';

export class DataController extends BaseController{
    constructor(onChangedCallback = () => {}) {
        super();
        this.onChanged = onChangedCallback;

        this.tableData = new TableData;
        this.tableColumn = new TableColumn;
        this.table = new Table;

        this.notification.read = new wtools.Notification('WARNING', 5000, '#component_data_read .notifications');
        this.notification.add = new wtools.Notification('WARNING', 5000, '#component_data_add .notifications');
        this.notification.modify = new wtools.Notification('WARNING', 5000, '#component_data_modify .notifications');
        this.notification.delete = new wtools.Notification('WARNING', 5000, '#component_data_delete .notifications');
        
        this.changeInt = 0;
        this.changeIntInit = false;
        this.data_read_page = 1;
        this.data_read_limit = 20;
        this.data_read_page_end = false;
        this.users_in_database = {};
        this.read_mutex = false;
        this.selectedRecords = new Set();
        this.batchEditIdentifiers = [];
        this.colorsSelect = 
        [
            {color: '#4361ee', html: `<span class='small' style='background-color:#4361ee;color:#fff;padding:2px 8px;border-radius:4px;'>${window.structbxI18n ? window.structbxI18n.t('color.primary_blue') : 'Primary Blue'}</span>`},
            {color: '#3a0ca3', html: `<span class='small' style='background-color:#3a0ca3;color:#fff;padding:2px 8px;border-radius:4px;'>${window.structbxI18n ? window.structbxI18n.t('color.dark_blue') : 'Dark Blue'}</span>`},
            {color: '#4cc9f0', html: `<span class='small' style='background-color:#4cc9f0;color:#000;padding:2px 8px;border-radius:4px;'>${window.structbxI18n ? window.structbxI18n.t('color.light_blue') : 'Light Blue'}</span>`},
            {color: '#7209b7', html: `<span class='small' style='background-color:#7209b7;color:#fff;padding:2px 8px;border-radius:4px;'>${window.structbxI18n ? window.structbxI18n.t('color.purple') : 'Purple'}</span>`},
            {color: '#f72585', html: `<span class='small' style='background-color:#f72585;color:#fff;padding:2px 8px;border-radius:4px;'>${window.structbxI18n ? window.structbxI18n.t('color.pink') : 'Pink'}</span>`},
            {color: '#2ec4b6', html: `<span class='small' style='background-color:#2ec4b6;color:#fff;padding:2px 8px;border-radius:4px;'>${window.structbxI18n ? window.structbxI18n.t('color.turquoise') : 'Turquoise'}</span>`},
            {color: '#e71d36', html: `<span class='small' style='background-color:#e71d36;color:#fff;padding:2px 8px;border-radius:4px;'>${window.structbxI18n ? window.structbxI18n.t('color.red') : 'Red'}</span>`},
            {color: '#ff9f1c', html: `<span class='small' style='background-color:#ff9f1c;color:#000;padding:2px 8px;border-radius:4px;'>${window.structbxI18n ? window.structbxI18n.t('color.orange') : 'Orange'}</span>`},
            {color: '#ffd166', html: `<span class='small' style='background-color:#ffd166;color:#000;padding:2px 8px;border-radius:4px;'>${window.structbxI18n ? window.structbxI18n.t('color.yellow') : 'Yellow'}</span>`},
            {color: '#06d6a0', html: `<span class='small' style='background-color:#06d6a0;color:#000;padding:2px 8px;border-radius:4px;'>${window.structbxI18n ? window.structbxI18n.t('color.green') : 'Green'}</span>`},
            {color: '#118ab2', html: `<span class='small' style='background-color:#118ab2;color:#fff;padding:2px 8px;border-radius:4px;'>${window.structbxI18n ? window.structbxI18n.t('color.navy_blue') : 'Navy Blue'}</span>`},
            {color: '#073b4c', html: `<span class='small' style='background-color:#073b4c;color:#fff;padding:2px 8px;border-radius:4px;'>${window.structbxI18n ? window.structbxI18n.t('color.night_blue') : 'Night Blue'}</span>`},
            {color: '#ef476f', html: `<span class='small' style='background-color:#ef476f;color:#fff;padding:2px 8px;border-radius:4px;'>${window.structbxI18n ? window.structbxI18n.t('color.coral') : 'Coral'}</span>`},
            {color: '#9b5de5', html: `<span class='small' style='background-color:#9b5de5;color:#fff;padding:2px 8px;border-radius:4px;'>${window.structbxI18n ? window.structbxI18n.t('color.lilac') : 'Lilac'}</span>`},
            {color: '#00bbf9', html: `<span class='small' style='background-color:#00bbf9;color:#fff;padding:2px 8px;border-radius:4px;'>${window.structbxI18n ? window.structbxI18n.t('color.sky_blue') : 'Sky Blue'}</span>`},
            {color: '#00f5d4', html: `<span class='small' style='background-color:#00f5d4;color:#000;padding:2px 8px;border-radius:4px;'>${window.structbxI18n ? window.structbxI18n.t('color.cyan') : 'Cyan'}</span>`},
            {color: '#fee440', html: `<span class='small' style='background-color:#fee440;color:#000;padding:2px 8px;border-radius:4px;'>${window.structbxI18n ? window.structbxI18n.t('color.lime_yellow') : 'Lime Yellow'}</span>`},
            {color: '#f15bb5', html: `<span class='small' style='background-color:#f15bb5;color:#fff;padding:2px 8px;border-radius:4px;'>${window.structbxI18n ? window.structbxI18n.t('color.hot_pink') : 'Hot Pink'}</span>`},
            {color: '#9b2226', html: `<span class='small' style='background-color:#9b2226;color:#fff;padding:2px 8px;border-radius:4px;'>${window.structbxI18n ? window.structbxI18n.t('color.wine_red') : 'Wine Red'}</span>`},
            {color: '#005f73', html: `<span class='small' style='background-color:#005f73;color:#fff;padding:2px 8px;border-radius:4px;'>${window.structbxI18n ? window.structbxI18n.t('color.teal') : 'Teal'}</span>`},
            {color: '#0a9396', html: `<span class='small' style='background-color:#0a9396;color:#fff;padding:2px 8px;border-radius:4px;'>${window.structbxI18n ? window.structbxI18n.t('color.sea_green') : 'Sea Green'}</span>`},
            {color: '#94d2bd', html: `<span class='small' style='background-color:#94d2bd;color:#000;padding:2px 8px;border-radius:4px;'>${window.structbxI18n ? window.structbxI18n.t('color.pastel_green') : 'Pastel Green'}</span>`},
            {color: '#e9d8a6', html: `<span class='small' style='background-color:#e9d8a6;color:#000;padding:2px 8px;border-radius:4px;'>${window.structbxI18n ? window.structbxI18n.t('color.beige') : 'Beige'}</span>`},
            {color: '#ee9b00', html: `<span class='small' style='background-color:#ee9b00;color:#000;padding:2px 8px;border-radius:4px;'>${window.structbxI18n ? window.structbxI18n.t('color.ochre') : 'Ochre'}</span>`},
            {color: '#ca6702', html: `<span class='small' style='background-color:#ca6702;color:#fff;padding:2px 8px;border-radius:4px;'>${window.structbxI18n ? window.structbxI18n.t('color.brown') : 'Brown'}</span>`},
            {color: '#bb3e03', html: `<span class='small' style='background-color:#bb3e03;color:#fff;padding:2px 8px;border-radius:4px;'>${window.structbxI18n ? window.structbxI18n.t('color.terracotta') : 'Terracotta'}</span>`},
            {color: '#ae2012', html: `<span class='small' style='background-color:#ae2012;color:#fff;padding:2px 8px;border-radius:4px;'>${window.structbxI18n ? window.structbxI18n.t('color.rust_red') : 'Rust Red'}</span>`},
            {color: '#9b5de5', html: `<span class='small' style='background-color:#9b5de5;color:#fff;padding:2px 8px;border-radius:4px;'>${window.structbxI18n ? window.structbxI18n.t('color.vibrant_purple') : 'Vibrant Purple'}</span>`},
            {color: '#f3722c', html: `<span class='small' style='background-color:#f3722c;color:#fff;padding:2px 8px;border-radius:4px;'>${window.structbxI18n ? window.structbxI18n.t('color.burnt_orange') : 'Burnt Orange'}</span>`},
            {color: '#577590', html: `<span class='small' style='background-color:#577590;color:#fff;padding:2px 8px;border-radius:4px;'>${window.structbxI18n ? window.structbxI18n.t('color.blue_gray') : 'Blue Gray'}</span>`},
            {color: '#43aa8b', html: `<span class='small' style='background-color:#43aa8b;color:#fff;padding:2px 8px;border-radius:4px;'>${window.structbxI18n ? window.structbxI18n.t('color.jade_green') : 'Jade Green'}</span>`},
            {color: '#90be6d', html: `<span class='small' style='background-color:#90be6d;color:#000;padding:2px 8px;border-radius:4px;'>${window.structbxI18n ? window.structbxI18n.t('color.lime_green') : 'Lime Green'}</span>`},
            {color: '#f9c74f', html: `<span class='small' style='background-color:#f9c74f;color:#000;padding:2px 8px;border-radius:4px;'>${window.structbxI18n ? window.structbxI18n.t('color.mustard_yellow') : 'Mustard Yellow'}</span>`},
            {color: '#f8961e', html: `<span class='small' style='background-color:#f8961e;color:#000;padding:2px 8px;border-radius:4px;'>${window.structbxI18n ? window.structbxI18n.t('color.pumpkin_orange') : 'Pumpkin Orange'}</span>`},
            {color: '#f94144', html: `<span class='small' style='background-color:#f94144;color:#fff;padding:2px 8px;border-radius:4px;'>${window.structbxI18n ? window.structbxI18n.t('color.fire_red') : 'Fire Red'}</span>`},
            {color: '#277da1', html: `<span class='small' style='background-color:#277da1;color:#fff;padding:2px 8px;border-radius:4px;'>${window.structbxI18n ? window.structbxI18n.t('color.cobalt_blue') : 'Cobalt Blue'}</span>`},
            {color: '#8338ec', html: `<span class='small' style='background-color:#8338ec;color:#fff;padding:2px 8px;border-radius:4px;'>${window.structbxI18n ? window.structbxI18n.t('color.violet') : 'Violet'}</span>`},
            {color: '#3a86ff', html: `<span class='small' style='background-color:#3a86ff;color:#fff;padding:2px 8px;border-radius:4px;'>${window.structbxI18n ? window.structbxI18n.t('color.bright_blue') : 'Bright Blue'}</span>`},
            {color: '#fb5607', html: `<span class='small' style='background-color:#fb5607;color:#fff;padding:2px 8px;border-radius:4px;'>${window.structbxI18n ? window.structbxI18n.t('color.neon_orange') : 'Neon Orange'}</span>`},
            {color: '#ff006e', html: `<span class='small' style='background-color:#ff006e;color:#fff;padding:2px 8px;border-radius:4px;'>${window.structbxI18n ? window.structbxI18n.t('color.neon_pink') : 'Neon Pink'}</span>`},
            {color: '#8338ec', html: `<span class='small' style='background-color:#8338ec;color:#fff;padding:2px 8px;border-radius:4px;'>${window.structbxI18n ? window.structbxI18n.t('color.electric_purple') : 'Electric Purple'}</span>`},
            {color: '#3a86ff', html: `<span class='small' style='background-color:#3a86ff;color:#fff;padding:2px 8px;border-radius:4px;'>${window.structbxI18n ? window.structbxI18n.t('color.electric_blue') : 'Electric Blue'}</span>`},
            {color: '#ffbe0b', html: `<span class='small' style='background-color:#ffbe0b;color:#000;padding:2px 8px;border-radius:4px;'>${window.structbxI18n ? window.structbxI18n.t('color.electric_yellow') : 'Electric Yellow'}</span>`},
            {color: '#fb5607', html: `<span class='small' style='background-color:#fb5607;color:#fff;padding:2px 8px;border-radius:4px;'>${window.structbxI18n ? window.structbxI18n.t('color.electric_orange') : 'Electric Orange'}</span>`},
            {color: '#ff006e', html: `<span class='small' style='background-color:#ff006e;color:#fff;padding:2px 8px;border-radius:4px;'>${window.structbxI18n ? window.structbxI18n.t('color.magenta') : 'Magenta'}</span>`},
            {color: '#4d908e', html: `<span class='small' style='background-color:#4d908e;color:#fff;padding:2px 8px;border-radius:4px;'>${window.structbxI18n ? window.structbxI18n.t('color.grayish_green') : 'Grayish Green'}</span>`},
            {color: '#577590', html: `<span class='small' style='background-color:#577590;color:#fff;padding:2px 8px;border-radius:4px;'>${window.structbxI18n ? window.structbxI18n.t('color.gray_blue') : 'Gray Blue'}</span>`},
            {color: '#f9844a', html: `<span class='small' style='background-color:#f9844a;color:#000;padding:2px 8px;border-radius:4px;'>${window.structbxI18n ? window.structbxI18n.t('color.salmon') : 'Salmon'}</span>`},
            {color: '#90be6d', html: `<span class='small' style='background-color:#90be6d;color:#000;padding:2px 8px;border-radius:4px;'>${window.structbxI18n ? window.structbxI18n.t('color.apple_green') : 'Apple Green'}</span>`},
            {color: '#f9c74f', html: `<span class='small' style='background-color:#f9c74f;color:#000;padding:2px 8px;border-radius:4px;'>${window.structbxI18n ? window.structbxI18n.t('color.gold') : 'Gold'}</span>`},
            {color: '#43aa8b', html: `<span class='small' style='background-color:#43aa8b;color:#fff;padding:2px 8px;border-radius:4px;'>${window.structbxI18n ? window.structbxI18n.t('color.emerald') : 'Emerald'}</span>`},
            {color: '#f3722c', html: `<span class='small' style='background-color:#f3722c;color:#fff;padding:2px 8px;border-radius:4px;'>${window.structbxI18n ? window.structbxI18n.t('color.pumpkin') : 'Pumpkin'}</span>`},
            {color: '#577590', html: `<span class='small' style='background-color:#577590;color:#fff;padding:2px 8px;border-radius:4px;'>${window.structbxI18n ? window.structbxI18n.t('color.slate') : 'Slate'}</span>`},
            {color: '#277da1', html: `<span class='small' style='background-color:#277da1;color:#fff;padding:2px 8px;border-radius:4px;'>${window.structbxI18n ? window.structbxI18n.t('color.steel_blue') : 'Steel Blue'}</span>`},
            {color: '#f94144', html: `<span class='small' style='background-color:#f94144;color:#fff;padding:2px 8px;border-radius:4px;'>${window.structbxI18n ? window.structbxI18n.t('color.crimson') : 'Crimson'}</span>`}
        ];

        this.row_cell = (contents) => {
            return `<div class="data-cell editable" style="width: 200px; flex: 0 0 200px;">${contents}</div>`;
        }
        this.checkbox_cell = (identifier) => {
            return `<div class="data-cell checkbox-cell"><input type="checkbox" class="row-selector" value="${identifier}"></div>`;
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

        this.colorSelectAdd.AddOption_('', window.structbxI18n ? window.structbxI18n.t('base.none_option') : '-- None --');
        this.colorSelectModify.AddOption_('', window.structbxI18n ? window.structbxI18n.t('base.none_option') : '-- None --');
        this.colorsSelect.forEach(colorOption => {
            this.colorSelectAdd.AddOption_(colorOption.color, colorOption.html);
            this.colorSelectModify.AddOption_(colorOption.color, colorOption.html);
        });
        this.colorSelectAdd.hiddenInput.attr('name', '_structbx_column_colorHeader');
        this.colorSelectModify.hiddenInput.attr('name', '_structbx_column_colorHeader');
    }

    bindEvents(){
        // Pagination
        $('#component_data_read .dynamic-table-wrapper').on("scroll", (e) => {
            if(e.currentTarget.scrollTop + e.currentTarget.clientHeight >= e.currentTarget.scrollHeight){
                if($('#component_data_read #tableBody').children().length > 0)
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
        
        // Read columns and data to modify (ignore checkbox clicks)
        $(document).on("click", '#component_data_read .data-row', (e) => {
            if($(e.target).is('.row-selector, .row-selector *, .checkbox-cell, .checkbox-cell *'))
                return;
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
        
        // Delete record (single or batch)
        $('#component_data_delete form').submit((e) => {
            e.preventDefault();
            if($('#component_data_delete form').attr('data-batch-mode') === '1')
                this.batchDeleteRecords();
            else
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

        // ── Selection events ────────────────────────────────────────────────

        // Row checkbox toggle
        $(document).on('change', '#tableBody .row-selector', (e) => {
            const cb = e.target;
            this.toggleSelection($(cb).val(), cb.checked);
        });

        // Select all checkbox
        $(document).on('change', '#selectAll', (e) => {
            if(e.target.checked)
                this.selectAll();
            else
                this.deselectAll();
        });

        // Batch Edit button
        $('#batchActionsBar .batch-edit-mass').click((e) => {
            e.preventDefault();
            this.preBatchEdit();
        });

        // Batch Edit form submit
        $('#component_data_batch_edit form').submit((e) => {
            e.preventDefault();
            this.batchEdit(e);
        });

        // Batch Delete button
        $('#batchActionsBar .batch-delete-mass').click((e) => {
            e.preventDefault();
            this.preBatchDelete();
        });

        // Batch Clear button
        $('#batchActionsBar .batch-clear').click((e) => {
            e.preventDefault();
            this.deselectAll();
        });

        // Start long polling for real-time updates
        const longPoll = () => {
            try {
                this.changeIntVerification().finally(() => {
                    setTimeout(longPoll, 500);
                });
            } catch(e) {
                console.error('Error en long-poll:', e);
                setTimeout(longPoll, 5000);
            }
        };
        longPoll();
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

    createColumn(response_data){
        // Variables
        let keys = response_data.body.columns_meta.data;

        // Add checkbox column header as first column
        $('#component_data_read #headerRow').append(`
            <div class="header-cell checkbox-cell" style="width:40px;flex:0 0 40px;">
                <input type="checkbox" id="selectAll" title="${window.structbxI18n ? window.structbxI18n.t('table.select_all') : 'Select all'}">
            </div>`
        );

        // Setup columns meta
        new wtools.UIElementsCreator('#component_data_read #headerRow', keys)
        .Build_((column) => {
            if(column.identifier == "identifier")
                return undefined;

            if(column.visible == 0)
                return undefined;

            // Setup columns and icon
            let table_element_object = new TableElements(wtools.IFUndefined(column.column_type, ColumnType.Text), column, this.getTableIdentifier());
            let table_icon = table_element_object.GetIcon_(false);

            return [this.column_cell(column.identifier, table_icon + column.name)];
        });
    }

    createRow(response_data, row)
    {
        let elements = [];

        // Add checkbox cell as first element for row selection
        elements.push(this.checkbox_cell(row.identifier));

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
                if(column_meta.column_type == ColumnType.Image)
                    this.image_row(elements, row, column);
                else if(column_meta.column_type == ColumnType.File)
                    this.file_row(elements, row, column);
                else if(column_meta.column_type == ColumnType.User || column_meta.column_type == ColumnType.CurrentUser)
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

    getPath = (reload) => {
        if(reload)
            return "";
        return `&page=${this.data_read_page}`;
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
                this.data_read_page = 1;
                this.clear();
                this.setupPlaceholders();
            }

            // Get path
            const path = this.getPath(reload);

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
                const result = new ResponseManager(response_data, '#component_data_read .notifications', 'target.data_read');
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

                // Restore selection state for existing rows
                for(const id of this.selectedRecords){
                    const row = $(`#${id}`);
                    if(row.length){
                        row.addClass('selected');
                        row.find('.row-selector').prop('checked', true);
                    }
                }

                // Next page if not reload
                if(!reload)
                    this.data_read_page++;

                // Free mutex
                this.freeMutex();
            });
        } catch(error) {
            // Free mutex
            this.freeMutex();

            new wtools.Notification('ERROR').Show_(window.structbxI18n ? window.structbxI18n.t('data.error_occurred') : 'An error occurred.');
            return;
        }
    };

    updateRow(row_identifier){
        try{
            // Get Data Identifier
            if(row_identifier == undefined){
                new wtools.Notification('WARNING').Show_(window.structbxI18n ? window.structbxI18n.t('data.record_identifier_not_found') : 'Record identifier not found.');
                return;
            }

            $('#component_data_modify .notifications').html('');
            
            // Request row
            this.tableData.readByIdentifier(row_identifier, this.getTableIdentifier(), this.getViewIdentifier())
            .then((response_data) => {
                // Manage response
                const result = new ResponseManager(response_data, '', 'target.data_read_secondary');
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

                // Preserve selected state after update
                if(this.selectedRecords.has(row_identifier)){
                    $('#' + row_identifier).addClass('selected');
                    $('#' + row_identifier).find('.row-selector').prop('checked', true);
                }
            });

        }
        catch(error){
            new wtools.Notification('ERROR').Show_(window.structbxI18n ? window.structbxI18n.t('data.error_with_detail', {error: error}) : `An error occurred: ${error}.`);
            return;
        }
    };
    
    _viewHasFilterOrSort(){
        return $('#filters_count').text().trim() !== '' || $('#sorts_count').text().trim() !== '';
    }

    changeIntVerification(){
        // Request
        return this.tableData.changeInt(this.changeInt, this.getTableIdentifier()).then((response_data) =>
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
                    let updates = [];
                    let deletes = [];
                    for(let row of data) {
                        this.changeInt = row.id;
                        switch(row.operation){
                            case "insert":
                                reload = true;
                                break;
                            case "update":
                                updates.push(row.id_row);
                                break;
                            case "delete":
                                deletes.push(row.id_row);
                                break;
                            case "import":
                                reload = true;
                                break;
                        }
                    }
                    // If there are active filters/sorts, updateRow() is not safe:
                    // a changed row might no longer match the filter, or might
                    // need to move to a different sort position. Force a full
                    // reload to keep the view consistent.
                    if(reload || (updates.length > 0 && this._viewHasFilterOrSort())) {
                        this.deselectAll();
                        this.read(true);
                    } else {
                        for(const id of deletes){
                            $(`#${id}`).remove();
                            this.selectedRecords.delete(id);
                        }
                        for(const id of updates)
                            this.updateRow(id);
                        this.updateBatchActions();
                    }
                }
            }
        });
    };

    // ── Selection methods ──────────────────────────────────────────────────

    toggleSelection(identifier, checked){
        if(checked){
            this.selectedRecords.add(identifier);
            $(`#${identifier}`).addClass('selected');
        } else {
            this.selectedRecords.delete(identifier);
            $(`#${identifier}`).removeClass('selected');
            $('#selectAll').prop('checked', false);
        }
        this.updateBatchActions();
    }

    selectAll(){
        const checkboxes = $('#tableBody .row-selector');
        checkboxes.each((i, cb) => {
            $(cb).prop('checked', true);
            this.toggleSelection($(cb).val(), true);
        });
    }

    deselectAll(){
        const checkboxes = $('#tableBody .row-selector');
        checkboxes.each((i, cb) => {
            $(cb).prop('checked', false);
        });
        this.selectedRecords.clear();
        $('#selectAll').prop('checked', false);
        $('#tableBody .data-row').removeClass('selected');
        this.updateBatchActions();
    }

    updateBatchActions(){
        const count = this.selectedRecords.size;
        const bar = $('#batchActionsBar');
        const editBtn = bar.find('.batch-edit-mass');
        const deleteBtn = bar.find('.batch-delete-mass');
        const countEl = bar.find('.batch-count-num');

        countEl.text(count);
        if(count > 0){
            bar.removeClass('d-none');
            editBtn.prop('disabled', false);
            deleteBtn.prop('disabled', false);
        } else {
            bar.addClass('d-none');
            editBtn.prop('disabled', true);
            deleteBtn.prop('disabled', true);
        }
    }

    // ── Batch Edit ──────────────────────────────────────────────────────────

    preBatchEdit(){
        $('#component_data_batch_edit .notifications').html('');
        $('#component_data_batch_edit .batch-count-target').text(this.selectedRecords.size);

        this.batchEditIdentifiers = [...this.selectedRecords];

        // Setup form
        $('#component_data_batch_edit .form_input_header').html('');
        $('#component_data_batch_edit table tbody').html('');

        // Read columns
        this.tableColumn.read(this.getTableIdentifier(), this.getViewIdentifier())
        .then((response_data) => {
            const result = new ResponseManager(response_data, '', 'target.data_columns_read');
            if(!result.Verify_()) return;

            if(response_data.body.data.length < 1){
                new wtools.Notification('WARNING').Show_(
                    window.structbxI18n ? window.structbxI18n.t('data.create_columns_first') : 'You must create columns to add records.');
                return;
            }

            // Get color select for batch edit
            this.colorSelectBatchEdit = new DOME.CustomSelect('#component_data_batch_edit_colorHeader');
            this.colorSelectBatchEdit.AddOption_('', window.structbxI18n ? window.structbxI18n.t('base.none_option') : '-- None --');
            this.colorsSelect.forEach(co => {
                this.colorSelectBatchEdit.AddOption_(co.color, co.html);
            });
            this.colorSelectBatchEdit.hiddenInput.attr('name', '_structbx_column_colorHeader');

            // Build rows: checkbox + field for each column
            new wtools.UIElementsCreator('#component_data_batch_edit table tbody', response_data.body.data)
            .Build_((row) => {
                if(row.identifier == "identifier"
                    || row.column_type == ColumnType.CreatedDate
                    || row.column_type == ColumnType.UpdatedDate
                    || row.column_type == ColumnType.Image
                    || row.column_type == ColumnType.File)
                    return undefined;

                let table_element_object = new TableElements(
                    wtools.IFUndefined(row.column_type, ColumnType.Text), row, this.getTableIdentifier());
                let table_icon = table_element_object.GetIcon_();
                let table_element = $(table_element_object.Get_());
                let elements = [];

                if(row.column_type == ColumnType.Selection){
                    table_element = $('<td></td>');
                    let cs = new DOME.CustomSelect(table_element);
                    cs.hiddenInput.attr('name', row.identifier);
                    this.linkSelectionOptions(cs, row.link_to, row.name, '#component_data_batch_edit .notifications', '');
                } else if(row.column_type == ColumnType.User || row.column_type == ColumnType.CurrentUser) {
                    table_element = $('<td></td>');
                    let cs = new DOME.CustomSelect(table_element);
                    cs.hiddenInput.attr('name', row.identifier);
                    this.linkUsersInDatabaseOptions(cs, '#component_data_batch_edit .notifications', '');
                } else {
                    $(table_element).attr('name', row.identifier);
                }

                elements.push(`<td class="batch-col-check"><input type="checkbox" name="_modify_col_${row.identifier}" value="${row.identifier}"></td>`);
                elements.push(`<th scope="row" class="batch-col-field">${table_icon}${row.name}</th>`);
                elements.push($('<td class="batch-col-field"></td>').append(table_element));

                return new wtools.UIElementsPackage('<tr></tr>', elements).Pack_();
            });

            $('#component_data_batch_edit form').removeClass('was-validated');
            $('#component_data_batch_edit').modal('show');
        });
    }

    batchEdit(e){
        // Get form data
        const form = e.target;
        const formData = new FormData(form);
        const checkedColumns = [];
        form.querySelectorAll('input[type="checkbox"][name^="_modify_col_"]:checked').forEach(cb => {
            checkedColumns.push(cb.value);
        });

        if(checkedColumns.length === 0){
            $('#component_data_batch_edit .notifications').html('');
            new wtools.Notification('WARNING', 5000, '#component_data_batch_edit .notifications').Show_(
                window.structbxI18n ? window.structbxI18n.t('login.invalid_fields') : 'Select at least one column to modify.');
            return;
        }

        let wait = new wtools.ElementState('#component_data_batch_edit form button[type=submit]', true, 'button', new wtools.WaitAnimation().for_button);

        const table_identifier = this.getTableIdentifier();
        const color_header = formData.get('_structbx_column_colorHeader') || '';
        let success = 0;
        let errors = 0;
        let errorDetails = [];

        const processNext = (index) => {
            if(index >= this.batchEditIdentifiers.length){
                // Done
                wait.Off_();
                $('#component_data_batch_edit').modal('hide');
                if(success > 0){
                    new wtools.Notification('SUCCESS').Show_(
                        window.structbxI18n ? window.structbxI18n.t('table.batch_edit_success', {success: success}) : `${success} records updated.`);
                    this.deselectAll();
                    this.changeIntVerification();
                }
                if(errorDetails.length > 0){
                    new wtools.Notification('WARNING', 8000, '#component_data_batch_edit .notifications').Show_(
                        errorDetails.join('; '));
                }
                return;
            }

            const id = this.batchEditIdentifiers[index];
            const data = new FormData();
            data.append('table-identifier', table_identifier);
            data.append('identifier', id);
            data.append('_structbx_column_colorHeader', color_header);
            for(const colId of checkedColumns){
                data.append(colId, formData.get(colId) || '');
            }

            this.tableData.modify(data).then((rd) => {
                const result = new ResponseManager(rd, '', 'target.data_modify');
                if(result.Verify_()){
                    success++;
                } else {
                    errors++;
                    errorDetails.push(window.structbxI18n
                        ? window.structbxI18n.t('table.batch_edit_error', {identifier: id, error: rd.body.message || 'Unknown'})
                        : `Error updating ${id}: ${rd.body.message || 'Unknown'}`);
                }
                processNext(index + 1);
            });
        };

        processNext(0);
    }

    // ── Batch Delete ────────────────────────────────────────────────────────

    preBatchDelete(){
        const count = this.selectedRecords.size;
        $('.batch-delete-msg .batch-count-target').text(count);
        $('.batch-delete-msg').removeClass('d-none');
        $('.single-delete-msg').addClass('d-none');
        $('#component_data_delete form').attr('data-batch-mode', '1');
        $('#component_data_delete').modal('show');
    }

    batchDeleteRecords(){
        const identifiers = [...this.selectedRecords];
        const table_identifier = this.getTableIdentifier();
        let success = 0;
        let errors = 0;
        let wait = new wtools.ElementState('#component_data_delete form button[type=submit]', true, 'button', new wtools.WaitAnimation().for_button);

        const processNext = (index) => {
            if(index >= identifiers.length){
                wait.Off_();
                $('#component_data_delete').modal('hide');
                $('.batch-delete-msg').addClass('d-none');
                $('.single-delete-msg').removeClass('d-none');
                $('#component_data_delete form').removeAttr('data-batch-mode');
                if(success > 0){
                    new wtools.Notification('SUCCESS').Show_(
                        window.structbxI18n ? window.structbxI18n.t('table.batch_delete_success', {success: success}) : `${success} records deleted.`);
                    this.deselectAll();
                    this.changeIntVerification();
                }
                if(errors > 0){
                    new wtools.Notification('WARNING', 8000, '#component_data_delete .notifications').Show_(
                        `${errors} deletion errors.`);
                }
                return;
            }

            const id = identifiers[index];
            this.tableData.delete(id, table_identifier).then((rd) => {
                const result = new ResponseManager(rd, '', 'target.data_delete');
                if(result.Verify_()){
                    success++;
                } else {
                    errors++;
                }
                processNext(index + 1);
            });
        };

        processNext(0);
    }

    setupColumn(row, elements, first, target, value = undefined){
        // If column type is a NORMAL type
        let table_element_object = new TableElements(wtools.IFUndefined(row.column_type, ColumnType.Text), row, this.getTableIdentifier());
        let table_element = $(table_element_object.Get_());
        let table_icon = table_element_object.GetIcon_();

        if(table_element == undefined){
            new wtools.Notification('ERROR').Show_(window.structbxI18n ? window.structbxI18n.t('data.table_element_create_error') : 'Error creating a table element.');
            return false;
        }

        // If column type is SELECTION
        if(row.column_type == ColumnType.Selection){
            table_element = $('<td></td>');
            let customSelect = new DOME.CustomSelect(table_element);
            customSelect.hiddenInput.attr('name', row.identifier);
            this.linkSelectionOptions(customSelect, row.link_to, row.name, `${target} .notifications`, value);
        }
        else if(row.column_type == ColumnType.User)
        {
            table_element = $('<td></td>');
            let customSelect = new DOME.CustomSelect(table_element);
            customSelect.hiddenInput.attr('name', row.identifier);
            this.linkUsersInDatabaseOptions(customSelect, `${target} .notifications`, value);
        }

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

            // Fetch table info to get id_column_display
            this.table.read(this.getTableIdentifier()).then((table_response) => {
                let id_column_display = '';
                if(table_response.body && table_response.body.data && table_response.body.data.length > 0){
                    id_column_display = table_response.body.data[0].id_column_display || '';
                }

                // Read and setup columns
                this.tableColumn.read(this.getTableIdentifier(), this.getViewIdentifier())
                .then((response_data) => {
                    // Manage response
                    const result = new ResponseManager(response_data, '', 'target.data_columns_read');
                    if(!result.Verify_())
                        return;    

                    // Handle zero results
                    if(response_data.body.data.length < 1){
                        wait.Off_();
                        new wtools.Notification('WARNING').Show_(window.structbxI18n ? window.structbxI18n.t('data.create_columns_first') : 'You must create columns to add records.');
                        return;
                    }

                    // Reorder: put display column first
                    let data = response_data.body.data;
                    if(id_column_display){
                        let displayIndex = data.findIndex(col => col.identifier === id_column_display);
                        if(displayIndex > 0){
                            let displayCol = data.splice(displayIndex, 1)[0];
                            data.unshift(displayCol);
                        }
                    }
                    
                    // Results elements creator
                    let first = true;
                    new wtools.UIElementsCreator('#component_data_add table tbody', data)
                    .Build_((row) => {
                        if(row.identifier == "identifier" || row.column_type == ColumnType.CreatedDate || row.column_type == ColumnType.UpdatedDate)
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
            });

        } catch(error) {
            new wtools.Notification('ERROR').Show_(window.structbxI18n ? window.structbxI18n.t('data.error_with_detail', {error: error}) : `An error occurred: ${error}.`);
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
            new wtools.Notification('WARNING', 5000, '#component_data_add .notifications').Show_(window.structbxI18n ? window.structbxI18n.t('login.invalid_fields') : 'There are invalid fields.');
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
            const result = new ResponseManager(response_data, '#component_data_add .notifications', 'target.data_add');
            if(!result.Verify_())
                return;

            new wtools.Notification('SUCCESS').Show_(window.structbxI18n ? window.structbxI18n.t('data.record_saved') : 'Record saved.');
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
                new wtools.Notification('WARNING').Show_(window.structbxI18n ? window.structbxI18n.t('data.record_identifier_not_found') : 'Record identifier not found.');
                return;
            }
            $('#component_data_modify input[name="identifier"]').val(identifier);

            // Setup form to modify
            $('#component_data_modify .form_input_header').html('');
            $('#component_data_modify table tbody').html('');
            $('#component_data_modify .notifications').html('');

            // Fetch table info to get id_column_display
            this.table.read(this.getTableIdentifier()).then((table_response) => {
                let id_column_display = '';
                if(table_response.body && table_response.body.data && table_response.body.data.length > 0){
                    id_column_display = table_response.body.data[0].id_column_display || '';
                }

                // Read form to modify
                this.tableData.readByIdentifier(identifier, this.getTableIdentifier(), this.getViewIdentifier())
                .then((response_data) => {
                    // Manage response
                    const result = new ResponseManager(response_data, '', 'target.data_modify');
                    if(!result.Verify_()){
                        wait.Off_();
                        return;
                    }
        
                    // Handle no results or zero results
                    if(response_data.body.data.length < 1){
                        wait.Off_();
                        new wtools.Notification('SUCCESS').Show_(window.structbxI18n ? window.structbxI18n.t('table.no_results') : 'No results.');
                        return;
                    }

                    // Add values to columns_data
                    let data = response_data.body.columns_meta.data;
                    for(let it of data)
                        it.value = response_data.body.data[0][it.name];

                    // Reorder: put display column first
                    if(id_column_display){
                        let displayIndex = data.findIndex(col => col.identifier === id_column_display);
                        if(displayIndex > 0){
                            let displayCol = data.splice(displayIndex, 1)[0];
                            data.unshift(displayCol);
                        }
                    }

                    // Setup color header
                    this.colorSelectModify.setValue(response_data.body.data[0]._structbx_column_colorHeader);

                    // Results elements creator
                    let first = true;
                    new wtools.UIElementsCreator('#component_data_modify table tbody', data)
                    .Build_((row) => {
                        if(row.column_type == ColumnType.CreatedDate || row.column_type == ColumnType.UpdatedDate)
                            return;

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
            });

        } catch(error) {
            new wtools.Notification('ERROR').Show_(window.structbxI18n ? window.structbxI18n.t('data.error_with_detail', {error: error}) : `An error occurred: ${error}.`);
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
            new wtools.Notification('WARNING', 5000, '#component_data_modify .notifications').Show_(window.structbxI18n ? window.structbxI18n.t('login.invalid_fields') : 'There are invalid fields.');
            return;
        }

        // Data collection
        let data = new FormData($('#component_data_modify form')[0]);
        data.append('table-identifier', this.getTableIdentifier());

        // Request
        this.tableData.modify(data).then((response_data) => {
            wait.Off_();
            
            // Manage response
            const result = new ResponseManager(response_data, '#component_data_modify .notifications', 'target.data_modify');
            if(!result.Verify_())
                return;

            new wtools.Notification('SUCCESS').Show_(window.structbxI18n ? window.structbxI18n.t('data.record_updated') : 'Record updated.');
            $('#component_data_modify').modal('hide');
            this.changeIntVerification();
        });
    }

    preDelete(){
        // Wait animation
        let wait = new wtools.ElementState('#wait_animation_page', true, 'block', new wtools.WaitAnimation().for_page);

        // Data
        let data = new FormData($('#component_data_modify form')[0]);
        const identifier = data.get('identifier');

        // Setup data to delete
        $('#component_data_delete input[name=identifier]').val(identifier);
        $('#component_data_delete strong.identifier').html(identifier);
        $('#component_data_delete').modal('show');
        wait.Off_();
    }

    delete(){
        // Wait animation
        let wait = new wtools.ElementState('#component_data_delete form button[type=submit]', true, 'button', new wtools.WaitAnimation().for_button);

        // Data
        const identifier = $('#component_data_delete input[name=identifier]').val();

        // Request
        this.tableData.delete(identifier, this.getTableIdentifier())
        .then((response_data) => {
            wait.Off_();
            
            // Manage response
            const result = new ResponseManager(response_data, '#component_data_delete .notifications', 'target.data_delete');
            if(!result.Verify_())
                return;

            new wtools.Notification('SUCCESS').Show_(window.structbxI18n ? window.structbxI18n.t('data.record_deleted') : 'Record deleted.');
            $('#component_data_delete').modal('hide');
            $('#component_data_modify').modal('hide');
            this.changeIntVerification();
        });
    }

    async export(){
        const wait = new wtools.ElementState('#component_data_export .export', false, 'button', new wtools.WaitAnimation().for_button);

        const table_identifier = this.getTableIdentifier();
        if(table_identifier == undefined){
            wait.Off_();
            return;
        }

        try {
            const response = await new wtools.Request(`/api/tables/data/read?table-identifier=${this.getTableIdentifier()}&view-identifier=${this.getViewIdentifier()}&export=true`).MakeHTTPRequest();
            const blob = await response.blob();
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            document.body.appendChild(a);
            a.style.display = 'none';
            a.href = url;
            const timestamp = new Date().getTime();
            a.download = `export_${timestamp}.csv`;
            a.click();
            URL.revokeObjectURL(url);
            document.body.removeChild(a);

            wait.Off_();
            new wtools.Notification('SUCCESS').Show_(window.structbxI18n ? window.structbxI18n.t('data.export_successful') : 'Export successful.');
        } catch(error) {
            wait.Off_();
            new wtools.Notification('WARNING').Show_(window.structbxI18n ? window.structbxI18n.t('data.download_error', {error: error}) : `Error downloading file: ${error}.`);
        }
    }
}