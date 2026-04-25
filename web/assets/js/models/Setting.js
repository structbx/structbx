export class Setting{
    async readName(){
        return await new wtools.Request("/api/general/instanceName/read").Exec_();
    }
}