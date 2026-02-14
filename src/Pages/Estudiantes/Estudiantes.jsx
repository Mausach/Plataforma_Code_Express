import React, { useState } from 'react'
import { useLocation } from 'react-router-dom';

import ListaComisionesDin from './Componentes/ListaCOmisionDinamicas';
import NavbarDinamico from './Componentes/NavBarEsutiandote';

export const Estudiantes = () => {
  const location = useLocation();
  const usuario = location.state;

  // Estado para el tema
  const [theme, setTheme] = useState('lights');
  
  // Estado para controlar qué panel mostrar (por ahora solo comisiones)
  const [activePanel, setActivePanel] = useState('comisiones');

  // Función para cambiar tema
  const handleChangeTheme = () => {
    const newTheme = theme === 'lights' ? 'darks' : 'lights';
    setTheme(newTheme);
    document.body.className = newTheme + '-theme';
  };

  // Función para renderizar el panel activo
  const renderPanel = () => {
    switch (activePanel) {
      case 'comisiones':
      default:
        return <ListaComisionesDin theme={theme} usuario={usuario} />;
    }
  };

  return (
    <div className={`student-container bg-${theme} text-${theme === 'lights' ? 'darks' : 'lights'}`}>
      {/* Navbar específico para estudiantes */}
      <NavbarDinamico
        theme={theme} 
        handleChangeTheme={handleChangeTheme}
        usuario={usuario}
      />
      
      {/* Contenido principal con las comisiones */}
      <main className="student-content p-4">
        {/* 🔴 ERROR ESTABA AQUÍ: Faltaban los paréntesis () */}
        {renderPanel()}  {/* ✅ CORREGIDO: ahora llama a la función */}
      </main>
    </div>
  );
};

