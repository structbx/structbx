export class View{
    async readAll(table_identifier){
        return await new wtools.Request(`/api/tables/views/read?table-identifier=${table_identifier}`).Exec_();
    }
    async readByIdentifier(view_identifier, table_identifier){
        return await new wtools.Request(`/api/tables/views/read/identifier?identifier=${view_identifier}&table-identifier=${table_identifier}`).Exec_();
    }
}