// Datos de ejemplo en memoria para pruebas
const pacientesEjemplo = [
  {
    _id: '1',
    nombre: 'Roger Rodriguez',
    ci: '70554699',
    alergias: 'Ninguna',
    edad: 18,
    fechaRegistro: new Date('2023-06-03'),
    anamnesis: {
      diabetes: false,
      hipertension: false,
      cardiopatia: false,
      embarazo: false,
      medicamentos: 'Ninguno',
      antecedentesFamiliares: 'Ninguno',
      observacionesMedicas: ''
    }
  },
  {
    _id: '2',
    nombre: 'Manfred Reyes',
    ci: '',
    alergias: 'Ninguna',
    edad: null,
    fechaRegistro: new Date('2023-05-22'),
    anamnesis: {
      diabetes: false,
      hipertension: false,
      cardiopatia: false,
      embarazo: false,
      medicamentos: 'Ninguno',
      antecedentesFamiliares: 'Ninguno',
      observacionesMedicas: ''
    }
  },
  {
    _id: '3',
    nombre: 'Roger Villa',
    ci: '4563432',
    alergias: 'Ninguna',
    edad: 34,
    fechaRegistro: new Date('2023-05-03'),
    anamnesis: {
      diabetes: false,
      hipertension: false,
      cardiopatia: false,
      embarazo: false,
      medicamentos: 'Ninguno',
      antecedentesFamiliares: 'Ninguno',
      observacionesMedicas: ''
    }
  },
  {
    _id: '4',
    nombre: 'Romelio',
    ci: '3442',
    alergias: 'Ninguna',
    edad: null,
    fechaRegistro: new Date('2023-11-26'),
    anamnesis: {
      diabetes: false,
      hipertension: false,
      cardiopatia: false,
      embarazo: false,
      medicamentos: 'Ninguno',
      antecedentesFamiliares: 'Ninguno',
      observacionesMedicas: ''
    }
  },
  {
    _id: '5',
    nombre: 'Roger Mancilla Rojas',
    ci: '2345256',
    alergias: 'Ninguna',
    edad: null,
    fechaRegistro: new Date('2024-01-12'),
    anamnesis: {
      diabetes: false,
      hipertension: false,
      cardiopatia: false,
      embarazo: false,
      medicamentos: 'Ninguno',
      antecedentesFamiliares: 'Ninguno',
      observacionesMedicas: ''
    }
  }
];

module.exports = { pacientesEjemplo };


