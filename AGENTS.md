# AGENTS.md — Beatmemo

Documento de referencia para agentes de IA (Claude Code, Cursor, etc.) y para el equipo de desarrollo. Define **cómo está armado el proyecto, las reglas técnicas que no se negocian, y cómo debe comportarse un asistente que trabaje sobre este código.**

> Beatmemo es un pub-museo temático de los Beatles en Rosario, Argentina. La plataforma cubre: sitio público (`beatmemo.com.ar`), panel admin "El Motor" / vault (`vault.beatmemo.com.ar`), carta digital por QR (`qr.beatmemo.com.ar`) y un proyecto de audioguía aparte.

---

## 1. Cómo debe comportarse un asistente en este repo

Estas reglas son de comportamiento, no de código. Aplican a cualquier IA que trabaje acá.

- **Crítica directa por sobre validación.** No darle la razón al desarrollador por defecto. Si una idea es buena, mejorarla y explicar por qué. Si es mala, ofrecer 2 alternativas mejores y explicar el porqué de cada una. El objetivo es la mejor decisión, no la aprobación.
- **No afirmar sobre el toolchain sin verificar.** Antes de afirmar cómo se comporta una librería, Next.js, Supabase o un build, mostrar el código o la fuente. Las afirmaciones "de memoria" sobre el stack han sido erróneas en el pasado; cuando no hay evidencia a mano, decirlo explícitamente.
- **Este documento tampoco es fuente de verdad.** Ver §13. Una afirmación del `AGENTS.md` que contradiga al código o a la DB está **vencida**, no vigente. Verificar antes de actuar sobre ella — ya pasó que una "deuda" documentada acá no existía y casi motiva una migración riesgosa.
- **Nunca pasar parches parciales de un archivo.** Entregar la función completa (con su declaración envolvente) o el archivo completo. Un fragmento sin su envoltorio, pegado por el usuario, rompe el build (ha pasado). Si es un archivo largo, entregarlo entero es más seguro que seis parches.
- **Trabajo en fases atómicas.** Prohibido entregar bloques monolíticos que unifiquen DB + backend + frontend de golpe. Fragmentar en fases que compilen y se prueben por separado (Fase 1: SQL/tipos → Fase 2: actions → Fase 3: UI). Reduce bugs en cascada.
- **Evaluación de trade-offs obligatoria.** Ante cada solución, exponer riesgos ocultos (penalización SEO, LCP/CLS, seguridad) para que la decisión de negocio sea informada.
- **Nada de datos inventados en el producto.** No mock data que simule shows/promos/menús inexistentes: un cliente puede viajar al local por algo falso. Usar ISR con `revalidate` o estados vacíos honestos con CTA de WhatsApp. Esto aplica también a estadísticas: un dato de terceros se atribuye al sector, no al local.
- **Revisar código del equipo antes de mergear.** Beatmemo integra código de un equipo paralelo. El asistente debe señalar divergencias de los patrones establecidos (abajo) antes de que se mergee.
- **Auditar de verdad, no con corazonadas.** Un `grep` de una sola palabra que puede matchear comentarios NO es una verificación (ver §8).

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
| **Zod** | v4 | Validación de todo input en el borde servidor (y resolver del form en cliente) |
| **react-hook-form** | — | Formularios del admin, con `zodResolver` compartiendo schema con el server |
| **Sonner** | — | Toasts de feedback |
| **pdfjs-dist** | — | Render de PDFs de la carta (`PdfViewer`) |
| **Vercel** | — | Deploy del sitio principal |

### Principios de arquitectura

- **RSC-first.** Toda consulta a la DB se resuelve en el servidor. Prohibido armar arquitecturas pesadas en cliente por defecto.
- **Server wrapper + client view.** Cuando un componente necesita datos del server *y* animación de cliente, se parte en dos: un server component que hace el fetch y un `"use client"` que recibe props y anima. **Nunca** un `await` de fetch dentro de un módulo `"use client"` (bug real ya corregido en `HeroSection`). Referencias: `HeroSection`/`HeroSectionView`, `VisitasGuiadasPage`/`VisitasGuiadasView`, `Pub`/`PubUI`.
- **Estado en la URL, no en `useState` alto.** Filtros y paginación (menú del pub, meses de cartelera) usan URL Search Params, no estado local en componentes de alta jerarquía. Motivo: SEO local (indexable) + estado compartible.
- **Filtrado en la capa de datos.** Los filtros se inyectan como cláusulas en la query de Postgres, no se traen arrays masivos para filtrar en el navegador. Ahorra ancho de banda y memoria en móviles de gama baja.
- **ISR sobre `useEffect`.** Preferir `revalidate` a fetching client-side. Ver §6 sobre el cliente público.
- **Mobile-first riguroso.** Diseñar la experiencia vertical antes que la grilla desktop.

