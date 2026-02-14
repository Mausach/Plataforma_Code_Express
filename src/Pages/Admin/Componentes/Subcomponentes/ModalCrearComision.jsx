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
    modalidad: '', // ← Ahora vacío, se llenará automáticamente
    dias_semana: [1, 3, 5], // ← Por defecto: Lunes, Miércoles, Viernes
    hora_inicio: '18:00',
    hora_fin: '22:00',
    estado: 'Programada'
  });

  // Estado para datos de la carrera seleccionada
  const [carreraSeleccionada, setCarreraSeleccionada] = useState(null);
  const [carreraCargando, setCarreraCargando] = useState(false);

  // Estados para el proceso
  const [pasoActual, setPasoActual] = useState(1); // 1: Datos básicos, 2: Confirmar y generar
  const [comisionCreada, setComisionCreada] = useState(null);
  const [generando, setGenerando] = useState(false);
  const [clasesGeneradas, setClasesGeneradas] = useState(null);

  // Estado para las carreras disponibles
  const [carreras, setCarreras] = useState([]);
  const [loadingCarreras, setLoadingCarreras] = useState(false);
  const [errorCarreras, setErrorCarreras] = useState(null);

  // Días de la semana con sus números
  const diasSemana = [
    { id: 1, label: 'Lunes', value: 1 },
    { id: 2, label: 'Martes', value: 2 },
    { id: 3, label: 'Miércoles', value: 3 },
    { id: 4, label: 'Jueves', value: 4 },
    { id: 5, label: 'Viernes', value: 5 },
    { id: 6, label: 'Sábado', value: 6 },
    { id: 0, label: 'Domingo', value: 0 }
  ];

  // Clases CSS según tema
  const cardClass = theme === 'lights' ? 'card-light' : 'card-dark';
  const textClass = theme === 'lights' ? 'text-dark' : 'text-light';
  const formControlClass = theme === 'lights' ? 'bg-white text-dark' : 'bg-dark text-light';
  const borderColor = theme === 'lights' ? '#353432' : '#ebe5e5';
  const titleColor = '#EF7F1A';
  const bgColor = theme === 'lights' ? '#f8f9fa' : '#2a3042';

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
          
          // Cargar modalidad automáticamente desde la carrera
          // Convertir modalidad de carrera al formato de comisión
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
          
          console.log('📚 Carrera seleccionada:', carrera);
          console.log('📚 Modalidad cargada:', modalidadComision);
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
          return { ...prev, dias_semana: newDias };
        });
      }
    } else {
      setNewComision(prev => ({
        ...prev,
        [name]: value
      }));
    }
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

    // Validar horario si se van a generar clases
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

      // OBTENER ID DEL USUARIO REAL
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

      // Paso 1: Crear comisión
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
          background: theme === 'lights' ? '#FAF3E1' : '#0A0E17',
          color: theme === 'lights' ? '#353432' : '#ebe5e5',
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
          
          // Mostrar resumen final
          const totalClases = calcularEstimacionClases();
          const primeraClase = new Date(newComision.fecha_inicio);
          const ultimaClase = new Date(newComision.fecha_fin);
          
          // Ajustar primera clase al primer día seleccionado
          while (!newComision.dias_semana.includes(primeraClase.getDay())) {
            primeraClase.setDate(primeraClase.getDate() + 1);
          }
          
          // Ajustar última clase al último día seleccionado
          while (!newComision.dias_semana.includes(ultimaClase.getDay())) {
            ultimaClase.setDate(ultimaClase.getDate() - 1);
          }

          Swal.fire({
            icon: 'success',
            title: '✅ ¡Todo listo!',
            html: `
              <div class="text-start">
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
            background: theme === 'lights' ? '#FAF3E1' : '#0A0E17',
            color: theme === 'lights' ? '#353432' : '#ebe5e5',
            confirmButtonColor: '#EF7F1A',
            confirmButtonText: 'Aceptar'
          }).then(() => {
            resetForm();
            handleClose();
          });
        } else {
          // Comisión creada pero error en clases
          Swal.fire({
            icon: 'warning',
            title: 'Comisión creada',
            html: `
              <div class="text-start">
                <p><strong>Comisión creada:</strong> ${resultadoComision.comision.nombre}</p>
                <p><strong>Error al generar clases:</strong> ${resultadoClases.msg || 'No se pudieron generar las clases'}</p>
                <p>Puede generarlas más tarde desde la gestión de comisiones.</p>
              </div>
            `,
            background: theme === 'lights' ? '#FAF3E1' : '#0A0E17',
            color: theme === 'lights' ? '#353432' : '#ebe5e5',
            confirmButtonColor: '#EF7F1A'
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
      background: theme === 'lights' ? '#FAF3E1' : '#0A0E17',
      color: theme === 'lights' ? '#353432' : '#ebe5e5',
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
            <Form.Label>Nombre de la Comisión *</Form.Label>
            <Form.Control
              type="text"
              name="nombre"
              value={newComision.nombre}
              onChange={handleChange}
              required
              placeholder="Ej: Comisión React Febrero 2024"
              className={formControlClass}
              style={{ borderColor: borderColor }}
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Carrera *</Form.Label>
            {loadingCarreras ? (
              <div className="d-flex align-items-center">
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
                className={formControlClass}
                style={{ borderColor: borderColor }}
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
              <div className="mt-1">
                <Spinner size="sm" className="me-2" />
                <small>Cargando datos de la carrera...</small>
              </div>
            )}
          </Form.Group>

          {/* Información de la carrera seleccionada */}
          {carreraSeleccionada && (
            <Alert variant="info" className="mt-2">
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
            <Form.Label>Modalidad *</Form.Label>
            <Form.Control
              type="text"
              value={newComision.modalidad || 'Seleccione una carrera'}
              readOnly
              className={formControlClass}
              style={{ borderColor: borderColor, backgroundColor: 'rgba(0,0,0,0.05)' }}
            />
            <Form.Text className="text-muted">
              Se carga automáticamente desde la carrera seleccionada
            </Form.Text>
          </Form.Group>
        </Col>

        <Col md={6}>
          <Form.Group className="mb-3">
            <Form.Label>Fecha de Inicio *</Form.Label>
            <Form.Control
              type="date"
              name="fecha_inicio"
              value={newComision.fecha_inicio}
              onChange={handleChange}
              required
              className={formControlClass}
              style={{ borderColor: borderColor }}
              min={new Date().toISOString().split('T')[0]}
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Fecha de Fin *</Form.Label>
            <Form.Control
              type="date"
              name="fecha_fin"
              value={newComision.fecha_fin}
              onChange={handleChange}
              required
              className={formControlClass}
              style={{ borderColor: borderColor }}
              min={newComision.fecha_inicio}
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Estado</Form.Label>
            <Form.Select
              name="estado"
              value={newComision.estado}
              onChange={handleChange}
              className={formControlClass}
              style={{ borderColor: borderColor }}
            >
              <option value="Programada">Programada</option>
              <option value="En curso">En curso</option>
            </Form.Select>
          </Form.Group>
        </Col>
      </Row>

      <hr className="my-4" />

      <h6 style={{ color: titleColor, marginBottom: '1rem' }}>
        Configuración de Clases
      </h6>

      <Row>
        <Col md={6}>
          <Form.Group className="mb-3">
            <Form.Label>Días de Clase *</Form.Label>
            <div className="d-flex flex-wrap gap-2">
              {diasSemana.map((dia) => (
                <Form.Check
                  key={dia.id}
                  type="checkbox"
                  id={`dia-${dia.value}`}
                  label={dia.label}
                  name="dias_semana"
                  value={dia.value}
                  checked={newComision.dias_semana.includes(dia.value)}
                  onChange={handleChange}
                  className="border rounded p-2"
                  style={{
                    backgroundColor: newComision.dias_semana.includes(dia.value)
                      ? titleColor
                      : 'transparent',
                    borderColor: borderColor,
                    color: newComision.dias_semana.includes(dia.value)
                      ? 'white'
                      : textClass
                  }}
                />
              ))}
            </div>
            <Form.Text style={{ color: borderColor }}>
              Seleccione los días en que se dictarán las clases
            </Form.Text>
          </Form.Group>
        </Col>

        <Col md={6}>
          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Hora de Inicio *</Form.Label>
                <Form.Control
                  type="time"
                  name="hora_inicio"
                  value={newComision.hora_inicio}
                  onChange={handleChange}
                  required
                  className={formControlClass}
                  style={{ borderColor: borderColor }}
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Hora de Fin *</Form.Label>
                <Form.Control
                  type="time"
                  name="hora_fin"
                  value={newComision.hora_fin}
                  onChange={handleChange}
                  required
                  className={formControlClass}
                  style={{ borderColor: borderColor }}
                />
              </Form.Group>
            </Col>
          </Row>
        </Col>
      </Row>

      {/* Resumen y estimación */}
      {newComision.fecha_inicio && newComision.fecha_fin && newComision.dias_semana.length > 0 && (
        <Alert variant="info" className="mt-3">
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
      className={theme}
      backdrop={generando ? 'static' : true}
      keyboard={!generando}
    >
      <Modal.Header
        closeButton={!generando}
        className={`${cardClass} ${textClass}`}
        style={{ borderBottomColor: borderColor }}
      >
        <Modal.Title style={{ color: titleColor }}>
          {generando ? 'Creando Comisión...' : 'Crear Nueva Comisión'}
        </Modal.Title>
      </Modal.Header>

      <Modal.Body className={`${cardClass} ${textClass}`}>
        <Form onSubmit={handleCrearComision}>
          {renderPaso1()}

          <div className="d-flex justify-content-between mt-4 pt-3"
            style={{ borderTop: `1px solid ${borderColor}` }}
          >
            <Button
              variant="secondary"
              onClick={resetForm}
              disabled={generando || loadingCarreras}
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
                    background: theme === 'lights' ? '#FAF3E1' : '#0A0E17',
                    color: theme === 'lights' ? '#353432' : '#ebe5e5'
                  }).then((result) => {
                    if (result.isConfirmed) {
                      resetForm();
                      handleClose();
                    }
                  });
                }}
                className="me-2"
                disabled={generando}
              >
                Cancelar
              </Button>
              
              <Button
                variant="primary"
                type="submit"
                style={{ backgroundColor: titleColor, borderColor: titleColor }}
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