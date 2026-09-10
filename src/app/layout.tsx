import type { Metadata } from "next";

import { fontClassNames } from "@/lib/fonts";
import { getTenant, themeStyle } from "@/lib/tenant";

import "./globals.css";

const tenant = getTenant();

export const metadata: Metadata = {
  title: {
    default: `Beneficios ${tenant.name}`,
    template: `%s · ${tenant.name}`,
  },
  description: tenant.storeCopy.heroSubtitle,
  icons: { icon: `/tenants/${tenant.id}/favicon.svg` },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    // Las variables de marca van en el atributo `style`, no en una etiqueta
    // <style>: no agrega un nodo al DOM, no necesita nonce de CSP, gana en
    // especificidad sobre cualquier regla de :root, y viaja en el primer byte
    // del HTML, así que no hay destello de tema sin aplicar.
    //
    // Las seis clases de next/font van juntas en <html> para que las seis
    // variables de fuente queden declaradas acá y se hereden a todo el árbol,
    // incluido el contenedor scoped del preview de marca.
    <html lang="es-AR" className={fontClassNames} style={themeStyle(tenant.theme)}>
      <body className="min-h-dvh antialiased">{children}</body>
    </html>
  );
}