---

## 3. Branding y sistema de diseño

Fuente de verdad: `src/app/globals.css` (bloque `@theme`). **Nunca hardcodear un hex; usar la CSS var / clase Tailwind.**

### Reglas de diseño no negociables

- **Nunca `#000000` puro.** Es un anti-patrón de accesibilidad: halación en lectores con astigmatismo y smearing en OLED. Usar el near-black de marca (`brand-black-100`).
- **Ritmo editorial asimétrico.** Alternar disposición de texto y multimedia (Z-pattern) para romper la monotonía del scroll. Evitar "muros de cards" — dos grillas de cards apiladas leen como catálogo, no como editorial.
- **Contraste por sección, no gris intermedio.** Franjas oscuras (shows, museo) alternando con crema (`#FAF7F2`, gastronomía). Las zonas grises cansan la vista.
- **Micro-interacciones sutiles y con significado.** Bordes condicionales, puntos `animate-pulse` para estados vivos. El diseño habla solo; no agregar textos explicativos redundantes.
- **Toda animación respeta `prefers-reduced-motion`** (WCAG 2.2.2). Animar por `transform`/`opacity` únicamente (nunca propiedades que disparen layout). Reservar altura para mantener CLS en 0.
- **Nunca auto-scrollear el viewport.** Para invitar al scroll: animar el *indicador*, no la página. Mover el viewport solo desorienta, pelea con el gesto del usuario y marea. Patrón correcto: chevron animado + "peek" de contenido real asomando sobre el fold.

---

## 4. Seguridad

### Estado verificado (auditoría completa)

- **Security headers: IMPLEMENTADOS** en `next.config.ts` — CSP en modo enforce, `X-Frame-Options: SAMEORIGIN`, `X-Content-Type-Options: nosniff`, `Referrer-Policy`, `Permissions-Policy`, HSTS (2 años, `includeSubDomains; preload` — activo recién con los certificados de Vercel).
- **RLS: correcta.** Todas las policies de escritura chequean rol vía `get_auth_role()` (o `EXISTS(user_roles…)` en `promociones`). Una request con la anon key evalúa `get_auth_role() → null` y es **denegada**. La RLS **sí** es una barrera real, en conjunto con `guardAction`.
- **`get_auth_role()` es Database-First** (`SECURITY DEFINER`, `SET search_path TO 'public'`, `select role from user_roles where user_id = auth.uid()`). **No** lee el JWT → sin riesgo de claims stale.
- **Rate limiting: cobertura completa.** Todas las mutaciones entran por `guardAction`, que aplica `check_rate_limit` antes de la query de rol. No existen endpoints públicos de mutación (reservas → WhatsApp; visitas de escuelas → Calendly).
- **`admin_logs` INSERT: atado a `auth.uid()`** — un usuario solo puede insertar filas cuyo `admin_id` sea su propio uid. Impide forjar entradas atribuidas a otro admin. Permite igual el logueo de intentos `UNAUTHORIZED_*` y de `LOGIN_SUCCESS`.
- **Sin policies basadas en JWT.** Se dropeó la SELECT duplicada de `admin_logs` que leía `auth.jwt() ->> 'role'`: como las policies permisivas se combinan con OR, permitía a un SUPERADMIN degradado seguir leyendo el trail hasta refrescar el token.

### Hardening de inputs y archivos

