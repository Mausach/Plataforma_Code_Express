// Helper/CrearComision.js - VERSIÓN CORREGIDA PARA TU ESTRUCTURA
import Swal from "sweetalert2";
import authApi from "../../../api/authApi";

export const starCrearComision = async (datosEnviar, setRefreshData, navigate, theme = 'lights') => {
    try {
        
        
        // El componente puede enviarlo como 'carrera' o 'carrera_id'
        const carreraId = datosEnviar.carrera_id || datosEnviar.carrera;
        
    
        
        if (!carreraId || carreraId === '' || carreraId === 'null' || carreraId === 'undefined') {
            throw new Error('No se ha seleccionado una carrera válida');
        }

        // Preparar datos EXACTAMENTE como los espera el método del backend
        const datosParaEnviar = {
            nombre: datosEnviar.nombre?.trim(),
            fecha_inicio: datosEnviar.fecha_inicio,
            fecha_fin: datosEnviar.fecha_fin,
            carrera_id: carreraId, // ← IMPORTANTE: el método espera 'carrera_id'
            modalidad: datosEnviar.modalidad || 'Full-Time',
            dias_semana: Array.isArray(datosEnviar.dias_semana) 
                ? [...datosEnviar.dias_semana].sort((a, b) => a - b)
                : [], // Puede ser array vacío
            hora_inicio: datosEnviar.hora_inicio || null, // Puede ser null si no hay horario
            hora_fin: datosEnviar.hora_fin || null, // Puede ser null si no hay horario
            estado: datosEnviar.estado || 'Programada',
            //coordinador_id: datosEnviar.coordinador_id || null,
            creado_por: datosEnviar.creado_por || null // El método lo hace opcional
        };

        console.log('📤 Datos que se enviarán al backend:', datosParaEnviar);

        const resp = await authApi.post('/admin/new-comision', datosParaEnviar);

        

        if (resp.data.ok) {
            // Mensaje de éxito adaptado al tema
            Swal.fire({
                title: "✅ Comisión creada",
                text: "La comisión se ha creado exitosamente.",
                icon: "success",
                background: theme === 'lights' ? '#f9f9f9' : '#1a1d29',
                color: theme === 'lights' ? '#333' : '#eee',
                confirmButtonColor: "#EF7F1A"
            });
            
            // Refrescar datos
            if (setRefreshData && typeof setRefreshData === 'function') {
                setRefreshData(true);
            }

            // Retornar la respuesta estructurada para el paso 2
            return {
                ok: true,
                comision: {
                    id: resp.data.comision?._id || resp.data.comision?.id,
                    nombre: resp.data.comision?.nombre,
                    estado: resp.data.comision?.estado,
                    modalidad: resp.data.comision?.modalidad,
                    fecha_inicio: resp.data.comision?.fecha_inicio,
                    fecha_fin: resp.data.comision?.fecha_fin,
                    total_modulos: resp.data.comision?.total_modulos || 0,
                    necesita_clases: resp.data.comision?.necesita_clases || 
                                   (datosParaEnviar.dias_semana.length > 0)
                },
                datos_originales: datosParaEnviar
            };
        } else {
            // Si el backend responde con ok: false
            throw new Error(resp.data.msg || 'Error al crear comisión');
        }

    } catch (error) {
        console.error('❌ Error completo en starCrearComision:', error);
        console.error('❌ Error response:', error.response?.data);
        
        let mensajeError = 'Error al crear la comisión.';
        
        // Manejo específico de errores
        if (error.response?.data) {
            const data = error.response.data;
            
            // Si hay errores de validación individuales (express-validator)
            if (data.errors) {
                const primerError = Object.values(data.errors)[0];
                mensajeError = primerError?.msg || 'Error de validación';
            } 
            // Si hay un mensaje general
            else if (data.msg) {
                mensajeError = data.msg;
            }
            // Si hay un error general
            else if (data.error) {
                mensajeError = data.error;
            }
            // Si hay errores en el campo 'erros' (puede ser 'erros' en lugar de 'errors')
            else if (data.erros) {
                const primerError = Object.values(data.erros)[0];
                mensajeError = primerError?.msg || 'Error de validación';
            }
        } else if (error.message) {
            mensajeError = error.message;
        }

        // Mensaje de error con tema
        Swal.fire({
            title: "❌ Error",
            text: mensajeError,
            icon: "error",
            background: theme === 'lights' ? '#f9f9f9' : '#1a1d29',
            color: theme === 'lights' ? '#333' : '#eee',
            confirmButtonColor: "#dc3545"
        });
        
        // Verificar si el error es una sesión expirada (401)
        if (error.response?.status === 401) {
            console.warn('⚠️ Sesión expirada, redirigiendo a login');
            localStorage.removeItem('token');
            sessionStorage.removeItem('token');
            navigate('/login');
            return { ok: false, redirigir: true };
        }
        
        // Relanzar el error para que pueda ser capturado por el modal
        throw new Error(mensajeError);
    }
};