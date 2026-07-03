
#include <chrono>
#include <thread>
#include <unordered_map>

#include "controllers/tables/data.h"
#include "controllers/tables/column_types.h"
#include "core/error_codes.h"

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

void Tables::Data::VerifyPermissionsRead::CheckReadPermission(StructBX::Functions::Action::Ptr action)
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
            action.set_custom_error("You do not have the required permissions.");
            action.set_custom_error_code(ERR_DATA_NO_PERMISSION);
            return false;
        }

        return true;
    });
    action->AddParameter_("table-identifier", "", true)
    ->SetupCondition_("condition-table-identifier", Query::ConditionType::kError, [](Query::Parameter::Ptr param)
    {
        if(param->get_value()->ToString_() == "")
        {
            param->set_error("The table identifier cannot be empty.");
            return false;
        }
        return true;
    });

    action->AddParameter_("id_user", get_id_user(), false);
}

Tables::Data::VerifyPermissionsReadFromLink::VerifyPermissionsReadFromLink(Tools::FunctionData& function_data) : Tools::FunctionData(function_data)
{

}

void Tables::Data::VerifyPermissionsReadFromLink::CheckReadViaLinkPermission(StructBX::Functions::Action::Ptr action)
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
            action.set_custom_error("You do not have the required permissions.");
            action.set_custom_error_code(ERR_DATA_NO_PERMISSION);
            return false;
        }

        return true;
    });
    action->AddParameter_("table-identifier", "", true)
    ->SetupCondition_("condition-table-identifier", Query::ConditionType::kError, [](Query::Parameter::Ptr param)
    {
        if(param->get_value()->ToString_() == "")
        {
            param->set_error("The table identifier cannot be empty.");
            return false;
        }
        return true;
    });

    action->AddParameter_("id_user", get_id_user(), false);
}

Tables::Data::VerifyPermissionsAdd::VerifyPermissionsAdd(Tools::FunctionData& function_data) : Tools::FunctionData(function_data)
{
    
}

void Tables::Data::VerifyPermissionsAdd::CheckAddPermission(StructBX::Functions::Action::Ptr action)
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
            action.set_custom_error("You do not have the required permissions.");
            action.set_custom_error_code(ERR_DATA_NO_PERMISSION);
            return false;
        }

        return true;
    });
    action->AddParameter_("table-identifier", "", true)
    ->SetupCondition_("condition-table-identifier", Query::ConditionType::kError, [](Query::Parameter::Ptr param)
    {
        if(param->get_value()->ToString_() == "")
        {
            param->set_error("The table identifier cannot be empty.");
            return false;
        }
        return true;
    });

    action->AddParameter_("id_user", get_id_user(), false);
}

Tables::Data::VerifyPermissionsModify::VerifyPermissionsModify(Tools::FunctionData& function_data) : Tools::FunctionData(function_data)
{
    
}

void Tables::Data::VerifyPermissionsModify::CheckModifyPermission(StructBX::Functions::Action::Ptr action)
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
            action.set_custom_error("You do not have the required permissions.");
            action.set_custom_error_code(ERR_DATA_NO_PERMISSION);
            return false;
        }

        return true;
    });
    action->AddParameter_("table-identifier", "", true)
    ->SetupCondition_("condition-table-identifier", Query::ConditionType::kError, [](Query::Parameter::Ptr param)
    {
        if(param->get_value()->ToString_() == "")
        {
            param->set_error("The table identifier cannot be empty.");
            return false;
        }
        return true;
    });

    action->AddParameter_("id_user", get_id_user(), false);
}

Tables::Data::VerifyPermissionsDelete::VerifyPermissionsDelete(Tools::FunctionData& function_data) : Tools::FunctionData(function_data)
{
    
}

void Tables::Data::VerifyPermissionsDelete::CheckDeletePermission(StructBX::Functions::Action::Ptr action)
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
            action.set_custom_error("You do not have the required permissions.");
            action.set_custom_error_code(ERR_DATA_NO_PERMISSION);
            return false;
        }

        return true;
    });
    action->AddParameter_("table-identifier", "", true)
    ->SetupCondition_("condition-table-identifier", Query::ConditionType::kError, [](Query::Parameter::Ptr param)
    {
        if(param->get_value()->ToString_() == "")
        {
            param->set_error("The table identifier cannot be empty.");
            return false;
        }
        return true;
    });

    action->AddParameter_("id_user", get_id_user(), false);
}

Tables::Data::RowPolicyEvaluator::RowPolicyEvaluator() 
{
    
}

bool Tables::Data::RowPolicyEvaluator::LoadPolicies(
    Functions::Function& self, std::string table_identifier)
{
    auto load_action = self.AddAction_("load_row_policies");
    load_action->set_suppress_debug(true);
    load_action->set_sql_code(
        "SELECT identifier, target_type, target_id, action_type, "
        "filter_column, filter_operator, filter_value, priority "
        "FROM tables_row_policies "
        "WHERE id_table = ? AND is_active = 1 "
        "ORDER BY priority ASC"
    );
    load_action->AddParameter_("id_table", table_identifier, false);

    if(!load_action->Work_())
    {
        return false;
    }

    policies_.clear();
    for(auto& row : *load_action->get_results())
    {
        PolicyInfo info;
        info.identifier = row->ExtractField_("identifier")->ToString_();
        info.target_type = row->ExtractField_("target_type")->ToString_();
        info.target_id = row->ExtractField_("target_id")->ToString_();
        info.action_type = row->ExtractField_("action_type")->ToString_();
        info.filter_column = row->ExtractField_("filter_column")->ToString_();
        info.filter_operator = row->ExtractField_("filter_operator")->ToString_();
        info.filter_value = row->ExtractField_("filter_value")->ToString_();
        info.priority = row->ExtractField_("priority")->Int_();
        policies_.push_back(info);
    }

    return true;
}

void Tables::Data::RowPolicyEvaluator::SetValidColumns(Query::Results::Ptr columns_results)
{
    valid_columns_.clear();
    for(auto& row : *columns_results)
    {
        auto field = row->ExtractField_("identifier");
        if(!field->IsNull_())
            valid_columns_.insert(field->ToString_());
    }
}

