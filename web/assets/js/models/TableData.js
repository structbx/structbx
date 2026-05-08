export class TableData{
    async readToLinkSelectionOptions(link_to, form = ''){
        return await new wtools.Request(`/api${form}/tables/data/read?table-identifier=${link_to}&from=link`).Exec_();
    }
    async readAll(table_identifier, view_identifier, path){
        return await new wtools.Request(`/api/tables/data/read?table-identifier=${table_identifier}&view-identifier=${view_identifier}${path}`).Exec_();
    }
    async readByIdentifier(identifier, table_identifier, view_identifier){
        return await new wtools.Request(`/api/tables/data/read?identifier=${identifier}&table-identifier=${table_identifier}&view-identifier=${view_identifier}`).Exec_();
    }
    async changeInt(changeInt, table_identifier){
        return await new wtools.Request(`/api/tables/data/read/changeInt?changeInt=${changeInt}&table-identifier=${table_identifier}`).Exec_();
    }
    async add(data){
        return await new wtools.Request("/api/tables/data/add", "POST", data, false).Exec_();
    }
    async modify(data){
        return await new wtools.Request("/api/tables/data/modify", "PUT", data, false).Exec_();
    }
}