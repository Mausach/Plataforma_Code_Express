// Helper/CargarEntregasUsuario.js
import Swal from "sweetalert2";
import authApi from "../../../api/authApi";

/**
 * Carga todas las entregas de un usuario específico
 */
export const CargarEntregasUsuario = async (usuarioId, setEntregas, navigate, options = {}) => {
    try {
        const { signal, filtros = {} } = options;
        
        
        // Construir query string con filtros
        const queryParams = new URLSearchParams();
        if (filtros.comision_id) queryParams.append('comision_id', filtros.comision_id);
        if (filtros.estado) queryParams.append('estado', filtros.estado);
        if (filtros.tipo) queryParams.append('tipo', filtros.tipo);
        if (filtros.page) queryParams.append('page', filtros.page);
        if (filtros.limit) queryParams.append('limit', filtros.limit);
        
        const queryString = queryParams.toString();
        const url = `/auth/entregas/usuario/${usuarioId}${queryString ? `?${queryString}` : ''}`;
        
        
        const resp = await authApi.get(url, { signal });


        // Validar que hay respuesta
        if (!resp.data) {
            throw new Error('El servidor no devolvió datos');
        }

        // Si el backend indica error (ok: false)
        if (resp.data.ok === false) {
            throw new Error(resp.data.msg || resp.data.error || 'Error del servidor');
        }
        
        // Si llegamos aquí, ok es true
        setEntregas({
            usuario_id: resp.data.usuario_id || usuarioId,
            total_entregas: resp.data.total_entregas || 0,
            entregas_por_comision: Array.isArray(resp.data.entregas_por_comision) ? resp.data.entregas_por_comision : [],
            paginacion: resp.data.paginacion || {
                total: 0,
                pagina_actual: 1,
                total_paginas: 1,
                limite: 20
            },
            isLoading: false,
            error: null
        });
        
       
        
    } catch (error) {
        // ✅ PRIMERO VERIFICAR SI ES ABORT ERROR O "canceled"
        if (error.name === 'AbortError' || error.message === 'canceled') {
            console.log('⏹️ Petición cancelada normalmente (AbortController)');
            return; // Salir silenciosamente, NO actualizar estado
        }
        
        console.log('💥 ERROR REAL en CargarEntregasUsuario:', {
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
            console.log('Usuario no encontrado o sin entregas, inicializando datos vacíos');
            setEntregas({
                usuario_id: usuarioId,
                total_entregas: 0,
                entregas_por_comision: [],
                paginacion: {
                    total: 0,
                    pagina_actual: 1,
                    total_paginas: 1,
                    limite: 20
                },
                isLoading: false,
                error: null  // ← No es error, es usuario sin entregas
            });
            return;
        }
        
        // Para otros errores
        const mensajeError = error.response?.data?.msg || 
                           error.response?.data?.error || 
                           error.message || 
                           'Error al cargar las entregas del usuario';
        
        // Actualizar estado con error
        setEntregas({
            usuario_id: usuarioId,
            total_entregas: 0,
            entregas_por_comision: [],
            paginacion: {
                total: 0,
                pagina_actual: 1,
                total_paginas: 1,
                limite: 20
            },
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