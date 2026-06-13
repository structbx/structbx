export class Table{
    async readAll(){
        return await new wtools.Request("/api/tables/read").Exec_();
    }
    async read(identifier){
        return await new wtools.Request(`/api/tables/read/identifier?identifier=${identifier}`).Exec_();
    }
    async add(name, description){
        // Data collection
        const data = new FormData();
        data.append('name', name);
        data.append('description', description);

        return await new wtools.Request("/api/tables/add", "POST", data, false).Exec_();
    }
    async modify(identifier, name, public_form, description){
        const data = new FormData();
        data.append('identifier', identifier);
        data.append('name', name);
        data.append('public_form', public_form);
        data.append('description', description);

        return await new wtools.Request("/api/tables/modify", "PUT", data, false).Exec_();
    }
    async delete(identifier){
        return await new wtools.Request(`/api/tables/delete?identifier=${identifier}`, "DEL").Exec_();
    }
}