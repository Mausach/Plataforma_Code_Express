// Helper/GuardarEntrega.js
import Swal from "sweetalert2";
import authApi from "../../../api/authApi";

export const GuardarEntrega = async (datosEntrega, navigate, options = {}) => {
    try {
        const { signal } = options;
        
        console.log('🔄 GuardarEntrega iniciado con datos:', datosEntrega);

        // Validaciones básicas
        if (!datosEntrega.comision_id) {
            throw new Error('El ID de la comisión es requerido');
        }

        if (!datosEntrega.trabajo_nombre) {
            throw new Error('El nombre del trabajo es requerido');
        }

        if (!datosEntrega.tipo_entrega) {
            throw new Error('El tipo de entrega es requerido');
        }

        if (datosEntrega.tipo_entrega === 'github' && !datosEntrega.github_url) {
            throw new Error('La URL de GitHub es obligatoria');
        }

        if (datosEntrega.tipo_entrega === 'archivo' && !datosEntrega.archivo_url) {
            throw new Error('La URL del archivo es obligatoria');
        }

        if (datosEntrega.es_grupal && (!datosEntrega.miembros || datosEntrega.miembros.length === 0)) {
            throw new Error('Los trabajos grupales deben tener al menos un miembro');
        }

        console.log('📡 Enviando al backend:', datosEntrega);
        
        const resp = await authApi.post('/auth/new-entrega', datosEntrega, { signal });

        console.log('✅ Respuesta del backend:', resp.data);

        if (!resp.data) {
            throw new Error('El servidor no devolvió datos');
        }

        if (resp.data.ok === false) {
            throw new Error(resp.data.msg || 'Error del servidor');
        }

        Swal.fire({
            title: '¡Éxito!',
            text: resp.data.msg || 'Entrega registrada correctamente',
            icon: 'success',
            timer: 2000,
            showConfirmButton: false
        });

        return {
            success: true,
            entrega: resp.data.entrega,
            msg: resp.data.msg
        };

    } catch (error) {
        if (error.name === 'AbortError' || error.message === 'canceled') {
            console.log('⏹️ Petición cancelada');
            return { success: false, canceled: true };
        }
        
        console.error('💥 Error en GuardarEntrega:', error);
        
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            navigate('/login');
            return { success: false, error: 'Sesión expirada' };
        }
        
        const mensajeError = error.response?.data?.msg || 
                           error.response?.data?.error || 
                           error.message || 
                           'Error al guardar la entrega';
        
        Swal.fire({
            title: 'ERROR',
            text: mensajeError,
            icon: 'error'
        });
        
        return { success: false, error: mensajeError };
    }
};