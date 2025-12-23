import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import PiezaDental from './PiezaDental';
import { FaCalendarAlt, FaTrash } from 'react-icons/fa';

const OdontogramaContainer = styled.div`
  padding: 20px;
  background-color: #ffffff;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  gap: 20px;
`;

const ObservacionesInput = styled.input`
  flex: 1;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  
  &:focus {
    outline: none;
    border-color: #3498db;
  }
`;

const FechaInput = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  background-color: #f8f9fa;
  
  input {
    border: none;
    background: none;
    font-size: 14px;
    width: 120px;
    
    &:focus {
      outline: none;
    }
  }
  
  .calendar-icon {
    color: #666;
  }
`;

const OdontogramaTitle = styled.h2`
  margin: 20px 0 15px 0;
  color: #2c3e50;
  font-size: 18px;
`;

const OdontogramaGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(16, 1fr);
  gap: 6px;
  row-gap: 25px;
  width: 100%;
  max-width: 100%;
  margin: 0 auto;
  padding: 20px;
  background: #ffffff;
  border-radius: 12px;
  border: 1px solid #e9ecef;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
`;

const ColorLegend = styled.div`
  margin-bottom: 15px;
  padding: 12px;
  background: #f8f9fa;
  border-radius: 6px;
  border: 1px solid #e9ecef;
`;

const LegendTitle = styled.h3`
  margin: 0 0 8px 0;
  font-size: 13px;
  font-weight: 700;
  color: #333;
  text-align: center;
`;

const ColorBox = styled.div<{ $color: string }>`
  width: 20px;
  height: 20px;
  border: 1px solid #333;
  background-color: ${props => props.$color};
  margin-right: 8px;
  border-radius: 2px;
`;

const CuadranteLabel = styled.div`
  grid-column: 1 / -1;
  text-align: center;
  font-weight: 700;
  color: #495057;
  margin: 20px 0 15px 0;
  font-size: 15px;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  padding: 12px 0;
  border-radius: 10px;
  border: 1px solid #dee2e6;
  text-transform: uppercase;
  letter-spacing: 1px;
  box-shadow: inset 0 1px 0 rgba(255,255,255,0.8);
`;

const MenuContextual = styled.div<{ $show: boolean; $position: { x: number; y: number } }>`
  position: fixed;
  top: ${props => props.$position.y}px;
  left: ${props => props.$position.x}px;
  background: white;
  border: 2px solid #007bff;
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.15);
  z-index: 1000;
  display: ${props => props.$show ? 'block' : 'none'};
  min-width: 250px;
  max-height: 80vh;
  overflow-y: auto;
  overflow-x: hidden;
  opacity: ${props => props.$show ? 1 : 0};
  transform: ${props => props.$show ? 'scale(1)' : 'scale(0.8)'};
  transition: all 0.2s ease;
`;

const MenuSection = styled.div<{ $color: string }>`
  background-color: ${props => props.$color};
  color: white;
  padding: 8px 12px;
  font-weight: 600;
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const MenuItem = styled.button`
  width: 100%;
  padding: 8px 12px;
  border: none;
  background: white;
  text-align: left;
  cursor: pointer;
  font-size: 12px;
  color: #495057;
  transition: background-color 0.2s ease;
  
  &:hover {
    background-color: #f8f9fa;
  }
  
  &:first-of-type {
    border-top: 1px solid #e9ecef;
  }
`;

const LimpiarButton = styled.button`
  width: 100%;
  padding: 8px 12px;
  border: none;
  background-color: #6c757d;
  color: white;
  cursor: pointer;
  font-size: 12px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: background-color 0.2s ease;
  
  &:hover {
    background-color: #5a6268;
  }
