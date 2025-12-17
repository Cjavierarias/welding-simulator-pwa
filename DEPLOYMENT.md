# 🚀 Guía de Deployment - GitHub Pages

## Configuración Automática para GitHub Pages

Este proyecto está **preconfigurado** para GitHub Pages con todas las optimizaciones necesarias:

### ✅ Configuraciones Aplicadas

1. **Vite Configuración**: `base` automático para desarrollo/producción
2. **PWA Paths**: Rutas relativas para subdirectorios
3. **SPA Routing**: Archivo `404.html` para manejo de rutas
4. **Jekyll Disabled**: Archivo `.nojekyll` para SPAs
5. **GitHub Pages Scripts**: `gh-pages` package agregado

### 📦 Archivos de Deployment Incluidos

- `404.html` - Maneja el routing de React Router
- `.nojekyll` - Deshabilita el procesamiento de Jekyll
- `CNAME` - Para dominio personalizado (opcional)
- Scripts de deployment en `package.json`

### 🔧 Pasos para Deploy en GitHub Pages

#### Opción 1: Deploy Automático (Recomendado)

```bash
# 1. Instalar dependencias
npm install

# 2. Deploy directo a GitHub Pages
npm run deploy
```

#### Opción 2: GitHub Actions (Alternativo)

Crear archivo `.github/workflows/deploy.yml`:

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'npm'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Build
      run: npm run build
    
    - name: Deploy to GitHub Pages
      uses: peaceiris/actions-gh-pages@v3
      with:
        github_token: ${{ secrets.GITHUB_TOKEN }}
        publish_dir: ./dist
```

### 🌐 Configuración del Repositorio

1. **Ir a Settings del repositorio**
2. **Scroll down a "Pages"**
3. **Source: Deploy from a branch**
4. **Branch: main / (root)**
5. **Folder: / (root)**

### ⚙️ Configuración del Subdirectorio

Si tu repositorio NO se llama `welding-simulator-pwa`, actualiza `vite.config.ts`:

```typescript
// Cambiar 'welding-simulator-pwa' por el nombre de tu repositorio
const githubPagesBase = process.env.NODE_ENV === 'production' ? '/tu-nombre-repo/' : '/'
```

### 🔍 Verificación Post-Deploy

1. **Esperar 5-10 minutos** para que GitHub Pages procese el deploy
2. **Visitar**: `https://tu-usuario.github.io/tu-repositorio`
3. **Verificar**: Que todas las rutas funcionan correctamente
4. **Test PWA**: Verificar que se puede instalar como aplicación

### 🐛 Solución de Problemas Comunes

#### Error 404 en rutas específicas
- ✅ **Solucionado**: Archivo `404.html` incluido
- Verificar que `.nojekyll` esté presente

#### Recursos no cargan (CSS/JS)
- Verificar que el `base` en `vite.config.ts` coincida con el nombre del repositorio
- Ejemplo: `/mi-repositorio/` (con slash al final)

#### PWA no se instala
- Verificar que el `scope` y `start_url` sean relativos (`./`)
- ✅ **Solucionado**: Ya configurado

#### Build falla
```bash
# Limpiar caché y reinstalar
rm -rf node_modules package-lock.json
npm install
npm run build
```

### 📱 Testing en Dispositivos Móviles

1. **Abrir en Chrome/Safari móvil**
2. **Verificar permisos** de cámara y sensores
3. **Probar instalación PWA**
4. **Test AR tracking** con patrón impreso

### 🔒 Configuración HTTPS

GitHub Pages proporciona HTTPS automáticamente para dominios personalizados y subdominios de github.io.

### 🎯 URLs Importantes

- **Development**: `http://localhost:3000`
- **Production**: `https://usuario.github.io/repositorio/`
- **Custom Domain**: `https://tu-dominio.com/`

---

## ✅ Checklist Pre-Deploy

- [ ] Repositorio creado en GitHub
- [ ] Código subido al repositorio
- [ ] Nombre del repositorio verificado en `vite.config.ts`
- [ ] `npm install` ejecutado
- [ ] `npm run deploy` ejecutado
- [ ] GitHub Pages habilitado en Settings
- [ ] URL de producción verificada
- [ ] Test en móvil completado

¡Tu Welding Simulator PWA estará listo para usar! 🔥