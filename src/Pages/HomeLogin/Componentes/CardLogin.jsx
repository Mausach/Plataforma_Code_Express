import React, { useEffect, useState } from 'react'
import Card from 'react-bootstrap/Card';
import Form from 'react-bootstrap/Form';
import Logo from '../../../assets/LOGO 2.png'
import { Button } from 'react-bootstrap';
import InputGroup from 'react-bootstrap/InputGroup';
import { Eye, EyeSlash, Person } from 'react-bootstrap-icons';
import Alert from 'react-bootstrap/Alert';
import { starLogin } from '../Helper/StartLogin';

export const CardLogin = ({ theme, onLoginSuccess }) => {  // ← Recibimos onLoginSuccess

    const [user, setUser] = useState({
        userName: "",
        password: "",
    });
    const [showPassword, setShowPassword] = useState(false);
    const [alert, setAlert] = useState({ show: false, variant: '', message: '' });

    const togglePassword = () => setShowPassword(!showPassword);

    const onSubmit = async (e) => {
        e.preventDefault();
        
        if (user.userName.trim() === "" || user.password.trim() === "") {
            setAlert({ 
                show: true, 
                variant: 'danger', 
                message: 'Falscher Benutzername oder falsches Passwort' 
            });
        } else {
            // Llamamos a starLogin y pasamos onLoginSuccess como callback
            await starLogin(user.userName, user.password, onLoginSuccess);
        }
    };

    const onInputChange = (e) => {
        setUser({
            ...user,
            [e.target.name]: e.target.value,
        });
    };

    useEffect(() => {
        if (alert.show) {
            const timer = setTimeout(() => setAlert({ ...alert, show: false }), 3000);
            return () => clearTimeout(timer);
        }
    }, [alert]);

    return (
        <div className="d-flex justify-content-center align-items-center min-vh-100">
            <Card className={`p-3 m-5 ${theme === 'lights' ? 'card-light' : 'card-dark'} card-with-shadow`} style={{ width: '600px' }}>
                <Card.Body>
                    <div className="text-center mb-3">
                        <img src={Logo} alt="Descripción de la imagen" style={{ width: '150px', height: '100px' }} />
                    </div>

                    <div className="text-center m-3 ">
                        <h2 className="fw-bold title">Code Express</h2>
                        <Card.Text>
                            Plataforma de estudio online.
                        </Card.Text>
                    </div>

                    {alert.show && (
                        <Alert
                            variant={alert.variant}
                            onClose={() => setAlert({ ...alert, show: false })}
                            dismissible
                            className={alert.variant === 'danger' ? 'transparent-red-alert' : 'transparent-green-alert'}
                        >
                            <Alert.Heading>
                                {alert.variant === 'danger' ? 'Oh snap! You got an error!' : 'Success!'}
                            </Alert.Heading>
                            <p>{alert.message}</p>
                        </Alert>
                    )}

                    <Form onSubmit={onSubmit}>
                        <Form.Group className="mb-3">
                            <InputGroup>
                                <Form.Control
                                    type="text"
                                    name='userName'
                                    placeholder="ingrese su email"
                                    maxLength={30}
                                    value={user.userName}
                                    onChange={onInputChange} 
                                />
                                <InputGroup.Text>
                                    <Person />
                                </InputGroup.Text>
                            </InputGroup>
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <InputGroup>
                                <Form.Control
                                    type={showPassword ? "text" : "password"}
                                    name='password'
                                    placeholder="ingrese su contraseña"
                                    aria-describedby="passwordHelpBlock"
                                    value={user.password}
                                    onChange={onInputChange}
                                />
                                <InputGroup.Text onClick={togglePassword} style={{ cursor: 'pointer' }}>
                                    {showPassword ? <EyeSlash /> : <Eye />}
                                </InputGroup.Text>
                            </InputGroup>
                        </Form.Group>

                        <Form.Group className="d-flex justify-content-center align-items-center mt-4 ">
                            <Button 
                                variant='secondary'
                                className={`w-100 ${theme === 'lights' ? 'btn-light' : 'custom-button'}`}
                                type="submit"
                            >
                                <h6>Iniciar Sesion</h6>
                            </Button>
                        </Form.Group>
                    </Form>
                </Card.Body>
            </Card>
        </div>
    );
};