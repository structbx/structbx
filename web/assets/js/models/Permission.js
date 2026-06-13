export class Permission{
    async currentUser(){
        return await new wtools.Request("/api/general/permissions/current/read").Exec_();
    }
    async readByGroup(id_group){
        return await new wtools.Request(`/api/general/permissions/read?id_group=${id_group}`).Exec_();
    }
    async readAvailableEndpoints(id_group){
        return await new wtools.Request(`/api/general/permissions/out/read?id_group=${id_group}`).Exec_();
    }
    async add(id_group, endpoint){
        const data = new FormData();
        data.append('id_group', id_group);
        data.append('endpoint', endpoint);

        return await new wtools.Request("/api/general/permissions/add", "POST", data, false).Exec_();
    }
    async delete(endpoint, id_group){
        return await new wtools.Request(`/api/general/permissions/delete?endpoint=${endpoint}&id_group=${id_group}`, "DEL").Exec_();
    }
}
