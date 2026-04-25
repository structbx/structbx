export class DatabaseUser{
    async current(form = ''){
        return await new wtools.Request(`/api${form}/databases/users/current/read`).Exec_();
    }
}