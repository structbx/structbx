
// Components
var component_filters_read = new Component('#component_filters_read', ComponentTypes.BLOCK)

class FilterType
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

class Filters
{

    constructor()
    {
        
    }

    Clear_(default_content = false)
    {
        $(`${component_filters_read.identifier} .contents`).html(default_content ? '<span class="text-muted p-2">No hay filtros</span>' : '');
    }

    Read_()
    {

        let target = component_filters_read;
        // Wait animation
        let wait = new wtools.ElementState(target.notifications, false, 'block', new wtools.WaitAnimation().for_block);

        // Get Table identifier
        const table_identifier = wtools.GetUrlSearchParam('identifier');
        if(table_identifier == undefined)
            return;

        // Get View identifier
        const view_identifier = wtools.GetUrlSearchParam('v');
        if(view_identifier == undefined)
            return;

        // Request
        new wtools.Request(server_config.current.api + `/tables/filters/read?table-identifier=${table_identifier}&view-identifier=${view_identifier}`).Exec_((response_data) =>
        {
            // Clean
            wait.Off_();
            $(target.notifications).html('');

            // Manage response
            const result = new ResponseManager(response_data, target.notifications, 'Filtros: Leer');
            if(!result.Verify_())
                return;

            // Handle zero results
            if(response_data.body.data.length < 1)
            {
                this.Clear_(true);
                return;
            }

            // Results elements creator
            wait.Off_();
            $(target.notifications).html('');
            this.Clear_();

            for(let filter of response_data.body.data)
            {
                this.SetupNewFilterElement_(filter.identifier, filter.id_column, filter.op, filter.value);
            }
        });
    }
    
