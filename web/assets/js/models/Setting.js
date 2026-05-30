export class Setting{
    async readName(){
        return await new wtools.Request("/api/general/instanceName/read").Exec_();
    }
    async modifyInstanceName(name){
        const data = new FormData();
        data.append("name", name);
        return await new wtools.Request("/api/general/instanceName/modify", "PUT", data, false).Exec_();
    }
    async modifyInstanceLogo(data){
        return await new wtools.Request("/api/general/instanceLogo/modify", "PUT", data, false).Exec_();
    }
}