# Estructura de Google Sheets para Welding Simulator PWA

## 📊 Hoja 1: "WeldingData"

### Propósito
Almacenar datos de sesiones de soldadura para análisis y sincronización.

### Estructura de Columnas

| Columna | Campo | Tipo de Dato | Descripción | Ejemplo |
|---------|-------|--------------|-------------|---------|
| A | id | Texto | ID único de la sesión | `session_1640995200000` |
| B | userId | Texto | ID del usuario | `user_123` |
| C | userName | Texto | Nombre del usuario | `Juan Pérez` |
| D | technique | Texto | Técnica de soldadura | `MIG`, `TIG`, `ELECTRODO` |
| E | startTime | Fecha/Hora | Inicio de sesión | `2024-12-31 10:30:00` |
| F | endTime | Fecha/Hora | Fin de sesión | `2024-12-31 11:00:00` |
| G | duration | Número | Duración en ms | `1800000` |
| H | finalScore | Número | Puntuación final (0-100) | `85.5` |
| I | grade | Texto | Calificación | `A`, `B`, `C`, `D`, `F` |
| J | avgAngleAccuracy | Número | Precisión promedio del ángulo | `82.3` |
| K | avgDistanceStability | Número | Estabilidad promedio de distancia | `78.9` |
| L | avgSpeedConsistency | Número | Consistencia promedio de velocidad | `90.1` |
| M | avgSmoothness | Número | Suavidad promedio del movimiento | `85.7` |
| N | totalDataPoints | Número | Puntos de datos recolectados | `1500` |
| O | createdAt | Fecha/Hora | Fecha de creación del registro | `2024-12-31 10:30:00` |
| P | updatedAt | Fecha/Hora | Última actualización | `2024-12-31 10:30:00` |

### Ejemplo de Datos

```
id,userId,userName,technique,startTime,endTime,duration,finalScore,grade,avgAngleAccuracy,avgDistanceStability,avgSpeedConsistency,avgSmoothness,totalDataPoints,createdAt,updatedAt
session_1640995200000,user_123,Juan Pérez,MIG,2024-12-31 10:30:00,2024-12-31 11:00:00,1800000,85.5,B,82.3,78.9,90.1,85.7,1500,2024-12-31 10:30:00,2024-12-31 10:30:00
session_1640995260000,user_124,María García,TIG,2024-12-31 11:15:00,2024-12-31 11:45:00,1800000,92.3,A,95.1,88.2,94.7,92.1,1650,2024-12-31 11:15:00,2024-12-31 11:15:00
session_1640995320000,user_123,Juan Pérez,ELECTRODO,2024-12-31 12:00:00,2024-12-31 12:30:00,1800000,78.2,C,75.4,82.1,76.8,80.3,1420,2024-12-31 12:00:00,2024-12-31 12:00:00
```

## 🏆 Hoja 2: "Certificates"

### Propósito
Almacenar certificados generados para validación y verificación.

### Estructura de Columnas

| Columna | Campo | Tipo de Dato | Descripción | Ejemplo |
|---------|-------|--------------|-------------|---------|
| A | id | Texto | ID único del certificado | `cert_1640995200000` |
| B | userName | Texto | Nombre del estudiante | `Juan Pérez` |
| C | technique | Texto | Técnica certificada | `MIG`, `TIG`, `ELECTRODO` |
| D | score | Número | Puntuación obtenida | `85.5` |
| E | grade | Texto | Calificación obtenida | `A`, `B`, `C`, `D`, `F` |
| F | duration | Número | Duración de práctica en ms | `1800000` |
| G | date | Fecha/Hora | Fecha de certificación | `2024-12-31 10:30:00` |
| H | validationCode | Texto | Código de validación único | `WELD-ABCD1234-20241231-EFGH` |
| I | sessionId | Texto | ID de sesión asociada | `session_1640995200000` |
| J | createdAt | Fecha/Hora | Fecha de creación | `2024-12-31 10:30:00` |

### Ejemplo de Datos

```
id,userName,technique,score,grade,duration,date,validationCode,sessionId,createdAt
cert_1640995200000,Juan Pérez,MIG,85.5,B,1800000,2024-12-31 10:30:00,WELD-JUAN-M85-20241231-AB12,session_1640995200000,2024-12-31 10:30:00
cert_1640995260000,María García,TIG,92.3,A,1800000,2024-12-31 11:15:00,WELD-MARIA-T92-20241231-CD34,session_1640995260000,2024-12-31 11:15:00
cert_1640995320000,Juan Pérez,ELECTRODO,78.2,C,1800000,2024-12-31 12:00:00,WELD-JUAN-E78-20241231-EF56,session_1640995320000,2024-12-31 12:00:00
```

