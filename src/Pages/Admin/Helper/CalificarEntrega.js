// Helper/CalificarEntrega.js
import Swal from "sweetalert2";
import authApi from "../../../api/authApi";

/**
 * Califica una entrega (profesores)
 * @param {string} entregaId - ID de la entrega a calificar
 * @param {Object} datosCalificacion - Datos de calificación (puntaje, comentario, estado)
 * @param {function} navigate - Función de navegación (para redirigir en 401)
 * @param {Object} options - Opciones adicionales (signal)
 * @returns {Promise<Object>} - Resultado de la operación
 */
export const CalificarEntrega = async (entregaId, datosCalificacion, navigate, options = {}) => {
    try {
        const { signal } = options;
        
        console.log('🔄 CalificarEntrega iniciado para ID:', entregaId);
        console.log('📝 Datos de calificación:', datosCalificacion);

        // Validaciones básicas
        if (!entregaId) {
            throw new Error('ID de entrega requerido');
        }

        if (datosCalificacion.puntaje !== undefined) {
            if (datosCalificacion.puntaje < 0 || datosCalificacion.puntaje > 100) {
                throw new Error('El puntaje debe estar entre 0 y 100');
            }
        }

        console.log('📡 Enviando calificación al backend...');
        
        const resp = await authApi.put(`/admin/entregas/${entregaId}/calificar`, datosCalificacion, { signal });

        console.log('✅ Respuesta recibida del backend:', {
            status: resp.status,
            success: resp.data?.ok,
            nuevo_estado: resp.data?.entrega?.estado
        });

        // Validar que hay respuesta
        if (!resp.data) {
            throw new Error('El servidor no devolvió datos');
        }

        // Si el backend indica error (ok: false)
        if (resp.data.ok === false) {
            throw new Error(resp.data.msg || resp.data.error || 'Error del servidor');
        }

        // Mostrar mensaje de éxito
        Swal.fire({
            title: '¡Éxito!',
            text: resp.data.msg || 'Entrega calificada correctamente',
            icon: 'success',
            background: '#f9f9f9',
            confirmButtonColor: '#ffc107',
            timer: 2000,
            showConfirmButton: false
        });

        console.log('✅ Entrega calificada exitosamente');
        
        // Retornar los datos de la entrega actualizada
        return {
            success: true,
            entrega: resp.data.entrega,
            msg: resp.data.msg
        };

    } catch (error) {
        // ✅ PRIMERO VERIFICAR SI ES ABORT ERROR O "canceled"
        if (error.name === 'AbortError' || error.message === 'canceled') {
            console.log('⏹️ Petición cancelada normalmente (AbortController)');
            return { success: false, canceled: true };
        }
        
        console.log('💥 ERROR REAL en CalificarEntrega:', {
            name: error.name,
            message: error.message,
            status: error.response?.status,
            data: error.response?.data
        });
        
        // Manejo de error 401 (no autenticado)
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            navigate('/login');
            return { success: false, error: 'Sesión expirada' };
        }
        
        // Manejo de error 404 (no encontrado)
        if (error.response?.status === 404) {
            Swal.fire({
                title: 'Error',
                text: 'La entrega no existe',
                icon: 'error',
                background: '#f9f9f9',
                confirmButtonColor: '#ffc107'
            });
            return { success: false, error: 'Entrega no encontrada' };
        }
        
        // Manejo de error 403 (sin permisos)
        if (error.response?.status === 403) {
            Swal.fire({
                title: 'Error',
                text: 'No tienes permisos para calificar entregas',
                icon: 'error',
                background: '#f9f9f9',
                confirmButtonColor: '#ffc107'
            });
            return { success: false, error: 'Permiso denegado' };
        }
        
        // Para otros errores
        const mensajeError = error.response?.data?.msg || 
                           error.response?.data?.error || 
                           error.message || 
                           'Error al calificar la entrega';
        
        Swal.fire({
            title: 'ERROR',
            text: mensajeError,
            icon: 'error',
            background: '#f9f9f9',
            confirmButtonColor: '#ffc107'
        });
        
        return { success: false, error: mensajeError };
    }
};