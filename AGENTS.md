# AGENTS.md — Beatmemo

Documento de referencia para agentes de IA (Claude Code, Cursor, etc.) y para el equipo de desarrollo. Define **cómo está armado el proyecto, las reglas técnicas que no se negocian, y cómo debe comportarse un asistente que trabaje sobre este código.**

> Beatmemo es un pub-museo temático de los Beatles en Rosario, Argentina. La plataforma cubre: sitio público (`beatmemo.com.ar`), panel admin "El Motor" / vault (`vault.beatmemo.com.ar`), carta digital por QR (`qr.beatmemo.com.ar`) y un proyecto de audioguía aparte.

---

## 1. Cómo debe comportarse un asistente en este repo

Estas reglas son de comportamiento, no de código. Aplican a cualquier IA que trabaje acá.

- **Crítica directa por sobre validación.** No darle la razón al desarrollador por defecto. Si una idea es buena, mejorarla y explicar por qué. Si es mala, ofrecer 2 alternativas mejores y explicar el porqué de cada una. El objetivo es la mejor decisión, no la aprobación.
- **No afirmar sobre el toolchain sin verificar.** Antes de afirmar cómo se comporta una librería, Next.js, Supabase o un build, mostrar el código o la fuente. Las afirmaciones "de memoria" sobre el stack han sido erróneas en el pasado; cuando no hay evidencia a mano, decirlo explícitamente.
- **Nunca pasar parches parciales de un archivo.** Entregar la función completa (con su declaración envolvente) o el archivo completo. Un fragmento sin su envoltorio, pegado por el usuario, rompe el build (ha pasado). Si es un archivo largo, entregarlo entero es más seguro que seis parches.
- **Trabajo en fases atómicas.** Prohibido entregar bloques monolíticos que unifiquen DB + backend + frontend de golpe. Fragmentar en fases que compilen y se prueben por separado (Fase 1: SQL/tipos → Fase 2: actions → Fase 3: UI). Reduce bugs en cascada.
- **Evaluación de trade-offs obligatoria.** Ante cada solución, exponer riesgos ocultos (penalización SEO, LCP/CLS, seguridad) para que la decisión de negocio sea informada.
- **Nada de datos inventados en el producto.** No mock data que simule shows/promos/menús inexistentes: un cliente puede viajar al local por algo falso. Usar ISR con `revalidate` o estados vacíos honestos con CTA de WhatsApp. Esto aplica también a estadísticas: un dato de terceros se atribuye al sector, no al local.
- **Revisar código del equipo antes de mergear.** Beatmemo integra código de un equipo paralelo. El asistente debe señalar divergencias de los patrones establecidos (abajo) antes de que se mergee.
- **Auditar de verdad, no con corazonadas.** Un `grep` de una sola palabra que puede matchear comentarios NO es una verificación (ver §7).

---

## 2. Stack tecnológico y cómo lo aplicamos

| Tecnología | Versión | Uso en Beatmemo |
|---|---|---|
| **Next.js** | 16.x (App Router, Turbopack) | RSC por defecto; Server Actions atómicas para toda mutación |
| **React** | 19.x | Componentes de servidor salvo interactividad real (`"use client"`) |
| **Supabase** | PostgreSQL + Auth + Storage + RLS | Base de datos, autenticación OAuth, almacenamiento de PDFs, seguridad a nivel de fila |
| **Tailwind CSS** | 4.x (`@theme` en globals.css) | Design tokens como CSS vars; sin `tailwind.config.js` clásico |
| **Cloudinary** | v2 | Imágenes de items/shows/banners, optimización on-the-fly (`getOptimizedImageUrl`) |
| **Framer Motion** | — | Animaciones premium (fade-up, acordeones, crossfade del hero) |
| **Zod** | — | Validación de todo input en el borde servidor (y resolver del form en cliente) |
| **react-hook-form** | — | Formularios del admin, con `zodResolver` compartiendo schema con el server |
| **Sonner** | — | Toasts de feedback |
| **pdfjs-dist** | — | Render de PDFs de la carta (`PdfViewer`) |
| **Vercel** | — | Deploy del sitio principal |

