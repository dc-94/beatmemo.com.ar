# AGENTS.md — Beatmemo

Referencia técnica del proyecto. Cómo está armado, las reglas que no se negocian, y cómo debe comportarse quien trabaje sobre este código.

> Beatmemo: pub-museo temático de los Beatles en Rosario. Superficies en producción por subdominio: sitio público (`beatmemo.com.ar`), panel admin (`vault.`), carta QR (`qr.` → `/menu`), audioguía (`audioguia.` → `/audioguia`).

---

## 0. Regla de oro: el código es la fuente de verdad

Este `.md` es una foto que se desactualiza. Verificá contra el código/DB antes de actuar sobre cualquier afirmación de acá. Múltiples afirmaciones resultaron vencidas durante el desarrollo. Si el doc dice una cosa y el código otra, gana el código.

---

## 1. Comportamiento esperado

- Crítica directa: no dar la razón por defecto; idea buena → mejorarla, mala → alternativas con el porqué.
- No afirmar sobre el toolchain sin verificar; mostrar código/fuente. Ante fallos raros de librerías externas, consultar su doc actualizada antes de parchear.
- Auditar el archivo real antes de responder, no inferir de memoria.
- Nunca parches parciales sin envoltorio: función/archivo completo.
- Fases atómicas: SQL/tipos → actions → UI.
- Trade-offs explícitos (SEO, LCP/CLS, seguridad).
- Diagnóstico por capas cuando algo "no anda" (función / trigger / datos / estado / red / DNS), no parchear a ciegas.

---

## 2. Stack y arquitectura

Next.js 16 (App Router, Turbopack) · React 19 · Node 22 · Supabase (Postgres/Auth/Storage/RLS) · Tailwind v4 · Cloudinary (uploads firmados) · Framer Motion · Zod v4 · react-hook-form · Sonner · pdfjs-dist · Vercel.

- **RSC-first.** Consultas a DB en el servidor.
- **Server wrapper + client view:** el componente que necesita datos del server *y* animación se parte. Nunca `await` de fetch en un módulo `"use client"`.
- **Nada no-determinista en el cliente:** todo lo que dependa de "ahora" (`new Date()`, "hoy", "vigente") se calcula en el server component y se pasa el resultado por props. Calcularlo en el cliente causa hydration mismatch (peor con ISR). Casos: `esHoy` → `AgendaWrapper` pasa `EventoConHoy`; vigencia de promos → `PromoSection` la pasa a `PromoCard`. Formatear una fecha fija del dato NO causa mismatch; solo lo que depende de *ahora*.
- **Estado en la URL** (searchParams) para filtros. **Filtrado en la capa de datos.** **ISR** sobre `useEffect`.
- Los cambios por SQL directo NO revalidan el sitio cacheado: editar desde el admin (dispara `revalidatePath`) o reiniciar dev.
- **Mobile-first.**
- **Detección de dispositivo por CAPACIDAD, no por ancho:** para servir versión móvil vs desktop de un recurso, usar `(pointer: coarse) and (hover: none)`, no breakpoints CSS (un móvil apaisado supera 768px). Ver `MenuVersionPicker`.

---

## 3. Diseño

Tokens en `globals.css`. Nunca hex hardcodeado salvo secciones con branding propio (Rooftop blanco hueso, reseñas Google claras).

- Nunca `#000000` puro → near-black de marca.
- Ritmo editorial asimétrico (Z-pattern). **Contraste por sección:** el home alterna fondos (crema pub → crema museo/espacio → hueso rooftop → oscuro promos).
- Toda animación respeta `prefers-reduced-motion`, va por transform/opacity, CLS 0.
- Nunca auto-scrollear el viewport. Chevron + "peek" para invitar.
- Espaciado editorial = una sola fuente de ritmo: cada sección trae su `py-16 sm:py-20 lg:py-28`. El home NO usa `gap` en el wrapper.
- **Carruseles continuos:** `requestAnimationFrame` con velocidad px/s (no `setInterval`), acumulador `pos` con decimales (`scrollLeft` redondea y a baja velocidad salta), lista duplicada + reset a la mitad para loop invisible, `overflow-x-scroll` (no hidden), `scroll-behavior:auto` en el track (el `scroll-smooth` global lo rompe). Ver `RooftopSection`, `EspacioCarrusel`, `AudioguiaPlayer`.
- **Bento sin huecos:** grilla 2 filas con `grid-flow-col-dense` + spans `row-span-2`/`row-span-1` intercalados; `dense` rellena los blancos.