- **Validación por magic bytes, nunca `file.type`.** Imágenes (JPEG/PNG/WEBP) y PDFs (`%PDF`) se validan inspeccionando los primeros bytes del buffer. El `Content-Type` del navegador no es evidencia.
- **Allowlist de carpetas en runtime** para uploads a Cloudinary (el tipado de TS no existe en runtime → tampering posible). Rechazar destino inválido, no caer a un default silencioso.
- **Anti parameter-tampering:** todo `?param` que seleccione contenido (`?tipo=`) cae a un default seguro si no matchea, nunca rompe la página.
- **Slugs sanitizados** (`[^a-z0-9-]` removido) antes de usarlos como path de Storage → previene path traversal.
- **Soft deletes:** las lecturas usan `.eq("is_deleted", false)` (NO `.neq("is_deleted", true)`). El borrado marca la fila, no la destruye.
- **Auditoría:** `logAdminAction(action, tableName, adminId, metadata, recordId)`. Toda mutación de contenido público deja rastro de quién/qué. El insert es `await`, no fire-and-forget (en serverless una promesa pendiente muere al congelarse la lambda).
- **XSS en campos libres editables:** si el texto se renderiza como **text node** de React, React lo escapa solo — no hace falta sanitizer. Solo se requiere sanitización si algún día se usa `dangerouslySetInnerHTML`.

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

- **`user_roles`** — autorización. `user_id` (uuid), `role` (enum `user_role`, default `VISITOR`).
- **`eventos`** — shows/cartelera. `titulo`, `descripcion`, `fecha` (date), `hora` (time, default `21:00`), `precio` (numeric, default 0), `es_gratuito` (bool), `url_imagen`, `integrantes`, `tipo` (text, default `'Show'`), `ciclo_id` (FK→ciclos, nullable), `is_deleted`. Borrado hard (SUPERADMIN) o soft (CM) vía RPC `handle_delete_show`.
- **`ciclos`** — agrupadores de eventos (Noche de Jazz, etc.). `nombre`, `tipo`, `estilo_tema` (default `'gold'`), `activo`. **Hoy solo se crean por SQL; no hay CRUD** (deuda).
- **`pub`** — items de gastronomía. Atributos boolean (`es_vegetariano`, `es_vegano`, `es_sin_tacc`, `es_nuevo`, `es_recomendado`), visibilidad (`destacado_home`, `hero_destacado`, `disponible`), `categoria` (text — matchea contra `pub_chips.nombre`), `tags` (text[], máx. 3), `orden` (int), `is_deleted`. **No tiene columna `precio`** — los destacados del home se muestran con nombre + badges, nunca con precio.
- **`pub_chips`** — categorías/chips de gastronomía. Solo `nombre`.
- **`menus`** — cartas en PDF. `tipo` (slug), `nombre`, `url_archivo`, `version` (bigint, auto-bump por trigger `bump_menu_version`), `orden`, `activo`, `is_deleted`.
- **`promociones`** — promos del home (banco/fecha_especial/local). Ver §11. **Reemplaza a la vieja `promo_banners`, eliminada.**
- **`site_content`** — contenido editable por sección, keyed por `clave`. Campos: `titulo`, `subtitulo`, `cuerpo`, `cta_mostrar`, `cta_texto`, `cta_link`, `imagen_url`. Ver §12.
- **`config_sitio`** — singleton (`id = 1`). Contacto, horarios (jsonb), redes, banner, `rooftop_url`, **`museo_visitas` (jsonb)**. Ver §12.
- **`admin_logs`** — trail de auditoría. `admin_id`, `action_type`, `table_name`, `record_id` (text), `metadata` (jsonb), `created_at`.
- **`rate_limits`** — contadores de rate limiting. `key` (PK), `count`, `window_start`.
- **`system_errors`** — errores persistidos. `error_message`, `stack_trace`, `user_id`, `resolved`, `dedup_key`.

### Enums

- **`user_role`** (vigente): `SUPERADMIN`, `CM`, `VISITOR`.
- **`app_role`** (LEGACY, NO USAR): `SUPER_ADMIN`, `CONTENT_ADMIN`. Existe en la DB pero la app no debe leerlo. `CONTENT_ADMIN` es el "rol fantasma". **Deuda: confirmar que ninguna función activa lo lee y eliminarlo.**

### Funciones / RPCs

- `check_rate_limit(p_key, p_limit, p_window_secs)` → record. Rate limiting atómico.
- `handle_delete_show(show_id, user_role)` → void. Borrado soft/hard según rol.
- `log_system_error(p_message, p_stack, p_dedup_key)` → bool. Logueo no bloqueante con dedup.
- `get_auth_role()` → user_role. **Database-First**, `SECURITY DEFINER` con `search_path` fijado.
- `custom_access_token_hook(jsonb)` → jsonb. Inyecta claims en el JWT.
- **Triggers:** `bump_menu_version`, `handle_new_auth_user`, `sync_role_to_jwt_claims`, `update_modified_column` / `touch_*`.

### Cómo regenerar esta sección

