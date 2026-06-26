import { BaseController } from '../modules/base_controller.js';
import * as Tools from '../classes/tools.js';
import * as DOME from '../classes/dom_elements.js';
import { ResponseManager } from '../classes/response_manager.js';
import { TableElements } from '../classes/table_elements.js';
import { I18n } from '../i18n/i18n.js';

import { ViewFilter } from '../models/ViewFilter.js';
import { TableColumn } from '../models/TableColumn.js';

import { ColumnType } from '../constants/column_types.js';

const OPERATORS_BY_TYPE = {
    [ColumnType.Text]: ['LIKE', '=', '!=', '>', '<', '>=', '<=', 'IN', 'NOT IN', 'IS NULL', 'IS NOT NULL'],
    [ColumnType.LongText]: ['LIKE', '=', '!=', '>', '<', '>=', '<=', 'IN', 'NOT IN', 'IS NULL', 'IS NOT NULL'],
    [ColumnType.User]: ['LIKE', '=', '!=', '>', '<', '>=', '<=', 'IN', 'NOT IN', 'IS NULL', 'IS NOT NULL'],
    [ColumnType.CurrentUser]: ['LIKE', '=', '!=', '>', '<', '>=', '<=', 'IN', 'NOT IN', 'IS NULL', 'IS NOT NULL'],
    [ColumnType.File]: ['LIKE', '=', '!=', '>', '<', '>=', '<=', 'IN', 'NOT IN', 'IS NULL', 'IS NOT NULL'],
    [ColumnType.Image]: ['LIKE', '=', '!=', '>', '<', '>=', '<=', 'IN', 'NOT IN', 'IS NULL', 'IS NOT NULL'],
    [ColumnType.IntNumber]: ['=', '!=', '>', '<', '>=', '<=', 'IN', 'NOT IN', 'IS NULL', 'IS NOT NULL'],
    [ColumnType.DecimalNumber]: ['=', '!=', '>', '<', '>=', '<=', 'IN', 'NOT IN', 'IS NULL', 'IS NOT NULL'],
    [ColumnType.Date]: ['=', '!=', '>', '<', '>=', '<=', 'IN', 'NOT IN', 'IS NULL', 'IS NOT NULL'],
    [ColumnType.Time]: ['=', '!=', '>', '<', '>=', '<=', 'IN', 'NOT IN', 'IS NULL', 'IS NOT NULL'],
    [ColumnType.CreatedDate]: ['=', '!=', '>', '<', '>=', '<=', 'IN', 'NOT IN', 'IS NULL', 'IS NOT NULL'],
    [ColumnType.UpdatedDate]: ['=', '!=', '>', '<', '>=', '<=', 'IN', 'NOT IN', 'IS NULL', 'IS NOT NULL'],
    [ColumnType.Selection]: ['=', '!=', 'IN', 'NOT IN', 'IS NULL', 'IS NOT NULL']
};

const t = (key, fallback) => window.structbxI18n ? window.structbxI18n.t(key) : fallback;

const OPERATOR_LABELS = {
    'LIKE': t('filters.op_contains', 'Contains'),
    '=': t('filters.op_equals', 'Equals'),
    '!=': t('filters.op_not_equals', 'Not Equal'),
    '>': t('filters.op_greater_than', 'Greater Than'),
    '<': t('filters.op_less_than', 'Less Than'),
    '>=': t('filters.op_greater_equal', 'Greater or Equal'),
    '<=': t('filters.op_less_equal', 'Less or Equal'),
    'IN': t('filters.op_in', 'In'),
    'NOT IN': t('filters.op_not_in', 'Not In'),
    'IS NULL': t('filters.op_is_null', 'Is Null'),
    'IS NOT NULL': t('filters.op_is_not_null', 'Is Not Null')
};

