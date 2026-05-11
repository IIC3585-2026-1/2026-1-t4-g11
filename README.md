# Carbon

Carbon es una aplicacion web progresiva de notas colaborativas desarrollada por el Grupo 11 para IIC3585.

La aplicacion permite crear, editar y organizar notas con soporte offline, sincronizacion colaborativa y notificaciones push.

## Integrantes

- Gary Diaz
- Jaime Perez
- Larry Uribe
- David Leal

## Tecnologias

- TypeScript vanilla
- Vite
- vite-plugin-pwa
- Automerge
- IndexedDB
- Firebase Cloud Messaging
- Express
- web-push

## Funcionalidades

- Edicion de notas en tiempo real
- Funcionamiento offline
- Instalacion como PWA
- Sincronizacion automatica al reconectar
- Notificaciones push

## Ejecutar el frontend

```bash
npm install
npm run dev
```

## Generar build

```bash
npm run build
```

## Ejecutar el servidor de push

```bash
cd server
npm install
npm start
```

## Deploy

- Frontend desplegado en Render
- Servidor de push desplegable como Web Service usando la carpeta `server`
- Variable recomendada para el frontend: `VITE_PUSH_SERVER`

## URL del proyecto

https://g11-coal.onrender.com