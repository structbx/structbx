
var server_config = new wtools.ServerConfig(
    url_production = new wtools.SeverConfigPair("", "")
    ,url_development = new wtools.SeverConfigPair("", "")
    ,api_url = "/api"
);

var error_codes =
{
    "ERR0UO7DD9YJ6": 
    {
        "es": "No se pudo leer las bases de datos a las que pertenece el usuario.",
        "en": "Could not read the databases the user belongs to."
    }
    ,"ERR9TT3QC0QRG": 
    {
        "es": "No se pudo leer el espacio usado por las bases de datos.",
        "en": "Could not read the space used by the databases."
    }
    ,"ERROWYA84SAXC": 
    {
        "es": "No se pudo la base de datos especificada.",
        "en": "Could not read the specified database."
    }
    ,"ERRZHCFLA0VS6": 
    {
        "es": "Error genérico de una \"acción\".",
        "en": "Generic error of an \"action\"."
    }
    ,"ERR38HJ95K1NA":
    {
        "es": "Error genérico de una \"función\".",
        "en": "Generic error of a \"function\"."
    }
}