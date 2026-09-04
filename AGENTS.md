# AGENTS.md — Beatmemo

Referencia para agentes de IA y para el equipo. Define **cómo está armado el proyecto, las reglas que no se negocian, y cómo debe comportarse un asistente que trabaje sobre este código.**

> Beatmemo: pub-museo temático de los Beatles en Rosario. Superficies: sitio público (`beatmemo.com.ar`), panel admin "El Motor"/vault (`vault.`), carta QR (`qr.` → `/menu`), y audioguía V2 planificada (`audioguia.`).

---

## 0. Regla de oro: este documento no es la fuente de verdad

**El código y la DB son la fuente de verdad; este `.md` es una foto que se desactualiza.** Durante el desarrollo, MÚLTIPLES afirmaciones de este doc resultaron vencidas y casi provocan trabajo innecesario (una migración de RLS para tapar un "agujero" que no existía). Antes de actuar sobre cualquier afirmación de acá, **verificala contra el código/DB**. Si contradice a la realidad, la realidad gana y el doc se corrige.

Correcciones históricas (para no repetirlas): los security headers **están** implementados; la RLS de escritura **sí** gatea por rol; el bug de `isActive` estaba en `BottomNav`, no en `Sidebar`; `pub.tags` **no existe** en la DB (los tags se descartaron como feature); la agenda móvil del home **ahora sí** es acordeón vertical (antes era carrusel); `get_auth_role()` es Database-First.

---

## 1. Comportamiento de un asistente en este repo

- **Crítica directa sobre validación.** No dar la razón por defecto. Idea buena → mejorarla y explicar. Idea mala → 2 alternativas mejores con el porqué.
- **No afirmar sobre el toolchain sin verificar.** Mostrar código/fuente. Las afirmaciones de memoria sobre el stack fallaron seguido.
- **Auditar de verdad antes de responder.** Leer el archivo real, no inferir de memoria ni de este doc. Un `grep` de una palabra que matchea comentarios NO es auditoría.
- **Nunca parches parciales sin su envoltorio.** Función completa o archivo completo; un fragmento suelto rompe el build (pasó).
- **Fases atómicas.** SQL/tipos → actions → UI. Nada de bloques monolíticos que unifiquen DB+backend+frontend.
- **Trade-offs explícitos.** Exponer riesgos ocultos (SEO, LCP/CLS, seguridad) para decisiones informadas.
- **Nada de mock data en producción.** Estados vacíos honestos o ISR con último dato real. Un cliente no viaja al local por un show falso.

---

## 2. Stack y arquitectura

Next.js 16 (App Router, Turbopack) · React 19 · Supabase (Postgres/Auth/Storage/RLS) · Tailwind v4 (`@theme`) · Cloudinary · Framer Motion · Zod v4 · react-hook-form · Sonner · pdfjs-dist · Vercel.

- **RSC-first.** Consultas a DB en el servidor. Prohibido cliente pesado por defecto.
- **Server wrapper + client view.** Componente que necesita datos del server *y* animación se parte: server hace fetch, `"use client"` recibe props y anima. **Nunca `await` de fetch en un módulo `"use client"`** (bug real corregido en `HeroSection`). Ejemplos: `HeroSection`/`HeroSectionView`, `VisitasGuiadasPage`/`VisitasGuiadasView`, `Pub`/`PubUI`, `AgendaWrapper`/`AgendaPreview`.
- **Estado en la URL** (searchParams), no `useState` en jerarquía alta, para filtros/paginación (SEO + compartible).
- **Filtrado en la capa de datos**, no en el navegador.
- **ISR** (`export const revalidate = N`) sobre `useEffect`.
- **Mobile-first.** Diseñar vertical primero.

---

## 3. Diseño

Tokens en `globals.css` (`@theme`). **Nunca un hex hardcodeado.**

- **Nunca `#000000` puro** (halación/OLED) → near-black de marca.
- **Ritmo editorial asimétrico** (Z-pattern), evitar "muros de cards".
- **Contraste por sección** (franjas oscuras vs crema `#FAF7F2`), sin gris intermedio.
- **Toda animación respeta `prefers-reduced-motion`**, va por `transform`/`opacity`, altura reservada (CLS 0).
- **Nunca auto-scrollear el viewport.** Para invitar al scroll: chevron animado + "peek" de contenido real. Mover la página desorienta.
- **Espaciado editorial = una sola fuente de ritmo.** El home NO usa `gap` en el wrapper: cada sección trae su propio `py-16 sm:py-20 lg:py-28` (parejo). Dos capas de espaciado (gap + py) dan ritmo desparejo. Una sola = constante que se lee sola.

---

## 4. Seguridad (auditada y verificada)

