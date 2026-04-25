export class Table{
    async read(){
        return await new wtools.Request("/api/tables/read").Exec_();
    }
    async add(name, description){
        // Data collection
        const data = new FormData();
        data.append('name', name);
        data.append('description', description);

        return await new wtools.Request("/api/tables/add", "POST", data, false).Exec_();
    }
}