// Helper/AsistenciaHelper.js
import Swal from 'sweetalert2';
import authApi from "../../../api/authApi";

export const TomarAsistencias = async (claseId, asistencias, setRefreshData, navigate, theme = 'lights') => {
    try {


        const response = await authApi.post(`/admin/clases/${claseId}/asistencia/batch`, {
            asistencias: asistencias.map(a => ({
                usuario_id: a.usuario_id,
                presente: a.presente
            }))
        });

    

        if (response.data.success) {
            // SweetAlert de éxito
            await Swal.fire({
                title: '✅ Asistencia guardada',
                html: `
                    <div style="text-align: center;">
                        <p>${response.data.msg || 'Asistencia registrada correctamente'}</p>
                        <div style="display: flex; justify-content: center; gap: 20px; margin-top: 15px;">
                            <div>
                                <span style="font-size: 24px; color: #28a745;">${response.data.data.total_presentes}</span>
                                <br>
                                <small>Presentes</small>
                            </div>
                            <div>
                                <span style="font-size: 24px; color: #dc3545;">${response.data.data.total_ausentes}</span>
                                <br>
                                <small>Ausentes</small>
                            </div>
                            <div>
                                <span style="font-size: 24px; color: #17a2b8;">${response.data.data.total_procesadas}</span>
                                <br>
                                <small>Total</small>
                            </div>
                        </div>
                    </div>
                `,
                icon: 'success',
                timer: 3000,
                timerProgressBar: true,
                showConfirmButton: false,
                background: theme === 'lights' ? '#FAF3E1' : '#0A0E17',
                color: theme === 'lights' ? '#353432' : '#ebe5e5',
            });

            // Refrescar datos
            if (setRefreshData && typeof setRefreshData === 'function') {
                setRefreshData(true);
            }

            return {
                success: true,
                data: response.data.data,
                message: response.data.msg
            };
        }

        return {
            success: false,
            error: response.data?.msg || 'Error al guardar asistencia'
        };

    } catch (error) {
        console.error('❌ Error en guardarAsistenciaBatch:', {
            status: error.response?.status,
            data: error.response?.data,
            message: error.message
        });

        let errorMessage = error.response?.data?.msg || 'Error al guardar la asistencia';
        
        // Si hay errores específicos por fila
        if (error.response?.data?.errores) {
            errorMessage = error.response.data.errores.join('\n');
        }

        await Swal.fire({
            title: '❌ Error',
            text: errorMessage,
            icon: 'error',
            confirmButtonText: 'Aceptar',
            background: theme === 'lights' ? '#FAF3E1' : '#0A0E17',
            color: theme === 'lights' ? '#353432' : '#ebe5e5',
        });

        // Manejar sesión expirada
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            if (navigate) navigate('/login');
        }

        return {
            success: false,
            error: errorMessage,
            status: error.response?.status
        };
    }
};


export const obtenerAsistenciasPorClase = async (claseId) => {
    try {
        const response = await authApi.get(`/admin/clases/${claseId}/asistencias`);
        
        if (response.data.success) {
            return {
                success: true,
                data: response.data.data,
                count: response.data.count
            };
        }
        
        return {
            success: false,
            error: response.data?.msg || 'Error al obtener asistencias'
        };
        
    } catch (error) {
        console.error('❌ Error en obtenerAsistenciasPorClase:', error);
        return {
            success: false,
            error: error.response?.data?.msg || 'Error de conexión'
        };
    }
};