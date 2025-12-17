# Welding Simulator PWA

Una aplicación web progresiva (PWA) para simulación de técnicas de soldadura (MIG, TIG, Electrodo) con realidad aumentada y retroalimentación multisensorial.

## 🚀 Características Principales

- **Simulación AR**: Seguimiento de patrones AR para medición precisa de movimientos
- **Sensores Móviles**: Utiliza acelerómetro, giroscopio y magnetómetro del dispositivo
- **Evaluación en Tiempo Real**: Métricas instantáneas de calidad de soldadura
- **PWA**: Instalable como app nativa con funcionalidad offline
- **Retroalimentación Multisensorial**: Audio y vibración para guía en tiempo real
- **Generación de Certificados**: Certificados PDF con códigos QR de validación
- **Base de Datos Local**: Almacenamiento con IndexedDB para privacidad
- **Integración Google Sheets**: Backend opcional para análisis y sincronización

## 🛠️ Tecnologías Utilizadas

- **Frontend**: React 18 + TypeScript + Vite
- **UI**: Material-UI (MUI) con componentes personalizados
- **Sensores**: DeviceMotion API, DeviceOrientation API
- **Cámara**: MediaDevices API para tracking AR
- **Gráficos**: Chart.js para visualización de datos
- **Audio**: Web Audio API para feedback auditivo
- **Almacenamiento**: IndexedDB para datos locales
- **PWA**: Service Workers para funcionalidad offline
- **PDF**: jsPDF para generación de certificados
- **QR Codes**: QRCode.js para validación de certificados

## 📱 Compatibilidad

- **Navegadores**: Chrome (Android/iOS), Safari (iOS 13+)
- **Dispositivos**: Smartphones y tablets con sensores
- **Resolución**: Optimizado para móvil (mobile-first)
- **Permisos**: Requiere acceso a cámara y sensores de movimiento

## 🚀 Instalación y Configuración

### 1. Clonar el Repositorio

```bash
git clone https://github.com/tu-usuario/welding-simulator-pwa.git
cd welding-simulator-pwa
```

### 2. Instalar Dependencias

```bash
npm install
```

### 3. Configurar Variables de Entorno

Crea un archivo `.env` en la raíz del proyecto:

```env
# Google Sheets Integration (Opcional)
VITE_GOOGLE_SHEETS_API_URL=https://your-apps-script-webapp-url
VITE_GOOGLE_SHEETS_SPREADSHEET_ID=your-spreadsheet-id

# App Configuration
VITE_APP_NAME=Welding Simulator PWA
VITE_APP_VERSION=1.0.0
```

### 4. Desarrollo Local

```bash
# Iniciar servidor de desarrollo
npm run dev

# La aplicación estará disponible en http://localhost:3000
```

### 5. Build para Producción

```bash
# Generar build de producción
npm run build

# Preview del build
npm run preview
```

## 🔧 Configuración del Backend (Google Sheets - Opcional)

### 1. Crear Google Sheet

1. Crear un nuevo Google Sheet
2. Nombrar la hoja principal como "WeldingData"
3. Configurar las siguientes columnas en la fila 1:

| A | B | C | D | E | F | G | H | I | J | K | L | M | N | O | P |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| id | userId | userName | technique | startTime | endTime | duration | finalScore | grade | avgAngleAccuracy | avgDistanceStability | avgSpeedConsistency | avgSmoothness | totalDataPoints | createdAt | updatedAt |

4. Crear una segunda hoja llamada "Certificates"

### 2. Configurar Google Apps Script

