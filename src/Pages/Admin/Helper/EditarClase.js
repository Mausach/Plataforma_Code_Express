// Helper/ClasesHelper.js
import Swal from 'sweetalert2';
import authApi from "../../../api/authApi";


export const actualizarClase = async (claseId, datosClase, setRefreshData, navigate, theme = 'lights') => {
    try {
    

        const resp = await authApi.put(`/admin/clases/${claseId}`, datosClase);

       

        // SweetAlert de éxito
        await Swal.fire({
            title: "✅ Clase actualizada",
            text: resp.data.msg || "Los cambios han sido guardados correctamente.",
            icon: "success",
            timer: 2000,
            timerProgressBar: true,
            showConfirmButton: false,
            background: theme === 'lights' ? '#FAF3E1' : '#0A0E17',
            color: theme === 'lights' ? '#353432' : '#ebe5e5',
        });

        // Refrescar datos si se proporcionó la función
        if (setRefreshData && typeof setRefreshData === 'function') {
            setRefreshData(true);
        }

        return {
            success: true,
            data: resp.data.data,
            message: resp.data.msg
        };

    } catch (error) {
        console.error('❌ Error en actualizarClase:', {
            status: error.response?.status,
            data: error.response?.data,
            message: error.message
        });

        // Obtener mensaje de error
        let errorMessage = error.response?.data?.msg || 'Error al actualizar la clase';
        
        // Si hay errores de validación específicos
        if (error.response?.data?.errors) {
            errorMessage = error.response.data.errors.join(', ');
        }

        // SweetAlert de error
        await Swal.fire({
            title: "❌ Error",
            text: errorMessage,
            icon: "error",
            confirmButtonText: 'Aceptar',
            background: theme === 'lights' ? '#FAF3E1' : '#0A0E17',
            color: theme === 'lights' ? '#353432' : '#ebe5e5',
            confirmButtonColor: theme === 'lights' ? '#dc3545' : '#e83e8c',
        });

        // Manejar sesión expirada
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            if (navigate && typeof navigate === 'function') {
                navigate('/login');
            }
        }

        return {
            success: false,
            error: errorMessage,
            status: error.response?.status
        };
    }
};