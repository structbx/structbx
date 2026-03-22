
class Data
{
    changeInt = 0;
    changeIntInit = false;
    data_read_page = 1;
    data_read_limit = 20;
    data_read_page_end = false;
    data_read_columns = [];
    users_in_database = {};
    read_mutex = false;
    colorsSelect = 
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
    colorSelectAdd = new CustomSelect('#component_data_add_colorHeader');
    colorSelectModify = new CustomSelect('#component_data_modify_colorHeader');

    constructor()
    {
        this.ReadUsersInDatabase_(() => this.Read_());
        //setInterval(this.ChangeIntVerification_.bind(this), 5000);

        this.colorSelectAdd.AddOption_('', '-- Ninguno --');
        this.colorSelectModify.AddOption_('', '-- Ninguno --');
        this.colorsSelect.forEach(colorOption => {
            this.colorSelectAdd.AddOption_(colorOption.color, colorOption.html);
            this.colorSelectModify.AddOption_(colorOption.color, colorOption.html);
        });
        this.colorSelectAdd.hiddenInput.attr('name', '_structbx_column_colorHeader');
        this.colorSelectModify.hiddenInput.attr('name', '_structbx_column_colorHeader');
    }

    CreateRows_(response_data, row)
    {
        let elements = [];

        // Basic <td> row
        const basic_row = (row, column, link_color = undefined) =>
        {
            let header = row[column];
            if(link_color != undefined && link_color != "")
            {
                header = getHeaderColor(link_color, row[column]);
            }
            elements.push(`<td class="bg-white" scope="row">${header}</td>`);
        };
        // header <td> row
        const header_row = (row, column) =>
        {
            let header = row[column];
            if(row["_structbx_column_colorHeader"] != undefined && row["_structbx_column_colorHeader"] != "")
            {
                header = getHeaderColor(row["_structbx_column_colorHeader"], row[column]);
            }
            elements.push(`<td class="bg-white" scope="row">${header}</td>`)
        };
        // User <td> row
        const user_row = (row, column) =>
        {
            if(this.users_in_database[row[column]] != undefined)
                elements.push(`<td class="bg-white" scope="row">${this.users_in_database[row[column]]}</td>`);
            else
                elements.push(`<td class="bg-white" scope="row">${row[column]}</td>`);
        };
        // Image <td> row
        const image_row = (row, column) =>
        {
            elements.push(`<td class="bg-white" scope="row"><img class="" src="/api/tables/data/file/read?filepath=${row[column]}&table-identifier=${GetTableIdentifier()}" alt="${column}" width="100px"></td>`);
        };
        // File <td> row
        const file_row = (row, column) =>
        {
            if(row[column].length > 10)
            {
                // Setup text less than 10 characters
                let new_content = "";
                let max = row[column].length - 1;
                for(let i = max; i > max - 10; i--)
                    new_content = row[column][i] + new_content;
                    
                elements.push(`<td class="bg-white" scope="row">...${new_content}</td>`);
            }
            else
                basic_row(row, column);
        };

        // Loop in columns
        let key = 0;
        for(let column of response_data.body.columns)
        {
            if(column.includes("_structbx_column"))
                continue;

            // Setup columns meta
            let column_meta = response_data.body.columns_meta.data[key];

            if(column_meta != undefined && row[column] != "")
            {
                let link_color = row[`_structbx_column_${column_meta.id}_colorHeader`];

                // Verify column type
                if(column_meta.column_type == "image")
                    image_row(row, column);
                else if(column_meta.column_type == "file")
                    file_row(row, column);
                else if(column_meta.column_type == "user" || column_meta.column_type == "current-user")
                    user_row(row, column);
                else if(key == 1)
                    header_row(row, column);
                else
                    basic_row(row, column, link_color);
            }
            else
                basic_row(row, column);

            key++;
        }

        // Return <td> rows in array
        return elements;
    }

