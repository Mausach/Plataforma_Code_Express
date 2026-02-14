// Helper/GuardarProgresoComision.js
import Swal from "sweetalert2";
import authApi from "../../../api/authApi";

/**
 * Guardar el progreso de una comisión en la base de datos
 */
export const GuardarProgresoComision = async (comisionId, progresoCarrera, navigate = null) => {
    try {
        // Validaciones básicas
        if (!comisionId) {
            throw new Error('ID de comisión es requerido');
        }

        if (!Array.isArray(progresoCarrera)) {
            throw new Error('progresoCarrera debe ser un array');
        }

        // Enviar al backend
        const resp = await authApi.put(`/admin/comisiones/${comisionId}/progreso`, {
            progreso_carrera: progresoCarrera
        });

        if (resp.data.ok) {
            console.log('✅ Progreso guardado exitosamente');
            
            // Mostrar alerta de éxito
            Swal.fire({
                title: '¡Éxito!',
                text: resp.data.msg || 'Progreso guardado correctamente',
                icon: 'success',
                confirmButtonColor: '#28a745',
                timer: 2000,
                showConfirmButton: false
            });

            return resp.data;
        } else {
            throw new Error(resp.data.msg || 'Error en la respuesta del servidor');
        }

    } catch (error) {
        console.error('❌ Error al guardar progreso:', error);
        
        let errorMessage = 'Error al guardar el progreso';
        
        if (error.response) {
            errorMessage = error.response.data?.msg || `Error ${error.response.status}`;
            
            // Manejo específico de errores HTTP
            if (error.response.status === 404) {
                errorMessage = 'Comisión no encontrada';
            } else if (error.response.status === 400) {
                errorMessage = 'Datos inválidos: ' + error.response.data?.msg;
            }
        } else if (error.message) {
            errorMessage = error.message;
        }
        
        // Mostrar alerta de error
        Swal.fire({
            title: 'Error',
            text: errorMessage,
            icon: 'error',
            confirmButtonColor: '#dc3545'
        });
        
        // Manejo de error 401 (no autenticado)
        if (error.response?.status === 401 && navigate) {
            localStorage.removeItem('token');
            navigate('/login');
        }
        
        return null;
    }
};

/**
 * Obtener el progreso actual de una comisión
 */
export const ObtenerProgresoComision = async (comisionId, navigate = null) => {
    try {
        const resp = await authApi.get(`/admin/comisiones/${comisionId}/progreso`);
        
        if (resp.data.ok) {
            return resp.data.progreso;
        } else {
            throw new Error(resp.data.msg || 'Error al obtener progreso');
        }
    } catch (error) {
        console.error('Error al obtener progreso:', error);
        
        if (error.response?.status === 401 && navigate) {
            localStorage.removeItem('token');
            navigate('/login');
        }
        
        return [];
    }
};