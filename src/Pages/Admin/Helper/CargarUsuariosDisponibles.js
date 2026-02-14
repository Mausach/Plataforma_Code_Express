// Helper/GetUsuariosDisponibles.js
import Swal from "sweetalert2";
import authApi from "../../../api/authApi";

//carga usuarios disponibles para la inscripcion
export const GetUsuariosDisponibles = async (comisionId, rol, setUsuarios, navigate, options = {}) => {
    try {
        const { signal } = options;
        
       
        
        const resp = await authApi.get(`/admin/disponibles-para-comision/${comisionId}`, {
            params: { rol },
            signal
        });

       
        
        if (resp.data && resp.data.success === true) {
            setUsuarios(resp.data.usuarios || []);
            return resp.data.usuarios;
        } else {
            throw new Error(resp.data?.msg || 'Error en respuesta del servidor');
        }
        
    } catch (error) {
        // Manejo de AbortError
        if (error.name === 'AbortError' || error.message === 'canceled') {
            console.log('⏹️ Petición de usuarios cancelada');
            return;
        }
        
        console.error('💥 Error en GetUsuariosDisponibles:', error.message);
        
        // Error 401
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            navigate('/login');
            return;
        }
        
        // Mostrar error al usuario
        const mensajeError = error.response?.data?.msg || 
                           error.message || 
                           `Error al cargar usuarios ${rol} disponibles`;
        
        Swal.fire({
            title: 'ERROR',
            text: mensajeError,
            icon: 'error',
            background: '#f9f9f9',
            confirmButtonColor: '#ffc107',
        });
        
        setUsuarios([]);
    }
};