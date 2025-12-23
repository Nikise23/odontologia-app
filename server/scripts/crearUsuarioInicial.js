const mongoose = require('mongoose');
const path = require('path');
const Usuario = require('../models/Usuario');
require('dotenv').config({ path: path.join(__dirname, '../config.env') });

// Script para crear usuario inicial
async function crearUsuarioInicial() {
  try {
    // Conectar a MongoDB
    const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/odontologia';
    
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log('✅ Conectado a MongoDB');
    
    // Verificar si ya existe un usuario dentista
    const usuarioExistente = await Usuario.findOne({ rol: 'dentista' });
    
    if (usuarioExistente) {
      console.log('⚠️  Ya existe un usuario dentista:', usuarioExistente.email);
      console.log('   Email:', usuarioExistente.email);
      console.log('   Si deseas crear otro usuario, usa la API /api/auth/registro');
      await mongoose.disconnect();
      return;
    }
    
    // Crear usuario inicial (dentista)
    const usuario = new Usuario({
      nombre: 'Dr. Admin',
      email: 'admin@odontologia.com',
      password: 'admin123', // Se encriptará automáticamente
      rol: 'dentista',
      activo: true
    });
    
    await usuario.save();
    
    console.log('✅ Usuario inicial creado exitosamente!');
    console.log('📧 Email: admin@odontologia.com');
    console.log('🔑 Password: admin123');
    console.log('👤 Rol: dentista');
    console.log('');
    console.log('⚠️  IMPORTANTE: Cambia la contraseña después del primer login!');
    
    await mongoose.disconnect();
    console.log('✅ Desconectado de MongoDB');
  } catch (error) {
    console.error('❌ Error:', error);
    await mongoose.disconnect();
    process.exit(1);
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  crearUsuarioInicial();
}

module.exports = crearUsuarioInicial;

