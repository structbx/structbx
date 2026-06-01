export class Group{
    async readAll(){
        return await new wtools.Request(`/api/general/groups/read`).Exec_();
    }
    async readByIdentifier(identifier){
        return await new wtools.Request(`/api/general/groups/read/identifier?identifier=${identifier}`).Exec_();
    }
    async add(group){
        const data = new FormData();
        data.append('group', group);

        return await new wtools.Request("/api/general/groups/add", "POST", data, false).Exec_();
    }
    async modify(identifier, group){
        const data = new FormData();
        data.append('identifier', identifier);
        data.append('group', group);

        return await new wtools.Request("/api/general/groups/modify", "PUT", data, false).Exec_();
    }
    async delete(identifier){
        return await new wtools.Request(`/api/general/groups/delete?identifier=${identifier}`, "DEL").Exec_();
    }
}   