import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Row, Col } from 'react-bootstrap';
import Swal from 'sweetalert2';
import { starEditarUsuario } from '../../Helper/EditarUsuarios';
//import { starEditarUsuario } from '../Helper/EditarUsuario'; // Cambié el helper

export const ModalEditarUsuario = ({
  show,
  handleClose,
  usuario,
  setRefreshData,
  navigate,
  theme // ✅ Agregué el tema como prop
}) => {
  // Estado con los campos de TU modelo de Usuario
  const [editedUsuario, setEditedUsuario] = useState({
    _id: '',
    nombres: '',
    apellido: '',
    dni: '',
    fecha_nacimiento: '',
    genero: '',
    telefono: '',
    provincia: '',
    rol: '',
    email: '',
    estado: true
  });

  // Clases CSS según tema
  const cardClass = theme === 'lights' ? 'card-light' : 'card-dark';
  const textClass = theme === 'lights' ? 'text-dark' : 'text-light';
  const formControlClass = theme === 'lights' ? 'bg-white text-dark' : 'bg-dark text-light';
  const borderColor = theme === 'lights' ? '#353432' : '#ebe5e5';
  const titleColor = '#EF7F1A'; // Tu naranja para títulos

  // Cargar datos del usuario cuando se abre el modal
  useEffect(() => {
    if (usuario) {
      setEditedUsuario({
        _id: usuario._id,
        nombres: usuario.nombres || '',
        apellido: usuario.apellido || '',
        dni: usuario.dni || '',
        fecha_nacimiento: usuario.fecha_nacimiento || '',
        genero: usuario.genero || '',
        telefono: usuario.telefono || '',
        provincia: usuario.provincia || '',
        rol: usuario.rol || 'Alumno',
        email: usuario.email || '',
        estado: usuario.estado !== undefined ? usuario.estado : true
      });
    }
  }, [usuario]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditedUsuario(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validaciones básicas (igual estructura que el original)
    if (!editedUsuario.nombres.trim()) {
      Swal.fire({
        title: 'Error',
        text: 'Los nombres son obligatorios',
        icon: 'error',
        background: theme === 'lights' ? '#FAF3E1' : '#0A0E17',
        color: theme === 'lights' ? '#353432' : '#ebe5e5'
      });
      return;
    }

    if (!editedUsuario.apellido.trim()) {
      Swal.fire({
        title: 'Error',
        text: 'El apellido es obligatorio',
        icon: 'error',
        background: theme === 'lights' ? '#FAF3E1' : '#0A0E17',
        color: theme === 'lights' ? '#353432' : '#ebe5e5'
      });
      return;
    }

    if (!editedUsuario.dni.trim()) {
      Swal.fire({
        title: 'Error',
        text: 'El DNI es obligatorio',
        icon: 'error',
        background: theme === 'lights' ? '#FAF3E1' : '#0A0E17',
        color: theme === 'lights' ? '#353432' : '#ebe5e5'
      });
      return;
    }

    // Validación DNI (7-10 dígitos numéricos)
    if (!/^\d{7,10}$/.test(editedUsuario.dni)) {
      Swal.fire({
        title: 'Error',
        text: 'El DNI debe tener entre 7 y 10 dígitos numéricos',
        icon: 'error',
        background: theme === 'lights' ? '#FAF3E1' : '#0A0E17',
        color: theme === 'lights' ? '#353432' : '#ebe5e5'
      });
      return;
    }

    // Validación email
    if (!editedUsuario.email.trim()) {
      Swal.fire({
        title: 'Error',
        text: 'El email es obligatorio',
        icon: 'error',
        background: theme === 'lights' ? '#FAF3E1' : '#0A0E17',
        color: theme === 'lights' ? '#353432' : '#ebe5e5'
      });
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(editedUsuario.email)) {
      Swal.fire({
        title: 'Error',
        text: 'Ingrese un email válido',
        icon: 'error',
        background: theme === 'lights' ? '#FAF3E1' : '#0A0E17',
        color: theme === 'lights' ? '#353432' : '#ebe5e5'
      });
      return;
    }

    // Validación teléfono (entre 7 y 15 dígitos)
    if (!/^\d{7,15}$/.test(editedUsuario.telefono)) {
      Swal.fire({
        title: 'Error',
        text: 'El teléfono debe tener entre 7 y 15 dígitos',
        icon: 'error',
        background: theme === 'lights' ? '#FAF3E1' : '#0A0E17',
        color: theme === 'lights' ? '#353432' : '#ebe5e5'
      });
      return;
    }


    // Usamos el helper para editar usuario

    console.log(editedUsuario, setRefreshData.password);

    starEditarUsuario(editedUsuario, setRefreshData, navigate);

    handleClose();




  };

  return (
    <Modal
      show={show}
      onHide={handleClose}
      size="lg"
      centered
      className={theme}
    >
      <Modal.Header
        closeButton
        className={`${cardClass} ${textClass}`}
        style={{
          borderBottomColor: theme === 'lights' ? '#E0D8C5' : '#1F2535'
        }}
      >
        <Modal.Title style={{ color: titleColor }}>
          Editar Usuario
        </Modal.Title>
      </Modal.Header>

      <Modal.Body className={`${cardClass} ${textClass}`}>
        <Form onSubmit={handleSubmit}>
          <Row>
            {/* Sección Información Personal - Misma estructura */}
            <Col md={6}>
              <h5 style={{ color: titleColor, marginBottom: '1rem' }}>
                Información Personal
              </h5>

              <Form.Group className="mb-3">
                <Form.Label>Nombres *</Form.Label>
                <Form.Control
                  type="text"
                  name="nombres"
                  value={editedUsuario.nombres}
                  onChange={handleChange}
                  required
                  className={formControlClass}
                  style={{ borderColor: borderColor, color: 'inherit' }}
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Apellido *</Form.Label>
                <Form.Control
                  type="text"
                  name="apellido"
                  value={editedUsuario.apellido}
                  onChange={handleChange}
                  required
                  className={formControlClass}
                  style={{ borderColor: borderColor, color: 'inherit' }}
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>DNI *</Form.Label>
                <Form.Control
                  type="text"
                  name="dni"
                  value={editedUsuario.dni}
                  onChange={handleChange}
                  maxLength="10"
                  required
                  className={formControlClass}
                  style={{ borderColor: borderColor, color: 'inherit' }}
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Fecha Nacimiento *</Form.Label>
                <Form.Control
                  type="date"
                  name="fecha_nacimiento"
                  value={editedUsuario.fecha_nacimiento}
                  onChange={handleChange}
                  required
                  className={formControlClass}
                  style={{ borderColor: borderColor, color: 'inherit' }}
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Género *</Form.Label>
                <Form.Select
                  name="genero"
                  value={editedUsuario.genero}
                  onChange={handleChange}
                  required
                  className={formControlClass}
                  style={{ borderColor: borderColor, color: 'inherit' }}
                >
                  <option value="">Seleccionar...</option>
                  <option value="Masculino">Masculino</option>
                  <option value="Femenino">Femenino</option>
                  <option value="Otro">Otro</option>
                  <option value="Prefiero no decirlo">Prefiero no decirlo</option>
                </Form.Select>
              </Form.Group>
            </Col>

            {/* Sección Contacto y Sistema - Misma estructura */}
            <Col md={6}>
              <h5 style={{ color: titleColor, marginBottom: '1rem' }}>
                Contacto y Sistema
              </h5>

              <Form.Group className="mb-3">
                <Form.Label>Email *</Form.Label>
                <Form.Control
                  type="email"
                  name="email"
                  value={editedUsuario.email}
                  onChange={handleChange}
                  required
                  className={formControlClass}
                  style={{ borderColor: borderColor, color: 'inherit' }}
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Teléfono *</Form.Label>
                <Form.Control
                  type="text"
                  name="telefono"
                  value={editedUsuario.telefono}
                  onChange={handleChange}
                  maxLength="15"
                  required
                  className={formControlClass}
                  style={{ borderColor: borderColor, color: 'inherit' }}
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Provincia *</Form.Label>
                <Form.Control
                  type="text"
                  name="provincia"
                  value={editedUsuario.provincia}
                  onChange={handleChange}
                  required
                  className={formControlClass}
                  style={{ borderColor: borderColor, color: 'inherit' }}
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Rol *</Form.Label>
                <Form.Select
                  name="rol"
                  value={editedUsuario.rol}
                  onChange={handleChange}
                  required
                  className={formControlClass}
                  style={{ borderColor: borderColor, color: 'inherit' }}
                >
                  <option value="Alumno">Alumno</option>
                  <option value="profe">Profesor</option>
                  <option value="admin">Administrador</option>
                  <option value="cordinador">Coordinador</option>
                  <option value="acompañante">Acompañante</option>
                  <option value="corrector">Corrector</option>
                </Form.Select>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Estado</Form.Label>
                <Form.Select
                  name="estado"
                  value={editedUsuario.estado.toString()}
                  onChange={handleChange}
                  className={formControlClass}
                  style={{ borderColor: borderColor, color: 'inherit' }}
                >
                  <option value="true">Activo</option>
                  <option value="false">Inactivo</option>
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>

          <div className="d-flex justify-content-end mt-3 pt-3"
            style={{
              borderTop: `1px solid ${theme === 'lights' ? '#E0D8C5' : '#1F2535'}`
            }}
          >
            <Button
              variant="secondary"
              onClick={handleClose}
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
              Guardar Cambios
            </Button>
          </div>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

export default ModalEditarUsuario;