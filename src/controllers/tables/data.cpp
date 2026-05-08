
#include "controllers/tables/data.h"

using namespace StructBX::Controllers;
using namespace StructBX::Controllers::Tables;

Tables::Data::Data(Tools::FunctionData& function_data) :
    FunctionData(function_data)
    ,struct_read_(function_data)
    ,struct_read_change_int_(function_data)
    ,struct_read_file_(function_data)
    ,struct_add_(function_data)
    ,struct_import_(function_data)
    ,struct_modify_(function_data)
    ,struct_delete_(function_data)
{
    
}

Tables::Data::VerifyPermissionsRead::VerifyPermissionsRead(Tools::FunctionData& function_data) : Tools::FunctionData(function_data)
{

}

void Tables::Data::VerifyPermissionsRead::A1(StructBX::Functions::Action::Ptr action)
{
    action->set_sql_code(
        "SELECT f.identifier " \
        "FROM tables f " \
        "JOIN tables_permissions fp ON fp.id_table = f.identifier " \
        "WHERE f.identifier = ? " \
            "AND fp.read = 1 AND fp.id_user = ?"
    );
    action->SetupCondition_("verify-permissions", Query::ConditionType::kError, [](StructBX::Functions::Action& action)
    {
        if(action.get_results()->size() < 1)
        {
            action.set_custom_error("No posee los permisos");
            return false;
        }

        return true;
    });
    action->AddParameter_("table-identifier", "", true)
    ->SetupCondition_("condition-table-identifier", Query::ConditionType::kError, [](Query::Parameter::Ptr param)
    {
        if(param->get_value()->ToString_() == "")
        {
            param->set_error("El identificador de formulario no puede estar vacío");
            return false;
        }
        return true;
    });

    action->AddParameter_("id_user", get_id_user(), false);
}

Tables::Data::VerifyPermissionsReadFromLink::VerifyPermissionsReadFromLink(Tools::FunctionData& function_data) : Tools::FunctionData(function_data)
{

}

void Tables::Data::VerifyPermissionsReadFromLink::A1(StructBX::Functions::Action::Ptr action)
{
    action->set_sql_code(
        "SELECT f.identifier " \
        "FROM tables f " \
        "JOIN tables_permissions fp ON fp.id_table = f.identifier " \
        "WHERE f.identifier = ? " \
            "AND fp.id_user = ? " \
            "AND (SELECT COUNT(1) FROM tables_columns fc WHERE fc.link_to = f.identifier) > 0"
    );
    action->SetupCondition_("verify-permissions", Query::ConditionType::kError, [](StructBX::Functions::Action& action)
    {
        if(action.get_results()->size() < 1)
        {
            action.set_custom_error("No posee los permisos");
            return false;
        }

        return true;
    });
    action->AddParameter_("table-identifier", "", true)
    ->SetupCondition_("condition-table-identifier", Query::ConditionType::kError, [](Query::Parameter::Ptr param)
    {
        if(param->get_value()->ToString_() == "")
        {
            param->set_error("El identificador de formulario no puede estar vacío");
            return false;
        }
        return true;
    });

    action->AddParameter_("id_user", get_id_user(), false);
}

Tables::Data::VerifyPermissionsAdd::VerifyPermissionsAdd(Tools::FunctionData& function_data) : Tools::FunctionData(function_data)
{
    
}

void Tables::Data::VerifyPermissionsAdd::A1(StructBX::Functions::Action::Ptr action)
{
    action->set_sql_code(
        "SELECT f.identifier " \
        "FROM tables f " \
        "JOIN tables_permissions fp ON fp.id_table = f.identifier " \
        "WHERE f.identifier = ? " \
            "AND fp.add = 1 AND fp.id_user = ?"
    );
    action->SetupCondition_("verify-permissions", Query::ConditionType::kError, [](StructBX::Functions::Action& action)
    {
        if(action.get_results()->size() < 1)
        {
            action.set_custom_error("No posee los permisos");
            return false;
        }

        return true;
    });
    action->AddParameter_("table-identifier", "", true)
    ->SetupCondition_("condition-table-identifier", Query::ConditionType::kError, [](Query::Parameter::Ptr param)
    {
        if(param->get_value()->ToString_() == "")
        {
            param->set_error("El identificador de formulario no puede estar vacío");
            return false;
        }
        return true;
    });

    action->AddParameter_("id_user", get_id_user(), false);
}

Tables::Data::VerifyPermissionsModify::VerifyPermissionsModify(Tools::FunctionData& function_data) : Tools::FunctionData(function_data)
{
    
}

void Tables::Data::VerifyPermissionsModify::A1(StructBX::Functions::Action::Ptr action)
{
    action->set_sql_code(
        "SELECT f.identifier " \
        "FROM tables f " \
        "JOIN tables_permissions fp ON fp.id_table = f.identifier " \
        "WHERE f.identifier = ? " \
            "AND fp.modify = 1 AND fp.id_user = ?"
    );
    action->SetupCondition_("verify-permissions", Query::ConditionType::kError, [](StructBX::Functions::Action& action)
    {
        if(action.get_results()->size() < 1)
        {
            action.set_custom_error("No posee los permisos");
            return false;
        }

        return true;
    });
    action->AddParameter_("table-identifier", "", true)
    ->SetupCondition_("condition-table-identifier", Query::ConditionType::kError, [](Query::Parameter::Ptr param)
    {
        if(param->get_value()->ToString_() == "")
        {
            param->set_error("El identificador de formulario no puede estar vacío");
            return false;
        }
        return true;
    });

    action->AddParameter_("id_user", get_id_user(), false);
}

Tables::Data::VerifyPermissionsDelete::VerifyPermissionsDelete(Tools::FunctionData& function_data) : Tools::FunctionData(function_data)
{
    
}

void Tables::Data::VerifyPermissionsDelete::A1(StructBX::Functions::Action::Ptr action)
{
    action->set_sql_code(
        "SELECT f.identifier " \
        "FROM tables f " \
        "JOIN tables_permissions fp ON fp.id_table = f.identifier " \
        "WHERE f.identifier = ? " \
            "AND fp.delete = 1 AND fp.id_user = ?"
    );
    action->SetupCondition_("verify-permissions", Query::ConditionType::kError, [](StructBX::Functions::Action& action)
    {
        if(action.get_results()->size() < 1)
        {
            action.set_custom_error("No posee los permisos");
            return false;
        }

        return true;
    });
    action->AddParameter_("table-identifier", "", true)
    ->SetupCondition_("condition-table-identifier", Query::ConditionType::kError, [](Query::Parameter::Ptr param)
    {
        if(param->get_value()->ToString_() == "")
        {
            param->set_error("El identificador de formulario no puede estar vacío");
            return false;
        }
        return true;
    });

    action->AddParameter_("id_user", get_id_user(), false);
}

Tables::Data::VerifyPermissionsJustOwner::VerifyPermissionsJustOwner(Tools::FunctionData& function_data) : Tools::FunctionData(function_data)
{
    
}

void Tables::Data::VerifyPermissionsJustOwner::A1(StructBX::Functions::Action::Ptr action)
{
    action->set_sql_code(
        "SELECT fp.just_owner AS just_owner " \
        "FROM tables f " \
        "JOIN tables_permissions fp ON fp.id_table = f.identifier " \
        "WHERE f.identifier = ? " \
            "AND fp.id_user = ?"
    );
    action->AddParameter_("table-identifier", "", true)
    ->SetupCondition_("condition-table-identifier", Query::ConditionType::kError, [](Query::Parameter::Ptr param)
    {
        if(param->get_value()->ToString_() == "")
        {
            param->set_error("El identificador de tabla no puede estar vacío");
            return false;
        }
        return true;
    });

    action->AddParameter_("id_user", get_id_user(), false);
}