### Principios de arquitectura

- **RSC-first.** Toda consulta a la DB se resuelve en el servidor. Prohibido armar arquitecturas pesadas en cliente por defecto.
- **Estado en la URL, no en `useState` alto.** Filtros y paginación (menú del pub, meses de cartelera) usan URL Search Params, no estado local en componentes de alta jerarquía. Motivo: SEO local (indexable) + estado compartible.
- **Filtrado en la capa de datos.** Los filtros se inyectan como cláusulas en la query de Postgres, no se traen arrays masivos para filtrar en el navegador. Ahorra ancho de banda y memoria en móviles de gama baja.
- **ISR sobre `useEffect`.** Preferir `revalidate` a fetching client-side. Ver §6 sobre el cliente público.
- **Mobile-first riguroso.** Diseñar la experiencia vertical antes que la grilla desktop.

---

## 3. Branding y sistema de diseño

Fuente de verdad: `src/app/globals.css` (bloque `@theme`). **Nunca hardcodear un hex; usar la CSS var / clase Tailwind.**

### Paleta

**Negros (`brand-black`)**
- `--color-brand-black-100: #0C0C0C` — fondo por defecto del body
- `--color-brand-black-200: #1F1F1F`
- `--color-brand-black-300: #3A3A3A`

**Blancos (`brand-white`)**
- `--color-brand-white-100: #FAFAFA` — texto por defecto
- `--color-brand-white-200: #E6E6E6`
- `--color-brand-white-300: #AAAAAA`

**Dorados / Acentos**
- `--color-brand-gold: #A6936A` — dorado de marca (botones "Ver Carta", navbar)
- `--color-accent-gold-dark: #A6936A`
- `--color-accent-gold-vibrant: #EAB64E` — hover, acentos vivos
- `--color-accent-gold-light: #FFE894`
- `--color-accent-gold-accent: #F9DB15`

**Rojos (`brand-red`) — color de conversión para shows/espectáculos**
- `--color-brand-red-100: #C41E34`
- `--color-brand-red-200: #D04255`
- `--color-brand-red-300: #FF5C5C`

> **Regla de negro:** preferir `#0C0C0C` / `brand-black-100` sobre `#000000` puro. El negro puro causa halación y smearing en OLED — es un anti-patrón de accesibilidad.

> **Nota sobre fondos de sección:** las páginas gastronómicas usan cremas suaves (`#FAF7F2`, `#F5F4F0`) en vez de negro, por decisión editorial. La sección de shows usa fondos oscuros con acento rojo.

### Tipografías

- **Sans (`--font-sans` → `--font-barlow`):** Barlow. UI, botones, kickers, cuerpo.
- **Serif (`--font-serif` → `--font-libre-baskerville`):** Libre Baskerville. Títulos editoriales, `h1`/`h2`, acentos con carácter.
- Enlazadas vía `next/font` (variables CSS inyectadas en el layout).

### Lenguaje visual

- **Editorial asimétrico (Z-pattern):** alternar disposición texto/multimedia para reactivar la atención en el scroll.
- **Contraste alto** evitando zonas grises que cansen la vista. Verificar contraste AA en texto tenue sobre cremas (el gris muy claro sobre `#F5F4F0` puede quedar bajo el mínimo).
- **Micro-interacciones sutiles:** puntos `animate-pulse` para estados activos, bordes condicionales, glassmorphism en overlays. El diseño debe hablar sin texto redundante.
- **Logos** en `/public/brand/` (`logo_BLANCO.svg`, `logo_ROOFTOP.svg`), aplicados con `mask-image` para teñirlos con color de marca.

---

## 4. Autenticación, roles y lógica de seguridad

### Modelo de roles

