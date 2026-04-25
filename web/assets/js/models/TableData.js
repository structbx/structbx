export class TableData{
    async readToLinkSelectionOptions(form = '', link_to_table, main_table){
        return await new wtools.Request(`/api${form}/tables/data/read?table-identifier=${link_to_table}&from=link&main-table-identifier=${main_table}`).Exec_();
    }
}