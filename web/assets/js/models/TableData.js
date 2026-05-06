export class TableData{
    async readToLinkSelectionOptions(form = '', link_to_table, main_table){
        return await new wtools.Request(`/api${form}/tables/data/read?table-identifier=${link_to_table}&from=link&main-table-identifier=${main_table}`).Exec_();
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
}