    GetPath_ = (reload, clean = true) =>
    {
        // Get Table identifier
        const table_identifier = GetTableIdentifier();
        if(table_identifier == undefined)
            return "";

        // Get conditions
        let conditions = ""
        if(wtools.GetUrlSearchParam('conditions') != undefined)
            conditions = `&conditions=${wtools.GetUrlSearchParam('conditions')}`;

        // Get order
        let order = ""
        if(wtools.GetUrlSearchParam('order') != undefined)
            order = `&order=${wtools.GetUrlSearchParam('order')}`;

        // Path request
        let path = "";
        if(reload)
        {
            // Set current limit
            //this.data_read_limit = $('#component_data_read table tbody')[0].rows.length;
            this.data_read_limit = 20 * this.data_read_page;
            if(clean)
                $('#component_data_read table tbody').html('');

            // Setup path
            if(this.data_read_limit < 20)
                path = `?table-identifier=${table_identifier}&limit=20${conditions}${order}`;
            else
                path = `?table-identifier=${table_identifier}&limit=${this.data_read_limit}${conditions}${order}`;
        }
        else
        {
            // Setup path
            path = `?table-identifier=${table_identifier}&page=${this.data_read_page}${conditions}${order}`;
        }
        return path;
    }

    GetBodyData_ = (response_data) =>
    {
        if (response_data.body == undefined || response_data.body.data == undefined)
            return [];
        else
            return response_data.body.data;
    }

    FreeMutex_()
    {
        this.read_mutex = false;
    }

    Read_ = (reload = false) =>
    {
        try
        {
            // Verify mutex
            if(this.read_mutex)
                return;

            // Set mutex
            this.read_mutex = true;

            // Exit if end of results and no reload
            if(this.data_read_page_end && reload == false)
            {
                this.FreeMutex_();
                return;
            }

            // Get Table identifier
            const table_identifier = GetTableIdentifier();
            if(table_identifier == undefined)
            {
                this.FreeMutex_();
                return "";
            }

            // Get path
            const path = this.GetPath_(reload);
            if(path == "")
            {
                this.FreeMutex_();
                return;
            }

            // Wait animation
            let wait = new wtools.ElementState('#component_data_read .notifications', false, 'block', new wtools.WaitAnimation().for_block);

            // Request
            new wtools.Request(server_config.current.api + `/tables/data/read${path}`).Exec_((response_data) =>
            {
                // Get data
                let data = this.GetBodyData_(response_data);

                // Clean
                wait.Off_();
                $('#component_data_read .notifications').html('');

                // Manage response
                const result = new ResponseManager(response_data, '#component_data_read .notifications', 'Data: Leer');
                if(!result.Verify_())
                {
                    this.FreeMutex_();
                    return;
                }

                // Results elements creator (Columns)
                if($('#component_data_read table thead tr').html() == "" && response_data.body.columns_meta != undefined)
                {
                    // Variables
                    let keys = response_data.body.columns_meta.data;
                    this.data_read_columns = [];
                    let it = 0;

                    // Setup columns meta
                    new wtools.UIElementsCreator('#component_data_read table thead tr', keys).Build_((row) =>
                    {
                        // Setup columns and icon
                        let table_element_object = new TableElements(wtools.IFUndefined(row.column_type, "text"), row, table_identifier);
                        let table_icon = table_element_object.GetIcon_(false);

                        // Add column to array
                        this.data_read_columns.push({id: row.id, identifier: row.identifier, name: row.name});

                        it++;
                        
                        return [`
                            <th scope="col" class="user-select-none position-relative" data-col="${row.id}">
                                <span>${table_icon}${row.name}</span>
                                <div class="resize-handle"></div>
                            </th>
                        `];
                    });

                    // Setup table dimensions
                    let tableD = new TableDimensions(table_identifier, '#component_data_read_table');
                    tableD.Init_();
                    // Prevenir selección de texto durante el redimensionamiento
                    $(document).on('selectstart', function(e)
                    {
                        if (tableD.isResizing)
                        {
                            e.preventDefault();
                            return false;
                        }
                    });

                    // If there is less than 5 columns, add empty column
                    /*if(it < 5)
                    {
                        $('#component_data_read table thead tr').append($(`<th scope="col"  class="user-select-none" style="width: 50%;background: #f3f3f3;border-top:none !important;"></th>`));
                    }*/
                }

                // Verify if results is lower than limit
                if(data.length < this.data_read_limit)
                    this.data_read_page_end = true;

                // Handle zero results
                if(data.length < 1)
                {
                    // End of results reached
                    this.data_read_page_end = true;
                    this.FreeMutex_();
                    return;
                }

                // No end of results
                this.data_read_page_end = false;

                // Results elements creator (Rows)
                new wtools.UIElementsCreator('#component_data_read table tbody', data).Build_((row) =>
                {
                    // Create rows
                    const elements = this.CreateRows_(response_data, row);
                    return new wtools.UIElementsPackage(`<tr id="row_${row.ID}" record-id="${row.ID}"></tr>`, elements).Pack_();
                });

                // Next page if not reload
                if(!reload)
                    this.data_read_page++;

                // Change int verification
                this.ChangeIntVerification_();

                // Free mutex
                this.FreeMutex_();
            });
        }
        catch(error)
        {
            // Free mutex
            this.FreeMutex_();

            new wtools.Notification('ERROR').Show_(`Ocurri&oacute; un error.`);
            return;
        }
    };

