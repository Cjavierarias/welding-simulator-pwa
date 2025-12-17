# Configuración Rápida - Welding Simulator PWA

## 🚀 Instalación Rápida

### 1. Prerrequisitos
- Node.js 18+ instalado
- npm o yarn
- Git

### 2. Clonar e Instalar
```bash
# Clonar repositorio
git clone https://github.com/tu-usuario/welding-simulator-pwa.git
cd welding-simulator-pwa

# Instalar dependencias
npm install

# Copiar configuración
cp .env.example .env
```

### 3. Desarrollo Local
```bash
# Iniciar servidor de desarrollo
npm run dev

# La app estará en http://localhost:3000
```

### 4. Build y Deploy
```bash
# Generar build de producción
npm run build

# Preview del build
npm run preview
```

## 📊 Configuración Google Sheets (Opcional)

### Paso 1: Crear Google Sheet

1. **Crear nuevo Google Sheet**:
   - Ir a [sheets.google.com](https://sheets.google.com)
   - Crear hoja nueva
   - Nombrar como "Welding Simulator Data"

2. **Configurar Hoja Principal "WeldingData"**:
   - Crear hoja con nombre "WeldingData"
   - En la fila 1, agregar estos encabezados:

| A | B | C | D | E | F | G | H | I | J | K | L | M | N | O | P |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| id | userId | userName | technique | startTime | endTime | duration | finalScore | grade | avgAngleAccuracy | avgDistanceStability | avgSpeedConsistency | avgSmoothness | totalDataPoints | createdAt | updatedAt |

3. **Crear Hoja "Certificates"**:
   - Crear nueva hoja con nombre "Certificates"
   - Agregar encabezados en fila 1:

| A | B | C | D | E | F | G | H | I | J |
|---|---|---|---|---|---|---|---|---|---|
| id | userName | technique | score | grade | duration | date | validationCode | sessionId | createdAt |

### Paso 2: Configurar Google Apps Script

1. **Crear Proyecto Apps Script**:
   - Ir a [script.google.com](https://script.google.com)
   - Crear proyecto nuevo
   - Nombrar como "Welding Simulator Backend"

2. **Configurar Código**:
   - Borrar código predeterminado
   - Copiar código de `google-apps-script/Code.js`
   - **IMPORTANTE**: Reemplazar `SPREADSHEET_ID` en línea 8:
   ```javascript
   const SPREADSHEET_ID = 'TU_SPREADSHEET_ID_AQUI';
   ```

3. **Obtener Spreadsheet ID**:
   - En tu Google Sheet, la URL será algo como:
   ```
   https://docs.google.com/spreadsheets/d/AQUI_ESTA_EL_ID/edit
   ```
   - Copiar esa parte del ID y reemplazar en el código

### Paso 3: Desplegar Web App

1. **Configurar Despliegue**:
   - Clic en "Deploy" → "New deployment"
   - Type: "Web app"
   - Description: "Welding Simulator API"
   - Execute as: "Me"
   - Who has access: "Anyone"

2. **Obtener URL**:
   - Copiar la Web App URL
   - Debería verse como: `https://script.google.com/macros/s/AK.../exec`

3. **Actualizar Configuración**:
   - En tu archivo `.env`, actualizar:
   ```env
   VITE_GOOGLE_SHEETS_API_URL=https://script.google.com/macros/s/TU_AK_KEY/exec
   VITE_GOOGLE_SHEETS_SPREADSHEET_ID=TU_SPREADSHEET_ID
   ```

### Paso 4: Probar Conexión

1. **Iniciar Aplicación**:
   ```bash
   npm run dev
   ```

2. **Verificar en la App**:
   - La aplicación detectará automáticamente si Google Sheets está configurado
   - Si está configurado, verás opciones adicionales en el menú
   - Si no, funcionará solo con almacenamiento local

## 🎯 Configuración del Dispositivo Móvil

### Permisos Necesarios
La aplicación requiere estos permisos:
- **Cámara**: Para tracking AR
- **Movimiento**: Para sensores del dispositivo
- **Orientación**: Para detectar ángulos
- **Notificaciones**: Para feedback (opcional)

### Navegadores Compatibles
- ✅ Chrome (Android/iOS)
- ✅ Safari (iOS 13+)
- ✅ Edge (Android)
- ❌ Firefox (soporte limitado de sensores)

### Dispositivos Recomendados
- **Smartphones**: Android 8+ / iOS 13+
- **Tablets**: iPad (iOS 13+) / Android tablets
- **Sensores**: Acelerómetro, giroscopio, magnetómetro

## 🔧 Configuración de Patrón AR

### Crear Patrón AR
1. **Descargar patrón**: `4x4_1000.png` (incluido en el proyecto)
2. **Imprimir**: En papel blanco, tamaño 50x50mm
3. **Colocar**: En superficie plana y bien iluminada

### Uso del Patrón
- Mantener siempre visible en la cámara
- Evitar reflejos o sombras
- Distancia recomendada: 20-50cm de la cámara
- Superficie: Lisa y no reflectante

## 📱 Instalación como PWA

### En Chrome (Android)
1. Abrir la app en Chrome
2. Tocar menú (⋮) → "Añadir a pantalla de inicio"
3. Confirmar instalación

### En Safari (iOS)
1. Abrir la app en Safari
2. Tocar compartir (📤) → "Añadir a pantalla de inicio"
3. Confirmar instalación

## 🚨 Solución de Problemas

### Error: "Permisos de cámara denegados"
- Ir a Configuración → Aplicaciones → Chrome → Permisos
- Activar permiso de Cámara
- Recargar la página

### Error: "Sensores no disponibles"
- Verificar navegador (usar Chrome/Safari)
- Probar en modo incógnito
- Reiniciar dispositivo

### Error: "No se detecta patrón AR"
- Verificar iluminación (luz natural o LED)
- Mantener patrón estable
- Ajustar distancia (20-50cm)

### Google Sheets no sincroniza
- Verificar URL del Web App
- Comprobar permisos del spreadsheet
- Revisar consola del navegador para errores

## 📞 Soporte

Si tienes problemas:
1. Revisar la consola del navegador (F12)
2. Verificar que todos los permisos estén concedidos
3. Probar en modo incógnito
4. Reiniciar el dispositivo si es necesario

## 🎓 Notas Importantes

- **Privacidad**: Los datos se almacenan localmente por defecto
- **Offline**: La app funciona sin conexión a internet
- **Sincronización**: Google Sheets es opcional para backup
- **Certificados**: Se generan localmente y se pueden validar online

¡Listo para empezar a soldar virtualmente! 🔥