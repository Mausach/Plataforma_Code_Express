// Helper/CargarEntregasComision.js
import Swal from "sweetalert2";
import authApi from "../../../api/authApi";

/**
 * Carga todas las entregas de una comisión específica
 * @param {string} comisionId - ID de la comisión
 * @param {function} setEntregas - Función para actualizar estado
 * @param {function} navigate - Función de navegación (para redirigir en 401)
 * @param {Object} options - Opciones adicionales (signal, filtros)
 * @param {Object} options.filtros - Filtros adicionales (estado, tipo, alumno_id, etc)
 */
export const CargarEntregasComision = async (comisionId, setEntregas, navigate, options = {}) => {
    try {
        const { signal, filtros = {} } = options;
        
       
        
        // Construir query string con filtros
        const queryParams = new URLSearchParams();
        if (filtros.estado) queryParams.append('estado', filtros.estado);
        if (filtros.tipo) queryParams.append('tipo', filtros.tipo);
        if (filtros.alumno_id) queryParams.append('alumno_id', filtros.alumno_id);
        if (filtros.desde) queryParams.append('desde', filtros.desde);
        if (filtros.hasta) queryParams.append('hasta', filtros.hasta);
        if (filtros.page) queryParams.append('page', filtros.page);
        if (filtros.limit) queryParams.append('limit', filtros.limit);
        if (filtros.ordenar_por) queryParams.append('ordenar_por', filtros.ordenar_por);
        if (filtros.orden) queryParams.append('orden', filtros.orden);
        
        const queryString = queryParams.toString();
        const url = `/admin/entregas/comision/${comisionId}${queryString ? `?${queryString}` : ''}`;
        
       
        
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
            comision: resp.data.comision || { id: comisionId, nombre: '' },
            entregas: Array.isArray(resp.data.entregas) ? resp.data.entregas : [],
            paginacion: resp.data.paginacion || {
                total: 0,
                pagina_actual: 1,
                total_paginas: 1,
                limite: 50
            },
            metricas: resp.data.metricas || null,
            isLoading: false,
            error: null
        });
        
        console.log('📊 Estado actualizado con datos del backend');
        
    } catch (error) {
        // ✅ PRIMERO VERIFICAR SI ES ABORT ERROR O "canceled"
        if (error.name === 'AbortError' || error.message === 'canceled') {
            console.log('⏹️ Petición cancelada normalmente (AbortController)');
            return; // Salir silenciosamente, NO actualizar estado
        }
        
        console.log('💥 ERROR REAL en CargarEntregasComision:', {
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
            setEntregas({
                comision: { id: comisionId, nombre: '' },
                entregas: [],
                paginacion: {
                    total: 0,
                    pagina_actual: 1,
                    total_paginas: 1,
                    limite: 50
                },
                metricas: null,
                isLoading: false,
                error: null  // ← No es error, es comisión sin entregas
            });
            return;
        }
        
        // Para otros errores
        const mensajeError = error.response?.data?.msg || 
                           error.response?.data?.error || 
                           error.message || 
                           'Error al cargar las entregas';
        
        // Actualizar estado con error
        setEntregas({
            comision: { id: comisionId, nombre: '' },
            entregas: [],
            paginacion: {
                total: 0,
                pagina_actual: 1,
                total_paginas: 1,
                limite: 50
            },
            metricas: null,
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