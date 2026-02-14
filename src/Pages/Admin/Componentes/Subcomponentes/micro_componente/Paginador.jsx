// Components/Subcomponentes/Paginador.jsx
import React from 'react';
import { Button } from 'react-bootstrap';
import { ChevronLeft, ChevronRight } from 'react-bootstrap-icons';

const Paginador = ({ 
  paginaActual, 
  totalPaginas, 
  onCambiarPagina,
  theme = 'lights'
}) => {
  const isLight = theme === 'lights';
  
  // Colores basados en tema
  const themeColors = {
    text: isLight ? '#212529' : '#E9ECEF',
    border: isLight ? '#DEE2E6' : '#3A4255',
    primary: isLight ? '#007bff' : '#0d6efd',
    hover: isLight ? '#e9ecef' : '#2d3440'
  };

  // No mostrar si solo hay 1 página
  if (totalPaginas <= 1) return null;

  // Calcular qué números de página mostrar
  const getPaginasAMostrar = () => {
    const maxPaginas = 5; // Máximo de botones de página
    let paginas = [];

    if (totalPaginas <= maxPaginas) {
      // Mostrar todas las páginas
      paginas = Array.from({ length: totalPaginas }, (_, i) => i + 1);
    } else {
      // Lógica para mostrar páginas cercanas a la actual
      if (paginaActual <= 3) {
        paginas = [1, 2, 3, 4, 5];
      } else if (paginaActual >= totalPaginas - 2) {
        paginas = [
          totalPaginas - 4,
          totalPaginas - 3,
          totalPaginas - 2,
          totalPaginas - 1,
          totalPaginas
        ];
      } else {
        paginas = [
          paginaActual - 2,
          paginaActual - 1,
          paginaActual,
          paginaActual + 1,
          paginaActual + 2
        ];
      }
    }
    return paginas;
  };

  const handlePaginaAnterior = () => {
    if (paginaActual > 1) {
      onCambiarPagina(paginaActual - 1);
    }
  };

  const handlePaginaSiguiente = () => {
    if (paginaActual < totalPaginas) {
      onCambiarPagina(paginaActual + 1);
    }
  };

  const paginasAMostrar = getPaginasAMostrar();

  return (
    <div className="d-flex flex-wrap align-items-center justify-content-center gap-2">
      {/* Botón Anterior */}
      <Button
        variant="outline-secondary"
        size="sm"
        onClick={handlePaginaAnterior}
        disabled={paginaActual === 1}
        style={{
          backgroundColor: 'transparent',
          borderColor: themeColors.border,
          color: themeColors.text,
          display: 'flex',
          alignItems: 'center',
          gap: '4px'
        }}
        className="hover-effect"
      >
        <ChevronLeft size={16} />
        <span className="d-none d-sm-inline">Anterior</span>
      </Button>

      {/* Números de página - visible en desktop */}
      <div className="d-none d-md-flex gap-1">
        {paginasAMostrar.map((numero) => (
          <Button
            key={numero}
            variant={paginaActual === numero ? 'primary' : 'outline-secondary'}
            size="sm"
            onClick={() => onCambiarPagina(numero)}
            style={{
              backgroundColor: paginaActual === numero 
                ? themeColors.primary 
                : 'transparent',
              borderColor: paginaActual === numero 
                ? themeColors.primary 
                : themeColors.border,
              color: paginaActual === numero 
                ? '#fff' 
                : themeColors.text,
              minWidth: '40px',
              fontWeight: paginaActual === numero ? 'bold' : 'normal'
            }}
          >
            {numero}
          </Button>
        ))}
      </div>

      {/* Selector de página - visible en mobile */}
      <div className="d-flex d-md-none align-items-center gap-2">
        <span style={{ color: themeColors.text, fontSize: '14px' }}>
          Pág. {paginaActual} de {totalPaginas}
        </span>
        <select
          value={paginaActual}
          onChange={(e) => onCambiarPagina(Number(e.target.value))}
          style={{
            backgroundColor: themeColors.bg || (isLight ? '#fff' : '#1A1F2E'),
            borderColor: themeColors.border,
            color: themeColors.text,
            padding: '4px 8px',
            borderRadius: '4px',
            border: '1px solid'
          }}
        >
          {Array.from({ length: totalPaginas }, (_, i) => i + 1).map(num => (
            <option key={num} value={num}>
              {num}
            </option>
          ))}
        </select>
      </div>

      {/* Botón Siguiente */}
      <Button
        variant="outline-secondary"
        size="sm"
        onClick={handlePaginaSiguiente}
        disabled={paginaActual === totalPaginas}
        style={{
          backgroundColor: 'transparent',
          borderColor: themeColors.border,
          color: themeColors.text,
          display: 'flex',
          alignItems: 'center',
          gap: '4px'
        }}
        className="hover-effect"
      >
        <span className="d-none d-sm-inline">Siguiente</span>
        <ChevronRight size={16} />
      </Button>

      <style jsx="true">{`
        .hover-effect:hover {
          background-color: ${themeColors.hover} !important;
          transition: background-color 0.2s ease;
        }
      `}</style>
    </div>
  );
};

export default Paginador;