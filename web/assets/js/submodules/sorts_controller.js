import { BaseController } from '../modules/base_controller.js';
import * as Tools from '../classes/tools.js';
import * as DOME from '../classes/dom_elements.js';
import { ResponseManager } from '../classes/response_manager.js';
import { TableElements } from '../classes/table_elements.js';
import { I18n } from '../i18n/i18n.js';

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
    constructor(onChangedCallback = () => {}) {
        super();
        this.onChanged = onChangedCallback;

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
        const changesNotSaved = (element) => {
            $(element).find('.modify').css('background-color', '#bbb');
        }
        $(document).on('change', '#component_sorts_read input[name=is_active]', e => {
            this.updateSortCount();
            changesNotSaved($(e.currentTarget).parent().parent());
        });
        $(document).on('change', '#component_sorts_read select[name=column]', e => {
            changesNotSaved($(e.currentTarget).parent());
        });
        $(document).on('change', '#component_sorts_read select[name=sort]', e => {
            changesNotSaved($(e.currentTarget).parent());
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
                <select class="form-select" name="sort" required>
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

    updateSortCount()
    {
        const count = $('#component_sorts_read .contents input[name=is_active]:checked').length;
        $('#sorts_count').text(count || '').toggleClass('d-none', count === 0);
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
            $(`#component_sorts_read .contents`).html('');

            // Manage response
            const result = new ResponseManager(response_data, '#component_sorts_read .notifications', 'target.sorts_read');
            if(!result.Verify_())
                return;

            // Handle zero results
            if(response_data.body.data.length < 1){
                $('#sorts_count').text('').toggleClass('d-none', true);
                $(`#component_sorts_read .contents`).html(`<span class="text-muted p-2">${window.structbxI18n ? window.structbxI18n.t('sorts.no_sorts') : 'No sorts.'}</span>`);
                return;
            }

            // Results elements creator
            wait.Off_();
            $('#component_sorts_read .notifications').html('');

            for(const sort of response_data.body.data){
                this.setupNewSortElement("modify", sort);
            }
            const activeCount = response_data.body.data.filter(s => s.is_active == 1).length;
            $('#sorts_count').text(activeCount || '').toggleClass('d-none', activeCount === 0);
        });
    }

    add(e){
        // Wait animation
        let wait = new wtools.ElementState(
            e.currentTarget
            , true, 'button', new wtools.WaitAnimation().for_button
        );

        // Clean notifications
        $('#component_sorts_read .notifications').html('');

        const parent = $(e.currentTarget).parent();
        const column_identifier = parent.find('select[name=column]').val();
        const sort = parent.find('select[name=sort]').val();
        const is_active = parent.find('input[name=is_active]')[0].checked;

        // Validate inputs
        if (column_identifier === "" || sort === ""){
            new wtools.Notification('WARNING').Show_(window.structbxI18n ? window.structbxI18n.t('sorts.all_fields_required') : 'All sort fields are required.');
            wait.Off_();
            return;
        }
        
        // Validate sort value (ASC or DESC)
        if (sort !== 'ASC' && sort !== 'DESC'){
            new wtools.Notification('WARNING').Show_(window.structbxI18n ? window.structbxI18n.t('sorts.invalid_type') : 'Sort type must be ASC or DESC.');
            wait.Off_();
            return;
        }
        
        // Request
        this.viewSort.add(this.getTableIdentifier(), this.getViewIdentifier(), column_identifier, sort, is_active).
        then((response_data) => {
            wait.Off_();

            // Manage response
            const result = new ResponseManager(response_data, '#component_sorts_read .notifications', 'target.sorts_add');
            if(!result.Verify_())
                return;
            
            $(e.target).removeClass('save');
            $(e.target).addClass('modify');
            $(e.target).find('i').removeClass('fa-save');
            $(e.target).find('i').addClass('fa-pen');

            $(parent).attr('sort-identifier', response_data.body.message);
            this.updateSortCount();
            this.onChanged();
        });
    }

    modify(e){
        // Clean notifications
        $('#component_sorts_read .notifications').html('');

        // Get sort identifier from the parent element
        const sort_element = $(e.currentTarget).parent();
        const sort_identifier = sort_element.attr('sort-identifier');
        if(sort_identifier === undefined){
            new wtools.Notification('WARNING').Show_(window.structbxI18n ? window.structbxI18n.t('sorts.identifier_not_found') : 'Sort identifier not found.');
            return;
        }

        // Get current values from the sort element
        const column_identifier = sort_element.find('select[name=column]').val();
        const sort = sort_element.find('select[name=sort]').val();
        const is_active = sort_element.find('input[name=is_active]')[0].checked;

        // Validate inputs
        if (column_identifier === "" || sort === ""){
            new wtools.Notification('WARNING').Show_(window.structbxI18n ? window.structbxI18n.t('sorts.all_fields_required') : 'All sort fields are required.');
            return;
        }
        
        // Validate sort value (ASC or DESC)
        if (sort !== 'ASC' && sort !== 'DESC'){
            new wtools.Notification('WARNING').Show_(window.structbxI18n ? window.structbxI18n.t('sorts.invalid_type') : 'Sort type must be ASC or DESC.');
            return;
        }
        
        this.viewSort.modify(sort_identifier, this.getTableIdentifier(), this.getViewIdentifier(), column_identifier, sort, is_active)
        .then((response_data) => {
            // Manage response
            const result = new ResponseManager(response_data, '#component_sorts_read .notifications', 'target.sorts_modify');
            if(!result.Verify_())
                return;

            $(sort_element).find('.modify').css('background-color', '#fff');
            this.updateSortCount();
            this.onChanged();
        });
    }

    modifyPosition(ui){
        let sort_identifier = $(ui.item).attr('sort-identifier');
        let sortPrev = $(ui.item).prev().attr('sort-identifier');
        let sortNext = $(ui.item).next().attr('sort-identifier');

        // Request
        this.viewSort.modifyPosition(sort_identifier, this.getViewIdentifier(), sortPrev, sortNext).then((response_data) =>{
            // Manage response
            const result = new ResponseManager(response_data, '#notifications', 'target.sorts_position_modify');
            if(!result.Verify_()){
                this.read();
                return;
            }
            this.onChanged();
        });
    }

    modifyVisible(e){
        // Clean notifications
        $('#component_sorts_read .notifications').html('');

        // Get sort identifier from the parent element
        const sort_element = $(e.currentTarget).parent();
        const sort_identifier = sort_element.attr('sort-identifier');
        if(sort_identifier === undefined){
            new wtools.Notification('WARNING').Show_(window.structbxI18n ? window.structbxI18n.t('sorts.identifier_not_found') : 'Sort identifier not found.');
            return;
        }

        // Get current is_active value
        const is_active = $(e.currentTarget).prop('checked');

        this.viewSort.modifyVisible(sort_identifier, this.getViewIdentifier(), is_active)
        .then((response_data) => {
            // Manage response
            const result = new ResponseManager(response_data, '#component_sorts_read .notifications', 'target.sorts_visibility_modify');
            if(!result.Verify_())
                return;
            this.updateSortCount();
            this.onChanged();
        });
    }

    delete(e){
        // Clean notifications
        $('#component_sorts_read .notifications').html('');

        // Get sort identifier from the parent element
        const sort_element = $(e.currentTarget).parent();
        const sort_identifier = sort_element.attr('sort-identifier');
        if(sort_identifier === undefined){
            new wtools.Notification('WARNING').Show_(window.structbxI18n ? window.structbxI18n.t('sorts.identifier_not_found') : 'Sort identifier not found.');
            return;
        }

        // Request
        this.viewSort.delete(sort_identifier, this.getViewIdentifier()).then((response_data) => {
            // Manage response
            const result = new ResponseManager(response_data, '#component_sorts_read .notifications', 'target.sorts_delete');
            if(!result.Verify_())
                return;

            $(sort_element).remove();
            this.updateSortCount();
            this.onChanged();
        });
    }
}