- **Security headers implementados** en `next.config.ts`: CSP enforce, `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`, HSTS.
- **RLS correcta.** Todas las policies de escritura chequean rol vía `get_auth_role()` (o `EXISTS(user_roles…)` en `promociones`). La anon key evalúa `get_auth_role() → null` → **escritura denegada**. La RLS es barrera real junto a `guardAction`.
- **`get_auth_role()` Database-First** (`SECURITY DEFINER`, `search_path` fijado, `select role from user_roles where user_id = auth.uid()`). No lee JWT.
- **Rate limiting completo** vía `guardAction` (`check_rate_limit` antes de la query de rol). No hay endpoints públicos de mutación (reservas → WhatsApp; escuelas → Calendly).
- **`admin_logs` INSERT atado a `auth.uid()`** — no se pueden forjar entradas de otro admin; el logueo de `UNAUTHORIZED_*`/`LOGIN_SUCCESS` sigue funcionando.
- **Sin policies basadas en JWT** (se dropeó la SELECT duplicada de `admin_logs` que leía el claim → sin ventana de rol stale).

**Hardening de inputs:** validación por magic bytes (no `file.type`); allowlist de carpetas en runtime; anti parameter-tampering (`?param` inválido → default seguro); slugs sanitizados (path traversal); soft deletes (`.eq("is_deleted", false)`); auditoría con `logAdminAction` (`await`, no fire-and-forget); XSS cubierto por render como text node (sin `dangerouslySetInnerHTML`).

**Auth:** OAuth Google (`signInWithOAuth`) → `/auth/callback` → `exchangeCodeForSession`. Rol en `user_roles` (Database-First), leído por `guardAction` y el layout admin. `guardAction` es el guardián único de toda mutación (sesión + rate limit + rol + log).

**Deuda de seguridad abierta:** enum `app_role` legacy (`SUPER_ADMIN`/`CONTENT_ADMIN`) sigue en la DB, sin uso — dropear tras confirmar. Preset de Cloudinary unsigned visible (`actions/uploads.ts` con hardening quedó como código muerto). Residual: un autenticado puede auto-insertar en `admin_logs` con su propio uid (no forjar de otro).

---

## 5. Base de datos

Schema `public`, verificado por introspección.

- **`user_roles`** — `user_id`, `role` (enum `user_role`: `SUPERADMIN`|`CM`|`VISITOR`, default VISITOR).
- **`eventos`** — `titulo`, `descripcion`, `fecha`, `hora`, `precio`, `es_gratuito`, `url_imagen`, `integrantes`, `tipo` (`SHOW`|`EVENTO_CULTURAL`), `ciclo_id` (FK), `is_deleted`. Borrado soft/hard vía RPC `handle_delete_show`.
- **`ciclos`** — `nombre`, `tipo`, `estilo_tema` (default `gold`), `activo`. **CRUD implementado** (drawer + actions con logs `*_CICLO`).
- **`pub`** — atributos boolean (`es_vegetariano/vegano/sin_tacc/nuevo/recomendado`), visibilidad (`destacado_home`, `hero_destacado`, `disponible`), `categoria`, `faceta`, `ingredientes`, `orden`, `is_deleted`. **NO tiene `precio` ni `tags`** — destacados con nombre + badges.
- **`pub_chips`** — `nombre`.
- **`menus`** — `tipo` (slug), `nombre`, `url_archivo`, `version` (auto-bump), `orden`, `activo`, `is_deleted`. Índice único parcial en `tipo where is_deleted=false`.
- **`promociones`** — `tipo` (`banco`|`fecha_especial`|`local`), vigencia (`dias_semana`, `fecha_desde/hasta`, `activo`), `prioridad`, `logo_url`/`imagen_url`. Reemplazó a `promo_banners`.
- **`site_content`** — keyed por `clave`: `titulo`, `subtitulo`, `cuerpo`, `cta_*`, `imagen_url`.
- **`config_sitio`** — singleton (`id=1`): contacto, horarios (jsonb), redes, banner, `rooftop_url`, **`museo_visitas` (jsonb)**.
- **`admin_logs`** — `admin_id`, `action_type`, `table_name`, `record_id`, `metadata`, `created_at`.
- **`rate_limits`**, **`system_errors`** (con `resolved`, `dedup_key`).

**RPCs:** `check_rate_limit`, `handle_delete_show`, `log_system_error`, `get_auth_role`, `custom_access_token_hook`. Triggers: `bump_menu_version`, `handle_new_auth_user`, `sync_role_to_jwt_claims`.

---

## 6. Patrones de datos

