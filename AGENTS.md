# AGENTS.md — Beatmemo

Referencia para agentes de IA y para el equipo. Define **cómo está armado el proyecto, las reglas que no se negocian, y cómo debe comportarse un asistente que trabaje sobre este código.**

> Beatmemo: pub-museo temático de los Beatles en Rosario. Superficies: sitio público (`beatmemo.com.ar`), panel admin "El Motor"/vault (`vault.`), carta QR (`qr.` → `/menu`), y audioguía V2 planificada (`audioguia.`).

---

## 0. Regla de oro: este documento no es la fuente de verdad

**El código y la DB son la fuente de verdad; este `.md` es una foto que se desactualiza.** Durante el desarrollo, MÚLTIPLES afirmaciones de este doc resultaron vencidas. Antes de actuar sobre cualquier afirmación de acá, **verificala contra el código/DB**. Si contradice a la realidad, la realidad gana y el doc se corrige.

Correcciones históricas (para no repetirlas): los security headers **están** implementados y el **CSP está en enforce** (no report-only); la RLS de escritura **sí** gatea por rol; el bug de `isActive` estaba en `BottomNav`, no en `Sidebar`; `pub.tags` **no existe**; la agenda móvil del home **es acordeón vertical**; `get_auth_role()` es Database-First. Cuando el `.md` diga una cosa y el código otra, es el `.md` el que está viejo.

---

## 1. Comportamiento de un asistente en este repo

- **Crítica directa sobre validación.** No dar la razón por defecto. Idea buena → mejorarla y explicar. Idea mala → 2 alternativas mejores con el porqué.
- **No afirmar sobre el toolchain sin verificar.** Mostrar código/fuente.
- **Auditar de verdad antes de responder.** Leer el archivo real, no inferir. Un `grep` que matchea comentarios NO es auditoría. Cuando algo de una librería externa falla raro (ej. Cloudinary signature), consultar la doc actualizada antes de parchear a ciegas.
- **Nunca parches parciales sin su envoltorio.** Función/archivo completo; un fragmento suelto rompe el build.
- **Fases atómicas.** SQL/tipos → actions → UI.
- **Trade-offs explícitos.** Exponer riesgos ocultos (SEO, LCP/CLS, seguridad).
- **Nada de mock data en producción.** Estados vacíos honestos o ISR con último dato real.
- **Diagnóstico por capas.** Cuando algo "no anda", aislar capa por capa (función / trigger / datos / estado / red) en vez de parchear. Aplicado con éxito en RLS, roles, duplicaciones, upload firmado.

---

## 2. Stack y arquitectura

Next.js 16 (App Router, Turbopack) · React 19 · Supabase (Postgres/Auth/Storage/RLS) · Tailwind v4 (`@theme`) · Cloudinary (uploads firmados) · Framer Motion · Zod v4 · react-hook-form · Sonner · pdfjs-dist · Vercel.

- **RSC-first.** Consultas a DB en el servidor. Prohibido cliente pesado por defecto.
- **Server wrapper + client view.** El componente que necesita datos del server *y* animación se parte: server fetchea, `"use client"` recibe props y anima. **Nunca `await` de fetch en un módulo `"use client"`.** Ejemplos: `HeroSection`/`HeroSectionView`, `VisitasGuiadasPage`/`VisitasGuiadasView`, `Pub`/`PubUI`, `AgendaWrapper`/`AgendaPreview`.
- **Nada no-determinista en el cliente.** Todo lo que dependa de "ahora" (`new Date()`, "hoy", "vigente") se calcula en el **server component** y se pasa el resultado ya resuelto por props. Calcularlo en el cliente durante el render causa **hydration mismatch** (server y cliente evalúan "hoy" distinto, peor con ISR donde el HTML es viejo). Casos reales: `esHoy` en AgendaPreview → `AgendaWrapper` lo calcula y pasa `EventoConHoy = PublicEvent & { esHoy: boolean }`; `isPromoVigente/vencimiento` en PromoCard → `PromoSection` los calcula y pasa por props. Formatear una fecha fija del dato (toLocaleDateString de la fecha del evento) NO causa mismatch; solo lo causa lo que depende de *ahora*.
- **Estado en la URL** (searchParams) para filtros/paginación (SEO + compartible).
- **Filtrado en la capa de datos**, no en el navegador.
- **ISR** (`export const revalidate = N`) sobre `useEffect`. Los cambios por SQL directo NO revalidan el sitio cacheado — editar desde el admin (dispara `revalidatePath`) o reiniciar dev.
- **Mobile-first.**

