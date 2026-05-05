export class ViewFilter{
    async readAll(table_identifier, view_identifier){
        return await new wtools.Request(`/api/tables/filters/read?table-identifier=${table_identifier}&view-identifier=${view_identifier}`).Exec_();
    }
}