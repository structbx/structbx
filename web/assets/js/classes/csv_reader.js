class CSVReaderState
{
    constructor()
    {
        this.OK = "OK";
        this.ERROR = "ERROR";
    }
}

class CSVReader
{
    constructor(file_input, separator = ',')
    {
        this.file_input = file_input;
        this.separator = separator;
    }

    Read(callback)
    {
        const file = this.file_input[0].files[0];
    
        if (!file)
        {
            callback(CSVReaderState().ERROR, "Por favor, selecciona un archivo CSV.");
            return;
        }
    
        const separator = this.separator;
        const reader = new FileReader();
        reader.onload = function(event)
        {
            const csv = event.target.result;
            const lines = csv.split('\n');
            let headers;
            if(separator == 'TAB')
                headers = lines[0].split('\t');
            else
                headers = lines[0].split(separator);

            const data = [];
    
            for (let i = 1; i < lines.length; i++)
            {
                let currentLine;
                if(separator == 'TAB')
                    currentLine = lines[i].split('\t')
                else
                    currentLine = lines[i].split(separator)

                if (currentLine.length === headers.length)
                {
                    const obj = {};
                    for (let j = 0; j < headers.length; j++)
                    {
                        obj[headers[j].trim()] = currentLine[j].trim();
                    }
                    data.push(obj);
                }
            }
            callback(new CSVReaderState().OK, data); // Call to the callback function
        };
    
        reader.onerror = function(event)
        {
            callback(CSVReaderState().ERROR, `Error al leer el archivo: ${event.target.error}`);
        };
    
        reader.readAsText(file);
    }
}