---

## 3. Diseño

Tokens en `globals.css` (`@theme`). **Nunca un hex hardcodeado** (salvo secciones con branding propio como el Rooftop, blanco hueso `#FAF8F4` + negro).

- **Nunca `#000000` puro** → near-black de marca.
- **Ritmo editorial asimétrico** (Z-pattern), evitar "muros de cards".
- **Contraste por sección** — el home alterna fondos (crema pub → oscuro museo → crema espacio → hueso rooftop → oscuro promos) para dar respiración. Nunca dos secciones del mismo tono pegadas.
- **Toda animación respeta `prefers-reduced-motion`**, va por `transform`/`opacity`, CLS 0.
- **Nunca auto-scrollear el viewport.** Chevron + "peek" para invitar.
- **Espaciado editorial = una sola fuente de ritmo.** El home NO usa `gap` en el wrapper: cada sección trae su `py-16 sm:py-20 lg:py-28` (parejo). Excepción: Promos con `py` menor (es banner, no sección protagonista).
- **Carruseles continuos:** `requestAnimationFrame` con velocidad px/s (no `setInterval`), acumulador `pos` con decimales (`scrollLeft` redondea y a baja velocidad salta), lista duplicada + reset a la mitad para loop invisible, `overflow-x-scroll` (no hidden), `scroll-behavior:auto` en el track (el `scroll-smooth` global lo rompe). Ver `RooftopSection`.

---

## 4. Seguridad (auditada y verificada)

- **CSP en ENFORCE** en `next.config.ts` (header `Content-Security-Policy`, no report-only). Directivas ajustadas: `object-src 'none'`, `base-uri 'self'`, `frame-ancestors 'self'`, `form-action` restringido a self + Google. `script-src` con `'unsafe-inline'` (Next inyecta inline; nonce mataría el ISR) y `'unsafe-eval'` solo en dev (HMR).
- **Todos los security headers**: HSTS (2 años), X-Frame-Options SAMEORIGIN, X-Content-Type-Options nosniff, Referrer-Policy, Permissions-Policy (camera/mic/geo denegados).
- **RLS correcta y Database-First.** Policies de escritura chequean `get_auth_role()`. Anon key → `null` → escritura denegada. **`user_roles` tiene policy de UPDATE** para SUPERADMIN (sin ella, el update de roles daba 0 filas SIN error → "éxito" mentiroso; lección: un `update` que no matchea filas no es error en Postgres, chequear `.select()` de vuelta).
- **`get_auth_role()`**: `SECURITY DEFINER`, `search_path` fijado, lee `user_roles`. No lee JWT.
- **Rate limiting** vía `guardAction` (check antes de la query de rol). Sin endpoints públicos de mutación.
- **`admin_logs` INSERT atado a `auth.uid()`.**
- **Uploads Cloudinary FIRMADOS.** El preset unsigned se eliminó. Flujo: `CldUploadWidget signatureEndpoint="/api/cloudinary-sign"` → route firma con `CLOUDINARY_API_SECRET` (server-only) los `paramsToSign` EXACTOS que manda el widget (incluye `source=uw`; firmar un objeto reconstruido a mano falla). La route valida sesión + rol + carpeta en allowlist. El `API_KEY` es público (identifica la cuenta), el `API_SECRET` nunca sale del server. El middleware bypassa `/api/` (como `/auth/`) para que el fetch de la firma no se reescriba.

**Hardening de inputs:** magic bytes (no `file.type`), allowlist de carpetas, anti parameter-tampering, slugs sanitizados, soft deletes, auditoría `await logAdminAction`, XSS por render como text node.

**Auth:** OAuth Google → `/auth/callback` → `exchangeCodeForSession`. Rol en `user_roles`. `guardAction` es el guardián único de toda mutación.

