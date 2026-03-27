
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
        this.Clear_();
    }

    Clear_()
    {
        $(`${component_filters_read.identifier} .contents`).html('');
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
                return;

            // Results elements creator
            wait.Off_();
            $(target.notifications).html('');
            $(`${target.identifier} .contents`).html('');

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
    //data_read_columns = [];

    /*
    OrderElement_()
    {
        return $(`
            <tr class="ui-state-default">
                <td><a class="btn"><i class="fas fa-sort"></i></a></td>
                <td>
                    <select class="form-select" name="column" required>
                    </select>
                </td>
                <td>
                    <select class="form-select" name="order" required>
                        <option value="ASC">Ascendente</option>
                        <option value="DESC">Descendente</option>
                    </select>
                </td>
                <td><button type="button" class="btn-close" aria-label="Close"></button></td>
            </tr>
        `);
    }

    ReadFromURL_()
    {
        try
        {
            // Clean
            $('#component_data_filter_conditions tbody').html('');
            $('#component_data_filter_order tbody').html('');

            // Get Form identifier
            const conditions = wtools.GetUrlSearchParam('conditions');
            const order = wtools.GetUrlSearchParam('order');

            if(conditions != undefined && conditions != "")
            {
                let condition_decoded = atob(conditions);
                let conditions_array = condition_decoded.split('AND');

                for(let current_condition of conditions_array)
                {
                    let column = "";
                    let condition = "";
                    let value = "";
                    let count = 0;
                    for(let char of current_condition)
                    {
                        if(count == 0){count++;continue;}
                        if(count == 1)
                        {
                            if(char == " "){count++; continue;}
                            column += char;
                        }
                        else if(count == 2)
                        {
                            if(char == " "){count++; continue;}
                            condition += char;
                        }
                        else if(count == 3)
                        {
                            value += char;
                        }
                    }
                    column = column.replace("_structbx_column_", "");
                    value = value.replaceAll("'", "");
                    value = value.replaceAll("%", "");
                    value = value.slice(0, value.length - 1);
                    this.AddElementCondition_(column, condition, value);
                }
            }
            if(order != undefined && order != "")
            {
                let order_decoded = atob(order);
                for(let it of order_decoded.split(','))
                {
                    let it_split = it.split(' ');
                    const column = it_split[0].replace("_structbx_column_", "");
                    const order = it_split[1];
                    this.AddElementOrder_(column, order);
                }
            }
        }
        catch(error)
        {
            new wtools.Notification('SUCCESS', 5000, '#component_data_filter .notifications').Show_('No se pudieron decodificar los filtros actuales.');
        }
    }

    AddElementOrder_(column = undefined, order = undefined)
    {
        // Update data read columns
        this.data_read_columns = dataObject.data_read_columns;

        // Create row filter
        let row = this.OrderElement_();

        // Setup row 'columns'
        for(let column of this.data_read_columns)
        {
            $(row).find('select[name=column]').append($(`<option value="${column.id}">${column.name}</option>`))
        }
        if(column != undefined)
        {
            $(row).find('select[name=column]').val(column);
        }
        if(order != undefined)
        {
            $(row).find('select[name=order]').val(order);
        }

        // Add row filter
        $('#component_data_filter_order tbody').append(row);
    }

    Apply_()
    {
        let conditions = [];
        let orders = [];
        
        // Iterate over conditions
        $('#component_data_filter_conditions tbody tr').each(function()
        {
            const column = $(this).find('select[name="column"]').val();
            const condition = $(this).find('select[name="condition"]').val();
            const value = $(this).find('input[name="value"]').val();
        
            // Add parameter to the array
            let filter_type = new FilterType();
            switch(condition)
            {
                case filter_type.like.value:
                    conditions.push(` _structbx_column_${column} ${condition} '%${value}%' `);
                    break;
                case filter_type.equal.value:
                case filter_type.not_equal.value:
                case filter_type.greater.value:
                case filter_type.less.value:
                case filter_type.greater_equal.value:
                case filter_type.less_equal.value:
                    conditions.push(` _structbx_column_${column} ${condition} '${value}' `);
                    break;
                case filter_type.in_list.value:
                case filter_type.not_in_list.value:
                    conditions.push(` _structbx_column_${column} ${condition} (${value}) `);
                    break;
            }
        });
        
        // Iterate over orders
        $('#component_data_filter_order tbody tr').each(function()
        {
            const column = $(this).find('select[name="column"]').val();
            const order = $(this).find('select[name="order"]').val();
        
            // Add parameter to the array
            orders.push(`_structbx_column_${column} ${order}`);
        });
        
        // Join the parameters
        const conditions_query = conditions.join('AND');
        const orders_query = orders.join(',');
        
        // Get Form identifier
        const table_identifier = wtools.GetUrlSearchParam('identifier');
        if(table_identifier == undefined)
        {
            new wtools.ElementState('#wait_animation_page', true, 'block', new wtools.WaitAnimation().for_page);
            window.location.href = "/start";
        }

        // Build URL params
        const url = new URL(window.location.href);
        url.searchParams.set('identifier', table_identifier);
        url.searchParams.set('conditions', btoa(conditions_query));
        url.searchParams.set('order', btoa(orders_query));
        history.pushState({}, '', url.toString());

        // Reload data
        $('#component_data_reload').click();

        $('#component_data_filter').modal('hide');
    }*/
    
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

    // Setup filters tables
    /*$("#component_data_filter_conditions tbody").sortable();
    $("#component_data_filter_order tbody").sortable();

    $(document).on('click', '#component_data_read_table thead span', e => show_filter_modal(e));

    // Remove elements
    $(document).on('click', '#component_data_filter table .btn-close', e => 
    {
        e.preventDefault();
        $(e.currentTarget).parent().parent().remove();
    });

    $('#component_data_filter .add_order').click(e => 
    {
        e.preventDefault();
        filtersObject.AddElementOrder_();
    });

    // Submit filters
    $('#component_data_filter form').submit(e => 
    {
        e.preventDefault();

        // Form check
        const check = new wtools.FormChecker(e.target).Check_();
        if(!check)
        {
            $('#component_data_filter .notifications').html('');
            new wtools.Notification('WARNING', 5000, '#component_data_filter .notifications').Show_('Hay campos inv&aacute;lidos.');
            return;
        }

        filtersObject.Apply_();
    });

    // Reset filters
    $('#component_data_filter .reset_filters').click(e => 
    {
        e.preventDefault();
        
        // Get Form identifier
        const table_identifier = wtools.GetUrlSearchParam('identifier');
        if(table_identifier == undefined)
        {
            new wtools.ElementState('#wait_animation_page', true, 'block', new wtools.WaitAnimation().for_page);
            window.location.href = "/start";
        }
        
        // Build URL params
        const url = new URL(window.location.href);
        url.searchParams.delete('conditions');
        url.searchParams.delete('order');
        history.pushState({}, '', url.toString());

        // Reload data
        $('#component_data_reload').click();
    });*/
});