    RefreshRow_(row_id)
    {
        try
        {
            // Get Form identifier
            const table_identifier = GetTableIdentifier();
            if(table_identifier == undefined)
                return;

            // Get Data ID
            if(row_id == undefined)
            {
                new wtools.Notification('WARNING').Show_('No se encontr&oacute; el identificador del registro.');
                return;
            }

            $('#component_data_modify .notifications').html('');
            
            // Get conditions
            let conditions = ""
            if(wtools.GetUrlSearchParam('conditions') != undefined)
                conditions = `&conditions=${wtools.GetUrlSearchParam('conditions')}`;

            // Get order
            let order = ""
            if(wtools.GetUrlSearchParam('order') != undefined)
                order = `&order=${wtools.GetUrlSearchParam('order')}`;

            // Request row
            new wtools.Request(server_config.current.api + `/tables/data/read?id=${row_id}&table-identifier=${table_identifier}${conditions}${order}`).Exec_((response_data) =>
            {
                // Manage response
                const result = new ResponseManager(response_data, '', 'Data: Leer (1)');
                if(!result.Verify_())
                    return;
    
                // Handle no results or zero results
                if(response_data.body.data.length < 1)
                    return;

                // Results elements creator (Rows)
                const elements = this.CreateRows_(response_data, response_data.body.data[0]);

                // Update row
                $('#row_' + row_id).html('');
                for(let td of elements)
                {
                    $('#row_' + row_id).append(td);
                }
            });

        }
        catch(error)
        {
            new wtools.Notification('ERROR').Show_(`Ocurri&oacute; un error: ${error}.`);
            return;
        }
    };
    
    ChangeIntVerification_()
    {
        // Get Form identifier
        const table_identifier = GetTableIdentifier();
        if(table_identifier == undefined)
            return;

        // Request
        new wtools.Request(server_config.current.api + `/tables/data/read/changeInt?changeInt=${this.changeInt}&table-identifier=${table_identifier}`).Exec_((response_data) =>
        {
            const data = response_data.body.data;
            if(data != undefined && data.length > 0)
            {
                if(!this.changeIntInit)
                {
                    // Firs init of changeInit (only update changeInt value to the last element id)
                    this.changeInt = data[data.length - 1].id;
                    this.changeIntInit = true;
                }
                else
                {
                    // If there is new changeInt, refresh rows
                    let reload = false;
                    for(let row of data)
                    {
                        this.changeInt = row.id;
                        switch(row.operation)
                        {
                            case "insert":
                                reload = true;
                                break;
                            case "update":
                                this.RefreshRow_(row.row_id);
                                break;
                            case "delete":
                                $(`#row_${row.row_id}`).remove();
                                break;
                            case "import":
                                reload = true;
                                break;
                        }
                    }
                    if(reload)
                        this.ReadUsersInDatabase_(() => this.Read_(true));
                }
            }
        });
    };

    ReadUsersInDatabase_(callback)
    {
        new wtools.Request(server_config.current.api + `/databases/users/current/read`).Exec_((response_data) =>
        {
            try
            {
                for(let row of response_data.body.data)
                    this.users_in_database[row.id] = row.username;

                return callback();
            }
            catch(error)
            {
                new wtools.Notification('WARNING').Show_(`No se pudo acceder a los usuarios de la base de datos.`);
                return;
            }
        });
    }