- **Cliente público** (`publicClient`, sin cookies) para lecturas públicas → habilita ISR. **Cliente con sesión** (`createClient`) para admin/mutaciones. `cookies()` fuerza render dinámico → nunca en páginas públicas.
- **Lecturas de eventos** viven en `lib/shows-data.ts` (**NO** `actions/`, **NO** `"use server"`): son lecturas, no actions. Marcarlas como action las vuelve endpoints POST y estorba el ISR. Usan `publicClient` → el home es **estático/ISR** (verificado en el build: `/` sale `○` con revalidate 10m).
- **Orden total en lecturas SSR:** toda lista renderizada en servidor lleva desempate único final (`.order("id")`). Sin orden total, HTML cacheado y payload de hidratación pueden diferir → hydration mismatch. Importa aún más con `.limit()`.
- **Nada no-determinista en el cliente:** `Date.now()`/`Math.random()`/shuffles van en el server component que serializa el resultado. Un `seededShuffle` con `Date.now()` en `useMemo` de cliente **no es determinista** (caso real: flip de íconos en el bento; se movió el shuffle a `Pub.tsx`).
- **TZ Argentina explícita** siempre (`America/Argentina/Buenos_Aires`). `fecha`/`hora` de eventos son wall-clock AR: no reconvertir zona, formatear literal. **Horas en formato 24hs** (`hour12: false`) en todo el sitio.
- **FormData:** solo omitir `undefined` (`""`/`null` deben llegar para vaciar columnas). Campos jsonb serializados a mano (`horarios`, `museo_visitas`) necesitan su `formData.set(...)` **antes del `await`**.

---

## 7. Server Actions

- Un archivo `"use server"` solo exporta funciones `async`. Tipos compartidos en `lib/` (`ActionResponse` en `lib/guard.ts`).
- Toda mutación arranca con `guardAction`. Roles restringidos vía `guardAction({ roles: [...] })`.
- **Cascada:** valor que cruza schema/action/UI/validación → las 4 capas juntas. Agregar clave a `site_content` requiere seed SQL **y** sumarla al `z.enum` de `validations/site-content.ts` (anti-tampering).
- Await a una action desde cliente **siempre en `try/catch`** (puede rechazar, no solo devolver `{success:false}`); reset de loading en `finally`; mostrar `res.error || "<fallback>"`.

---

## 8. Home — arquitectura

Orden: hero → sellos accesibilidad → chevron → agenda → pub → promos → museo. (Gancho emocional antes que lo transaccional.)

- **Hero** (`HeroSection`+`HeroSectionView`): server hace un `Promise.all` (home_hero + shows + config + promos), arma el ticker, pasa por props. Dirección "A+C": Ken Burns + crossfade + grano + barrido + palabra rotativa ("DESCUBRÍ el pub/los shows/nuestro museo", **sincronizada con la imagen**, ~4s) + ticker vivo. Altura 60vh, sin CTA (lo cubre el FAB reveal-on-scroll), primera imagen `priority` (LCP), CLS 0. Ticker: **un solo evento** (hoy si hay, si no el próximo) + free tour + promos; `LIVE TODAY` solo el de hoy.
- **Agenda** (`AgendaPreview`): **desktop** acordeón horizontal hover-expand (destacado abierto por default, "click para ver detalle" paralelo a la fecha, click → `EventoModal`); **móvil** acordeón vertical (1er tap expande, tap en header expandido → modal, "+ info" / `LIVE TODAY`, sin imagen en expandida, solo precio + reservar). Color de ciclo vía `getTema` (rojo shows, dorado cultural, celeste idiomas). Idiomas: el ciclo sube a título. Título largo → marquee condicional (`scrollWidth > clientWidth`). Incluye SHOW + EVENTO_CULTURAL.
- **FAB WhatsApp:** reveal-on-scroll **solo en home** (`usePathname()`, aparece pasado el 70% del hero); resto del sitio siempre visible.
- **Pub** (`Pub`+`PubUI`): split intro (imagen 5/4 con título encima en móvil) + sello dietario (banda propia en móvil) + bento de destacados (verticales solo íconos, sin descripción) + banner "Descubrí la carta". `SelloDietario` en `text-xs`.

---

## 9. /agenda, /pub, /museo

- **`/agenda`:** `AgendaGrid` usa `grid-cols-1 sm:2 lg:4` (consistente con `CulturalGrid`); en móvil, `EventoCardCompact` (grilla 2-col compacta, badge fecha+hora con fondo, aspecto 5/4); desktop `EventoCard`. `AgendaTabs` con `text-xl sm:text-3xl` activa (no desborda en móvil) y `scroll={false}` en los `<Link>` (no salta al cambiar de pestaña). `past` usa `ArchivoEventos` (acordeón por mes).
- **`/pub`:** secciones de faceta con `RevealSection`, apilan a 1-col en móvil. Bien resuelto.
- **`/museo`:** intro con drop cap (`text-5xl` en móvil), timeline, banner de 3 visitas, sección audioguías centrada. `museo_visitas.escuelas.reservas_modo` (`activas`|`mensaje`) propaga a home/`/museo`/visitas-guiadas vía `EscuelasAviso`. Mensaje sanitizado (text node).

