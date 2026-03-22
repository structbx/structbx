
class TableDimensions
{
    // Setup
    STORAGE_KEY = 'tableColumnWidths';
    isResizing = false;
    currentResizeHandle = null;
    startX = 0;
    startWidth = 0;
    currentColumn = null;
    table = '#table';

    constructor(key, table)
    {
        this.STORAGE_KEY = key;
        this.table = table;
    }

    // Cargar anchos guardados o usar los predeterminados
    loadColumnWidths()
    {
        const savedWidths = localStorage.getItem(this.STORAGE_KEY);

        if (savedWidths)
        {
            try
            {
                const widths = JSON.parse(savedWidths);
                return widths;
            }
            catch (e)
            {
                return undefined;
            }
        }
        else
        {
            return undefined;
        }
    }

    // Guardar anchos en LocalStorage
    saveColumnWidths(widths)
    {
        try
        {
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(widths));
            return true;
        }
        catch (e)
        {
            return false;
        }
    }

    // Aplicar anchos a la tabla
    applyColumnWidths(widths)
    {
        if (!widths) return;

        $(this.table + ' thead th').each(function()
        {
            const colName = $(this).data('col');
            if (colName && widths[colName]) {
                const width = widths[colName] + 'px';
                $(this).css('width', width);
                $(this).find('.column-size-indicator').text(width);

                // Aplicar también a las celdas del cuerpo
                const colIndex = $(this).index();
                $(this.table + ' tbody td:nth-child(' + (colIndex + 1) + ')').css('width', width);
            }
        });
    }

    // Inicializar la tabla
    initializeTable()
    {
        const widths = this.loadColumnWidths();
        this.applyColumnWidths(widths);
        this.setupResizeHandles();
    }

    // Configurar handles de redimensionamiento
    setupResizeHandles()
    {
        const self = this;

        $(document).off('mousedown', '.resize-handle').on('mousedown', '.resize-handle', function(e)
        {
            e.preventDefault();
            e.stopPropagation();
            self.isResizing = true;
            self.currentResizeHandle = $(this);
            self.currentColumn = self.currentResizeHandle.closest('th');

            self.startX = e.pageX;
            self.startWidth = self.currentColumn.outerWidth();

            self.currentResizeHandle.addClass('resizing');

            $(document).on('mousemove', function(e) {self.handleMouseMove(e)});
            $(document).on('mouseup', function(e) {self.handleMouseUp(e)});
        });
    }

    // Manejador del movimiento del mouse
    handleMouseMove(e)
    {
        if (!this.isResizing || !this.currentColumn) return;

        const deltaX = e.pageX - this.startX;
        const newWidth = Math.max(50, this.startWidth + deltaX); // Mínimo 50px

        this.currentColumn.css('width', newWidth + 'px');
        this.currentColumn.find('.column-size-indicator').text(newWidth + 'px');

        // Aplicar también a las celdas del cuerpo
        const colIndex = this.currentColumn.index();
        $(this.table + ' tbody td:nth-child(' + (colIndex + 1) + ')').css('width', newWidth + 'px');
    }

    // Manejador de liberación del mouse
    handleMouseUp()
    {
        if (this.isResizing && this.currentColumn)
        {
            this.isResizing = false;
            this.currentResizeHandle.removeClass('resizing');

            // Guardar los nuevos anchos
            const widths = {};
            $(this.table + ' th').each(function()
            {
                const colName = $(this).data('col');
                if (colName) {
                    widths[colName] = $(this).outerWidth();
                }
            });

            this.saveColumnWidths(widths);
        }

        $(document).off('mousemove');
        $(document).off('mouseup');
    }

    // Detectar si LocalStorage está disponible
    checkLocalStorage()
    {
        try
        {
            const testKey = '__test__';
            localStorage.setItem(testKey, testKey);
            localStorage.removeItem(testKey);
            return true;
        }
        catch (e)
        {
            return false;
        }
    }

    Init_()
    {
        // Inicializar
        if (this.checkLocalStorage())
            {
                this.initializeTable();
            }
            else
            {
                this.applyColumnWidths(defaultWidths);
                this.setupResizeHandles();
            }
    }
}
