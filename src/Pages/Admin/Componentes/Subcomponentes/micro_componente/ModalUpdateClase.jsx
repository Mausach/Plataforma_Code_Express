// Components/Subcomponentes/ModalEditarClase.jsx
import React, { useState, useEffect } from 'react';
import { Modal, Form, Row, Col, Button, Spinner } from 'react-bootstrap';
import { Pencil } from 'react-bootstrap-icons';
import Swal from 'sweetalert2';
import { actualizarClase } from '../../../Helper/EditarClase';
//import { actualizarClase } from '../../Helper/ClasesHelper';

const ModalEditarClase = ({ 
  show, 
  onHide, 
  claseId, 
  onClaseActualizada,
  theme = 'lights' 
}) => {
  const isLight = theme === 'lights';
  
  // ===== COLORS BASED ON THEME =====
  const themeColors = {
    text: isLight ? '#212529' : '#E9ECEF',
    bg: isLight ? '#FFFFFF' : '#1A1F2E',
    cardBg: isLight ? '#F8F9FA' : '#252A3A',
    border: isLight ? '#DEE2E6' : '#3A4255',
    inputBg: isLight ? '#FFFFFF' : '#2D3447',
    inputBorder: isLight ? '#CED4DA' : '#4A5368',
  };

  // ===== STATES =====
  const [guardando, setGuardando] = useState(false);
  const [formData, setFormData] = useState({
    tema: '',
    descripcion: '',
    fecha: '',
    horario_inicio: '',
    horario_fin: '',
    estado: 'Programada'
  });

  // ===== RESETEAR FORM CUANDO SE ABRE/CIERRA =====
  useEffect(() => {
    if (show) {
      // Cuando se abre el modal, NO cargamos datos del backend
      // Solo inicializamos con valores vacíos o por defecto
      setFormData({
        tema: '',
        descripcion: '',
        fecha: new Date().toISOString().split('T')[0],
        horario_inicio: '18:00',
        horario_fin: '20:00',
        estado: 'Programada'
      });
    }
  }, [show]);

  // ===== HANDLERS =====
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setGuardando(true);
    
    try {
      console.log('💾 Actualizando clase:', claseId, formData);
      
      const resultado = await actualizarClase(claseId, formData);
      console.log(formData)
      if (resultado.success) {
        await Swal.fire({
          title: '✅ Clase actualizada',
          text: 'Los cambios se guardaron correctamente',
          icon: 'success',
          timer: 2000,
          timerProgressBar: true,
          showConfirmButton: false,
          background: isLight ? '#FAF3E1' : '#0A0E17',
          color: isLight ? '#353432' : '#ebe5e5',
        });
        
        if (onClaseActualizada) {
          onClaseActualizada(resultado.data);
        }
        
        onHide();
      } else {
        throw new Error(resultado.error || 'Error al guardar');
      }
    } catch (error) {
      console.error('❌ Error guardando clase:', error);
      Swal.fire({
        title: '❌ Error',
        text: error.message || 'No se pudo guardar los cambios',
        icon: 'error',
        confirmButtonText: 'Aceptar',
        background: isLight ? '#FAF3E1' : '#0A0E17',
        color: isLight ? '#353432' : '#ebe5e5',
      });
    } finally {
      setGuardando(false);
    }
  };

  return (
    <Modal
      show={show}
      onHide={onHide}
      size="lg"
      centered
      data-bs-theme={isLight ? 'light' : 'dark'}
    >
      <Modal.Header 
        closeButton 
        style={{ 
          backgroundColor: themeColors.cardBg,
          borderColor: themeColors.border
        }}
      >
        <Modal.Title style={{ color: themeColors.text }}>
          <Pencil className="me-2" />
          Editar Clase
          {claseId && (
            <small className="ms-2 text-muted" style={{ fontSize: '14px' }}>
              ID: {claseId.substring(0, 8)}...
            </small>
          )}
        </Modal.Title>
      </Modal.Header>
      
      <Form onSubmit={handleSubmit}>
        <Modal.Body style={{ backgroundColor: themeColors.bg }}>
          <Row>
            <Col md={8}>
              <Form.Group className="mb-3">
                <Form.Label style={{ color: themeColors.text }}>
                  Tema de la clase <span className="text-danger">*</span>
                </Form.Label>
                <Form.Control
                  type="text"
                  name="tema"
                  value={formData.tema}
                  onChange={handleChange}
                  placeholder="Ej: Introducción a React"
                  required
                  style={{
                    backgroundColor: themeColors.inputBg,
                    borderColor: themeColors.inputBorder,
                    color: themeColors.text
                  }}
                />
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group className="mb-3">
                <Form.Label style={{ color: themeColors.text }}>
                  Estado
                </Form.Label>
                <Form.Select
                  name="estado"
                  value={formData.estado}
                  onChange={handleChange}
                  style={{
                    backgroundColor: themeColors.inputBg,
                    borderColor: themeColors.inputBorder,
                    color: themeColors.text
                  }}
                >
                  <option value="Programada">📅 Programada</option>
                  <option value="En curso">⏳ En curso</option>
                  <option value="Realizada">✅ Realizada</option>
                  <option value="Cancelada">❌ Cancelada</option>
                  <option value="Reprogramada">🔄 Reprogramada</option>
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>
          
          <Form.Group className="mb-3">
            <Form.Label style={{ color: themeColors.text }}>
              Descripción
            </Form.Label>
            <Form.Control
              as="textarea"
              name="descripcion"
              value={formData.descripcion}
              onChange={handleChange}
              rows={3}
              placeholder="Describe el contenido de la clase..."
              style={{
                backgroundColor: themeColors.inputBg,
                borderColor: themeColors.inputBorder,
                color: themeColors.text
              }}
            />
          </Form.Group>
          
          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label style={{ color: themeColors.text }}>
                  Fecha <span className="text-danger">*</span>
                </Form.Label>
                <Form.Control
                  type="date"
                  name="fecha"
                  value={formData.fecha}
                  onChange={handleChange}
                  required
                  style={{
                    backgroundColor: themeColors.inputBg,
                    borderColor: themeColors.inputBorder,
                    color: themeColors.text
                  }}
                />
              </Form.Group>
            </Col>
            <Col md={3}>
              <Form.Group className="mb-3">
                <Form.Label style={{ color: themeColors.text }}>
                  Hora inicio <span className="text-danger">*</span>
                </Form.Label>
                <Form.Control
                  type="time"
                  name="horario_inicio"
                  value={formData.horario_inicio}
                  onChange={handleChange}
                  required
                  style={{
                    backgroundColor: themeColors.inputBg,
                    borderColor: themeColors.inputBorder,
                    color: themeColors.text
                  }}
                />
              </Form.Group>
            </Col>
            <Col md={3}>
              <Form.Group className="mb-3">
                <Form.Label style={{ color: themeColors.text }}>
                  Hora fin <span className="text-danger">*</span>
                </Form.Label>
                <Form.Control
                  type="time"
                  name="horario_fin"
                  value={formData.horario_fin}
                  onChange={handleChange}
                  required
                  style={{
                    backgroundColor: themeColors.inputBg,
                    borderColor: themeColors.inputBorder,
                    color: themeColors.text
                  }}
                />
              </Form.Group>
            </Col>
          </Row>
        </Modal.Body>
        
        <Modal.Footer style={{ 
          backgroundColor: themeColors.cardBg,
          borderColor: themeColors.border
        }}>
          <Button 
            variant="secondary" 
            onClick={onHide}
            disabled={guardando}
          >
            Cancelar
          </Button>
          <Button 
            variant="primary"
            type="submit"
            disabled={guardando}
          >
            {guardando ? (
              <>
                <Spinner animation="border" size="sm" className="me-2" />
                Guardando...
              </>
            ) : (
              'Guardar Cambios'
            )}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default ModalEditarClase;