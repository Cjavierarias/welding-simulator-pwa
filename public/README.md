# Archivos Públicos para PWA

Este directorio debe contener los siguientes archivos para que la PWA funcione correctamente:

## Iconos PWA Requeridos

1. **pwa-192x192.png** - Icono de 192x192px para Android
2. **pwa-512x512.png** - Icono de 512x512px para Android  
3. **apple-touch-icon.png** - Icono para iOS (180x180px recomendado)
4. **favicon.ico** - Icono de favoritos para navegadores
5. **vite.svg** - Logo de Vite (referenciado en index.html)

## Patrón AR

6. **4x4_1000.png** - Patrón AR para tracking de soldadura

## Cómo obtener estos archivos

### Opción 1: Generar automáticamente
Los iconos se pueden generar usando herramientas online como:
- [PWA Asset Generator](https://www.pwabuilder.com/imageGenerator)
- [Favicon Generator](https://favicon.io/)

### Opción 2: Usar los archivos existentes
Si ya tienes estos archivos, colócalos en este directorio.

### Opción 3: временно (temporal)
Puedes usar archivos SVG simples temporalmente mientras generas los definitivos.

## Nota Importante

Sin estos archivos, la PWA funcionará pero:
- No se podrá instalar en dispositivos móviles
- Los iconos no aparecerán correctamente
- El tracking AR no funcionará sin el patrón

**Recomendación**: Genera todos los iconos antes del deployment final.