class CustomSelect
{
    constructor(element)
    {
        // 1. Variables
        const self = this;
        this.open = false;
        
        // 2. Save the original selector/element
        this.originalElement = element;
        this.containerSelector = element;
        
        // 3. Create HTML first
        this.html_element = $(`
            <div class="custom-select-container">
                <input type="hidden" class="selectValue" name="selected_option" value="">
                <div class="custom-select-display form-control d-flex justify-content-between align-items-center shadow-sm" tabindex="0">
                    <span class="selectedText">Select an Option...</span>
                    <i class="fas fa-chevron-down"></i>
                </div>
                <div class="custom-select-dropdown shadow-lg d-none">
                    <div class="p-2 border-bottom">
                        <input type="text" class="form-control searchBox" placeholder="Search options...">
                    </div>
                    <ul class="selectOptions custom-select-list list-unstyled mb-0">
                    </ul>
                </div>
            </div>
        `);

        // 4. Add to DOM first
        this.Build_();
        
        // 5. Search elements INSIDE the already created container
        // Use find() instead of concatenated selectors
        this.container = $(element).find('.custom-select-container');
        this.display = this.container.find('.custom-select-display');
        this.dropdown = this.container.find('.custom-select-dropdown');
        this.options = this.container.find('.selectOptions');
        this.searchBox = this.container.find('.searchBox');
        this.hiddenInput = this.container.find('.selectValue');
        this.selectedText = this.container.find('.selectedText');

        // --- 1. Dropdown Toggle Handling ---
        this.display.on('click', (e) =>  // FIX: Use arrow function
        {
            e.stopPropagation(); // Prevent click from propagating to document
            this.dropdown.toggleClass('d-none');
            this.open = !this.dropdown.hasClass('d-none');
            
            // Focus on search box when opening
            if (!this.dropdown.hasClass('d-none'))
            {
                setTimeout(() => this.searchBox.focus(), 50); // Small delay to ensure visibility
            }
        });

        // --- 2. Close Dropdown when clicking outside ---
        $(document).on('click', function()
        {
            if(self.open)
                self.CloseDropdown_();
        });

        // --- 3. Option Selection and Update ---
        this.options.on('click', '.custom-select-item', function()
        {
            const $item = $(this);

            // a) Get data value and enriched HTML content
            const selectedValue = $item.data('value');
            const selectedHtml = $item.html();

            // b) Update hidden field for form submission
            self.hiddenInput.val(selectedValue);

            // c) Update visible display text with HTML content
            self.selectedText.html(selectedHtml);

            // d) Mark item as selected (visual style)
            self.options.find('.custom-select-item').removeClass('selected');
            $item.addClass('selected');

            // e) Close dropdown using method
            self.CloseDropdown_();

            // f) Trigger custom event so other scripts know
            self.container.trigger('customselect:change', [selectedValue, selectedHtml]);
        });

        // --- 4. Instant Search Functionality ---
        this.searchBox.on('keyup', function()
        {
            const searchText = $(this).val().toLowerCase().trim();

            self.options.find('.custom-select-item').each(function()
            {
                const $item = $(this);
                const itemText = $item.text().toLowerCase();

                if (itemText.includes(searchText))
                {
                    $item.removeClass('d-none'); // FIX: Use Bootstrap's d-none
                }
                else
                {
                    $item.addClass('d-none');
                }
            });
        });

        // 6. Handle Escape key to close
        this.searchBox.on('keydown', function(e)
        {
            if (e.key === 'Escape')
            {
                self.CloseDropdown_();
            }
        });
    }
    
    // Method to close dropdown (reusable)
    CloseDropdown_()
    {
        this.dropdown.addClass('d-none');
        
        // Clear search when closing
        this.searchBox.val('');
        this.options.find('.custom-select-item').removeClass('d-none');
    }
    
    // Improved Build method
    Build_()
    {
        // Clear original element first
        $(this.originalElement).empty().append(this.html_element);
        
        // If it's an existing input, copy initial value
        const originalInput = $(this.originalElement).find('input[type="hidden"]');
        if (originalInput.length)
        {
            const initialValue = originalInput.val();
            if (initialValue)
            {
                this.setValue(initialValue);
            }
        }
    }
    
    // Set value programmatically
    setValue(value)
    {
        const $item = this.options.find(`[data-value="${value}"]`);
        if ($item.length)
        {
            $item.trigger('click');
            return true;
        }
        return false;
    }
    
    // Get current value
    getValue()
    {
        return this.hiddenInput.val();
    }
    
    // Get current text
    getText()
    {
        return this.selectedText.text();
    }
    
    // Add option dynamically
    AddOption_(value, html, data = {})
    {
        const $newItem = $(`
            <li data-value="${value}" class="custom-select-item p-2">
                ${html}
            </li>
        `);
        
        // Add additional data if exists
        if (data.class) $newItem.addClass(data.class);
        if (data.icon) $newItem.prepend(`<i class="${data.icon} me-2"></i>`);
        
        this.options.append($newItem);
        return $newItem;
    }
    
    // Remove option
    RemoveOption_(value)
    {
        const $item = this.options.find(`[data-value="${value}"]`);
        if ($item.length)
        {
            // If it's the selected item, clear selection
            if ($item.hasClass('selected'))
            {
                this.hiddenInput.val('');
                this.selectedText.html('Select an Option...');
            }
            $item.remove();
            return true;
        }
        return false;
    }
    
    // Enable/disable
    setDisabled(disabled)
    {
        if (disabled)
        {
            this.display.addClass('disabled').attr('tabindex', '-1');
            this.container.addClass('disabled');
        }
        else
        {
            this.display.removeClass('disabled').attr('tabindex', '0');
            this.container.removeClass('disabled');
        }
    }
    
    // Destructor
    destroy()
    {
        // Remove event listeners
        this.display.off('click');
        $(document).off('click');
        this.options.off('click');
        this.searchBox.off('keyup keydown');
        
        // Remove HTML
        $(this.originalElement).empty();
        
        // Clear references
        this.container = null;
        this.display = null;
        this.dropdown = null;
        this.options = null;
        this.searchBox = null;
        this.hiddenInput = null;
        this.selectedText = null;
    }
};