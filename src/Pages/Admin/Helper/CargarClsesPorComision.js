// Helper/ClasesHelper.js
import authApi from "../../../api/authApi";
export const obtenerClasesComision = async (comisionId) => {
    try {
       
        
        // ✅ RUTA CORRECTA: /admin/clases/comision/:comisionId
        const response = await authApi.get(`/admin/clases/comision/${comisionId}`);
        
        
        
        if (response.data && response.data.success === true) {
            return {
                success: true,
                data: response.data.data,
                count: response.data.count
            };
        }
        
        return {
            success: false,
            error: response.data?.msg || 'Error al cargar clases'
        };
        
    } catch (error) {
        console.error('❌ Error en obtenerClasesComision:', {
            message: error.message,
            status: error.response?.status,
            data: error.response?.data,
            config: {
                url: error.config?.url,
                baseURL: error.config?.baseURL
            }
        });
        
        let mensajeError = 'Error al cargar las clases';
        
        if (error.code === 'ERR_NETWORK') {
            mensajeError = 'No se pudo conectar al servidor';
        } else if (error.response?.status === 401) {
            mensajeError = 'Sesión expirada';
        } else if (error.response?.status === 404) {
            mensajeError = 'Ruta no encontrada: /admin/clases/comision/' + comisionId;
        } else if (error.response?.data?.msg) {
            mensajeError = error.response.data.msg;
        }
        
        return {
            success: false,
            error: mensajeError,
            status: error.response?.status
        };
    }
};