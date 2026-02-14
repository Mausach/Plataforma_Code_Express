import Swal from "sweetalert2";
import authApi from "../../../api/authApi";


export const starCrearUsuario = async (newUser,setRefreshData, navigate) => {
    try {
        const resp = await authApi.post('/admin/new-user', newUser);

        Swal.fire({
            title: "Usuario creado",
            text: "El usuario ha sido creado exitosamente.",
            icon: "success",
            background: "#f9f9f9",
            confirmButtonColor: "#ffc107",
            customClass: {
              title: "swal2-title-custom",
              content: "swal2-content-custom",
              confirmButton: "swal2-confirm-custom",
            },
          });
        
          setRefreshData(true)

    } catch (error) {
        // Asegúrate de acceder correctamente a los errores
                      const errores = error.response?.data?.errors; // Obtén todos los errores
              
                      // Si tienes errores, muestra el mensaje de uno de los campos
                      if (errores) {
                          // Obtener el primer mensaje de error (puedes personalizar esto según el comportamiento)
                          const mensajeDeError = Object.values(errores)[0]?.msg || 'Error al crear el usuario';
                          console.log(mensajeDeError);
              
                          Swal.fire({
                              title: "ERROR",
                              text: mensajeDeError,
                              icon: "error",
                              background: "#f9f9f9",
                              confirmButtonColor: "#ffc107",
                              customClass: {
                                  title: "swal2-title-custom",
                                  content: "swal2-content-custom",
                                  confirmButton: "swal2-confirm-custom",
                              },
                          });
                      } else {
                          // Si no hay errores, usar el mensaje genérico
                          const errorMessage = error.response?.data?.msg || 'Error al crear el usuario';
                          Swal.fire({
                              title: "ERROR",
                              text: errorMessage,
                              icon: "error",
                              background: "#f9f9f9",
                              confirmButtonColor: "#ffc107",
                              customClass: {
                                  title: "swal2-title-custom",
                                  content: "swal2-content-custom",
                                  confirmButton: "swal2-confirm-custom",
                              },
                          });
                      }
              
                      // Verificar si el error es una sesión expirada (401) y redirigir al login
                      if (error.response?.status === 401) {
                          localStorage.removeItem('token');
                          navigate('/login');
                      }
  
        
    }

}