- Tabla **`user_roles`** con enum **`user_role`**: valores `SUPERADMIN`, `CM`, `VISITOR`.
- Constantes en `lib/auth-roles.ts`: **`ADMIN_ROLES`** (valores `SUPERADMIN`, `CM`). **Usar SIEMPRE `ADMIN_ROLES`**, nunca strings sueltos.
- **ALERTA — doble enum:** existe un segundo enum `app_role` (`SUPER_ADMIN`, `CONTENT_ADMIN`) que es LEGACY y NO debe usarse. `CONTENT_ADMIN` no existe en `user_role` — cualquier código que lo referencie es un bug. La app opera exclusivamente con `user_role`.
- Nuevos signups OAuth reciben rol vía trigger `handle_new_auth_user`; claims sincronizados al JWT por `sync_role_to_jwt_claims` / `custom_access_token_hook`.

### Autorización Database-First

- **La verdad del rol vive en `user_roles`, no en el JWT.** Toda request protegida consulta la tabla; no confiar solo en metadata del token.

### El guardián: `guardAction` (`lib/guard.ts`)

Toda Server Action de mutación arranca llamando a `guardAction`. Hace, **en este orden**:

1. **Sesión** — `supabase.auth.getUser()`.
2. **Rate limit** — antes de la query de rol, a propósito: protege `user_roles` de martilleo y acota escrituras al trail de auditoría vía intentos no autorizados.
3. **Rol** — Database-First contra `user_roles`.
4. **Log de intento no autorizado** — si el rol no alcanza, escribe `UNAUTHORIZED_<INTENT>_ATTEMPT` en el trail.

Devuelve el cliente Supabase ya instanciado (no crear otro) y el rol verificado.

### Rate limiting (sobre Postgres, no Upstash)

- Implementado como RPC **`check_rate_limit(p_key, p_limit, p_window_secs)`** — ventana fija por clave, contador atómico vía `INSERT ... ON CONFLICT`.
- Clave = `"<preset>:<user_id>"`. Presets: `mutation` (30/min), `upload` (8/min — uploads de hasta 10MB no pueden tener el techo de las mutaciones).
- **Fail-open y fail-fast:** si el RPC falla, deja pasar sin agregar latencia. Motivo: es un pub, no un banco; si la DB se cae el panel ya está caído igual.
- Tabla `rate_limits` con RLS activa y **cero políticas** → inaccesible por la API REST; solo la función `security definer` la toca. Auto-limpieza probabilística (~1% de las llamadas borra ventanas vencidas).

### Hardening de inputs y archivos

- **Validación por magic bytes, nunca `file.type`.** Imágenes (JPEG/PNG/WEBP) y PDFs (`%PDF`) se validan inspeccionando los primeros bytes del buffer. El `Content-Type` del navegador no es evidencia.
- **Allowlist de carpetas en runtime** para uploads a Cloudinary (el tipado de TS no existe en runtime → tampering posible). Rechazar destino inválido, no caer a un default silencioso.
- **Anti parameter-tampering:** todo `?param` que seleccione contenido (`?tipo=`) cae a un default seguro si no matchea, nunca rompe la página.
- **Slugs sanitizados** (`[^a-z0-9-]` removido) antes de usarlos como path de Storage → previene path traversal.
- **Soft deletes:** las lecturas usan `.eq("is_deleted", false)` (NO `.neq("is_deleted", true)`). El borrado marca la fila, no la destruye.
- **Auditoría:** `logAdminAction(action, tableName, adminId, metadata, recordId)`. Toda mutación de contenido público deja rastro de quién/qué.

### Subdominios y middleware

- `middleware.ts` enruta por hostname (`vault.` → admin, `qr.` → `/menu`) de forma agnóstica al dominio raíz (compara `startsWith`, no el dominio completo).
- Rutas admin viven bajo el route group `(dashboard)` para heredar layout + guard de auth. Una página fuera del grupo se saltea la protección.
- `allowedDevOrigins` debe listar hostnames exactos con subdominios (los wildcards no alcanzan).
- Bypass multipart en middleware para que los rewrites no trunquen uploads grandes.

### Config centralizada

- **Dominio canónico:** `.com.ar`, fuente única en `lib/config.ts` (`SITE_URL`). Prohibido hardcodear el dominio o leer `NEXT_PUBLIC_SITE_URL` fuera de `config.ts`.
- **WhatsApp** (contacto y mensajes): centralizado en `lib/config.ts`, nunca hardcodeado en componentes.

