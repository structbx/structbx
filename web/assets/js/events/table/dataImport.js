$(function()
{
    var file_data = [];
    var map_columns = {sources: [], targets: []};
    
    const select_options = () =>
    {
        let options = "";
        for(let column of dataObject.data_read_columns)
        {
            options += `<option value="${column.identifier}">${column.name}</option>`;
        }
        options += `<option value="">-- SKIP --</option>`;
        return options;
    }

    // Read file
    const read_file = () =>
    {
        const file = $('#component_data_import input[name=file]');
        const separator = $('#component_data_import select[name=separator]').val();

        new CSVReader(file, separator).Read((state, data) =>
        {
            // Manage response error
            if(state == "ERROR")
            {
                $('#component_data_import .notifications').html('');
                new wtools.Notification('WARNING', 5000, '#component_data_import .notifications').Show_(data);
                return;
            }

            file_data = data;
            setup_map_columns();
        });
    }

    // Setup map columns
    const setup_map_columns = () =>
    {
        // Clean map table
        $('#component_data_import table.map tbody').html('');

        for(let header of Object.keys(file_data[0]))
        {
            // Setup column select
            let select = $(`<select class="form-select column" name="${header}">${select_options()}</select>`);
            // Select an option map
            $(select).find('option').each(function()
            {
                if(header.toLowerCase() == this.text.toLowerCase())
                {
                    $(select).val(this.value);
                    return false;
                }
            });

            //$(select).val(header);
            if($(select).val() == undefined) $(select).val(''); // Fix for select

            // Add row to map table
            let row = $('<tr></tr>');
            row.append(`<th scope="row">${header}</th>`);
            row.append($('<td></td>').append(select));
            $('#component_data_import table.map tbody').append(row);
        }

        previsualize_data();
    }

    // Previsualize data
    const previsualize_data = () =>
    {
        // Clean previsualization table
        $('#component_data_import table.previsualization thead tr').html('');
        $('#component_data_import table.previsualization tbody').html('');

        // Enable columns
        map_columns.sources = [];
        map_columns.map = {}
        $("#component_data_import .map .column").each(function()
        {
            if($(this).val() == '') return;

            source = $(this).attr('name');
            map_columns.sources.push(source);
            map_columns.map[source] = $(this).val();
        });

        // Previsualize data
        let cont = 0;
        for(let row of file_data)
        {
            if(cont > 5) break;

            // Setup Header
            if(cont == 0)
            {
                let headers = "";
                for(let header of Object.keys(row))
                {
                    if(map_columns.sources.includes(header))
                        headers += `<th>${header}</th>`;
                }
                $('#component_data_import table.previsualization thead tr').append(headers);
            }

            // Setup Data
            let elements = "";
            for(let header of Object.keys(row))
            {
                if(map_columns.sources.includes(header))
                    elements += `<td>${row[header]}</td>`;
            }
            $('#component_data_import table.previsualization tbody').append(`<tr>${elements}</tr>`);
            cont++;
        }
    }

    const send_data = () =>
    {
        let final_data = [];
        for(let row of file_data)
        {
            // Setup Data
            let elements = {};
            for(let header of Object.keys(row))
            {
                if(map_columns.sources.includes(header))
                    elements[map_columns.map[header]] = row[header];
            }
            final_data.push(elements);
        }
        return final_data;
    }

    // Import Data
    $('.data_import').click((e) =>
    {
        e.preventDefault();

        $('#component_data_import').modal('show');
    });

    // Input file change
    $('#component_data_import input[name=file]').change(() => read_file());
    $('#component_data_import select[name=separator]').change(() => read_file());
    $(document).on('change', '#component_data_import select.column', () => previsualize_data());

    // Submit form
    $('#component_data_import form').submit((e) =>
    {
        e.preventDefault();

        // Clear notifications
        $('#component_data_import_message .contents').html('');

        // Wait animation
        let wait = new wtools.ElementState('#component_data_import form button[type=submit]', true, 'button', new wtools.WaitAnimation().for_button);

        // Get Form identifier
        const table_identifier = wtools.GetUrlSearchParam('identifier');

        if(table_identifier == undefined)
        {
            wait.Off_();
            new wtools.Notification('WARNING').Show_('No se encontr&oacute; el identificador de la tabla.');
            return;
        }

        // Get Data
        data = [
            {name: "table-identifier", value: table_identifier}
            ,{data: send_data()}
        ];

        // Request
        new wtools.Request(server_config.current.api + `/tables/data/import`, "POST", data, true).Exec_((response_data) =>
        {
            wait.Off_();
            
            // Manage response
            const result = new ResponseManager(response_data, '#component_data_import .notifications', 'Data: Importar');
            if(!result.Verify_())
                return;

            $('#component_data_reload').click();
            $('#component_data_import_message').modal('show');
            $('#component_data_import_message .contents').append($(`<p>Mensaje: ${response_data.body.message}</p>`));
            $('#component_data_import_message .contents').append($(`<p>Total guardados: ${response_data.body.saved}</p>`));
            $('#component_data_import_message .contents').append($(`<p>Total no guardados: ${response_data.body.errors}</p>`));
            $('#component_data_import_message .contents').append($(`<p>Filas no guardadas: ${response_data.body.error_lines}</p>`));
        });
    });
});