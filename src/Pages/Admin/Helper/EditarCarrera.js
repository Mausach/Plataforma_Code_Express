// Helper/starEditarCarrera.js
import Swal from "sweetalert2";
import authApi from "../../../api/authApi"; // Ajusta la ruta según tu estructura

export const starEditarCarrera = async (updatedCarrera, setRefreshData, navigate, theme) => {
    try {
        const resp = await authApi.put('/admin/update-carrera', updatedCarrera);

        Swal.fire({
            title: "¡Carrera actualizada!",
            text: "Los cambios han sido guardados correctamente.",
            icon: "success",
            background: theme === 'lights' ? '#FAF3E1' : '#0A0E17',
            color: theme === 'lights' ? '#353432' : '#ebe5e5',
            confirmButtonColor: '#EF7F1A'
        });
        
        setRefreshData(true);
        return resp.data;

    } catch (error) {
        console.log("Error al editar carrera:", error.response || error);
        const errorMessage = error.response?.data?.msg || 'Error al editar la carrera';
    
        Swal.fire({
            title: "Error",
            text: errorMessage,
            icon: "error",
            background: theme === 'lights' ? '#FAF3E1' : '#0A0E17',
            color: theme === 'lights' ? '#353432' : '#ebe5e5',
            confirmButtonColor: '#EF7F1A'
        });
        
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            navigate('/login');
        }
        
        throw error;
    }
};