---

## 5. Base de datos

Esquema real (schema `public`). Verificado por introspección.

### Tablas

- **`user_roles`** — autorización. `user_id` (uuid), `role` (enum `user_role`, default `VISITOR`). Ver enums abajo.
- **`eventos`** — shows/cartelera. `titulo`, `descripcion`, `fecha` (date), `hora` (time, default `21:00`), `precio` (numeric, default 0), `es_gratuito` (bool), `url_imagen`, `integrantes`, `tipo` (text, default `'Show'`), `ciclo_id` (FK→ciclos, nullable), `is_deleted`. Borrado hard (SUPERADMIN) o soft (CM) vía RPC `handle_delete_show`.
- **`ciclos`** — agrupadores de eventos (Noche de Jazz, etc.). `nombre`, `tipo`, `estilo_tema` (default `'gold'`), `activo`. **Hoy solo se crean por SQL; no hay CRUD** (deuda).
- **`pub`** — items de gastronomía. Atributos boolean (`es_vegetariano`, `es_vegano`, `es_sin_tacc`, `es_nuevo`, `es_recomendado`), visibilidad (`destacado_home`, `hero_destacado`, `disponible`), `categoria` (text — matchea contra `pub_chips.nombre`), `tags` (text[], máx. 3, default `{}`), `orden` (int), `is_deleted`.
- **`pub_chips`** — categorías/chips de gastronomía. Solo `nombre`.
- **`menus`** — cartas en PDF. `tipo` (slug), `nombre`, `url_archivo`, `version` (bigint, auto-bump por trigger `bump_menu_version` si cambia el archivo), `orden`, `activo`, `is_deleted`.
- **`promociones`** — barra de promos del home (banco/fecha_especial/local). Ver §11. **Reemplaza a la vieja `promo_banners`, que fue eliminada.**
- **`admin_logs`** — trail de auditoría. `admin_id`, `action_type`, `table_name`, `record_id` (text), `metadata` (jsonb), `created_at`. Escrito por `logAdminAction`.
- **`rate_limits`** — contadores de rate limiting. `key` (PK), `count`, `window_start`. Ver §4.
- **`system_errors`** — errores persistidos. `error_message`, `stack_trace`, `user_id`, `resolved`, `dedup_key`. Escrito por RPC `log_system_error`.

### Enums

- **`user_role`** (el que usa la app): `SUPERADMIN`, `CM`, `VISITOR`. **Este es el enum vigente.**
- **`app_role`** (LEGACY, NO USAR): `SUPER_ADMIN`, `CONTENT_ADMIN`. Existe en la DB pero la app no debe leerlo. `CONTENT_ADMIN` es el "rol fantasma" — cualquier código que lo referencie es un bug. **Deuda: confirmar que ninguna función activa lo lee y eliminarlo.**

### Funciones / RPCs

- `check_rate_limit(p_key, p_limit, p_window_secs)` → record. Rate limiting atómico (§4).
- `handle_delete_show(show_id, user_role)` → void. Borrado soft/hard según rol.
- `log_system_error(p_message, p_stack, p_dedup_key)` → bool. Logueo no bloqueante con dedup.
- `get_auth_role()` → user_role. Devuelve el rol del usuario actual.
- `custom_access_token_hook(jsonb)` → jsonb. Inyecta claims en el JWT.
- **Triggers:** `bump_menu_version` (versiona PDFs), `handle_new_auth_user` (asigna rol a signup OAuth), `sync_role_to_jwt_claims` (sincroniza rol→JWT), `update_modified_column` / `touch_*` (updated_at automático).

### RLS — nota importante sobre la defensa real

**Las policies de escritura son `ALL` para `{public}`, no `{authenticated}`.** Esto significa que la RLS NO es la barrera principal de autorización en la práctica. **La defensa real es `guardAction`**: toda mutación pasa por Server Actions que verifican sesión+rol antes de tocar la DB. La RLS actúa como segunda capa laxa, no como muro. Implicancia: nunca escribir a estas tablas salteando el guard, porque la RLS `{public}` no frenaría un acceso directo con la anon key tanto como cabría esperar. **Deuda de hardening: endurecer las policies de escritura a `{authenticated}` + check de rol.**

