# FinOpenPOS - Sistema de Punto de Venta

Sistema de punto de venta desarrollado con Next.js, TypeScript, y Supabase.

## 🚀 Despliegue en Netlify

### Prerrequisitos
- Cuenta en [Netlify](https://netlify.com)
- Cuenta en [Supabase](https://supabase.com)
- Repositorio en GitHub/GitLab

### Pasos para desplegar:

1. **Conectar repositorio a Netlify:**
   - Ve a [netlify.com](https://netlify.com) y crea una cuenta
   - Haz clic en "New site from Git"
   - Conecta tu repositorio de GitHub/GitLab
   - Selecciona este repositorio

2. **Configurar variables de entorno:**
   En Netlify, ve a `Site settings > Environment variables` y agrega:
   ```
   NEXT_PUBLIC_SUPABASE_URL=tu_url_de_supabase
   NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_clave_anonima_de_supabase
   ```

3. **Configuración de build:**
   Netlify detectará automáticamente la configuración desde `netlify.toml`:
   - Build command: `npm run build`
   - Publish directory: `out`
   - Node version: `18`

4. **Deploy:**
   - Haz clic en "Deploy site"
   - Netlify compilará y desplegará automáticamente

### 🔧 Desarrollo Local

```bash
# Instalar dependencias
npm install

# Copiar variables de entorno
cp .env.example .env.local
# Editar .env.local con tus credenciales de Supabase

# Ejecutar en desarrollo
npm run dev
```

### 📦 Build Local

```bash
# Compilar para producción
npm run build
```

## 🏗️ Estructura del Proyecto

- `src/app/` - Páginas de la aplicación (App Router)
- `src/components/` - Componentes reutilizables
- `src/lib/` - Utilidades y configuraciones
- `public/` - Archivos estáticos

## 📱 Funcionalidades

- ✅ Panel de administración
- ✅ Gestión de productos
- ✅ Punto de venta (POS)
- ✅ Gestión de clientes
- ✅ Ventas al crédito
- ✅ Caja registradora
- ✅ Configuración del sistema
- ✅ Soporte técnico

## 🛠️ Tecnologías

- **Frontend:** Next.js 14, React 18, TypeScript
- **Styling:** TailwindCSS, Shadcn/ui
- **Backend:** Supabase (Database + Auth)
- **Despliegue:** Netlify (Estático)

## 🔐 Autenticación

El proyecto usa Supabase para autenticación. Asegúrate de configurar:
- Políticas de seguridad en Supabase
- URLs permitidas en la configuración de autenticación

## 📝 Notas de Despliegue

- El proyecto está configurado para exportación estática
- Las imágenes están configuradas como no optimizadas para compatibilidad
- Las rutas incluyen trailing slash para mejor compatibilidad con hosting estático