bool Tables::Data::RowPolicyEvaluator::MatchPolicyTarget(
    const PolicyInfo& policy, Functions::Function& self, std::string current_user_id)
{
    if(policy.target_type == "all")
        return true;

    if(policy.target_type == "user")
        return policy.target_id == current_user_id;

    if(policy.target_type == "user_type")
        return policy.target_id == self.get_current_user().get_type();

    if(policy.target_type == "group")
        return policy.target_id == self.get_current_user().get_id_group();

    return false;
}

bool Tables::Data::RowPolicyEvaluator::HasBypass(
    Functions::Function& self, std::string current_user_id)
{
    for(auto& p : policies_)
    {
        if(p.action_type != "bypass")
            continue;

        if(MatchPolicyTarget(p, self, current_user_id))
            return true;
    }
    return false;
}

std::string Tables::Data::RowPolicyEvaluator::BuildCondition(
    Functions::Function& self, std::string table_alias, std::string current_user_id)
{
    std::string condition = "";
    bool first = true;

    for(auto& policy : policies_)
    {
        if(policy.action_type != "filter")
            continue;

        // Check if policy targets the current user
        if(!MatchPolicyTarget(policy, self, current_user_id))
            continue;

        // Skip if the referenced column no longer exists in the table
        if(!valid_columns_.empty() && valid_columns_.find(policy.filter_column) == valid_columns_.end())
            continue;

        // Build column reference with alias
        std::string col = table_alias.empty() ? 
            policy.filter_column : 
            table_alias + "." + policy.filter_column;

        // Replace placeholders in value
        std::string val = policy.filter_value;
        {
            auto pos = val.find("{current_user_id}");
            if(pos != std::string::npos)
                val.replace(pos, 17, current_user_id);
        }
        {
            auto pos = val.find("{current_username}");
            if(pos != std::string::npos)
                val.replace(pos, 18, self.get_current_user().get_username());
        }
        {
            auto pos = val.find("{user_type}");
            if(pos != std::string::npos)
                val.replace(pos, 11, self.get_current_user().get_type());
        }
        {
            auto pos = val.find("{user_group}");
            if(pos != std::string::npos)
                val.replace(pos, 12, self.get_current_user().get_id_group());
        }

        // Validate operator
        if(valid_filters_ops.find(policy.filter_operator) == valid_filters_ops.end())
            continue;

        std::string op = policy.filter_operator;

        // Build condition part
        std::string part;
        if(op == "IS NULL" || op == "IS NOT NULL")
        {
            part = col + " " + op;
        }
        else if(op == "IN" || op == "NOT IN")
        {
            part = col + " " + op + " (" + val + ")";
        }
        else if(op == "LIKE" || op == "NOT LIKE")
        {
            std::string escaped_val;
            escaped_val.reserve(val.size());
            for(char ch : val)
            {
                if(ch == '\'')
                    escaped_val += "''";
                else
                    escaped_val += ch;
            }
            part = col + " " + op + " '%" + escaped_val + "%'";
        }
        else
        {
            std::string escaped_val;
            escaped_val.reserve(val.size());
            for(char ch : val)
            {
                if(ch == '\'')
                    escaped_val += "''";
                else
                    escaped_val += ch;
            }
            part = col + " " + op + " '" + escaped_val + "'";
        }

        if(first)
        {
            condition = part;
            first = false;
        }
        else
        {
            condition += " AND " + part;
        }
    }

    return condition;
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
    VerifyPermissionsRead(function_data).CheckReadPermission(fpv);

    auto fpv2 = function->AddAction_("fpv2");
    VerifyPermissionsReadFromLink(function_data).CheckReadViaLinkPermission(fpv2);

    // Setup Custom Process
    auto id_database = get_database_id();
    function->SetupCustomProcess_([id_database, default_view, link_to_action, table_columns, fpv, fpv2](StructBX::Functions::Function& self)
    {
        // Get table IDENTIFIER
        auto table_identifier = self.GetParameter_("table-identifier");
        if(table_identifier == self.get_parameters().end())
        {
            self.JSONResponse_(HTTP::Status::kHTTP_BAD_REQUEST, "The table identifier is required.", ERR_DATA_TABLE_ID_EMPTY);
            return;
        }

        // Get View Identifier
        auto view_identifier = self.GetParameter_("view-identifier");
        if(view_identifier == self.get_parameters().end())
        {
            if(!default_view->Work_())
            {
                self.JSONResponse_(HTTP::Status::kHTTP_BAD_REQUEST, "Action failed.", ERR_ACTION_FAILED);
                return;
            }
            auto default_view_identifier = default_view->get_results()->First_();
            if(default_view_identifier->IsNull_())
            {
                self.JSONResponse_(HTTP::Status::kHTTP_BAD_REQUEST, "Action failed.", ERR_ACTION_FAILED);
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
            self.JSONResponse_(HTTP::Status::kHTTP_BAD_REQUEST, table_columns->get_custom_error(), table_columns->get_custom_error_code());
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
                self.JSONResponse_(HTTP::Status::kHTTP_UNAUTHORIZED, fpv2->get_custom_error(), fpv2->get_custom_error_code());
                return;
            }
        }
        else if(!fpv->Work_() && self.get_current_user().get_type() != "system")
        {
            self.JSONResponse_(HTTP::Status::kHTTP_UNAUTHORIZED, fpv->get_custom_error(), fpv->get_custom_error_code());
            return;
        }

        // Export param
        auto export_param = self.GetParameter_("export");
        bool export_data = false;
        if(export_param != self.get_parameters().end() && export_param->get()->ToString_() == "true")
            export_data = true;

        // Check if record identifier is specified
        auto record_identifier = self.GetParameter_("identifier");
        bool has_record_identifier = (record_identifier != self.get_parameters().end()
                                      && record_identifier->get()->ToString_() != "");

        // Get columns
        std::string columns = "";
        std::string joins = "";
        bool has_users_join = false;

        // Resolve display column for from_link requests
        std::string display_column_id = "";
        if(from_link) {
            auto display_action = self.AddAction_("resolve_display_col");
            display_action->set_suppress_debug(true);
            display_action->set_sql_code(
                "SELECT COALESCE(tc.identifier, "
                "  (SELECT identifier FROM tables_columns WHERE id_table = t.identifier LIMIT 1)) AS identifier "
                "FROM tables t "
                "LEFT JOIN tables_columns tc ON tc.identifier = t.id_column_display "
                "WHERE t.identifier = ?"
            );
            display_action->AddParameter_("table-identifier", table_identifier->get()->ToString_(), false);
            if(display_action->Work_() && display_action->get_results()->size() > 0) {
                auto disp_field = display_action->get_results()->begin()->get()->ExtractField_("identifier");
                if(!disp_field->IsNull_())
                    display_column_id = disp_field->ToString_();
            }
        }

        int count = 0;
        for(auto it : *table_columns->get_results())
        {

            Query::Field::Ptr identifier = it.get()->ExtractField_("identifier");
            Query::Field::Ptr name = it.get()->ExtractField_("name");
            Query::Field::Ptr link_to = it.get()->ExtractField_("link_to");
            Query::Field::Ptr visible = it.get()->ExtractField_("visible");
            Query::Field::Ptr column_type = it.get()->ExtractField_("column_type");
            if(identifier->IsNull_() || name->IsNull_())
                continue;

            // Hide column just if the request is not from link (link_to column)
            if(visible->Int_() == 0 && !from_link)
                continue;

            // When from_link, skip columns until we find the display column
            if(from_link && !display_column_id.empty() && identifier->ToString_() != display_column_id)
                continue;

            std::string column = identifier->ToString_() + " AS '" + name->ToString_() + "'";

            // Get LINK TO column
            if(!link_to->IsNull_())
            {
                // Reset results
                link_to_action->get_results()->clear();

                // Get table link identifier and display_value
                link_to_action->SetValueToParamater_(Tools::DValue::Ptr(new Tools::DValue(link_to->ToString_())), "link_to");
                if(!link_to_action->Work_())
                {
                    self.JSONResponse_(HTTP::Status::kHTTP_INTERNAL_SERVER_ERROR, "Action failed.", ERR_ACTION_FAILED);
                    return;
                }
                if(link_to_action->get_results()->size() < 1)
                {
                    self.JSONResponse_(HTTP::Status::kHTTP_INTERNAL_SERVER_ERROR, "The requested table does not exist.", ERR_TBL_NOT_FOUND);
                    return;
                }
                auto display_value = link_to_action->get_results()->begin()->get()->ExtractField_("identifier");
                if(display_value->IsNull_())
                {
                    self.JSONResponse_(HTTP::Status::kHTTP_INTERNAL_SERVER_ERROR, "The requested table does not exist.", ERR_TBL_NOT_FOUND);
                    return;
                }
                
                // Setup column link
                column = "_" + link_to->ToString_() + "." + display_value->ToString_() + " AS '" + name->ToString_() + "'";
                if(!export_data)
                    column += ", _" + link_to->ToString_() + "._structbx_column_colorHeader AS '_structbx_column_" + identifier->ToString_() + "_colorHeader'";

                // Setup new join
                joins += " LEFT JOIN " + id_database + "." + link_to->ToString_() +
                " AS _" + link_to->ToString_() + " ON _" + link_to->ToString_() + ".identifier = _" + 
                table_identifier->get()->ToString_() + "." + identifier->ToString_();
            }
            else if(!column_type->IsNull_() && (column_type->ToString_() == ColumnType::User || column_type->ToString_() == ColumnType::CurrentUser))
            {
                if(has_record_identifier)
                    column = identifier->ToString_() + " AS '" + name->ToString_() + "'";
                else
                    column = "_users.username AS '" + name->ToString_() + "'";

                if(!has_record_identifier && !has_users_join)
                {
                    has_users_join = true;
                    joins += " LEFT JOIN users AS _users ON _users.identifier = _" +
                    table_identifier->get()->ToString_() + "." + identifier->ToString_();
                }
            }

            if(count == 0)
                columns += column;
            else
                columns += ", " + column;

            count++;

            // When from_link, break after including the display column
            if(from_link && count > 0)
                break;
        }

        // Verify if columns is empty
        if(columns == "")
        {
            self.JSONResponse_(HTTP::Status::kHTTP_BAD_REQUEST, "There are no columns in this table.", ERR_ACTION_FAILED);
            return;
        }

        // Filters and Sorts
        std::string filters_query = GetFilters().Get(self, view_identifier->get()->ToString_());
        std::string sorts_query = GetSorts().Get(self, view_identifier->get()->ToString_());

        // Dynamic filters from query parameters
        {
            static const std::unordered_set<std::string> kReservedParams = {
                "table-identifier", "view-identifier", "from", "export",
                "page", "limit", "identifier"
            };

            std::unordered_set<std::string> valid_columns;
            for (auto& row : *table_columns->get_results())
            {
                auto col_id = row->ExtractField_("identifier");
                if (!col_id->IsNull_())
                    valid_columns.insert(col_id->ToString_());
            }

            for (auto& param : self.get_parameters())
            {
                if (kReservedParams.find(param->get_name()) != kReservedParams.end())
                    continue;
                if (param->get_parameter_type() != Query::ParameterType::kField)
                    continue;
                if (valid_columns.find(param->get_name()) == valid_columns.end())
                    continue;

                auto param_value = param->get_value()->ToString_();
                if (param_value.empty())
                    continue;

                std::string escaped_value;
                escaped_value.reserve(param_value.size());
                for (char ch : param_value)
                {
                    if (ch == '\'')
                        escaped_value += "''";
                    else
                        escaped_value += ch;
                }

                std::string condition = "_" + table_identifier->get()->ToString_() + "."
                                      + param->get_name() + " = '" + escaped_value + "'";

                if (filters_query.empty())
                    filters_query = " WHERE " + condition;
                else
                    filters_query += " AND " + condition;
            }
        }
        
        // Evaluate row-level security policies
        {
            RowPolicyEvaluator rpe;
            rpe.SetValidColumns(table_columns->get_results());
            if(!rpe.LoadPolicies(self, table_identifier->get()->ToString_()))
            {
                self.JSONResponse_(HTTP::Status::kHTTP_INTERNAL_SERVER_ERROR, "Failed to load row policies.", ERR_SRV_INTERNAL);
                return;
            }
            if(!rpe.HasBypass(self, self.get_current_user().get_id()))
            {
                std::string policy_condition = rpe.BuildCondition(
                    self, "_" + table_identifier->get()->ToString_(), self.get_current_user().get_id());
                if(!policy_condition.empty())
                {
                    if(filters_query == "")
                        filters_query = " WHERE " + policy_condition;
                    else
                        filters_query += " AND " + policy_condition;
                }
            }
        }

        // Setup color header
        if(!export_data)
            columns += ",_" + table_identifier->get()->ToString_() + "._structbx_column_colorHeader AS _structbx_column_colorHeader"; 

        // Get page
        auto page = self.GetParameter_("page");
        int offset = 0;
        std::string limit_query = " LIMIT 20 ";
        if(page != self.get_parameters().end())
        {
            try
            {
                // LIMIT M, N
                offset = std::stoi(page->get()->ToString_()) * 20;
                limit_query = " LIMIT " + std::to_string(offset) + ", 20";
            }
            catch(std::exception&){StructBX::Tools::OutputLogger::Debug_("Error on controllers/tables/data.cpp: Page parameter is not an integer");}
        }

        // Action: Table data
        auto table_data = self.AddAction_("table_data");

        // Set record identifier condition
        if(has_record_identifier)
        {
            std::string record_identifier_condition = "_"+ table_identifier->get()->ToString_() + ".identifier = ?";
            if(filters_query == "")
                filters_query = " WHERE " + record_identifier_condition;
            else
                filters_query += " AND " + record_identifier_condition;

            table_data->AddParameter_("identifier", record_identifier->get()->ToString_(), false);
        }

        // Add identifier
        std::string add_identifier =  "_" + table_identifier->get()->ToString_() + ".identifier, ";
        if(export_data)
            add_identifier = "";

        // Final SQL Code
        std::string sql_code = 
            "SELECT " + add_identifier + columns + " " \
            "FROM " + id_database + "." + table_identifier->get()->ToString_() + 
                " AS _" + table_identifier->get()->ToString_()
        ;

        // Prepare JOIN if there are links or user joins
        if(!joins.empty())
            sql_code += joins;

        // Filters and sorts
        sql_code += filters_query;
        sql_code += sorts_query;

        // Limit
        if(!export_data)
        {
            sql_code += limit_query;
        }

        // Execute
        table_data->set_sql_code(sql_code);
        if(!table_data->Work_())
        {
            self.JSONResponse_(HTTP::Status::kHTTP_INTERNAL_SERVER_ERROR, "An internal error occurred.", ERR_SRV_INTERNAL);
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
        if(export_data)
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
            param->set_error("The table identifier cannot be empty.");
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
            param->set_error("The view identifier cannot be empty.");
            return false;
        }
        return true;
    });
    action->AddParameter_("table-identifier", "", true)
    ->SetupCondition_("condition-table-identifier", Query::ConditionType::kError, [](Query::Parameter::Ptr param)
    {
        if(param->get_value()->ToString_() == "")
        {
            param->set_error("The table identifier cannot be empty.");
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

    function->set_response_type(StructBX::Functions::Function::ResponseType::kCustom);

    function->SetupCustomProcess_([](StructBX::Functions::Function& self)
    {
        // Read parameters from function parameters
        std::string changeInt_val;
        std::string tableId_val;
        int timeout = 25000;

        auto changeInt_param = self.GetParameter_("changeInt");
        if (changeInt_param == self.get_parameters().end())
        {
            self.JSONResponse_(HTTP::Status::kHTTP_BAD_REQUEST,
                "The changeInt parameter is required.", ERR_ACTION_FAILED);
            return;
        }
        changeInt_val = changeInt_param->get()->ToString_();

        auto tableId_param = self.GetParameter_("table-identifier");
        if (tableId_param == self.get_parameters().end())
        {
            self.JSONResponse_(HTTP::Status::kHTTP_BAD_REQUEST,
                "The table-identifier parameter is required.", ERR_DATA_TABLE_ID_EMPTY);
            return;
        }
        tableId_val = tableId_param->get()->ToString_();

        auto timeout_param = self.GetParameter_("timeout");
        if (timeout_param != self.get_parameters().end())
            timeout = std::stoi(timeout_param->get()->ToString_());

        auto deadline = std::chrono::steady_clock::now() + std::chrono::milliseconds(timeout);

        while (true)
        {
            StructBX::Functions::Action action("poll_changes");
            action.set_suppress_debug(true);
            action.set_sql_code(
                "SELECT id, id_row, operation, id_table "
                "FROM changes "
                "WHERE id > ? AND id_table = ?"
            );
            action.AddParameter_("changeInt", changeInt_val, false);
            action.AddParameter_("table-identifier", tableId_val, false);

            if (!action.Work_())
            {
                self.JSONResponse_(HTTP::Status::kHTTP_BAD_REQUEST,
                    action.get_custom_error(), ERR_ACTION_FAILED);
                return;
            }

            if (action.get_results()->size() > 0)
            {
                self.CompoundResponse_(HTTP::Status::kHTTP_OK,
                    action.CreateJSONResult_());
                return;
            }

            if (std::chrono::steady_clock::now() >= deadline)
            {
                self.CompoundResponse_(HTTP::Status::kHTTP_OK,
                    action.CreateJSONResult_());
                return;
            }

            std::this_thread::sleep_for(std::chrono::milliseconds(1500));
        }
    });

    get_functions()->push_back(function);
}

Tables::Data::ReadFile::ReadFile(Tools::FunctionData& function_data) : Tools::FunctionData(function_data)
{
    // Function GET /api/tables/data/file/read
    StructBX::Functions::Function::Ptr function = 
        std::make_shared<StructBX::Functions::Function>("/api/tables/data/file/read", HTTP::EnumMethods::kHTTP_GET);

    function->set_response_type(StructBX::Functions::Function::ResponseType::kCustom);

    // Action 1: Get table id
    auto action1 = function->AddAction_("verify_table_for_file_read");
    VerifyTableForFileRead(action1);

    // Table permissions verifications
    auto fpv = function->AddAction_("fpv");
    VerifyPermissionsRead struct_verify_permissions_read(function_data);
    struct_verify_permissions_read.CheckReadPermission(fpv);

    // Setup Custom Process
    auto id_database = get_database_id();
    function->SetupCustomProcess_([id_database, action1, fpv](StructBX::Functions::Function& self)
    {
        // Execute actions
        if(!action1->Work_())
        {
            self.HTMLResponse_(HTTP::Status::kHTTP_NOT_FOUND, "File not found in the current table.");
            return;
        }
        if(!fpv->Work_() && self.get_current_user().get_type() != "system")
        {
            self.JSONResponse_(HTTP::Status::kHTTP_UNAUTHORIZED, fpv->get_custom_error(), fpv->get_custom_error_code());
            return;
        }

        // Get filepath
        auto filepath = self.GetParameter_("filepath");
        if(filepath == self.get_parameters().end())
        {
            self.HTMLResponse_(HTTP::Status::kHTTP_NOT_FOUND, "File not found in the current table.");
            return;
        }

        // Get table_identifier
        auto table_identifier = self.GetParameter_("table-identifier");
        if(table_identifier == self.get_parameters().end())
        {
            self.HTMLResponse_(HTTP::Status::kHTTP_NOT_FOUND, "File not found in the current table.");
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

void Tables::Data::ReadFile::VerifyTableForFileRead(StructBX::Functions::Action::Ptr action)
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
            param->set_error("The table identifier cannot be empty.");
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
    VerifyPermissionsAdd(function_data).CheckAddPermission(fpv);

    // Setup Custom Process
    auto id_database = get_database_id();
    function->SetupCustomProcess_([id_database, table_info, table_columns, save_record, fpv](StructBX::Functions::Function& self)
    {
        // Execute actions
        if(!table_info->Work_())
        {
            self.JSONResponse_(HTTP::Status::kHTTP_BAD_REQUEST, "Action failed.", ERR_ACTION_FAILED);
            return;
        }
        if(!table_columns->Work_())
        {
            self.JSONResponse_(HTTP::Status::kHTTP_BAD_REQUEST, "Action failed.", ERR_ACTION_FAILED);
            return;
        }
        if(!fpv->Work_() && self.get_current_user().get_type() != "system")
        {
            self.JSONResponse_(HTTP::Status::kHTTP_UNAUTHORIZED, fpv->get_custom_error(), fpv->get_custom_error_code());
            return;
        }

        // Get table IDENTIFIER
        auto table_identifier = self.GetParameter_("table-identifier");
        if(table_identifier == self.get_parameters().end())
        {
            self.JSONResponse_(HTTP::Status::kHTTP_BAD_REQUEST, "The table identifier is required.", ERR_DATA_TABLE_ID_EMPTY);
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
            self.JSONResponse_(HTTP::Status::kHTTP_BAD_REQUEST, "You must create columns to be able to save data.", ERR_ACTION_FAILED);
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

        // Resolve selection column display values to identifiers
        SelectionResolver resolver(table_columns->get_results(), id_database);
        resolver.ResolveActionParams(save_record);

        if(!save_record->Work_())
        {
            self.JSONResponse_(HTTP::Status::kHTTP_INTERNAL_SERVER_ERROR, "Failed to save the record. " + save_record->get_custom_error(), ERR_ACTION_FAILED);
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
            self.set_custom_error("The requested table does not exist.");
            self.set_custom_error_code(ERR_TBL_NOT_FOUND);
            return false;
        }

        return true;
    });

    action->AddParameter_("table-identifier", "", true)
    ->SetupCondition_("condition-identifier-table", Query::ConditionType::kError, [](Query::Parameter::Ptr param)
    {
        if(param->get_value()->ToString_() == "")
        {
            param->set_error("The table identifier cannot be empty.");
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
            param->set_error("The table identifier cannot be empty.");
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
    auto action1 = function->AddAction_("verify_table_exists_for_import");
    VerifyTableExistsForImport(action1);

    // Action 2: Get table columns
    auto action2 = function->AddAction_("get_columns_for_import");
    GetColumnsForImport(action2);

    // Table permissions verifications
    auto fpv = function->AddAction_("fpv");
    VerifyPermissionsAdd(function_data).CheckAddPermission(fpv);

    // Setup Custom Process
    auto id_database = get_database_id();
    function->SetupCustomProcess_([id_database, action1, action2, fpv](StructBX::Functions::Function& self)
    {
        // Execute actions
        if(!action1->Work_())
        {
            self.JSONResponse_(HTTP::Status::kHTTP_BAD_REQUEST, "Action failed.", ERR_ACTION_FAILED);
            return;
        }
        if(!action2->Work_())
        {
            self.JSONResponse_(HTTP::Status::kHTTP_BAD_REQUEST, "Action failed.", ERR_ACTION_FAILED);
            return;
        }
        if(!fpv->Work_() && self.get_current_user().get_type() != "system")
        {
            self.JSONResponse_(HTTP::Status::kHTTP_UNAUTHORIZED, fpv->get_custom_error(), fpv->get_custom_error_code());
            return;
        }

        // Get table IDENTIFIER
        auto table_identifier = self.GetParameter_("table-identifier");
        if(table_identifier == self.get_parameters().end())
        {
            self.JSONResponse_(HTTP::Status::kHTTP_BAD_REQUEST, "The table identifier is required.", ERR_DATA_TABLE_ID_EMPTY);
            return;
        }

        // Pre-compute selection value maps
        SelectionResolver selection_resolver(action2->get_results(), id_database);

        // Identify JSON Parameters
        int saved = 0;
        auto error_lines = JSON::Array::Ptr(new JSON::Array());
        for (std::size_t a = 0; a < self.get_data()->size(); a++)
        {
            // Action 3: Save new record
            auto action3 = std::make_shared<Functions::Action>("import_insert_row");

            // Configure parameters
            std::string columns = "";
            std::string values = "";
            ParameterConfiguration pc(ParameterConfiguration::Type::kAdd, columns, values, id_database);

            // Setup parameters
            pc.Setup(self, action2->get_results(), table_identifier->get()->ToString_(), action3);

            // Add system columns
            auto row_identifier = Tools::RandomGenerator().GenerateAlphanumericID_(20);
            if(columns == "")
            {
                columns = "identifier, _structbx_column_user_owner";
                values = "?, ?";
            }
            else
            {
                columns += ", identifier, _structbx_column_user_owner";
                values += ", ?, ?";
            }

            // Add system parameters to action3
            action3->AddParameter_("identifier", row_identifier, false);
            action3->AddParameter_("_structbx_column_user_owner", self.get_current_user().get_id(), false);

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

                // Resolve selection display value to identifier
                auto resolved = selection_resolver.ResolveValue(name, value.toString());
                if(resolved != value.toString())
                    value = resolved;

                // Add parameter
                auto new_parameter = std::make_shared<Query::Parameter>(name, Tools::DValue::Ptr(new Tools::DValue(value)), true);
                row_parameters.push_back(new_parameter);
            }
            // Add system parameters
            row_parameters.push_back(std::make_shared<Query::Parameter>("identifier",
                Tools::DValue::Ptr(new Tools::DValue(row_identifier)), false));
            row_parameters.push_back(std::make_shared<Query::Parameter>("_structbx_column_user_owner",
                Tools::DValue::Ptr(new Tools::DValue(self.get_current_user().get_id())), false));
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

void Tables::Data::Import::VerifyTableExistsForImport(StructBX::Functions::Action::Ptr action)
{
    action->set_sql_code("SELECT identifier FROM tables WHERE identifier = ? AND id_database = ?");
    action->set_final(false);
    action->SetupCondition_("verify-table-existence", Query::ConditionType::kError, [](StructBX::Functions::Action& self)
    {
        if(self.get_results()->size() != 1)
        {
            self.set_custom_error("The requested table does not exist.");
            self.set_custom_error_code(ERR_TBL_NOT_FOUND);
            return false;
        }

        return true;
    });

    action->AddParameter_("table-identifier", "", true)
    ->SetupCondition_("condition-identifier-table", Query::ConditionType::kError, [](Query::Parameter::Ptr param)
    {
        if(param->get_value()->ToString_() == "")
        {
            param->set_error("The table identifier cannot be empty.");
            return false;
        }
        return true;
    });
    action->AddParameter_("id_database", get_database_id(), false);

}

void Tables::Data::Import::GetColumnsForImport(StructBX::Functions::Action::Ptr action)
{
    action->set_sql_code(
        "SELECT fc.* " \
        "FROM tables_columns fc " \
        "JOIN tables f ON f.identifier = fc.id_table " \
        "WHERE f.identifier = ? AND f.id_database = ? "
    );
    action->set_final(false);
    action->AddParameter_("table-identifier", "", true)
    ->SetupCondition_("condition-table-identifier", Query::ConditionType::kError, [](Query::Parameter::Ptr param)
    {
        if(param->get_value()->ToString_() == "")
        {
            param->set_error("The table identifier cannot be empty.");
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
    VerifyPermissionsModify(function_data).CheckModifyPermission(fpv);

    // Setup Custom Process
    auto id_database = get_database_id();
    function->SetupCustomProcess_([id_database, table_columns, modify_record, fpv](StructBX::Functions::Function& self)
    {
        // Execute actions
        if(!table_columns->Work_())
        {
            self.JSONResponse_(HTTP::Status::kHTTP_BAD_REQUEST, "Action failed.", ERR_ACTION_FAILED);
            return;
        }
        if(!fpv->Work_() && self.get_current_user().get_type() != "system")
        {
            self.JSONResponse_(HTTP::Status::kHTTP_UNAUTHORIZED, fpv->get_custom_error(), fpv->get_custom_error_code());
            return;
        }

        // Get table and column identifier
        auto table_identifier = self.GetParameter_("table-identifier");
        auto column_identifier = self.GetParameter_("identifier");
        if(table_identifier == self.get_parameters().end() || column_identifier == self.get_parameters().end())
        {
            self.JSONResponse_(HTTP::Status::kHTTP_BAD_REQUEST, "The table identifier is required.", ERR_DATA_TABLE_ID_EMPTY);
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
            self.JSONResponse_(HTTP::Status::kHTTP_BAD_REQUEST, "You must create columns to be able to save data.", ERR_ACTION_FAILED);
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
                param->set_error("The identifier cannot be empty.");
            }

            return true;
        });

        // Final SQL Code
        modify_record->set_sql_code(
            "UPDATE " + id_database + "." + table_identifier->get()->ToString_() + " " \
            "SET " + columns + ", _structbx_column_colorHeader = ? WHERE identifier = ?");

        // Evaluate row-level security policies
        {
            RowPolicyEvaluator rpe;
            rpe.SetValidColumns(table_columns->get_results());
            if(!rpe.LoadPolicies(self, table_identifier->get()->ToString_()))
            {
                self.JSONResponse_(HTTP::Status::kHTTP_INTERNAL_SERVER_ERROR, "Failed to load row policies.", ERR_SRV_INTERNAL);
                return;
            }
            if(!rpe.HasBypass(self, self.get_current_user().get_id()))
            {
                std::string policy_condition = rpe.BuildCondition(
                    self, table_identifier->get()->ToString_(), self.get_current_user().get_id());
                if(!policy_condition.empty())
                {
                    modify_record->set_sql_code(modify_record->get_sql_code() + " AND " + policy_condition);
                }
            }
        }

        // Execute action 3
        self.IdentifyParameters_(modify_record);

        // Resolve selection column display values to identifiers
        SelectionResolver resolver(table_columns->get_results(), id_database);
        resolver.ResolveActionParams(modify_record);

        if(!modify_record->Work_())
        {
            self.JSONResponse_(HTTP::Status::kHTTP_INTERNAL_SERVER_ERROR, "Failed to save the record.", ERR_ACTION_FAILED);
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
            param->set_error("The table identifier cannot be empty.");
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

    // Action: Get table columns
    auto table_columns = function->AddAction_("table_columns");
    GetTableColumns(table_columns);

    // Action: Delete record from table
    auto delete_record = function->AddAction_("delete_record");
    SetIdentifierParam(delete_record);

    // Table permissions verifications
    auto fpv = function->AddAction_("fpv");
    VerifyPermissionsDelete(function_data).CheckDeletePermission(fpv);

    // Setup Custom Process
    auto id_database = get_database_id();
    function->SetupCustomProcess_([id_database, table_columns, delete_record, fpv](StructBX::Functions::Function& self)
    {
        // Execute actions
        if(!table_columns->Work_())
        {
            self.JSONResponse_(HTTP::Status::kHTTP_BAD_REQUEST, "Action failed.", ERR_ACTION_FAILED);
            return;
        }
        if(!fpv->Work_() && self.get_current_user().get_type() != "system")
        {
            self.JSONResponse_(HTTP::Status::kHTTP_UNAUTHORIZED, fpv->get_custom_error(), fpv->get_custom_error_code());
            return;
        }

        // Get table IDENTIFIER
        auto table_identifier = self.GetParameter_("table-identifier");
        if(table_identifier == self.get_parameters().end())
        {
            self.JSONResponse_(HTTP::Status::kHTTP_BAD_REQUEST, "The table identifier is required.", ERR_DATA_TABLE_ID_EMPTY);
            return;
        }

        // Delete record files
        for(auto it : *table_columns->get_results())
        {
            // Get column
            auto identifier = it.get()->ExtractField_("identifier");
            auto column_type = it.get()->ExtractField_("column_type");

            // Verify identifier is not null
            if(identifier->IsNull_())
                continue;

            // Verify if is image or file
            if(column_type->IsNull_())
                continue;
            bool r = false;
            if(column_type->ToString_() == ColumnType::Image || column_type->ToString_() == ColumnType::File)
                r = true;
            if(!r)
                continue;

            // Get file manager
            auto file_manager = self.get_file_manager();
            file_manager->set_directory_base(
                StructBX::Tools::SettingsManager::GetSetting_(
                    "directory_for_uploaded_files"
                    ,"/var/www/structbx-web-uploaded") + "/" + std::string(id_database) + "/" + table_identifier->get()->ToString_()
            );

            // Request filepath
            auto get_filepath = self.AddAction_("get_filepath");
            get_filepath->set_sql_code(
                "SELECT " + identifier->ToString_() + " "
                "FROM " + id_database + "." + table_identifier->get()->ToString_() + " " \
                "WHERE identifier = ?"
            );
            get_filepath->AddParameter_("identifier", "", true)
            ->SetupCondition_("condition-identifier", Query::ConditionType::kError, [](Query::Parameter::Ptr param)
            {
                if(param->get_value()->ToString_() == "")
                {
                    param->set_error("The identifier cannot be empty.");
                }

                return true;
            });
            self.IdentifyParameters_(get_filepath);
            if(!get_filepath->Work_())
            {
                self.JSONResponse_(HTTP::Status::kHTTP_BAD_REQUEST, "Action failed.", ERR_ACTION_FAILED);
                return;
            }
            auto filepath = get_filepath->get_results()->First_();

            // Process file
            FileProcessing fp;
            fp.file_manager = file_manager;
            if(!filepath->IsNull_() && filepath->ToString_() != "")
            {
                fp.filepath = filepath->ToString_();
                fp.Delete();
            }
        }

        // Build delete SQL
        std::string delete_sql = "DELETE FROM " + id_database + "." + table_identifier->get()->ToString_() + " WHERE identifier = ?";

        // Evaluate row-level security policies
        {
            RowPolicyEvaluator rpe;
            rpe.SetValidColumns(table_columns->get_results());
            if(!rpe.LoadPolicies(self, table_identifier->get()->ToString_()))
            {
                self.JSONResponse_(HTTP::Status::kHTTP_INTERNAL_SERVER_ERROR, "Failed to load row policies.", ERR_SRV_INTERNAL);
                return;
            }
            if(!rpe.HasBypass(self, self.get_current_user().get_id()))
            {
                std::string policy_condition = rpe.BuildCondition(
                    self, table_identifier->get()->ToString_(), self.get_current_user().get_id());
                if(!policy_condition.empty())
                {
                    delete_sql += " AND " + policy_condition;
                }
            }
        }

        delete_record->set_sql_code(delete_sql);

        // Execute action 2
        self.IdentifyParameters_(delete_record);
        if(!delete_record->Work_())
        {
            self.JSONResponse_(HTTP::Status::kHTTP_INTERNAL_SERVER_ERROR, "Action failed.", ERR_ACTION_FAILED);
            return;
        }

        // ChangeInt
        auto identifier = delete_record->GetParameter_("identifier");
        auto changeInt = ChangeInt();
        changeInt.Change(identifier->get()->ToString_(), "delete", table_identifier->get()->ToString_());

        // Send results
        self.JSONResponse_(HTTP::Status::kHTTP_OK, "Ok.");
    });

    get_functions()->push_back(function);
}

void Tables::Data::Delete::GetTableColumns(StructBX::Functions::Action::Ptr action)
{
    action->set_sql_code(
        "SELECT * " \
        "FROM tables_columns " \
        "WHERE id_table = ?"
    );
    action->set_final(false);
    action->AddParameter_("table-identifier", "", true)
    ->SetupCondition_("condition-table-identifier", Query::ConditionType::kError, [](Query::Parameter::Ptr param)
    {
        if(param->get_value()->ToString_() == "")
        {
            param->set_error("The table identifier cannot be empty.");
            return false;
        }
        return true;
    });
}

void Tables::Data::Delete::SetIdentifierParam(StructBX::Functions::Action::Ptr action)
{
    action->AddParameter_("identifier", "", true)
    ->SetupCondition_("condition-identifier", Query::ConditionType::kError, [](Query::Parameter::Ptr param)
    {
        if(param->get_value()->ToString_() == "")
        {
            param->set_error("The record identifier cannot be empty.");
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
                param->set_error("The parameter " + param->get_name() + " is required.");
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
                param->set_error("The parameter " + param->get_name() + " is required.");
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

        // Remap function parameters that use column name instead of identifier
        for (auto& param : self.get_parameters())
        {
            if (!name->IsNull_() && param->get_name() == name->ToString_())
            {
                param->set_name(identifier->ToString_());
            }
        }

        // Skip auto-managed columns (handled by DB defaults/triggers)
        if(column_type->ToString_() == ColumnType::CreatedDate || column_type->ToString_() == ColumnType::UpdatedDate)
            continue;

        // Partial update: for kModify, skip columns not present in the request
        // so that only explicitly sent columns are updated (supports batch edit)
        if(type == Type::kModify)
        {
            auto func_param = self.GetParameter_(identifier->ToString_());
            if(func_param == self.get_parameters().end())
                continue;
        }

        // Step 2: Search column type image or file
        if(column_type->ToString_() == ColumnType::Image || column_type->ToString_() == ColumnType::File)
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
                auto action2_1 = StructBX::Functions::Action::Ptr(new StructBX::Functions::Action("get_old_file_path"));
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
                        param->set_error("The identifier cannot be empty.");
                    }

                    return true;
                });
                self.IdentifyParameters_(action2_1);
                if(!action2_1->Work_())
                {
                    self.JSONResponse_(HTTP::Status::kHTTP_BAD_REQUEST, "Action failed.", ERR_ACTION_FAILED);
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
                        self.JSONResponse_(HTTP::Status::kHTTP_BAD_REQUEST, "Error in parameter (" + identifier->ToString_() + "): " + fp.error, ERR_ACTION_FAILED);
                        return;
                    }
                }
            }

            // Step 7: Save the new file
            if(!fp.Save())
            {
                self.JSONResponse_(HTTP::Status::kHTTP_BAD_REQUEST, "Error in parameter (" + identifier->ToString_() + "): " + fp.error, ERR_ACTION_FAILED);
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
        error = "Error uploading the file.";
        return false;
    }
    if(!file_manager->IsSupported_())
    {
        error = "Unsupported file.";
        return false;
    }
    if(!file_manager->VerifyMaxFileSize_())
    {
        error = "The file must be less than 5MB.";
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
    auto action1 = StructBX::Functions::Action("log_data_change");
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

Tables::Data::SelectionResolver::SelectionResolver(Query::Results::Ptr columns_results, std::string id_database)
{
    for(auto it : *columns_results)
    {
        auto col_id = it->ExtractField_("identifier");
        auto col_type = it->ExtractField_("column_type");
        auto link_to = it->ExtractField_("link_to");

        if(col_id->IsNull_() || col_type->IsNull_() || link_to->IsNull_())
            continue;
        if(col_type->ToString_() != ColumnType::Selection)
            continue;

        // Find display column for linked table
        auto link_action = Functions::Action("resolve_link_display");
        link_action.set_suppress_debug(true);
        link_action.set_sql_code(
            "SELECT COALESCE(tc.identifier, "
            "  (SELECT identifier FROM tables_columns WHERE id_table = t.identifier LIMIT 1)) AS identifier "
            "FROM tables t "
            "LEFT JOIN tables_columns tc ON tc.identifier = t.id_column_display "
            "WHERE t.identifier = ?"
        );
        link_action.AddParameter_("link_to", link_to->ToString_(), false);
        if(!link_action.Work_() || link_action.get_results()->size() < 1)
            continue;
        auto disp_col = (*link_action.get_results()->begin())->ExtractField_("identifier");
        if(disp_col->IsNull_())
            continue;

        // Load all records from linked table
        auto load_action = Functions::Action("load_selection_options");
        load_action.set_suppress_debug(true);
        load_action.set_sql_code(
            "SELECT identifier, " + disp_col->ToString_() + " AS display_value "
            "FROM " + id_database + "." + link_to->ToString_()
        );
        if(!load_action.Work_())
            continue;

        std::unordered_map<std::string, std::string> value_map;
        for(auto& row : *load_action.get_results())
        {
            auto rec_id = row->ExtractField_("identifier");
            auto disp_val = row->ExtractField_("display_value");
            if(!rec_id->IsNull_() && !disp_val->IsNull_())
                value_map[disp_val->ToString_()] = rec_id->ToString_();
        }
        selection_maps[col_id->ToString_()] = std::move(value_map);
    }
}

std::string Tables::Data::SelectionResolver::ResolveValue(std::string column_identifier, std::string value)
{
    auto sel_it = selection_maps.find(column_identifier);
    if(sel_it != selection_maps.end())
    {
        auto map_it = sel_it->second.find(value);
        if(map_it != sel_it->second.end())
            return map_it->second;
    }
    return value;
}

void Tables::Data::SelectionResolver::ResolveActionParams(Functions::Action::Ptr action)
{
    for(auto& param : action->get_parameters())
    {
        if(!param->get_editable() || param->get_value()->TypeIsIqual_(Tools::DValue::Type::kEmpty))
            continue;
        auto resolved = ResolveValue(param->get_name(), param->get_value()->ToString_());
        if(resolved != param->get_value()->ToString_())
        {
            param->set_value(Tools::DValue::Ptr(new Tools::DValue(resolved)));
        }
    }
}
