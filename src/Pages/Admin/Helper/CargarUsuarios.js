import Swal from "sweetalert2";
import authApi from "../../../api/authApi";


export const CargarUsuarios = async (setUsers, navigate) => {
    try {
      const resp = await authApi.get('/admin/get-users'); // Petición al backend
  
      // Validar si la respuesta contiene un array de usuarios
      if (Array.isArray(resp.data.usuarios)) {
        setUsers(resp.data.usuarios); // Actualiza el estado con los usuarios
      } else {
        console.error('Los datos de los usuarios no son un array:', resp.data);
      }
    } catch (error) {
      console.log(error.response?.data?.msg || 'Error desconocido al cargar usuarios');
      
      Swal.fire({
        title: 'ERROR',
        text: error.response?.data?.msg || 'Ocurrió un error inesperado.',
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
      if (error.response?.status === 401) {
        localStorage.removeItem('token'); // Elimina el token
        navigate('/login'); // Redirige al login
      }
    }
  };