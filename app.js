const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app); // Socket.IO necesita este servidor "en bruto"
const io = new Server(server);

// Express sirve los archivos del frontend (la carpeta "public")
app.use(express.static('public'));

// Se ejecuta una vez por cada cliente que se conecta
io.on('connection', (socket) => {
  console.log('Alguien se ha conectado:', socket.id);

  // El cliente envía un mensaje: { nom, text }
  socket.on('chat:send', (data) => {
    // 1. Comprobamos que nos han enviado algo
    if (!data) return;

    // 2. El nombre y el texto deben ser cadenas de texto
    if (typeof data.nom !== 'string' || typeof data.text !== 'string') return;

    // 3. Quitamos espacios al principio y al final
    const nom = data.nom.trim();
    const text = data.text.trim();

    // 4. No pueden estar vacíos ni pasarse de longitud (20 y 500)
    if (nom === '' || text === '') return;
    if (nom.length > 20 || text.length > 500) return;

    // 5. La hora la genera el servidor (el cliente no puede falsearla)
    const hora = new Date().toLocaleTimeString('ca-ES', {
      hour: '2-digit',
      minute: '2-digit',
    });

    // 6. io.emit envía el mensaje a TODOS los clientes, incluido el que lo envió
    io.emit('chat:message', { nom, text, hora });
  });

  socket.on('disconnect', () => {
    console.log('Alguien se ha desconectado:', socket.id);
  });
});

server.listen(3000, () => console.log('Servidor en http://localhost:3000'));