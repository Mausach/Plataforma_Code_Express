import React, { useState } from 'react';
import NavbarAdmin from './Componentes/NavbarAdmin';
import { GestionUsuarios } from './Componentes/GestUsuarios';
import { GestionCarreras } from './Componentes/GestCarreras';

import ListaComisiones from './Componentes/Listar_Comisiones';
import { useLocation } from 'react-router-dom';


// Importamos los componentes de cada panel
//import { GestUsuarios } from './Componentes/GestUsuarios';
//import { GestCarreras } from './Componentes/GestCarreras';
//import { GestComiciones } from './Componentes/GestComiciones';

export const Admins = () => {
     const location = useLocation();
  const usuario = location.state;
  // Estado para el tema
  const [theme, setTheme] = useState('lights');
  
  // Estado para controlar qué panel mostrar
  const [activePanel, setActivePanel] = useState('dashboard'); // 'dashboard', 'usuarios', 'carreras', 'comisiones'

  // Función para cambiar tema
  const handleChangeTheme = () => {
    const newTheme = theme === 'lights' ? 'darks' : 'lights';
    setTheme(newTheme);
    document.body.className = newTheme + '-theme';
  };

  // Función para renderizar el panel activo
  const renderPanel = () => {
    switch (activePanel) {
      case 'usuarios':
        return <GestionUsuarios theme={theme} />;
      case 'carreras':
        return <GestionCarreras theme={theme} />;
      case 'comisiones':
        return <ListaComisiones theme={theme} usuario={usuario} />;
      case 'dashboard':
      default:
        return <GestionUsuarios theme={theme} />;
    }
  };

  return (
    <div className={`admin-container bg-${theme} text-${theme === 'lights' ? 'darks' : 'lights'}`}>
      {/* Navbar con capacidad de cambiar panel */}
      <NavbarAdmin 
        theme={theme} 
        handleChangeTheme={handleChangeTheme}
        activePanel={activePanel}
        setActivePanel={setActivePanel}
      />
      
      {/* Contenido principal que cambia según el panel */}
      <main className="admin-content p-4">
        {renderPanel()}
      </main>
    </div>
  );
};



export default Admins;