Correr en el SQL Editor los queries de introspección (tablas+columnas, rutinas, enums, `pg_policies`) y actualizar. Este bloque es una foto, no un contrato.

---

## 6. Patrones de datos

### Cliente público vs. cliente con sesión

- **`lib/supabase/public.ts` (`publicClient`)** — cliente anónimo, NO lee cookies. Para lecturas públicas (home, `/pub`, `/agenda`). Permite ISR: `cookies()` fuerza render dinámico y mata el cache.
- **`lib/supabase/server.ts` (`createClient`)** — con sesión, para rutas admin y mutaciones (vía `guardAction`).
- **Prohibido** usar `publicClient` en mutaciones o rutas admin.

### Orden total en lecturas SSR (CRÍTICO)

**Toda lista que se renderiza en el servidor necesita un desempate único final (`.order("id")`).** Postgres no garantiza el orden de filas empatadas; sin orden total, el HTML cacheado (ISR) y el payload de hidratación pueden traer los items en distinto orden → hydration mismatch. Aplicado en: `Pub.tsx`, `getPubFacetas`, `getWhiskies`, `getEspacioFotos`, `getShowsByView`, `getUpcomingShows`, `getCulturalEvents`. **Importa aún más cuando hay `.limit()`**: sin orden total, qué filas caen dentro del corte es indefinido.

### Hydration: nada no-determinista en el cliente

`Date.now()`, `Math.random()` y los shuffles **van en el server component**, que serializa el resultado; el cliente queda puramente presentacional. Un `seededShuffle` con semilla derivada de `Date.now()` dentro de un `useMemo` de cliente **no es determinista**: server y cliente pueden caer en ventanas distintas. Es un bug intermitente que aparece recién en producción con ISR (caso real: el flip de íconos en el bento del pub).

### FormData: qué se manda y qué se omite

- Al serializar un form a FormData, **solo omitir `undefined`**. `""` y `null` significan "el usuario lo vació a propósito" → deben llegar al server.
- Campos opcionales que deben poder vaciarse: usar `.default("")` en Zod, **no `.optional()`**.
- Precios/números que pueden venir vacíos: `z.preprocess` para mapear `""` → `null` antes de `z.coerce.number()`.
- **Campos que se serializan a mano** (jsonb como `horarios`, `museo_visitas`) necesitan su `formData.set(...)` explícito en `handleSubmit`, **antes del `await`**. Si falta, Zod devuelve "expected object, received undefined". No relajar el schema para tolerarlo: que falle fuerte es la señal.

### ISR y timezone

- Usar `export const revalidate = N` en páginas públicas.
- **Argentina (`America/Argentina/Buenos_Aires`) se aplica explícitamente.** Nunca confiar en la hora local del cliente ni en UTC.
- `fecha`/`hora` de `eventos` son wall-clock AR: **no reconvertir zona al formatear**, solo formatear literal.
- No `select("*")` en queries public-facing: listar columnas explícitas.

---

## 7. Server Actions — reglas de compilación y runtime

- **Un archivo `"use server"` solo exporta funciones `async`.** Prohibido cualquier `export ... from` o re-export de un binding importado. Tipos compartidos viven en `lib/` (ej: `ActionResponse` en `lib/guard.ts`).
- **Toda mutación arranca con `guardAction`.** No duplicar la lógica de sesión+rol+log inline.
- **Cascada obligatoria:** cuando un valor cruza schema/action/UI/validación, las cuatro capas se actualizan juntas. Caso real: agregar una clave a `site_content` requiere seed SQL **y** sumarla al `z.enum` de `lib/validations/site-content.ts` — sin eso, el guardado falla en runtime aunque compile.
- **`bodySizeLimit`** va dentro de `experimental.serverActions` en `next.config.ts`.

### Server Actions llamadas desde el cliente

- **Todo `await` a una action desde un componente cliente va en `try/catch`.** Una action puede **rechazar la promesa**, no solo devolver `{ success: false }`.
- Si el handler maneja un flag de loading propio, el reset va en **`finally`**.
- Mostrar `response.error || "<fallback>"`: nunca un `toast.error(undefined)`.

---

## 8. Verificación y auditoría

