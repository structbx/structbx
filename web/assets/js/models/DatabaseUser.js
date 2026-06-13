export class DatabaseUser{
    async current(form = ''){
        return await new wtools.Request(`/api${form}/databases/users/current/read`).Exec_();
    }

    async read(identifier){
        return await new wtools.Request(`/api/databases/users/read?identifier=${identifier}`).Exec_();
    }

    async readOut(identifier_database){
        return await new wtools.Request(`/api/databases/users/out/read?identifier_database=${identifier_database}`).Exec_();
    }

    async add(id_user, identifier_database){
        const data = new FormData();
        data.append('id_user', id_user);
        data.append('identifier_database', identifier_database);
        return await new wtools.Request('/api/databases/users/add', 'POST', data, false).Exec_();
    }

    async delete(identifier, database_identifier){
        return await new wtools.Request(`/api/databases/users/delete?id=${identifier}&database_identifier=${database_identifier}`, 'DEL').Exec_();
    }
}