Lecturas: policies `SELECT` públicas sobre contenido activo/no borrado (correcto para páginas públicas). `admin_logs` y `system_errors` restringidas a SUPERADMIN.

### Cómo regenerar esta sección

Correr en el SQL Editor los 4 queries de introspección (tablas+columnas, rutinas, enums, RLS) y actualizar. La estructura cambia; este bloque es una foto, no un contrato.

---

## 6. Patrones de datos

### Cliente público vs. cliente con sesión

- **`lib/supabase/public.ts` (`publicClient`)** — cliente anónimo, NO lee cookies. Para lecturas públicas (home, `/pub`, `/agenda`). Permite ISR: `cookies()` fuerza render dinámico y mata el cache.
- **`lib/supabase/server.ts` (`createClient`)** — con sesión, para rutas admin y mutaciones (vía `guardAction`).
- **Prohibido** usar `publicClient` en mutaciones o rutas admin.

### Regla del thenable (CRÍTICA)

Los helpers que construyen queries de Supabase deben ser **síncronos y recibir el cliente como parámetro**. Nunca funciones `async` que devuelven un builder: al `await`-ear un thenable, la query se ejecuta antes de tiempo. El patrón correcto arma el builder y lo `await`-ea recién en el punto de ejecución (ej: ternario `id ? update(...) : insert(...)` seguido de un solo `await query`).

### FormData: qué se manda y qué se omite

- Al serializar un form a FormData, **solo omitir `undefined`** (campo ausente). `""` y `null` significan "el usuario lo vació a propósito" → deben llegar al server para sobrescribir la columna. Descartar `""`/`null` produce campos que no se pueden borrar y flags que no se pueden apagar (bug real ya corregido en eventos).
- Campos opcionales que deben poder vaciarse: usar `.default("")` en Zod, **no `.optional()`**. Con `.optional()` la clave desaparece del output y el `UPDATE` no toca la columna.
- Precios/números que pueden venir vacíos: `z.preprocess` para mapear `""` → `null` antes de `z.coerce.number()`, o `""` se convierte en `0`.

### ISR y timezone

- Usar `export const revalidate = N` en páginas públicas.
- Toda lógica de fecha/hora usa el helper de timezone de Argentina, consistentemente. No construir fechas con `T12:00:00` a mano.
- No `select("*")` en queries public-facing: listar columnas explícitas.

---

## 7. Server Actions — reglas de compilación y runtime

- **Un archivo `"use server"` solo exporta funciones `async`.** Un `export interface`/`export type` **declarado localmente** se borra en compilación y es inofensivo, PERO está prohibido cualquier `export ... from` o re-export de un binding importado — rompe el manifest de Server Actions de Next. Tipos y constantes compartidas viven en `lib/` (ej: `ActionResponse` en `lib/guard.ts`).
- **Toda mutación arranca con `guardAction`.** No duplicar la lógica de sesión+rol+log inline (había 5+ copias; el guard las unificó).
- **`bodySizeLimit`** va dentro de `experimental.serverActions` en `next.config.ts` (Next 16 lo requiere ahí, no en la raíz).

### Server Actions llamadas desde el cliente

- **Todo `await` a una action desde un componente cliente va en `try/catch`.** Una action puede **rechazar la promesa** (red, 500, timeout), no solo devolver `{ success: false }`. Sin `catch`, el click no muestra feedback: la peor falla, la silenciosa.
- Si el handler maneja un flag de loading propio (`isDeleting`, etc.), el reset va en **`finally`**. Sin `finally`, un throw deja el flag en `true` para siempre y congela los botones hasta recargar. Referencia correcta: `MenusClient.saveOrder`, `MenuDrawer`.
- Mostrar `response.error || "<fallback>"`: nunca un `toast.error(undefined)`.

---

## 8. Verificación y auditoría

