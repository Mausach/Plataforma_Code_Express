import React, { useEffect, useState } from 'react'
import { Button } from 'react-bootstrap';
import { CardLogin } from './Componentes/CardLogin';
import { useNavigate } from 'react-router-dom';

export const HomeLogin = () => {

    //const para el boton de cmabiar de tema
    const [theme, setTheme] = useState('lights');

    //funcion para cmabiar de tema segun el css que esta importado en el mainjsx
    const handleChangeTheme = () => {
        const newTheme = theme === 'lights' ? 'darks' : 'lights';
        setTheme(newTheme);
        document.body.className = newTheme + '-theme';
      };
//navigate y usefect para controlar si hay toquen y no permitirle retrocesder hasta que se deslogue
      const navigate = useNavigate();

      useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
          navigate('/home');
        }
      }, [navigate]);

  
  return (
    <div className={`bg-${theme} text-${theme === 'lights' ? 'darks' : 'lights'}`}>
    
    <button 
        className={`btn btn-${theme === 'lights' ? 'darks' : 'lights'} btn-theme rounded-circle border-0 position-absolute top-0 end-0 m-3`}
        onClick={handleChangeTheme}
      >
      {theme === 'lights' ? <i className="bi bi-moon text-dark"></i> : <i className="bi bi-brightness-high text-light"></i>} {/* Alternar entre íconos de luna y sol */}
    </button>

    <CardLogin theme={theme} />
  </div>
  )
}