std::string Tables::Data::Read::GetFilters::Get(Functions::Function& self, std::string view_identifier)
{
    std::string conditions = "";

    // 1. Declaration
    auto get_filters_action = self.AddAction_("get_view_filters");

    // 2. SQL Setup
    get_filters_action->set_sql_code(
        "SELECT id_column, op, value FROM views_filters "
        "WHERE id_view = ? AND is_active = 1 "
        "ORDER BY position ASC"
    );

    // 3. Parameters
    get_filters_action->AddParameter_("view_identifier", view_identifier, false);

    // 4. Execution
    if (!get_filters_action->Work_())
    {
        Tools::OutputLogger::Error_("Error to get filters");
        return "";
    }

    // 5. Validation
    auto results = get_filters_action->get_results();
    if (results->size() < 1)
    {
        // No filters found - set empty condition
        conditions = "";
        return "";
    }

    // 6. Result Extraction and condition building
    bool first_condition = true;
    conditions = " WHERE ";

    for (const auto& row : *results)
    {
        auto id_column = row->ExtractField_("id_column")->ToString_();
        auto op = row->ExtractField_("op")->ToString_();
        auto value = row->ExtractField_("value")->ToString_();

        // Validate operator to prevent SQL injection
        if (valid_filters_ops.find(op) == valid_filters_ops.end())
            op = "=";

        // Build condition
        if (!first_condition)
            conditions += " AND ";

        // Handle special operators
        if (op == "IS NULL" || op == "IS NOT NULL")
        {
            conditions += id_column + " " + op;
        }
        else if (op == "IN" || op == "NOT IN")
        {
            // Assuming value contains comma-separated list
            conditions += id_column + " " + op + " (" + value + ")";
        }
        else if (op == "LIKE" || op == "NOT LIKE")
        {
            conditions += id_column + " " + op + " '%" + value + "%'";
        }
        else
        {
            // For =, !=, <, >, <=, >=, LIKE, NOT LIKE
            conditions += id_column + " " + op + " '" + value + "'";
        }

        first_condition = false;
    }

    return conditions;
}

std::string Tables::Data::Read::GetSorts::Get(Functions::Function& self, std::string view_identifier)
{
    std::string order_clause = "";

    // 1. Declaration
    auto get_sorts_action = self.AddAction_("get_view_sorts");

    // 2. SQL Setup
    get_sorts_action->set_sql_code(
        "SELECT id_column, sort FROM views_sorts "
        "WHERE id_view = ? AND is_active = 1 "
        "ORDER BY position ASC"
    );

    // 3. Parameters
    get_sorts_action->AddParameter_("view_identifier", view_identifier, false);

    // 4. Execution
    if (!get_sorts_action->Work_())
    {
        Tools::OutputLogger::Error_("Error to get sorts");
        return "";
    }

    // 5. Validation
    auto results = get_sorts_action->get_results();
    if (results->size() < 1)
        return "";

    // 6. Result Extraction and order building
    bool first_sort = true;
    order_clause = " ORDER BY ";

    for (const auto& row : *results)
    {
        auto id_column = row->ExtractField_("id_column")->ToString_();
        auto sort = row->ExtractField_("sort")->ToString_();

        // Validate sort direction to prevent SQL injection
        if (sort != "ASC" && sort != "DESC")
            sort = "ASC";

        // Build order clause
        if (!first_sort)
            order_clause += ", ";

        order_clause += id_column + " " + sort;

        first_sort = false;
    }

    return order_clause;
}

bool Tables::Data::Read::Export::Start(Functions::Function& self, Functions::Action::Ptr table_data)
{
    // Setup file
    auto fm = Files::FileManager();
    fm.set_operation_type(Files::OperationType::kUpload);
    fm.AddSupportedFile_("csv", Files::FileProperties{"text/csv", false, {""}});
    Files::File file_naf("tmp_export", "tmp_export.csv", "", 0);

    // Change filename
    if(!fm.ChangePathAndFilename_(file_naf, "/tmp"))
        return false;

    // File setup
    std::ofstream tmp_file;
    tmp_file.open (file_naf.get_requested_file()->path());

    // Write file
    bool first = true;
    for(auto row : *table_data->get_results())
    {
        // Save columns
        if(first)
        {
            for(auto field : *row)
            {
                tmp_file << field->get_column_name() + "\t";
            }
            tmp_file << "\n";
            first = false;
        }
        else
        {
            // Save data
            for(auto field : *row)
            {
                if(field->IsNull_())
                    tmp_file << "\t";
                else
                    tmp_file << field->ToString_() + "\t";
            }
            tmp_file << "\n";
        }

    }
    tmp_file.close();

    // Send JSON results
    auto fm2 = Files::FileManager(Files::OperationType::kDownload);
    fm2.AddSupportedFile_("csv", Files::FileProperties{"text/csv", false, {""}});
    self.FileResponse_(HTTP::Status::kHTTP_OK, file_naf.get_requested_file()->path(), fm2);

    return true;
}