- **Un `grep` de una sola palabra NO audita.** Usar el patrón exacto (`grep -n "} finally {"`) o contexto (`grep -A2 -B2`).
- **No confiar en números de línea para deducir lógica.** Leer la función, no inferirla de su longitud.
- **No confiar en el stack trace de Turbopack para atribuir un error.** Ha señalado archivos que no eran la causa (caso real: un mismatch de hidratación atribuido a `SellosAccesibilidad.tsx`, que era un server component estático inocente).
- **Verificar la DB contra la DB, no contra la doc.** `pg_policies`, `pg_get_functiondef` — no la memoria ni este archivo.
- Al migrar un patrón, aplicarlo a **todas** las instancias. Arreglar 1 de 3 es cómo se cuelan las divergencias.

---

## 9. Documentos internos

- `AGENTS.md` (este archivo) y `CLAUDE.md` viven en la raíz del repo. Exponen el workflow de IA — mantenerlos fuera de deploys públicos si es una preocupación (severidad baja).
- Documentación funcional en Notion (6 documentos): Catálogo de Assets, Manual del Panel, Puesta en Marcha, Modelo de Datos, Arquitectura del Sistema, Despliegue/Día D.

---

## 10. Home — arquitectura de la página (rediseño completo)

**Orden de secciones:** hero → sellos de accesibilidad → chevron → agenda (shows) → pub → promos → museo.

Racional del orden: el gancho emocional (shows) va antes que lo transaccional (promos). Abrir con promos front-loadea lo comercial antes de que la marca impacte y lee como publicidad; enterrarlas al final desperdicia la palanca. Van después del pub, cuando el usuario ya está enganchado.

### Hero (`HeroSection` + `HeroSectionView`)

- **Server wrapper** hace un único `Promise.all`: `site_content("home_hero")` + `getUpcomingShows()` + `getSiteConfig()` + promos activas. Arma los items del ticker y los pasa por props.
- **Dirección visual "A+C":** Ken Burns + crossfade de imágenes, grano fílmico, barrido de luz dorada, palabra rotativa ("DESCUBRÍ el pub / los shows / nuestro museo") y ticker vivo.
- **La rotación es solo visual, sin links.** Decisión de UX: un target que se mueve bajo el cursor produce misclicks (anti-patrón de carrusel).
- **Altura 60vh** — deliberadamente baja para que el contenido de abajo asome sobre el fold ("peek").
- **Sin CTA en el hero.** La conversión la toma el FAB de WhatsApp, que aparece al scrollear. Mantiene el hero limpio y entrega la reserva cuando ya se formó la intención.
- **Ticker:** un solo show (el de hoy si hay, si no el más próximo) + free tour del museo + promos vigentes. `LIVE TODAY` solo para el show de hoy. La entrada del free tour siempre está presente → el ticker nunca queda vacío sin recurrir a mock. Pausa en hover.
- **LCP/CLS:** primera imagen con `priority`, resto lazy; altura reservada; todo por `transform`/`opacity`.

### Agenda del home (`AgendaPreview`)

- **Desktop:** acordeón horizontal de 5 shows con hover-expand. El destacado (fecha más cercana) arranca **expandido**, así siempre hay un "Reservar" visible — esconder el CTA detrás del hover mata conversiones.
- **Mobile:** acordeón vertical (tap expande y muestra Reservar; segundo tap abre el `EventoModal`). Reemplazó al carrusel.
- **`LIVE TODAY`** en la card del show de hoy (calculado en TZ AR). Colapsada muestra solo el punto pulsante inline con la fecha corta; expandida, el badge completo. Motivo: con la card colapsada a ~1/5 del ancho, el badge y la fecha larga colisionan.
- El click en la card expandida abre el **mismo `EventoModal`** que `/agenda` — no un componente primo.

### FAB de WhatsApp

Reveal-on-scroll **solo en el home** (aparece pasado el 70% del viewport); en el resto del sitio, siempre visible. `usePathname()` corre en SSR, así que el HTML inicial ya sale oculto en el home → sin flash.

### Pestañas de `/agenda`

Los `<Link>` de las tabs llevan **`scroll={false}`**. Sin eso, Next scrollea al top en cada cambio de pestaña y obliga al usuario a bajar de nuevo.

---

## 11. Sistema de promociones — IMPLEMENTADO

