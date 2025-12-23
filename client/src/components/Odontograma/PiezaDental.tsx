import React from 'react';
import styled from 'styled-components';

type Cara = 'derecha' | 'izquierda' | 'superior' | 'inferior' | 'central';

interface PiezaDentalProps {
  numero: string;
  caras?: {
    derecha: string | null;
    izquierda: string | null;
    superior: string | null;
    inferior: string | null;
    central: string | null;
  };
  ausente?: boolean;
  onCaraClick: (pieza: string, cara: Cara) => void;
  onAusenteClick: (pieza: string) => void;
  onCaraDoubleClick?: (pieza: string, cara: Cara) => void;
  isSelected?: boolean;
}

const PiezaContainer = styled.div<{ $isSelected: boolean }>`
  width: 65px;
  height: 75px;
  position: relative;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  
  &:hover {
    transform: translateY(-2px) scale(1.02);
    filter: drop-shadow(0 4px 8px rgba(0,0,0,0.15));
  }
`;

const SvgContainer = styled.svg<{ $ausente: boolean }>`
  width: 55px;
  height: 55px;
  cursor: pointer;
  ${props => props.$ausente ? 'opacity: 0.5;' : ''}
`;

const NumeroPieza = styled.span`
  position: absolute;
  font-size: 13px;
  font-weight: 600;
  color: #333;
  z-index: 2;
  pointer-events: none;
`;

const SímboloTexto = styled.text`
  font-size: 18px;
  font-weight: bold;
  fill: #000000;
  pointer-events: none;
  user-select: none;
`;