Tables::Data::Read::Read(Tools::FunctionData& function_data) : Tools::FunctionData(function_data)
{
    // Function GET /api/tables/data/read
    StructBX::Functions::Function::Ptr function = 
        std::make_shared<StructBX::Functions::Function>("/api/tables/data/read", HTTP::EnumMethods::kHTTP_GET);

    function->set_response_type(StructBX::Functions::Function::ResponseType::kCustom);

    // Action: Get table columns info
    auto table_columns = function->AddAction_("table_columns");
    GetTableColumns(table_columns);

    // Action: Link to table info
    auto link_to_action = function->AddAction_("link_to_action");
    LinkToAction(link_to_action);

    // Action: Get default view
    auto default_view = function->AddAction_("default_view");
    GetDefaultView(default_view);

    // Table permissions verifications
    auto fpv = function->AddAction_("fpv");
    VerifyPermissionsRead(function_data).A1(fpv);

    auto fpv2 = function->AddAction_("fpv2");
    VerifyPermissionsReadFromLink(function_data).A1(fpv2);

    auto just_owner = function->AddAction_("just_owner");
    VerifyPermissionsJustOwner(function_data).A1(just_owner);

    // Setup Custom Process
    auto id_database = get_database_id();
    function->SetupCustomProcess_([id_database, default_view, link_to_action, table_columns, fpv, fpv2, just_owner](StructBX::Functions::Function& self)
    {
        // Get table IDENTIFIER
        auto table_identifier = self.GetParameter_("table-identifier");
        if(table_identifier == self.get_parameters().end())
        {
            self.JSONResponse_(HTTP::Status::kHTTP_BAD_REQUEST, "Error x7oJ3q1f1I");
            return;
        }

        // Get View Identifier
        auto view_identifier = self.GetParameter_("view-identifier");
        if(view_identifier == self.get_parameters().end())
        {
            if(!default_view->Work_())
            {
                self.JSONResponse_(HTTP::Status::kHTTP_BAD_REQUEST, "Error i0p2hoyosbsL");
                return;
            }
            auto default_view_identifier = default_view->get_results()->First_();
            if(default_view_identifier->IsNull_())
            {
                self.JSONResponse_(HTTP::Status::kHTTP_BAD_REQUEST, "Error 64vv3gtgM8dI");
                return;
            }
            Query::Parameter::Ptr param(
                new Query::Parameter("view-identifier", Tools::DValue::Ptr(new Tools::DValue(default_view_identifier->ToString_())), false));
            self.get_parameters().push_back(param);
            view_identifier = self.GetParameter_("view-identifier");
            table_identifier = self.GetParameter_("table-identifier");
            table_columns->ReplaceParamater_(param);
        }

        if(!table_columns->Work_())
        {
            self.JSONResponse_(HTTP::Status::kHTTP_BAD_REQUEST, "Error " + table_columns->get_identifier() + ": " + table_columns->get_custom_error());
            return;
        }

        // Get from/link parameter
        auto from = self.GetParameter_("from");
        bool from_link = false;

        // Verify permissions
        if(from != self.get_parameters().end() && from->get()->ToString_() == "link")
        {
            from_link = true;
            if(!fpv2->Work_() && self.get_current_user().get_type() != "system")
            {
                self.JSONResponse_(HTTP::Status::kHTTP_UNAUTHORIZED, "Error " + fpv2->get_identifier() + ": " + fpv2->get_custom_error());
                return;
            }
        }
        else if(!fpv->Work_() && self.get_current_user().get_type() != "system")
        {
            self.JSONResponse_(HTTP::Status::kHTTP_UNAUTHORIZED, "Error " + fpv->get_identifier() + ": " + fpv->get_custom_error());
            return;
        }

        // Get columns
        std::string columns = "";
        std::string joins = "";
        bool has_link = false;
        int count = 0; // Simple counter to know if it's the first column or not for the query
        for(auto it : *table_columns->get_results())
        {
            // If the request is from link, only get the first and second columns
            if(from_link && count > 0)
                break;

            Query::Field::Ptr identifier = it.get()->ExtractField_("identifier");
            Query::Field::Ptr name = it.get()->ExtractField_("name");
            Query::Field::Ptr link_to = it.get()->ExtractField_("link_to");
            Query::Field::Ptr visible = it.get()->ExtractField_("visible");
            if(identifier->IsNull_() || name->IsNull_())
                continue;

            // Hide column just if the request is not from link (link_to column)
            if(visible->Int_() == 0 && !from_link)
                continue;

            std::string column = identifier->ToString_() + " AS '" + name->ToString_() + "'";

            // Get LINK TO column
            if(!link_to->IsNull_())
            {
                has_link = true;

                // Get table link identifier and display_value
                link_to_action->SetValueToParamater_(Tools::DValue::Ptr(new Tools::DValue(link_to->ToString_())), "link_to");
                if(!link_to_action->Work_())
                {
                    self.JSONResponse_(HTTP::Status::kHTTP_INTERNAL_SERVER_ERROR, "Error p2j1bX1t3E");
                    return;
                }
                if(link_to_action->get_results()->size() < 1)
                {
                    self.JSONResponse_(HTTP::Status::kHTTP_INTERNAL_SERVER_ERROR, "Error aKX1v3bT9C");
                    return;
                }
                auto display_value = link_to_action->get_results()->begin()->get()->ExtractField_("identifier");
                if(display_value->IsNull_())
                {
                    self.JSONResponse_(HTTP::Status::kHTTP_INTERNAL_SERVER_ERROR, "Error fAztExxyqM1X");
                    return;
                }
                
                // Setup column link
                column = "_" + link_to->ToString_() + "." + display_value->ToString_() + " AS '" + name->ToString_() + "'" +
                    ", _" + link_to->ToString_() + "._structbx_column_colorHeader AS '_structbx_column_" + identifier->ToString_() + "_colorHeader'";

                // Setup new join
                joins += " LEFT JOIN " + id_database + "." + link_to->ToString_() +
                " AS _" + link_to->ToString_() + " ON _" + link_to->ToString_() + ".identifier = _" + 
                table_identifier->get()->ToString_() + "." + identifier->ToString_();
            }

            columns += ", " + column;

            count++;
        }

        // Verify if columns is empty
        if(columns == "")
        {
            self.JSONResponse_(HTTP::Status::kHTTP_BAD_REQUEST, "No existen columnas en la tabla");
            return;
        }

        // Filters and Sorts
        std::string filters_query = GetFilters().Get(self, view_identifier->get()->ToString_());
        std::string sorts_query = GetSorts().Get(self, view_identifier->get()->ToString_());
        
        // Setup just owner
        if(!just_owner->Work_() && just_owner->get_results()->size() == 0)
        {
            self.JSONResponse_(HTTP::Status::kHTTP_UNAUTHORIZED, "Error " + just_owner->get_identifier() + ": " + fpv->get_custom_error());
            return;
        }
        // Get just_owner value
        int is_just_owner = 0;
        if(just_owner->get_results()->size() > 0)
        {
            auto just_owner_field = just_owner->get_results()->begin()->get()->ExtractField_("just_owner");
            if(!just_owner_field->IsNull_())
            {
                is_just_owner = just_owner_field->Int_();
            }
        }
        if(is_just_owner == 1)
        {
            std::string just_owner_condition = "_" + table_identifier->get()->ToString_() + "._structbx_column_user_owner = " + self.get_current_user().get_id();
            if(filters_query == "")
                filters_query = " WHERE " + just_owner_condition;
            else
                filters_query += " AND " + just_owner_condition;
        }
        // Setup color header
        columns += ",_" + table_identifier->get()->ToString_() + "._structbx_column_colorHeader AS _structbx_column_colorHeader"; 

        // Get page or limit
        auto page = self.GetParameter_("page");
        auto limit = self.GetParameter_("limit");
        int offset = 0;
        std::string limit_query = " LIMIT ";
        if(page != self.get_parameters().end())
        {
            try
            {
                // LIMIT M, N
                offset = (std::stoi(page->get()->ToString_()) - 1) * 20;
                limit_query += std::to_string(offset) + ", 20";
            }
            catch(std::exception&){StructBX::Tools::OutputLogger::Debug_("Error on controllers/tables/data.cpp: Page parameter is not an integer");}
        }
        else if(limit != self.get_parameters().end())
        {
            try
            {
                // LIMIT N
                limit_query += limit->get()->ToString_();
            }
            catch(std::exception&){StructBX::Tools::OutputLogger::Debug_("Error on controllers/tables/data.cpp: Limit parameter error");}
        }
        else
        {
            limit_query = "";
        }

        // Action: Table data
        auto table_data = self.AddAction_("table_data");

        // Set record identifier if specified
        auto record_identifier = self.GetParameter_("identifier");
        if(record_identifier != self.get_parameters().end() && record_identifier->get()->ToString_() != "")
        {
            std::string record_identifier_condition = "_"+ table_identifier->get()->ToString_() + ".identifier = ?";
            if(filters_query == "")
                filters_query = " WHERE " + record_identifier_condition;
            else
                filters_query += " AND " + record_identifier_condition;

            table_data->AddParameter_("identifier", record_identifier->get()->ToString_(), false);
        }

        // Final SQL Code
        std::string sql_code = 
            "SELECT _" + table_identifier->get()->ToString_() + ".identifier " + columns + " " \
            "FROM " + id_database + "." + table_identifier->get()->ToString_() + 
                " AS _" + table_identifier->get()->ToString_()
        ;

        // Prepare JOIN if there is a link
        if(has_link)
            sql_code += joins;

        // Filters and sorts
        sql_code += filters_query;
        sql_code += sorts_query;

        // Export param
        auto export_param = self.GetParameter_("export");

        // Limit
        if(export_param == self.get_parameters().end())
        {
            sql_code += limit_query;
        }

        // Execute
        table_data->set_sql_code(sql_code);
        if(!table_data->Work_())
        {
            self.JSONResponse_(HTTP::Status::kHTTP_INTERNAL_SERVER_ERROR, "Error UgOMMObhM2");
            return;
        }

        // Send results lambda function
        auto send = [table_columns, table_data](StructBX::Functions::Function& self)
        {
            // Results
            auto json_result1 = table_columns->get_json_result();
            auto json_result2 = table_data->get_json_result();
            json_result2->set("status", table_data->get_status());
            json_result2->set("message", table_data->get_message());
            json_result2->set("columns_meta", json_result1);

            // Send JSON results
            self.CompoundResponse_(HTTP::Status::kHTTP_OK, json_result2);
        };

        // Get export
        if(export_param != self.get_parameters().end() && export_param->get()->ToString_() == "true")
        {
            Export _export;
            if(!_export.Start(self, table_data))
                send(self);
        }
        else
        {
            send(self);
        }
    });

    get_functions()->push_back(function);
}

void Tables::Data::Read::GetDefaultView(StructBX::Functions::Action::Ptr action)
{
    action->set_sql_code("SELECT identifier FROM views WHERE id_table = ? LIMIT 1");

    action->AddParameter_("table-identifier", "", true)
    ->SetupCondition_("condition-identifier-table", Query::ConditionType::kError, [](Query::Parameter::Ptr param)
    {
        if(param->get_value()->ToString_() == "")
        {
            param->set_error("El identificador de tabla no puede estar vacío");
            return false;
        }
        return true;
    });
}