**Deuda de seguridad abierta:** `actions/uploads.ts` con magic bytes quedó como código muerto (el flujo firmado sube directo a Cloudinary, no pasa por el server) — borrar o guardar para una capa futura de validación server-side. `NEXT_PUBLIC_ADMIN_URL` en Vercel (Día D). Backups + restauración probada (Día D). `allowedDevOrigins` con IPs de LAN — borrar pre-deploy (hoy se usa para test móvil).

---

## 5. Base de datos

Schema `public`, verificado por introspección.

- **`user_roles`** — `user_id`, `role` (`SUPERADMIN`|`CM`|`VISITOR`, default VISITOR). Trigger `evitar_cero_superadmin` impide dejar el sistema sin superadmin.
- **`admin_invitados`** — allowlist de admins pre-autorizados: `email`, `rol`, `estado` (`pendiente`|`denegado`), `invitado_por`. El trigger `handle_new_auth_user` la lee en el primer login: si el email está y no está denegado, asigna ese rol; si no, VISITOR.
- **`eventos`** — `titulo`, `descripcion`, `fecha`, `hora`, `precio`, `es_gratuito`, `url_imagen`, `integrantes`, `tipo` (`SHOW`|`EVENTO_CULTURAL`), `ciclo_id`, `is_deleted`. **El color y "tiene integrantes" salen del `tipo`, no del ciclo:** SHOW → rojo + integrantes; CULTURAL → color del ciclo, sin integrantes. Helper `temaDeEvento(tipo, estiloTemaCiclo)`.
- **`ciclos`** — `nombre`, `tipo`, `estilo_tema`, `activo`. CRUD en `CiclosManager` (con ConfirmDialog).
- **`pub`** — atributos boolean, visibilidad (`destacado_home`, `hero_destacado`, `disponible`), `categoria`, `faceta`, `ingredientes`, `orden`, `is_deleted`. **NO tiene `precio` ni `tags`.**
- **`menus`** — `tipo` (slug), `nombre`, `url_archivo`, `version` (auto-bump), `activo`, `is_deleted`.
- **`promociones`** — `tipo` (`banco`|`fecha_especial`|`local`), vigencia, `prioridad`, `logo_url`/`imagen_url`.
- **`site_content`** — keyed por `clave`: `titulo`, `subtitulo`, `cuerpo`, `cta_*`, `imagen_url`, **`slides` jsonb** (hero: array `{imagen,palabra}`, máx 4), **`lista` jsonb** (ej. qué entra en el HH).
- **`config_sitio`** — singleton: contacto, horarios, redes, `rooftop_url`, `museo_visitas` jsonb.
- **`admin_logs`** — `admin_id`, `action_type`, `table_name`, `record_id`, `metadata`.
- **`rate_limits`**, **`system_errors`**.

**RPCs:** `check_rate_limit`, `handle_delete_show`, `log_system_error`, `get_auth_role`, `buscar_user_por_email`, `listar_admins`. **Enum `app_role` legacy: DROPEADO.**

---

## 6. Patrones de datos

- **`publicClient`** (sin cookies) para lecturas públicas → habilita ISR. **`createClient`** (con sesión) para admin/mutaciones. `cookies()` fuerza dinámico → nunca en páginas públicas.
- **Lecturas de eventos** en `lib/shows-data.ts` (NO action, NO `"use server"`) con `publicClient` → home estático/ISR (`/` sale `○` revalidate 10m).
- **Orden total en lecturas SSR:** desempate `.order("id")` en todas.
- **TZ Argentina explícita** siempre. Horas en **24hs** (`hour12: false`).
- **FormData:** solo omitir `undefined`. jsonb serializado a mano antes del `await`.
- **Un `update`/`upsert` que no matchea filas NO es error en Postgres.** Para saber si RLS bloqueó, pedí las filas con `.select()` y chequeá `length === 0`.

---

## 7. Server Actions

