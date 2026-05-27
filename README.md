# OLINSA — Sistema de Evaluación de Desempeño
## Guía completa de instalación y uso

---

## ¿Qué es esta carpeta?

Contiene el código completo de la app web de evaluación de desempeño de OLINSA.
Debes subir estos archivos a GitHub, conectarlos a Vercel (hosting gratuito) y configurar
Supabase (base de datos gratuita). Todo en unos 60-90 minutos.

---

## PASO 1 — Configurar Supabase (base de datos)

### 1.1 Crear cuenta
1. Ve a https://supabase.com
2. Clic en "Start your project"
3. Regístrate con Google o email
4. Clic en "New project"
5. Completa:
   - Organization: OLINSA
   - Name: olinsa-evaluaciones
   - Database Password: crea una contraseña segura y GUÁRDALA
   - Region: South America (São Paulo)
6. Clic en "Create new project" — espera ~2 minutos

### 1.2 Crear las tablas
1. En el menú izquierdo, clic en "SQL Editor"
2. Clic en "New query"
3. Copia y pega el siguiente bloque completo:

```sql
create table colaboradores (
  id uuid default gen_random_uuid() primary key,
  nombre text not null,
  cargo text,
  area text,
  sede text,
  nivel text check (nivel in ('Operativo','Administrativo','Gerencial')),
  activo boolean default true,
  created_at timestamp default now()
);

create table ciclos (
  id uuid default gen_random_uuid() primary key,
  nombre text not null,
  periodo text,
  activo boolean default true,
  created_at timestamp default now()
);

create table evaluaciones (
  id uuid default gen_random_uuid() primary key,
  ciclo_id uuid references ciclos(id),
  evaluado_id uuid references colaboradores(id),
  evaluador_nombre text,
  tipo text check (tipo in ('autoevaluacion','jefe','par','kpi')),
  puntaje_final numeric(4,2),
  datos jsonb,
  completada boolean default false,
  created_at timestamp default now()
);

alter table colaboradores enable row level security;
alter table ciclos enable row level security;
alter table evaluaciones enable row level security;

create policy "public_read_colaboradores" on colaboradores for select using (true);
create policy "public_insert_evaluaciones" on evaluaciones for insert with check (true);
create policy "public_read_evaluaciones" on evaluaciones for select using (true);
create policy "public_read_ciclos" on ciclos for select using (true);
create policy "public_insert_ciclos" on ciclos for insert with check (true);
create policy "public_insert_colaboradores" on colaboradores for insert with check (true);
create policy "public_update_colaboradores" on colaboradores for update using (true);
```

4. Clic en "Run" — debe decir "Success. No rows returned"