void Tables::Data::Read::GetTableColumns(StructBX::Functions::Action::Ptr action)
{
    action->set_sql_code(
        "SELECT " \
            "fc.identifier, fc.name, fc.column_type, fc.required, fc.default_value, fc.description, link_to " \
            ",(SELECT name FROM tables WHERE id = fc.link_to) AS link_to_table_name " \
            ",COALESCE(vc.visible, 1) AS visible " \
            ",COALESCE(vc.position, fc.position) AS final_position " \
        "FROM tables_columns fc " \
        "JOIN tables f ON f.identifier = fc.id_table " \
        "LEFT JOIN views_columns vc ON vc.id_column = fc.identifier AND vc.id_view = ? " \
        "WHERE f.identifier = ? " \
        "ORDER BY COALESCE(vc.position, fc.position) ASC "
    );
    action->set_final(false);
    action->AddParameter_("view-identifier", "", true)
    ->SetupCondition_("condition-view-identifier", Query::ConditionType::kError, [](Query::Parameter::Ptr param)
    {
        if(param->get_value()->ToString_() == "")
        {
            param->set_error("El identificador de vista no puede estar vacío");
            return false;
        }
        return true;
    });
    action->AddParameter_("table-identifier", "", true)
    ->SetupCondition_("condition-table-identifier", Query::ConditionType::kError, [](Query::Parameter::Ptr param)
    {
        if(param->get_value()->ToString_() == "")
        {
            param->set_error("El identificador de formulario no puede estar vacío");
            return false;
        }
        return true;
    });
}

void Tables::Data::Read::LinkToAction(StructBX::Functions::Action::Ptr action)
{
    action->set_sql_code(
        "SELECT "
            "COALESCE(tc.identifier, (SELECT identifier FROM tables_columns WHERE id_table = t.identifier LIMIT 1)) "
            "AS identifier " 
        "FROM tables t "
        "LEFT JOIN tables_columns tc ON tc.identifier = t.id_column_display "
        "WHERE t.identifier = ?"
    );
    action->AddParameter_("link_to", "", false);
}

Tables::Data::ReadChangeInt::ReadChangeInt(Tools::FunctionData& function_data) : Tools::FunctionData(function_data)
{
    // Function GET /api/tables/data/read/changeInt
    StructBX::Functions::Function::Ptr function = 
        std::make_shared<StructBX::Functions::Function>("/api/tables/data/read/changeInt", HTTP::EnumMethods::kHTTP_GET);

    // Action 1: Get Change int
    auto action1 = function->AddAction_("a1");
    A1(action1);

    get_functions()->push_back(function);
}

void Tables::Data::ReadChangeInt::A1(StructBX::Functions::Action::Ptr action)
{
    action->set_sql_code(
        "SELECT id, id_row, operation, id_table "
        "FROM changes "
        "WHERE "
            "id > ? "
            "AND id_table = ?"
    );

    action->AddParameter_("changeInt", "", true)
    ->SetupCondition_("condition-changeInt", Query::ConditionType::kError, [](Query::Parameter::Ptr param)
    {
        if(param->ToString_() == "")
        {
            param->set_error("El entero de cambio no puede estar vacío");
            return false;
        }
        return true;
    });
    action->AddParameter_("table-identifier", "", true)
    ->SetupCondition_("condition-table-identifier", Query::ConditionType::kError, [](Query::Parameter::Ptr param)
    {
        if(param->ToString_() == "")
        {
            param->set_error("El identificador de formulario no puede estar vacío");
            return false;
        }
        return true;
    });
}

Tables::Data::ReadFile::ReadFile(Tools::FunctionData& function_data) : Tools::FunctionData(function_data)
{
    // Function GET /api/tables/data/file/read
    StructBX::Functions::Function::Ptr function = 
        std::make_shared<StructBX::Functions::Function>("/api/tables/data/file/read", HTTP::EnumMethods::kHTTP_GET);

    function->set_response_type(StructBX::Functions::Function::ResponseType::kCustom);

    // Action 1: Get table id
    auto action1 = function->AddAction_("a1");
    A1(action1);

    // Table permissions verifications
    auto fpv = function->AddAction_("fpv");
    VerifyPermissionsRead struct_verify_permissions_read(function_data);
    struct_verify_permissions_read.A1(fpv);

    // Setup Custom Process
    auto id_database = get_database_id();
    function->SetupCustomProcess_([id_database, action1, fpv](StructBX::Functions::Function& self)
    {
        // Execute actions
        if(!action1->Work_())
        {
            self.HTMLResponse_(HTTP::Status::kHTTP_NOT_FOUND, "Archivo no encontrado en la tabla actual");
            return;
        }
        if(!fpv->Work_() && self.get_current_user().get_type() != "system")
        {
            self.JSONResponse_(HTTP::Status::kHTTP_UNAUTHORIZED, "Error " + fpv->get_identifier() + ": " + fpv->get_custom_error());
            return;
        }

        // Get filepath
        auto filepath = self.GetParameter_("filepath");
        if(filepath == self.get_parameters().end())
        {
            self.HTMLResponse_(HTTP::Status::kHTTP_NOT_FOUND, "Archivo no encontrado en la tabla actual");
            return;
        }

        // Get table_identifier
        auto table_identifier = self.GetParameter_("table-identifier");
        if(table_identifier == self.get_parameters().end())
        {
            self.HTMLResponse_(HTTP::Status::kHTTP_NOT_FOUND, "Archivo no encontrado en la tabla actual");
            return;
        }

        // Setup file manager
        self.get_file_manager()->AddBasicSupportedFiles_();
        self.get_file_manager()->set_directory_base(
            StructBX::Tools::SettingsManager::GetSetting_("directory_for_uploaded_files", "/var/www/structbx-web-uploaded") 
            + "/" + std::string(id_database) + "/" + table_identifier->get()->ToString_()
        );

        // Download process
        auto string_path = filepath->get()->ToString_();
        self.DownloadProcess_(string_path);
    });

    get_functions()->push_back(function);
}

void Tables::Data::ReadFile::A1(StructBX::Functions::Action::Ptr action)
{
    action->set_sql_code(
        "SELECT f.identifier " \
        "FROM tables f " \
        "WHERE f.identifier = ? AND f.id_database = (SELECT id FROM `databases` WHERE identifier = ?)"
    );
    action->set_final(false);
    action->AddParameter_("table-identifier", "", true)
    ->SetupCondition_("condition-table-identifier", Query::ConditionType::kError, [](Query::Parameter::Ptr param)
    {
        if(param->get_value()->ToString_() == "")
        {
            param->set_error("El identificador de formulario no puede estar vacío");
            return false;
        }
        return true;
    });

    action->AddParameter_("id_database", get_database_id(), false);
}

