// Helper/CargarInscripciones.js - VERSIÓN FINAL CORREGIDA
import Swal from "sweetalert2";
import authApi from "../../../api/authApi";

export const CargarInscripciones = async (comisionId, setInscripciones, navigate, options = {}) => {
    try {
        const { signal } = options;
        
    
        
        const resp = await authApi.get(`/admin/comisiones/${comisionId}/inscripciones-completas`, {
            signal
        });



        // Validar que hay respuesta
        if (!resp.data) {
            throw new Error('El servidor no devolvió datos');
        }

        // Si el backend indica error (success: false)
        if (resp.data.success === false) {
            throw new Error(resp.data.msg || resp.data.error || 'Error del servidor');
        }
        
        // Si llegamos aquí, success es true
        setInscripciones({
            alumnos: Array.isArray(resp.data.alumnos) ? resp.data.alumnos : [],
            profesores: Array.isArray(resp.data.profesores) ? resp.data.profesores : [],
            total: resp.data.total || 0,
            isLoading: false,
            error: null
        });
        
     
        
    } catch (error) {
        // ✅ PRIMERO VERIFICAR SI ES ABORT ERROR O "canceled"
        if (error.name === 'AbortError' || error.message === 'canceled') {
            console.log('⏹️ Petición cancelada normalmente (AbortController)');
            return; // Salir silenciosamente, NO actualizar estado
        }
        
        console.log('💥 ERROR REAL en CargarInscripciones:', {
            name: error.name,
            message: error.message,
            status: error.response?.status,
            data: error.response?.data
        });
        
        // Manejo de error 401 (no autenticado)
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            navigate('/login');
            return;
        }
        
        // Manejo de error 404 (no encontrado)
        if (error.response?.status === 404) {
            console.log('Comisión no encontrada, inicializando datos vacíos');
            setInscripciones({
                alumnos: [],
                profesores: [],
                total: 0,
                isLoading: false,
                error: null  // ← No es error, es comisión sin inscripciones
            });
            return;
        }
        
        // Para otros errores
        const mensajeError = error.response?.data?.msg || 
                           error.response?.data?.error || 
                           error.message || 
                           'Error al cargar las inscripciones';
        
        // Actualizar estado con error
        setInscripciones({
            alumnos: [],
            profesores: [],
            total: 0,
            isLoading: false,
            error: mensajeError
        });
        
        // Solo mostrar SweetAlert para errores críticos
        const esErrorCritico = !mensajeError.toLowerCase().includes('no hay') &&
                              !mensajeError.toLowerCase().includes('vacío') &&
                              !mensajeError.toLowerCase().includes('encontrado');
        
        if (esErrorCritico) {
            Swal.fire({
                title: 'ERROR',
                text: mensajeError,
                icon: 'error',
                background: '#f9f9f9',
                confirmButtonColor: '#ffc107',
                customClass: {
                    title: 'swal2-title-custom',
                    content: 'swal2-content-custom',
                    confirmButton: 'swal2-confirm-custom',
                },
            });
        }
    }
};