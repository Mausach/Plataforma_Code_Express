// Helper/InscribirUsuario.js
import Swal from "sweetalert2";
import authApi from "../../../api/authApi";

export const InscribirUsuario = async (comisionId, usuarioId, onSuccess, onError, theme = 'lights') => {
    try {
      

        const response = await authApi.post('/admin/nueva-inscripcion', {
            comision_id: comisionId,
            usuario_id: usuarioId
        });

      

        if (response.data && response.data.success === true) {
            // Mostrar mensaje de éxito
            Swal.fire({
                title: '¡Éxito!',
                text: response.data.msg || 'Usuario inscrito correctamente',
                icon: 'success',
                timer: 2000,
                timerProgressBar: true,
                showConfirmButton: false,
                background: theme === 'lights' ? '#FAF3E1' : '#0A0E17',
                color: theme === 'lights' ? '#353432' : '#ebe5e5',
                customClass: {
                    popup: theme === 'lights' ? 'card-light' : 'card-dark'
                }
            });

            // Ejecutar callback de éxito si existe
            if (onSuccess && typeof onSuccess === 'function') {
                onSuccess(response.data.data);
            }

            return {
                success: true,
                data: response.data.data,
                message: response.data.msg
            };

        } else {
            throw new Error(response.data?.msg || 'Error desconocido al inscribir usuario');
        }

    } catch (error) {
        console.error('💥 Error en InscribirUsuario:', {
            message: error.message,
            response: error.response?.data,
            status: error.response?.status
        });

        // Manejo de errores específicos
        let mensajeError = 'Error al inscribir usuario';
        let esErrorConocido = false;

        if (error.response?.data) {
            const errorData = error.response.data;
            
            // Errores conocidos del backend
            if (errorData.msg) {
                mensajeError = errorData.msg;
                esErrorConocido = true;
                
                // Mensajes específicos para errores comunes
                if (errorData.msg.includes('ya está inscrito')) {
                    mensajeError = '⚠️ ' + errorData.msg;
                } else if (errorData.msg.includes('no está activo')) {
                    mensajeError = '❌ ' + errorData.msg;
                } else if (errorData.msg.includes('no existe')) {
                    mensajeError = '🔍 ' + errorData.msg;
                }
            }
        } else if (error.message) {
            mensajeError = error.message;
        }

        // Mostrar alerta de error
        Swal.fire({
            title: esErrorConocido ? 'Atención' : 'Error',
            text: mensajeError,
            icon: esErrorConocido ? 'warning' : 'error',
            confirmButtonText: 'Entendido',
            background: theme === 'lights' ? '#FAF3E1' : '#0A0E17',
            color: theme === 'lights' ? '#353432' : '#ebe5e5',
            customClass: {
                popup: theme === 'lights' ? 'card-light' : 'card-dark',
                confirmButton: 'swal2-confirm-custom'
            }
        });

        // Ejecutar callback de error si existe
        if (onError && typeof onError === 'function') {
            onError(mensajeError);
        }

        return {
            success: false,
            error: mensajeError,
            status: error.response?.status
        };
    }
};

// Versión alternativa con Promise (para usar con async/await)
export const InscribirUsuarioPromise = (comisionId, usuarioId, theme = 'lights') => {
    return new Promise(async (resolve, reject) => {
        try {
            const result = await InscribirUsuario(
                comisionId, 
                usuarioId, 
                (data) => resolve({ success: true, data }),
                (error) => reject({ success: false, error }),
                theme
            );
        } catch (error) {
            reject({ success: false, error: error.message });
        }
    });
};