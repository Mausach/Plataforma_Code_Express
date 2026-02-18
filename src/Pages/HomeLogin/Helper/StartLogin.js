import Swal from 'sweetalert2';
import authApi from '../../../api/authApi';

export const starLogin = async (email, password, onLoginSuccess) => {  // ← Recibimos onLoginSuccess
    try {
        // 1. Realizar petición al backend
        const resp = await authApi.post('/auth/login', {
            email,
            password
        });

        // 2. Guardar token en localStorage
        localStorage.setItem('token', resp.data.token);

        // 3. Obtener rol y datos del usuario
        const userRole = resp.data.rol;
        const userData = resp.data.usuario;

        // 4. Llamar al callback con los datos necesarios
        onLoginSuccess(userRole, userData);  // ← Usamos el callback en lugar de navigate directo

    } catch (error) {
        // 5. Manejo de errores
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

        // 6. Limpiar token si hay error 401
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
        }
    }
};