Tables::Data::Add::Add(Tools::FunctionData& function_data) : Tools::FunctionData(function_data)
{
    // Function GET /api/tables/data/add
    StructBX::Functions::Function::Ptr function = 
        std::make_shared<StructBX::Functions::Function>("/api/tables/data/add", HTTP::EnumMethods::kHTTP_POST);

    function->set_response_type(StructBX::Functions::Function::ResponseType::kCustom);

    // Action: Get Table info
    auto table_info = function->AddAction_("table_info");
    GetTableInfo(table_info);

    // Action: Get table columns
    auto table_columns = function->AddAction_("table_columns");
    GetTableColumnsInfo(table_columns);

    // Action: Save new record
    auto save_record = function->AddAction_("save_record");

    // Table permissions verifications
    auto fpv = function->AddAction_("fpv");
    VerifyPermissionsAdd(function_data).A1(fpv);

    // Setup Custom Process
    auto id_database = get_database_id();
    function->SetupCustomProcess_([id_database, table_info, table_columns, save_record, fpv](StructBX::Functions::Function& self)
    {
        // Execute actions
        if(!table_info->Work_())
        {
            self.JSONResponse_(HTTP::Status::kHTTP_BAD_REQUEST, "Error " + table_info->get_identifier() + ": nrjlOllSqm");
            return;
        }
        if(!table_columns->Work_())
        {
            self.JSONResponse_(HTTP::Status::kHTTP_BAD_REQUEST, "Error " + table_columns->get_identifier() + ": 9e8LhYKOdu");
            return;
        }
        if(!fpv->Work_() && self.get_current_user().get_type() != "system")
        {
            self.JSONResponse_(HTTP::Status::kHTTP_UNAUTHORIZED, "Error " + fpv->get_identifier() + ": " + fpv->get_custom_error());
            return;
        }

        // Get table IDENTIFIER
        auto table_identifier = self.GetParameter_("table-identifier");
        if(table_identifier == self.get_parameters().end())
        {
            self.JSONResponse_(HTTP::Status::kHTTP_BAD_REQUEST, "Error qZESgpGtiSrW");
            return;
        }

        // Configure parameters
        std::string columns = "";
        std::string values = "";
        ParameterConfiguration pc(ParameterConfiguration::Type::kAdd, columns, values, id_database);
        pc.Setup(self, table_columns->get_results(), table_identifier->get()->ToString_(), save_record);

        // Verify that columns is not empty
        if(columns == "")
        {
            self.JSONResponse_(HTTP::Status::kHTTP_BAD_REQUEST, "Debes crear columnas para poder guardar informaci&oacute;n");
            return;
        }

        // Set record identifier
        auto identifier = Tools::RandomGenerator().GenerateAlphanumericID_(20);
        save_record->AddParameter_("identifier", identifier, false);

        // Get color header parameter
        auto color_header_param = self.GetParameter_("_structbx_column_colorHeader");
        std::string color_header = "";
        if(color_header_param != self.get_parameters().end())
        {
            color_header = color_header_param->get()->ToString_();
        }
        save_record->AddParameter_("user_id", self.get_current_user().get_id(), false);
        save_record->AddParameter_("color_header", color_header, false);

        // Set SQL Code to action 3
        save_record->set_sql_code(
            "INSERT INTO " + id_database + "." + table_identifier->get()->ToString_() + " " \
            "(" + columns + ", identifier, _structbx_column_user_owner, _structbx_column_colorHeader) " \
            " VALUES (" + values + ", ?, ?, ?) "
        );

        // Execute action 3
        self.IdentifyParameters_(save_record);
        if(!save_record->Work_())
        {
            self.JSONResponse_(HTTP::Status::kHTTP_INTERNAL_SERVER_ERROR, "Error fECruxvqCZ: No se pudo guardar el registro. " + save_record->get_custom_error());
            return;
        }

        // ChangeInt
        auto changeInt = ChangeInt();
        changeInt.Change(identifier, "insert",table_identifier->get()->ToString_());

        // Send results
        self.JSONResponse_(HTTP::Status::kHTTP_OK, identifier);
    });

    get_functions()->push_back(function);
}

void Tables::Data::Add::GetTableInfo(StructBX::Functions::Action::Ptr action)
{
    action->set_sql_code("SELECT * FROM tables WHERE identifier = ?");
    action->set_final(false);
    action->SetupCondition_("verify-table-existence", Query::ConditionType::kError, [](StructBX::Functions::Action& self)
    {
        if(self.get_results()->size() != 1)
        {
            self.set_custom_error("La tabla solicitada no existe");
            return false;
        }

        return true;
    });

    action->AddParameter_("table-identifier", "", true)
    ->SetupCondition_("condition-identifier-table", Query::ConditionType::kError, [](Query::Parameter::Ptr param)
    {
        if(param->get_value()->ToString_() == "")
        {
            param->set_error("El identificador de tabla no puede estar vacío");
            return false;
        }
        return true;
    });
}

void Tables::Data::Add::GetTableColumnsInfo(StructBX::Functions::Action::Ptr action)
{
    action->set_sql_code(
        "SELECT fc.* " \
        "FROM tables_columns fc " \
        "JOIN tables f ON f.identifier = fc.id_table " \
        "WHERE f.identifier = ? "
    );
    action->set_final(false);
    action->AddParameter_("table-identifier", "", true)
    ->SetupCondition_("condition-table-identifier", Query::ConditionType::kError, [](Query::Parameter::Ptr param)
    {
        if(param->get_value()->ToString_() == "")
        {
            param->set_error("El identificador de formulario no puede estar vacío");
            return false;
        }
        return true;
    });
}

Tables::Data::Import::Import(Tools::FunctionData& function_data) : Tools::FunctionData(function_data)
{
    // Function GET /api/tables/data/add
    StructBX::Functions::Function::Ptr function = 
        std::make_shared<StructBX::Functions::Function>("/api/tables/data/import", HTTP::EnumMethods::kHTTP_POST);

    function->set_response_type(StructBX::Functions::Function::ResponseType::kCustom);

    // Action 1: Verify table existence
    auto action1 = function->AddAction_("a1");
    A1(action1);

    // Action 2: Get table columns
    auto action2 = function->AddAction_("a2");
    A2(action2);

    // Table permissions verifications
    auto fpv = function->AddAction_("fpv");
    VerifyPermissionsAdd(function_data).A1(fpv);

    // Setup Custom Process
    auto id_database = get_database_id();
    function->SetupCustomProcess_([id_database, action1, action2, fpv](StructBX::Functions::Function& self)
    {
        // Execute actions
        if(!action1->Work_())
        {
            self.JSONResponse_(HTTP::Status::kHTTP_BAD_REQUEST, "Error " + action1->get_identifier() + ": UMKBSk3ntgzw");
            return;
        }
        if(!action2->Work_())
        {
            self.JSONResponse_(HTTP::Status::kHTTP_BAD_REQUEST, "Error " + action2->get_identifier() + ": 05U44IYhi8D8");
            return;
        }
        if(!fpv->Work_() && self.get_current_user().get_type() != "system")
        {
            self.JSONResponse_(HTTP::Status::kHTTP_UNAUTHORIZED, "Error " + fpv->get_identifier() + ": " + fpv->get_custom_error());
            return;
        }

        // Get table IDENTIFIER
        auto table_identifier = self.GetParameter_("table-identifier");
        if(table_identifier == self.get_parameters().end())
        {
            self.JSONResponse_(HTTP::Status::kHTTP_BAD_REQUEST, "Error hyW0LbxgV2oO");
            return;
        }

        // Identify JSON Parameters
        int saved = 0;
        auto error_lines = JSON::Array::Ptr(new JSON::Array());
        for (std::size_t a = 0; a < self.get_data()->size(); a++)
        {
            // Action 3: Save new record
            auto action3 = std::make_shared<Functions::Action>("a3");
            
            // Configure parameters
            std::string columns = "";
            std::string values = "";
            ParameterConfiguration pc(ParameterConfiguration::Type::kAdd, columns, values, id_database);

            // Setup parameters
            pc.Setup(self, action2->get_results(), table_identifier->get()->ToString_(), action3);

            // Verify that columns is not empty
            if(columns == "")
            {
                error_lines->set(error_lines->size(), a + 2);
                continue;
            }

            // Set SQL Code to action 3
            action3->set_sql_code(
                "INSERT INTO " + id_database + "." + table_identifier->get()->ToString_() + " " \
                "(" + columns + ") VALUES (" + values + ") ");

            // Get Parameter object
            auto parameter_object = self.get_data()->getObject(a);
            if(parameter_object == nullptr)
            {
                error_lines->set(error_lines->size(), a + 2);
                continue;
            }
            auto names = parameter_object->getNames();
            if(names.size() == 0)
            {
                error_lines->set(error_lines->size(), a + 2);
                continue;
            }
            // Store row parameters
            std::vector<Query::Parameter::Ptr> row_parameters;
            for (std::size_t b = 0; b < names.size(); b++)
            {
                // Get name and value
                auto name = names.at(b);
                if(parameter_object->get(name).isEmpty())
                {
                    Tools::OutputLogger::Debug_("Parameter JSON object value is null, skipping.");
                    continue;
                }
                auto value = parameter_object->get(name);
                // Add parameter
                auto new_parameter = std::make_shared<Query::Parameter>(name, Tools::DValue::Ptr(new Tools::DValue(value)), true);
                row_parameters.push_back(new_parameter);
            }
            // Execute action 3
            self.IdentifyParameters_(action3, row_parameters);
            if(!action3->Work_())
            {
                error_lines->set(error_lines->size(), a + 2);
                continue;
            }
            saved++;
        }

        // ChangeInt
        auto changeInt = ChangeInt();
        changeInt.Change("1", "import", table_identifier->get()->ToString_());

        // Send results
        auto json_result = JSON::Object::Ptr(new JSON::Object());
        json_result->set("status", "OK.");
        json_result->set("message", "OK.");
        json_result->set("saved", saved);
        json_result->set("errors", error_lines->size());
        json_result->set("error_lines", error_lines);
        
        self.CompoundResponse_(HTTP::Status::kHTTP_OK, json_result);
    });

    get_functions()->push_back(function);
}

