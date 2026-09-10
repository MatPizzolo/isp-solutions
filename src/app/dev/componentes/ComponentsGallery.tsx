"use client";

import { useState } from "react";

import { ProductPlaceholder } from "@/components/store/ProductPlaceholder";
import { StoreProviders } from "@/components/store/StoreProviders";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { ChipButton } from "@/components/ui/Chip";
import { Drawer } from "@/components/ui/Drawer";
import { EmptyState } from "@/components/ui/EmptyState";
import { Input } from "@/components/ui/Input";
import { Price } from "@/components/ui/Price";
import { Skeleton } from "@/components/ui/Skeleton";
import { Table, Td, Th } from "@/components/ui/Table";
import { useToast } from "@/components/ui/Toast";
import { useSession } from "@/contexts/SessionContext";
import { formatARS } from "@/lib/format";
import type { CatalogItem, Promotion, Session } from "@/types";

const LUCIA: Session = {
  subscriberId: "sub-104588",
  name: "Lucía Ferreyra",
  planId: "fibra-300",
  tier: "base",
  validatedAt: Date.now(),
};

const MARTIN: Session = {
  subscriberId: "sub-098231",
  name: "Martín Solari",
  planId: "fibra-600-tv",
  tier: "premium",
  validatedAt: Date.now(),
};

export function ComponentsGallery({
  tenantId,
  activePromotions,
  items,
}: {
  tenantId: string;
  activePromotions: Promotion[];
  items: CatalogItem[];
}) {
  return (
    <StoreProviders tenantId={tenantId} activePromotions={activePromotions}>
      <Gallery items={items} />
    </StoreProviders>
  );
}

function Section({
  title,
  note,
  children,
}: {
  title: string;
  note?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="border-line border-t pt-6 pb-10">
      <h2 className="mb-1 text-[22px] font-semibold">{title}</h2>
      {note && <p className="text-muted mb-4 max-w-[62ch] text-[15px]">{note}</p>}
      <div className={note ? "" : "mt-4"}>{children}</div>
    </section>
  );
}

