# 👤 PERSONA 2 - PILARES PWA (2:30 min)

## Tu Rol
Explicar los 3 pilares de PWA con ejemplos reales. Hazlo entendible.

---

## 🗣️ SCRIPT (divide en 3 partes)

### PARTE 1: OFFLINE (0:45 min)
```
"Pilar 1: Offline. ¿Qué significa?

[Señala slide de Offline]

Cuando abres esta app por primera vez, el navegador descarga
todos los archivos. Imágenes, código, estilos.

Un 'Service Worker' (un programa que corre en background)
guarda TODO esto en caché.

¿Resultado? Si cortas internet, la app sigue funcionando.

En Carbon:
• Puedes leer tus notas aunque no haya wifi
• Puedes editar
• Puedes crear notas nuevas
• Todo se guarda localmente en tu teléfono

Luego, cuando conectas internet otra vez,
los cambios se sincronizan automáticamente.

Es como tener Google Docs pero sin necesidad de conexión."
```

**Timing**: 0:45 exactos

---

### PARTE 2: INSTALABLE (0:50 min)
```
"Pilar 2: Instalable.

[Señala slide]

¿Sabes ese archivo 'manifest.json'? Es como un documento
que le dice al navegador quién es esta app.

Le dice:
• Mi nombre es Carbon
• Este es mi ícono
• Abre en pantalla completa (sin barra de navegación)
• Estos son mis colores

El navegador Lee eso y en Chrome aparece un botón que dice
'Instalar aplicación'.

Cuando haces click:
• Se descarga como app
• Aparece un ícono en tu home screen
• Funciona como cualquier app del AppStore
• La diferencia: ocupa menos espacio (es web)

En móvil, aparece un banner automático pidiendo que instales."
```

**Timing**: 0:50 exactos

---

### PARTE 3: PUSH (0:45 min)
```
"Pilar 3: Notificaciones Push.

[Señala slide]

Push significa que el servidor te envía mensajes
incluso cuando la app está cerrada.

En Carbon usamos Firebase Cloud Messaging.

Flujo:
1. Tu compañero edita una nota
2. El servidor envía notificación a Firebase
3. Firebase envía a tu teléfono
4. Un 'Service Worker' en tu celular recibe el mensaje
5. Te muestra una notificación
6. Abres la app
7. Ves los cambios sincronizados

Lo importante: recibiste la notificación SIN tener la app abierta.
Es como WhatsApp: te notifica aunque lo cierres."
```

**Timing**: 0:45 exactos

---

## ⏱️ TIMING TOTAL

- Parte 1 (Offline): 0:45
- Parte 2 (Instalable): 0:50
- Parte 3 (Push): 0:45
- Buffer: 0:10
- **TOTAL: 2:30**

---

## 💡 ANALOGÍAS QUE FUNCIONAN

- "Service Worker es como un asistente que guarda cosas en caché"
- "Manifest es un DNI que identifica la app"
- "Push es como WhatsApp: notificaciones aunque la app esté cerrada"

---

## 🎬 CONSEJOS DE PRESENTACIÓN

- Señala hacia la pantalla cuando mencionas slides
- Usa las manos para explicar (ícono en home, descarga, etc)
- Si alguien mira confundido, repite con otras palabras
- No uses "CRDT", "IndexedDB" en esta sección (Persona 4 lo explica)

---

## ⚠️ ERRORES A EVITAR

- ❌ No entres en detalles técnicos profundos
- ❌ No hables de "Service Worker" vs "Web Worker"
- ❌ No menciones "Workbox", "Firebase Admin SDK"

---

## ❓ PREGUNTAS POSIBLES

**P: "¿Eso funciona en Firefox?"**  
R: "Sí, pero mejor en Chrome. Firefox tiene soporte parcial."

**P: "¿Pierde datos si desinstalo?"**  
R: "Los datos están en IndexedDB (base de datos local). Se pierden."

---