    SetupColumnRow_(row, table_identifier, elements, first, target, value = undefined)
    {
        // If column type is a NORMAL type
        let table_element_object = new TableElements(wtools.IFUndefined(row.column_type, "text"), row, table_identifier);
        let table_element = $(table_element_object.Get_());
        let table_icon = table_element_object.GetIcon_();

        if(table_element == undefined)
        {
            new wtools.Notification('ERROR').Show_('Error al crear un elemento de tabla.');
            return false;
        }

        // If column type is SELECTION
        if(row.column_type == "selection")
        {
            table_element = $('<td></td>');
            let customSelect = new CustomSelect(table_element);
            customSelect.hiddenInput.attr('name', row.identifier);
            OptionsLinkSelection(customSelect, row.link_to_table, row.name, `${target} .notifications`, value);
        }
        else if(row.column_type == "user")
            OptionsLinkUsersInDatabase(table_element, `${target} .notifications`, value);

        // Final elements
        elements.push(`<th scope="row">${table_icon}${row.name}</th>`);
        elements.push(table_element);

        if(first)
        {
            $(`${target} .form_input_header`).append(`<h5 class="mb-2">${table_icon}${row.name}</h5>`);
            $(`${target} .form_input_header`).append($(table_element).children().first());
            return false;
        }

        return true;
    }

    ReadDataColumns_()
    {
        try
        {
            $('#component_data_add .notifications').html('');

            // Wait animation
            let wait = new wtools.ElementState('#wait_animation_page', true, 'block', new wtools.WaitAnimation().for_page);

            // Get Form identifier
            const table_identifier = GetTableIdentifier();
            if(table_identifier == undefined)
                return;

            // Setup data columns
            $('#component_data_add .form_input_header').html('');
            $('#component_data_add table tbody').html('');
            
            // Read and setup columns
            new wtools.Request(server_config.current.api + `/tables/columns/read?table-identifier=${table_identifier}`).Exec_((response_data) =>
            {
                // Manage response
                const result = new ResponseManager(response_data, '', 'Data: Columnas: Leer');
                if(!result.Verify_())
                    return;    

                // Handle zero results
                if(response_data.body.data.length < 1)
                {
                    wait.Off_();
                    new wtools.Notification('WARNING').Show_('Debe crear columnas para agregar registros.');
                    return;
                }
                
                // Results elements creator
                let first = true;
                new wtools.UIElementsCreator('#component_data_add table tbody', response_data.body.data).Build_((row) =>
                {
                    if(row.identifier == "id")
                        return undefined;

                    let elements = [];
                    if(!this.SetupColumnRow_(row, table_identifier, elements, first, '#component_data_add'))
                    {
                        first = false;
                        return;
                    }
                    
                    return new wtools.UIElementsPackage('<tr></tr>', elements).Pack_();
                });

                wait.Off_();
                $('#component_data_add form').removeClass('was-validated');
                $('#component_data_add').modal('show');
            });

        }
        catch(error)
        {
            new wtools.Notification('ERROR').Show_(`Ocurri&oacute; un error: ${error}.`);
            return;
        }
    };

    Add_(e)
    {
        // Wait animation
        let wait = new wtools.ElementState('#component_data_add form button[type=submit]', true, 'button', new wtools.WaitAnimation().for_button);

        // Form check
        const check = new wtools.FormChecker(e.target).Check_();
        if(!check)
        {
            wait.Off_();
            $('#component_data_add .notifications').html('');
            new wtools.Notification('WARNING', 5000, '#component_data_add .notifications').Show_('Hay campos inv&aacute;lidos.');
            return;
        }

        // Get Table identifier
        const table_identifier = GetTableIdentifier();
        if(table_identifier == undefined)
        {
            wait.Off_();
            return;
        }

        // Data collection
        let new_data = new FormData($('#component_data_add form')[0]);
        new_data.append('table-identifier', table_identifier);

        // Request
        new wtools.Request(server_config.current.api + "/tables/data/add", "POST", new_data, false).Exec_((response_data) =>
        {
            wait.Off_();
            
            // Manage response
            const result = new ResponseManager(response_data, '#component_data_add .notifications', 'Data: A&ntilde;adir');
            if(!result.Verify_())
                return;

            new wtools.Notification('SUCCESS').Show_('Registro guardado.');
            $('#component_data_add').modal('hide');
            this.ChangeIntVerification_();
        });
    }

