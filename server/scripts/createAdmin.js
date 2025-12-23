const mongoose = require('mongoose');
const Usuario = require('../models/Usuario');
require('dotenv').config();

const createAdmin = async () => {
  try {
    // Conectar a MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/odontologia', {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    
    console.log('Conectado a MongoDB');
    
    // Verificar si ya existe un admin con ese email
    const adminExistente = await Usuario.findOne({ 
      $or: [
        { email: 'admin@odontologia.com' },
        { rol: 'admin' }
      ]
    });
    
    if (adminExistente) {
      if (adminExistente.email === 'admin@odontologia.com') {
        console.log('⚠️  Ya existe un usuario administrador con ese email:');
        console.log(`Email: ${adminExistente.email}`);
        console.log(`Nombre: ${adminExistente.nombre}`);
        console.log(`Rol: ${adminExistente.rol}`);
        console.log(`Estado: ${adminExistente.activo ? 'Activo' : 'Inactivo'}`);
        console.log('\nSi deseas crear un nuevo admin, usa un email diferente.');
        console.log('O puedes iniciar sesión con las credenciales existentes.');
        process.exit(0);
      } else {
        console.log('⚠️  Ya existe un usuario administrador en el sistema:');
        console.log(`Email: ${adminExistente.email}`);
        console.log(`Nombre: ${adminExistente.nombre}`);
        console.log('\nSi deseas crear otro admin, modifica el email en el script.');
        process.exit(0);
      }
    }
    
    // Crear usuario admin
    try {
      const admin = new Usuario({
        nombre: 'Administrador',
        email: 'admin@odontologia.com',
        password: 'admin123', // Se hasheará automáticamente
        rol: 'admin',
        activo: true
      });
      
      await admin.save();
      
      console.log('✅ Usuario administrador creado exitosamente:');
      console.log(`Email: ${admin.email}`);
      console.log(`Contraseña: admin123`);
      console.log('⚠️  IMPORTANTE: Cambia la contraseña después del primer inicio de sesión');
    } catch (error) {
      if (error.code === 11000) {
        console.log('⚠️  Error: Ya existe un usuario con ese email.');
        console.log('Por favor, verifica las credenciales existentes o usa un email diferente.');
      } else {
        throw error;
      }
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Error creando administrador:', error);
    process.exit(1);
  }
};

createAdmin();

