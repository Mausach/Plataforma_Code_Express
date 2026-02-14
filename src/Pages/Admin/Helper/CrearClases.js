// Helper/GenerarClasesComision.js
import Swal from "sweetalert2";
import authApi from "../../../api/authApi";

export const generarClasesParaComision = async (comisionId, datosClases, navigate, theme = 'lights') => {
    try {
        // Validar datos
        if (!comisionId) {
            throw new Error('ID de comisión requerido');
        }

        if (!datosClases.dias_semana || datosClases.dias_semana.length === 0) {
            throw new Error('Debe especificar días de la semana');
        }

        if (!datosClases.hora_inicio || !datosClases.hora_fin) {
            throw new Error('Debe especificar horario completo');
        }

        // Preparar datos
        const datosParaEnviar = {
            dias_semana: [...datosClases.dias_semana].sort((a, b) => a - b),
            hora_inicio: datosClases.hora_inicio,
            hora_fin: datosClases.hora_fin,
            modulos_carrera: datosClases.modulos_carrera // Opcional: si quieres pasar módulos específicos
        };

        console.log('📤 Generando clases para comisión:', comisionId, datosParaEnviar);

        // NOTA: Debes crear este endpoint en el backend
        // POST /api/comisiones/:id/generar-clases
        const resp = await authApi.post(`/admin/comisiones/${comisionId}/generar-clases`, datosParaEnviar);

        if (resp.data.ok) {
            return {
                ok: true,
                total_clases: resp.data.total_clases || 0,
                primera_clase: resp.data.primera_clase,
                ultima_clase: resp.data.ultima_clase,
                horario: resp.data.horario || `${datosClases.hora_inicio} - ${datosClases.hora_fin}`,
                mensaje: resp.data.msg || 'Clases generadas exitosamente'
            };
        } else {
            throw new Error(resp.data.msg || 'Error al generar clases');
        }

    } catch (error) {
        console.error('❌ Error en generarClasesParaComision:', error);
        
        let mensajeError = 'Error al generar clases.';
        
        if (error.response?.data) {
            const data = error.response.data;
            mensajeError = data.msg || data.error || mensajeError;
        } else if (error.message) {
            mensajeError = error.message;
        }
        
        // Mostrar error
        Swal.fire({
            title: "❌ Error",
            text: mensajeError,
            icon: "error",
            background: theme === 'lights' ? '#f9f9f9' : '#1a1d29',
            color: theme === 'lights' ? '#333' : '#eee',
            confirmButtonColor: "#dc3545",
        });
        
        // Verificar sesión expirada
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            sessionStorage.removeItem('token');
            navigate('/login');
            return { ok: false, redirigir: true };
        }
        
        throw new Error(mensajeError);
    }
};

// Helper opcional para verificar estado de generación
export const verificarEstadoClases = async (comisionId) => {
    try {
        // Endpoint para verificar si ya tiene clases
        // GET /api/comisiones/:id/estado-clases
        const resp = await authApi.get(`/admin/comisiones/${comisionId}/estado-clases`);
        
        return {
            ok: true,
            tiene_clases: resp.data.tiene_clases || false,
            total_clases: resp.data.total_clases || 0,
            estado: resp.data.estado || 'No generadas'
        };
    } catch (error) {
        console.error('Error al verificar estado de clases:', error);
        return { ok: false, error: error.message };
    }
};