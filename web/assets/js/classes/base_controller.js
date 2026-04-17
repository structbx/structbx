export class BaseController {
    constructor() {
        this.apiBase = "/api";
    }

    init() {
        console.log("BaseController: Inicializando...");
        this.bindEvents();
    }

    bindEvents() {
        // Se sobrescribe en los hijos
    }
    
    handleError(error) {
        const msg = error.responseJSON?.message || "Error desconocido";
        // Aquí podrías disparar un Modal de Bootstrap genérico
        alert(`Error en StructBX: ${msg}`);
    }
}