import { BaseController } from '../modules/base_controller.js';
import * as Tools from '../classes/tools.js';
import * as DOME from '../classes/dom_elements.js';
import { ResponseManager } from '../classes/response_manager.js';
import { TableElements } from '../classes/table_elements.js';

import { ViewFilter } from '../models/ViewFilter.js';
import { TableColumn } from '../models/TableColumn.js';

export class FilterType
{
    constructor()
    {
        this.like = {title: 'Contiene', value: 'LIKE'};
        this.equal = {title: 'Igual', value: '='};
        this.not_equal = {title: 'No igual', value: '!='};
        this.greater = {title: 'Mayor que', value: '>'};
        this.less = {title: 'Menor que', value: '<'};
        this.greater_equal = {title: 'Mayor o igual que', value: '>='};
        this.less_equal = {title: 'Menor o igual que', value: '<='};
        this.array = [this.like, this.equal, this.not_equal, this.greater, this.less, this.greater_equal, this.less_equal];
    }
}

export class FiltersController extends BaseController{
    constructor(onChangedCallback = () => {}) {
        super();
        this.onChanged = onChangedCallback;

        this.viewFilter = new ViewFilter;
        this.tableColumn = new TableColumn;

        this.notification.read = new wtools.Notification('WARNING', 5000, '#component_filters_read .notifications');
        this.notification.add = new wtools.Notification('WARNING', 5000, '#component_filters_add .notifications');
        this.notification.modify = new wtools.Notification('WARNING', 5000, '#component_filters_modify .notifications');
        this.notification.delete = new wtools.Notification('WARNING', 5000, '#component_filters_delete .notifications');
    }

    build(){

    }

    bindEvents(){
        // Show filter modal
        const show_filter_modal = (e) => {
            e.preventDefault();
            $('#component_filters_read').modal('show');
        }
        $('.filters_read').click(e => show_filter_modal(e));

        $('#component_filters_read .add').click(e => {
            e.preventDefault();
            this.setupNewFilterElement("save");
        });

        $(document).on('click', '#component_filters_read .save', e => {
            e.preventDefault();
            this.add(e);
        });

        $(document).on('click', '#component_filters_read .modify', e => {
            e.preventDefault();
            this.modify(e);
        });

        $(document).on('click', '#component_filters_read .delete', e => {
            e.preventDefault();
            this.delete(e);
        });

        // Sort filters position in view
        $(`#component_filters_read .contents`).sortable({
            update: ( event, ui) => {
                this.modifyPosition(ui);
            }
        });

        // Filter field change
        const changesNotSaved = (element) => {
            $(element).find('.modify').css('background-color', '#bbb');
        }
        $(document).on('change', '#component_filters_read input[name=is_active]', e => {
            changesNotSaved($(e.currentTarget).parent().parent());
        });
        $(document).on('change', '#component_filters_read select[name=column]', e => {
            changesNotSaved($(e.currentTarget).parent());
        });
        $(document).on('change', '#component_filters_read select[name=op]', e => {
            changesNotSaved($(e.currentTarget).parent());
        });
        $(document).on('change', '#component_filters_read input[name=value]', e => {
            changesNotSaved($(e.currentTarget).parent());
        });

    }

