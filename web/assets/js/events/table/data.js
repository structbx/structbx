
class Data
{
    


    Export_()
    {
        // Wait animation
        let wait = new wtools.ElementState('#component_data_export .export', false, 'button', new wtools.WaitAnimation().for_button);

        // Get Form identifier
        const table_identifier = getTableIdentifier();
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