- **Un `grep` de una sola palabra NO audita.** `grep "finally"` matchea comentarios que contienen la palabra (ha dado falsos positivos). Para verificar de verdad, usar el patrón exacto (`grep -n "} finally {"`) o contexto (`grep -A2 -B2`).
- **No confiar en números de línea para deducir lógica.** Antes de afirmar qué hace una función, leerla (`sed -n`), no inferirla de su longitud.
- Al migrar un patrón (ej: el guard), aplicarlo a **todas** las instancias, no a una. Arreglar 1 de 3 es cómo se cuelan las divergencias.

---

## 9. Documentos internos

- `AGENTS.md` (este archivo) y `CLAUDE.md` viven en la raíz del repo. Exponen el workflow de IA — mantenerlos fuera de deploys públicos si es una preocupación (severidad baja).

---

## 11. Sistema de promociones (sección del home) — IMPLEMENTADO

- Tabla **`promociones`** (reemplaza a `promo_banners`, eliminada). Un sistema para tres tipos vía campo `tipo`: `banco`, `fecha_especial`, `local`.
- **No hay página `/promos`.** Las promos viven en una sección del home, entre el Hero y la Agenda. El SEO se resuelve con microdata `schema.org/Offer` inline en cada card (`name`, `description`, `seller`, `availability`, `priceValidUntil`).
- **Vigencia híbrida:** `activo = true` Y (sin fechas O hoy dentro del rango) Y (sin `dias_semana` O hoy coincide). Lógica en `lib/promo-helpers.ts` (`isPromoVigente`), NO en RLS.
- **`dias_semana`** es ISO: 1=lunes … 7=domingo. NULL = todos los días. Se evalúa en TZ `America/Argentina/Buenos_Aires` — el día de la semana depende de la zona horaria.
- **Se muestran TODAS las activas, vigentes o no.** Las no vigentes van atenuadas (`saturate-[0.3] opacity-75`) con badge "Vuelve los martes". Decisión de CX: el cliente sabe cuándo volver. La jerarquía visual debe ser fuerte para que nadie confunda una apagada con una activa.
- **El badge de estado vive FUERA del wrapper atenuado.** Si estuviera adentro, el `saturate`/`opacity` lo volvería ilegible (bug ya corregido).
- **Dos ramas visuales** (`PromoCard`): con `imagen_url` → card-foto oscura; sin imagen → card-clara (fondo `#F5F1E8`, logo grande a la izquierda, texto a la derecha). La rama clara existe porque **los logos de banco están diseñados para fondo blanco** y sobre negro se pierden.
- **El drawer condiciona el asset por tipo:** `banco` → solo logo; resto → solo imagen. Al cambiar de tipo se limpia el campo irrelevante (si no, queda una imagen rota mostrando su `alt`).
- **`alt_texto`** opcional; si está vacío cae al fallback automático (`resolvePromoAlt`): entidad+título para banco, título+descripción para el resto.
- **Vencimiento:** se muestra "Hasta el 14/2" solo si vence dentro de 30 días (urgencia real). Más lejos = ruido.
- **Estados en el admin:** vigente / programada / vencida / inactiva (`estadoPromo`). El listado del admin reusa `PromoCard` con `preview` — misma card que el home, imposible que diverjan.
- **Imágenes:** logo PNG transparente recomendado (leyenda en el drawer, sin validación forzada); imagen de fondo 1200×630.

---

## 12. Trampas conocidas del stack

