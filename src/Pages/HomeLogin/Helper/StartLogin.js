import Swal from 'sweetalert2';
import authApi from '../../../api/authApi';

export const starLogin = async (email, password, navigate) => {
  try {
    // 1. Realizar petición al backend
    const resp = await authApi.post('/auth/login', {
      email, // Campo actualizado (antes era solo email)
      password
    });

    // 2. Guardar token en localStorage
    localStorage.setItem('token', resp.data.token);

    // 3. Mapeo de roles a rutas (actualizado según tus roles)
    const roleRoutes = {
    admin: '/admin',
      acompañante: '/admin',
      cordinador: '/admin',//prueba par ano hacer mas componentes jsx
      corrector: '/profe',
      profe: '/profe',
      alumno: '/Alumno',
    };

    const userRole = resp.data.rol;

    // 4. Redirección según rol
    if (roleRoutes[userRole]) {
      navigate(roleRoutes[userRole],{ state: resp.data.usuario });
    } else {
      // Rol no reconocido
      Swal.fire({
        title: 'Acceso denegado',
        text: 'Tu rol no tiene asignada una ruta de acceso.',
        icon: 'error',
        background: '#f9f9f9',
        confirmButtonColor: '#ffc107'
      });
      localStorage.removeItem('token'); // Limpiar token si el rol no es válido
    }

  } catch (error) {
    // 5. Manejo de errores (mejorado)
    const errorMessage = error.response?.data?.msg || 
                        error.response?.data?.errors?.[0]?.msg || 
                        'Error al iniciar sesión. Intente nuevamente.';

    console.error('Error en login:', error.response?.data || error.message);

    Swal.fire({
      title: "Error",
      text: errorMessage,
      icon: "error",
      background: "#f9f9f9",
      confirmButtonColor: "#ffc107"
    });

    // 6. Limpiar token si hay error 401 (No autorizado)
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
    }
  }
};