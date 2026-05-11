const express = require('express');
const webpush = require('web-push');

const app = express();
app.use(express.json());

// CORS para que el frontend pueda conectarse
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.sendStatus(200);
  next();
});

// Claves VAPID del proyecto Firebase
webpush.setVapidDetails(
  'mailto:demo@g11.dev',
  process.env.VAPID_PUBLIC || 'BIzF4QkrDPrWexnLeXEmxgqvjHD0iPsEFsInMjBY5TJ5dHZ8W9UBAkWG6zhnWOfCzczrLSrBzd4s2DMYkcCdJQY',
  process.env.VAPID_PRIVATE || 'MGi32Whqzv4H1D84uSPJDcsVzVMT02OqFTP4w9_lwvU'
);

// Almacenamiento en memoria (suficiente para demo)
const subscriptions = [];

// Frontend registra su suscripción
app.post('/subscribe', (req, res) => {
  const sub = req.body;
  const yaExiste = subscriptions.some(s => s.endpoint === sub.endpoint);
  if (!yaExiste) {
    subscriptions.push(sub);
    console.log(`✅ Nuevo suscriptor. Total: ${subscriptions.length}`);
  }
  res.sendStatus(201);
});

// Disparar notificación a todos los suscriptores
app.post('/notify', async (req, res) => {
  const { title = 'Carbon', body = 'Nueva notificación' } = req.body;
  const payload = JSON.stringify({ title, body });

  const results = await Promise.allSettled(
    subscriptions.map(sub => webpush.sendNotification(sub, payload))
  );

  const sent = results.filter(r => r.status === 'fulfilled').length;
  console.log(`📢 Enviadas: ${sent}/${subscriptions.length}`);
  res.json({ sent, total: subscriptions.length });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Servidor push en http://localhost:${PORT}`));
