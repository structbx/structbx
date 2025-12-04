/*
* <one line to give the program's name and a brief idea of what it does.>
* Copyright (C) 2021  <copyright holder> <email>
*
* This program is free software: you can redistribute it and/or modify
* it under the terms of the GNU General Public License as published by
* the Free Software Foundation, either version 3 of the License, or
* (at your option) any later version.
*
* This program is distributed in the hope that it will be useful,
* but WITHOUT ANY WARRANTY; without even the implied warranty of
* MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
* GNU General Public License for more details.
*
* You should have received a copy of the GNU General Public License
* along with this program.  If not, see <http://www.gnu.org/licenses/>.
*/

#include "http/body.h"

using namespace StructBX::HTTP;

Body::Body() :
    body_type_(Type::kURI)
    ,files_parameters_(new Files::FileManager(Files::OperationType::kUpload))
    ,form_(new Net::HTMLForm)
{
    
}

void Body::ReadFormMultipart_(Net::HTTPServerRequest& request)
{
    form_ = std::make_shared<Net::HTMLForm>(request, request.stream(), *files_parameters_);
    body_type_ = Type::kFormMultipart;
}

void Body::ReadFormURLEncoded_(Net::HTTPServerRequest& request)
{
    form_ = std::make_shared<Net::HTMLForm>(request, request.stream());
    for (const auto& field : *form_)
    {
        auto pair = std::pair<std::string, std::string>(field.first, field.second);
        query_parameters_.push_back(pair);
    }
    body_type_ = Type::kFormURLEncoded;
}

void Body::ReadJSON_(std::istream& stream)
{
    std::string json_body;
    StreamCopier::copyToString(stream, json_body);

    if(json_body.empty())
        return;

    Parse_(json_body);
    body_type_ = Type::kJSON;
}

void Body::ReadFromURI_(std::string& uri)
{
    URI uri_tmp(uri);
    query_parameters_ = uri_tmp.getQueryParameters();
    for(auto it = query_parameters_.begin(); it != query_parameters_.end(); ++it)
    {
        if(it->first == "json")
            Parse_(it->second);
    }
    body_type_ = Type::kURI;
}