### 1.3 Guardar credenciales
1. Clic en "Settings" (engranaje, menú izquierdo)
2. Clic en "API"
3. Copia y guarda en un documento:
   - Project URL (algo como https://abcdefgh.supabase.co)
   - anon public key (cadena muy larga que empieza con eyJ...)

---

## PASO 2 — Subir código a GitHub

### 2.1 Crear cuenta en GitHub
1. Ve a https://github.com
2. Clic en "Sign up"
3. Regístrate con tu email

### 2.2 Crear repositorio
1. Clic en el "+" arriba a la derecha → "New repository"
2. Repository name: olinsa-evaluaciones
3. Marcar "Public"
4. NO marques ninguna otra opción
5. Clic en "Create repository"

### 2.3 Subir los archivos
En la página del repositorio recién creado:

1. Clic en "uploading an existing file" (o "creating a new file")
2. Arrastra TODA la carpeta de este proyecto
   (o usa el botón "choose your files" para seleccionarlos todos)
3. En el campo de commit message escribe: "Subida inicial app OLINSA"
4. Clic en "Commit changes"

**Estructura que debe quedar en GitHub:**
```
olinsa-evaluaciones/
├── package.json
├── next.config.js
├── pages/
│   ├── _app.js
│   ├── index.js
│   ├── evaluar.js
│   └── admin.js
├── components/
│   ├── Header.js
│   ├── RatingRow.js
│   └── ScoreBar.js
├── lib/
│   └── supabase.js
└── styles/
    └── globals.css
```

---

## PASO 3 — Publicar en Vercel (hosting)

### 3.1 Crear cuenta en Vercel
1. Ve a https://vercel.com
2. Clic en "Sign Up"
3. Selecciona "Continue with GitHub"
4. Autoriza el acceso

### 3.2 Desplegar la app
1. En el dashboard, clic en "Add New Project"
2. Selecciona el repositorio "olinsa-evaluaciones"
3. Clic en "Import"
4. En la sección "Environment Variables" agrega DOS variables:

   Variable 1:
   - Name: NEXT_PUBLIC_SUPABASE_URL
   - Value: (pega la Project URL de Supabase)

   Variable 2:
   - Name: NEXT_PUBLIC_SUPABASE_ANON_KEY
   - Value: (pega la anon public key de Supabase)

5. Clic en "Deploy"
6. Espera ~3 minutos

Cuando termine verás un link tipo: https://olinsa-evaluaciones.vercel.app
¡Ese es el link de tu app! Compártelo con todo el equipo.

---

## PASO 4 — Configurar la app (primera vez)

### 4.1 Crear el primer ciclo de evaluación
1. Ve a tu-app.vercel.app/admin
2. Clic en la pestaña "🗓 Ciclos"
3. Completa:
   - Nombre: Evaluación Anual 2025
   - Período: Enero – Diciembre 2025
4. Clic en "+ Crear ciclo"

### 4.2 Agregar colaboradores
1. Clic en la pestaña "👥 Colaboradores"
2. Para cada persona del equipo:
   - Nombre completo
   - Cargo
   - Área
   - Sede (Medellín / Barranquilla / etc.)
   - Nivel (Operativo / Administrativo / Gerencial)
3. Clic en "+ Agregar colaborador"

---

## USO DIARIO — Cómo funciona

### Para evaluadores (todo el equipo)
Link: https://tu-app.vercel.app

1. Ingresan al link
2. Escriben su nombre
3. Seleccionan a quién evalúan
4. Seleccionan el tipo de evaluación:
   - Autoevaluación (se evalúan a sí mismos)
   - Evaluación de Jefe (evalúan a alguien a su cargo)
   - Evaluación de Par (evalúan a un compañero)
   - KPIs (registran metas o resultados)
5. Completan el formulario
6. Clic en "Enviar" → queda guardado automáticamente

### Para Talento Humano
Link: https://tu-app.vercel.app/admin

Pestañas disponibles:
- **📊 Resultados**: tabla consolidada con todos los colaboradores,
  sus puntajes por instrumento y el puntaje final ponderado
- **👥 Colaboradores**: agregar, editar, activar/desactivar personas
- **🗓 Ciclos**: crear y cerrar ciclos de evaluación
- **🔍 Detalle**: ver cada evaluación individualmente

---

## PREGUNTAS FRECUENTES

**¿Cuánto cuesta?**
Absolutamente nada. Supabase (base de datos) y Vercel (hosting) son gratuitos
para este volumen de uso (hasta 500MB de datos y 100GB de ancho de banda/mes).

**¿Se puede acceder desde el celular?**
Sí, la app es completamente responsive y funciona en cualquier dispositivo.

**¿Los pares ven los resultados de los demás?**
No. Solo Talento Humano (accediendo a /admin) puede ver resultados consolidados.

**¿Puedo tener varios ciclos al mismo tiempo?**
Sí. Puedes crear ciclos para primer semestre, segundo semestre, etc.
En el panel admin seleccionas cuál ciclo quieres ver.

**¿Qué pasa si alguien envía una evaluación por error?**
Por ahora, ve a Supabase → Table Editor → evaluaciones, busca el registro
y elimínalo manualmente. En una próxima versión se puede agregar un botón de eliminación.

**¿Cómo comparto el link?**
Copia el link de Vercel y envíalo por WhatsApp, email o Teams a todo el equipo.
No se necesita contraseña para hacer evaluaciones (el link es la "clave").

**¿Cómo actualizo la app si necesito cambios?**
Ve a GitHub, edita el archivo que necesitas, haz commit,
y Vercel re-desplegará automáticamente en ~2 minutos.

---

## SOPORTE

Si algo no funciona, los errores más comunes son:
1. Variables de entorno mal copiadas en Vercel → revisa que no tengan espacios
2. SQL no ejecutado correctamente → ve a Supabase > Table Editor y verifica que
   existan las tablas "colaboradores", "ciclos" y "evaluaciones"
3. Repositorio mal estructurado → verifica que package.json esté en la raíz,
   no dentro de una subcarpeta

---

*OLINSA S.A.S. · Área de Talento Humano · Versión 1.0 · 2025*
