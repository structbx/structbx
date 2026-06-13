export class Instance{
    async readName(){
        return await new wtools.Request("/api/general/instanceName/read").Exec_();
    }
    async modifyName(name){
        const data = new FormData();
        data.append("name", name);
        return await new wtools.Request("/api/general/instanceName/modify", "PUT", data, false).Exec_();
    }
    async modifyLogo(data){
        return await new wtools.Request("/api/general/instanceLogo/modify", "PUT", data, false).Exec_();
    }
}