- **Soft-delete + constraint UNIQUE:** un `UNIQUE` normal no distingue filas borradas y bloquea reusar el valor. Usar **índice único parcial**: `create unique index ... where is_deleted = false`. Aplicado en `menus.tipo`.
- **Zod v4:** `z.url()` / `z.email()` son top-level (no `z.string().url()`); en issues custom va `code: "custom"` como string (no `ZodIssueCode`); el mensaje de un enum va en `error:` (no `errorMap`).
- **Drawers y estado arrastrado:** el contenedor debe pasar `key={editing?.id ?? "new"}` **y** limpiar el estado en `onClose` (`setEditing(undefined)`). Sin las dos cosas, reabrir el drawer conserva los datos del anterior.
- **`reset()` con datos de la DB:** mapear TODOS los campos nullable a `""` (`campo ?? ""`). Un `null` que llega a un campo que Zod espera string hace fallar la validación en silencio — el submit no dispara y no loguea nada. Para depurar: `handleSubmit(onSubmit, (errs) => console.log(errs))`.
- **Array de dependencias de `useEffect`:** no puede cambiar de tamaño entre renders. React lanza error.
- **Layout flex anidado:** un `<div className="flex">` sin `w-full`/`flex-1` dentro de otro flex colapsa a su contenido, y los hijos con `flex-1` calculan mal el ancho.
- **`.nip.io` en dev:** Tailwind v4 + Turbopack servido a una IP externa puede entregar CSS incompleto (colores y utilidades que faltan). No es bug de código; en producción no ocurre. Verificar con el modo responsive del navegador de escritorio antes de investigar.
- **Uploads:** todos usan `CldUploadWidget` con preset unsigned. `actions/uploads.ts` (con magic bytes + guard) es **código muerto** — no se ejecuta en ninguna ruta.

---

## 10. Deuda técnica abierta

**Seguridad**
- **Security headers ausentes:** sin CSP, HSTS, X-Frame-Options. El vault es clickjackeable. → Bloque 1.
- **Enum `app_role` legacy** (`SUPER_ADMIN`/`CONTENT_ADMIN`) sigue en la DB. `CONTENT_ADMIN` es el rol fantasma. Confirmar que ninguna función lo lee y eliminarlo.
- **RLS de escritura es `ALL` a `{public}`** en todas las tablas salvo `promociones` (que sí usa `to authenticated` + check de rol contra `user_roles` — ese es el patrón correcto a replicar).
- **Preset de Cloudinary unsigned** y visible en el bundle. `actions/uploads.ts` con todo su hardening es código muerto. Decidir: rutear los uploads por server action, o firmar el preset.
- Callback OAuth: registrar con subdominio sobre `.com.ar`, no `.com`.

**UX / accesibilidad**
- Advertencia de borrado en `EventDrawer`: dice "no se puede deshacer" para todos, pero es hard-delete solo para SUPERADMIN (soft para CM). Role-aware o decir la verdad del peor caso.
- `HeroSection` auto-rota sin pausa ni respeto a `prefers-reduced-motion` (WCAG 2.2.2).
- `fieldErrors` de Zod se descarta en los 4 drawers: si el server rechaza algo que el cliente dejó pasar, aparece "revisá los campos" sin campo marcado.
- Sidebar `isActive` usa igualdad exacta; con el rewrite de subdominio el resaltado del ítem activo no funciona. Usar `startsWith`.

**Performance**
- Migrar `shows.ts` a `publicClient`: hoy `AgendaWrapper` usa el cliente con cookies y mantiene el home dinámico, bloqueando el ISR.
- Faltan índices en `eventos` (`fecha` + `is_deleted`) y `pub` (`destacado_home` + `disponible` + `is_deleted`). Hoy no se nota; con volumen sí.

**Features**
- `tags` en `pub`: límite de 3 aplicado en carga; falta render en el sitio público.
- `ciclos` solo se crean por SQL; falta CRUD en el admin (Bloque 6).
- Sellos de accesibilidad: sólo la tira del home y el bloque del footer. Falta distribuirlos en páginas internas (Sin TACC en `/pub`, etc.).
- `MenuDrawer` usa `useState` en vez de react-hook-form como los otros drawers. **Decisión consciente**, no migrar sin razón fuerte: maneja un flujo de upload que no encaja natural en RHF.

**Pre-deploy, fuera de bloques**
- `sitemap.xml`, `robots.txt`, metadata OG por página.
- Monitoreo real de `system_errors`: hoy se acumulan filas y nadie las mira. Falta alerta.
- Verificar backups de Supabase activos y probar una restauración.
- Audioguía: migrar a `audioguia.beatmemo.com`. Audios en **Supabase Storage**, no en `/public` (evita inflar el repo y permite actualizar sin redeploy). MP3 mono ~96kbps para voz + `preload="none"`.