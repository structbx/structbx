import { BaseController } from '../modules/base_controller.js';
import { ResponseManager } from '../classes/response_manager.js';
import { CSVReader } from '../classes/csv_reader.js';

import { TableData } from '../models/TableData.js';
import { TableColumn } from '../models/TableColumn.js';

export class DataImportController extends BaseController{
    constructor() {
        super();

        this.tableData = new TableData;
        this.tableColumn = new TableColumn;

        this.file_data = [];
        this.map_columns = {sources: [], targets: [], map: {}};
    }

    build(){
    }

    bindEvents(){
        $(document).on('click', '.data_import', (e) => {
            e.preventDefault();
            $('#component_data_import').modal('show');
        });

        $(document).on('change', '#component_data_import input[name=file]', () => this.readFile());
        $(document).on('change', '#component_data_import select[name=separator]', () => this.readFile());
        $(document).on('change', '#component_data_import select.column', () => this.previsualizeData());

        $(document).on('submit', '#component_data_import form', e => this.submitImport(e));
    }

    readFile(){
        const file = $('#component_data_import input[name=file]');
        const separator = $('#component_data_import select[name=separator]').val();

        new CSVReader(file, separator).Read((state, data) => {
            if(state == "ERROR"){
                $('#component_data_import .notifications').html('');
                new wtools.Notification('WARNING', 5000, '#component_data_import .notifications').Show_(data);
                return;
            }

            this.file_data = data;
            this.setupMapColumns();
        });
    }

    setupMapColumns(){
        $('#component_data_import table.map tbody').html('');

        const view_identifier = wtools.GetUrlSearchParam('v');
        this.tableColumn.read(this.getTableIdentifier(), view_identifier || '').then(response => {
            const columns = response.body.data || [];
            let options = '';
            for(const column of columns){
                options += `<option value="${column.identifier}">${column.name}</option>`;
            }
            options += `<option value="">-- SKIP --</option>`;

            for(const header of Object.keys(this.file_data[0])){
                const select = $(`<select class="form-select column" name="${header}">${options}</select>`);
                $(select).find('option').each(function(){
                    if(header.toLowerCase() == this.text.toLowerCase()){
                        $(select).val(this.value);
                        return false;
                    }
                });
                if($(select).val() == undefined) $(select).val('');

                const row = $('<tr></tr>');
                row.append(`<th scope="row">${header}</th>`);
                row.append($('<td></td>').append(select));
                $('#component_data_import table.map tbody').append(row);
            }

            this.previsualizeData();
        });
    }

    previsualizeData(){
        $('#component_data_import table.previsualization thead tr').html('');
        $('#component_data_import table.previsualization tbody').html('');
        this.map_columns.sources = [];
        this.map_columns.map = {};

        $('#component_data_import .map .column').each(function(){
            if($(this).val() == '') return;
            const source = $(this).attr('name');
            this.map_columns.sources.push(source);
            this.map_columns.map[source] = $(this).val();
        }.bind(this));

        let cont = 0;
        for(const row of this.file_data){
            if(cont > 5) break;

            if(cont == 0){
                let headers = '';
                for(const header of Object.keys(row)){
                    if(this.map_columns.sources.includes(header))
                        headers += `<th>${header}</th>`;
                }
                $('#component_data_import table.previsualization thead tr').append(headers);
            }

            let elements = '';
            for(const header of Object.keys(row)){
                if(this.map_columns.sources.includes(header))
                    elements += `<td>${row[header]}</td>`;
            }
            $('#component_data_import table.previsualization tbody').append(`<tr>${elements}</tr>`);
            cont++;
        }
    }

    sendData(){
        const final_data = [];
        for(const row of this.file_data){
            const elements = {};
            for(const header of Object.keys(row)){
                if(this.map_columns.sources.includes(header))
                    elements[this.map_columns.map[header]] = row[header];
            }
            final_data.push(elements);
        }
        return final_data;
    }

    submitImport(e){
        e.preventDefault();

        $('#component_data_import_message .contents').html('');

        const wait = new wtools.ElementState('#component_data_import form button[type=submit]', true, 'button', new wtools.WaitAnimation().for_button);

        const table_identifier = this.getTableIdentifier();
        if(table_identifier == undefined){
            wait.Off_();
            new wtools.Notification('WARNING').Show_('No se encontr&oacute; el identificador de la tabla.');
            return;
        }

        const data = [
            {name: "table-identifier", value: table_identifier},
            {data: this.sendData()}
        ];

        this.tableData.importData(data).then(response => {
            wait.Off_();

            const result = new ResponseManager(response, '#component_data_import .notifications', 'Data: Importar');
            if(!result.Verify_()) return;

            $('#component_data_reload').click();
            $('#component_data_import_message').modal('show');
            $('#component_data_import_message .contents').append($(`<p>Mensaje: ${response.body.message}</p>`));
            $('#component_data_import_message .contents').append($(`<p>Total guardados: ${response.body.saved}</p>`));
            $('#component_data_import_message .contents').append($(`<p>Total no guardados: ${response.body.errors}</p>`));
            $('#component_data_import_message .contents').append($(`<p>Filas no guardadas: ${response.body.error_lines}</p>`));
        });
    }
}