    GetFilterElement_(type = "modify")
    {
        let options = '';
        for(let option of new FilterType().array)
        {
            options += `<option value="${option.value}">${option.title}</option>`;
        }
        return $(`
            <div class="input-group ui-state-default mb-2">
                <a class="btn me-2"><i class="fas fa-sort"></i></a>
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

    SetupNewFilterElement_(identifier = undefined, column = undefined, op = undefined, value = undefined, type="modify")
    {
        // Create filter
        let filter = this.GetFilterElement_(type)

        // Setup row 'columns'
        for(let column of columnsObject.columns)
        {
            $(filter).find('select[name=column]').append($(`<option value="${column.identifier}">${column.name}</option>`))
        }
        if(identifier != undefined)
        {
            $(filter).attr('filter-identifier', identifier);
        }
        if(column != undefined)
        {
            $(filter).find('select[name=column]').val(column);
        }
        if(op != undefined)
        {
            $(filter).find('select[name=op]').val(op);
        }
        if(value != undefined)
        {
            $(filter).find('input[name=value]').val(value);
        }

        // Add filter
        $('#component_filters_read .contents').append(filter);
    }

    Add_(e)
    {
        // Clean notifications
        $('#component_filters_read .notifications').html('');

        // Get table identifier
        const table_identifier = wtools.GetUrlSearchParam('identifier');
        if(table_identifier == undefined)
        {
            wait.Off_();
            new wtools.Notification('WARNING').Show_('No se encontr&oacute; el identificador de la tabla.');
            return;
        }
        const view_identifier = wtools.GetUrlSearchParam('v');
        if(view_identifier == undefined)
        {
            wait.Off_();
            new wtools.Notification('WARNING').Show_('No se encontr&oacute; el identificador de la vista.');
            return;
        }

        const parent = $(e.currentTarget).parent();
        const column_identifier = parent.find('select[name=column]').val();
        const operator = parent.find('select[name=op]').val();
        const value = parent.find('input[name=value]').val();

        // Validate inputs
        if (column_identifier === "" || operator === "" || value === "")
        {
            new wtools.Notification('WARNING').Show_('Todos los campos del filtro son obligatorios.');
            return;
        }
        
        // Data collection
        const data = new FormData();
        data.append('table-identifier', table_identifier);
        data.append('view-identifier', view_identifier);
        data.append('column-identifier', column_identifier);
        data.append('op', operator);
        data.append('value', value);

        // Request
        new wtools.Request(server_config.current.api + "/tables/filters/add", "POST", data, false).Exec_((response_data) =>
        {
            // Manage response
            const result = new ResponseManager(response_data, '#component_filters_read .notifications', 'Filtros: A&ntilde;adir');
            if(!result.Verify_())
                return;

            this.Read_();
        });
    }

    Modify_(e)
    {
        // Clean notifications
        $('#component_filters_read .notifications').html('');

        // Get filter identifier from the parent element
        const filter_element = $(e.currentTarget).parent();
        const filter_identifier = filter_element.attr('filter-identifier');
        if(filter_identifier == undefined)
        {
            new wtools.Notification('WARNING').Show_('No se encontr&oacute; el identificador del filtro.');
            return;
        }

        // Get table identifier
        const table_identifier = wtools.GetUrlSearchParam('identifier');
        if(table_identifier == undefined)
        {
            new wtools.Notification('WARNING').Show_('No se encontr&oacute; el identificador de la tabla.');
            return;
        }
        const view_identifier = wtools.GetUrlSearchParam('v');
        if(view_identifier == undefined)
        {
            new wtools.Notification('WARNING').Show_('No se encontr&oacute; el identificador de la vista.');
            return;
        }

        // Get current values from the filter element
        const column_identifier = filter_element.find('select[name=column]').val();
        const operator = filter_element.find('select[name=op]').val();
        const value = filter_element.find('input[name=value]').val();

        // Validate inputs
        if (column_identifier === "" || operator === "" || value === "")
        {
            new wtools.Notification('WARNING').Show_('Todos los campos del filtro son obligatorios.');
            return;
        }
        
        // Data collection
        const data = new FormData();
        data.append('identifier', filter_identifier);
        data.append('table-identifier', table_identifier);
        data.append('view-identifier', view_identifier);
        data.append('column-identifier', column_identifier);
        data.append('op', operator);
        data.append('value', value);

        // Request
        new wtools.Request(server_config.current.api + "/tables/filters/modify", "PUT", data, false).Exec_((response_data) =>
        {
            // Manage response
            const result = new ResponseManager(response_data, '#component_filters_read .notifications', 'Filtros: Modificar');
            if(!result.Verify_())
                return;

            this.Read_();
        });
    }

    Delete_(e)
    {
        // Clean notifications
        $('#component_filters_read .notifications').html('');

        // Get filter identifier from the parent element
        const filter_element = $(e.currentTarget).parent();
        const filter_identifier = filter_element.attr('filter-identifier');
        if(filter_identifier == undefined)
        {
            new wtools.Notification('WARNING').Show_('No se encontr&oacute; el identificador del filtro.');
            return;
        }

        const view_identifier = wtools.GetUrlSearchParam('v');
        if(view_identifier == undefined)
        {
            new wtools.Notification('WARNING').Show_('No se encontr&oacute; el identificador de la vista.');
            return;
        }

        // Request
        const path = `/tables/filters/delete?identifier=${filter_identifier}&view-identifier=${view_identifier}`;
        new wtools.Request(server_config.current.api + path, "DEL").Exec_((response_data) =>
        {
            // Manage response
            const result = new ResponseManager(response_data, '#component_filters_read .notifications', 'Filtros: Modificar');
            if(!result.Verify_())
                return;

            this.Read_();
        });
    }
}

var filtersObject = new Filters();

$(function()
{
    // Show filter modal
    const show_filter_modal = (e) =>
    {
    
        e.preventDefault();

        $('#component_filters_read').modal('show');
    }
    $('.filters_read').click(e => show_filter_modal(e));

    $('#component_filters_read .add').click(e => 
    {
        e.preventDefault();
        filtersObject.Clear_();
        filtersObject.SetupNewFilterElement_(undefined, undefined, undefined, undefined, type="save");
    });

    $(document).on('click', '#component_filters_read .save', e => 
    {
        e.preventDefault();
        filtersObject.Add_(e);
    });

    $(document).on('click', '#component_filters_read .modify', e => 
    {
        e.preventDefault();
        filtersObject.Modify_(e);
    });

    $(document).on('click', '#component_filters_read .delete', e => 
    {
        e.preventDefault();
        filtersObject.Delete_(e);
    });

    // Sort filters position in view
    $(`${component_filters_read.identifier} .contents`).sortable
    ({
        update: function( event, ui)
        {
            let element = $(ui.item).attr('filter-identifier');
            let filterPrev = $(ui.item).prev().attr('filter-identifier');
            let filterNext = $(ui.item).next().attr('filter-identifier');

            // Get View identifier
            const view_identifier = wtools.GetUrlSearchParam('v');
            if(view_identifier == undefined)
            {
                wait.Off_();
                new wtools.Notification('WARNING').Show_('No se encontr&oacute; el identificador de la vista.');
                return;
            }

            // Data collection
            const new_data = new FormData();
            new_data.append('view-identifier', view_identifier);
            new_data.append('identifier', element);
            if(filterPrev != undefined)
                new_data.append('filterPrev', filterPrev);
            if(filterNext != undefined)
                new_data.append('filterNext', filterNext);

            // Request
            new wtools.Request(server_config.current.api + "/tables/filters/position/modify", "PUT", new_data, false).Exec_((response_data) =>
            {
                // Manage response
                const result = new ResponseManager(response_data, '#notifications', 'Filtros: Posici&oacute;n: Modificar');
                if(!result.Verify_())
                    return;

                viewsObject.Read_();
            });
        }
    });
});