    getFilterElement(type = "modify")
    {
        let options = '';
        for(const option of new FilterType().array){
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
                <input type="text" class="form-control" name="value" placeholder="value" required/>
                <button type="button" class="btn btn-sm btn-dark-shadow ${type}"><i class="fas fa-${type=="modify" ? "pen" : "save"}"></i></button>
                <button type="button" class="btn btn-sm btn-dark-shadow me-2 delete"><i class="fas fa-trash"></i></button>
            </div>
        `);
    }

    setupNewFilterElement(type="modify", filter_row = undefined)
    {
        // Create filter
        let filter = this.getFilterElement(type)

        // Setup row 'columns'
        this.tableColumn.read(this.getTableIdentifier(), this.getViewIdentifier()).then((response_data) => {

            for(let column of response_data.body.data){
                $(filter).find('select[name=column]').append($(`<option value="${column.identifier}">${column.name}</option>`))
            }
            if(filter_row){
                if(filter_row.identifier != undefined){
                    $(filter).attr('filter-identifier', filter_row.identifier);
                }
                if(filter_row.id_column != undefined){
                    $(filter).find('select[name=column]').val(filter_row.id_column);
                }
                if(filter_row.op != undefined){
                    $(filter).find('select[name=op]').val(filter_row.op);
                }
                if(filter_row.value != undefined){
                    $(filter).find('input[name=value]').val(filter_row.value);
                }
                if(filter_row.is_active != undefined){
                    $(filter).find('input[name=is_active]')[0].checked = filter_row.is_active == 0 ? false : true;
                }
            }

            // Add filter
            $('#component_filters_read .contents').append(filter);
        });
    }

    read(){
        // Wait animation
        let wait = new wtools.ElementState('#component_filters_read .notifications', false, 'block', new wtools.WaitAnimation().for_block);

        // Request
        this.viewFilter.readAll(this.getTableIdentifier(), this.getViewIdentifier()).then((response_data) =>
        {
            // Clean
            wait.Off_();
            $('#component_filters_read .notifications').html('');

            // Manage response
            const result = new ResponseManager(response_data, '#component_filters_read .notifications', 'Filtros: Leer');
            if(!result.Verify_())
                return;

            // Handle zero results
            if(response_data.body.data.length < 1){
                $(`#component_filters_read .contents`).html('<span class="text-muted p-2">No hay filtros</span>');
                return;
            }

            // Results elements creator
            wait.Off_();
            $('#component_filters_read .notifications').html('');
            $(`#component_filters_read .contents`).html('');

            for(const filter of response_data.body.data){
                this.setupNewFilterElement("modify", filter);
            }
        });
    }

    add(e){
        // Wait animation
        let wait = new wtools.ElementState(
            e.currentTarget
            , true, 'button', new wtools.WaitAnimation().for_button
        );

        // Clean notifications
        $('#component_filters_read .notifications').html('');

        const parent = $(e.currentTarget).parent();
        const column_identifier = parent.find('select[name=column]').val();
        const op = parent.find('select[name=op]').val();
        const value = parent.find('input[name=value]').val();
        const is_active = parent.find('input[name=is_active]')[0].checked;

        // Validate inputs
        if (column_identifier === "" || op === "" || value === ""){
            new wtools.Notification('WARNING').Show_('Todos los campos del filtro son obligatorios.');
            return;
        }
        
        // Request
        this.viewFilter.add(this.getTableIdentifier(), this.getViewIdentifier(), column_identifier, op, value, is_active).
        then((response_data) => {
            wait.Off_();

            // Manage response
            const result = new ResponseManager(response_data, '#component_filters_read .notifications', 'Filtros: A&ntilde;adir');
            if(!result.Verify_())
                return;

            $(e.target).removeClass('save');
            $(e.target).addClass('modify');
            $(e.target).find('i').removeClass('fa-save');
            $(e.target).find('i').addClass('fa-pen');

            $(parent).attr('filter-identifier', response_data.body.message);
            this.onChanged();
        });
    }

    modify(e){
        // Clean notifications
        $('#component_filters_read .notifications').html('');

        // Get filter identifier from the parent element
        const filter_element = $(e.currentTarget).parent();
        const filter_identifier = filter_element.attr('filter-identifier');
        if(filter_identifier == undefined){
            new wtools.Notification('WARNING').Show_('No se encontr&oacute; el identificador del filtro.');
            return;
        }

        // Get current values from the filter element
        const column_identifier = filter_element.find('select[name=column]').val();
        const op = filter_element.find('select[name=op]').val();
        const value = filter_element.find('input[name=value]').val();
        const is_active = filter_element.find('input[name=is_active]')[0].checked;

        // Validate inputs
        if (column_identifier === "" || op === "" || value === ""){
            new wtools.Notification('WARNING').Show_('Todos los campos del filtro son obligatorios.');
            return;
        }
        
        this.viewFilter.modify(filter_identifier, this.getTableIdentifier(), this.getViewIdentifier(), column_identifier, op, value, is_active)
        .then((response_data) => {
            // Manage response
            const result = new ResponseManager(response_data, '#component_filters_read .notifications', 'Filtros: Modificar');
            if(!result.Verify_())
                return;

            $(filter_element).find('.modify').css('background-color', '#fff');
            this.onChanged();
        });
    }

    modifyPosition(ui){
        let filter_identifier = $(ui.item).attr('filter-identifier');
        let filterPrev = $(ui.item).prev().attr('filter-identifier');
        let filterNext = $(ui.item).next().attr('filter-identifier');

        // Request
        this.viewFilter.modifyPosition(filter_identifier, this.getViewIdentifier(), filterPrev, filterNext).then((response_data) =>{
            // Manage response
            const result = new ResponseManager(response_data, '#notifications', 'Filtros: Posici&oacute;n: Modificar');
            if(!result.Verify_()){
                this.read();
                return;
            }
            this.onChanged();
        });
    }

    delete(e){
        // Clean notifications
        $('#component_filters_read .notifications').html('');

        // Get filter identifier from the parent element
        const filter_element = $(e.currentTarget).parent();
        const filter_identifier = filter_element.attr('filter-identifier');
        if(filter_identifier == undefined){
            new wtools.Notification('WARNING').Show_('No se encontr&oacute; el identificador del filtro.');
            return;
        }

        // Request
        this.viewFilter.delete(filter_identifier, this.getViewIdentifier()).then((response_data) => {
            // Manage response
            const result = new ResponseManager(response_data, '#component_filters_read .notifications', 'Filtros: Modificar');
            if(!result.Verify_())
                return;

            $(filter_element).remove();
            this.onChanged();
        });
    }
}