---

## 4. Seguridad (auditada)

- **CSP en ENFORCE** en `next.config.ts`. Todos los security headers (HSTS, X-Frame, nosniff, Referrer, Permissions).
- **RLS Database-First.** Policies de escritura vía `get_auth_role()`. `user_roles` tiene policy de UPDATE para SUPERADMIN (sin ella, el update daba 0 filas SIN error → "éxito" mentiroso; lección: chequear filas con `.select()` de vuelta).
- **`get_auth_role()`** SECURITY DEFINER, no lee JWT.
- **Rate limiting** vía `guardAction`. **`admin_logs` INSERT** atado a `auth.uid()`.
- **Uploads FIRMADOS (Cloudinary):** `CldUploadWidget signatureEndpoint="/api/cloudinary-sign"` → route firma con `CLOUDINARY_API_SECRET` los `paramsToSign` EXACTOS del widget (incluye `source=uw`). Preset unsigned eliminado. El API_KEY es público, el SECRET nunca sale del server. El middleware bypassa `/api/`. La carpeta destino debe estar en la allowlist de la route.
- **Uploads pesados (audio, PDF) → directo a Supabase Storage desde el cliente**, NO por Server Action (Vercel corta Server Actions >4.5MB). El SDK del browser sube directo; la RLS del bucket (solo admin escribe) lo protege. Cada bucket con `file_size_limit` acorde. Ver `AudioguiaDrawer`, `MenuDrawer`.
- **Auth:** OAuth Google → `/auth/callback` → `exchangeCodeForSession`. `guardAction` guardián único de mutaciones. Toda action en try/catch de nivel superior (si no, "unexpected response").

---

## 5. Base de datos

- **`user_roles`** — `role` (`SUPERADMIN`|`CM`|`VISITOR`). Trigger `evitar_cero_superadmin`.
- **`admin_invitados`** — allowlist: `email`, `rol`, `estado` (`pendiente`|`denegado`). El trigger `handle_new_auth_user` la lee en el primer login.
- **`eventos`** — `titulo`, `descripcion`, `fecha`, `hora`, `precio`, `es_gratuito`, `url_imagen`, `integrantes`, `tipo` (`SHOW`|`EVENTO_CULTURAL`), `ciclo_id`, `is_deleted`. **Color e integrantes salen del `tipo`, no del ciclo** (`temaDeEvento`).
- **`ciclos`** — `nombre`, `tipo`, `estilo_tema`. CRUD con ConfirmDialog.
- **`pub`** — atributos boolean, visibilidad, `categoria`, `faceta`, `ingredientes`, `orden`, `is_deleted`. NO tiene `precio` ni `tags`.
- **`menus`** — `tipo` (slug), `nombre`, `url_archivo` (principal/desktop), **`url_archivo_movil`** (opcional), `version` (auto-bump), `activo`, `is_deleted`.
- **`espacio_galeria`** — fotos del lugar: `imagen_url`, `titulo`, `epigrafe`, `orden`, `visible`, **`mostrar_home`** (¿va en el home?), **`es_museo`** (etiqueta bar/museo, NO controla dónde se muestra). `/pub#espacio` muestra TODAS; el home solo `mostrar_home=true`.
- **`audioguia_tracks`** — `titulo` (año), `descripcion`, `imagen_url` (Cloudinary), `audio_url` (Storage bucket `audioguia`), `orden`, `activo`, `is_deleted`. Orden editable con flechas.
- **`promociones`** — `tipo`, vigencia, `prioridad`, `logo_url`/`imagen_url`.
- **`site_content`** — keyed por `clave`: textos + `imagen_url` + **`slides` jsonb** (hero) + **`lista` jsonb** (HH).
- **`config_sitio`** — singleton: `museo_visitas` jsonb, `rooftop_url`, etc.
- **`admin_logs`**, **`rate_limits`**, **`system_errors`**. Enum `app_role` legacy: DROPEADO.