export class FilterType
{
    constructor()
    {
        this.like = {title: window.structbxI18n ? window.structbxI18n.t('filters.op_contains') : 'Contains', value: 'LIKE'};
        this.equal = {title: window.structbxI18n ? window.structbxI18n.t('filters.op_equals') : 'Equals', value: '='};
        this.not_equal = {title: window.structbxI18n ? window.structbxI18n.t('filters.op_not_equals') : 'Not Equal', value: '!='};
        this.greater = {title: window.structbxI18n ? window.structbxI18n.t('filters.op_greater_than') : 'Greater Than', value: '>'};
        this.less = {title: window.structbxI18n ? window.structbxI18n.t('filters.op_less_than') : 'Less Than', value: '<'};
        this.greater_equal = {title: window.structbxI18n ? window.structbxI18n.t('filters.op_greater_equal') : 'Greater or Equal', value: '>='};
        this.less_equal = {title: window.structbxI18n ? window.structbxI18n.t('filters.op_less_equal') : 'Less or Equal', value: '<='};
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
            this.updateFilterCount();
            changesNotSaved($(e.currentTarget).parent().parent());
        });
        $(document).on('change', '#component_filters_read select[name=column]', e => {
            const filterElement = $(e.currentTarget).closest('.input-group');
            this.updateFilterInputs(filterElement);
            changesNotSaved($(e.currentTarget).parent());
        });
        $(document).on('change', '#component_filters_read select[name=op]', e => {
            changesNotSaved($(e.currentTarget).parent());
        });
        $(document).on('change', '#component_filters_read [name=value]', e => {
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
                <input type="text" class="form-control" name="value" placeholder="${window.structbxI18n ? window.structbxI18n.t('filters.value_placeholder') : 'Value'}" required/>
                <button type="button" class="btn btn-sm btn-dark-shadow ${type}"><i class="fas fa-${type=="modify" ? "pen" : "save"}"></i></button>
                <button type="button" class="btn btn-sm btn-dark-shadow me-2 delete"><i class="fas fa-trash"></i></button>
            </div>
        `);
    }

    setupNewFilterElement(type="modify", filter_row = undefined)
    {
        let filter = this.getFilterElement(type)
        let savedValue = filter_row ? filter_row.value : undefined;

        this.tableColumn.read(this.getTableIdentifier(), this.getViewIdentifier()).then((response_data) => {

            for(let column of response_data.body.data){
                let $option = $(`<option value="${column.identifier}">${column.name}</option>`);
                $option.attr('data-column-type', column.column_type);
                if(column.link_to){
                    $option.attr('data-link-to', column.link_to);
                }
                $(filter).find('select[name=column]').append($option);
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
                if(filter_row.is_active != undefined){
                    $(filter).find('input[name=is_active]')[0].checked = filter_row.is_active == 0 ? false : true;
                }
            }

            $('#component_filters_read .contents').append(filter);

            if($(filter).find('select[name=column]').val()){
                this.updateFilterInputs(filter, savedValue);
            }
        });
    }

    updateFilterInputs(filterElement, savedValue = undefined)
    {
        this.updateOperators(filterElement);
        this.updateValueInput(filterElement, savedValue);
    }

    updateOperators(filterElement)
    {
        const $columnSelect = $(filterElement).find('select[name=column]');
        const $opSelect = $(filterElement).find('select[name=op]');
        const selectedOp = $opSelect.val();
        const columnIdentifier = $columnSelect.val();

        if(!columnIdentifier){
            return;
        }

        const $selectedOption = $columnSelect.find('option:selected');
        const columnType = $selectedOption.attr('data-column-type');

        if(!columnType){
            return;
        }

        const validOps = OPERATORS_BY_TYPE[columnType] || OPERATORS_BY_TYPE.text;

        $opSelect.empty();
        for(const op of validOps){
            const label = OPERATOR_LABELS[op] || op;
            $opSelect.append(`<option value="${op}">${label}</option>`);
        }

        if(validOps.includes(selectedOp)){
            $opSelect.val(selectedOp);
        }
    }

    updateValueInput(filterElement, savedValue = undefined)
    {
        const $columnSelect = $(filterElement).find('select[name=column]');
        const columnIdentifier = $columnSelect.val();

        if(!columnIdentifier){
            return;
        }

        const $selectedOption = $columnSelect.find('option:selected');
        const columnType = $selectedOption.attr('data-column-type');
        const linkTo = $selectedOption.attr('data-link-to');
        const isRestore = savedValue !== undefined;
        const currentValue = isRestore ? savedValue : '';

        let $newInput;

        if(columnType === ColumnType.Selection && linkTo){
            $newInput = $(`<select class="form-select" name="value" required><option value="">${window.structbxI18n ? window.structbxI18n.t('base.none_option') : '-- None --'}</option></select>`);
            this.loadSelectionOptions(linkTo, $newInput, isRestore ? currentValue : undefined);
        }
        else if(columnType === ColumnType.IntNumber){
            $newInput = $(`<input type="number" step="1" class="form-control" name="value" placeholder="${window.structbxI18n ? window.structbxI18n.t('filters.value_placeholder') : 'Value'}" required/>`);
        }
        else if(columnType === ColumnType.DecimalNumber){
            $newInput = $(`<input type="number" step="any" class="form-control" name="value" placeholder="${window.structbxI18n ? window.structbxI18n.t('filters.value_placeholder') : 'Value'}" required/>`);
        }
        else if(columnType === ColumnType.Date){
            $newInput = $(`<input type="date" class="form-control" name="value" required/>`);
        }
        else if(columnType === ColumnType.Time){
            $newInput = $(`<input type="time" class="form-control" name="value" required/>`);
        }
        else if(columnType === ColumnType.CreatedDate || columnType === ColumnType.UpdatedDate){
            $newInput = $(`<input type="datetime-local" class="form-control" name="value" required/>`);
        }
        else {
            $newInput = $(`<input type="text" class="form-control" name="value" placeholder="${window.structbxI18n ? window.structbxI18n.t('filters.value_placeholder') : 'Value'}" required/>`);
        }

        $(filterElement).find('[name=value]').replaceWith($newInput);

        if(isRestore && currentValue && columnType !== 'selection'){
            $(filterElement).find('[name=value]').val(currentValue);
        }
    }

    updateFilterCount()
    {
        const count = $('#component_filters_read .contents input[name=is_active]:checked').length;
        $('#filters_count').text(count || '').toggleClass('d-none', count === 0);
    }

    loadSelectionOptions(linkTo, $select, selectedValue)
    {
        this.table_data.readToLinkSelectionOptions(linkTo).then((response_data) => {
            if(response_data.body && response_data.body.data){
                for(let row of response_data.body.data){
                    const colId = response_data.body.columns[0];
                    const colName = response_data.body.columns[1];
                    let label = row[colName];
                    if(row._structbx_column_colorHeader){
                        label = Tools.headerRowColor(row._structbx_column_colorHeader, label);
                    }
                    $select.append(`<option value="${row[colId]}">${label}</option>`);
                }
            }
            if(selectedValue){
                $select.val(selectedValue);
            }
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
            $(`#component_filters_read .contents`).html('');

            // Manage response
            const result = new ResponseManager(response_data, '#component_filters_read .notifications', 'target.filters_read');
            if(!result.Verify_())
                return;

            // Handle zero results
            if(response_data.body.data.length < 1){
                $('#filters_count').text('').toggleClass('d-none', true);
                $(`#component_filters_read .contents`).html(`<span class="text-muted p-2">${window.structbxI18n ? window.structbxI18n.t('filters.no_filters') : 'No filters.'}</span>`);
                return;
            }

            // Results elements creator
            wait.Off_();
            $('#component_filters_read .notifications').html('');

            for(const filter of response_data.body.data){
                this.setupNewFilterElement("modify", filter);
            }
            const activeCount = response_data.body.data.filter(f => f.is_active == 1).length;
            $('#filters_count').text(activeCount || '').toggleClass('d-none', activeCount === 0);
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
        const value = parent.find('[name=value]').val();
        const is_active = parent.find('input[name=is_active]')[0].checked;

        // Validate inputs
        if (column_identifier === "" || op === "" || value === ""){
            new wtools.Notification('WARNING').Show_(window.structbxI18n ? window.structbxI18n.t('filters.all_fields_required') : 'All filter fields are required.');
            return;
        }
        
        // Request
        this.viewFilter.add(this.getTableIdentifier(), this.getViewIdentifier(), column_identifier, op, value, is_active).
        then((response_data) => {
            wait.Off_();

            // Manage response
            const result = new ResponseManager(response_data, '#component_filters_read .notifications', 'target.filters_add');
            if(!result.Verify_())
                return;

            $(e.target).removeClass('save');
            $(e.target).addClass('modify');
            $(e.target).find('i').removeClass('fa-save');
            $(e.target).find('i').addClass('fa-pen');

            $(parent).attr('filter-identifier', response_data.body.message);
            this.updateFilterCount();
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
            new wtools.Notification('WARNING').Show_(window.structbxI18n ? window.structbxI18n.t('filters.identifier_not_found') : 'Filter identifier not found.');
            return;
        }

        // Get current values from the filter element
        const column_identifier = filter_element.find('select[name=column]').val();
        const op = filter_element.find('select[name=op]').val();
        const value = filter_element.find('[name=value]').val();
        const is_active = filter_element.find('input[name=is_active]')[0].checked;

        // Validate inputs
        if (column_identifier === "" || op === "" || value === ""){
            new wtools.Notification('WARNING').Show_(window.structbxI18n ? window.structbxI18n.t('filters.all_fields_required') : 'All filter fields are required.');
            return;
        }
        
        this.viewFilter.modify(filter_identifier, this.getTableIdentifier(), this.getViewIdentifier(), column_identifier, op, value, is_active)
        .then((response_data) => {
            // Manage response
            const result = new ResponseManager(response_data, '#component_filters_read .notifications', 'target.filters_modify');
            if(!result.Verify_())
                return;

            $(filter_element).find('.modify').css('background-color', '#fff');
            this.updateFilterCount();
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
            const result = new ResponseManager(response_data, '#notifications', 'target.filters_position_modify');
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
            new wtools.Notification('WARNING').Show_(window.structbxI18n ? window.structbxI18n.t('filters.identifier_not_found') : 'Filter identifier not found.');
            return;
        }

        // Request
        this.viewFilter.delete(filter_identifier, this.getViewIdentifier()).then((response_data) => {
            // Manage response
            const result = new ResponseManager(response_data, '#component_filters_read .notifications', 'target.filters_modify');
            if(!result.Verify_())
                return;

            $(filter_element).remove();
            this.updateFilterCount();
            this.onChanged();
        });
    }
}