void Tables::Data::Import::A1(StructBX::Functions::Action::Ptr action)
{
    action->set_sql_code("SELECT id FROM tables WHERE identifier = ? AND id_database = (SELECT id FROM `databases` WHERE identifier = ?)");
    action->set_final(false);
    action->SetupCondition_("verify-table-existence", Query::ConditionType::kError, [](StructBX::Functions::Action& self)
    {
        if(self.get_results()->size() != 1)
        {
            self.set_custom_error("La tabla solicitado no existe");
            return false;
        }

        return true;
    });

    action->AddParameter_("table-identifier", "", true)
    ->SetupCondition_("condition-identifier-table", Query::ConditionType::kError, [](Query::Parameter::Ptr param)
    {
        if(param->get_value()->ToString_() == "")
        {
            param->set_error("El identificador de formulario no puede estar vacío");
            return false;
        }
        return true;
    });
    action->AddParameter_("id_database", get_database_id(), false);

}

void Tables::Data::Import::A2(StructBX::Functions::Action::Ptr action)
{
    action->set_sql_code(
        "SELECT fc.*, fct.identifier AS column_type " \
        "FROM tables_columns fc " \
        "JOIN tables_columns_types fct ON fct.identifier = fc.id_column_type " \
        "JOIN tables f ON f.identifier = fc.id_table " \
        "WHERE f.identifier = ? AND f.id_database = (SELECT id FROM `databases` WHERE identifier = ?) "
    );
    action->set_final(false);
    action->AddParameter_("table-identifier", "", true)
    ->SetupCondition_("condition-table-identifier", Query::ConditionType::kError, [](Query::Parameter::Ptr param)
    {
        if(param->get_value()->ToString_() == "")
        {
            param->set_error("El identificador de la tabla no puede estar vacío");
            return false;
        }
        return true;
    });

    action->AddParameter_("id_database", get_database_id(), false);
}

Tables::Data::Modify::Modify(Tools::FunctionData& function_data) : Tools::FunctionData(function_data)
{
    // Function GET /api/tables/data/modify
    StructBX::Functions::Function::Ptr function = 
        std::make_shared<StructBX::Functions::Function>("/api/tables/data/modify", HTTP::EnumMethods::kHTTP_PUT);

    function->set_response_type(StructBX::Functions::Function::ResponseType::kCustom);

    // Action: Get table columns
    auto table_columns = function->AddAction_("table_columns");
    GetTableColumns(table_columns);

    // Action: Update record
    auto modify_record = function->AddAction_("modify_record");

    // Table permissions verifications
    auto fpv = function->AddAction_("fpv");
    VerifyPermissionsModify(function_data).A1(fpv);

    auto just_owner = function->AddAction_("just_owner");
    VerifyPermissionsJustOwner(function_data).A1(just_owner);

    // Setup Custom Process
    auto id_database = get_database_id();
    function->SetupCustomProcess_([id_database, table_columns, modify_record, fpv, just_owner](StructBX::Functions::Function& self)
    {
        // Execute actions
        if(!table_columns->Work_())
        {
            self.JSONResponse_(HTTP::Status::kHTTP_BAD_REQUEST, "Error " + table_columns->get_identifier() + ": Fr5MHxX1wQ");
            return;
        }
        if(!fpv->Work_() && self.get_current_user().get_type() != "system")
        {
            self.JSONResponse_(HTTP::Status::kHTTP_UNAUTHORIZED, "Error " + fpv->get_identifier() + ": " + fpv->get_custom_error());
            return;
        }

        // Get table and column identifier
        auto table_identifier = self.GetParameter_("table-identifier");
        auto column_identifier = self.GetParameter_("identifier");
        if(table_identifier == self.get_parameters().end() || column_identifier == self.get_parameters().end())
        {
            self.JSONResponse_(HTTP::Status::kHTTP_BAD_REQUEST, "Error 6KTJ9kfXrGAH");
            return;
        }

        // Configure parameters
        std::string columns = "";
        std::string values = "";
        ParameterConfiguration pc(ParameterConfiguration::Type::kModify, columns, values, id_database);
        pc.Setup(self, table_columns->get_results(), table_identifier->get()->ToString_(), modify_record);

        // Verify that columns is not empty
        if(columns == "")
        {
            self.JSONResponse_(HTTP::Status::kHTTP_BAD_REQUEST, "Debes crear columnas para poder guardar informaci&oacute;n");
            return;
        }

        // Get color header parameter
        auto color_header_param = self.GetParameter_("_structbx_column_colorHeader");
        std::string color_header = "";
        if(color_header_param != self.get_parameters().end())
        {
            color_header = color_header_param->get()->ToString_();
        }
        modify_record->AddParameter_("color_header", color_header, false);

        // Action3: Add id parameter
        modify_record->AddParameter_("identifier", "", true)
        ->SetupCondition_("condition-identifier", Query::ConditionType::kError, [](Query::Parameter::Ptr param)
        {
            if(param->get_value()->ToString_() == "")
            {
                param->set_error("El identificador no puede estar vacío");
            }

            return true;
        });

        // Final SQL Code
        modify_record->set_sql_code(
            "UPDATE " + id_database + "." + table_identifier->get()->ToString_() + " " \
            "SET " + columns + ", _structbx_column_colorHeader = ? WHERE identifier = ?");

        // Setup just owner
        if(!just_owner->Work_() && just_owner->get_results()->size() == 0)
        {
            self.JSONResponse_(HTTP::Status::kHTTP_UNAUTHORIZED, "Error " + just_owner->get_identifier() + ": " + fpv->get_custom_error());
            return;
        }
        // Get just_owner value
        int is_just_owner = 0;
        if(just_owner->get_results()->size() > 0)
        {
            auto just_owner_field = just_owner->get_results()->begin()->get()->ExtractField_("just_owner");
            if(!just_owner_field->IsNull_())
            {
                is_just_owner = just_owner_field->Int_();
            }
        }
        if(is_just_owner == 1)
        {
            std::string just_owner_condition = "_structbx_column_user_owner = " + self.get_current_user().get_id();
            modify_record->set_sql_code(modify_record->get_sql_code() + " AND " + just_owner_condition);
        }

        // Execute action 3
        self.IdentifyParameters_(modify_record);
        if(!modify_record->Work_())
        {
            self.JSONResponse_(HTTP::Status::kHTTP_INTERNAL_SERVER_ERROR, "Error UyUKjUef7b: No se pudo guardar el registro.");
            return;
        }

        // ChangeInt
        auto changeInt = ChangeInt();
        changeInt.Change(column_identifier->get()->ToString_(), "update", table_identifier->get()->ToString_());

        // Send results
        self.JSONResponse_(HTTP::Status::kHTTP_OK, "Ok.");
    });

    get_functions()->push_back(function);
}

void Tables::Data::Modify::GetTableColumns(StructBX::Functions::Action::Ptr action)
{
    action->set_sql_code(
        "SELECT fc.* " \
        "FROM tables_columns fc " \
        "JOIN tables f ON f.identifier = fc.id_table " \
        "WHERE f.identifier = ? "
    );
    action->set_final(false);
    action->AddParameter_("table-identifier", "", true)
    ->SetupCondition_("condition-table-identifier", Query::ConditionType::kError, [](Query::Parameter::Ptr param)
    {
        if(param->get_value()->ToString_() == "")
        {
            param->set_error("El identificador de tabla no puede estar vacío");
            return false;
        }
        return true;
    });
}

