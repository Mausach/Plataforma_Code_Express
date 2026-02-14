import React, { useState } from 'react';
import { Modal, Button, Form, Row, Col } from 'react-bootstrap';
import Swal from 'sweetalert2';
import { starCrearUsuario } from '../../Helper/CrearUsuario';
// import { starCrearUsuario } from '../Helper/CrearUsuario'; // Descomenta cuando tengas el helper

export const ModalCrearUsuario = ({
  show,
  handleClose,
  setRefreshData,
  navigate,
  theme // ✅ Agregué el tema como prop
}) => {
  // Estado con los campos del modelo de Usuario (basado en ModalEditarUsuario)
  const [newUsuario, setNewUsuario] = useState({
    nombres: '',
    apellido: '',
    dni: '',
    fecha_nacimiento: '',
    genero: '',
    telefono: '',
    provincia: '',
    rol: 'alumno',
    email: '',
    estado: true
  });

  // Estado para la contraseña (solo para creación)
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Clases CSS según tema (igual que en ModalEditarUsuario)
  const cardClass = theme === 'lights' ? 'card-light' : 'card-dark';
  const textClass = theme === 'lights' ? 'text-dark' : 'text-light';
  const formControlClass = theme === 'lights' ? 'bg-white text-dark' : 'bg-dark text-light';
  const borderColor = theme === 'lights' ? '#353432' : '#ebe5e5';
  const titleColor = '#EF7F1A'; // Tu naranja para títulos

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    // Para campos booleanos como estado
    if (type === 'checkbox') {
      setNewUsuario(prev => ({
        ...prev,
        [name]: checked
      }));
    } else {
      setNewUsuario(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };
  //para crear al usuario
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validación de campos obligatorios
    if (
      !newUsuario.nombres.trim() ||
      !newUsuario.apellido.trim() ||
      !newUsuario.dni.trim() ||
      !newUsuario.fecha_nacimiento ||
      !newUsuario.genero ||
      !newUsuario.email.trim() ||
      !newUsuario.telefono.trim() ||
      !newUsuario.provincia.trim() ||
      !password.trim() ||
      !confirmPassword.trim()
    ) {
      console.log('Datos incompletos:', newUsuario);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Todos los campos marcados con * son obligatorios. Por favor, complete todos los datos.',
        background: theme === 'lights' ? '#FAF3E1' : '#0A0E17',
        color: theme === 'lights' ? '#353432' : '#ebe5e5'
      });
      return;
    }

    // Validación del rol seleccionado
    if (!newUsuario.rol) {
      Swal.fire({
        icon: 'error',
        title: 'Rol no seleccionado',
        text: 'Por favor, seleccione un rol válido.',
        background: theme === 'lights' ? '#FAF3E1' : '#0A0E17',
        color: theme === 'lights' ? '#353432' : '#ebe5e5'
      });
      return;
    }

    // Validación del nombre (solo letras y espacios)
    if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(newUsuario.nombres)) {
      Swal.fire({
        icon: 'error',
        title: 'Nombre inválido',
        text: 'El nombre solo puede contener letras y espacios.',
        background: theme === 'lights' ? '#FAF3E1' : '#0A0E17',
        color: theme === 'lights' ? '#353432' : '#ebe5e5'
      });
      return;
    }

    // Validación apellido (solo letras y espacios)
    if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(newUsuario.apellido)) {
      Swal.fire({
        icon: 'error',
        title: 'Apellido inválido',
        text: 'El apellido solo puede contener letras y espacios.',
        background: theme === 'lights' ? '#FAF3E1' : '#0A0E17',
        color: theme === 'lights' ? '#353432' : '#ebe5e5'
      });
      return;
    }

    // Validación del DNI (7-10 dígitos numéricos)
    if (!/^\d{7,10}$/.test(newUsuario.dni)) {
      Swal.fire({
        icon: 'error',
        title: 'DNI inválido',
        text: 'El DNI debe tener entre 7 y 10 dígitos numéricos.',
        background: theme === 'lights' ? '#FAF3E1' : '#0A0E17',
        color: theme === 'lights' ? '#353432' : '#ebe5e5'
      });
      return;
    }

    // Validación de fecha de nacimiento (no puede ser futura)
    const fechaNacimiento = new Date(newUsuario.fecha_nacimiento);
    const hoy = new Date();
    if (fechaNacimiento > hoy) {
      Swal.fire({
        icon: 'error',
        title: 'Fecha inválida',
        text: 'La fecha de nacimiento no puede ser futura.',
        background: theme === 'lights' ? '#FAF3E1' : '#0A0E17',
        color: theme === 'lights' ? '#353432' : '#ebe5e5'
      });
      return;
    }

    // Validación edad mínima (por ejemplo, 15 años)
    const edadMinima = 15;
    const edad = hoy.getFullYear() - fechaNacimiento.getFullYear();
    const mes = hoy.getMonth() - fechaNacimiento.getMonth();
    if (edad < edadMinima || (edad === edadMinima && mes < 0)) {
      Swal.fire({
        icon: 'error',
        title: 'Edad inválida',
        text: `Debe tener al menos ${edadMinima} años para registrarse.`,
        background: theme === 'lights' ? '#FAF3E1' : '#0A0E17',
        color: theme === 'lights' ? '#353432' : '#ebe5e5'
      });
      return;
    }

    // Validación del email
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newUsuario.email)) {
      Swal.fire({
        icon: 'error',
        title: 'Email inválido',
        text: 'Por favor, ingrese un email válido.',
        background: theme === 'lights' ? '#FAF3E1' : '#0A0E17',
        color: theme === 'lights' ? '#353432' : '#ebe5e5'
      });
      return;
    }

    // Validación de la provincia (solo letras, espacios y acentos)
    if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(newUsuario.provincia)) {
      Swal.fire({
        icon: 'error',
        title: 'Provincia inválida',
        text: 'La provincia solo puede contener letras y espacios.',
        background: theme === 'lights' ? '#FAF3E1' : '#0A0E17',
        color: theme === 'lights' ? '#353432' : '#ebe5e5'
      });
      return;
    }

    // Validación del teléfono (entre 7 y 15 dígitos)
    if (!/^\d{7,15}$/.test(newUsuario.telefono)) {
      Swal.fire({
        icon: 'error',
        title: 'Teléfono inválido',
        text: 'El teléfono debe tener entre 7 y 15 dígitos numéricos.',
        background: theme === 'lights' ? '#FAF3E1' : '#0A0E17',
        color: theme === 'lights' ? '#353432' : '#ebe5e5'
      });
      return;
    }

    // Validación de la contraseña
    if (password.length < 6) {
      Swal.fire({
        icon: 'error',
        title: 'Contraseña demasiado corta',
        text: 'La contraseña debe tener al menos 6 caracteres.',
        background: theme === 'lights' ? '#FAF3E1' : '#0A0E17',
        color: theme === 'lights' ? '#353432' : '#ebe5e5'
      });
      return;
    }

    // Validación adicional para contraseña segura (opcional)
    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
      Swal.fire({
        icon: 'warning',
        title: 'Contraseña poco segura',
        text: 'Para mayor seguridad, recomendamos usar al menos una mayúscula, una minúscula y un número.',
        background: theme === 'lights' ? '#FAF3E1' : '#0A0E17',
        color: theme === 'lights' ? '#353432' : '#ebe5e5'
      });
      // Puedes decidir si quieres que sea obligatorio o solo advertencia
      // return;
    }

    // Validación de coincidencia de contraseñas
    if (password !== confirmPassword) {
      Swal.fire({
        icon: 'error',
        title: 'Contraseñas no coinciden',
        text: 'Las contraseñas ingresadas no coinciden. Por favor, verifique.',
        background: theme === 'lights' ? '#FAF3E1' : '#0A0E17',
        color: theme === 'lights' ? '#353432' : '#ebe5e5'
      });
      return;
    }

   
      // Preparar datos para enviar al backend
      const usuarioData = {
        ...newUsuario,
        password: password // Agregar la contraseña
      };

      // Aquí enviarías los datos a la API
       await starCrearUsuario(usuarioData, setRefreshData, navigate);
     

      // Resetear formulario
      resetForm()
   
  };

  const resetForm = () => {
    setNewUsuario({
      nombres: '',
      apellido: '',
      dni: '',
      fecha_nacimiento: '',
      genero: '',
      telefono: '',
      provincia: '',
      rol: 'Alumno',
      email: '',
      estado: true
    });
    setPassword('');
    setConfirmPassword('');
    handleClose();
  };

  return (
    <Modal
      show={show}
      onHide={resetForm}
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
          Crear Nuevo Usuario
        </Modal.Title>
      </Modal.Header>

      <Modal.Body className={`${cardClass} ${textClass}`}>
        <Form onSubmit={handleSubmit}>
          <Row>
            {/* Sección Información Personal - Igual estructura que editar */}
            <Col md={6}>
              <h5 style={{ color: titleColor, marginBottom: '1rem' }}>
                Información Personal
              </h5>

              <Form.Group className="mb-3">
                <Form.Label>Nombres *</Form.Label>
                <Form.Control
                  type="text"
                  name="nombres"
                  value={newUsuario.nombres}
                  onChange={handleChange}
                  required
                  placeholder="Ingrese los nombres"
                  className={formControlClass}
                  style={{ borderColor: borderColor, color: 'inherit' }}
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Apellido *</Form.Label>
                <Form.Control
                  type="text"
                  name="apellido"
                  value={newUsuario.apellido}
                  onChange={handleChange}
                  required
                  placeholder="Ingrese el apellido"
                  className={formControlClass}
                  style={{ borderColor: borderColor, color: 'inherit' }}
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>DNI *</Form.Label>
                <Form.Control
                  type="text"
                  name="dni"
                  value={newUsuario.dni}
                  onChange={handleChange}
                  maxLength="10"
                  required
                  placeholder="Ej: 12345678"
                  className={formControlClass}
                  style={{ borderColor: borderColor, color: 'inherit' }}
                />
                <Form.Text style={{ color: borderColor }}>
                  7-10 dígitos numéricos
                </Form.Text>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Fecha Nacimiento *</Form.Label>
                <Form.Control
                  type="date"
                  name="fecha_nacimiento"
                  value={newUsuario.fecha_nacimiento}
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
                  value={newUsuario.genero}
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

            {/* Sección Contacto, Sistema y Contraseña */}
            <Col md={6}>
              <h5 style={{ color: titleColor, marginBottom: '1rem' }}>
                Contacto, Sistema y Acceso
              </h5>

              <Form.Group className="mb-3">
                <Form.Label>Email *</Form.Label>
                <Form.Control
                  type="email"
                  name="email"
                  value={newUsuario.email}
                  onChange={handleChange}
                  required
                  placeholder="ejemplo@correo.com"
                  className={formControlClass}
                  style={{ borderColor: borderColor, color: 'inherit' }}
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Teléfono *</Form.Label>
                <Form.Control
                  type="text"
                  name="telefono"
                  value={newUsuario.telefono}
                  onChange={handleChange}
                  maxLength="15"
                  required
                  placeholder="Ej: 3411234567"
                  className={formControlClass}
                  style={{ borderColor: borderColor, color: 'inherit' }}
                />
                <Form.Text style={{ color: borderColor }}>
                  7-15 dígitos numéricos
                </Form.Text>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Provincia *</Form.Label>
                <Form.Control
                  type="text"
                  name="provincia"
                  value={newUsuario.provincia}
                  onChange={handleChange}
                  required
                  placeholder="Ingrese la provincia"
                  className={formControlClass}
                  style={{ borderColor: borderColor, color: 'inherit' }}
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Rol *</Form.Label>
                <Form.Select
                  name="rol"
                  value={newUsuario.rol}
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
                <Form.Label>Contraseña *</Form.Label>
                <Form.Control
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="Mínimo 6 caracteres"
                  className={formControlClass}
                  style={{ borderColor: borderColor, color: 'inherit' }}
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Confirmar Contraseña *</Form.Label>
                <Form.Control
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  placeholder="Repita la contraseña"
                  className={formControlClass}
                  style={{ borderColor: borderColor, color: 'inherit' }}
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Check
                  type="checkbox"
                  name="estado"
                  label="Usuario activo"
                  checked={newUsuario.estado}
                  onChange={handleChange}
                  className={textClass}
                />
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
              Crear Usuario
            </Button>
          </div>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

export default ModalCrearUsuario;