const PiezaDental: React.FC<PiezaDentalProps> = ({
  numero,
  caras,
  ausente = false,
  onCaraClick,
  onAusenteClick,
  onCaraDoubleClick,
  isSelected = false
}) => {
  const handleCaraClick = (e: React.MouseEvent, cara: Cara) => {
    e.preventDefault();
    e.stopPropagation();
    if (!ausente) {
      onCaraClick(numero, cara);
    }
  };

  const handleCaraDoubleClick = (e: React.MouseEvent, cara: Cara) => {
    e.preventDefault();
    e.stopPropagation();
    if (!ausente && onCaraDoubleClick) {
      // Si todas las caras tienen "=" (extracción), permitir doble click en cualquier cara para eliminar
      const todasCarasExtraccion = caras && 
        caras.derecha === '=' && 
        caras.izquierda === '=' && 
        caras.superior === '=' && 
        caras.inferior === '=' && 
        caras.central === '=';
      
      if (todasCarasExtraccion) {
        // Eliminar extracción de todas las caras
        onCaraDoubleClick(numero, cara);
      } else {
        // Comportamiento normal: eliminar solo la cara seleccionada
        onCaraDoubleClick(numero, cara);
      }
    }
  };

  const handleDienteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    // Doble clic para marcar como ausente
    if (e.detail === 2) {
      onAusenteClick(numero);
    }
  };

  const getTratamientoNombre = (tratamiento: string | null): string => {
    if (!tratamiento) return '';
    
    // Si tiene formato "ROJO:*" o "AZUL:*", parsear
    if (tratamiento.includes(':')) {
      const [modo, simbolo] = tratamiento.split(':');
      const tratamientos: { [key: string]: string } = {
        '=': 'Extracción',
        '*': 'Caries',
        '\\': 'Obturación',
        'TC': 'Tratamiento de Conducto',
        'Pd': 'Enfermedad Periodontal',
        'O': 'Corona',
        'PM': 'Perno Muñón',
        '□': 'Prótesis Fija',
        '▢': 'Prótesis Removible',
        '■': 'Piezas Existentes'
      };
      const modoNombre = modo === 'ROJO' ? 'Tratamientos anteriores' : 'Tratamientos requeridos';
      const simboloNombre = tratamientos[simbolo] || simbolo;
      return `${modoNombre} - ${simboloNombre}`;
    }
    
    const tratamientos: { [key: string]: string } = {
      'ROJO': 'Tratamientos anteriores',
      'AZUL': 'Tratamientos requeridos',
      '=': 'Extracción',
      'X': 'Diente Ausente',
      '*': 'Caries',
      '\\': 'Obturación',
      'TC': 'Tratamiento de Conducto',
      'Pd': 'Enfermedad Periodontal',
      'O': 'Corona',
      'PM': 'Perno Muñón',
      '□': 'Prótesis Fija',
      '▢': 'Prótesis Removible',
      '■': 'Piezas Existentes'
    };
    return tratamientos[tratamiento] || tratamiento;
  };

  // Función para parsear tratamiento con formato "ROJO:*" o "AZUL:*"
  const parseTratamiento = (tratamiento: string | null): { color: string; simbolo: string | null } => {
    if (!tratamiento) return { color: '#ffffff', simbolo: null };
    
    // Si tiene formato "ROJO:*" o "AZUL:*"
    if (tratamiento.includes(':')) {
      const [modo, simbolo] = tratamiento.split(':');
      if (modo === 'ROJO') {
        return { color: '#dc3545', simbolo: simbolo || null };
      } else if (modo === 'AZUL') {
        return { color: '#007bff', simbolo: simbolo || null };
      }
    }
    
    // Tratamientos sin modo (comportamiento anterior)
    switch (tratamiento) {
      case 'ROJO': return { color: '#dc3545', simbolo: null };
      case 'AZUL': return { color: '#007bff', simbolo: null };
      case '=': return { color: '#ffffff', simbolo: '=' };
      case '*': return { color: '#fd7e14', simbolo: '*' };
      case '\\': return { color: '#20c997', simbolo: '\\' };
      case 'TC': return { color: '#6f42c1', simbolo: 'TC' };
      case 'Pd': return { color: '#e83e8c', simbolo: 'Pd' };
      case 'O': return { color: '#ffc107', simbolo: 'O' };
      case 'PM': return { color: '#17a2b8', simbolo: 'PM' };
      case '□': return { color: '#28a745', simbolo: '□' };
      case '▢': return { color: '#20c997', simbolo: '▢' };
      case '■': return { color: '#ffffff', simbolo: '■' };
      default: return { color: '#f0f0f0', simbolo: tratamiento };
    }
  };

  const getColorForTratamiento = (tratamiento: string | null): string => {
    return parseTratamiento(tratamiento).color;
  };
  
  const getSimboloForTratamiento = (tratamiento: string | null): string | null => {
    return parseTratamiento(tratamiento).simbolo;
  };

  const getTextColorForTratamiento = (tratamiento: string | null): string => {
    if (!tratamiento) return '#000000';
    // Si tiene formato "ROJO:*" o "AZUL:*", usar texto blanco
    if (tratamiento.includes(':')) {
      const [modo] = tratamiento.split(':');
      if (modo === 'ROJO' || modo === 'AZUL') return '#ffffff';
    }
    if (tratamiento === 'ROJO' || tratamiento === 'AZUL') return '#ffffff';
    return '#000000';
  };

  // Determinar posición del número según el cuadrante
  const getNumberPosition = (numero: string) => {
    const num = parseInt(numero);
    if (num >= 11 && num <= 18) return 'top'; // Superiores derechos
    if (num >= 21 && num <= 28) return 'top'; // Superiores izquierdos
    if (num >= 31 && num <= 38) return 'bottom'; // Inferiores izquierdos
    if (num >= 41 && num <= 48) return 'bottom'; // Inferiores derechos
    if (num >= 51 && num <= 55) return 'top'; // Deciduos superiores derechos
    if (num >= 61 && num <= 65) return 'top'; // Deciduos superiores izquierdos
    if (num >= 71 && num <= 75) return 'bottom'; // Deciduos inferiores izquierdos
    if (num >= 81 && num <= 85) return 'bottom'; // Deciduos inferiores derechos
    return 'bottom';
  };

  const numberPosition = getNumberPosition(numero);
  const carasData = caras || {
    derecha: null,
    izquierda: null,
    superior: null,
    inferior: null,
    central: null
  };

  // Dimensiones del SVG
  const size = 55;
  const centerX = size / 2;
  const centerY = size / 2;
  const outerRadius = size / 2 - 1.25; // Radio exterior (considerando el borde)
  const innerRadius = 10; // Radio del círculo central
  const strokeWidth = 2.5;

  // Calcular puntos usando coordenadas polares para los segmentos
  // Segmento derecho: de -45° a 45°
  const getPointOnCircle = (angle: number, radius: number) => {
    const rad = (angle * Math.PI) / 180;
    return {
      x: centerX + radius * Math.cos(rad),
      y: centerY + radius * Math.sin(rad)
    };
  };

  const topRightOuter = getPointOnCircle(-45, outerRadius);
  const bottomRightOuter = getPointOnCircle(45, outerRadius);
  const topRightInner = getPointOnCircle(-45, innerRadius);
  const bottomRightInner = getPointOnCircle(45, innerRadius);

  const bottomRightOuter2 = getPointOnCircle(45, outerRadius);
  const bottomLeftOuter = getPointOnCircle(135, outerRadius);
  const bottomRightInner2 = getPointOnCircle(45, innerRadius);
  const bottomLeftInner = getPointOnCircle(135, innerRadius);

  const bottomLeftOuter2 = getPointOnCircle(135, outerRadius);
  const topLeftOuter = getPointOnCircle(225, outerRadius);
  const bottomLeftInner2 = getPointOnCircle(135, innerRadius);
  const topLeftInner = getPointOnCircle(225, innerRadius);

  const topLeftOuter2 = getPointOnCircle(225, outerRadius);
  const topRightOuter2 = getPointOnCircle(315, outerRadius);
  const topLeftInner2 = getPointOnCircle(225, innerRadius);
  const topRightInner2 = getPointOnCircle(315, innerRadius);

  // Colores de las caras (cuando está ausente, mantener blanco, solo la cruz será roja)
  const colorDerecha = ausente ? '#ffffff' : getColorForTratamiento(carasData.derecha);
  const colorIzquierda = ausente ? '#ffffff' : getColorForTratamiento(carasData.izquierda);
  const colorSuperior = ausente ? '#ffffff' : getColorForTratamiento(carasData.superior);
  const colorInferior = ausente ? '#ffffff' : getColorForTratamiento(carasData.inferior);
  const colorCentral = ausente ? '#ffffff' : getColorForTratamiento(carasData.central);

  // Paths para los segmentos (trapezoidales curvos)
  // Segmento derecho (de -45° a 45°)
  const pathDerecha = `M ${topRightInner.x} ${topRightInner.y}
    L ${topRightOuter.x} ${topRightOuter.y}
    A ${outerRadius} ${outerRadius} 0 0 1 ${bottomRightOuter.x} ${bottomRightOuter.y}
    L ${bottomRightInner.x} ${bottomRightInner.y}
    A ${innerRadius} ${innerRadius} 0 0 1 ${topRightInner.x} ${topRightInner.y} Z`;

  // Segmento inferior (de 45° a 135°)
  const pathInferior = `M ${bottomRightInner2.x} ${bottomRightInner2.y}
    L ${bottomRightOuter2.x} ${bottomRightOuter2.y}
    A ${outerRadius} ${outerRadius} 0 0 1 ${bottomLeftOuter.x} ${bottomLeftOuter.y}
    L ${bottomLeftInner.x} ${bottomLeftInner.y}
    A ${innerRadius} ${innerRadius} 0 0 1 ${bottomRightInner2.x} ${bottomRightInner2.y} Z`;

  // Segmento izquierdo (de 135° a 225°)
  const pathIzquierda = `M ${bottomLeftInner2.x} ${bottomLeftInner2.y}
    L ${bottomLeftOuter2.x} ${bottomLeftOuter2.y}
    A ${outerRadius} ${outerRadius} 0 0 1 ${topLeftOuter.x} ${topLeftOuter.y}
    L ${topLeftInner.x} ${topLeftInner.y}
    A ${innerRadius} ${innerRadius} 0 0 1 ${bottomLeftInner2.x} ${bottomLeftInner2.y} Z`;

  // Segmento superior (de 225° a 315°)
  const pathSuperior = `M ${topLeftInner2.x} ${topLeftInner2.y}
    L ${topLeftOuter2.x} ${topLeftOuter2.y}
    A ${outerRadius} ${outerRadius} 0 0 1 ${topRightOuter2.x} ${topRightOuter2.y}
    L ${topRightInner2.x} ${topRightInner2.y}
    A ${innerRadius} ${innerRadius} 0 0 1 ${topLeftInner2.x} ${topLeftInner2.y} Z`;


  return (
    <PiezaContainer
      id={`pieza-${numero}`}
      $isSelected={isSelected}
      onClick={handleDienteClick}
      title={`Pieza ${numero}${ausente ? ' - AUSENTE' : ''} (Doble clic para marcar ausente)`}
    >
      <SvgContainer
        $ausente={ausente}
        viewBox={`0 0 ${size} ${size}`}
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Círculo exterior */}
        <circle
          cx={centerX}
          cy={centerY}
          r={outerRadius}
          fill="none"
          stroke="#333"
          strokeWidth={strokeWidth}
        />

        {/* Segmento derecho */}
        <path
          d={pathDerecha}
          fill={colorDerecha}
          stroke="#333"
          strokeWidth="1.5"
          onClick={(e) => handleCaraClick(e as any, 'derecha')}
          onDoubleClick={(e) => handleCaraDoubleClick(e as any, 'derecha')}
          style={{ cursor: 'pointer' }}
        >
          <title>
            {carasData.derecha
              ? `${getTratamientoNombre(carasData.derecha)} - Cara derecha (Doble clic para quitar)`
              : 'Cara derecha'}
          </title>
        </path>

        {/* Segmento inferior */}
        <path
          d={pathInferior}
          fill={colorInferior}
          stroke="#333"
          strokeWidth="1.5"
          onClick={(e) => handleCaraClick(e as any, 'inferior')}
          onDoubleClick={(e) => handleCaraDoubleClick(e as any, 'inferior')}
          style={{ cursor: 'pointer' }}
        >
          <title>
            {carasData.inferior
              ? `${getTratamientoNombre(carasData.inferior)} - Cara inferior (Doble clic para quitar)`
              : 'Cara inferior'}
          </title>
        </path>

        {/* Segmento izquierdo */}
        <path
          d={pathIzquierda}
          fill={colorIzquierda}
          stroke="#333"
          strokeWidth="1.5"
          onClick={(e) => handleCaraClick(e as any, 'izquierda')}
          onDoubleClick={(e) => handleCaraDoubleClick(e as any, 'izquierda')}
          style={{ cursor: 'pointer' }}
        >
          <title>
            {carasData.izquierda
              ? `${getTratamientoNombre(carasData.izquierda)} - Cara izquierda (Doble clic para quitar)`
              : 'Cara izquierda'}
          </title>
        </path>

        {/* Segmento superior */}
        <path
          d={pathSuperior}
          fill={colorSuperior}
          stroke="#333"
          strokeWidth="1.5"
          onClick={(e) => handleCaraClick(e as any, 'superior')}
          onDoubleClick={(e) => handleCaraDoubleClick(e as any, 'superior')}
          style={{ cursor: 'pointer' }}
        >
          <title>
            {carasData.superior
              ? `${getTratamientoNombre(carasData.superior)} - Cara superior (Doble clic para quitar)`
              : 'Cara superior'}
          </title>
        </path>

        {/* Círculo central */}
        <circle
          cx={centerX}
          cy={centerY}
          r={innerRadius}
          fill={colorCentral}
          stroke="#333"
          strokeWidth={strokeWidth}
          onClick={(e) => handleCaraClick(e as any, 'central')}
          onDoubleClick={(e) => handleCaraDoubleClick(e as any, 'central')}
          style={{ cursor: 'pointer' }}
        >
          <title>
            {carasData.central
              ? `${getTratamientoNombre(carasData.central)} - Cara central (Doble clic para quitar)`
              : 'Cara central'}
          </title>
        </circle>

        {/* Símbolos de tratamiento */}
        {!ausente && (() => {
          const simboloDerecha = getSimboloForTratamiento(carasData.derecha);
          if (simboloDerecha && simboloDerecha !== '=' && simboloDerecha !== '■') {
            return (
              <SímboloTexto
                key="derecha"
                x={centerX + outerRadius * 0.6}
                y={centerY}
                textAnchor="middle"
                dominantBaseline="middle"
                fill={getTextColorForTratamiento(carasData.derecha)}
              >
                {simboloDerecha}
              </SímboloTexto>
            );
          }
          return null;
        })()}

        {!ausente && (() => {
          const simboloInferior = getSimboloForTratamiento(carasData.inferior);
          if (simboloInferior && simboloInferior !== '=' && simboloInferior !== '■') {
            return (
              <SímboloTexto
                key="inferior"
                x={centerX}
                y={centerY + outerRadius * 0.6}
                textAnchor="middle"
                dominantBaseline="middle"
                fill={getTextColorForTratamiento(carasData.inferior)}
              >
                {simboloInferior}
              </SímboloTexto>
            );
          }
          return null;
        })()}

        {!ausente && (() => {
          const simboloIzquierda = getSimboloForTratamiento(carasData.izquierda);
          if (simboloIzquierda && simboloIzquierda !== '=' && simboloIzquierda !== '■') {
            return (
              <SímboloTexto
                key="izquierda"
                x={centerX - outerRadius * 0.6}
                y={centerY}
                textAnchor="middle"
                dominantBaseline="middle"
                fill={getTextColorForTratamiento(carasData.izquierda)}
              >
                {simboloIzquierda}
              </SímboloTexto>
            );
          }
          return null;
        })()}

        {!ausente && (() => {
          const simboloSuperior = getSimboloForTratamiento(carasData.superior);
          if (simboloSuperior && simboloSuperior !== '=' && simboloSuperior !== '■') {
            return (
              <SímboloTexto
                key="superior"
                x={centerX}
                y={centerY - outerRadius * 0.6}
                textAnchor="middle"
                dominantBaseline="middle"
                fill={getTextColorForTratamiento(carasData.superior)}
              >
                {simboloSuperior}
              </SímboloTexto>
            );
          }
          return null;
        })()}

        {!ausente && (() => {
          const simboloCentral = getSimboloForTratamiento(carasData.central);
          if (simboloCentral && simboloCentral !== '=' && simboloCentral !== '■') {
            return (
              <SímboloTexto
                key="central"
                x={centerX}
                y={centerY}
                textAnchor="middle"
                dominantBaseline="middle"
                fill={getTextColorForTratamiento(carasData.central)}
              >
                {simboloCentral}
              </SímboloTexto>
            );
          }
          return null;
        })()}

        {/* Símbolo de extracción (=) - se muestra encima de todo el diente si cualquier cara tiene extracción */}
        {!ausente && (carasData.derecha === '=' || carasData.izquierda === '=' || carasData.superior === '=' || carasData.inferior === '=' || carasData.central === '=') && (
          <g stroke="#000000" strokeWidth="5" strokeLinecap="round">
            <line
              x1={centerX - outerRadius * 0.6}
              y1={centerY - 5}
              x2={centerX + outerRadius * 0.6}
              y2={centerY - 5}
            />
            <line
              x1={centerX - outerRadius * 0.6}
              y1={centerY + 5}
              x2={centerX + outerRadius * 0.6}
              y2={centerY + 5}
            />
          </g>
        )}

        {/* Cruz roja para diente ausente */}
        {ausente && (
          <>
            <line
              x1={centerX - outerRadius}
              y1={centerY - outerRadius}
              x2={centerX + outerRadius}
              y2={centerY + outerRadius}
              stroke="#dc3545"
              strokeWidth="4"
              strokeLinecap="round"
            />
            <line
              x1={centerX + outerRadius}
              y1={centerY - outerRadius}
              x2={centerX - outerRadius}
              y2={centerY + outerRadius}
              stroke="#dc3545"
              strokeWidth="4"
              strokeLinecap="round"
            />
          </>
        )}
      </SvgContainer>
      
      <NumeroPieza
        style={{
          [numberPosition]: '-15px',
          left: '50%',
          transform: 'translateX(-50%)'
        }}
      >
        {numero}
      </NumeroPieza>
    </PiezaContainer>
  );
};

export default PiezaDental;