- Archivo `"use server"` solo exporta funciones async. Toda mutación arranca con `guardAction`. Roles restringidos vía `guardAction({ roles: [...] })`.
- **Envolver TODA action en try/catch de nivel superior.** Si `guardAction`/RPC/logger lanza, sin el catch la action revienta con "unexpected response" en el cliente.
- **Cascada:** valor que cruza schema/action/UI/validación → las 4 capas juntas.
- Await desde cliente en try/catch; loading en finally; `res.error || "<fallback>"`.
- **`revalidatePath` usa la ruta física** (`/admin/usuarios`); los `redirect`/`next` en el subdominio usan la ruta limpia (`/usuarios`).

---

## 8. Home — arquitectura

Orden: hero → sellos → chevron → agenda → **pub → museo → espacio → rooftop → promos**.

- **Hero** (`HeroSection`+`View`): server arma ticker + slides. **Slides editables** desde `site_content.home_hero.slides` (imagen+palabra pegadas, máx 4, con `HeroSlidesEditor`), fallback a hardcodeados. Ken Burns + crossfade + palabra rotativa sincronizada (un `index` compartido). CLS 0.
- **Agenda** (`AgendaPreview`): desktop acordeón horizontal hover-expand; móvil acordeón vertical (tap expande, tap en header expandido → modal, "+ info", sin imagen en expandida, solo precio+reservar). Color por `temaDeEvento`. `esHoy` viene del server (`EventoConHoy`). LiveTodayBadge en desktop expandido.
- **FAB WhatsApp:** reveal-on-scroll solo en home.
- **Pub** (`PubUI`): split intro (imagen 5/4 con título encima en móvil) + sello dietario (banda en móvil) + bento (verticales con nombre sobre imagen + solo íconos) + banner. Cae a `null` sin `hero`.
- **Espacio** (`EspacioPreview`): 3 fotos reales de `espacio_galeria` + texto de `home_espacio`, link a `/pub#espacio`.
- **Rooftop** (`RooftopSection`): blanco hueso, logo `logo_ROOFTOP.svg`, carrusel continuo (rAF), servicios sobre el carrusel, CTA cotizar (WhatsApp) + Instagram centrados. Imágenes/servicios HARDCODEADOS (deuda: CRUD post-brief).
- **Promos** (`PromoSection`): server calcula vigencia y la pasa a `PromoCard`. Banner comprimido, grilla desktop / carrusel móvil.

---

## 9. /agenda, /pub, /museo

- **`/agenda`:** `AgendaGrid` grid-cols-1/2/4; móvil `EventoCardCompact` (2-col, badge fecha+hora con fondo, 5/4). `AgendaTabs` responsive. `EventoModal` con `md:min-h-[440px]` en la imagen (no se achata con poco texto).
- **`/pub`:** facetas con `RevealSection`, apilan en móvil. **Happy Hour vive acá** (en `GastronomiaFacetasClient`, intercalado entre cocina y barra por orden cronológico del menú), con `HappyHourEditor`: horario+foto+lista de qué entra. Cocina/wraps con descripción + badges (texto en desktop, íconos en móvil vía `AtributoBadges` responsive). Carrusel de whiskies con logos 1:1 `object-contain`.
- **`/museo`:** intro drop cap, timeline, banner de visitas, audioguías. `museo_visitas.escuelas.reservas_modo` propaga a 3 superficies vía `EscuelasAviso`.

---

## 10. Admin

