export interface Paciente {
  _id?: string;
  nombre: string;
  ci: string;
  alergias?: string;
  edad?: number;
  fechaNacimiento?: Date | string;
  telefono?: string;
  email?: string;
  direccion?: string;
  obraSocial?: string;
  numeroAfiliado?: string;
  ocupacion?: string;
  estadoCivil?: string;
  genero?: string;
  anamnesis?: {
    diabetes?: boolean;
    hipertension?: boolean;
    cardiopatia?: boolean;
    embarazo?: boolean;
    medicamentos?: string;
    antecedentesFamiliares?: string;
    observacionesMedicas?: string;
  };
  fechaRegistro?: Date;
  activo?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Odontograma {
  _id: string;
  pacienteId: string;
  fecha: Date;
  observaciones: string;
  piezasDentales: {
    [key: string]: {
      ausente?: boolean;
      caras?: {
        derecha: string | null;
        izquierda: string | null;
        superior: string | null;
        inferior: string | null;
        central: string | null;
      };
      // Mantener compatibilidad con versiones anteriores
      requerido?: string | null;
      existente?: string | null;
    };
  };
  historial: Array<{
    fecha: Date;
    pieza: string;
    tipo: 'requerido' | 'existente' | 'cara';
    cara?: 'derecha' | 'izquierda' | 'superior' | 'inferior' | 'central';
    estadoAnterior: string | null;
    estadoNuevo: string | null;
    observaciones?: string;
  }>;
  createdAt: Date;
  updatedAt: Date;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  errors?: string[];
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    current: number;
    pages: number;
    total: number;
    limit: number;
  };
}

export interface Tratamiento {
  _id: string;
  pacienteId: string | Paciente;
  consultaId?: string | Consulta;
  nombre: string;
  descripcion?: string;
  piezaDental: string;
  tipoTratamiento: 'preventivo' | 'restaurativo' | 'endodoncia' | 'periodoncia' | 'ortodoncia' | 'cirugia' | 'protesis' | 'otros';
  estado: 'programado' | 'en_proceso' | 'completado' | 'cancelado';
  costo: number;
  fechaProgramada?: Date;
  fechaInicio?: Date;
  fechaCompletado?: Date;
  observaciones?: string;
  sesiones?: Array<{
    numero: number;
    fecha: Date;
    descripcion?: string;
    costo?: number;
    completada: boolean;
  }>;
  materiales?: Array<{
    nombre: string;
    cantidad: number;
    costoUnitario: number;
    costoTotal: number;
  }>;
  createdAt: Date;
  updatedAt: Date;
}

export interface Consulta {
  _id: string;
  pacienteId: string;
  numeroConsulta: number;
  fecha: Date;
  motivoConsulta?: string;
  diagnostico?: string;
  tratamientosRealizados: Array<{
    piezaDental: string;
    tratamiento: string;
    costo: number;
    observaciones?: string;
  }>;
  costoTotal: number;
  costoConsulta: number;
  estado: 'pendiente' | 'completada' | 'cancelada';
  observacionesGenerales?: string;
  cambiosOdontograma?: string;
  odontogramaSnapshot?: any;
  anamnesis?: {
    sintomas?: string;
    alergias?: string;
    medicamentos?: string;
    antecedentesClinicos?: string;
    examenFisico?: string;
    planTratamiento?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface Cita {
  _id: string;
  pacienteId: string | Paciente;
  fecha: Date;
  hora: string;
  motivo?: string;
  estado: 'programada' | 'confirmada' | 'en_progreso' | 'completada' | 'ausente' | 'cancelada';
  observaciones?: string;
  consultaId?: string | Consulta;
  tipoCita: 'consulta' | 'tratamiento' | 'revision' | 'urgencia' | 'limpieza';
  costoEstimado: number;
  recordatorioEnviado: boolean;
  fechaRecordatorio?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface ResumenConsultas {
  totalConsultas: number;
  consultasCompletadas: number;
  consultasPendientes: number;
  costoTotal: number;
  ultimaConsulta: Consulta | null;
  historial: Consulta[];
}

export interface EstadisticasCitas {
  totalCitas: number;
  porEstado: Array<{
    _id: string;
    count: number;
    totalCosto: number;
  }>;
  resumen: {
    [key: string]: number;
  };
}

export interface EstadisticasPagos {
  totalPagado: number;
  totalPendiente: number;
  totalConsultas: number;
  totalTratamientos: number;
}

export interface Pago {
  _id: string;
  pacienteId: string;
  consultaId?: string;
  tratamientoId?: string;
  fecha: string;
  tipoPago: 'consulta' | 'tratamiento' | 'parcial' | 'total';
  concepto: string;
  monto: number;
  estado: 'pendiente' | 'pagado' | 'cancelado';
  metodoPago: 'efectivo' | 'tarjeta' | 'transferencia' | 'cheque';
  observaciones?: string;
  tratamientosDetalle?: Array<{
    piezaDental: string;
    tratamiento: string;
    costo: number;
    pagado: number;
  }>;
  montoTotal?: number;
  montoPagado?: number;
  saldoPendiente?: number;
  createdAt: string;
  updatedAt: string;
}

export interface Deuda {
  tipo: 'consulta' | 'tratamiento';
  consultaId?: string;
  tratamientoId?: string;
  numeroConsulta?: number;
  nombre?: string;
  piezaDental?: string;
  fecha: Date;
  descripcion: string;
  montoTotal: number;
  montoPagado: number;
  saldoPendiente: number;
  estado: string;
}

export interface DeudasResumen {
  deudas: Deuda[];
  totalPendiente: number;
  totalDeudas: number;
}