- Tabla **`promociones`**. Tres tipos vía campo `tipo`: `banco`, `fecha_especial`, `local`.
- **No hay página `/promos`.** Viven en una sección del home (bajo el pub). SEO con microdata `schema.org/Offer` inline.
- **Vigencia híbrida:** `activo = true` Y (sin fechas O hoy dentro del rango) Y (sin `dias_semana` O hoy coincide). Lógica en `lib/promo-helpers.ts` (`isPromoVigente`), NO en RLS. **Fuente única** — el ticker del hero la reusa.
- **`dias_semana`** ISO: 1=lunes … 7=domingo. NULL = todos los días. Se evalúa en TZ AR.
- **Se muestran TODAS las activas**, vigentes o no. Las no vigentes atenuadas con badge "Vuelve los martes". El badge vive **fuera** del wrapper atenuado (si no, el `saturate`/`opacity` lo vuelve ilegible).
- **Dos ramas visuales** (`PromoCard`): con `imagen_url` → card-foto oscura; sin imagen → card-clara (fondo `#F5F1E8`). La rama clara existe porque los logos de banco están diseñados para fondo blanco.
- **El drawer condiciona el asset por tipo:** `banco` → solo logo; resto → solo imagen. Al cambiar de tipo se limpia el campo irrelevante.
- **Vencimiento:** "Hasta el 14/2" solo si vence dentro de 30 días. Más lejos = ruido.
- El admin reusa `PromoCard` con `preview` — imposible que diverja del home.

---

## 12. Contenido editable — `site_content` y `config_sitio`

### `site_content` (texto por sección)

Claves vigentes: `home_pub`, `home_museo`, `pub`, `museo`, `agenda`, `pub_*` (varias). `home_hero` está **sembrada y en el enum pero NO expuesta en el panel**: el hero no usa los campos de imagen/CTA del form genérico, y exponer un editable a medias confunde. Se activa cuando exista un panel de hero dedicado.

**Patrón:** el componente público lee con `getSiteContent(clave)` y **cae al texto hardcodeado actual** si la fila viene vacía. Permite migrar sin riesgo visual.

**Al agregar una clave:** seed SQL + `RUTA_POR_CLAVE` en la action + `.in([...])` de la página admin + `NOMBRE_PAGINA`/`orden` en `ContenidoClient` + **el `z.enum` de `lib/validations/site-content.ts`** (el enum es anti-tampering: impide escribir en claves arbitrarias).

### `config_sitio.museo_visitas` (jsonb)

Un solo campo jsonb (se lee entero, nunca se consulta adentro → columnas discretas serían over-engineering):

```json
{
  "guia_gratuita": { "dia": "Domingos", "hora": "11:00", "nota": "Sin reserva previa." },
  "escuelas": {
    "reservas_modo": "activas" | "mensaje",
    "mensaje": "…",
    "mostrar_whatsapp": true,
    "idiomas_nota": "Disponible en Inglés y Español."
  }
}
```

**`reservas_modo` es un toggle que propaga a tres superficies simultáneamente** (home `MuseumPreview`, `/museo`, `/museo/visitas-guiadas`) vía el componente compartido `EscuelasAviso`. En `activas` se muestra el Calendly; en `mensaje` se ocultan el selector de idioma y el iframe, y aparece el aviso editable + CTA de WhatsApp. Motivo de negocio: fuera de temporada no se toman reservas de escuelas, y el visitante no debe navegar hasta `/museo/visitas-guiadas` para enterarse.

Zod valida el shape y **bloquea `modo = mensaje` con `mensaje` vacío** (un aviso en blanco en la cara del visitante).

---

## 13. Trampas conocidas del stack

- **Soft-delete + constraint UNIQUE:** usar **índice único parcial**: `create unique index ... where is_deleted = false`. Aplicado en `menus.tipo`.
- **Zod v4:** `z.url()` / `z.email()` son top-level; en issues custom va `code: "custom"` como string; el mensaje de un enum va en `error:`.
- **Editar un schema Zod no refresca el tipo inferido en el editor.** Si TS dice que un campo recién agregado "no existe" pero el runtime ya lo valida, es cache del language server → reiniciar el TS server.
- **`<script>` crudo en un componente React no ejecuta.** Usar `next/script` con la `strategy` adecuada (`beforeInteractive` para lo que debe correr antes de hidratar). El JSON-LD (`type="application/ld+json"`) es data, no script ejecutable, pero conviene el mismo tratamiento.
- **Drawers y estado arrastrado:** pasar `key={editing?.id ?? "new"}` **y** limpiar el estado en `onClose`.
- **`reset()` con datos de la DB:** mapear TODOS los campos nullable a `""` (`campo ?? ""`).
- **Array de dependencias de `useEffect`:** no puede cambiar de tamaño entre renders.
- **Layout flex anidado:** un `<div className="flex">` sin `w-full`/`flex-1` dentro de otro flex colapsa a su contenido.
- **Unidades `em` en contenedores sin tamaño propio:** un `h-[1.5em]` se calcula contra el font-size **heredado**, no contra el del hijo. Si el hijo es más grande, lo recorta. Fijar el tamaño también en el contenedor.
- **`.nip.io` en dev:** Tailwind v4 + Turbopack servido a una IP externa puede entregar CSS incompleto. No es bug de código.
- **Uploads:** todos usan `CldUploadWidget` con preset unsigned. `actions/uploads.ts` (con magic bytes + guard) es **código muerto**.