Tables::Data::Delete::Delete(Tools::FunctionData& function_data) : Tools::FunctionData(function_data)
{
    // Function GET /api/tables/data/delete
    StructBX::Functions::Function::Ptr function = 
        std::make_shared<StructBX::Functions::Function>("/api/tables/data/delete", HTTP::EnumMethods::kHTTP_DEL);

    function->set_response_type(StructBX::Functions::Function::ResponseType::kCustom);

    // Action 1: Verify table existence
    auto action1 = function->AddAction_("a1");
    A1(action1);

    // Action 2_0: Get table columns
    auto action2_0 = function->AddAction_("a2_0");
    A2(action2_0);

    // Action 2: Delete record from table
    auto action2 = function->AddAction_("a2");
    A3(action2);

    // Table permissions verifications
    auto fpv = function->AddAction_("fpv");
    VerifyPermissionsDelete(function_data).A1(fpv);

    // Setup Custom Process
    auto id_database = get_database_id();
    function->SetupCustomProcess_([id_database, action1, action2_0, action2, fpv](StructBX::Functions::Function& self)
    {
        // Execute actions
        if(!action1->Work_())
        {
            self.JSONResponse_(HTTP::Status::kHTTP_BAD_REQUEST, "Error " + action1->get_identifier() + ": twQ1cxcgZs");
            return;
        }
        if(!action2_0->Work_())
        {
            self.JSONResponse_(HTTP::Status::kHTTP_BAD_REQUEST, "Error " + action2_0->get_identifier() + ": PYaZ1nddvm");
            return;
        }
        if(!fpv->Work_() && self.get_current_user().get_type() != "system")
        {
            self.JSONResponse_(HTTP::Status::kHTTP_UNAUTHORIZED, "Error " + fpv->get_identifier() + ": " + fpv->get_custom_error());
            return;
        }

        // Get table IDENTIFIER
        auto table_identifier = self.GetParameter_("table-identifier");
        if(table_identifier == self.get_parameters().end())
        {
            self.JSONResponse_(HTTP::Status::kHTTP_BAD_REQUEST, "Error KOd3Qv3vHtqc");
            return;
        }

        // Get Column ID
        auto column_id = action1->get_results()->front()->ExtractField_("column_id");
        if(column_id->IsNull_())
        {
            self.JSONResponse_(HTTP::Status::kHTTP_BAD_REQUEST, "Error LbunnRyAm2");
            return;
        }

        // Delete record files
        for(auto it : *action2_0->get_results())
        {
            // Get column
            auto id = it.get()->ExtractField_("id");
            auto identifier = it.get()->ExtractField_("identifier");
            auto column_type = it.get()->ExtractField_("column_type");

            // Verify identifier is not null
            if(identifier->IsNull_())
                continue;

            // Verify if is image or file
            if(column_type->IsNull_())
                continue;
            bool r = false;
            if(column_type->ToString_() == "image" || column_type->ToString_() == "file")
                r = true;
            if(!r)
                continue;

            // Get file manager
            auto file_manager = self.get_file_manager();
            file_manager->set_directory_base(
                StructBX::Tools::SettingsManager::GetSetting_("directory_for_uploaded_files", "/var/www/structbx-web-uploaded") + "/" + std::string(id_database) + "/" + table_identifier->get()->ToString_()
            );

            // Request filepath
            auto action2_2 = self.AddAction_("a2_2");
            action2_2->set_sql_code(
                "SELECT _structbx_column_" + id->ToString_() + " "
                "FROM " + id_database + "." + table_identifier->get()->ToString_() + " " \
                "WHERE _structbx_column_" + column_id->ToString_() + " = ?"
            );
            action2_2->AddParameter_("id", "", true)
            ->SetupCondition_("condition-id", Query::ConditionType::kError, [](Query::Parameter::Ptr param)
            {
                if(param->get_value()->ToString_() == "")
                {
                    param->set_error("El id no puede estar vacío");
                }

                return true;
            });
            self.IdentifyParameters_(action2_2);
            if(!action2_2->Work_())
            {
                self.JSONResponse_(HTTP::Status::kHTTP_BAD_REQUEST, "Error " + action2_2->get_identifier() + ": PIvGrSKDYx");
                return;
            }
            auto filepath = action2_2->get_results()->First_();

            // Process file
            FileProcessing fp;
            fp.file_manager = file_manager;
            if(!filepath->IsNull_() && filepath->ToString_() != "")
            {
                fp.filepath = filepath->ToString_();
                fp.Delete();
            }
        }

        // Action 2: Delete record from table
        action2->set_sql_code(
            "DELETE FROM " + id_database + "." + table_identifier->get()->ToString_() + 
            " WHERE _structbx_column_" + column_id->ToString_() + " = ?"
        );

        // Execute action 2
        self.IdentifyParameters_(action2);
        if(!action2->Work_())
        {
            self.JSONResponse_(HTTP::Status::kHTTP_INTERNAL_SERVER_ERROR, "Error VF1ACrujc7");
            return;
        }

        // ChangeInt
        auto id = action2->GetParameter_("id");
        auto changeInt = ChangeInt();
        changeInt.Change(id->get()->ToString_(), "delete", table_identifier->get()->ToString_());

        // Send results
        self.JSONResponse_(HTTP::Status::kHTTP_OK, "Ok.");
    });

    get_functions()->push_back(function);
}

void Tables::Data::Delete::A1(StructBX::Functions::Action::Ptr action)
{
    action->set_sql_code(
        "SELECT f.identifier, fc.identifier AS column_id " \
        "FROM tables f " \
        "JOIN tables_columns fc ON fc.id_table = f.identifier " \
        "WHERE f.identifier = ? AND id_database = (SELECT id FROM `databases` WHERE identifier = ?) AND fc.identifier = 'id'"
    );
    action->set_final(false);
    action->SetupCondition_("verify-table-existence", Query::ConditionType::kError, [](StructBX::Functions::Action& self)
    {
        if(self.get_results()->size() != 1)
        {
            self.set_custom_error("La tabla solicitada no existe");
            return false;
        }

        return true;
    });

    action->AddParameter_("table-identifier", "", true)
    ->SetupCondition_("condition-identifier-table", Query::ConditionType::kError, [](Query::Parameter::Ptr param)
    {
        if(param->get_value()->ToString_() == "")
        {
            param->set_error("El identificador de tabla no puede estar vacío");
            return false;
        }
        return true;
    });

    action->AddParameter_("id_database", get_database_id(), false);
}

void Tables::Data::Delete::A2(StructBX::Functions::Action::Ptr action)
{
    action->set_sql_code(
        "SELECT fc.*, fct.identifier AS column_type " \
        "FROM tables_columns fc " \
        "JOIN tables_columns_types fct ON fct.identifier = fc.id_column_type " \
        "JOIN tables f ON f.identifier = fc.id_table " \
        "WHERE f.identifier = ? AND f.id_database = (SELECT id FROM `databases` WHERE identifier = ?) "
    );
    action->set_final(false);
    action->AddParameter_("table-identifier", "", true)
    ->SetupCondition_("condition-table-identifier", Query::ConditionType::kError, [](Query::Parameter::Ptr param)
    {
        if(param->get_value()->ToString_() == "")
        {
            param->set_error("El identificador de tabla no puede estar vacío");
            return false;
        }
        return true;
    });

    action->AddParameter_("id_database", get_database_id(), false);
}

void Tables::Data::Delete::A3(StructBX::Functions::Action::Ptr action)
{
    action->AddParameter_("id", "", true)
    ->SetupCondition_("condition-id", Query::ConditionType::kError, [](Query::Parameter::Ptr param)
    {
        if(param->get_value()->ToString_() == "")
        {
            param->set_error("El id de registro no puede estar vacío");
            return false;
        }
        return true;
    });
}

