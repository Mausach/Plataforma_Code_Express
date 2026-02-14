// helpers/CargarComisionesCompletasUsuario.js
import Swal from "sweetalert2";
import authApi from '../../../api/authApi';


export const CargarComisionesCompletasUsuario = async (usuarioId, setComisiones, navigate) => {
    try {
      
        
        // URL CORRECTA según tu ruta de admin
        const url = `/auth/usuario/${usuarioId}/comisiones-completas`;
        
      
        
        const resp = await authApi.get(url);
        
     

        // Validar respuesta (formato { ok: true, comisiones: [...] })
        if (resp.data?.ok === true && Array.isArray(resp.data.comisiones)) {
            setComisiones(resp.data.comisiones);
            
            return {
                success: true,
                data: resp.data.comisiones,
                metadata: resp.data.metadata
            };
        } else {
            console.error('❌ Formato de respuesta inválido:', resp.data);
            setComisiones([]);
            return {
                success: false,
                error: 'Formato de datos inválido'
            };
        }

    } catch (error) {
        console.error('❌ Error al cargar comisiones completas:', {
            status: error.response?.status,
            data: error.response?.data,
            message: error.message
        });

        // Mostrar error específico
        const errorMsg = error.response?.data?.msg || 
                        error.response?.data?.error || 
                        'Error al cargar las comisiones del usuario';

        Swal.fire({
            title: 'ERROR',
            text: errorMsg,
            icon: 'error',
            confirmButtonColor: '#EF7F1A',
        });

        // Manejo de errores
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            navigate('/login');
        }

        if (error.response?.status === 404) {
            setComisiones([]);
            return {
                success: true,
                data: [],
                error: 'Usuario sin comisiones'
            };
        }

        return {
            success: false,
            error: errorMsg,
            data: []
        };
    }
};

export default CargarComisionesCompletasUsuario;