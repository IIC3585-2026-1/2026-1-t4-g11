# 🎯 PRESENTACIÓN GRUPO 11 - CARBON PWA
## 15 minutos | 4 Personas | Con Demo

---

## ⏱️ ESTRUCTURA TEMPORAL

```
00:00 - 01:30  | Intro + Contexto           [PERSONA 1]
01:30 - 04:00  | ¿Qué es una PWA?          [PERSONA 2]
04:00 - 08:00  | DEMO EN VIVO               [PERSONA 3 - Tech Lead]
08:00 - 11:30  | Cómo funciona técnico      [PERSONA 4]
11:30 - 15:00  | Conclusiones + Q&A        [TODOS]
```

---

## 📍 PERSONA 1: INTRO + CONTEXTO (1:30 min)

**Slide**: Portada con título "Carbon - PWA de Notas Colaborativas"

**Script** (pausado, claro):
```
"Hola, somos el grupo 11. Hoy les presentamos Carbon, 
una aplicación progresiva web inspirada en Bangle.

Carbon es una app de notas colaborativas que funciona 
offline, es instalable como app nativa, y recibe 
notificaciones push en tiempo real.

Lo interesante: no es un sitio web tradicional. 
Es una app que:
  • Funciona sin internet
  • Se instala en tu celular como cualquier app
  • Te notifica cambios de tus compañeros

Fue construida sin frameworks pesados (React, Vue), 
solo TypeScript vanilla, lo que la hace ágil y fácil 
de mantener."
```

**Duración exacta**: 1:30 (70 segundos)

**Lo que se ve**: Breve demo en YouTube o captura de la app abierta

---

## 📍 PERSONA 2: ¿QUÉ ES UNA PWA? (2:30 min)

**Slides**: 3 slides, uno por pilar

### Slide 1: Offline
```
🔌 OFFLINE: Funciona sin conexión

Cuando cargas la app, el Service Worker 
guarda todos los recursos en caché.

Sin internet:
  ✅ Puedo leer mis notas
  ✅ Puedo editar notas
  ✅ Los cambios se guardan localmente
  ❌ No sincroniza con otros (aún)

Cuando reconectas:
  → Todo se sincroniza automáticamente
```

**Tiempo**: 0:45

### Slide 2: Instalable
```
📱 INSTALABLE: App en tu home screen

El manifest.json le dice al navegador:
  • Nombre: "Carbon"
  • Ícono: [muestra icono]
  • Colores: tema claro/oscuro
  • Display: pantalla completa

Instalación:
  Desktop: ⋮ → "Instalar aplicación"
  Móvil: banner automático

Resultado: Icono en home, funciona sin barra de navegación
```

**Tiempo**: 0:50

### Slide 3: Notificaciones Push
```
🔔 PUSH: Notificaciones en tiempo real

El service worker puede recibir mensajes 
desde Firebase Cloud Messaging (backend).

Las notificaciones llegan incluso con app cerrada.

Ejemplo: Tu compañero edita una nota compartida
  → Firebase envía notificación
  → Service worker la muestra
  → Ves en tu celular (app abierta o cerrada)
```

**Tiempo**: 0:45

**Total Persona 2**: 2:30

---

## 🎬 PERSONA 3: DEMO EN VIVO (4:00 min)

**Setup previo**:
- Laptop conectada a proyector
- Chrome DevTools abierto en tab separada
- App en: https://g11-coal.onrender.com
- Modo pantalla completa (F11)
- Tener 2-3 notas precreadas para editar

### DEMO SEQUENCE

#### 0:00 - 0:30: Mostrar App Normal
```
"Aquí vemos Carbon funcionando normalmente con internet.
Tenemos 3 notas guardadas, un árbol de carpetas, 
y un editor markdown con preview."

Acción: Navegar entre notas, mostrar editor, preview.
```

#### 0:30 - 2:00: Offline Demo (LO IMPORTANTE)
```
"Ahora vamos a desconectar de internet.
Activamos modo offline en Chrome DevTools."

Acción:
1. Presionar F12 (DevTools)
2. Ir a Network tab
3. Marcar checkbox "Offline"
4. Cerrar DevTools (F12)
5. Recargar página (Ctrl+R)

Hablar mientras carga:
"Miren, la app sigue cargando aunque no hay internet..."
```

```
"Ahora sin conexión, voy a editar una nota."

Acción:
1. Seleccionar una nota existente
2. Editar su contenido
3. Mostrar que se guarda localmente
4. Crear una nueva nota
5. Mostrar en preview

"Todos los cambios se guardan en IndexedDB, 
una base de datos local del navegador."
```

#### 2:00 - 3:30: Reconexión
```
"Ahora vamos a reconectar a internet."

Acción:
1. F12 → Network
2. Desmarcar checkbox "Offline"
3. Mostrar DevTools console (arriba)
4. Recargar si es necesario

Hablar:
"Cuando reconectamos, la app sincroniza automáticamente
todos los cambios que hicimos offline.

Esto es posible gracias a Automerge, que usa 
CRDTs para resolver conflictos automáticamente.

Si dos personas editan lo mismo offline,
Automerge fusiona los cambios de forma inteligente."
```

#### 3:30 - 4:00: Instalación (si da tiempo)
```
"Finalmente, les muestro que la app es instalable.

En Chrome: menú ⋮ → Instalar aplicación"

Acción:
1. Clickear ⋮ (menu del navegador)
2. Mostrar opción "Instalar aplicación" o "Install app"
3. Mostrar diálogo de instalación
4. (No instalar en vivo, solo mostrar)

"En móvil, aparece un banner automático.
Una vez instalada, tiene icono propio en home, 
abre sin barra de navegación, 
y tiene acceso a notificaciones push."
```