function Gallery({ items }: { items: CatalogItem[] }) {
  const { session, status, revealPhase, signIn, signOut } = useSession();
  const { notify } = useToast();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [dni, setDni] = useState("");
  const [sort, setSort] = useState("relevancia");

  return (
    <main className="mx-auto max-w-[1200px] px-4 py-10 md:py-14">
      <header className="mb-8">
        <p className="text-muted text-[13px]">Página de desarrollo</p>
        <h1 className="mt-1 text-[28px] leading-tight font-semibold md:text-[36px]">Componentes</h1>
      </header>

      <div className="bg-surface border-line rounded-base sticky top-4 z-10 mb-10 flex flex-wrap items-center gap-3 border px-4 py-3">
        <span className="text-[15px] font-medium">Simular sesión</span>
        <Button variant="secondary" onClick={() => signIn(LUCIA)}>
          Lucía · Fibra 300
        </Button>
        <Button variant="secondary" onClick={() => signIn(MARTIN)}>
          Martín · Fibra 600 + TV
        </Button>
        <Button variant="ghost" onClick={signOut}>
          Salir
        </Button>
        <span className="text-muted ml-auto text-[13px]">
          status: {status} · sesión: {session ? session.name : "ninguna"} · revelación:{" "}
          {revealPhase}
        </span>
      </div>

      <Section
        title="Price"
        note="Tres renglones siempre, en los cuatro estados. Tocá un botón de arriba y la cascada corre con la coreografía real: 40 ms por ítem, tope en el índice 9. El renglón de arriba está reservado y vacío sin sesión, así el precio tachado aparece sin mover nada."
      >
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
          {items.map((item, index) => (
            <div
              key={item.id}
              className="border-line rounded-base bg-surface overflow-hidden border"
            >
              <ProductPlaceholder
                itemId={item.id}
                category={item.category}
                className="aspect-4/3"
              />
              <div className="p-3">
                <p className="text-muted text-[13px]">{item.brand}</p>
                <p className="mb-2 min-h-[42px] text-[15px] leading-tight font-medium">
                  {item.name}
                </p>
                <Price item={item} revealIndex={index} size="sm" />
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 grid gap-6 md:grid-cols-3">
          {(["sm", "md", "lg"] as const).map((size) => {
            const item = items[0];
            if (!item) return null;
            return (
              <div key={size} className="border-line rounded-base border p-4">
                <p className="text-muted mb-2 text-[13px]">size={size}</p>
                <Price item={item} size={size} />
              </div>
            );
          })}
        </div>
      </Section>

      <Section
        title="Button"
        note="Una sola acción ámbar por pantalla. Si dos botones compiten por el acento, uno está mal."
      >
        <div className="flex flex-wrap items-center gap-3">
          <Button>Ver mi precio</Button>
          <Button variant="secondary">Seguir mirando</Button>
          <Button variant="ghost">Cancelar</Button>
          <Button variant="danger">Dar de baja</Button>
          <Button loading>Validando</Button>
          <Button disabled>Sin stock</Button>
          <Button size="lg">Confirmar y activar</Button>
        </div>
        <div className="bg-primary rounded-base mt-4 flex flex-wrap items-center gap-3 p-4">
          <span className="text-[15px] text-white">Sobre fondo primario:</span>
          <Button variant="onPrimary">Ver el cambio</Button>
        </div>
      </Section>

      <Section
        title="Input"
        note="Label real siempre, nunca el placeholder como etiqueta. El error no reemplaza el campo y conserva lo tipeado."
      >
        <div className="grid max-w-[720px] gap-5 md:grid-cols-2">
          <Input
            id="dni-normal"
            label="Ingresá tu DNI o número de cliente"
            hint="Sin puntos ni espacios"
            placeholder="30111222"
            size="lg"
            value={dni}
            onChange={(event) => setDni(event.target.value)}
          />
          <Input
            id="dni-error"
            label="Ingresá tu DNI o número de cliente"
            hint="Sin puntos ni espacios"
            defaultValue="35000111"
            size="lg"
            error="No encontramos ese DNI. Probá con tu número de cliente (está en tu factura)."
          />
        </div>
      </Section>

      <Section title="Badge y Chip">
        <div className="flex flex-wrap items-center gap-3">
          <Badge>Sin permanencia</Badge>
          <Badge tone="success">Activo</Badge>
          <Badge tone="included">Incluido en tu plan</Badge>
          <Badge tone="danger">Sin stock</Badge>
          <Badge tone="accent">Ahorrás {formatARS(2100)} por mes</Badge>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          {["relevancia", "precio-asc", "precio-desc", "ahorro"].map((key) => (
            <ChipButton key={key} active={sort === key} onClick={() => setSort(key)}>
              {key}
            </ChipButton>
          ))}
        </div>
      </Section>

      <Section title="Skeleton, EmptyState, Toast y Drawer">
        <div className="flex flex-col gap-3">
          <Skeleton className="h-3 w-40" />
          <Skeleton className="h-6 w-56" />
        </div>
        <div className="mt-6 max-w-[560px]">
          <EmptyState
            title="Todavía no sumaste ningún servicio"
            description="Cuando sumes uno, lo vas a ver acá con su fecha de activación y desde qué factura se cobra."
            action={<Button variant="secondary">Ver qué podés sumar</Button>}
          />
        </div>
        <div className="mt-6 flex flex-wrap gap-3">
          <Button variant="secondary" onClick={() => notify("Lo sumamos a tu carrito.")}>
            Toast de éxito
          </Button>
          <Button
            variant="secondary"
            onClick={() => notify("No pudimos guardar el logo.", "error")}
          >
            Toast de error
          </Button>
          <Button variant="secondary" onClick={() => setDrawerOpen(true)}>
            Abrir drawer
          </Button>
        </div>
      </Section>

      <Section title="Table" note="Filas de 44px, cifras a la derecha con ancho de dígito fijo.">
        <Table>
          <thead>
            <tr>
              <Th>Ítem</Th>
              <Th>Categoría</Th>
              <Th numeric>Lista</Th>
              <Th numeric>Cliente</Th>
            </tr>
          </thead>
          <tbody>
            {items.slice(0, 4).map((item) => (
              <tr key={item.id}>
                <Td>{item.name}</Td>
                <Td>{item.category}</Td>
                <Td numeric>
                  {formatARS(item.kind === "product" ? item.publicPrice : item.publicMonthlyPrice)}
                </Td>
                <Td numeric>
                  {formatARS(
                    item.kind === "product" ? item.exclusivePrice : item.exclusiveMonthlyPrice,
                  )}
                </Td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Section>

      <Section
        title="ProductPlaceholder"
        note="Cinco composiciones, una por familia de categoría, con variación derivada del id. Usan currentColor, así que se retematizan dentro de cualquier ámbito de marca."
      >
        <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
          {(["tv", "celular", "gaming", "seguridad-digital", "conectividad"] as const).map(
            (category) => (
              <div key={category} className="border-line rounded-base overflow-hidden border">
                <ProductPlaceholder
                  itemId={`demo-${category}`}
                  category={category}
                  className="aspect-4/3"
                />
                <p className="text-muted px-3 py-2 text-[13px]">{category}</p>
              </div>
            ),
          )}
        </div>
      </Section>

      <Drawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title="Tu carrito"
        footer={<Button fullWidth>Continuar</Button>}
      >
        <p className="text-[15px]">El drawer es una de las dos únicas piezas con sombra.</p>
      </Drawer>
    </main>
  );
}