bool Tables::Data::ParameterVerification::Verify(Query::Parameter::Ptr param)
{
    if(param->get_value()->TypeIsIqual_(StructBX::Tools::DValue::Type::kEmpty))
    {
        // If value is empty
        if(required->Int_() == 1)
        {
            // If value is required
            if(default_value->ToString_() == "")
            {
                // default value is empty
                param->set_error("El parámetro " + param->get_name() + " es obligatorio");
                return false;
            }
            else
                param->set_value(StructBX::Tools::DValue::Ptr(new StructBX::Tools::DValue(default_value->ToString_())));
        }
        else
        {
            // value is not required
            if(default_value->ToString_() == "")
                return true;
            else
                param->set_value(StructBX::Tools::DValue::Ptr(new StructBX::Tools::DValue(default_value->ToString_())));
        }
    }
    else if (param->get_value()->TypeIsIqual_(StructBX::Tools::DValue::Type::kString))
    {
        // value is a string
        if(param->get_value()->ToString_() == "")
        {
            // if value is empty
            if(default_value->ToString_() == "")
            {
                // if default value is empty
                if(required->Int_() == 1)
                {
                    // if value is required
                param->set_error("El parámetro " + param->get_name() + " es obligatorio");
                    return false;
                }
                else
                    param->set_value(StructBX::Tools::DValue::Ptr(new StructBX::Tools::DValue()));
            }
            else
                param->set_value(StructBX::Tools::DValue::Ptr(new StructBX::Tools::DValue(default_value->ToString_())));
        }
    }

    return true;
}

void Tables::Data::ParameterConfiguration::Setup(StructBX::Functions::Function& self, StructBX::Query::Results::Ptr results, std::string table_id, StructBX::Functions::Action::Ptr action3)
{
    // Setp 1: Iterate over columns
    for(auto it : *results)
    {
        // Get column
        auto identifier = it.get()->ExtractField_("identifier");
        auto column_type = it.get()->ExtractField_("column_type");
        auto name = it.get()->ExtractField_("name");
        auto required = it.get()->ExtractField_("required");
        auto default_value = it.get()->ExtractField_("default_value");

        // Verify identifier is not null
        if(identifier->IsNull_())
            continue;

        // Step 2: Search column type image or file
        if(column_type->ToString_() == "image" || column_type->ToString_() == "file")
        {
            // Get file manager
            auto file_manager = self.get_file_manager();
            auto new_file_manager = std::make_shared<StructBX::Files::FileManager>();
            file_manager->set_directory_base(
                StructBX::Tools::SettingsManager::GetSetting_("directory_for_uploaded_files", "/var/www/structbx-web-uploaded") + "/" + std::string(id_database) + "/" + table_id
            );
            new_file_manager->set_directory_base(file_manager->get_directory_base());

            // Setup current file to new file manager
            auto found = std::find_if(file_manager->get_files().begin(), file_manager->get_files().end(), [identifier](StructBX::Files::File& file)
            {
                return file.get_name() == identifier->ToString_();
            });

            // Step 4: If there is not file, do not touch the column (or filename is empty)
            if(found == file_manager->get_files().end() || found->get_filename() == "")
                continue;
            new_file_manager->get_files().push_back(*found);

            // Process file
            FileProcessing fp;
            fp.file_manager = new_file_manager;

            // Setup columns and values string
            std::string filepath_string = "";
            if(type == Type::kAdd)
            {
                // Setup columns and values string
                if(columns == "")
                {
                    columns = identifier->ToString_();
                    values = "?";
                }
                else
                {
                    columns += "," + identifier->ToString_();
                    values += ", ?";
                }
            }
            else if(type == Type::kModify)
            {
                if(columns == "")
                {
                    columns = "" + identifier->ToString_() + " = ?";
                }
                else
                {
                    columns += "," + identifier->ToString_() + " = ?";
                }

                // Step 5: Verify old file saved
                auto action2_1 = StructBX::Functions::Action::Ptr(new StructBX::Functions::Action("a2_1"));
                action2_1->set_sql_code(
                    "SELECT " + identifier->ToString_() + " "
                    "FROM " + id_database + "." + table_id + " " \
                    "WHERE identifier = ?"
                );
                action2_1->AddParameter_("identifier", "", true)
                ->SetupCondition_("condition-identifier", Query::ConditionType::kError, [](Query::Parameter::Ptr param)
                {
                    if(param->get_value()->ToString_() == "")
                    {
                        param->set_error("El identificador no puede estar vacío");
                    }

                    return true;
                });
                self.IdentifyParameters_(action2_1);
                if(!action2_1->Work_())
                {
                    self.JSONResponse_(HTTP::Status::kHTTP_BAD_REQUEST, "Error " + action2_1->get_identifier() + ": yKqkgKKfdg");
                    return;
                }
                auto filepath = action2_1->get_results()->First_();
                if(!filepath->IsNull_())
                {
                    if(found == file_manager->get_files().end())
                        continue;
                    else
                        filepath_string = filepath->ToString_();
                }
                
                // Save filepath found
                fp.filepath = filepath_string;

                // Step 6: if there is old file, delete it
                if(fp.filepath != "")
                {
                    if(!fp.Delete())
                    {
                        self.JSONResponse_(HTTP::Status::kHTTP_BAD_REQUEST, "Error en par&aacute;metro (" + identifier->ToString_() + "): " + fp.error);
                        return;
                    }
                }
            }

            // Step 7: Save the new file
            if(!fp.Save())
            {
                self.JSONResponse_(HTTP::Status::kHTTP_BAD_REQUEST, "Error en par&aacute;metro (" + identifier->ToString_() + "): " + fp.error);
                return;
            }

            // Setup static parameter
            action3->AddParameter_(identifier->ToString_(), fp.filepath, false)
            ->SetupCondition_(identifier->ToString_(), Query::ConditionType::kError, [required, default_value, column_type](Query::Parameter::Ptr param)
            {
                ParameterVerification pv(required, default_value, column_type);
                return pv.Verify(param);
            });
        }
        else
        {
            // The type is not image or file
            if(type == Type::kAdd)
            {
                // Setup columns and values string
                if(columns == "")
                {
                    columns = identifier->ToString_();
                    values = "?";
                }
                else
                {
                    columns += "," + identifier->ToString_();
                    values += ", ?";
                }
            }
            else if(type == Type::kModify)
            {
                // Setup columns and values string
                if(columns == "")
                {
                    columns = "" + identifier->ToString_() + " = ?";
                }
                else
                {
                    columns += "," + identifier->ToString_() + " = ?";
                }
            }
            
            // Setup parameter
            action3->AddParameter_(identifier->ToString_(), StructBX::Tools::DValue::Ptr(new StructBX::Tools::DValue()), true)
            ->SetupCondition_(identifier->ToString_(), Query::ConditionType::kError, [required, default_value, column_type](Query::Parameter::Ptr param)
            {
                ParameterVerification pv(required, default_value, column_type);
                return pv.Verify(param);
            });
        }
    }
}

bool Tables::Data::FileProcessing::Save()
{
    filepath = "";

    // Setup file manager
    file_manager->AddBasicSupportedFiles_();

    // Upload new file
    file_manager->set_operation_type(Files::OperationType::kUpload);
    auto& front_file = file_manager->get_files().front();
    
    if(!file_manager->ChangePathAndFilename_(front_file, file_manager->get_directory_base()))
    {
        error = "Error al subir el archivo.";
        return false;
    }
    if(!file_manager->IsSupported_())
    {
        error = "Archivo no soportado.";
        return false;
    }
    if(!file_manager->VerifyMaxFileSize_())
    {
        error = "El archivo debe ser de menos de 5MB.";
        return false;
    }
    file_manager->UploadFile_();
    
    filepath = front_file.get_requested_path()->getFileName();
    return true; 
}

bool Tables::Data::FileProcessing::Delete()
{
    // Verify logo exists and remove it
    Files::FileManager file_manager;
    file_manager.set_directory_base(this->file_manager->get_directory_base());
    file_manager.set_operation_type(Files::OperationType::kDelete);
    file_manager.get_files().push_back(file_manager.CreateTempFile_("/" + filepath));

    if(file_manager.CheckFiles_())
    {
        file_manager.RemoveFile_();
    }
    else
        return false;
    
    return true;
}

void Tables::Data::ChangeInt::Change(std::string row_id, std::string operation, std::string table_identifier)
{
    // Action 1: Get Change int
    auto action1 = StructBX::Functions::Action("a1");
    action1.set_sql_code(
        "INSERT INTO changes (id_row, operation, id_table) "
        "VALUES (?, ?, ?)"
    );

    action1.AddParameter_("id_row", row_id, false);
    action1.AddParameter_("operation", operation, false);
    action1.AddParameter_("table-identifier", table_identifier, false);

    // Execute action
    action1.Work_();
}