    ReadDataToModify_(e)
    {
        try
        {
            // Wait animation
            let wait = new wtools.ElementState('#wait_animation_page', true, 'block', new wtools.WaitAnimation().for_page);

            // Get Form identifier
            const table_identifier = GetTableIdentifier();
            if(table_identifier == undefined)
            {
                wait.Off_();
                return;
            }

            // Get Data ID
            let data_id = $(e.currentTarget).attr('record-id');
            if(data_id == undefined)
            {
                wait.Off_();
                new wtools.Notification('WARNING').Show_('No se encontr&oacute; el identificador del registro.');
                return;
            }

            // Setup form to modify
            $('#component_data_modify .form_input_header').html('');
            $('#component_data_modify table tbody').html('');
            $('#component_data_modify .notifications').html('');
            
            // Read form to modify
            new wtools.Request(server_config.current.api + `/tables/data/read?id=${data_id}&table-identifier=${table_identifier}`).Exec_((response_data) =>
            {
                // Manage response
                const result = new ResponseManager(response_data, '', 'Data: Modificar');
                if(!result.Verify_())
                {
                    wait.Off_();
                    return;
                }
    
                // Handle no results or zero results
                if(response_data.body.data.length < 1)
                {
                    wait.Off_();
                    new wtools.Notification('SUCCESS').Show_('Sin resultados.');
                    return;
                }

                // Add values to columns_data
                let data = response_data.body.columns_meta.data;
                for(let it of data)
                {
                    it.value = response_data.body.data[0][it.name];
                }

                // Setup color header
                this.colorSelectModify.setValue(response_data.body.data[0]._structbx_column_colorHeader);

                // Results elements creator
                let first = true;
                new wtools.UIElementsCreator('#component_data_modify table tbody', data).Build_((row) =>
                {
                    if(row.identifier == "id")
                    {
                        $('#component_data_modify input[name="id"]').val(data_id);
                        return;
                    }

                    let elements = [];
                    if(!this.SetupColumnRow_(row, table_identifier, elements, first, '#component_data_modify', row.value))
                    {
                        first = false;
                        return;
                    }
                    
                    return new wtools.UIElementsPackage('<tr></tr>', elements).Pack_();
                });

                wait.Off_();
                $('#component_data_modify form').removeClass('was-validated');
                $('#component_data_modify').modal('show');
            });

        }
        catch(error)
        {
            new wtools.Notification('ERROR').Show_(`Ocurri&oacute; un error: ${error}.`);
            return;
        }
    }

    Modify_(e)
    {
        // Wait animation
        let wait = new wtools.ElementState('#component_data_modify form button[type=submit]', true, 'button', new wtools.WaitAnimation().for_button);

        // Form check
        const check = new wtools.FormChecker(e.target).Check_();
        if(!check)
        {
            wait.Off_();
            $('#component_data_modify .notifications').html('');
            new wtools.Notification('WARNING', 5000, '#component_data_modify .notifications').Show_('Hay campos inv&aacute;lidos.');
            return;
        }

        // Get Form identifier
        const table_identifier = GetTableIdentifier();
        if(table_identifier == undefined)
        {
            wait.Off_();
            return;
        }

        // Data collection
        let new_data = new FormData($('#component_data_modify form')[0]);
        new_data.append('table-identifier', table_identifier);

        // Request
        new wtools.Request(server_config.current.api + "/tables/data/modify", "PUT", new_data, false).Exec_((response_data) =>
        {
            wait.Off_();
            
            // Manage response
            const result = new ResponseManager(response_data, '#component_data_modify .notifications', 'Data: Modificar');
            if(!result.Verify_())
                return;

            new wtools.Notification('SUCCESS').Show_('Registro Actualizado.');
            $('#component_data_modify').modal('hide');
            this.ChangeIntVerification_();
        });
    }

    ReadDataToDelete_()
    {
        // Wait animation
        let wait = new wtools.ElementState('#wait_animation_page', true, 'block', new wtools.WaitAnimation().for_page);

        // Data
        let data = new FormData($('#component_data_modify form')[0]);
        const data_id = data.get('id');

        // Setup data to delete
        $('#component_data_delete input[name=id]').val(data_id);
        $('#component_data_delete strong.id').html(data_id);
        $('#component_data_delete').modal('show');
        wait.Off_();
    }

    Delete_()
    {
        // Wait animation
        let wait = new wtools.ElementState('#component_data_delete form button[type=submit]', true, 'button', new wtools.WaitAnimation().for_button);

        // Get Form identifier
        const table_identifier = GetTableIdentifier();
        if(table_identifier == undefined)
        {
            wait.Off_();
            return;
        }

        // Data
        const data_id = $('#component_data_delete input[name=id]').val();

        // Request
        new wtools.Request(server_config.current.api + `/tables/data/delete?id=${data_id}&table-identifier=${table_identifier}`, "DEL").Exec_((response_data) =>
        {
            wait.Off_();
            
            // Manage response
            const result = new ResponseManager(response_data, '#component_data_delete .notifications', 'Data: Eliminar');
            if(!result.Verify_())
                return;

            new wtools.Notification('SUCCESS').Show_('Registro eliminado.');
            $('#component_data_delete').modal('hide');
            $('#component_data_modify').modal('hide');
            this.ChangeIntVerification_();
        });
    }