**Buckets Storage:** `menus` (PDFs), `audioguia` (MP3) — públicos, escritura solo admin, `file_size_limit` subido.

---

## 6. Patrones de datos

- `publicClient` (sin cookies) para lecturas públicas → habilita ISR. `createClient` para admin/mutaciones.
- Lecturas de eventos en `lib/shows-data.ts` (NO action) con `publicClient` → home estático/ISR.
- Orden total `.order("id")` en lecturas SSR. TZ Argentina explícita, horas 24hs.
- FormData: convertir booleanos string→bool en la action Y agregar el campo al schema Zod Y al payload del insert/update. **Un campo nuevo toca 4 capas: schema, action (convertir+guardar), drawer (default+reset), UI.** Si falta en el payload de la action (armado a mano), no se guarda aunque el drawer lo mande.
- Un `update`/`upsert` que no matchea filas NO es error en Postgres: chequear `.select().length`.

---

## 7. Home — arquitectura

Orden: hero → sellos → chevron → agenda → pub → **museo+espacio (fusionado)** → rooftop → promos.

- **Hero** (`HeroSection`+`View`): slides editables desde `site_content.home_hero.slides` (imagen+palabra, máx 4). Ken Burns + crossfade + palabra sincronizada.
- **Agenda** (`AgendaPreview`): desktop acordeón horizontal, móvil acordeón vertical. Color por `temaDeEvento`. `esHoy` del server.
- **Pub** (`PubUI`): split + sello dietario + bento + banner.
- **Museo + Espacio (FUSIONADO)** (`MuseoEspacioWrapper`+`MuseoEspacioSection`): reemplaza a los viejos `MuseumPreview` y `EspacioPreview` (borrados). Fondo crema. Lee `espacio_galeria where mostrar_home=true` (bar + museo mezclados, el título dice de dónde es). Intro con números (13 años, 1/3 colección). Bento único con `EspacioCarrusel` (autoscroll). Visitas (recuadro oscuro) + Reseñas (recuadro blanco estética Google, 4,4★ · 8.424 fijo) lado a lado en desktop. Textos de `home_museo`.
- **Rooftop** (`RooftopSection`): blanco hueso, carrusel continuo. Imágenes/servicios HARDCODEADOS (deuda: CRUD pendiente).
- **Promos** (`PromoSection`): server calcula vigencia.

---

## 8. /agenda, /pub, /museo, /menu, /audioguia

- **`/agenda`:** `AgendaGrid` grid 1/2/4; móvil `EventoCardCompact`. `EventoModal` con `md:min-h-[440px]`.
- **`/pub`:** facetas con `RevealSection`. Happy Hour en `GastronomiaFacetasClient` (entre cocina y barra) con `HappyHourEditor`. `SeccionEspacio` con galería de scroll horizontal 2 filas (`EspacioCarrusel`), muestra TODAS las fotos. Whiskies con logos 1:1 `object-contain`.
- **`/museo`:** intro drop cap, timeline, visitas. HARDCODEADO (sus fotos no son CRUD; las del home salen de `espacio_galeria`).
- **`/menu` y `/qr`:** `MenuView` compartido (`isQr` por prop). **Versión móvil/desktop:** `MenuVersionPicker` (cliente) elige por capacidad táctil; QR = siempre móvil; sin versión móvil → fallback a principal. `PdfViewer` robusto.
- **`/audioguia`** (subdominio `audioguia.`, fuera de `(site)` → sin navbar/footer): `AudioguiaPlayer` — timeline histórica + player 70% con lyrics (descripción) + cola tipo Apple Music + CTAs de visitas. `<audio>` nativo, duración leída del archivo. Bloquea scroll del body al abrir.

---

## 9. Admin

