# 👤 PERSONA 3 - DEMO EN VIVO (4:00 min)

## Tu Rol
Hacker tech. Mostrar la app funcionando. Esto es LO MÁS IMPORTANTE.

---

## 🔧 SETUP PREVIO (CRUCIAL)

Antes de la presentación:

```bash
# En tu laptop
1. Chrome abierto en https://g11-coal.onrender.com
2. DevTools (F12) abierto en tab separada, minimizado
3. 3 notas precreadas para editar
4. Conectado a WiFi estable
5. Modo oscuro en Chrome (settings → theme)
```

**Backup Plan**: Descarga video de demo (grabar hoy offline test)

---

## ⏱️ TIMELINE DEMO (4:00 min)

### 0:00 - 0:30: MOSTRAR ESTADO NORMAL

```
"Aquí vemos Carbon funcionando normalmente.

Es una app de notas. Tenemos:
• Un árbol de carpetas (izquierda)
• Una nota abierta (centro)
• Preview del markdown (derecha)

Voy a seleccionar una nota y mostrar el editor."

Acción:
1. Click en una nota existente
2. Mostrar contenido markdown en editor
3. Señalar preview (derecha)
4. Editar 1 palabra en nota
5. Mostrar que preview se actualiza en tiempo real

Hablar:
"Ven cómo cuando escribo, el preview se actualiza automáticamente.
El markdown se renderiza en vivo."

[IMPORTANTE: Asegúrate que esto funciona antes]
```

---

### 0:30 - 2:00: DEMOSTRACIÓN OFFLINE (LO CLAVE)

```
"Ahora viene lo importante. Vamos a desconectar de internet
y la app sigue funcionando.

Voy a abrir Chrome DevTools."

Acción:
1. Presionar F12
2. DevTools aparece (abajo de pantalla)
3. Click en tab "Network"
4. Buscar checkbox "Offline" (arriba a la derecha)
5. ✅ MARCAR checkbox "Offline"

Hablar mientras esperas:
"Cuando activo modo offline, el navegador simula que no hay internet.
Vamos a ver qué pasa con la app."

Acción:
6. Cerrar DevTools (F12 de nuevo)
7. Recargar página (Ctrl+R)

Hablar:
"Miren, la página carga aunque no haya conexión.
Eso es el Service Worker sirviendo desde caché."
```

**TIMING CRÍTICO**: 0:30 a 2:00 es TODO lo offline.

---

### 1:00 - 1:30: EDITAR OFFLINE

```
"Ahora, sin conexión, voy a editar una nota."

Acción:
1. Click en una nota existente
2. Editar significativamente (cambiar título + 3 líneas de contenido)
3. Mostrar que guarda (si hay indicador visual)

Hablar:
"Ven cómo puedo editar, aunque no hay internet.

Esto es posible porque:
• El código JS está en caché (Service Worker)
• Los datos se guardan en IndexedDB (base de datos local)
• Automerge maneja los cambios"

Acción:
4. Crear UNA nota nueva (simple, 2-3 palabras)
5. Mostrar que aparece en el árbol (izquierda)
6. Click en ella, mostrar que se abre

Hablar:
"Incluso cree una nota nueva, completamente offline.
Sin internet. Funciona."
```

**TIMING CRÍTICO**: Asegúrate que todo esto funciona. Ensaya 2-3 veces.

---

### 2:00 - 3:30: RECONECTAR Y SINCRONIZAR

```
"Ahora voy a reconectar a internet y ver qué pasa."

Acción:
1. Presionar F12 (DevTools)
2. Click en Network tab (si no está visible)
3. Encontrar checkbox "Offline" otra vez
4. ✅ DESMARCAR checkbox

Hablar:
"Cuando desactivo modo offline, el navegador conecta de nuevo.

Miren la consola... [Apunta a DevTools]

Aquí puedes ver mensajes de sincronización.
Si hay conflictos, Automerge los resuelve automáticamente."

Acción:
5. Recargar página (Ctrl+R) - OPCIONAL, puede sincronizar sin recargar
6. Mostrar que los datos están actualizados

Hablar:
"Los cambios que hice offline:
✅ Se sincronizaron al servidor
✅ Se fusionaron con cambios de otros usuarios (si hay)
✅ Automerge resolvió conflictos automáticamente (CRDT)

Si dos personas editan la misma nota offline,
cuando reconectan, ambas ediciones se incluyen.
Sin conflictos. Sin sobrescribir datos."
```

---

### 3:30 - 4:00: INSTALACIÓN (SI DA TIEMPO)

```
"Finalmente, les muestro que la app es instalable.

Voy a abrir el menú de Chrome."

Acción:
1. Click en ⋮ (tres puntos, arriba derecha)
2. Buscar opción que diga "Instalar aplicación" o "Install app"

Hablar:
"Ven este botón? En móvil aparece automáticamente.
Cuando haces click, se descarga la app.

Resultado:
• Ícono en home screen
• Abre sin barra de navegación
• Funciona como app nativa
• Tiene acceso a notificaciones push"

[NO INSTALES DURANTE LA PRESENTACIÓN, solo muestras el diálogo]
```

---

## 🎬 PERFORMANCE DURANTE DEMO

- **Habla mientras esperas** que cargue
- Si hay lag: "Esto está en Render.com (cloud), por eso tardó un frame"
- Si algo falla: "El offline funciona porque vimos aquí [apunta]"

---

## 🆘 TROUBLESHOOTING

**"La página no carga offline"**
→ Asegúrate que visitaste la app en línea ANTES (cacheó assets)
→ Si no funciona, usa video de respaldo

**"Edición no sincroniza"**
→ Espera 3-5 segundos (WebSocket puede tardar)
→ Recarga manual (Ctrl+R)

**"DevTools se ve feo en proyector"**
→ Aumenta zoom (Ctrl +)
→ O usa video pre-grabado

**"Internet cae durante presentación"**
→ Activa modo offline voluntario (así parece controlado)
→ O pasa a video de respaldo

---

## 📹 VIDEO DE RESPALDO

```
Recomendación: GRABA ESTO HOY

$ ffmpeg -f gdigrab -framerate 30 \
  -i desktop -c:v libx264 -preset veryfast \
  demo-offline.mp4

Incluye: offline → editar → reconectar → sincronizar

Si falla demo en vivo, proyectas video.
```

---

## ✅ CHECKLIST PRE-DEMO

- [ ] Internet estable (50+ Mbps, sin VPN)
- [ ] Laptop con batería o conectada
- [ ] Chrome sin plugins raros
- [ ] DevTools funciona
- [ ] 3 notas precreadas
- [ ] Video de respaldo descargado
- [ ] Zoom de pantalla ajustado (+20%)
- [ ] Reloj/cronómetro visible

---