- **Navegación:** `nav-config.ts` fuente única (Sidebar + BottomNav). BottomNav móvil scroll horizontal con peek + Salir. Ítem "Usuarios" solo SUPERADMIN (`navParaRol`). `isActive` con `startsWith`.
- **Contenido** (`/admin/contenido`): agrupado por página (Home/Pub/Museo/Agenda), cada sección dice dónde se ve + link al sitio. `RUTA_POR_CLAVE` completo (sin él, guardaba pero no revalidaba → "no funciona"). El hero muestra `HeroSlidesEditor`. **El HH NO está acá** (se movió a Gastronomía).
- **Listas mobile-first:** shows por mes, filas compactas, toggle de búsqueda con badge.
- **Drawers:** patrón uniforme. Reset con `if(!isOpen) return` + `isOpen` en deps + rama else con TODOS los campos (si no, arrastra datos del anterior). ConfirmDialog para borrado. `z-[60]`. **Footer fijo `shrink-0` sin `mb-24`** + indicador de errores. Orden de campos: **dónde va → identidad → contenido → imagen → flags → orden**. Toasts de borrado con el nombre real (no "Whisky eliminado" en todos — era copy-paste).
- **Panel de roles** (`/admin/usuarios`, solo SUPERADMIN): invitar por email (allowlist o update directo si ya existe), cambiar rol, revocar, borrar/denegar invitados. **Confirmación por tipeo** (B2: escribir el email/palabra) para acciones sensibles — se descartó la re-auth OAuth (B1) porque encadenar navegación OAuth a la respuesta de un Server Action rompe con "unexpected response". Anti-lockout: no auto-degradarse.
- **VISITOR logueado:** ve pantalla "cuenta pendiente de aprobación", sin acceso a nada (el layout gatea por `isAdminRole`). Signups habilitados en Supabase (necesario para que el trigger de allowlist corra); la seguridad está en que el default es VISITOR sin permisos.

---

## 11. QR / Carta (/menu, /qr)

`MenuView` compartido (`isQr` por prop, no `headers()` → permite estático). `PdfViewer` robusto (timeout, DPR, cola de render, cleanup). CTAs jerarquizados (reservar WhatsApp + agenda + reseña), redes con tap targets 44px. Carta desktop (principal) vs móvil/QR: rutas separadas (`qr.`→`/qr`), no detección por headers.

---

## 12. SEO

`sitemap.ts`, `robots.ts`, `structured-data.ts` existen. OG por página en `public/og/`. `metadataBase` en layout. `/qr` noindex.

---

## 13. Trampas conocidas

- Soft-delete + UNIQUE → índice parcial `where is_deleted=false`.
- Editar schema Zod → reiniciar TS server.
- `<script>` crudo no ejecuta → `next/script`.
- Función/componente definido dos veces → JS usa el último; editás el muerto (pasó con `SelloDietario`).
- `"use client"` / `"use server"` deben ser la PRIMera línea (un comentario arriba con Turbopack puede impedir la detección).
- Botón de upload en `<form>` necesita `type="button"`.
- `overflow-x-auto` en flex → spacer `w-px` al final.
- Margen negativo sobre bloque multi-fila puede esconder filas bajo `overflow-hidden`.
- Cookie `secure:true` en `http://localhost` se descarta silenciosamente → usar `secure: NODE_ENV === "production"`.
- Cloudinary firma: firmar `paramsToSign` EXACTOS del widget (incluye `source=uw`); `next-cloudinary` usa `signatureEndpoint`, no `uploadSignature`.
- `column does not exist` en un `.select()` tumba la query entera → pantalla en blanco. Verificar que las migraciones corrieron.

---

## 14. Deuda técnica abierta

> **Cerrado/descartado (no reintroducir):** security headers, CSP enforce, "agujero" de RLS, duplicaciones, spacing home, mobile admin, agenda móvil, upload firmado, panel de roles, hydration de fecha, enum `app_role` (dropeado), a11y aria-label.

- **`actions/uploads.ts`** código muerto — borrar o reusar para validación server-side.
- **Rooftop hardcodeado** (imágenes + servicios) — CRUD pendiente.
- **Contraste** de micro-labels `text-[9px]` sobre imagen — revisar.
- **Logs UI:** `record_id`/`table_name` en tabla desktop.

## 15. Post-brief (features)

- **Audioguía V2** — subdominio `audioguia.`, misma mecánica QR (middleware ya enruta por hostname). Audios en Supabase Storage.
- **CRUD del Rooftop** — mover imágenes/servicios de código a DB.

## 16. Día D (deploy)

Dominio en Vercel + 301, DNS de `vault.`/`qr.`/`audioguia.` **cuidando los MX de `beatmemo.com.ar`**. Setear `NEXT_PUBLIC_ADMIN_URL` en Vercel (sin esto el login redirige a localhost). Borrar `allowedDevOrigins`. Backups Supabase + **probar restauración**. Lighthouse de **producción en incógnito**. GA/GTM con la cuenta de la empresa.