---

## 14. Deuda técnica abierta

> Los ítems de "security headers ausentes" y "RLS de escritura abierta a `{public}`" fueron **verificados y descartados**: ambos están resueltos/eran incorrectos. No reintroducirlos.

**Seguridad**
- Enum `app_role` legacy (`SUPER_ADMIN`/`CONTENT_ADMIN`) sigue en la DB. Confirmar que ninguna función lo lee y eliminarlo.
- Preset de Cloudinary unsigned y visible en el bundle; `actions/uploads.ts` con todo su hardening es código muerto. Decidir: rutear uploads por server action, o firmar el preset.
- Callback OAuth: registrar con subdominio sobre `.com.ar`, no `.com`.
- Residual menor: un autenticado puede auto-insertar filas en `admin_logs` tagueadas con su propio uid (no puede forjar las de otro). Cierre máximo = escribir el trail vía RPC `SECURITY DEFINER` o service-role.

**Performance (prioridad alta)**
- **`shows.ts` usa el cliente con cookies** (`createClient`) en vez de `publicClient`. Esto fuerza render dinámico y **bloquea el ISR del home** — agravado ahora que `HeroSection` llama a `getUpcomingShows()`: el hero entero, que es el LCP, quedó dinámico. Migrar a `publicClient`.
- Faltan índices en `eventos` (`fecha` + `is_deleted`) y `pub` (`destacado_home` + `disponible` + `is_deleted`).

**UX / accesibilidad**
- Advertencia de borrado en `EventDrawer`: dice "no se puede deshacer" para todos, pero es hard-delete solo para SUPERADMIN. Hacerla role-aware o decir la verdad del peor caso.
- `fieldErrors` de Zod se descarta en los 4 drawers: el server rechaza y aparece "revisá los campos" sin campo marcado.
- Sidebar `isActive` usa igualdad exacta; con el rewrite de subdominio el resaltado falla. Usar `startsWith`.
- Sellos de accesibilidad: solo la tira del home y el bloque del footer. Falta distribuirlos en páginas internas.

**Features**
- `tags` en `pub`: límite de 3 aplicado en carga; falta render en el sitio público.
- `ciclos` solo se crean por SQL; falta CRUD en el admin.
- Logs UI: paginación server-side, filtros por URL (acción/email/fecha), exponer `record_id` y `table_name`.
- Panel superadmin: gestión de chips del pub, CRUD de ciclos, promoción de roles.
- Banners: decidir schema (si `promo_banners` cubre imágenes del hero), luego CRUD y conexión pública.
- Audioguía: schema SQL (falta columna `idioma` en el modelo implícito de `tracks`), integrar 17 tracks reales. Hoy corre en stack separado (`dc-94.github.io/audioguia/`). Al migrar: audios en **Supabase Storage**, no en `/public`; MP3 mono ~96kbps + `preload="none"`.
- `MenuDrawer` usa `useState` en vez de react-hook-form. **Decisión consciente**, no migrar sin razón fuerte.

**Pre-deploy**
- `sitemap.xml` y metadata OG por página (`robots.ts` ya existe).
- Verificar alineación de `SITE_URL` y declaración de canonical.
- Monitoreo real de `system_errors`: hoy se acumulan filas y nadie las mira. Falta alerta.
- Verificar backups de Supabase activos y **probar una restauración**.
- Día D: dominio en Vercel con redirect 301, DNS de `vault.` y `qr.`, cargar PDFs reales de las cartas, test de QR en el local, y **cambiar la URL del proveedor al final**. Restricción crítica: el email activo corre sobre `beatmemo.com.ar` — los registros MX no se tocan.