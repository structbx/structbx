
#include "controllers/tables/views.h"
#include "core/error_codes.h"

using namespace StructBX::Controllers::Tables;

Views::Views(Tools::FunctionData& function_data) :
    FunctionData(function_data)
    ,struct_read_(function_data)
    ,struct_read_specific_(function_data)
    ,struct_add_(function_data)
    ,struct_modify_(function_data)
    ,struct_delete_(function_data)
{
    
}

Views::Read::Read(Tools::FunctionData& function_data) : Tools::FunctionData(function_data)
{
    // Function GET /api/tables/views/read
    StructBX::Functions::Function::Ptr function = 
        std::make_shared<StructBX::Functions::Function>("/api/tables/views/read", HTTP::EnumMethods::kHTTP_GET);

    auto action = function->AddAction_("read_views_by_table");
    ReadViewsByTable(action);

    get_functions()->push_back(function);
}

void Views::Read::ReadViewsByTable(StructBX::Functions::Action::Ptr action)
{
    action->set_sql_code(
        "SELECT " \
            "v.identifier AS identifier, v.name AS name " \
        "FROM views v " \
        "JOIN tables f ON f.identifier = v.id_table " \
        "WHERE " \
            "f.identifier = ? "
    );

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

Views::ReadSpecific::ReadSpecific(Tools::FunctionData& function_data) : Tools::FunctionData(function_data)
{
    // Function GET /api/tables/views/read/identifier
    StructBX::Functions::Function::Ptr function = 
        std::make_shared<StructBX::Functions::Function>("/api/tables/views/read/identifier", HTTP::EnumMethods::kHTTP_GET);

    auto action = function->AddAction_("read_view_by_identifier");
    ReadViewByIdentifier(action);

    get_functions()->push_back(function);
}

void Views::ReadSpecific::ReadViewByIdentifier(StructBX::Functions::Action::Ptr action)
{
    action->set_sql_code(
        "SELECT " \
            "v.identifier AS identifier, v.name AS name " \
        "FROM views v " \
        "JOIN tables f ON f.identifier = v.id_table " \
        "WHERE " \
            "f.identifier = ? AND v.identifier = ?"
    );

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
    action->AddParameter_("identifier", "", true)
    ->SetupCondition_("condition-identifier", Query::ConditionType::kError, [](Query::Parameter::Ptr param)
    {
        if(param->get_value()->ToString_() == "")
        {
            param->set_error("The view identifier cannot be empty.");
            return false;
        }
        return true;
    });
}

Views::Add::Add(Tools::FunctionData& function_data) : Tools::FunctionData(function_data)
{
    // Function POST /api/tables/views/add
    StructBX::Functions::Function::Ptr function = 
        std::make_shared<StructBX::Functions::Function>("/api/tables/views/add", HTTP::EnumMethods::kHTTP_POST);
    
    // Action 1: Save the view
    auto action1 = function->AddAction_("insert_view");
    InsertView(action1);

    get_functions()->push_back(function);
}

void Views::Add::InsertView(StructBX::Functions::Action::Ptr action)
{
    action->set_sql_code(
        "INSERT INTO views (identifier, name, id_table) "
        "SELECT "
            "?, ?, ?"
    );
    auto table_identifier = Tools::RandomGenerator().GenerateAlphanumericID_(20);
    action->AddParameter_("identifier", table_identifier, false);
    action->AddParameter_("name", "", true)
    ->SetupCondition_("condition-name", Query::ConditionType::kError, [](Query::Parameter::Ptr param)
    {
        if(param->ToString_() == "")
        {
            param->set_error("The name cannot be empty.");
            return false;
        }
        return true;
    });
    action->AddParameter_("table-identifier", "", true)
    ->SetupCondition_("condition-table-identifier", Query::ConditionType::kError, [](Query::Parameter::Ptr param)
    {
        if(param->ToString_() == "")
        {
            param->set_error("The table identifier cannot be empty.");
            return false;
        }
        return true;
    });
}

Views::Modify::Modify(Tools::FunctionData& function_data) : Tools::FunctionData(function_data)
{
    // Function PUT /api/tables/views/modify
    StructBX::Functions::Function::Ptr function = 
        std::make_shared<StructBX::Functions::Function>("/api/tables/views/modify", HTTP::EnumMethods::kHTTP_PUT);
    
    auto action1 = function->AddAction_("rename_view");
    RenameView(action1);
    get_functions()->push_back(function);
}

void Views::Modify::RenameView(StructBX::Functions::Action::Ptr action)
{
    action->set_sql_code(
        "UPDATE views "
        "SET name = ? "
        "WHERE "
            "identifier = ?"
    );
    action->AddParameter_("name", "", true)
    ->SetupCondition_("condition-name", Query::ConditionType::kError, [](Query::Parameter::Ptr param)
    {
        if(param->ToString_() == "")
        {
            param->set_error("The name cannot be empty.");
            return false;
        }
        return true;
    });
    action->AddParameter_("identifier", "", true)
    ->SetupCondition_("condition-identifier", Query::ConditionType::kError, [](Query::Parameter::Ptr param)
    {
        if(param->ToString_() == "")
        {
            param->set_error("The view identifier cannot be empty.");
            return false;
        }
        return true;
    });
}

Views::Delete::Delete(Tools::FunctionData& function_data) : Tools::FunctionData(function_data)
{
    // Function DEL /api/tables/views/delete
    StructBX::Functions::Function::Ptr function = 
        std::make_shared<StructBX::Functions::Function>("/api/tables/views/delete", HTTP::EnumMethods::kHTTP_DEL);
    
    function->set_response_type(StructBX::Functions::Function::ResponseType::kCustom);

    // Action 1: Count views by table (prevent deleting last view)
    auto action_count = function->AddAction_("count_views_by_table");
    CountViewsByTable(action_count);

    // Action 2: Delete view
    auto action2 = function->AddAction_("delete_view");
    DeleteView(action2);

    // Setup Custom Process
    function->SetupCustomProcess_([action_count, action2](StructBX::Functions::Function& self)
    {
        // Action 1: Count views
        if(!action_count->Work_())
        {
            self.JSONResponse_(HTTP::Status::kHTTP_BAD_REQUEST, action_count->get_custom_error(), action_count->get_custom_error_code());
            return;
        }

        // Action 2: Delete view
        if(!action2->Work_())
        {
            self.JSONResponse_(HTTP::Status::kHTTP_BAD_REQUEST, action2->get_custom_error(), action2->get_custom_error_code());
            return;
        }

        // Send results
        self.JSONResponse_(HTTP::Status::kHTTP_OK, "Ok.");
    });

    get_functions()->push_back(function);
}

void Views::Delete::CountViewsByTable(StructBX::Functions::Action::Ptr action)
{
    action->set_sql_code(
        "SELECT COUNT(*) AS cnt "
        "FROM views "
        "WHERE id_table = (SELECT id_table FROM views WHERE identifier = ?)"
    );
    action->SetupCondition_("count-views", Query::ConditionType::kError, [](StructBX::Functions::Action& self)
    {
        auto first = self.get_results()->First_();
        if(first->IsNull_() || first->Int_() <= 1)
        {
            self.set_custom_error("Cannot delete the last view. A table must have at least one view.");
            self.set_custom_error_code(ERR_VIEW_LAST_DELETE);
            return false;
        }

        return true;
    });

    action->AddParameter_("identifier", "", true)
    ->SetupCondition_("condition-identifier", Query::ConditionType::kError, [](Query::Parameter::Ptr param)
    {
        if(param->get_value()->ToString_() == "")
        {
            param->set_error("The view identifier cannot be empty.");
            return false;
        }
        return true;
    });
}

void Views::Delete::DeleteView(StructBX::Functions::Action::Ptr action)
{
    action->set_sql_code(
        "DELETE FROM views " \
        "WHERE identifier = ?"
    );
    action->AddParameter_("identifier", "", true)
    ->SetupCondition_("condition-identifier", Query::ConditionType::kError, [](Query::Parameter::Ptr param)
    {
        if(param->get_value()->ToString_() == "")
        {
            param->set_error("The view identifier cannot be empty.");
            return false;
        }
        return true;
    });
}
