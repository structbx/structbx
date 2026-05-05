import { BaseController } from '../modules/base_controller.js';
import * as Tools from '../classes/tools.js';
import * as DOME from '../classes/dom_elements.js';
import { ResponseManager } from '../classes/response_manager.js';
import { TableElements } from '../classes/table_elements.js';

import { ViewSort } from '../models/ViewSort.js';
import { TableColumn } from '../models/TableColumn.js';

export class SortType
{
    constructor()
    {
        this.ASC = {title: 'ASC', value: 'ASC'};
        this.DESC = {title: 'DESC', value: 'DESC'};
        this.array = [this.ASC, this.DESC];
    }
}

export class SortsController extends BaseController{
    constructor() {
        super();
        this.viewSort = new ViewSort;
        this.tableColumn = new TableColumn;

        this.notification.read = new wtools.Notification('WARNING', 5000, '#component_sorts_read .notifications');
        this.notification.add = new wtools.Notification('WARNING', 5000, '#component_sorts_add .notifications');
        this.notification.modify = new wtools.Notification('WARNING', 5000, '#component_sorts_modify .notifications');
        this.notification.delete = new wtools.Notification('WARNING', 5000, '#component_sorts_delete .notifications');
    }

    build(){

    }

    bindEvents(){
        // Show filter modal
        const show_modal = (e) => {
            e.preventDefault();
            $('#component_sorts_read').modal('show');
        }
        $('.sorts_read').click(e => show_modal(e));

        $('#component_sorts_read .add').click(e => {
            e.preventDefault();
            this.setupNewSortElement("save");
        });

        $(document).on('click', '#component_sorts_read .save', e => {
            e.preventDefault();
            this.add(e);
        });

        $(document).on('click', '#component_sorts_read .modify', e => {
            e.preventDefault();
            this.modify(e);
        });

        $(document).on('click', '#component_sorts_read .delete', e => {
            e.preventDefault();
            this.delete(e);
        });

        // Sort filters position in view
        $(`#component_sorts_read .contents`).sortable({
            update: ( event, ui) => {
                this.modifyPosition(ui);
            }
        });

        // Filter field change
        const changesNotSaved = (e) => {
            $($(e.currentTarget).parent()).find('.modify').css('background-color', '#bbb');
        }
        $(document).on('change', '#component_sorts_read input[name=is_active]', e => {
            changesNotSaved(e);
        });
        $(document).on('change', '#component_sorts_read select[name=column]', e => {
            changesNotSaved(e);
        });
        $(document).on('change', '#component_sorts_read select[name=op]', e => {
            changesNotSaved(e);
        });
        $(document).on('change', '#component_sorts_read input[name=value]', e => {
            changesNotSaved(e);
        });

    }

    getSortElement(type = "modify")
    {
        let options = '';
        for(const option of new SortType().array){
            options += `<option value="${option.value}">${option.title}</option>`;
        }
        return $(`
            <div class="input-group ui-state-default mb-2">
                <a class="btn me-2"><i class="fas fa-sort"></i></a>
                <div class="form-check d-flex align-items-center">
                    <input class="form-check-input" type="checkbox" name="is_active"/>
                </div>
                <select class="form-select" name="column" required></select>
                <select class="form-select" name="op" required>
                    ${options}
                </select>
                <button type="button" class="btn btn-sm btn-dark-shadow ${type}"><i class="fas fa-${type=="modify" ? "pen" : "save"}"></i></button>
                <button type="button" class="btn btn-sm btn-dark-shadow me-2 delete"><i class="fas fa-trash"></i></button>
            </div>
        `);
    }

    setupNewSortElement(type="modify", sort_row = undefined)
    {
        // Create sort
        let sort = this.getSortElement(type)

        // Setup row 'columns'
        this.tableColumn.read(this.getTableIdentifier(), this.getViewIdentifier()).then((response_data) => {

            for(let column of response_data.body.data){
                $(sort).find('select[name=column]').append($(`<option value="${column.identifier}">${column.name}</option>`))
            }
            if(sort_row){
                if(sort_row.identifier != undefined){
                    $(sort).attr('sort-identifier', sort_row.identifier);
                }
                if(sort_row.id_column != undefined){
                    $(sort).find('select[name=column]').val(sort_row.id_column);
                }
                if(sort_row.op != undefined){
                    $(sort).find('select[name=op]').val(sort_row.op);
                }
                if(sort_row.value != undefined){
                    $(sort).find('input[name=value]').val(sort_row.value);
                }
                if(sort_row.is_active != undefined){
                    $(sort).find('input[name=is_active]')[0].checked = sort_row.is_active == 0 ? false : true;
                }
            }

            // Add sort
            $('#component_sorts_read .contents').append(sort);
        });
    }

    read(){
        // Wait animation
        let wait = new wtools.ElementState('#component_sorts_read .notifications', false, 'block', new wtools.WaitAnimation().for_block);

        // Request
        this.viewSort.readAll(this.getTableIdentifier(), this.getViewIdentifier()).then((response_data) =>
        {
            // Clean
            wait.Off_();
            $('#component_sorts_read .notifications').html('');

            // Manage response
            const result = new ResponseManager(response_data, '#component_sorts_read .notifications', 'Filtros: Leer');
            if(!result.Verify_())
                return;

            // Handle zero results
            if(response_data.body.data.length < 1){
                $(`#component_sorts_read .contents`).html('<span class="text-muted p-2">No hay ordenamientos</span>');
                return;
            }

            // Results elements creator
            wait.Off_();
            $('#component_sorts_read .notifications').html('');
            $(`#component_sorts_read .contents`).html('');

            for(const sort of response_data.body.data){
                this.setupNewSortElement("modify", sort);
            }
        });
    }
}