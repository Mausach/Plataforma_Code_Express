import React, { useState } from 'react';
import { Modal, Button, Form, Row, Col, Accordion, Badge, Tab, Tabs } from 'react-bootstrap';
import Swal from 'sweetalert2';
import { Plus, Dash, Trash, FileEarmarkPdf, FileZip } from 'react-bootstrap-icons';
import { starCrearCarrera } from '../../Helper/CrearCarrera';

export const ModalCrearCarrera = ({
  show,
  handleClose,
  setRefreshData,
  navigate,
  theme
}) => {
  // ========== ESTADOS INICIALES CORREGIDOS ==========
  
  // Estado inicial para nuevo contenido - SIN estado booleano
  const getInitialContenido = () => ({
    nombre: '',
    // ❌ ELIMINADO: estado: true,
    clase: {
      diapositivas: ['']
    },
    autoaprendizaje: {
      guia_estudio: ''
    },
    tutoria: {
      diapositivas: [''],
      apoyo: '',
      proyectos: [{ tarea: '', solucion: '' }]
    }
  });

  const [nuevaCarrera, setNuevaCarrera] = useState({
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
    modulos: []
  });

  // Módulo SIN estado
  const [nuevoModulo, setNuevoModulo] = useState({
    nombre: '',
    descripcion: '',
    orden: 1,
    // ❌ ELIMINADO: estado: 'Activo',
    contenidos: []
  });

  const [nuevoContenido, setNuevoContenido] = useState(getInitialContenido());

  // Clases según tema
  const cardClass = theme === 'lights' ? 'card-light' : 'card-dark';
  const textClass = theme === 'lights' ? 'text-dark' : 'text-light';
  const formControlClass = theme === 'lights' ? 'bg-white text-dark' : 'bg-dark text-light';
  const borderColor = theme === 'lights' ? '#353432' : '#ebe5e5';
  const titleColor = '#EF7F1A';

  // ========== FUNCIONES PARA CARRERA ==========
  const handleChangeCarrera = (e) => {
    const { name, value, type } = e.target;

    if (type === 'number') {
      setNuevaCarrera(prev => ({
        ...prev,
        [name]: parseInt(value) || 0
      }));
    } else {
      setNuevaCarrera(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleRequisitoChange = (index, value) => {
    const nuevosRequisitos = [...nuevaCarrera.requisitos];
    nuevosRequisitos[index] = value;
    setNuevaCarrera(prev => ({
      ...prev,
      requisitos: nuevosRequisitos
    }));
  };

  const agregarRequisito = () => {
    setNuevaCarrera(prev => ({
      ...prev,
      requisitos: [...prev.requisitos, '']
    }));
  };

  const eliminarRequisito = (index) => {
    const nuevosRequisitos = nuevaCarrera.requisitos.filter((_, i) => i !== index);
    setNuevaCarrera(prev => ({
      ...prev,
      requisitos: nuevosRequisitos
    }));
  };

  // ========== FUNCIONES PARA MÓDULOS ==========
  const handleModuloChange = (e) => {
    const { name, value } = e.target;
    setNuevoModulo(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const agregarModulo = () => {
    if (!nuevoModulo.nombre.trim()) {
      Swal.fire({
        title: 'Error',
        text: 'El nombre del módulo es obligatorio',
        icon: 'error',
        background: theme === 'lights' ? '#FAF3E1' : '#0A0E17',
        color: theme === 'lights' ? '#353432' : '#ebe5e5'
      });
      return;
    }

    const moduloConOrden = {
      ...nuevoModulo,
      orden: nuevaCarrera.modulos.length + 1
      // El _id lo generará automáticamente el backend
    };

    setNuevaCarrera(prev => ({
      ...prev,
      modulos: [...prev.modulos, moduloConOrden]
    }));

    setNuevoModulo({
      nombre: '',
      descripcion: '',
      orden: nuevaCarrera.modulos.length + 2,
      contenidos: []
    });
  };

  const eliminarModulo = (index) => {
    Swal.fire({
      title: '¿Eliminar módulo?',
      text: 'Esta acción no se puede deshacer',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
      background: theme === 'lights' ? '#FAF3E1' : '#0A0E17',
      color: theme === 'lights' ? '#353432' : '#ebe5e5'
    }).then((result) => {
      if (result.isConfirmed) {
        const nuevosModulos = nuevaCarrera.modulos.filter((_, i) => i !== index);
        const modulosReordenados = nuevosModulos.map((modulo, idx) => ({
          ...modulo,
          orden: idx + 1
        }));

        setNuevaCarrera(prev => ({
          ...prev,
          modulos: modulosReordenados
        }));
      }
    });
  };

  // ========== FUNCIONES PARA CONTENIDOS ==========
  const handleContenidoChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    // Para campos simples (solo nombre ahora, estado fue eliminado)
    if (!name.includes('.')) {
      setNuevoContenido(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
      return;
    }
    
    // Para campos anidados
    const parts = name.split('.');
    
    try {
      // Caso 1: campo simple anidado (autoaprendizaje.guia_estudio, tutoria.apoyo)
      if (parts.length === 2) {
        const [section, field] = parts;
        setNuevoContenido(prev => ({
          ...prev,
          [section]: {
            ...prev[section],
            [field]: value
          }
        }));
      }
      
      // Caso 2: array con índice (clase.diapositivas.0, tutoria.diapositivas.1)
      else if (parts.length === 3) {
        const [section, arrayName, indexStr] = parts;
        const index = parseInt(indexStr);
        
        if (!isNaN(index)) {
          setNuevoContenido(prev => {
            const newState = JSON.parse(JSON.stringify(prev));
            
            if (!newState[section][arrayName] || !Array.isArray(newState[section][arrayName])) {
              newState[section][arrayName] = [''];
            }
            
            if (index >= newState[section][arrayName].length) {
              const newArray = [...newState[section][arrayName]];
              while (newArray.length <= index) {
                newArray.push('');
              }
              newState[section][arrayName] = newArray;
            }
            
            newState[section][arrayName][index] = value;
            return newState;
          });
        }
      }
      
      // Caso 3: array de objetos (tutoria.proyectos.0.tarea, tutoria.proyectos.0.solucion)
      else if (parts.length === 4) {
        const [section, arrayName, indexStr, field] = parts;
        const index = parseInt(indexStr);
        
        if (!isNaN(index)) {
          setNuevoContenido(prev => {
            const newState = JSON.parse(JSON.stringify(prev));
            
            if (!newState[section][arrayName] || !Array.isArray(newState[section][arrayName])) {
              newState[section][arrayName] = [{ tarea: '', solucion: '' }];
            }
            
            if (index >= newState[section][arrayName].length) {
              const newArray = [...newState[section][arrayName]];
              while (newArray.length <= index) {
                newArray.push({ tarea: '', solucion: '' });
              }
              newState[section][arrayName] = newArray;
            }
            
            newState[section][arrayName][index] = {
              ...newState[section][arrayName][index],
              [field]: value
            };
            
            return newState;
          });
        }
      }
    } catch (error) {
      console.error('Error en handleContenidoChange:', error);
      Swal.fire({
        title: 'Error',
        text: 'Hubo un error al procesar el contenido. Se reseteará el formulario.',
        icon: 'error',
        background: theme === 'lights' ? '#FAF3E1' : '#0A0E17',
        color: theme === 'lights' ? '#353432' : '#ebe5e5'
      });
      setNuevoContenido(getInitialContenido());
    }
  };

  const agregarDiapositiva = (tipo) => {
    setNuevoContenido(prev => {
      const newState = JSON.parse(JSON.stringify(prev));
      
      if (tipo === 'clase') {
        if (!Array.isArray(newState.clase.diapositivas)) {
          newState.clase.diapositivas = [''];
        }
        newState.clase.diapositivas = [...newState.clase.diapositivas, ''];
      } else if (tipo === 'tutoria') {
        if (!Array.isArray(newState.tutoria.diapositivas)) {
          newState.tutoria.diapositivas = [''];
        }
        newState.tutoria.diapositivas = [...newState.tutoria.diapositivas, ''];
      }
      
      return newState;
    });
  };

  const eliminarDiapositiva = (tipo, index) => {
    setNuevoContenido(prev => {
      const newState = JSON.parse(JSON.stringify(prev));
      
      if (tipo === 'clase' && Array.isArray(newState.clase.diapositivas)) {
        newState.clase.diapositivas = newState.clase.diapositivas.filter((_, i) => i !== index);
        if (newState.clase.diapositivas.length === 0) {
          newState.clase.diapositivas = [''];
        }
      } else if (tipo === 'tutoria' && Array.isArray(newState.tutoria.diapositivas)) {
        newState.tutoria.diapositivas = newState.tutoria.diapositivas.filter((_, i) => i !== index);
        if (newState.tutoria.diapositivas.length === 0) {
          newState.tutoria.diapositivas = [''];
        }
      }
      
      return newState;
    });
  };

  const agregarProyecto = () => {
    setNuevoContenido(prev => {
      const newState = JSON.parse(JSON.stringify(prev));
      
      if (!Array.isArray(newState.tutoria.proyectos)) {
        newState.tutoria.proyectos = [{ tarea: '', solucion: '' }];
      }
      newState.tutoria.proyectos = [...newState.tutoria.proyectos, { tarea: '', solucion: '' }];
      
      return newState;
    });
  };

  const eliminarProyecto = (index) => {
    setNuevoContenido(prev => {
      const newState = JSON.parse(JSON.stringify(prev));
      
      if (Array.isArray(newState.tutoria.proyectos)) {
        newState.tutoria.proyectos = newState.tutoria.proyectos.filter((_, i) => i !== index);
        if (newState.tutoria.proyectos.length === 0) {
          newState.tutoria.proyectos = [{ tarea: '', solucion: '' }];
        }
      }
      
      return newState;
    });
  };

  const agregarContenido = (moduloIndex) => {
    if (!nuevoContenido.nombre.trim()) {
      Swal.fire({
        title: 'Error',
        text: 'El nombre del contenido es obligatorio',
        icon: 'error',
        background: theme === 'lights' ? '#FAF3E1' : '#0A0E17',
        color: theme === 'lights' ? '#353432' : '#ebe5e5'
      });
      return;
    }

    const contenidoParaAgregar = JSON.parse(JSON.stringify(nuevoContenido));
    
    contenidoParaAgregar.clase.diapositivas = contenidoParaAgregar.clase.diapositivas
      .filter(diapo => diapo.trim() !== '');
    
    contenidoParaAgregar.tutoria.diapositivas = contenidoParaAgregar.tutoria.diapositivas
      .filter(diapo => diapo.trim() !== '');
    
    contenidoParaAgregar.tutoria.proyectos = contenidoParaAgregar.tutoria.proyectos
      .filter(proyecto => proyecto.tarea.trim() !== '');
    
    const nuevosModulos = [...nuevaCarrera.modulos];
    nuevosModulos[moduloIndex].contenidos = [
      ...nuevosModulos[moduloIndex].contenidos,
      contenidoParaAgregar
    ];

    setNuevaCarrera(prev => ({
      ...prev,
      modulos: nuevosModulos
    }));

    setNuevoContenido(getInitialContenido());
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
      background: theme === 'lights' ? '#FAF3E1' : '#0A0E17',
      color: theme === 'lights' ? '#353432' : '#ebe5e5'
    }).then((result) => {
      if (result.isConfirmed) {
        const nuevosModulos = [...nuevaCarrera.modulos];
        nuevosModulos[moduloIndex].contenidos = nuevosModulos[moduloIndex].contenidos.filter(
          (_, i) => i !== contenidoIndex
        );

        setNuevaCarrera(prev => ({
          ...prev,
          modulos: nuevosModulos
        }));
      }
    });
  };

  // ========== VALIDACIÓN Y ENVÍO - CORREGIDO ==========
  const validarFormulario = () => {
    if (!nuevaCarrera.nombre.trim()) {
      Swal.fire({
        title: 'Error',
        text: 'El nombre de la carrera es obligatorio',
        icon: 'error',
        background: theme === 'lights' ? '#FAF3E1' : '#0A0E17',
        color: theme === 'lights' ? '#353432' : '#ebe5e5'
      });
      return false;
    }

    if (!nuevaCarrera.descripcion.trim()) {
      Swal.fire({
        title: 'Error',
        text: 'La descripción es obligatoria',
        icon: 'error',
        background: theme === 'lights' ? '#FAF3E1' : '#0A0E17',
        color: theme === 'lights' ? '#353432' : '#ebe5e5'
      });
      return false;
    }

    if (!nuevaCarrera.duracion.trim()) {
      Swal.fire({
        title: 'Error',
        text: 'La duración es obligatoria',
        icon: 'error',
        background: theme === 'lights' ? '#FAF3E1' : '#0A0E17',
        color: theme === 'lights' ? '#353432' : '#ebe5e5'
      });
      return false;
    }

    if (!nuevaCarrera.duracion_de_cada_clase.trim()) {
      Swal.fire({
        title: 'Error',
        text: 'La duración de cada clase es obligatoria',
        icon: 'error',
        background: theme === 'lights' ? '#FAF3E1' : '#0A0E17',
        color: theme === 'lights' ? '#353432' : '#ebe5e5'
      });
      return false;
    }

    if (!nuevaCarrera.titulo_certificacion.trim()) {
      Swal.fire({
        title: 'Error',
        text: 'El título de certificación es obligatorio',
        icon: 'error',
        background: theme === 'lights' ? '#FAF3E1' : '#0A0E17',
        color: theme === 'lights' ? '#353432' : '#ebe5e5'
      });
      return false;
    }

    if (!nuevaCarrera.precio.trim()) {
      Swal.fire({
        title: 'Error',
        text: 'El precio es obligatorio',
        icon: 'error',
        background: theme === 'lights' ? '#FAF3E1' : '#0A0E17',
        color: theme === 'lights' ? '#353432' : '#ebe5e5'
      });
      return false;
    }

    const requisitosValidos = nuevaCarrera.requisitos.some(req => req.trim() !== '');
    if (!requisitosValidos) {
      Swal.fire({
        title: 'Error',
        text: 'Debe agregar al menos un requisito',
        icon: 'error',
        background: theme === 'lights' ? '#FAF3E1' : '#0A0E17',
        color: theme === 'lights' ? '#353432' : '#ebe5e5'
      });
      return false;
    }

    if (nuevaCarrera.modulos.length === 0) {
      Swal.fire({
        title: 'Error',
        text: 'Debe agregar al menos un módulo',
        icon: 'error',
        background: theme === 'lights' ? '#FAF3E1' : '#0A0E17',
        color: theme === 'lights' ? '#353432' : '#ebe5e5'
      });
      return false;
    }

    const modulosSinContenidos = nuevaCarrera.modulos.some(modulo => 
      !modulo.contenidos || modulo.contenidos.length === 0
    );
    if (modulosSinContenidos) {
      Swal.fire({
        title: 'Error',
        text: 'Cada módulo debe tener al menos un contenido',
        icon: 'error',
        background: theme === 'lights' ? '#FAF3E1' : '#0A0E17',
        color: theme === 'lights' ? '#353432' : '#ebe5e5'
      });
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validarFormulario()) {
      return;
    }

    try {
      // PREPARAR DATOS EXACTAMENTE como espera el backend
      const datosParaEnviar = {
        nombre: nuevaCarrera.nombre.trim(),
        descripcion: nuevaCarrera.descripcion.trim(),
        duracion: nuevaCarrera.duracion.trim(),
        clases_por_semana: parseInt(nuevaCarrera.clases_por_semana) || 1,
        duracion_de_cada_clase: nuevaCarrera.duracion_de_cada_clase.trim(),
        titulo_certificacion: nuevaCarrera.titulo_certificacion.trim(),
        precio: nuevaCarrera.precio.trim(),
        modalidad: nuevaCarrera.modalidad,
        estado: nuevaCarrera.estado,
        
        // Requisitos como array de strings
        requisitos: nuevaCarrera.requisitos
          .filter(req => req.trim() !== '')
          .map(req => req.trim()),
        
        // Módulos procesados SIN estado
        modulos: nuevaCarrera.modulos.map((modulo, index) => ({
          nombre: modulo.nombre.trim(),
          descripcion: modulo.descripcion?.trim() || '',
          orden: modulo.orden || (index + 1),
          // ❌ ELIMINADO: estado: modulo.estado || 'Activo',
          
          // Contenidos procesados SIN estado booleano
          contenidos: modulo.contenidos.map(contenido => ({
            nombre: contenido.nombre.trim(),
            // ❌ ELIMINADO: estado: contenido.estado !== undefined ? contenido.estado : true,
            
            // CLASE: array de diapositivas
            clase: {
              diapositivas: Array.isArray(contenido.clase?.diapositivas) 
                ? contenido.clase.diapositivas
                    .filter(diapo => diapo.trim() !== '')
                    .map(diapo => diapo.trim())
                : []
            },
            
            // AUTOAPRENDIZAJE: guía única
            autoaprendizaje: {
              guia_estudio: contenido.autoaprendizaje?.guia_estudio?.trim() || ''
            },
            
            // TUTORÍA: estructura completa
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

      console.log('Datos a enviar (estructura final):', datosParaEnviar);
      
      // Llamar al helper para crear la carrera
      await starCrearCarrera(datosParaEnviar, setRefreshData, navigate, theme);

      // Resetear formulario solo si fue exitoso
      setNuevaCarrera({
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
        modulos: []
      });
      
      setNuevoContenido(getInitialContenido());
      setNuevoModulo({
        nombre: '',
        descripcion: '',
        orden: 1,
        contenidos: []
      });

    } catch (error) {
      console.error('Error al crear carrera:', error);
    }
  };

  const resetForm = () => {
    setNuevaCarrera({
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
      modulos: []
    });
    setNuevoContenido(getInitialContenido());
    setNuevoModulo({
      nombre: '',
      descripcion: '',
      orden: 1,
      contenidos: []
    });
    handleClose();
  };

  // ========== COMPONENTES DE RENDERIZADO ==========
  
  const renderDiapositivas = (tipo) => {
    const diapositivas = tipo === 'clase' 
      ? nuevoContenido.clase.diapositivas 
      : nuevoContenido.tutoria.diapositivas;
    
    if (!Array.isArray(diapositivas)) {
      return <div className="text-danger">Error: las diapositivas no son un array</div>;
    }
    
    return diapositivas.map((diapo, diapoIndex) => (
      <div key={diapoIndex} className="mb-2 d-flex align-items-center">
        <Form.Control
          type="text"
          value={diapo || ''}
          onChange={(e) => handleContenidoChange({
            target: {
              name: `${tipo}.diapositivas.${diapoIndex}`,
              value: e.target.value
            }
          })}
          placeholder={`URL del PDF ${diapoIndex + 1}`}
          className={`me-2 ${formControlClass}`}
          style={{ borderColor: borderColor, color: 'inherit' }}
        />
        {diapositivas.length > 1 && (
          <Button
            variant="outline-danger"
            size="sm"
            onClick={() => eliminarDiapositiva(tipo, diapoIndex)}
            style={{ borderColor: borderColor }}
          >
            <Dash size={12} />
          </Button>
        )}
      </div>
    ));
  };

  const renderProyectos = () => {
    const proyectos = nuevoContenido.tutoria.proyectos;
    
    if (!Array.isArray(proyectos)) {
      return <div className="text-danger">Error: los proyectos no son un array</div>;
    }
    
    return proyectos.map((proyecto, proyectoIndex) => (
      <div key={proyectoIndex} className="mb-3 p-3 rounded" style={{
        backgroundColor: theme === 'lights' ? '#FFFFFF' : '#1F2535',
        border: `1px solid ${borderColor}`
      }}>
        <div className="d-flex justify-content-between align-items-center mb-2">
          <strong>Proyecto {proyectoIndex + 1}</strong>
          {proyectos.length > 1 && (
            <Button
              variant="outline-danger"
              size="sm"
              onClick={() => eliminarProyecto(proyectoIndex)}
              style={{ borderColor: borderColor }}
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
            onChange={(e) => handleContenidoChange({
              target: {
                name: `tutoria.proyectos.${proyectoIndex}.tarea`,
                value: e.target.value
              }
            })}
            placeholder="Descripción de la tarea"
            className={formControlClass}
            style={{ borderColor: borderColor, color: 'inherit' }}
          />
        </Form.Group>

        <Form.Group className="mb-2">
          <Form.Label>Solución (Opcional)</Form.Label>
          <Form.Control
            type="text"
            value={proyecto.solucion || ''}
            onChange={(e) => handleContenidoChange({
              target: {
                name: `tutoria.proyectos.${proyectoIndex}.solucion`,
                value: e.target.value
              }
            })}
            placeholder="URL o texto con la solución"
            className={formControlClass}
            style={{ borderColor: borderColor, color: 'inherit' }}
          />
        </Form.Group>
      </div>
    ));
  };

  return (
    <Modal
      show={show}
      onHide={resetForm}
      size="xl"
      fullscreen="lg-down"
      centered
      className={theme}
      scrollable
    >
      <Modal.Header
        closeButton
        className={`${cardClass} ${textClass}`}
        style={{
          borderBottomColor: theme === 'lights' ? '#E0D8C5' : '#1F2535'
        }}
      >
        <Modal.Title style={{ color: titleColor }}>
          Crear Nueva Carrera
        </Modal.Title>
      </Modal.Header>

      <Modal.Body className={`${cardClass} ${textClass}`}>
        <Form onSubmit={handleSubmit}>
          {/* Información Básica */}
          <div className="mb-4">
            <h5 style={{ color: titleColor, marginBottom: '1.5rem' }}>
              Información Básica
            </h5>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Nombre de la Carrera *</Form.Label>
                  <Form.Control
                    type="text"
                    name="nombre"
                    value={nuevaCarrera.nombre}
                    onChange={handleChangeCarrera}
                    placeholder="Ej: Desarrollo Web Full Stack"
                    required
                    className={formControlClass}
                    style={{ borderColor: borderColor, color: 'inherit' }}
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Descripción *</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    name="descripcion"
                    value={nuevaCarrera.descripcion}
                    onChange={handleChangeCarrera}
                    placeholder="Describe la carrera..."
                    required
                    className={formControlClass}
                    style={{ borderColor: borderColor, color: 'inherit' }}
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Duración Total *</Form.Label>
                  <Form.Control
                    type="text"
                    name="duracion"
                    value={nuevaCarrera.duracion}
                    onChange={handleChangeCarrera}
                    placeholder="Ej: 6 meses"
                    required
                    className={formControlClass}
                    style={{ borderColor: borderColor, color: 'inherit' }}
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Clases por Semana *</Form.Label>
                  <Form.Control
                    type="number"
                    name="clases_por_semana"
                    min="1"
                    max="10"
                    value={nuevaCarrera.clases_por_semana}
                    onChange={handleChangeCarrera}
                    required
                    className={formControlClass}
                    style={{ borderColor: borderColor, color: 'inherit' }}
                  />
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Duración de Cada Clase *</Form.Label>
                  <Form.Control
                    type="text"
                    name="duracion_de_cada_clase"
                    value={nuevaCarrera.duracion_de_cada_clase}
                    onChange={handleChangeCarrera}
                    placeholder="Ej: 2 horas"
                    required
                    className={formControlClass}
                    style={{ borderColor: borderColor, color: 'inherit' }}
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Título de Certificación *</Form.Label>
                  <Form.Control
                    type="text"
                    name="titulo_certificacion"
                    value={nuevaCarrera.titulo_certificacion}
                    onChange={handleChangeCarrera}
                    placeholder="Ej: Desarrollador Web Full Stack"
                    required
                    className={formControlClass}
                    style={{ borderColor: borderColor, color: 'inherit' }}
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Precio *</Form.Label>
                  <Form.Control
                    type="text"
                    name="precio"
                    value={nuevaCarrera.precio}
                    onChange={handleChangeCarrera}
                    placeholder="Ej: $50,000"
                    required
                    className={formControlClass}
                    style={{ borderColor: borderColor, color: 'inherit' }}
                  />
                </Form.Group>

                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Modalidad *</Form.Label>
                      <Form.Select
                        name="modalidad"
                        value={nuevaCarrera.modalidad}
                        onChange={handleChangeCarrera}
                        required
                        className={formControlClass}
                        style={{ borderColor: borderColor, color: 'inherit' }}
                      >
                        <option value="part-time">Part-Time</option>
                        <option value="full-time">Full-Time</option>
                        <option value="grabado">Grabado</option>
                      </Form.Select>
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Estado *</Form.Label>
                      <Form.Select
                        name="estado"
                        value={nuevaCarrera.estado}
                        onChange={handleChangeCarrera}
                        required
                        className={formControlClass}
                        style={{ borderColor: borderColor, color: 'inherit' }}
                      >
                        <option value="En desarrollo">En desarrollo</option>
                        <option value="Activo">Activo</option>
                        <option value="Inactivo">Inactivo</option>
                        <option value="Archivado">Archivado</option>
                      </Form.Select>
                    </Form.Group>
                  </Col>
                </Row>
              </Col>
            </Row>
          </div>

          {/* Requisitos */}
          <div className="mb-4">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5 style={{ color: titleColor, margin: 0 }}>
                Requisitos *
              </h5>
              <Button
                variant="outline-success"
                size="sm"
                onClick={agregarRequisito}
                style={{ borderColor: borderColor, color: 'inherit' }}
              >
                <Plus /> Agregar Requisito
              </Button>
            </div>

            {nuevaCarrera.requisitos.map((requisito, index) => (
              <div key={index} className="mb-2 d-flex align-items-center">
                <Form.Control
                  type="text"
                  value={requisito}
                  onChange={(e) => handleRequisitoChange(index, e.target.value)}
                  placeholder={`Requisito ${index + 1}`}
                  className={`me-2 ${formControlClass}`}
                  style={{ borderColor: borderColor, color: 'inherit' }}
                />
                {nuevaCarrera.requisitos.length > 1 && (
                  <Button
                    variant="outline-danger"
                    size="sm"
                    onClick={() => eliminarRequisito(index)}
                    style={{ borderColor: borderColor }}
                  >
                    <Dash />
                  </Button>
                )}
              </div>
            ))}
          </div>

          {/* Módulos y Contenidos */}
          <div className="mb-4">
            <h5 style={{ color: titleColor, marginBottom: '1.5rem' }}>
              Módulos y Contenidos *
            </h5>

            {/* Formulario para agregar nuevo módulo - SIN estado */}
            <div className="mb-4 p-3 rounded" style={{
              backgroundColor: theme === 'lights' ? '#f8f9fa' : '#2a3042',
              border: `1px solid ${borderColor}`
            }}>
              <h6 style={{ color: titleColor }}>Agregar Nuevo Módulo</h6>
              <Row>
                <Col md={12}>
                  <Form.Group className="mb-3">
                    <Form.Label>Nombre del Módulo *</Form.Label>
                    <Form.Control
                      type="text"
                      name="nombre"
                      value={nuevoModulo.nombre}
                      onChange={handleModuloChange}
                      placeholder="Ej: HTML y CSS"
                      className={formControlClass}
                      style={{ borderColor: borderColor, color: 'inherit' }}
                    />
                  </Form.Group>
                </Col>
              </Row>

              <Form.Group className="mb-3">
                <Form.Label>Descripción del Módulo</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={2}
                  name="descripcion"
                  value={nuevoModulo.descripcion}
                  onChange={handleModuloChange}
                  placeholder="Describe este módulo..."
                  className={formControlClass}
                  style={{ borderColor: borderColor, color: 'inherit' }}
                />
              </Form.Group>

              <div className="d-flex justify-content-end">
                <Button
                  variant="primary"
                  onClick={agregarModulo}
                  style={{
                    backgroundColor: titleColor,
                    borderColor: titleColor
                  }}
                >
                  <Plus className="me-2" />
                  Agregar Módulo
                </Button>
              </div>
            </div>

            {/* Lista de módulos agregados */}
            {nuevaCarrera.modulos.length > 0 && (
              <div className="mb-4">
                <h6 style={{ color: titleColor }} className="mb-3">
                  Módulos Agregados ({nuevaCarrera.modulos.length})
                </h6>

                <Accordion>
                  {nuevaCarrera.modulos.map((modulo, moduloIndex) => (
                    <Accordion.Item
                      key={modulo._id || moduloIndex}
                      eventKey={moduloIndex.toString()}
                      className={cardClass}
                    >
                      <Accordion.Header className={textClass}>
                        <div className="d-flex justify-content-between w-100 me-3">
                          <span>
                            {modulo.orden}. {modulo.nombre}
                          </span>
                          {/* ❌ ELIMINADO: Badge de estado del módulo */}
                        </div>
                      </Accordion.Header>

                      <Accordion.Body>
                        {/* Descripción del módulo */}
                        <div className="mb-3">
                          <strong>Descripción:</strong>
                          <p className="mb-2">{modulo.descripcion || 'Sin descripción'}</p>
                        </div>

                        {/* Formulario para agregar contenido - SIN estado */}
                        <div className="mb-4 p-3 rounded" style={{
                          backgroundColor: theme === 'lights' ? '#f8f9fa' : '#2a3042',
                          border: `1px solid ${borderColor}`
                        }}>
                          <h6 style={{ color: titleColor }} className="mb-3">
                            Agregar Nuevo Contenido
                          </h6>

                          <Form.Group className="mb-3">
                            <Form.Label>Nombre del Contenido *</Form.Label>
                            <Form.Control
                              type="text"
                              name="nombre"
                              value={nuevoContenido.nombre}
                              onChange={handleContenidoChange}
                              placeholder="Ej: Introducción a HTML"
                              className={formControlClass}
                              style={{ borderColor: borderColor, color: 'inherit' }}
                            />
                          </Form.Group>

                          {/* ❌ ELIMINADO: Checkbox de estado del contenido */}

                          {/* TABS para diferentes secciones */}
                          <Tabs defaultActiveKey="clase" className="mb-3">
                            {/* Tab CLASE */}
                            <Tab eventKey="clase" title="Clase">
                              <div className="p-3">
                                <div className="d-flex justify-content-between align-items-center mb-2">
                                  <strong>Diapositivas de Clase (PDFs)</strong>
                                  <Button
                                    variant="outline-success"
                                    size="sm"
                                    onClick={() => agregarDiapositiva('clase')}
                                    style={{ borderColor: borderColor }}
                                  >
                                    <Plus size={12} /> Agregar PDF
                                  </Button>
                                </div>
                                {renderDiapositivas('clase')}
                              </div>
                            </Tab>

                            {/* Tab AUTOAPRENDIZAJE */}
                            <Tab eventKey="autoaprendizaje" title="Autoaprendizaje">
                              <div className="p-3">
                                <Form.Group className="mb-3">
                                  <Form.Label>Guía de Estudio (PDF)</Form.Label>
                                  <Form.Control
                                    type="text"
                                    name="autoaprendizaje.guia_estudio"
                                    value={nuevoContenido.autoaprendizaje.guia_estudio || ''}
                                    onChange={handleContenidoChange}
                                    placeholder="URL del PDF de guía de estudio"
                                    className={formControlClass}
                                    style={{ borderColor: borderColor, color: 'inherit' }}
                                  />
                                  <Form.Text className={textClass}>
                                    <FileEarmarkPdf className="me-1" />
                                    PDF único para autoaprendizaje
                                  </Form.Text>
                                </Form.Group>
                              </div>
                            </Tab>

                            {/* Tab TUTORÍA */}
                            <Tab eventKey="tutoria" title="Tutoría">
                              <div className="p-3">
                                {/* Diapositivas de Tutoría */}
                                <div className="mb-3">
                                  <div className="d-flex justify-content-between align-items-center mb-2">
                                    <strong>Diapositivas de Tutoría (PDFs)</strong>
                                    <Button
                                      variant="outline-success"
                                      size="sm"
                                      onClick={() => agregarDiapositiva('tutoria')}
                                      style={{ borderColor: borderColor }}
                                    >
                                      <Plus size={12} /> Agregar PDF
                                    </Button>
                                  </div>
                                  {renderDiapositivas('tutoria')}
                                </div>

                                {/* Archivo de Apoyo */}
                                <Form.Group className="mb-3">
                                  <Form.Label>Archivo de Apoyo</Form.Label>
                                  <Form.Control
                                    type="text"
                                    name="tutoria.apoyo"
                                    value={nuevoContenido.tutoria.apoyo || ''}
                                    onChange={handleContenidoChange}
                                    placeholder="URL del archivo .rar, .zip, etc."
                                    className={formControlClass}
                                    style={{ borderColor: borderColor, color: 'inherit' }}
                                  />
                                  <Form.Text className={textClass}>
                                    <FileZip className="me-1" />
                                    Archivo comprimido con material adicional
                                  </Form.Text>
                                </Form.Group>

                                {/* Proyectos */}
                                <div className="mb-3">
                                  <div className="d-flex justify-content-between align-items-center mb-2">
                                    <strong>Proyectos/Tareas</strong>
                                    <Button
                                      variant="outline-success"
                                      size="sm"
                                      onClick={agregarProyecto}
                                      style={{ borderColor: borderColor }}
                                    >
                                      <Plus size={12} /> Agregar Proyecto
                                    </Button>
                                  </div>
                                  {renderProyectos()}
                                </div>
                              </div>
                            </Tab>
                          </Tabs>

                          <div className="d-flex justify-content-end">
                            <Button
                              variant="outline-primary"
                              size="sm"
                              onClick={() => agregarContenido(moduloIndex)}
                              style={{ borderColor: borderColor, color: 'inherit' }}
                            >
                              <Plus /> Agregar Contenido
                            </Button>
                          </div>
                        </div>

                        {/* Lista de contenidos del módulo - SIN estado */}
                        {modulo.contenidos && modulo.contenidos.length > 0 && (
                          <div className="mt-4">
                            <strong>Contenidos Agregados ({modulo.contenidos.length}):</strong>

                            {modulo.contenidos.map((contenido, contenidoIndex) => (
                              <div
                                key={contenido._id || contenidoIndex}
                                className="mt-2 p-3 rounded"
                                style={{
                                  backgroundColor: theme === 'lights' ? '#FFFFFF' : '#1F2535',
                                  border: `1px solid ${borderColor}`
                                }}
                              >
                                <div className="d-flex justify-content-between align-items-center mb-2">
                                  <div>
                                    <span className={textClass}>
                                      • {contenido.nombre}
                                    </span>
                                    {/* ❌ ELIMINADO: Badge de estado del contenido */}

                                    {/* Mostrar resumen de archivos */}
                                    {Array.isArray(contenido.clase?.diapositivas) && 
                                     contenido.clase.diapositivas.filter(d => d && d.trim()).length > 0 && (
                                      <Badge bg="info" className="ms-2" size="sm">
                                        <FileEarmarkPdf className="me-1" />
                                        {contenido.clase.diapositivas.filter(d => d && d.trim()).length} PDFs Clase
                                      </Badge>
                                    )}

                                    {contenido.autoaprendizaje?.guia_estudio && (
                                      <Badge bg="warning" className="ms-2" size="sm">
                                        <FileEarmarkPdf className="me-1" />
                                        Guía
                                      </Badge>
                                    )}
                                  </div>

                                  <Button
                                    variant="outline-danger"
                                    size="sm"
                                    onClick={() => eliminarContenido(moduloIndex, contenidoIndex)}
                                    style={{ borderColor: borderColor }}
                                  >
                                    <Dash />
                                  </Button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </Accordion.Body>
                    </Accordion.Item>
                  ))}
                </Accordion>
              </div>
            )}
          </div>

          {/* Botones de acción */}
          <div className="d-flex justify-content-end mt-4 pt-3"
            style={{
              borderTop: `1px solid ${theme === 'lights' ? '#E0D8C5' : '#1F2535'}`
            }}
          >
            <Button
              variant="secondary"
              onClick={resetForm}
              className="me-2"
              style={{
                backgroundColor: theme === 'lights' ? '#353432' : '#1F2535',
                borderColor: theme === 'lights' ? '#353432' : '#1F2535'
              }}
            >
              Cancelar
            </Button>

            <Button
              variant="primary"
              type="submit"
              style={{
                backgroundColor: titleColor,
                borderColor: titleColor
              }}
            >
              Crear Carrera
            </Button>
          </div>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

export default ModalCrearCarrera;