    Export_()
    {
        // Wait animation
        let wait = new wtools.ElementState('#component_data_export .export', false, 'button', new wtools.WaitAnimation().for_button);

        // Get Form identifier
        const table_identifier = GetTableIdentifier();
        if(table_identifier == undefined)
            return;

        // Get path
        const path = this.GetPath_(true, false);
        if(path == "")
            return;

        // Request
        new wtools.Request(server_config.current.api + `/tables/data/read${path}&export=true`, ).MakeHTTPRequest()
        .then(response => response.body)
        .then(stream => 
        {
            const reader = stream.getReader();
            let content = [];

            return new ReadableStream(
            {
                async start(controller)
                {
                    while (true) 
                    {
                        const { done, value } = await reader.read();
                        if (done) break;
                        content.push(value);
                        controller.enqueue(value);
                    }
                    controller.close();
                }
            });
        })
        .then(stream => new Response(stream))
        .then(response => response.blob())
        .then(blob =>
        {
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            document.body.appendChild(a);
            a.style.display = 'none';
            a.href = url;
            let timestamp = new Date().getTime();
            let filename = `export_${timestamp}.csv`;
            a.download = filename;
            a.click();
            URL.revokeObjectURL(url);
            document.body.removeChild(a);

            wait.Off_();
            new wtools.Notification('SUCCESS').Show_(`Exportaci&oacute;n exitosa`);
        })
        .catch(error => {
            new wtools.Notification('WARNING').Show_(`Error al descargar el archivo: ${error}.`);
        });
    }
}

var dataObject = new Data();

$(function()
{
    // Pagination
    $('#component_data_read .contents').on("scroll", function(e)
    {
        if(e.currentTarget.scrollTop + e.currentTarget.clientHeight >= e.currentTarget.scrollHeight)
        {
            if($('#component_data_read table tbody').html() != "")
                dataObject.Read_();
        }
    });
    
    // Data reload button
    $('#component_data_reload').click(() => dataObject.Read_(true));
    
    // Click on add data button
    $('.data_add').click((e) => 
    {
        e.preventDefault();
        dataObject.ReadDataColumns_();
    });

    // Click on new tab
    $(document).on('click', '#component_sidebar_tables_tabs .tab-scroller .tab', (e) =>
    {
        e.preventDefault();

        // Get Form identifier
        const new_table_identifier = $(e.currentTarget).attr('table-identifier');

        // Reset URL parameters and set new form identifier
        const url = new URL(window.location.href);
        url.searchParams.delete('conditions');
        url.searchParams.delete('order');
        url.searchParams.delete('view');
        url.searchParams.set('identifier', new_table_identifier);
        history.pushState({}, '', url.toString());

        // Clear previous data
        $('#component_data_read table thead tr').html("");
        $('#component_data_read table tbody').html("");

        // New data object
        dataObject = new Data();

        // Reset views
        viewsObject.Read_();

        // Read Form
        objectTableGeneral.Read_();

        // Set to active current tab
        $('#component_sidebar_tables_tabs .tab').removeClass('active');
        $(e.currentTarget).addClass('active');
    });
    
    // Add record
    $('#component_data_add form').submit((e) =>
    {
        e.preventDefault();
        dataObject.Add_(e);
    });
    
    // Read columns and data to modify
    $(document).on("click", '#component_data_read table tbody tr', (e) =>
    {
        e.preventDefault();
        dataObject.ReadDataToModify_(e);
    });
    
    // Modify record
    $('#component_data_modify form').submit((e) =>
    {
        e.preventDefault();
        dataObject.Modify_(e);
    });

    // Read record to Delete
    $('#component_data_modify .delete').click((e) =>
    {
        e.preventDefault();
        dataObject.ReadDataToDelete_(e);
    });
    
    // Delete record
    $('#component_data_delete form').submit((e) =>
    {
        e.preventDefault();
        dataObject.Delete_();
    });
    
    // Export Data
    $('.data_export').click((e) =>
    {
        e.preventDefault();
        $('#component_data_export').modal('show');
    });

    $('#component_data_export .export').click((e) =>
    {
        e.preventDefault();
        dataObject.Export_();
    });
});