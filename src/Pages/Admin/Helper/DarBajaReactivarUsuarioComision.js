// Helper/DarBajaInscripcion.js
import Swal from "sweetalert2";
import authApi from "../../../api/authApi";

/**
 * Dar de baja una inscripción con opciones de estado
 */
export const DarBajaInscripcion = async (inscripcionId, estado, motivo = '', onSuccess, onError, theme = 'lights') => {
    try {
        console.log('📤 Iniciando dar de baja inscripción:', { inscripcionId, estado, motivo });

        const response = await authApi.put(`/admin/inscripciones/baja/${inscripcionId}`, {
            estado,
            motivo_baja: motivo
        });

        console.log('✅ Respuesta del servidor:', response.data);

        if (response.data && response.data.success === true) {
            // SweetAlert de éxito
            Swal.fire({
                title: '¡Éxito!',
                text: response.data.msg || 'Inscripción dada de baja correctamente',
                icon: 'success',
                timer: 2000,
                timerProgressBar: true,
                showConfirmButton: false,
                background: theme === 'lights' ? '#FAF3E1' : '#0A0E17',
                color: theme === 'lights' ? '#353432' : '#ebe5e5',
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
            throw new Error(response.data?.msg || 'Error desconocido al dar de baja');
        }

    } catch (error) {
        console.error('💥 Error en DarBajaInscripcion:', {
            message: error.message,
            response: error.response?.data,
            status: error.response?.status
        });

        let mensajeError = 'Error al dar de baja la inscripción';
        let esErrorConocido = false;

        // Manejo de errores específicos del backend
        if (error.response?.data?.msg) {
            mensajeError = error.response.data.msg;
            esErrorConocido = true;
            
            // Mensajes personalizados para errores comunes
            if (mensajeError.includes('ya está en estado')) {
                mensajeError = `⚠️ ${mensajeError}`;
            } else if (mensajeError.includes('no encontrada')) {
                mensajeError = `🔍 ${mensajeError}`;
            }
        } else if (error.message) {
            mensajeError = error.message;
        }

        // SweetAlert de error
        Swal.fire({
            title: esErrorConocido ? 'Atención' : 'Error',
            text: mensajeError,
            icon: esErrorConocido ? 'warning' : 'error',
            confirmButtonText: 'Entendido',
            background: theme === 'lights' ? '#FAF3E1' : '#0A0E17',
            color: theme === 'lights' ? '#353432' : '#ebe5e5',
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

/**
 * Reactivar una inscripción dada de baja
 
 */
export const ReactivarInscripcion = async (inscripcionId, onSuccess, onError, theme = 'lights') => {
    try {
        console.log('📤 Iniciando reactivación de inscripción:', { inscripcionId });

        // ✅ CORREGIDO: Usar la ruta correcta /admin/inscripciones/:id/reactivar
        const response = await authApi.put(`/admin/inscripciones/${inscripcionId}/reactivar`);

        console.log('✅ Respuesta del servidor:', response.data);

        if (response.data && response.data.success === true) {
            // SweetAlert de éxito
            Swal.fire({
                title: '¡Éxito!',
                text: response.data.msg || 'Inscripción reactivada correctamente',
                icon: 'success',
                timer: 2000,
                timerProgressBar: true,
                showConfirmButton: false,
                background: theme === 'lights' ? '#FAF3E1' : '#0A0E17',
                color: theme === 'lights' ? '#353432' : '#ebe5e5',
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
            throw new Error(response.data?.msg || 'Error desconocido al reactivar');
        }

    } catch (error) {
        console.error('💥 Error en ReactivarInscripcion:', {
            message: error.message,
            response: error.response?.data,
            status: error.response?.status
        });

        let mensajeError = 'Error al reactivar la inscripción';
        let esErrorConocido = false;

        // Manejo de errores específicos
        if (error.response?.data?.msg) {
            mensajeError = error.response.data.msg;
            esErrorConocido = true;
            
            if (mensajeError.includes('ya está activa')) {
                mensajeError = `ℹ️ ${mensajeError}`;
            }
        } else if (error.message) {
            mensajeError = error.message;
        }

        // SweetAlert de error
        Swal.fire({
            title: esErrorConocido ? 'Información' : 'Error',
            text: mensajeError,
            icon: esErrorConocido ? 'info' : 'error',
            confirmButtonText: 'Entendido',
            background: theme === 'lights' ? '#FAF3E1' : '#0A0E17',
            color: theme === 'lights' ? '#353432' : '#ebe5e5',
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

/**
 * Mostrar modal interactivo para dar de baja con opciones
 */
export const MostrarModalBaja = (nombre, tipo, onConfirm = null, theme = 'lights') => {
    return new Promise((resolve) => {
        // Traducir tipo para mostrar
        const tipoTraducido = tipo === 'alumno' ? 'alumno' : 
                            tipo === 'profesor' ? 'profesor' : 'usuario';
        
        // Texto según tipo
        const textoBaja = tipo === 'alumno' ? 
            'El alumno será removido de esta comisión.' :
            'El profesor será desasignado de esta comisión.';
        
        Swal.fire({
            title: `¿Dar de baja ${tipoTraducido}?`,
            html: `
                <div style="text-align: left; margin: 20px 0;">
                    <p><strong>${nombre}</strong></p>
                    <p>${textoBaja}</p>
                    
                    <div class="mb-3">
                        <label for="estadoBaja" class="form-label small fw-bold">
                            Motivo de baja:
                        </label>
                        <select id="estadoBaja" class="form-control" 
                            style="width: 100%; padding: 8px; border-radius: 4px; 
                                   border: 1px solid ${theme === 'lights' ? '#ddd' : '#4A5368'};
                                   background-color: ${theme === 'lights' ? '#FFFFFF' : '#2D3447'};
                                   color: ${theme === 'lights' ? '#212529' : '#E9ECEF'};">
                            <option value="inactivo">Inactivo (ausencia temporal)</option>
                            <option value="egresado">Egresado (completó satisfactoriamente)</option>
                            <option value="abandono">Abandono (dejó voluntariamente)</option>
                            <option value="suspendido">Suspendido (por sanción o infracción)</option>
                        </select>
                    </div>
                    
                    <div class="mb-3">
                        <label for="motivoBaja" class="form-label small fw-bold">
                            Detalles adicionales (opcional):
                        </label>
                        <textarea id="motivoBaja" class="form-control" 
                            placeholder="Ej: Cambio de carrera, problemas personales, etc."
                            rows="3" maxlength="500"
                            style="width: 100%; padding: 8px; border-radius: 4px; 
                                   border: 1px solid ${theme === 'lights' ? '#ddd' : '#4A5368'};
                                   background-color: ${theme === 'lights' ? '#FFFFFF' : '#2D3447'};
                                   color: ${theme === 'lights' ? '#212529' : '#E9ECEF'};
                                   resize: vertical;">
                        </textarea>
                        <div class="small text-muted mt-1">Máximo 500 caracteres</div>
                    </div>
                </div>
            `,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#6c757d',
            confirmButtonText: 'Confirmar baja',
            cancelButtonText: 'Cancelar',
            showLoaderOnConfirm: true,
            allowOutsideClick: () => !Swal.isLoading(),
            preConfirm: () => {
                const estado = document.getElementById('estadoBaja').value;
                const motivo = document.getElementById('motivoBaja').value.trim();
                
                // Validación simple
                if (!estado) {
                    Swal.showValidationMessage('Por favor seleccione un motivo de baja');
                    return false;
                }
                
                return { estado, motivo };
            },
            background: theme === 'lights' ? '#FAF3E1' : '#0A0E17',
            color: theme === 'lights' ? '#353432' : '#ebe5e5',
            customClass: {
                popup: theme === 'lights' ? 'card-light' : 'card-dark',
                input: theme === 'lights' ? 'form-control-light' : 'form-control-dark',
                validationMessage: 'text-danger small'
            }
        }).then((result) => {
            if (result.isConfirmed && result.value) {
                const { estado, motivo } = result.value;
                
                // Ejecutar callback si se proporcionó
                if (onConfirm && typeof onConfirm === 'function') {
                    onConfirm(estado, motivo);
                }
                
                resolve({ 
                    confirmed: true, 
                    estado, 
                    motivo,
                    tipo: tipoTraducido
                });
            } else {
                resolve({ 
                    confirmed: false 
                });
            }
        }).catch((error) => {
            console.error('Error en MostrarModalBaja:', error);
            resolve({ confirmed: false });
        });
    });
};

/**
 * Versión con Promise para usar con async/await

 */
export const DarBajaInscripcionPromise = (inscripcionId, estado, motivo = '', theme = 'lights') => {
    return new Promise(async (resolve, reject) => {
        try {
            const result = await DarBajaInscripcion(
                inscripcionId, 
                estado, 
                motivo, 
                (data) => resolve({ success: true, data }),
                (error) => reject({ success: false, error }),
                theme
            );
        } catch (error) {
            reject({ success: false, error: error.message });
        }
    });
};

/**
 * Versión con Promise para reactivación

 */
export const ReactivarInscripcionPromise = (inscripcionId, theme = 'lights') => {
    return new Promise(async (resolve, reject) => {
        try {
            const result = await ReactivarInscripcion(
                inscripcionId, 
                (data) => resolve({ success: true, data }),
                (error) => reject({ success: false, error }),
                theme
            );
        } catch (error) {
            reject({ success: false, error: error.message });
        }
    });
};

// Exportar todas las funciones
export default {
    DarBajaInscripcion,
    ReactivarInscripcion,
    MostrarModalBaja,
    DarBajaInscripcionPromise,
    ReactivarInscripcionPromise
};