1. Ir a [Google Apps Script](https://script.google.com)
2. Crear un nuevo proyecto
3. Reemplazar el código con `google-apps-script/Code.js`
4. Configurar el `SPREADSHEET_ID` en el código
5. Desplegar como Web App:
   - **Ejecutar como**: Yo
   - **Quién tiene acceso**: Cualquier persona
6. Copiar la URL del Web App y actualizar `.env`

### 3. Probar la Conexión

La aplicación detectará automáticamente si Google Sheets está configurado y mostrará opciones adicionales.

## 📊 Estructura de Datos

### Sesión de Soldadura
```typescript
interface WeldingSession {
  id: string
  technique: 'MIG' | 'TIG' | 'ELECTRODO'
  startTime: number
  endTime?: number
  duration: number
  parameters: WeldingParameters
  sensorData: SensorData[]
  markerData: ARMarkerData[]
  metrics: RealTimeMetrics[]
  finalScore: number
  grade: 'A' | 'B' | 'C' | 'D' | 'F'
  userName?: string
}
```

### Certificado
```typescript
interface CertificateData {
  id: string
  userName: string
  technique: string
  score: number
  grade: string
  duration: number
  date: number
  validationCode: string
}
```

## 🎯 Parámetros de Soldadura

### MIG/MAG
- **Ángulo**: 70-80°
- **Distancia**: 10-15mm
- **Velocidad**: 5-15mm/s
- **Peso**: Ángulo 40%, Distancia 30%, Velocidad 20%, Suavidad 10%

### TIG
- **Ángulo**: 60-75°
- **Distancia**: 2-5mm
- **Velocidad**: 3-8mm/s
- **Peso**: Igual que MIG

### Electrodo
- **Ángulo**: 60-80°
- **Distancia**: 5-12mm
- **Velocidad**: 8-20mm/s
- **Peso**: Igual que MIG

## 📱 Uso de la Aplicación

### Calibración Inicial
1. Abrir la aplicación en el dispositivo móvil
2. Seguir el asistente de calibración paso a paso:
   - Conceder permisos de cámara y sensores
   - Colocar patrón AR en el campo de visión
   - Verificar funcionamiento de todos los componentes

### Simulación
1. Seleccionar técnica de soldadura
2. Colocar patrón AR en la superficie de trabajo
3. Apuntar la cámara al patrón
4. Iniciar sesión de soldadura
5. Seguir las métricas en tiempo real
6. Detener sesión para ver resultados

### Certificados
1. Completar una sesión con puntuación ≥ 60%
2. Generar certificado con datos del estudiante
3. Descargar PDF o compartir en redes sociales
4. Validar certificado escaneando código QR

## 🔒 Privacidad y Datos

- **Datos Locales**: Toda la información se almacena localmente por defecto
- **Google Sheets**: Opcional para sincronización y análisis
- **GDPR**: Funciones de exportación y eliminación de datos
- **Permisos**: Solo se solicitan permisos necesarios para la funcionalidad

## 🏗️ Arquitectura del Proyecto

```
src/
├── components/          # Componentes React
│   ├── SensorCalibration/
│   ├── WeldingSimulator/
│   ├── ResultsDashboard/
│   └── CertificateGenerator/
├── hooks/              # Custom hooks
│   ├── usePWA.ts
│   ├── useSensors.ts
│   ├── useCameraAR.ts
│   └── useWeldingSimulation.ts
├── services/           # Servicios y APIs
│   ├── database.ts     # IndexedDB service
│   └── googleSheets.ts # Google Sheets integration
├── utils/              # Utilidades
│   ├── patternRecognition.ts
│   ├── weldingCalculations.ts
│   └── certificateUtils.ts
├── types/              # Definiciones TypeScript
└── styles/             # Estilos globales
```

## 🧪 Testing

```bash
# Ejecutar tests
npm run test

# Verificar tipos TypeScript
npm run type-check

# Linting
npm run lint
```

## 📦 Deployment

### Netlify
```bash
# Conectar repositorio a Netlify
# Configurar build command: npm run build
# Configurar publish directory: dist
```

### Vercel
```bash
# Instalar Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

### GitHub Pages
```bash
# Instalar gh-pages
npm install --save-dev gh-pages

# Deploy
npm run build
npm run deploy
```

## 🤝 Contribución

1. Fork el proyecto
2. Crear rama para feature (`git checkout -b feature/AmazingFeature`)
3. Commit cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abrir Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver `LICENSE` para más detalles.

## 👨‍💻 Autor

**MiniMax Agent**

## 🙏 Agradecimientos

- Material-UI por los componentes
- Chart.js por las visualizaciones
- Google por Apps Script y Sheets
- La comunidad de desarrolladores PWA

## 📞 Soporte

Para reportar bugs o solicitar features:

1. Revisar [Issues](https://github.com/tu-usuario/welding-simulator-pwa/issues)
2. Crear nuevo issue con descripción detallada
3. Incluir pasos para reproducir el problema
4. Especificar dispositivo y versión del navegador

---

**Nota**: Esta aplicación requiere un dispositivo con sensores para funcionar correctamente. La experiencia completa está optimizada para smartphones modernos con Chrome o Safari.