- **Navegación:** `nav-config.ts` fuente única (Sidebar + BottomNav). Ítem "Usuarios" solo SUPERADMIN.
- **Contenido** (`/admin/contenido`): agrupado por página, cada sección dice dónde se ve + link al sitio. `RUTA_POR_CLAVE` completo. Hero con `HeroSlidesEditor`.
- **Drawers:** patrón uniforme. Reset con `if(!isOpen) return` + `isOpen` en deps + rama else con TODOS los campos. ConfirmDialog. `z-[60]`. Footer fijo `shrink-0` sin `mb-24`. Orden de campos: dónde va → identidad → contenido → imagen → flags → orden. Uploaders separados con estado propio (dos inputs en un label = solo dispara el primero).
- **Panel de roles** (`/admin/usuarios`, solo SUPERADMIN): invitar por email (allowlist o update si existe), cambiar rol, revocar, borrar/denegar. **Confirmación por tipeo** (se descartó re-auth OAuth: encadenar navegación OAuth a un Server Action rompe con "unexpected response"). Anti-lockout.
- **Audioguía** (`/admin/audioguia`): CRUD con reorden por flechas, upload de audio directo a Storage + imagen a Cloudinary, preview del nombre de archivo.
- **VISITOR logueado:** pantalla "cuenta pendiente de aprobación", sin acceso.

---

## 10. Trampas conocidas

- Un campo nuevo toca schema + action + drawer + UI (la cascada).
- `"use client"`/`"use server"` deben ser la PRIMera línea (comentario arriba con Turbopack rompe la detección).
- Función/componente definido dos veces → JS usa el último; editás el muerto.
- Botón de upload en `<form>` necesita `type="button"`. Dos `<input file>` en un `<label>` → solo dispara el primero (separar en labels distintos).
- Cookie `secure:true` en `http://localhost` se descarta silenciosamente → `secure: NODE_ENV === "production"`.
- Cloudinary: firmar `paramsToSign` EXACTOS del widget (incluye `source=uw`); usa `signatureEndpoint`, no `uploadSignature`.
- `column does not exist` en un `.select()` tumba la query entera → pantalla en blanco. Verificar migraciones.
- Server Action con archivo pesado (>4.5MB en Vercel) → "unexpected end of form". Usar upload directo a Storage.
- Bucket con `file_size_limit` bajo rechaza archivos aunque el código los acepte.
- **Vercel + subdominios:** usar el CNAME legacy `cname.vercel-dns.com` (el rango nuevo `*.vercel-dns-017` valida DNS pero a veces no emite el SSL). Si un dominio queda "Invalid Configuration" o sin SSL con el DNS correcto: remove + esperar 2 min + re-add. `dig ... CNAME +short` muestra el registro real; `dig ... +short` la cadena resuelta (por eso muestra el `017` aunque el registro sea el legacy).

---

## 11. SEO / Deploy

`sitemap`, `robots`, `structured-data`, OG por página. `/qr` y `/audioguia` noindex.

**Día D:** dominio raíz `beatmemo.com.ar` en Vercel (los subdominios ya van) + redirects 301 de los otros dominios (beatmemo.com, beatmemopub.*) al canónico — Vercel lo hace nativo, un click por dominio. NO tocar los MX del email. Env vars con dominio real (`NEXT_PUBLIC_ADMIN_URL`, `_CALLBACK_URL`, `_SITE_URL`). Borrar `allowedDevOrigins`. Supabase Redirect URLs + Site URL al dominio prod. Backups + probar restauración. Lighthouse producción en incógnito. `engines: "node": "22.x"` (fijo, no `>=22`).

## 12. Deuda / features pendientes

- **CRUD del Rooftop** — imágenes + servicios hardcodeados, mover a DB.
- **Google Places API** para reseñas en vivo (hoy 4,4★ fijo).
- **`actions/uploads.ts`** y `actions/menu-uploads.ts` / `audioguia-uploads.ts` — código muerto tras el upload directo, borrar.
- Contraste de micro-labels `text-[9px]` sobre imagen.