import { notFound } from "next/navigation";

import { FONT_PRESETS } from "@/lib/fonts";
import { getAdminEmail, getTenant, resolveThemeVars, themeStyle } from "@/lib/tenant";
import type { Theme } from "@/types";

export const metadata = { title: "Tokens del tenant" };

/**
 * Página de desarrollo. No es UI de producto: existe para verificar que el
 * theming del tenant llega hasta las utilidades de Tailwind, y para poder ver
 * de un vistazo si un tenant nuevo quedó bien configurado.
 *
 * Es también la prueba visual de que el override scoped funciona, que es de lo
 * que depende el preview en vivo de /admin/marca.
 */
export default function TokensPage() {
  if (process.env.NODE_ENV === "production" && process.env.NEXT_PUBLIC_DEMO_MODE !== "true") {
    notFound();
  }

  const tenant = getTenant();
  const vars = resolveThemeVars(tenant.theme);
  const colorVars = Object.entries(vars).filter(([name]) => name.startsWith("--brand-"));

  // Mismo tenant con dos colores cambiados y otra tipografía. Todo lo que se
  // renderice adentro tiene que retematizarse solo, sin recibir una sola prop.
  const altTheme: Theme = {
    ...tenant.theme,
    colors: { ...tenant.theme.colors, primary: "#1F6F5C", accent: "#D64550" },
    fontPreset: "outfit-source",
    radius: "20px",
  };

  return (
    <main className="mx-auto max-w-[1200px] px-4 py-10 md:py-14">
      <header className="mb-10">
        <p className="text-muted text-[13px]">Página de desarrollo</p>
        <h1 className="mt-1 text-[28px] leading-tight font-semibold md:text-[36px]">
          Tokens de {tenant.name}
        </h1>
        <p className="text-muted mt-2 max-w-[62ch] text-[15px]">
          Todo lo que se ve acá sale de <code>tenant.json</code>. Ningún valor está escrito en un
          componente.
        </p>
      </header>

      <Section title="Identidad">
        <Rows
          rows={[
            ["id", tenant.id],
            ["name", tenant.name],
            ["legalName", tenant.legalName],
            ["tagline", tenant.tagline],
            ["orderPrefix", tenant.orderPrefix],
            ["website", tenant.website],
            ["abonados", tenant.subscribers.toLocaleString("es-AR")],
            ["usuario admin (derivado)", getAdminEmail(tenant)],
            ["plataforma", tenant.platformName],
          ]}
        />
      </Section>

      <Section title="Color">
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {colorVars
            .filter(([, value]) => value.startsWith("#"))
            .map(([name, value]) => (
              <li key={name} className="border-line rounded-base overflow-hidden border">
                <div className="h-16 w-full" style={{ backgroundColor: value }} />
                <div className="bg-surface px-3 py-2">
                  <code className="block text-[12px]">{name}</code>
                  <code className="text-muted block text-[12px] tabular-nums">{value}</code>
                </div>
              </li>
            ))}
        </ul>
      </Section>

      <Section title="Utilidades de Tailwind">
        <p className="text-muted mb-4 max-w-[62ch] text-[15px]">
          Si estas cajas toman el color del tenant, el mapeo de <code>@theme inline</code> está
          bien.
        </p>
        <div className="flex flex-wrap gap-3">
          <span className="bg-primary rounded-base px-4 py-2 text-[15px] text-white">
            bg-primary
          </span>
          <span className="bg-accent rounded-base text-ink px-4 py-2 text-[15px]">bg-accent</span>
          <span className="bg-surface border-line rounded-base border px-4 py-2 text-[15px]">
            bg-surface + border-line
          </span>
          <span className="text-muted bg-surface rounded-base px-4 py-2 text-[15px]">
            text-muted
          </span>
          <span className="rounded-base bg-success px-4 py-2 text-[15px] text-white">success</span>
          <span className="rounded-base bg-danger px-4 py-2 text-[15px] text-white">danger</span>
          <span className="bg-accent/15 text-ink rounded-base px-4 py-2 text-[15px]">
            bg-accent/15 (color-mix)
          </span>
        </div>
      </Section>

      <Section title="Tipografía">
        <Rows
          rows={[
            ["fontPreset", tenant.theme.fontPreset],
            ["preset", FONT_PRESETS[tenant.theme.fontPreset].label],
          ]}
        />
        <div className="mt-5 space-y-2">
          <p className="font-display text-[36px] leading-tight font-semibold">
            Títulos en font-display
          </p>
          <p className="font-sans max-w-[62ch] text-[17px]">
            Cuerpo en font-sans. La medida de línea se mantiene por debajo de los 75 caracteres para
            que el texto se lea sin esfuerzo.
          </p>
        </div>
        <div className="mt-6 flex flex-wrap items-baseline gap-x-5 gap-y-2">
          {[13, 15, 17, 22, 28, 36, 48].map((size) => (
            <span key={size} style={{ fontSize: `${size}px` }} className="font-display">
              {size}
            </span>
          ))}
        </div>
      </Section>

      <Section title="Radio">
        <div className="flex flex-wrap gap-3">
          <span className="bg-surface border-line rounded-base border px-4 py-3 text-[15px]">
            rounded-base ({tenant.theme.radius})
          </span>
          <span className="bg-surface border-line rounded-sm border px-4 py-3 text-[15px]">
            rounded-sm ({tenant.theme.radiusSm})
          </span>
        </div>
      </Section>

      <Section title="Planes y beneficios">
        <Rows
          rows={[
            ...tenant.plans.map(
              (plan) => [plan.id, `${plan.name} · ${plan.speedMbps} Mbps · ${plan.tier}`] as const,
            ),
            ["descuento premium", `${tenant.benefits.premiumDiscount * 100}%`],
            ["envío gratis desde", tenant.benefits.freeShippingFrom.toLocaleString("es-AR")],
            ["cuotas sin interés", String(tenant.benefits.installmentsWithoutInterest)],
          ]}
        />
      </Section>

      <Section title="Reparto de ingresos">
        <Rows
          rows={(
            [
              ["products", tenant.revenueShare.products],
              ["services", tenant.revenueShare.services],
              ["planUpgrades", tenant.revenueShare.planUpgrades],
            ] as const
          ).map(
            ([name, split]) =>
              [name, `ISP ${split.isp * 100}% · plataforma ${split.platform * 100}%`] as const,
          )}
        />
        <p className="text-muted mt-3 max-w-[62ch] text-[15px]">
          En <code>planUpgrades</code> la plataforma va en cero: el proveedor es el propio ISP, así
          que cobrarle ahí sería cobrarle por vender lo suyo.
        </p>
      </Section>

      <Section title="Override scoped">
        <p className="text-muted mb-4 max-w-[62ch] text-[15px]">
          El bloque de abajo es el <em>mismo</em> marcado, dentro de un contenedor con otras
          variables de marca. No recibe ninguna prop. Si se retematiza solo, el preview en vivo del
          editor de marca va a funcionar.
        </p>
        <div
          data-brand-scope
          style={themeStyle(altTheme)}
          className="bg-background border-line rounded-base border p-5"
        >
          <p className="font-display text-ink mb-3 text-[22px] font-semibold">
            Otro tenant, mismo componente
          </p>
          <div className="flex flex-wrap gap-3">
            <span className="bg-primary rounded-base px-4 py-2 text-[15px] text-white">
              bg-primary
            </span>
            <span className="bg-accent rounded-base px-4 py-2 text-[15px] text-white">
              bg-accent
            </span>
            <span className="bg-surface border-line rounded-base border px-4 py-2 text-[15px]">
              bg-surface
            </span>
          </div>
        </div>
      </Section>
    </main>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="border-line mb-10 border-t pt-6">
      <h2 className="mb-4 text-[22px] font-semibold">{title}</h2>
      {children}
    </section>
  );
}

function Rows({ rows }: { rows: readonly (readonly [string, string])[] }) {
  return (
    <dl className="border-line bg-surface rounded-base overflow-hidden border">
      {rows.map(([label, value], index) => (
        <div
          key={label}
          className={`flex flex-wrap gap-x-4 gap-y-1 px-4 py-2.5 text-[15px] ${
            index > 0 ? "border-line border-t" : ""
          }`}
        >
          <dt className="text-muted min-w-[200px]">{label}</dt>
          <dd className="tabular-nums">{value}</dd>
        </div>
      ))}
    </dl>
  );
}
