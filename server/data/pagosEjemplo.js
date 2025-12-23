// Datos de ejemplo para pagos
const pagosEjemplo = [
  {
    _id: '1',
    pacienteId: '1',
    fecha: new Date('2024-01-15'),
    total: 150000,
    aCuenta: 150000,
    saldo: 0,
    estado: 'cancelado',
    metodoPago: 'efectivo',
    observaciones: 'Pago completo en efectivo',
    tratamientos: ['1', '2']
  },
  {
    _id: '2',
    pacienteId: '2',
    fecha: new Date('2024-01-20'),
    total: 200000,
    aCuenta: 100000,
    saldo: 100000,
    estado: 'parcial',
    metodoPago: 'tarjeta',
    observaciones: 'Pago parcial con tarjeta',
    tratamientos: ['3', '4']
  },
  {
    _id: '3',
    pacienteId: '3',
    fecha: new Date('2024-01-25'),
    total: 300000,
    aCuenta: 0,
    saldo: 300000,
    estado: 'pendiente',
    metodoPago: 'efectivo',
    observaciones: 'Tratamiento pendiente de pago',
    tratamientos: ['5', '6', '7']
  },
  {
    _id: '4',
    pacienteId: '4',
    fecha: new Date('2024-02-01'),
    total: 80000,
    aCuenta: 80000,
    saldo: 0,
    estado: 'cancelado',
    metodoPago: 'transferencia',
    observaciones: 'Pago completo por transferencia',
    tratamientos: ['8']
  },
  {
    _id: '5',
    pacienteId: '5',
    fecha: new Date('2024-02-05'),
    total: 250000,
    aCuenta: 125000,
    saldo: 125000,
    estado: 'parcial',
    metodoPago: 'cheque',
    observaciones: 'Pago parcial con cheque',
    tratamientos: ['9', '10']
  }
];

module.exports = pagosEjemplo;


