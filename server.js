// Importa los módulos necesarios
const express = require('express');
const path = require('path');
const dotenv = require('dotenv');

// Carga las variables de entorno desde el archivo .env
dotenv.config();

// Crea una instancia de la aplicación Express
const app = express();

// Define el puerto en el que correrá el servidor.
// Usará el puerto definido en las variables de entorno o el 3000 por defecto.
const PORT = process.env.PORT || 3000;

// Middleware para parsear JSON en el body de las peticiones
app.use(express.json());

// Middleware para servir los archivos estáticos (HTML, CSS, JS) de la carpeta 'public'
// Asegúrate de que tu archivo HTML esté en una carpeta llamada 'public'
app.use(express.static(path.join(__dirname, 'public'))); 

// Endpoint para enviar mensajes a Telegram de forma segura
app.post('/api/send-message', async (req, res) => {
    // 💡 CORRECCIÓN: 'keyboard' ahora está correctamente desestructurado para coincidir con el frontend
    const { text, keyboard } = req.body; 

    // Lee las credenciales desde las variables de entorno
    const token = process.env.TELEGRAM_BOT_TOKEN;
    const chat_id = process.env.TELEGRAM_CHAT_ID;

    // Valida que las variables de entorno estén cargadas
    if (!token || !chat_id) {
        return res.status(500).json({ error: 'Las variables de entorno de Telegram no están configuradas en el servidor.' });
    }

    // Valida que el texto del mensaje exista
    if (!text) {
        return res.status(400).json({ error: 'El texto del mensaje es requerido.' });
    }

    try {
        // Usamos fetch para comunicarnos con la API de Telegram desde el backend
        const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                chat_id: chat_id,
                text: text,
                // 💡 CLAVE CRUCIAL: 'reply_markup' es el nombre que espera la API de Telegram
                reply_markup: keyboard, 
                parse_mode: 'MarkdownV2',
            }),
        });
        const data = await response.json();
        res.status(response.status).json(data);
    } catch (error) {
        console.error('Error al enviar mensaje a Telegram:', error);
        res.status(500).json({ error: 'Error interno del servidor al contactar a Telegram.' });
    }
});

// Endpoint seguro para verificar la respuesta (callback) de Telegram
app.get('/api/check-update/:messageId', async (req, res) => {
    const { messageId } = req.params;
    const token = process.env.TELEGRAM_BOT_TOKEN;
    const chat_id = process.env.TELEGRAM_CHAT_ID;

    if (!token || !chat_id) {
        return res.status(500).json({ error: 'Variables de entorno de Telegram no configuradas.' });
    }

    let updateFound = false;
    const startTime = Date.now();
    const timeout = 60000; // 60 segundos de espera máxima

    while (Date.now() - startTime < timeout && !updateFound) {
        try {
            const response = await fetch(`https://api.telegram.org/bot${token}/getUpdates?offset=-1`);
            const data = await response.json();

            if (data.ok && data.result.length > 0) {
                const relevantUpdate = data.result.find(
                    (update) =>
                    update.callback_query &&
                    update.callback_query.message.message_id == messageId
                );

                if (relevantUpdate) {
                    updateFound = true;
                    const action = relevantUpdate.callback_query.data.split(':')[0];

                    // Eliminar los botones del mensaje en Telegram
                    await fetch(`https://api.telegram.org/bot${token}/editMessageReplyMarkup`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            chat_id: chat_id,
                            message_id: messageId,
                            reply_markup: { inline_keyboard: [] }
                        }),
                    });

                    // Enviar la acción al frontend
                    return res.json({ action });
                }
            }
        } catch (error) {
            console.error('Error durante el polling:', error);
            // Esperar antes de reintentar para no saturar en caso de error de red
            await new Promise(resolve => setTimeout(resolve, 5000));
        }
        // Esperar 2 segundos antes de la siguiente verificación
        if (!updateFound) await new Promise(resolve => setTimeout(resolve, 2000));
    }
    // Si se agota el tiempo, enviar una respuesta de timeout
    return res.status(408).json({ error: 'Timeout: No se recibió respuesta del operador.' });
});

// Inicia el servidor y lo pone a escuchar en el puerto definido
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Servidor corriendo en 0.0.0.0:${PORT}`);
});
