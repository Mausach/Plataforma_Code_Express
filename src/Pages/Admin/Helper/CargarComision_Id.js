import Swal from "sweetalert2";
import authApi from "../../../api/authApi";

//carga carrera completa
export const CargarCarreraCompleta = async (carreraId, setCarrera, navigate) => {
    try {
        // Validación simple del ID
        if (!carreraId || carreraId === 'undefined' || carreraId === 'null') {
            throw new Error('ID de carrera inválido');
        }

        

        // Petición al backend - ajusta la ruta según tu endpoint
        const resp = await authApi.get(`/admin/${carreraId}/completa`);
        
        // Validar respuesta
        if (resp.data.ok && resp.data.carrera) {
            const carreraData = resp.data.carrera;
            
            // Formatear datos si es necesario
            const carreraFormateada = {
                ...carreraData,
                // Asegurar que tengamos _id e id
                _id: carreraData.id || carreraData._id,
                // Asegurar estructura de módulos
                modulos: (carreraData.modulos || []).map(modulo => ({
                    ...modulo,
                    _id: modulo.id || modulo._id,
                    contenidos: (modulo.contenidos || []).map(contenido => ({
                        ...contenido,
                        _id: contenido.id || contenido._id
                    }))
                }))
            };
            
            // Actualizar estado si se proporcionó setCarrera
            if (setCarrera && typeof setCarrera === 'function') {
                setCarrera(carreraFormateada);
            }
            
           
            return carreraFormateada;
            
        } else {
            throw new Error(resp.data.msg || 'Error en la respuesta del servidor');
        }
        
    } catch (error) {
        console.error('❌ Error al cargar carrera completa:', error);
        
        // Manejo de errores con SweetAlert
        let errorMessage = 'Error al cargar la carrera';
        
        if (error.response) {
            // Error de respuesta del servidor
            errorMessage = error.response.data?.msg || `Error ${error.response.status}`;
            
            if (error.response.status === 404) {
                errorMessage = 'Carrera no encontrada';
            }
        } else if (error.message) {
            errorMessage = error.message;
        }
        
        // Mostrar alerta
        Swal.fire({
            title: 'ERROR',
            text: errorMessage,
            icon: 'error',
            background: '#f9f9f9',
            confirmButtonColor: '#ffc107',
            customClass: {
                title: 'swal2-title-custom',
                content: 'swal2-content-custom',
                confirmButton: 'swal2-confirm-custom',
            },
        });
        
        // Manejo de error 401 (no autenticado)
        if (error.response?.status === 401 && navigate) {
            localStorage.removeItem('token');
            navigate('/login');
        }
        
        // Retornar null para indicar error
        return null;
    }
};

// Versión alternativa si solo necesitas obtener la carrera sin setState
export const obtenerCarreraCompleta = async (carreraId, navigate) => {
    return CargarCarreraCompleta(carreraId, null, navigate);
};