## 👤 Hoja 3: "UserProfiles" (Opcional)

### Propósito
Almacenar perfiles de usuario para personalización y estadísticas.

### Estructura de Columnas

| Columna | Campo | Tipo de Dato | Descripción | Ejemplo |
|---------|-------|--------------|-------------|---------|
| A | id | Texto | ID único del usuario | `user_123` |
| B | name | Texto | Nombre completo | `Juan Pérez` |
| C | email | Texto | Email del usuario (opcional) | `juan@email.com` |
| D | preferredTechnique | Texto | Técnica preferida | `MIG` |
| E | totalSessions | Número | Total de sesiones realizadas | `15` |
| F | bestScores | JSON | Mejores puntuaciones por técnica | `{"MIG":85.5,"TIG":92.3}` |
| G | createdAt | Fecha/Hora | Fecha de creación del perfil | `2024-12-01 10:00:00` |
| H | updatedAt | Fecha/Hora | Última actualización | `2024-12-31 15:30:00` |

### Ejemplo de Datos

```
id,name,email,preferredTechnique,totalSessions,bestScores,createdAt,updatedAt
user_123,Juan Pérez,juan@email.com,MIG,15,"{""MIG"":85.5,""TIG"":78.2,""ELECTRODO"":82.1}",2024-12-01 10:00:00,2024-12-31 15:30:00
user_124,María García,maria@email.com,TIG,8,"{""TIG"":92.3,""MIG"":76.8}",2024-12-15 14:20:00,2024-12-31 11:15:00
```

## 📈 Hoja 4: "Leaderboard" (Generada automáticamente)

### Propósito
Tabla de clasificación actualizada automáticamente desde los datos de sesiones.

### Estructura de Columnas

| Columna | Campo | Tipo de Dato | Descripción |
|---------|-------|--------------|-------------|
| A | rank | Número | Posición en el ranking |
| B | userName | Texto | Nombre del usuario |
| C | technique | Texto | Técnica de soldadura |
| D | score | Número | Puntuación |
| E | date | Fecha/Hora | Fecha de la sesión |
| F | validationCode | Texto | Código de validación |

## 🔍 Índices y Filtros Recomendados

### En Hoja "WeldingData":
- **Filtro por Technique**: Columna D
- **Filtro por UserId**: Columna B
- **Filtro por DateRange**: Columna E (startTime)
- **Ordenar por**: FinalScore (descendente)

### En Hoja "Certificates":
- **Filtro por ValidationCode**: Columna H
- **Filtro por UserName**: Columna B
- **Filtro por Technique**: Columna C
- **Filtro por Grade**: Columna E

## 🔒 Permisos y Seguridad

### Permisos de Visualización:
- **Cualquier persona con el enlace**: Solo lectura
- **Propietario**: Lectura y escritura

### Configuración Recomendada:
- Compartir el spreadsheet con "Cualquier persona con el enlace - Lector"
- No incluir información personal sensible en las hojas
- Los emails son opcionales y se pueden omitir

## 📱 Integración con la App

### Funcionalidades habilitadas con Google Sheets:
1. **Sincronización de sesiones**: Automática al completar práctica
2. **Generación de certificados**: Se almacenan para validación
3. **Estadísticas globales**: Análisis de progreso
4. **Leaderboard**: Rankings públicos
5. **Validación de certificados**: Verificación online
6. **Backup de datos**: Protección contra pérdida de datos locales

### Datos que permanecen locales:
- Configuraciones de calibración
- Preferencias de usuario
- Sesiones no sincronizadas (cuando no hay conexión)
- Cache de la aplicación

## 🚀 Configuración Inicial

1. **Crear Google Sheet** con las hojas especificadas
2. **Configurar encabezados** exactamente como se indica
3. **Aplicar formatos**:
   - Fechas: Formato de fecha y hora
   - Números: Sin decimales para enteros, 1 decimal para puntuaciones
   - Texto: Sin formato especial
4. **Configurar filtros** en cada hoja
5. **Compartir con permisos de lectura pública**
6. **Obtener Spreadsheet ID** de la URL

La aplicación detectará automáticamente la estructura y funcionará correctamente con esta configuración.