`;

interface OdontogramaProps {
  pacienteId: string;
  odontogramaData?: any;
  onSave: (data: any) => void;
  isSaving?: boolean;
}

const Odontograma: React.FC<OdontogramaProps> = ({ 
  pacienteId, 
  odontogramaData, 
  onSave,
  isSaving = false
}) => {
  const [observaciones, setObservaciones] = useState('');
  const [fecha, setFecha] = useState(new Date().toLocaleDateString('es-ES'));
  const [piezasDentales, setPiezasDentales] = useState<{[key: string]: {
    ausente?: boolean;
    caras?: {
      derecha: string | null;
      izquierda: string | null;
      superior: string | null;
      inferior: string | null;
      central: string | null;
    };
    requerido?: string | null;
    existente?: string | null;
  }}>({});
  const [tratamientoPendiente, setTratamientoPendiente] = useState<string | null>(null); // Tratamiento seleccionado esperando color
  const [menuContextual, setMenuContextual] = useState({
    show: false,
    position: { x: 0, y: 0 },
    pieza: '',
    cara: '' as 'derecha' | 'izquierda' | 'superior' | 'inferior' | 'central' | ''
  });

  // Definir las piezas dentales en orden correcto
  // Nota: superiorDerecho se renderiza en reverse, así que el orden es de izquierda a derecha visualmente
  const piezasPermanentes = {
    superiorDerecho: ['11', '12', '13', '14', '14', '13', '12', '11'], // Cambiado: 18→11, 17→12, 16→13, 15→14
    superiorIzquierdo: ['21', '22', '23', '24', '25', '26', '27', '28'],
    inferiorIzquierdo: ['31', '32', '33', '34', '35', '36', '37', '38'],
    inferiorDerecho: ['41', '42', '43', '44', '45', '46', '47', '48']
  };

  const piezasTemporales = {
    superiorDerecho: ['55', '54', '53', '52', '51'],
    superiorIzquierdo: ['61', '62', '63', '64', '65'],
    inferiorIzquierdo: ['71', '72', '73', '74', '75'],
    inferiorDerecho: ['81', '82', '83', '84', '85']
  };

  useEffect(() => {
    if (odontogramaData) {
      setObservaciones(odontogramaData.observaciones || '');
      setPiezasDentales(odontogramaData.piezasDentales || {});
    } else {
      // Odontograma limpio para empezar
      setPiezasDentales({});
    }
  }, [odontogramaData]);

  // Cerrar menú contextual al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuContextual.show && !tratamientoPendiente) {
        const target = event.target as HTMLElement;
        // No cerrar si el clic es en una pieza dental o en el menú contextual
        // Tampoco cerrar si hay un tratamiento pendiente (esperando selección de color)
        if (!target.closest('[id^="pieza-"]') && !target.closest('[class*="MenuContextual"]')) {
          setMenuContextual(prev => ({ ...prev, show: false }));
          setTratamientoPendiente(null);
        }
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [menuContextual.show, tratamientoPendiente]);


  const handleCaraClick = (pieza: string, cara: 'derecha' | 'izquierda' | 'superior' | 'inferior' | 'central') => {
    const element = document.getElementById(`pieza-${pieza}`);
    if (element) {
      const rect = element.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      const menuWidth = 300; // Ancho aproximado del menú
      const menuHeight = 500; // Alto aproximado del menú
      
      // Calcular posición X: si se sale por la derecha, mostrarlo a la izquierda
      let menuX = rect.right + 10;
      if (menuX + menuWidth > viewportWidth) {
        menuX = rect.left - menuWidth - 10;
      }
      
      // Calcular posición Y: si se sale por abajo, ajustar hacia arriba
      let menuY = rect.top;
      if (menuY + menuHeight > viewportHeight) {
        menuY = viewportHeight - menuHeight - 10;
      }
      // Asegurar que no se salga por arriba
      if (menuY < 10) {
        menuY = 10;
      }
      
      setMenuContextual({
        show: true,
        position: { x: menuX, y: menuY },
        pieza,
        cara
      });
    }
  };

  const handleAusenteClick = (pieza: string) => {
    setPiezasDentales((prev) => {
      const current = prev[pieza] || {};
      const isAusente = !current.ausente;
      
      return {
        ...prev,
        [pieza]: {
          ...current,
          ausente: isAusente,
          // Si se marca como ausente o se desmarca, limpiar todas las caras
          caras: {
            derecha: null,
            izquierda: null,
            superior: null,
            inferior: null,
            central: null
          }
        }
      };
    });
  };

  const handleCaraDoubleClick = (pieza: string, cara: 'derecha' | 'izquierda' | 'superior' | 'inferior' | 'central') => {
    setPiezasDentales((prev) => {
      const current = prev[pieza] || {};
      const currentCaras = current.caras || {
        derecha: null,
        izquierda: null,
        superior: null,
        inferior: null,
        central: null
      };
      
      // Si todas las caras tienen "=" (extracción), eliminar de todas
      const todasCarasExtraccion = currentCaras.derecha === '=' && 
        currentCaras.izquierda === '=' && 
        currentCaras.superior === '=' && 
        currentCaras.inferior === '=' && 
        currentCaras.central === '=';
      
      if (todasCarasExtraccion) {
        // Eliminar extracción de todas las caras
        return {
          ...prev,
          [pieza]: {
            ...current,
            caras: {
              derecha: null,
              izquierda: null,
              superior: null,
              inferior: null,
              central: null
            }
          }
        };
      } else {
        // Eliminar solo la cara seleccionada
        return {
          ...prev,
          [pieza]: {
            ...current,
            caras: {
              ...currentCaras,
              [cara]: null
            }
          }
        };
      }
    });
  };

  const handleTratamientoSelect = (tratamiento: string) => {
    // Si se selecciona "ROJO" o "AZUL" y hay un tratamiento pendiente
    if ((tratamiento === 'ROJO' || tratamiento === 'AZUL') && tratamientoPendiente) {
      // Aplicar el tratamiento pendiente con el color seleccionado
      const tratamientoFinal = `${tratamiento}:${tratamientoPendiente}`;
      
      if (menuContextual.cara) {
        setPiezasDentales((prev) => {
          const current = prev[menuContextual.pieza] || {};
          const currentCaras = current.caras || {
            derecha: null,
            izquierda: null,
            superior: null,
            inferior: null,
            central: null
          };
          
          return {
            ...prev,
            [menuContextual.pieza]: {
              ...current,
              ausente: false,
              caras: {
                ...currentCaras,
                [menuContextual.cara]: tratamientoFinal
              }
            }
          };
        });
      }
      
      setTratamientoPendiente(null);
      setMenuContextual(prev => ({ ...prev, show: false, cara: '' }));
      return;
    }
    
    // Si se selecciona "ROJO" o "AZUL" sin tratamiento pendiente, solo mantener el menú abierto
    if (tratamiento === 'ROJO' || tratamiento === 'AZUL') {
      // No hacer nada, solo mantener el menú abierto
      return;
    }
    
    // Si se selecciona "X" (diente ausente), marcar todo el diente como ausente
    if (tratamiento === 'X') {
      setPiezasDentales((prev) => {
        const current = prev[menuContextual.pieza] || {};
        return {
          ...prev,
          [menuContextual.pieza]: {
            ...current,
            ausente: true,
            caras: {
              derecha: null,
              izquierda: null,
              superior: null,
              inferior: null,
              central: null
            }
          }
        };
      });
      setTratamientoPendiente(null);
      setMenuContextual(prev => ({ ...prev, show: false, cara: '' }));
    } else if (tratamiento === '=') {
      // Si se selecciona "=" (extracción), marcar todas las caras con extracción
      setPiezasDentales((prev) => {
        const current = prev[menuContextual.pieza] || {};
        return {
          ...prev,
          [menuContextual.pieza]: {
            ...current,
            ausente: false,
            caras: {
              derecha: '=',
              izquierda: '=',
              superior: '=',
              inferior: '=',
              central: '='
            }
          }
        };
      });
      setTratamientoPendiente(null);
      setMenuContextual(prev => ({ ...prev, show: false, cara: '' }));
    } else if (menuContextual.cara) {
      // Si hay una cara seleccionada y es un tratamiento que necesita color
      // Guardar el tratamiento pendiente y mostrar opciones de color
      const tratamientosQueNecesitanColor = ['*', '\\', 'TC', 'Pd', 'O', 'PM', '□', '▢'];
      
      if (tratamientosQueNecesitanColor.includes(tratamiento)) {
        // Guardar tratamiento pendiente y mantener el menú abierto
        setTratamientoPendiente(tratamiento);
        return; // No cerrar el menú, esperar selección de color
      } else {
        // Tratamientos que no necesitan color (como "■")
        setPiezasDentales((prev) => {
          const current = prev[menuContextual.pieza] || {};
          const currentCaras = current.caras || {
            derecha: null,
            izquierda: null,
            superior: null,
            inferior: null,
            central: null
          };
          
          return {
            ...prev,
            [menuContextual.pieza]: {
              ...current,
              ausente: false,
              caras: {
                ...currentCaras,
                [menuContextual.cara]: tratamiento
              }
            }
          };
        });
        setTratamientoPendiente(null);
        setMenuContextual(prev => ({ ...prev, show: false, cara: '' }));
      }
    } else {
      // Compatibilidad con el sistema anterior
      setPiezasDentales((prev) => {
        const current = prev[menuContextual.pieza] || {};
        return {
          ...prev,
          [menuContextual.pieza]: {
            ...current,
            requerido: tratamiento,
            existente: null
          }
        };
      });
      setTratamientoPendiente(null);
      setMenuContextual(prev => ({ ...prev, show: false, cara: '' }));
    }
  };

  const handleLimpiarPieza = () => {
    if (menuContextual.cara) {
      // Limpiar solo la cara seleccionada
      setPiezasDentales((prev) => {
        const current = prev[menuContextual.pieza] || {};
        const currentCaras = current.caras || {
          derecha: null,
          izquierda: null,
          superior: null,
          inferior: null,
          central: null
        };
        
        return {
          ...prev,
          [menuContextual.pieza]: {
            ...current,
            caras: {
              ...currentCaras,
              [menuContextual.cara]: null
            }
          }
        };
      });
    } else {
      // Limpiar toda la pieza
      setPiezasDentales((prev) => ({
        ...prev,
        [menuContextual.pieza]: {
          ausente: false,
          caras: {
            derecha: null,
            izquierda: null,
            superior: null,
            inferior: null,
            central: null
          },
          requerido: null,
          existente: null
        }
      }));
    }
    
    setMenuContextual(prev => ({ ...prev, show: false, cara: '' }));
  };

  const handleSave = () => {
    if (!pacienteId) {
      console.error('Error: pacienteId es requerido');
      return;
    }

    // Validar y formatear fecha
    let fechaFormateada: string;
    try {
      // Intentar parsear la fecha en formato DD/MM/YYYY
      const partesFecha = fecha.split('/');
      if (partesFecha.length === 3) {
        const dia = partesFecha[0].padStart(2, '0');
        const mes = partesFecha[1].padStart(2, '0');
        const año = partesFecha[2];
        // Crear fecha en hora local y convertir a ISO string
        const fechaObj = new Date(parseInt(año), parseInt(mes) - 1, parseInt(dia));
        if (isNaN(fechaObj.getTime())) {
          throw new Error('Fecha inválida');
        }
        // Convertir a formato YYYY-MM-DD para enviar al backend
        fechaFormateada = `${año}-${mes}-${dia}`;
      } else {
        // Si ya está en formato ISO o otro formato, intentar parsearlo
        const fechaObj = new Date(fecha);
        if (isNaN(fechaObj.getTime())) {
          throw new Error('Fecha inválida');
        }
        // Convertir a formato YYYY-MM-DD
        const year = fechaObj.getFullYear();
        const month = String(fechaObj.getMonth() + 1).padStart(2, '0');
        const day = String(fechaObj.getDate()).padStart(2, '0');
        fechaFormateada = `${year}-${month}-${day}`;
      }
    } catch (error) {
      console.error('Error procesando fecha:', error);
      // Usar fecha actual como fallback
      const hoy = new Date();
      const year = hoy.getFullYear();
      const month = String(hoy.getMonth() + 1).padStart(2, '0');
      const day = String(hoy.getDate()).padStart(2, '0');
      fechaFormateada = `${year}-${month}-${day}`;
    }

    // Asegurar que piezasDentales sea un objeto plano (no Map)
    const piezasDentalesObj = { ...piezasDentales };

    const dataToSave = {
      pacienteId,
      observaciones: observaciones.trim(),
      fecha: fechaFormateada,
      piezasDentales: piezasDentalesObj
    };
    
    console.log('📤 Enviando datos del odontograma:', dataToSave);
    onSave(dataToSave);
  };


  const renderFila = (piezasIzquierda: string[], piezasDerecha: string[]) => {
    // Calcular espacios vacíos para centrar las filas de 10 dientes
    const totalPiezas = piezasIzquierda.length + piezasDerecha.length;
    const espaciosIzquierda = totalPiezas === 10 ? 3 : 0; // 3 espacios a la izquierda para filas de 10
    const espaciosDerecha = totalPiezas === 10 ? 3 : 0; // 3 espacios a la derecha para filas de 10
    
    return (
      <>
        {/* Espacios vacíos a la izquierda para centrar filas de 10 */}
        {Array.from({ length: espaciosIzquierda }).map((_, i) => (
          <div key={`empty-left-${i}`} />
        ))}
        {/* Piezas izquierdas */}
        {piezasIzquierda.map(pieza => (
        <PiezaDental
          key={pieza}
          numero={pieza}
          caras={piezasDentales[pieza]?.caras}
          ausente={piezasDentales[pieza]?.ausente}
          onCaraClick={handleCaraClick}
          onAusenteClick={handleAusenteClick}
          onCaraDoubleClick={handleCaraDoubleClick}
          isSelected={menuContextual.pieza === pieza}
        />
        ))}
        {/* Piezas derechas */}
        {piezasDerecha.map(pieza => (
        <PiezaDental
          key={pieza}
          numero={pieza}
          caras={piezasDentales[pieza]?.caras}
          ausente={piezasDentales[pieza]?.ausente}
          onCaraClick={handleCaraClick}
          onAusenteClick={handleAusenteClick}
          onCaraDoubleClick={handleCaraDoubleClick}
          isSelected={menuContextual.pieza === pieza}
        />
        ))}
        {/* Espacios vacíos a la derecha para centrar filas de 10 */}
        {Array.from({ length: espaciosDerecha }).map((_, i) => (
          <div key={`empty-right-${i}`} />
        ))}
      </>
    );
  };

  const tratamientos = [
    { nombre: 'ROJO', descripcion: 'Tratamientos anteriores' },
    { nombre: 'AZUL', descripcion: 'Tratamientos requeridos' },
    { nombre: '=', descripcion: 'Extracción' },
    { nombre: 'X', descripcion: 'Diente Ausente' },
    { nombre: '*', descripcion: 'Caries' },
    { nombre: '\\', descripcion: 'Obturación' },
    { nombre: 'TC', descripcion: 'Tratam. de Conducto' },
    { nombre: 'Pd', descripcion: 'Enf. Periodontal' },
    { nombre: 'O', descripcion: 'Corona' },
    { nombre: 'PM', descripcion: 'Perno Muñon' },
    { nombre: '□', descripcion: 'Prótesis Fija' },
    { nombre: '▢', descripcion: 'Prótesis Removible' },
    { nombre: '■', descripcion: 'Piezas Existentes' }
  ];

  const getColor = (tratamiento: string): string => {
    switch (tratamiento) {
      case 'ROJO': return '#dc3545';
      case 'AZUL': return '#007bff';
      case '=': return '#6c757d'; // Gris para extracción
      case 'X': return '#dc3545'; // Rojo para diente ausente
      case '*': return '#fd7e14'; // Naranja para caries
      case '\\': return '#20c997'; // Verde para obturación
      case 'TC': return '#6f42c1'; // Púrpura para tratamiento de conducto
      case 'Pd': return '#e83e8c'; // Rosa para enfermedad periodontal
      case 'O': return '#ffc107'; // Amarillo para corona
      case 'PM': return '#17a2b8'; // Azul claro para perno muñón
      case '□': return '#28a745'; // Verde para prótesis fija
      case '▢': return '#20c997'; // Verde claro para prótesis removible
      case '■': return '#6c757d'; // Gris para piezas existentes
      default: return '#ffffff';
    }
  };

  return (
    <OdontogramaContainer>
      <Header>
        <ObservacionesInput
          type="text"
          placeholder="Observaciones:"
          value={observaciones}
          onChange={(e) => setObservaciones(e.target.value)}
        />
        <FechaInput>
          <input
            type="text"
            value={fecha}
            onChange={(e) => setFecha(e.target.value)}
            placeholder="DD/MM/YYYY"
          />
          <FaCalendarAlt className="calendar-icon" />
        </FechaInput>
      </Header>

      <OdontogramaTitle>Odontograma:</OdontogramaTitle>
      
      {/* Leyenda de colores compacta */}
      <ColorLegend>
        <LegendTitle>REFERENCIAS</LegendTitle>
        
        {/* Grid compacto de referencias - Solo ROJO y AZUL con cuadraditos */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
          gap: '8px',
          fontSize: '11px'
        }}>
          {/* Mostrar ROJO y AZUL con cuadraditos de color */}
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '6px',
            padding: '2px 0'
          }}>
            <ColorBox $color={getColor('ROJO')} style={{ 
              width: '16px', 
              height: '16px', 
              fontSize: '10px', 
              fontWeight: 'bold', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              minWidth: '16px'
            }}>
            </ColorBox>
            <span style={{ fontSize: '10px', lineHeight: '1.2' }}>
              ROJO: Tratamientos anteriores
            </span>
          </div>
          
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '6px',
            padding: '2px 0'
          }}>
            <ColorBox $color={getColor('AZUL')} style={{ 
              width: '16px', 
              height: '16px', 
              fontSize: '10px', 
              fontWeight: 'bold', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              minWidth: '16px'
            }}>
            </ColorBox>
            <span style={{ fontSize: '10px', lineHeight: '1.2' }}>
              AZUL: Tratamientos requeridos
            </span>
          </div>
          
          {/* Mostrar otros tratamientos sin cuadraditos, solo texto */}
          {tratamientos.filter(t => t.nombre !== 'ROJO' && t.nombre !== 'AZUL').map(tratamiento => (
            <div key={tratamiento.nombre} style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '6px',
              padding: '2px 0'
            }}>
              <span style={{ 
                fontSize: '12px', 
                fontWeight: 'bold',
                width: '20px',
                textAlign: 'center'
              }}>
                {tratamiento.nombre === '=' || tratamiento.nombre === 'X' || tratamiento.nombre === '*' || tratamiento.nombre === '\\' || tratamiento.nombre === '■' || tratamiento.nombre === '□' || tratamiento.nombre === '▢'
                  ? tratamiento.nombre 
                  : tratamiento.nombre}
              </span>
              <span style={{ fontSize: '10px', lineHeight: '1.2' }}>
                {tratamiento.descripcion}
              </span>
            </div>
          ))}
        </div>
      </ColorLegend>
      
      <OdontogramaGrid>
        {/* Primera fila: 16 dientes - Permanentes Superiores */}
        {renderFila(
          piezasPermanentes.superiorDerecho, 
          piezasPermanentes.superiorIzquierdo
        )}
        
        {/* Segunda fila: 10 dientes - Temporales Superiores */}
        {renderFila(
          [...piezasTemporales.superiorDerecho].reverse(), 
          piezasTemporales.superiorIzquierdo
        )}
        
        {/* Tercera fila: 10 dientes - Temporales Inferiores */}
        {renderFila(
          [...piezasTemporales.inferiorDerecho].reverse(), 
          piezasTemporales.inferiorIzquierdo
        )}
        
        {/* Cuarta fila: 16 dientes - Permanentes Inferiores */}
        {renderFila(
          [...piezasPermanentes.inferiorDerecho].reverse(), 
          piezasPermanentes.inferiorIzquierdo
        )}
      </OdontogramaGrid>

      {/* Menú Contextual */}
      <MenuContextual 
        $show={menuContextual.show}
        $position={menuContextual.position}
      >
        <MenuSection $color="#007bff">
          {menuContextual.cara 
            ? `TRATAMIENTO - CARA ${menuContextual.cara.toUpperCase()} - PIEZA ${menuContextual.pieza}`
            : `TRATAMIENTOS - PIEZA ${menuContextual.pieza}`
          }
        </MenuSection>
        
        {tratamientoPendiente ? (
          <>
            <MenuSection $color="#ffc107">
              TRATAMIENTO SELECCIONADO: {tratamientos.find(t => t.nombre === tratamientoPendiente)?.descripcion || tratamientoPendiente}
              <br />
              <small style={{ fontSize: '10px', opacity: 0.9 }}>Selecciona el tipo de tratamiento:</small>
            </MenuSection>
            <MenuItem 
              onClick={() => handleTratamientoSelect('ROJO')}
              style={{ backgroundColor: '#dc3545', color: 'white', fontWeight: 'bold' }}
            >
              ROJO: Tratamientos anteriores
            </MenuItem>
            <MenuItem 
              onClick={() => handleTratamientoSelect('AZUL')}
              style={{ backgroundColor: '#007bff', color: 'white', fontWeight: 'bold' }}
            >
              AZUL: Tratamientos requeridos
            </MenuItem>
            <LimpiarButton 
              onClick={() => setTratamientoPendiente(null)}
              style={{ backgroundColor: '#6c757d', marginTop: '5px' }}
            >
              Cancelar
            </LimpiarButton>
          </>
        ) : (
          <>
            {tratamientos.map(tratamiento => (
              <MenuItem 
                key={tratamiento.nombre}
                onClick={() => handleTratamientoSelect(tratamiento.nombre)}
              >
                {tratamiento.nombre}: {tratamiento.descripcion}
              </MenuItem>
            ))}
            
            <LimpiarButton onClick={handleLimpiarPieza}>
              <FaTrash />
              {menuContextual.cara ? `LIMPIAR CARA ${menuContextual.cara.toUpperCase()}` : 'LIMPIAR PIEZA'}
            </LimpiarButton>
          </>
        )}
      </MenuContextual>

      {/* Botón de guardar */}
      <div style={{ marginTop: '30px', textAlign: 'center' }}>
        <button 
          onClick={handleSave}
          disabled={isSaving}
          style={{
            padding: '12px 24px',
            backgroundColor: isSaving ? '#6c757d' : '#28a745',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: isSaving ? 'not-allowed' : 'pointer',
            fontSize: '14px',
            fontWeight: '600',
            opacity: isSaving ? 0.7 : 1,
            transition: 'all 0.3s ease',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            textTransform: 'uppercase',
            letterSpacing: '0.5px'
          }}
        >
          {isSaving ? 'Guardando...' : 'Guardar Odontograma'}
        </button>
      </div>
    </OdontogramaContainer>
  );
};

export default Odontograma;
