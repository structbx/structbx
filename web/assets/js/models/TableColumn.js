export class TableColumn{
    async read(table_identifier, view_identifier){
        return await new wtools.Request(`/api/tables/columns/read?table-identifier=${table_identifier}&view-identifier=${view_identifier}`).Exec_();
    }
}