---

## 10. Admin

- **Navegación:** `nav-config.ts` es la **fuente única** (Sidebar y BottomNav la consumen — antes divergían por listas hardcodeadas separadas). `BottomNav` móvil: scroll horizontal con peek + fade, sub-barra contextual de Pub, botón Salir, ítem activo auto-centrado. `isActive`: `startsWith` (salvo `/admin` exacto).
- **Listas mobile-first:** Shows agrupado por mes (acordeón, mes actual abierto) + filas compactas + toggle de búsqueda con badge de filtro activo. Promos/Gastronomía(facetas)/Destacados/Espacio/Logs con filas o grilla compacta en móvil. Whiskies ya era compacto.
- **Drawers:** `ConfirmDialog` reusable para todo borrado (role-aware en `EventDrawer`: permanente SUPERADMIN, archivar CM; el resto soft). `useDrawerA11y` (focus-trap + Escape + auto-focus). Drawers en `z-[60]`. `key={editing?.id ?? "new"}` + limpieza en `onClose`.
- **Layout:** `p-4 pb-28 md:p-8`. Rol Database-First en el server; secciones solo-SUPERADMIN gateadas por `role === "SUPERADMIN"`.

---

## 11. QR / Carta (/menu, /qr)

`MenuView` compartido (contexto `isQr` por prop, no `headers()` → permite estático). `PdfViewer` robusto: timeout 20s, progreso real, DPR retina, cola de render serializada, cleanup del worker, polyfill `Promise.withResolvers`, re-render en resize/rotación. CTAs jerarquizados (reservar + agenda + reseña), redes con tap targets 44px.

---

## 12. SEO

`sitemap.ts`, `robots.ts`, `structured-data.ts` (schema `BarOrPub`+`TouristAttraction`) **existen**. Metadata OG por página con imágenes en `public/og/` (home, pub, agenda, museo, visitas, nosotros, default). `metadataBase` en el layout raíz. `/qr` con `robots: noindex`.

---

## 13. Trampas conocidas

- Soft-delete + UNIQUE → índice único parcial `where is_deleted=false`.
- Editar schema Zod no refresca el tipo en el editor → reiniciar TS server.
- `<script>` crudo en componente React no ejecuta → `next/script` con `strategy`.
- Unidades `em` en contenedor sin tamaño propio → se calculan contra el font-size heredado.
- Función/componente definido dos veces → JS usa el último; editás el muerto (pasó con `SelloDietario`).
- Botón de upload dentro de `<form>` necesita `type="button"` (si no, submitea y el widget no abre).
- `overflow-x-auto` en flex scroll no respeta padding-right → spacer `w-px` al final.
- Margen negativo (`-mt-*`) sobre bloque de varias filas puede esconder la primera fila bajo un `overflow-hidden` (pasó con los sellos del home).

---

## 14. Deuda técnica abierta

> **Ya cerrado/descartado (no reintroducir):** security headers, "agujero" de RLS, duplicaciones (grep limpio), spacing del home, mobile del admin, agenda móvil, sellos con `surface`, `fieldErrors` en drawers.

- **Enum `app_role` legacy** — dropear tras confirmar que no lo usa código ni columna.
- **`actions/uploads.ts`** con hardening = código muerto. Decidir: rutear por action o firmar el preset.
- **a11y (Lighthouse 91):** `aria-label` en `<div>`/`<span>` sin rol es prohibido — `role="img"` en `TipoIcon` o sacar el `aria-label` redundante de `AtributoBadges`.
- **Contraste** de micro-labels `text-[9px]` sobre imagen (ticker) bajo AA — revisar.
- **Logs UI:** exponer `record_id`/`table_name` en la tabla desktop (ya están en las cards móviles).

## 15. Post-brief (features)

- **Panel de roles superadmin** (decidido: arquitectura **A** allowlist + re-auth **B1** para SUPERADMIN, **B2** para el resto). Fases: SQL `admin_invitados` + trigger que lee la allowlist → actions solo-SUPERADMIN → `/admin/usuarios` gateada por rol → re-auth.
- **Audioguía V2** — subdominio `audioguia.`, misma mecánica QR (middleware ya enruta por hostname). Audios en Supabase Storage, no en `/public`.

## 16. Día D (deploy)

Dominio en Vercel + redirect 301, DNS de `vault.`/`qr.`/`audioguia.` **cuidando los MX de `beatmemo.com.ar`** (mail activo, no se toca). PDFs reales. Test de QR en el local. Verificar backups de Supabase y **probar una restauración**. Lighthouse de **producción en incógnito** (dev da métricas falsas).