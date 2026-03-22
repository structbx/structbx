
class Headers
{
    constructor(){}
    Header_()
    {
        $("#header_main").append
        (`
            <div class="container-xxl d-flex justify-content-between">
                <a class="navbar-brand d-flex align-items-center m-0 user-select-none" href="/start/">
                    <div class="container">
                        <img width="40px;" src="/api/general/instanceLogo/read?logo-color=white" alt="Logo">
                    </div>
                </a>
                <button class="navbar-toggler d-md-none collapsed btn-ligth text-end user-select-none" type="button" data-bs-toggle="collapse" data-bs-target=".sidebar" aria-controls="sidebar" aria-expanded="false" aria-label="Toggle navigation">
                    <i class="fas fa-bars" style="color:#fff;"></i>
                </button>
                <div class="sidebar d-md-flex justify-content-between collapse navbar-collapse text-center text-md-left user-select-none">
                    <ul class="navbar-nav">
                        <li class="nav-item ms-md-2 mt-2 mt-md-0">
                            <div class="d-flex align-items-center h-100">
                                <h5 id="instance_name" class="m-0 fw-bold"></h5>
                            </div>
                        </li>
                    </ul>
                </div>
                <div class="sidebar d-md-flex collapse navbar-collapse text-center text-md-left">
                    <ul class="navbar-nav ms-md-auto me-3 me-lg-4">
                        <li class="nav-item me-2">
                            <div class="dropdown">
                                <a class="btn btn-ligth dropdown-toggle" type="button" id="component_databases_selector_btn" data-bs-toggle="dropdown" aria-expanded="false">
                                    <i class="fas fa-building me-2"></i>
                                    <span class="database_name"></span>
                                </a>
                                <ul id="component_databases_selector" class="dropdown-menu bg-dark" aria-labelledby="component_databases_selector_btn">
                                </ul>
                            </div>
                        </li>
                        <div class="vr mx-4 d-none d-md-inline-block"></div>
                        <li class="nav-item me-2">
                            <div class="d-flex align-items-center h-100 text-center">
                                <a class="btn btn-sm btn-outline-light py-2 px-4 d-block d-md-inline-block w-100 mb-2 mb-md-0 go-button" go-path="/administration" go-hash="#my_account" href="#">
                                    <span class="me-2"><i class="fas fa-user"></i></span>
                                    <span class="username_logued"></span>
                                </a>
                            </div>
                        </li>
                        <div class="vr mx-4 d-none d-md-inline-block"></div>
                        <li class="nav-item me-2 text-light">
                            <a class="nav-link dropdown-toggle" href="#" data-bs-toggle="dropdown">
                                <i class="fas fa-tools fa-fw text-light"></i>
                            </a>
                            <ul class="dropdown-menu dropdown-menu-end p-2 bg-dark" style="z-index:1050;">
                                <li permission-endpoint="/api/databases/read">
                                    <a class="dropdown-item btn btn-ligth py-2 px-4 go-button" go-path="/administration" go-hash="#databases" href="#">
                                        <i class="fas fa-building"></i>
                                        <span class="ms-2">Bases de datos</span>
                                    </a>
                                </li>
                                <li>
                                    <a class="dropdown-item btn btn-ligth py-2 px-4 go-button" go-path="/administration" go-hash="#my_account"href="#">
                                        <i class="fas fa-user"></i>
                                        <span class="ms-2">Mi cuenta</span>
                                    </a>
                                </li>
                                <li permission-endpoint="/api/general/instanceName/modify">
                                    <a class="dropdown-item btn btn-ligth py-2 px-4 go-button" go-path="/administration" go-hash="#instance" href="#">
                                        <i class="fas fa-home"></i>
                                        <span class="ms-2">Instancia</span>
                                    </a>
                                </li>
                                <li permission-endpoint="/api/general/users/read">
                                    <a class="dropdown-item btn btn-ligth py-2 px-4 go-button" go-path="/administration" go-hash="#users" href="#">
                                        <i class="fas fa-users"></i>
                                        <span class="ms-2">Usuarios</span>
                                    </a>
                                </li>
                                <li permission-endpoint="/api/general/groups/read">
                                    <a class="dropdown-item btn btn-ligth py-2 px-4 go-button" go-path="/administration" go-hash="#groups" href="#">
                                        <i class="fas fa-cog"></i>
                                        <span class="ms-2">Grupos</span>
                                    </a>
                                </li>
                                <li permission-endpoint="/api/general/permissions/read">
                                    <a class="dropdown-item btn btn-ligth py-2 px-4 go-button" go-path="/administration" go-hash="#permissions" href="#">
                                        <i class="fas fa-user-lock"></i>
                                        <span class="ms-2">Permisos</span>
                                    </a>
                                </li>
                            </ul>
                        </li>
                        <li class="nav-item me-2">
                            <a class="nav-link" href="#" id="logout-button">
                                <i class="fas fa-sign-out-alt text-light"></i>
                            </a>
                        </li>
                    </ul>
                </div>
            </div>
        `);    
    }
}