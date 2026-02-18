import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Row, Col, Spinner, Alert, Badge } from 'react-bootstrap';
import Swal from 'sweetalert2';
import { CargarCarreras } from '../../Helper/CargarCarreras';
import { starCrearComision } from '../../Helper/CrearComision';
import { generarClasesParaComision } from '../../Helper/CrearClases';

export const ModalCrearComision = ({
  show,
  handleClose,
  setRefreshData,
  navigate,
  theme
}) => {
  // Estado para los datos de la comisión
  const [newComision, setNewComision] = useState({
    nombre: '',
    fecha_inicio: '',
    fecha_fin: '',
    carrera_id: '',
    modalidad: '',
    dias_semana: [1, 3, 5],
    hora_inicio: '18:00',
    hora_fin: '22:00',
    estado: 'Programada'
  });

  // Estado para datos de la carrera seleccionada
  const [carreraSeleccionada, setCarreraSeleccionada] = useState(null);
  const [carreraCargando, setCarreraCargando] = useState(false);

  // Estados para el proceso
  const [pasoActual, setPasoActual] = useState(1);
  const [comisionCreada, setComisionCreada] = useState(null);
  const [generando, setGenerando] = useState(false);
  const [clasesGeneradas, setClasesGeneradas] = useState(null);

  // Estado para las carreras disponibles
  const [carreras, setCarreras] = useState([]);
  const [loadingCarreras, setLoadingCarreras] = useState(false);
  const [errorCarreras, setErrorCarreras] = useState(null);

  // Días de la semana con sus números y colores
  const diasSemana = [
    { id: 1, label: 'Lunes', value: 1, abbr: 'L' },
    { id: 2, label: 'Martes', value: 2, abbr: 'M' },
    { id: 3, label: 'Miércoles', value: 3, abbr: 'X' },
    { id: 4, label: 'Jueves', value: 4, abbr: 'J' },
    { id: 5, label: 'Viernes', value: 5, abbr: 'V' },
    { id: 6, label: 'Sábado', value: 6, abbr: 'S' },
    { id: 0, label: 'Domingo', value: 0, abbr: 'D' }
  ];

  // Colores según tema
  const colors = {
    primary: '#EF7F1A',
    primaryHover: '#d96f0e',
    text: theme === 'lights' ? '#353432' : '#ebe5e5',
    background: theme === 'lights' ? '#f8f9fa' : '#2a3042',
    border: theme === 'lights' ? '#353432' : '#ebe5e5',
    cardBg: theme === 'lights' ? '#FAF3E1' : '#0A0E17',
    inputBg: theme === 'lights' ? '#ffffff' : '#1e2330',
    disabledBg: theme === 'lights' ? '#e9ecef' : '#363c4e',
    checkboxBg: theme === 'lights' ? '#ffffff' : '#1e2330',
    checkboxBorder: theme === 'lights' ? '#ced4da' : '#4a515e',
  };

  // Clases CSS dinámicas
  const cardClass = theme === 'lights' ? 'card-light' : 'card-dark';
  const textClass = theme === 'lights' ? 'text-dark' : 'text-light';
  const formControlClass = theme === 'lights' ? 'bg-white text-dark' : 'bg-dark text-light';
  const borderColor = colors.border;
  const titleColor = colors.primary;

  // ===== ESTILOS PERSONALIZADOS PARA CHECKBOXES =====
  const checkboxStyles = {
    container: {
      display: 'flex',
      flexWrap: 'wrap',
      gap: '0.5rem',
      marginTop: '0.5rem'
    },
    checkbox: {
      // Versión 1: Checkbox cuadrado con texto
      square: (isChecked) => ({
        padding: '0.5rem 1rem',
        backgroundColor: isChecked ? colors.primary : colors.checkboxBg,
        color: isChecked ? '#ffffff' : colors.text,
        border: `2px solid ${isChecked ? colors.primary : colors.checkboxBorder}`,
        borderRadius: '8px',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        userSelect: 'none',
        fontWeight: isChecked ? 'bold' : 'normal',
        boxShadow: isChecked ? `0 2px 8px ${colors.primary}40` : 'none',
        minWidth: '80px',
        textAlign: 'center'
      }),
      // Versión 2: Checkbox circular (alternativa)
      circle: (isChecked) => ({
        width: '40px',
        height: '40px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: isChecked ? colors.primary : colors.checkboxBg,
        color: isChecked ? '#ffffff' : colors.text,
        border: `2px solid ${isChecked ? colors.primary : colors.checkboxBorder}`,
        borderRadius: '50%',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        fontWeight: 'bold',
        boxShadow: isChecked ? `0 2px 8px ${colors.primary}40` : 'none'
      })
    }
  };

  // ===== EFECTOS =====

  // Cargar carreras cuando se abre el modal
  useEffect(() => {
    if (!show) return;

    const controller = new AbortController();
    const { signal } = controller;
    const timeoutId = setTimeout(() => controller.abort(), 15000);

    const cargarDatos = async () => {
      try {
        setLoadingCarreras(true);
        setErrorCarreras(null);
        await CargarCarreras(setCarreras, navigate, { signal });
      } catch (error) {
        if (error.name !== 'AbortError') {
          setErrorCarreras("Error al cargar las carreras. Contacte soporte.");
          console.error('Error al cargar carreras:', error);
        }
      } finally {
        clearTimeout(timeoutId);
        setLoadingCarreras(false);
      }
    };

    cargarDatos();

    return () => {
      controller.abort();
      clearTimeout(timeoutId);
    };
  }, [show, navigate]);

  // Cargar datos de carrera cuando se selecciona
  useEffect(() => {
    const cargarDatosCarrera = async () => {
      if (!newComision.carrera_id) {
        setCarreraSeleccionada(null);
        setNewComision(prev => ({ ...prev, modalidad: '' }));
        return;
      }

      try {
        setCarreraCargando(true);
        const carrera = carreras.find(c => c._id === newComision.carrera_id);
        
        if (carrera) {
          setCarreraSeleccionada(carrera);
          
          let modalidadComision = 'Full-Time';
          if (carrera.modalidad === 'part-time') {
            modalidadComision = 'Part-Time';
          } else if (carrera.modalidad === 'full-time') {
            modalidadComision = 'Full-Time';
          }
          
          setNewComision(prev => ({
            ...prev,
            modalidad: modalidadComision
          }));
        }
      } catch (error) {
        console.error('Error al cargar datos de carrera:', error);
      } finally {
        setCarreraCargando(false);
      }
    };

    cargarDatosCarrera();
  }, [newComision.carrera_id, carreras]);

  // Resetear todo cuando se cierra el modal
  useEffect(() => {
    if (!show) {
      resetForm();
    }
  }, [show]);

  // ===== MANEJADORES =====

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (type === 'checkbox') {
      if (name === 'dias_semana') {
        const numValue = parseInt(value);
        setNewComision(prev => {
          const newDias = checked
            ? [...prev.dias_semana, numValue]
            : prev.dias_semana.filter(dia => dia !== numValue);
          return { ...prev, dias_semana: newDias.sort((a, b) => a - b) };
        });
      }
    } else {
      setNewComision(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  // Manejador personalizado para los checkboxes personalizados
  const handleDiaClick = (diaValue) => {
    setNewComision(prev => {
      const isSelected = prev.dias_semana.includes(diaValue);
      const newDias = isSelected
        ? prev.dias_semana.filter(dia => dia !== diaValue)
        : [...prev.dias_semana, diaValue];
      return { ...prev, dias_semana: newDias.sort((a, b) => a - b) };
    });
  };

  // ===== CREAR COMISIÓN Y CLASES =====
  const handleCrearComision = async (e) => {
    e.preventDefault();

    console.log('🔍 Datos antes de crear:', newComision);

    // Validaciones básicas
    if (!newComision.nombre.trim() || !newComision.fecha_inicio || 
        !newComision.fecha_fin || !newComision.carrera_id) {
      mostrarError('Todos los campos marcados con * son obligatorios.');
      return;
    }

    if (newComision.nombre.length < 3) {
      mostrarError('El nombre debe tener al menos 3 caracteres.');
      return;
    }

    // Validar fechas
    const fechaInicio = new Date(newComision.fecha_inicio);
    const fechaFin = new Date(newComision.fecha_fin);
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    if (fechaInicio < hoy) {
      mostrarError('La fecha de inicio no puede ser en el pasado.');
      return;
    }

    if (fechaFin <= fechaInicio) {
      mostrarError('La fecha de fin debe ser posterior a la fecha de inicio.');
      return;
    }

    // Validar horario
    if (newComision.dias_semana.length === 0) {
      mostrarError('Debe seleccionar al menos un día de clase.');
      return;
    }

    if (!newComision.hora_inicio || !newComision.hora_fin) {
      mostrarError('Debe especificar horario de inicio y fin.');
      return;
    }

    if (newComision.hora_inicio >= newComision.hora_fin) {
      mostrarError('La hora de inicio debe ser anterior a la hora de fin.');
      return;
    }

    try {
      setGenerando(true);

      const obtenerIdUsuario = () => {
        try {
          const token = localStorage.getItem('token') || sessionStorage.getItem('token');
          if (token) {
            const payload = JSON.parse(atob(token.split('.')[1]));
            return payload.id || payload.uid || payload.userId || payload._id;
          }
        } catch (error) {
          console.warn('⚠️ Error al obtener ID del usuario:', error);
        }
        return null;
      };

      const usuarioId = obtenerIdUsuario();

      const comisionData = {
        nombre: newComision.nombre.trim(),
        fecha_inicio: newComision.fecha_inicio,
        fecha_fin: newComision.fecha_fin,
        carrera_id: newComision.carrera_id,
        modalidad: newComision.modalidad,
        dias_semana: [...newComision.dias_semana].sort((a, b) => a - b),
        hora_inicio: newComision.hora_inicio,
        hora_fin: newComision.hora_fin,
        estado: newComision.estado,
        creado_por: usuarioId
      };

      console.log('📤 Creando comisión con datos:', comisionData);

      const resultadoComision = await starCrearComision(
        comisionData, 
        setRefreshData, 
        navigate,
        theme
      );

      if (!resultadoComision.ok) {
        throw new Error(resultadoComision.msg || 'Error al crear comisión');
      }

      setComisionCreada(resultadoComision.comision);
      console.log('✅ Comisión creada:', resultadoComision.comision);

      // Paso 2: Generar clases automáticamente
      if (newComision.dias_semana.length > 0) {
        Swal.fire({
          icon: 'info',
          title: 'Generando clases...',
          text: 'Por favor espere mientras se generan las clases.',
          background: colors.cardBg,
          color: colors.text,
          showConfirmButton: false,
          allowOutsideClick: false,
          didOpen: () => {
            Swal.showLoading();
          }
        });

        const datosClases = {
          dias_semana: newComision.dias_semana,
          hora_inicio: newComision.hora_inicio,
          hora_fin: newComision.hora_fin
        };

        const resultadoClases = await generarClasesParaComision(
          resultadoComision.comision.id,
          datosClases,
          navigate,
          theme
        );

        Swal.close();

        if (resultadoClases.ok) {
          setClasesGeneradas(resultadoClases);
          
          const totalClases = calcularEstimacionClases();
          const primeraClase = new Date(newComision.fecha_inicio);
          const ultimaClase = new Date(newComision.fecha_fin);
          
          while (!newComision.dias_semana.includes(primeraClase.getDay())) {
            primeraClase.setDate(primeraClase.getDate() + 1);
          }
          
          while (!newComision.dias_semana.includes(ultimaClase.getDay())) {
            ultimaClase.setDate(ultimaClase.getDate() - 1);
          }

          Swal.fire({
            icon: 'success',
            title: '✅ ¡Todo listo!',
            html: `
              <div class="text-start" style="color: ${colors.text}">
                <p><strong>Comisión creada:</strong> ${resultadoComision.comision.nombre}</p>
                <p><strong>Clases generadas:</strong> ${resultadoClases.total_clases || totalClases}</p>
                <p><strong>Primera clase:</strong> ${primeraClase.toLocaleDateString()}</p>
                <p><strong>Última clase:</strong> ${ultimaClase.toLocaleDateString()}</p>
                <p><strong>Horario:</strong> ${newComision.hora_inicio} - ${newComision.hora_fin}</p>
                <p><strong>Días:</strong> ${newComision.dias_semana
                  .sort((a, b) => a - b)
                  .map(dia => ['Domingo', 'Lunes', 'Martes', 'Miércoles', 
                               'Jueves', 'Viernes', 'Sábado'][dia])
                  .join(', ')}</p>
              </div>
            `,
            background: colors.cardBg,
            color: colors.text,
            confirmButtonColor: colors.primary,
            confirmButtonText: 'Aceptar'
          }).then(() => {
            resetForm();
            handleClose();
          });
        } else {
          Swal.fire({
            icon: 'warning',
            title: 'Comisión creada',
            html: `
              <div class="text-start" style="color: ${colors.text}">
                <p><strong>Comisión creada:</strong> ${resultadoComision.comision.nombre}</p>
                <p><strong>Error al generar clases:</strong> ${resultadoClases.msg || 'No se pudieron generar las clases'}</p>
                <p>Puede generarlas más tarde desde la gestión de comisiones.</p>
              </div>
            `,
            background: colors.cardBg,
            color: colors.text,
            confirmButtonColor: colors.primary
          }).then(() => {
            resetForm();
            handleClose();
          });
        }
      }

    } catch (error) {
      console.error('❌ Error en handleCrearComision:', error);
      Swal.close();
      mostrarError(error.message || 'Error al crear la comisión.');
    } finally {
      setGenerando(false);
    }
  };

  const resetForm = () => {
    setNewComision({
      nombre: '',
      fecha_inicio: '',
      fecha_fin: '',
      carrera_id: '',
      modalidad: '',
      dias_semana: [1, 3, 5],
      hora_inicio: '18:00',
      hora_fin: '22:00',
      estado: 'Programada'
    });
    setCarreraSeleccionada(null);
    setPasoActual(1);
    setComisionCreada(null);
    setClasesGeneradas(null);
    setGenerando(false);
  };

  const mostrarError = (mensaje) => {
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: mensaje,
      background: colors.cardBg,
      color: colors.text,
      confirmButtonColor: '#dc3545'
    });
  };

  // Calcular estimación de clases
  const calcularEstimacionClases = () => {
    if (!newComision.fecha_inicio || !newComision.fecha_fin || newComision.dias_semana.length === 0) {
      return 0;
    }

    const inicio = new Date(newComision.fecha_inicio);
    const fin = new Date(newComision.fecha_fin);
    const diasSeleccionados = newComision.dias_semana;
    
    let totalClases = 0;
    let fechaActual = new Date(inicio);
    
    while (fechaActual <= fin) {
      if (diasSeleccionados.includes(fechaActual.getDay())) {
        totalClases++;
      }
      fechaActual.setDate(fechaActual.getDate() + 1);
    }
    
    return totalClases;
  };

  // ===== RENDERIZADO =====

  const renderPaso1 = () => (
    <>
      <h5 style={{ color: titleColor, marginBottom: '1rem' }}>
        Crear Nueva Comisión
      </h5>

      <Row>
        <Col md={6}>
          <Form.Group className="mb-3">
            <Form.Label style={{ color: colors.text }}>Nombre de la Comisión *</Form.Label>
            <Form.Control
              type="text"
              name="nombre"
              value={newComision.nombre}
              onChange={handleChange}
              required
              placeholder="Ej: Comisión React Febrero 2024"
              className={formControlClass}
              style={{ 
                borderColor: borderColor,
                backgroundColor: colors.inputBg,
                color: colors.text
              }}
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label style={{ color: colors.text }}>Carrera *</Form.Label>
            {loadingCarreras ? (
              <div className="d-flex align-items-center" style={{ color: colors.text }}>
                <Spinner size="sm" className="me-2" />
                <span>Cargando carreras...</span>
              </div>
            ) : errorCarreras ? (
              <Alert variant="danger" className="py-2">
                {errorCarreras}
              </Alert>
            ) : (
              <Form.Select
                name="carrera_id"
                value={newComision.carrera_id}
                onChange={handleChange}
                required
                style={{ 
                  borderColor: borderColor,
                  backgroundColor: colors.inputBg,
                  color: colors.text
                }}
                disabled={carreraCargando}
              >
                <option value="">Seleccionar carrera...</option>
                {carreras.map((carrera) => (
                  <option key={carrera._id} value={carrera._id}>
                    {carrera.nombre} ({carrera.modalidad})
                  </option>
                ))}
              </Form.Select>
            )}
            {carreraCargando && (
              <div className="mt-1" style={{ color: colors.text }}>
                <Spinner size="sm" className="me-2" />
                <small>Cargando datos de la carrera...</small>
              </div>
            )}
          </Form.Group>

          {/* Información de la carrera seleccionada */}
          {carreraSeleccionada && (
            <Alert variant="info" className="mt-2" style={{ 
              backgroundColor: theme === 'lights' ? '#cff4fc' : '#1a4b5e',
              color: theme === 'lights' ? '#055160' : '#e3f0f5'
            }}>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <strong>{carreraSeleccionada.nombre}</strong>
                  <div className="small">
                    Duración: {carreraSeleccionada.duracion} | 
                    Modalidad: <Badge bg="secondary">{carreraSeleccionada.modalidad}</Badge>
                  </div>
                </div>
                <Badge bg="success">
                  {carreraSeleccionada.modulos?.length || 0} módulos
                </Badge>
              </div>
            </Alert>
          )}

          <Form.Group className="mb-3">
            <Form.Label style={{ color: colors.text }}>Modalidad *</Form.Label>
            <Form.Control
              type="text"
              value={newComision.modalidad || 'Seleccione una carrera'}
              readOnly
              style={{ 
                borderColor: borderColor,
                backgroundColor: colors.disabledBg,
                color: colors.text
              }}
            />
            <Form.Text style={{ color: theme === 'lights' ? '#6c757d' : '#adb5bd' }}>
              Se carga automáticamente desde la carrera seleccionada
            </Form.Text>
          </Form.Group>
        </Col>

        <Col md={6}>
          <Form.Group className="mb-3">
            <Form.Label style={{ color: colors.text }}>Fecha de Inicio *</Form.Label>
            <Form.Control
              type="date"
              name="fecha_inicio"
              value={newComision.fecha_inicio}
              onChange={handleChange}
              required
              style={{ 
                borderColor: borderColor,
                backgroundColor: colors.inputBg,
                color: colors.text
              }}
              min={new Date().toISOString().split('T')[0]}
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label style={{ color: colors.text }}>Fecha de Fin *</Form.Label>
            <Form.Control
              type="date"
              name="fecha_fin"
              value={newComision.fecha_fin}
              onChange={handleChange}
              required
              style={{ 
                borderColor: borderColor,
                backgroundColor: colors.inputBg,
                color: colors.text
              }}
              min={newComision.fecha_inicio}
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label style={{ color: colors.text }}>Estado</Form.Label>
            <Form.Select
              name="estado"
              value={newComision.estado}
              onChange={handleChange}
              style={{ 
                borderColor: borderColor,
                backgroundColor: colors.inputBg,
                color: colors.text
              }}
            >
              <option value="Programada">Programada</option>
              <option value="En curso">En curso</option>
            </Form.Select>
          </Form.Group>
        </Col>
      </Row>

      <hr className="my-4" style={{ borderColor: borderColor }} />

      <h6 style={{ color: titleColor, marginBottom: '1rem' }}>
        Configuración de Clases
      </h6>

      <Row>
        <Col md={6}>
          <Form.Group className="mb-3">
            <Form.Label style={{ color: colors.text }}>Días de Clase *</Form.Label>
            
            {/* VERSIÓN MEJORADA: Checkboxes personalizados */}
            <div style={checkboxStyles.container}>
              {diasSemana.map((dia) => {
                const isSelected = newComision.dias_semana.includes(dia.value);
                return (
                  <div
                    key={dia.id}
                    onClick={() => handleDiaClick(dia.value)}
                    style={checkboxStyles.checkbox.square(isSelected)}
                    onMouseEnter={(e) => {
                      if (!isSelected) {
                        e.currentTarget.style.backgroundColor = theme === 'lights' ? '#e9ecef' : '#363c4e';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isSelected) {
                        e.currentTarget.style.backgroundColor = colors.checkboxBg;
                      }
                    }}
                  >
                    {dia.label}
                  </div>
                );
              })}
            </div>

            {/* Versión alternativa (circular) - comentada por si quieres probar */}
            {/* <div style={checkboxStyles.container}>
              {diasSemana.map((dia) => {
                const isSelected = newComision.dias_semana.includes(dia.value);
                return (
                  <div
                    key={dia.id}
                    onClick={() => handleDiaClick(dia.value)}
                    style={checkboxStyles.checkbox.circle(isSelected)}
                    title={dia.label}
                    onMouseEnter={(e) => {
                      if (!isSelected) {
                        e.currentTarget.style.backgroundColor = theme === 'lights' ? '#e9ecef' : '#363c4e';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isSelected) {
                        e.currentTarget.style.backgroundColor = colors.checkboxBg;
                      }
                    }}
                  >
                    {dia.abbr}
                  </div>
                );
              })}
            </div> */}

            <Form.Text style={{ color: theme === 'lights' ? '#6c757d' : '#adb5bd' }}>
              Seleccione los días en que se dictarán las clases
            </Form.Text>
          </Form.Group>
        </Col>

        <Col md={6}>
          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label style={{ color: colors.text }}>Hora de Inicio *</Form.Label>
                <Form.Control
                  type="time"
                  name="hora_inicio"
                  value={newComision.hora_inicio}
                  onChange={handleChange}
                  required
                  style={{ 
                    borderColor: borderColor,
                    backgroundColor: colors.inputBg,
                    color: colors.text
                  }}
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label style={{ color: colors.text }}>Hora de Fin *</Form.Label>
                <Form.Control
                  type="time"
                  name="hora_fin"
                  value={newComision.hora_fin}
                  onChange={handleChange}
                  required
                  style={{ 
                    borderColor: borderColor,
                    backgroundColor: colors.inputBg,
                    color: colors.text
                  }}
                />
              </Form.Group>
            </Col>
          </Row>
        </Col>
      </Row>

      {/* Resumen y estimación */}
      {newComision.fecha_inicio && newComision.fecha_fin && newComision.dias_semana.length > 0 && (
        <Alert 
          variant="info" 
          className="mt-3"
          style={{ 
            backgroundColor: theme === 'lights' ? '#cff4fc' : '#1a4b5e',
            color: theme === 'lights' ? '#055160' : '#e3f0f5',
            borderColor: theme === 'lights' ? '#b6effb' : '#0f3b4a'
          }}
        >
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <strong>Resumen de clases:</strong>
              <div className="small mt-1">
                • Se crearán aproximadamente <Badge bg="primary">{calcularEstimacionClases()}</Badge> clases<br />
                • Días: {newComision.dias_semana
                  .sort((a, b) => a - b)
                  .map(dia => ['Domingo', 'Lunes', 'Martes', 'Miércoles', 
                               'Jueves', 'Viernes', 'Sábado'][dia])
                  .join(', ')}<br />
                • Horario: {newComision.hora_inicio} - {newComision.hora_fin}
              </div>
            </div>
            <div className="text-end">
              <small>Del {newComision.fecha_inicio} al {newComision.fecha_fin}</small>
            </div>
          </div>
        </Alert>
      )}
    </>
  );

  return (
    <Modal
      show={show}
      onHide={() => {
        if (generando) {
          mostrarError('No puede cerrar mientras se crea la comisión');
          return;
        }
        resetForm();
        handleClose();
      }}
      size="lg"
      centered
      backdrop={generando ? 'static' : true}
      keyboard={!generando}
      style={{ color: colors.text }}
    >
      <Modal.Header
        closeButton={!generando}
        style={{ 
          backgroundColor: colors.cardBg,
          color: colors.text,
          borderBottomColor: borderColor
        }}
        closeVariant={theme === 'lights' ? 'dark' : 'white'}
      >
        <Modal.Title style={{ color: titleColor }}>
          {generando ? 'Creando Comisión...' : 'Crear Nueva Comisión'}
        </Modal.Title>
      </Modal.Header>

      <Modal.Body 
        style={{ 
          backgroundColor: colors.cardBg,
          color: colors.text
        }}
      >
        <Form onSubmit={handleCrearComision}>
          {renderPaso1()}

          <div className="d-flex justify-content-between mt-4 pt-3"
            style={{ borderTop: `1px solid ${borderColor}` }}
          >
            <Button
              variant="secondary"
              onClick={resetForm}
              disabled={generando || loadingCarreras}
              style={{
                backgroundColor: theme === 'lights' ? '#6c757d' : '#4a515e',
                borderColor: theme === 'lights' ? '#6c757d' : '#4a515e'
              }}
            >
              Limpiar
            </Button>
            
            <div>
              <Button
                variant="outline-secondary"
                onClick={() => {
                  Swal.fire({
                    icon: 'info',
                    title: 'Cancelar',
                    text: '¿Seguro que desea cancelar la creación de la comisión?',
                    showCancelButton: true,
                    confirmButtonColor: titleColor,
                    cancelButtonColor: borderColor,
                    confirmButtonText: 'Sí, cancelar',
                    cancelButtonText: 'Continuar',
                    background: colors.cardBg,
                    color: colors.text
                  }).then((result) => {
                    if (result.isConfirmed) {
                      resetForm();
                      handleClose();
                    }
                  });
                }}
                className="me-2"
                disabled={generando}
                style={{
                  color: colors.text,
                  borderColor: borderColor
                }}
              >
                Cancelar
              </Button>
              
              <Button
                variant="primary"
                type="submit"
                style={{ 
                  backgroundColor: titleColor, 
                  borderColor: titleColor,
                  color: '#ffffff'
                }}
                disabled={generando || loadingCarreras || !newComision.carrera_id}
              >
                {generando ? (
                  <>
                    <Spinner size="sm" className="me-2" />
                    Creando...
                  </>
                ) : (
                  'Crear Comisión y Generar Clases'
                )}
              </Button>
            </div>
          </div>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

export default ModalCrearComision;