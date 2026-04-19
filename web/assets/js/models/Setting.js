export class Setting{
    async readName(){
        return new wtools.Request("/api/general/instanceName/read").Exec_();
    }
    async readLogo(){
        return new wtools.Request("/api/general/instanceLogo/read").Exec_();
    }
}