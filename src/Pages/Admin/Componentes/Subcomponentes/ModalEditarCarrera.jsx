import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Row, Col, Badge, Tab, Tabs } from 'react-bootstrap';
import Swal from 'sweetalert2';
import { Plus, Dash, Trash } from 'react-bootstrap-icons';
import { starEditarCarrera } from '../../Helper/EditarCarrera';

export const ModalEditarCarrera = ({
  show,
  handleClose,
  carrera,
  setRefreshData,
  navigate,
  theme
}) => {
  // ========== ESTADOS INICIALES ==========
  const getInitialContenido = () => ({
    nombre: '',
    // ⚠️ ELIMINADO: estado
    clase: { diapositivas: [''] },
    autoaprendizaje: { guia_estudio: '' },
    tutoria: { 
      diapositivas: [''],
      apoyo: '',
      proyectos: [{ tarea: '', solucion: '' }]
    }
  });

  // Estado principal
  const [carreraEditada, setCarreraEditada] = useState({
    _id: '',
    nombre: '',
    descripcion: '',
    duracion: '',
    clases_por_semana: 1,
    duracion_de_cada_clase: '',
    titulo_certificacion: '',
    precio: '',
    modalidad: 'part-time',
    requisitos: [''],
    estado: 'En desarrollo',
    // ⚠️ NUEVO: Campos de versionado
    version: '1.0.0',
    modulos: []
  });

  const [nuevoModulo, setNuevoModulo] = useState({
    nombre: '',
    descripcion: '',
    orden: 1,
    // ⚠️ ELIMINADO: estado (no va en el modelo)
    contenidos: []
  });

  const [nuevoContenido, setNuevoContenido] = useState(getInitialContenido());
  const [loading, setLoading] = useState(true);

  // Clases según tema
  const cardClass = theme === 'lights' ? 'card-light' : 'card-dark';
  const textClass = theme === 'lights' ? 'text-dark' : 'text-light';
  const formControlClass = theme === 'lights' ? 'bg-white text-dark' : 'bg-dark text-light';
  const borderColor = theme === 'lights' ? '#353432' : '#ebe5e5';
  const titleColor = '#EF7F1A';
  const cardBgColor = theme === 'lights' ? '#f8f9fa' : '#2a3042';
  const innerCardBgColor = theme === 'lights' ? '#FFFFFF' : '#1F2535';

  // ========== EFFECT PARA CARGAR DATOS ==========
  useEffect(() => {
    console.log('🔍 Carrera recibida para editar:', carrera);
    
    if (carrera && show) {
      setLoading(true);
      
      try {
        const carreraPreparada = {
          _id: carrera._id || '',
          nombre: carrera.nombre || '',
          descripcion: carrera.descripcion || '',
          duracion: carrera.duracion || '',
          clases_por_semana: carrera.clases_por_semana || 1,
          duracion_de_cada_clase: carrera.duracion_de_cada_clase || '',
          titulo_certificacion: carrera.titulo_certificacion || '',
          precio: carrera.precio || '',
          modalidad: carrera.modalidad || 'part-time',
          estado: carrera.estado || 'En desarrollo',
          // ⚠️ NUEVO: Campos de versionado
          version: carrera.version || '1.0.0',
          fecha_version: carrera.fecha_version || new Date(),
          
          requisitos: Array.isArray(carrera.requisitos) && carrera.requisitos.length > 0 
            ? carrera.requisitos.map(req => req || '')
            : [''],
          
          // Módulos - SIN estados de progreso
          modulos: Array.isArray(carrera.modulos) 
            ? carrera.modulos.map((modulo, idx) => ({
                _id: modulo._id || `mod_${idx}`,
                nombre: modulo.nombre || '',
                descripcion: modulo.descripcion || '',
                orden: modulo.orden || idx + 1,
                // ⚠️ ELIMINADO: estado (no va aquí)
                
                // Contenidos SIN estados booleanos
                contenidos: Array.isArray(modulo.contenidos)
                  ? modulo.contenidos.map((contenido, cIdx) => ({
                      _id: contenido._id || `cont_${cIdx}`,
                      nombre: contenido.nombre || '',
                      // ⚠️ ELIMINADO: estado (no va aquí)
                      clase: {
                        diapositivas: Array.isArray(contenido.clase?.diapositivas) && contenido.clase.diapositivas.length > 0
                          ? [...contenido.clase.diapositivas]
                          : ['']
                      },
                      autoaprendizaje: {
                        guia_estudio: contenido.autoaprendizaje?.guia_estudio || ''
                      },
                      tutoria: {
                        diapositivas: Array.isArray(contenido.tutoria?.diapositivas) && contenido.tutoria.diapositivas.length > 0
                          ? [...contenido.tutoria.diapositivas]
                          : [''],
                        apoyo: contenido.tutoria?.apoyo || '',
                        proyectos: Array.isArray(contenido.tutoria?.proyectos) && contenido.tutoria.proyectos.length > 0
                          ? [...contenido.tutoria.proyectos]
                          : [{ tarea: '', solucion: '' }]
                      }
                    }))
                  : []
              }))
            : []
        };

        console.log('📦 Carrera preparada para edición:', carreraPreparada);
        console.log('🔢 Versión actual:', carreraPreparada.version);
        
        setCarreraEditada(carreraPreparada);
        setLoading(false);
      } catch (error) {
        console.error('❌ Error al preparar carrera para edición:', error);
        setLoading(false);
      }
    } else if (show) {
      // Resetear estado si se abre sin carrera
      setCarreraEditada({
        _id: '',
        nombre: '',
        descripcion: '',
        duracion: '',
        clases_por_semana: 1,
        duracion_de_cada_clase: '',
        titulo_certificacion: '',
        precio: '',
        modalidad: 'part-time',
        requisitos: [''],
        estado: 'En desarrollo',
        version: '1.0.0',
        modulos: []
      });
      setLoading(false);
    }
  }, [carrera, show]);

  // ========== FUNCIONES PARA CARRERA ==========
  const handleChangeCarrera = (e) => {
    const { name, value, type } = e.target;
    
    setCarreraEditada(prev => ({
      ...prev,
      [name]: type === 'number' ? parseInt(value) || 0 : value
    }));
  };

  const handleRequisitoChange = (index, value) => {
    const nuevosRequisitos = [...carreraEditada.requisitos];
    nuevosRequisitos[index] = value;
    
    setCarreraEditada(prev => ({ 
      ...prev, 
      requisitos: nuevosRequisitos 
    }));
  };

  const agregarRequisito = () => {
    setCarreraEditada(prev => ({
      ...prev,
      requisitos: [...prev.requisitos, '']
    }));
  };

  const eliminarRequisito = (index) => {
    if (carreraEditada.requisitos.length <= 1) {
      mostrarError('Debe haber al menos un requisito');
      return;
    }
    const nuevosRequisitos = carreraEditada.requisitos.filter((_, i) => i !== index);
    setCarreraEditada(prev => ({ ...prev, requisitos: nuevosRequisitos }));
  };

  // ========== FUNCIONES PARA MÓDULOS ==========
  const handleModuloChange = (e) => {
    const { name, value } = e.target;
    setNuevoModulo(prev => ({ ...prev, [name]: value }));
  };

  const agregarModulo = () => {
    if (!nuevoModulo.nombre.trim()) {
      mostrarError('El nombre del módulo es obligatorio');
      return;
    }

    const moduloConOrden = {
      ...nuevoModulo,
      orden: carreraEditada.modulos.length + 1,
      // Generar ID temporal que será reemplazado en el backend
      _id: `temp_${Date.now()}`
    };

    setCarreraEditada(prev => ({
      ...prev,
      modulos: [...prev.modulos, moduloConOrden]
    }));

    setNuevoModulo({
      nombre: '',
      descripcion: '',
      orden: carreraEditada.modulos.length + 2,
      contenidos: []
    });
  };

  const editarModulo = (index, field, value) => {
    const nuevosModulos = [...carreraEditada.modulos];
    nuevosModulos[index][field] = value;
    setCarreraEditada(prev => ({ ...prev, modulos: nuevosModulos }));
  };

  const eliminarModulo = (index) => {
    if (carreraEditada.modulos.length <= 1) {
      mostrarError('Debe haber al menos un módulo');
      return;
    }

    Swal.fire({
      title: '¿Eliminar módulo?',
      text: 'Se eliminarán todos los contenidos del módulo',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
      background: cardBgColor,
      color: textClass
    }).then((result) => {
      if (result.isConfirmed) {
        const nuevosModulos = carreraEditada.modulos.filter((_, i) => i !== index);
        const modulosReordenados = nuevosModulos.map((modulo, idx) => ({
          ...modulo,
          orden: idx + 1
        }));
        setCarreraEditada(prev => ({ ...prev, modulos: modulosReordenados }));
      }
    });
  };

  // ========== FUNCIONES PARA CONTENIDOS ==========
  const handleContenidoChange = (e, moduloIndex, contenidoIndex, fieldPath) => {
    const { value } = e.target;
    const nuevosModulos = [...carreraEditada.modulos];
    
    const partes = fieldPath.split('.');
    let target = nuevosModulos[moduloIndex].contenidos[contenidoIndex];
    
    for (let i = 0; i < partes.length - 1; i++) {
      target = target[partes[i]];
    }
    
    target[partes[partes.length - 1]] = value;
    setCarreraEditada(prev => ({ ...prev, modulos: nuevosModulos }));
  };

  const agregarContenido = (moduloIndex) => {
    if (!nuevoContenido.nombre.trim()) {
      mostrarError('El nombre del contenido es obligatorio');
      return;
    }

    const contenidoParaAgregar = {
      ...JSON.parse(JSON.stringify(nuevoContenido)),
      _id: `temp_cont_${Date.now()}` // ID temporal
    };
    
    // Filtrar campos vacíos
    contenidoParaAgregar.clase.diapositivas = contenidoParaAgregar.clase.diapositivas.filter(d => d.trim() !== '');
    contenidoParaAgregar.tutoria.diapositivas = contenidoParaAgregar.tutoria.diapositivas.filter(d => d.trim() !== '');
    contenidoParaAgregar.tutoria.proyectos = contenidoParaAgregar.tutoria.proyectos.filter(p => p.tarea.trim() !== '');

    const nuevosModulos = [...carreraEditada.modulos];
    nuevosModulos[moduloIndex].contenidos = [
      ...nuevosModulos[moduloIndex].contenidos,
      contenidoParaAgregar
    ];

    setCarreraEditada(prev => ({ ...prev, modulos: nuevosModulos }));
    setNuevoContenido(getInitialContenido());
  };

  const agregarDiapositiva = (moduloIndex, contenidoIndex, tipo) => {
    const nuevosModulos = [...carreraEditada.modulos];
    const campo = tipo === 'clase' ? 'clase.diapositivas' : 'tutoria.diapositivas';
    const partes = campo.split('.');
    
    let target = nuevosModulos[moduloIndex].contenidos[contenidoIndex];
    for (let i = 0; i < partes.length; i++) {
      target = target[partes[i]];
    }
    
    target.push('');
    setCarreraEditada(prev => ({ ...prev, modulos: nuevosModulos }));
  };

  const eliminarDiapositiva = (moduloIndex, contenidoIndex, tipo, diapoIndex) => {
    const nuevosModulos = [...carreraEditada.modulos];
    const campo = tipo === 'clase' ? 'clase.diapositivas' : 'tutoria.diapositivas';
    const partes = campo.split('.');
    
    let target = nuevosModulos[moduloIndex].contenidos[contenidoIndex];
    for (let i = 0; i < partes.length; i++) {
      target = target[partes[i]];
    }
    
    target.splice(diapoIndex, 1);
    if (target.length === 0) target.push('');
    
    setCarreraEditada(prev => ({ ...prev, modulos: nuevosModulos }));
  };

  const agregarProyecto = (moduloIndex, contenidoIndex) => {
    const nuevosModulos = [...carreraEditada.modulos];
    nuevosModulos[moduloIndex].contenidos[contenidoIndex].tutoria.proyectos.push({
      tarea: '',
      solucion: ''
    });
    setCarreraEditada(prev => ({ ...prev, modulos: nuevosModulos }));
  };

  const eliminarProyecto = (moduloIndex, contenidoIndex, proyectoIndex) => {
    const nuevosModulos = [...carreraEditada.modulos];
    const proyectos = nuevosModulos[moduloIndex].contenidos[contenidoIndex].tutoria.proyectos;
    
    proyectos.splice(proyectoIndex, 1);
    if (proyectos.length === 0) {
      proyectos.push({ tarea: '', solucion: '' });
    }
    
    setCarreraEditada(prev => ({ ...prev, modulos: nuevosModulos }));
  };

  const eliminarContenido = (moduloIndex, contenidoIndex) => {
    Swal.fire({
      title: '¿Eliminar contenido?',
      text: 'Esta acción no se puede deshacer',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
      background: cardBgColor,
      color: textClass
    }).then((result) => {
      if (result.isConfirmed) {
        const nuevosModulos = [...carreraEditada.modulos];
        nuevosModulos[moduloIndex].contenidos = nuevosModulos[moduloIndex].contenidos.filter(
          (_, i) => i !== contenidoIndex
        );
        setCarreraEditada(prev => ({ ...prev, modulos: nuevosModulos }));
      }
    });
  };

  // ========== VALIDACIÓN Y ENVÍO ==========
  const validarFormulario = () => {
    const camposObligatorios = [
      { campo: carreraEditada.nombre, mensaje: 'El nombre de la carrera es obligatorio' },
      { campo: carreraEditada.descripcion, mensaje: 'La descripción es obligatoria' },
      { campo: carreraEditada.duracion, mensaje: 'La duración es obligatoria' },
      { campo: carreraEditada.duracion_de_cada_clase, mensaje: 'La duración de cada clase es obligatoria' },
      { campo: carreraEditada.titulo_certificacion, mensaje: 'El título de certificación es obligatorio' },
      { campo: carreraEditada.precio, mensaje: 'El precio es obligatorio' }
    ];

    for (const { campo, mensaje } of camposObligatorios) {
      if (!campo.trim()) {
        mostrarError(mensaje);
        return false;
      }
    }

    if (!carreraEditada.requisitos.some(req => req.trim() !== '')) {
      mostrarError('Debe haber al menos un requisito');
      return false;
    }

    if (carreraEditada.modulos.length === 0) {
      mostrarError('Debe haber al menos un módulo');
      return false;
    }

    for (const modulo of carreraEditada.modulos) {
      if (!modulo.contenidos || modulo.contenidos.length === 0) {
        mostrarError(`El módulo "${modulo.nombre}" debe tener al menos un contenido`);
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validarFormulario()) return;

    try {
      const datosParaEnviar = {
        _id: carreraEditada._id,
        nombre: carreraEditada.nombre.trim(),
        descripcion: carreraEditada.descripcion.trim(),
        duracion: carreraEditada.duracion.trim(),
        clases_por_semana: parseInt(carreraEditada.clases_por_semana) || 1,
        duracion_de_cada_clase: carreraEditada.duracion_de_cada_clase.trim(),
        titulo_certificacion: carreraEditada.titulo_certificacion.trim(),
        precio: carreraEditada.precio.trim(),
        modalidad: carreraEditada.modalidad,
        estado: carreraEditada.estado,
        version: carreraEditada.version || '1.0.0', // ⚠️ NUEVO: Incluir versión
        requisitos: carreraEditada.requisitos
          .filter(req => req.trim() !== '')
          .map(req => req.trim()),
        modulos: carreraEditada.modulos.map((modulo, index) => ({
          _id: modulo._id || `temp_${index}`, // ⚠️ IMPORTANTE: Enviar IDs existentes
          nombre: modulo.nombre.trim(),
          descripcion: modulo.descripcion?.trim() || '',
          orden: modulo.orden || (index + 1),
          // ⚠️ ELIMINADO: estado (no va aquí)
          contenidos: modulo.contenidos.map(contenido => ({
            _id: contenido._id || `temp_cont_${index}`, // ⚠️ IMPORTANTE: Enviar IDs existentes
            nombre: contenido.nombre.trim(),
            // ⚠️ ELIMINADO: estado (no va aquí)
            clase: {
              diapositivas: Array.isArray(contenido.clase?.diapositivas)
                ? contenido.clase.diapositivas
                    .filter(diapo => diapo.trim() !== '')
                    .map(diapo => diapo.trim())
                : []
            },
            autoaprendizaje: {
              guia_estudio: contenido.autoaprendizaje?.guia_estudio?.trim() || ''
            },
            tutoria: {
              diapositivas: Array.isArray(contenido.tutoria?.diapositivas)
                ? contenido.tutoria.diapositivas
                    .filter(diapo => diapo.trim() !== '')
                    .map(diapo => diapo.trim())
                : [],
              apoyo: contenido.tutoria?.apoyo?.trim() || '',
              proyectos: Array.isArray(contenido.tutoria?.proyectos)
                ? contenido.tutoria.proyectos
                    .filter(proyecto => proyecto.tarea.trim() !== '')
                    .map(proyecto => ({
                      tarea: proyecto.tarea.trim(),
                      solucion: proyecto.solucion?.trim() || ''
                    }))
                : []
            }
          }))
        }))
      };

      console.log('📤 Datos a actualizar:', datosParaEnviar);
      console.log('🔢 Versión que se envía:', datosParaEnviar.version);
      
      await starEditarCarrera(datosParaEnviar, setRefreshData, navigate, theme);
      handleClose();
    } catch (error) {
      console.error('Error al actualizar carrera:', error);
    }
  };

  const mostrarError = (mensaje) => {
    Swal.fire({
      title: 'Error',
      text: mensaje,
      icon: 'error',
      background: cardBgColor,
      color: textClass
    });
  };

  // ========== RENDERIZADO ==========
  if (loading) {
    return (
      <Modal show={show} onHide={handleClose} size="lg" centered className={theme}>
        <Modal.Header closeButton className={`${cardClass} ${textClass}`}>
          <Modal.Title style={{ color: titleColor }}>Editando Carrera</Modal.Title>
        </Modal.Header>
        <Modal.Body className="d-flex justify-content-center align-items-center" style={{ minHeight: '200px' }}>
          <div className="text-center">
            <div className="spinner-border text-primary" role="status"></div>
            <p className="mt-2">Cargando datos de la carrera...</p>
          </div>
        </Modal.Body>
      </Modal>
    );
  }

  return (
    <Modal
      show={show}
      onHide={handleClose}
      size="xl"
      fullscreen="lg-down"
      centered
      className={theme}
      scrollable
    >
      <Modal.Header
        closeButton
        className={`${cardClass} ${textClass}`}
        style={{ borderBottomColor: borderColor }}
      >
        <Modal.Title style={{ color: titleColor }}>
          Editar Carrera: {carreraEditada.nombre || 'Carrera'}
          {carreraEditada.version && (
            <Badge bg="info" className="ms-2">v{carreraEditada.version}</Badge>
          )}
        </Modal.Title>
      </Modal.Header>

      <Modal.Body className={`${cardClass} ${textClass}`}>
        <Form onSubmit={handleSubmit}>
          {/* SECCIÓN 1: INFORMACIÓN BÁSICA */}
          <div className="mb-4 p-3 rounded" style={{ backgroundColor: cardBgColor, border: `1px solid ${borderColor}` }}>
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5 style={{ color: titleColor, margin: 0 }}>
                Información Básica de la Carrera
              </h5>
              {carreraEditada.version && (
                <Badge bg="secondary" className="ms-2">
                  Versión: {carreraEditada.version}
                </Badge>
              )}
            </div>
            
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Nombre de la Carrera *</Form.Label>
                  <Form.Control
                    type="text"
                    name="nombre"
                    value={carreraEditada.nombre || ''}
                    onChange={handleChangeCarrera}
                    required
                    className={formControlClass}
                    style={{ borderColor: borderColor }}
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Descripción *</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    name="descripcion"
                    value={carreraEditada.descripcion || ''}
                    onChange={handleChangeCarrera}
                    required
                    className={formControlClass}
                    style={{ borderColor: borderColor }}
                  />
                </Form.Group>

                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Duración Total *</Form.Label>
                      <Form.Control
                        type="text"
                        name="duracion"
                        value={carreraEditada.duracion || ''}
                        onChange={handleChangeCarrera}
                        placeholder="Ej: 6 meses"
                        required
                        className={formControlClass}
                        style={{ borderColor: borderColor }}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Clases por Semana *</Form.Label>
                      <Form.Control
                        type="number"
                        name="clases_por_semana"
                        min="1"
                        max="10"
                        value={carreraEditada.clases_por_semana || 1}
                        onChange={handleChangeCarrera}
                        required
                        className={formControlClass}
                        style={{ borderColor: borderColor }}
                      />
                    </Form.Group>
                  </Col>
                </Row>
              </Col>

              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Duración de Cada Clase *</Form.Label>
                  <Form.Control
                    type="text"
                    name="duracion_de_cada_clase"
                    value={carreraEditada.duracion_de_cada_clase || ''}
                    onChange={handleChangeCarrera}
                    placeholder="Ej: 2 horas"
                    required
                    className={formControlClass}
                    style={{ borderColor: borderColor }}
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Título de Certificación *</Form.Label>
                  <Form.Control
                    type="text"
                    name="titulo_certificacion"
                    value={carreraEditada.titulo_certificacion || ''}
                    onChange={handleChangeCarrera}
                    placeholder="Ej: Desarrollador Web Full Stack"
                    required
                    className={formControlClass}
                    style={{ borderColor: borderColor }}
                  />
                </Form.Group>

                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Precio *</Form.Label>
                      <Form.Control
                        type="text"
                        name="precio"
                        value={carreraEditada.precio || ''}
                        onChange={handleChangeCarrera}
                        placeholder="Ej: $50,000"
                        required
                        className={formControlClass}
                        style={{ borderColor: borderColor }}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Modalidad *</Form.Label>
                      <Form.Select
                        name="modalidad"
                        value={carreraEditada.modalidad || 'part-time'}
                        onChange={handleChangeCarrera}
                        required
                        className={formControlClass}
                        style={{ borderColor: borderColor }}
                      >
                        <option value="part-time">Part-Time</option>
                        <option value="full-time">Full-Time</option>
                        <option value="grabado">Grabado</option>
                      </Form.Select>
                    </Form.Group>
                  </Col>
                </Row>

                <Form.Group className="mb-3">
                  <Form.Label>Estado *</Form.Label>
                  <Form.Select
                    name="estado"
                    value={carreraEditada.estado || 'En desarrollo'}
                    onChange={handleChangeCarrera}
                    required
                    className={formControlClass}
                    style={{ borderColor: borderColor }}
                  >
                    <option value="En desarrollo">En desarrollo</option>
                    <option value="Activo">Activo</option>
                    <option value="Inactivo">Inactivo</option>
                    <option value="Archivado">Archivado</option>
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>
          </div>

          {/* SECCIÓN 2: REQUISITOS */}
          <div className="mb-4 p-3 rounded" style={{ backgroundColor: cardBgColor, border: `1px solid ${borderColor}` }}>
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5 style={{ color: titleColor, margin: 0 }}>Requisitos *</h5>
              <Button variant="outline-success" size="sm" onClick={agregarRequisito}>
                <Plus /> Agregar Requisito
              </Button>
            </div>
            
            {Array.isArray(carreraEditada.requisitos) && carreraEditada.requisitos.length > 0 ? (
              carreraEditada.requisitos.map((requisito, index) => (
                <div key={index} className="mb-2 d-flex align-items-center">
                  <Form.Control
                    type="text"
                    value={requisito || ''}
                    onChange={(e) => handleRequisitoChange(index, e.target.value)}
                    placeholder={`Requisito ${index + 1}`}
                    className={`me-2 ${formControlClass}`}
                    style={{ borderColor: borderColor }}
                  />
                  {carreraEditada.requisitos.length > 1 && (
                    <Button variant="outline-danger" size="sm" onClick={() => eliminarRequisito(index)}>
                      <Dash />
                    </Button>
                  )}
                </div>
              ))
            ) : (
              <div className="mb-2 d-flex align-items-center">
                <Form.Control
                  type="text"
                  value=""
                  onChange={(e) => handleRequisitoChange(0, e.target.value)}
                  placeholder="Requisito 1"
                  className={`me-2 ${formControlClass}`}
                  style={{ borderColor: borderColor }}
                />
              </div>
            )}
          </div>

          {/* SECCIÓN 3: MÓDULOS EXISTENTES */}
          <div className="mb-4">
            <h5 style={{ color: titleColor, marginBottom: '1.5rem' }}>
              Módulos de la Carrera ({carreraEditada.modulos?.length || 0})
            </h5>
            
            {carreraEditada.modulos?.length > 0 ? (
              carreraEditada.modulos.map((modulo, moduloIndex) => (
                <div key={modulo._id || moduloIndex} className="mb-4 p-3 rounded" style={{ backgroundColor: cardBgColor, border: `1px solid ${borderColor}` }}>
                  {/* INFORMACIÓN DEL MÓDULO */}
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <div>
                      <h6 style={{ color: titleColor, margin: 0 }}>
                        Módulo {modulo.orden}: {modulo.nombre}
                      </h6>
                    </div>
                    <Button
                      variant="outline-danger"
                      size="sm"
                      onClick={() => eliminarModulo(moduloIndex)}
                    >
                      <Trash size={12} /> Eliminar Módulo
                    </Button>
                  </div>

                  {/* CAMPOS EDITABLES DEL MÓDULO */}
                  <Row className="mb-4">
                    <Col md={8}>
                      <Form.Group className="mb-3">
                        <Form.Label>Nombre del Módulo *</Form.Label>
                        <Form.Control
                          type="text"
                          value={modulo.nombre || ''}
                          onChange={(e) => editarModulo(moduloIndex, 'nombre', e.target.value)}
                          className={formControlClass}
                          style={{ borderColor: borderColor }}
                        />
                      </Form.Group>
                    </Col>
                    <Col md={4}>
                      <Form.Group className="mb-3">
                        <Form.Label>Orden *</Form.Label>
                        <Form.Control
                          type="number"
                          min="1"
                          value={modulo.orden || moduloIndex + 1}
                          onChange={(e) => editarModulo(moduloIndex, 'orden', parseInt(e.target.value) || 1)}
                          className={formControlClass}
                          style={{ borderColor: borderColor }}
                        />
                      </Form.Group>
                    </Col>
                  </Row>

                  <Form.Group className="mb-4">
                    <Form.Label>Descripción del Módulo</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={2}
                      value={modulo.descripcion || ''}
                      onChange={(e) => editarModulo(moduloIndex, 'descripcion', e.target.value)}
                      className={formControlClass}
                      style={{ borderColor: borderColor }}
                    />
                  </Form.Group>

                  {/* CONTENIDOS DEL MÓDULO */}
                  <div className="mt-4">
                    <h6 style={{ color: titleColor }} className="mb-3">
                      Contenidos del Módulo ({modulo.contenidos?.length || 0})
                    </h6>

                    {modulo.contenidos?.map((contenido, contenidoIndex) => (
                      <div key={contenido._id || contenidoIndex} className="mb-4 p-3 rounded" style={{ backgroundColor: innerCardBgColor, border: `1px solid ${borderColor}` }}>
                        <div className="d-flex justify-content-between align-items-center mb-3">
                          <div>
                            <strong>{contenido.nombre}</strong>
                          </div>
                          <Button
                            variant="outline-danger"
                            size="sm"
                            onClick={() => eliminarContenido(moduloIndex, contenidoIndex)}
                          >
                            <Trash size={10} /> Eliminar
                          </Button>
                        </div>

                        {/* NOMBRE DEL CONTENIDO */}
                        <Form.Group className="mb-3">
                          <Form.Label>Nombre del Contenido *</Form.Label>
                          <Form.Control
                            type="text"
                            value={contenido.nombre || ''}
                            onChange={(e) => handleContenidoChange(e, moduloIndex, contenidoIndex, 'nombre')}
                            className={formControlClass}
                            style={{ borderColor: borderColor }}
                          />
                        </Form.Group>

                        {/* TABS PARA RECURSOS */}
                        <Tabs defaultActiveKey="clase" className="mb-3">
                          <Tab eventKey="clase" title="Clase">
                            <div className="p-3">
                              <div className="d-flex justify-content-between align-items-center mb-3">
                                <strong>Diapositivas de Clase (PDFs)</strong>
                                <Button
                                  variant="outline-success"
                                  size="sm"
                                  onClick={() => agregarDiapositiva(moduloIndex, contenidoIndex, 'clase')}
                                >
                                  <Plus size={12} /> Agregar PDF
                                </Button>
                              </div>
                              
                              {contenido.clase?.diapositivas?.map((diapo, diapoIndex) => (
                                <div key={diapoIndex} className="mb-2 d-flex align-items-center">
                                  <Form.Control
                                    type="text"
                                    value={diapo || ''}
                                    onChange={(e) => handleContenidoChange(e, moduloIndex, contenidoIndex, `clase.diapositivas.${diapoIndex}`)}
                                    placeholder={`URL del PDF ${diapoIndex + 1}`}
                                    className={`me-2 ${formControlClass}`}
                                    style={{ borderColor: borderColor }}
                                  />
                                  {contenido.clase.diapositivas.length > 1 && (
                                    <Button
                                      variant="outline-danger"
                                      size="sm"
                                      onClick={() => eliminarDiapositiva(moduloIndex, contenidoIndex, 'clase', diapoIndex)}
                                    >
                                      <Dash size={12} />
                                    </Button>
                                  )}
                                </div>
                              ))}
                            </div>
                          </Tab>

                          <Tab eventKey="autoaprendizaje" title="Autoaprendizaje">
                            <div className="p-3">
                              <Form.Group className="mb-3">
                                <Form.Label>Guía de Estudio (PDF)</Form.Label>
                                <Form.Control
                                  type="text"
                                  value={contenido.autoaprendizaje?.guia_estudio || ''}
                                  onChange={(e) => handleContenidoChange(e, moduloIndex, contenidoIndex, 'autoaprendizaje.guia_estudio')}
                                  placeholder="URL del PDF"
                                  className={formControlClass}
                                  style={{ borderColor: borderColor }}
                                />
                              </Form.Group>
                            </div>
                          </Tab>

                          <Tab eventKey="tutoria" title="Tutoría">
                            <div className="p-3">
                              <div className="mb-3">
                                <div className="d-flex justify-content-between align-items-center mb-3">
                                  <strong>Diapositivas de Tutoría (PDFs)</strong>
                                  <Button
                                    variant="outline-success"
                                    size="sm"
                                    onClick={() => agregarDiapositiva(moduloIndex, contenidoIndex, 'tutoria')}
                                  >
                                    <Plus size={12} /> Agregar PDF
                                  </Button>
                                </div>
                                
                                {contenido.tutoria?.diapositivas?.map((diapo, diapoIndex) => (
                                  <div key={diapoIndex} className="mb-2 d-flex align-items-center">
                                    <Form.Control
                                      type="text"
                                      value={diapo || ''}
                                      onChange={(e) => handleContenidoChange(e, moduloIndex, contenidoIndex, `tutoria.diapositivas.${diapoIndex}`)}
                                      placeholder={`URL del PDF ${diapoIndex + 1}`}
                                      className={`me-2 ${formControlClass}`}
                                      style={{ borderColor: borderColor }}
                                    />
                                    {contenido.tutoria.diapositivas.length > 1 && (
                                      <Button
                                        variant="outline-danger"
                                        size="sm"
                                        onClick={() => eliminarDiapositiva(moduloIndex, contenidoIndex, 'tutoria', diapoIndex)}
                                      >
                                        <Dash size={12} />
                                      </Button>
                                    )}
                                  </div>
                                ))}
                              </div>

                              <Form.Group className="mb-3">
                                <Form.Label>Archivo de Apoyo</Form.Label>
                                <Form.Control
                                  type="text"
                                  value={contenido.tutoria?.apoyo || ''}
                                  onChange={(e) => handleContenidoChange(e, moduloIndex, contenidoIndex, 'tutoria.apoyo')}
                                  placeholder="URL del archivo .rar, .zip, etc."
                                  className={formControlClass}
                                  style={{ borderColor: borderColor }}
                                />
                              </Form.Group>

                              <div className="mb-3">
                                <div className="d-flex justify-content-between align-items-center mb-3">
                                  <strong>Proyectos/Tareas</strong>
                                  <Button
                                    variant="outline-success"
                                    size="sm"
                                    onClick={() => agregarProyecto(moduloIndex, contenidoIndex)}
                                  >
                                    <Plus size={12} /> Agregar Proyecto
                                  </Button>
                                </div>
                                
                                {contenido.tutoria?.proyectos?.map((proyecto, proyectoIndex) => (
                                  <div key={proyectoIndex} className="mb-3 p-3 rounded" style={{ backgroundColor: cardBgColor }}>
                                    <div className="d-flex justify-content-between align-items-center mb-2">
                                      <strong>Proyecto {proyectoIndex + 1}</strong>
                                      {contenido.tutoria.proyectos.length > 1 && (
                                        <Button
                                          variant="outline-danger"
                                          size="sm"
                                          onClick={() => eliminarProyecto(moduloIndex, contenidoIndex, proyectoIndex)}
                                        >
                                          <Dash size={12} />
                                        </Button>
                                      )}
                                    </div>
                                    
                                    <Form.Group className="mb-2">
                                      <Form.Label>Tarea *</Form.Label>
                                      <Form.Control
                                        type="text"
                                        value={proyecto.tarea || ''}
                                        onChange={(e) => handleContenidoChange(e, moduloIndex, contenidoIndex, `tutoria.proyectos.${proyectoIndex}.tarea`)}
                                        placeholder="Descripción de la tarea"
                                        className={formControlClass}
                                        style={{ borderColor: borderColor }}
                                      />
                                    </Form.Group>
                                    
                                    <Form.Group className="mb-2">
                                      <Form.Label>Solución (Opcional)</Form.Label>
                                      <Form.Control
                                        type="text"
                                        value={proyecto.solucion || ''}
                                        onChange={(e) => handleContenidoChange(e, moduloIndex, contenidoIndex, `tutoria.proyectos.${proyectoIndex}.solucion`)}
                                        placeholder="URL o texto con la solución"
                                        className={formControlClass}
                                        style={{ borderColor: borderColor }}
                                      />
                                    </Form.Group>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </Tab>
                        </Tabs>
                      </div>
                    ))}
                  </div>

                  {/* AGREGAR NUEVO CONTENIDO AL MÓDULO */}
                  <div className="mt-4 p-3 rounded" style={{ backgroundColor: innerCardBgColor, border: `1px solid ${borderColor}` }}>
                    <h6 style={{ color: titleColor }} className="mb-3">Agregar Nuevo Contenido</h6>
                    
                    <Form.Group className="mb-3">
                      <Form.Label>Nombre del Contenido *</Form.Label>
                      <Form.Control
                        type="text"
                        value={nuevoContenido.nombre}
                        onChange={(e) => setNuevoContenido(prev => ({ ...prev, nombre: e.target.value }))}
                        placeholder="Ej: Introducción a HTML"
                        className={formControlClass}
                        style={{ borderColor: borderColor }}
                      />
                    </Form.Group>

                    <div className="d-flex justify-content-end">
                      <Button
                        variant="outline-primary"
                        onClick={() => agregarContenido(moduloIndex)}
                      >
                        <Plus /> Agregar Contenido
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center p-4">
                <p>No hay módulos cargados para esta carrera.</p>
              </div>
            )}
          </div>

          {/* SECCIÓN 4: AGREGAR NUEVO MÓDULO */}
          <div className="mb-4 p-3 rounded" style={{ backgroundColor: cardBgColor, border: `1px solid ${borderColor}` }}>
            <h5 style={{ color: titleColor, marginBottom: '1.5rem' }}>Agregar Nuevo Módulo</h5>
            
            <Row>
              <Col md={8}>
                <Form.Group className="mb-3">
                  <Form.Label>Nombre del Módulo *</Form.Label>
                  <Form.Control
                    type="text"
                    value={nuevoModulo.nombre}
                    onChange={(e) => setNuevoModulo(prev => ({ ...prev, nombre: e.target.value }))}
                    placeholder="Ej: HTML y CSS"
                    className={formControlClass}
                    style={{ borderColor: borderColor }}
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Orden</Form.Label>
                  <Form.Control
                    type="number"
                    min="1"
                    value={nuevoModulo.orden}
                    onChange={(e) => setNuevoModulo(prev => ({ ...prev, orden: parseInt(e.target.value) || 1 }))}
                    className={formControlClass}
                    style={{ borderColor: borderColor }}
                  />
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Label>Descripción</Form.Label>
              <Form.Control
                as="textarea"
                rows={2}
                value={nuevoModulo.descripcion}
                onChange={(e) => setNuevoModulo(prev => ({ ...prev, descripcion: e.target.value }))}
                placeholder="Describe este módulo..."
                className={formControlClass}
                style={{ borderColor: borderColor }}
              />
            </Form.Group>

            <div className="d-flex justify-content-end">
              <Button
                variant="primary"
                onClick={agregarModulo}
                style={{ backgroundColor: titleColor, borderColor: titleColor }}
              >
                <Plus className="me-2" />
                Agregar Nuevo Módulo
              </Button>
            </div>
          </div>

          {/* BOTONES FINALES */}
          <div className="d-flex justify-content-end mt-4 pt-3" style={{ borderTop: `1px solid ${borderColor}` }}>
            <Button
              variant="secondary"
              onClick={handleClose}
              className="me-2"
              style={{ backgroundColor: borderColor, borderColor: borderColor }}
            >
              Cancelar
            </Button>
            <Button
              variant="primary"
              type="submit"
              style={{ backgroundColor: titleColor, borderColor: titleColor }}
            >
              Guardar Cambios
            </Button>
          </div>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

export default ModalEditarCarrera;