**Timing clave**: Ensaya offline 2-3 veces antes. Es lo más impactante.

---

## 📍 PERSONA 4: CÓMO FUNCIONA TÉCNICO (3:30 min)

**Diapositivas**: Arquitectura + código

### Slide 1: Arquitectura PWA
```
┌─────────────────────────────────────┐
│         Carbon (React-free)         │
├─────────────────────────────────────┤
│                                     │
│  TypeScript Vanilla                 │
│  ↓                                  │
│  Vite (Build Tool)                  │
│  ↓                                  │
│  ┌─────────────────────────────────┐│
│  │ Service Worker (Workbox)        ││ → Offline
│  │ Firebase Messaging SW           ││ → Push
│  └─────────────────────────────────┘│
│  ↓                                  │
│  ┌─────────────────────────────────┐│
│  │ IndexedDB (Local Storage)       ││ → Datos
│  │ Automerge (CRDT)                ││ → Sincronización
│  └─────────────────────────────────┘│
│  ↓                                  │
│  Firebase Cloud Messaging           │ → Notificaciones
│  WebSocket (sync.automerge.org)     │ → Real-time
│                                     │
└─────────────────────────────────────┘
```

**Tiempo**: 0:50

### Slide 2: Flujo Offline
```
OFFLINE FLOW:

1. App carga
   ↓
2. Service Worker registra y cachea assets
   ↓
3. IndexedDBStorageAdapter guarda datos
   ↓
4. Usuario edita nota
   ↓
5. Automerge genera cambios locales
   ↓
6. Se guarda en IndexedDB (OFFLINE OK ✅)
   ↓
7. Conexión regresa
   ↓
8. WebSocket sincroniza con servidor
   ↓
9. Automerge fusiona automáticamente
   ↓
10. Conflictos resueltos (CRDT) ✅
```

**Tiempo**: 1:00

### Slide 3: Push Notifications
```
PUSH FLOW:

Backend (Firebase):
  Envía mensaje → Firebase Cloud Messaging

firebase-messaging-sw.js (Service Worker):
  ↓
  messaging.onBackgroundMessage()
  ↓
  Muestra notificación (incluso app cerrada) ✅
  ↓
Código (main.ts):
  ↓
  onMessage() listener (app abierta)
  ↓
  Muestra Notification ✅
  ↓
Usuario ve notificación independiente de estado app
```

**Tiempo**: 0:50

### Slide 4: Por qué No Frameworks
```
❌ React/Vue/Svelte:
   • Bundle size grande (1.5MB+)
   • Overhead innecesario para PWA
   • Difícil de deployar en edge

✅ TypeScript Vanilla:
   • Control total del rendering
   • Sin dependencias ocultas
   • Service Worker funciona perfecto
   • 60KB vs 1.5MB total
```

**Tiempo**: 0:50

**Total Persona 4**: 3:30

---

## 📍 TODOS: CONCLUSIONES + Q&A (3:30 min)

**Slide**: Resumen

**Hablen juntos (roten palabra)**:

```
Persona 1: "Carbon demuestra que las PWAs son el futuro.
Un usuario no necesita AppStore, no necesita instalar,
solo abre la web y listo."

Persona 2: "Lo más importante: funciona offline.
Eso es revolucionario para regiones con internet inestable."

Persona 3: "Técnicamente, hemos cumplido los 3 pilares:
offline ✅, push ✅, instalable ✅.
Todo sin frameworks complicados."

Persona 4: "Y lo mejor: es colaborativo en tiempo real.
Dos personas pueden editar la misma nota simultáneamente
y Automerge resuelve conflictos automáticamente."

[TODOS]: "¿Preguntas?"
```

**Duración**: 2:00 exposición + 1:30 Q&A

---

## 🎓 NOTAS IMPORTANTES

### Ensayo Previo
- [ ] Prueba offline 3-4 veces
- [ ] Asegúrate que DevTools se ve bien en proyector
- [ ] Descarga la app en móvil para mostrar instalación
- [ ] Ten URLs de backup por si internet falla
- [ ] Cronómetro: alguien cuenta tiempo (avisar en minuto 10)

### Problemas Comunes (Soluciones)
**"Internet desconecta durante presentación"**
→ Usa VPN, o modo offline simulado

**"Demo corre lento"**
→ Prepara video de backup (grabar antes)

**"Preguntan sobre...?"**
- Seguridad en datos: IndexedDB es local, no cloud
- Sincronización conflictos: Automerge CRDT lo resuelve
- Usuarios simultáneos: WebSocket broadcast

### Vestuario
Uniforme de presentación (sudaderas g11 si tienen)

---

## 📋 CHECKLIST PRE-PRESENTACIÓN

- [ ] 4 roles asignados (quién habla qué)
- [ ] Timing ensayado (no sobrepasar 15 min)
- [ ] Slides (PowerPoint / Google Slides) descargadas
- [ ] App en Render accesible (checkear internet)
- [ ] Laptop con DevTools y Chrome
- [ ] Proyector testeado
- [ ] Altavoces funcionan
- [ ] Todos conocen qué decir

---

## 🚀 ÚLTIMO CONSEJO

**No leer de diapositivas.** Cada persona memoriza su sección:
- Persona 1: "qué es Carbon en 1 frase"
- Persona 2: "3 pilares de PWA en ejemplos reales"
- Persona 3: Apunta al proyector, explica lo que ves
- Persona 4: Dibuja arquitectura en aire si es necesario

**Confianza > perfección**. Los profes ven que entienden.

¡Suerte! 🎉
