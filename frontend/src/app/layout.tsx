import { Providers } from "@/providers/Providers";
import { Toaster } from "sonner";
import { ClientAuthBootstrap } from "@/components/auth/client-auth-bootstrap";

import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

import "./globals.css";
import { CategorySection } from "@/features/category/components/CategorySection";

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="vi">
      <body>
        <Providers>
          <ClientAuthBootstrap />

          <Header />
          <CategorySection />
          <main>{children}</main>

          <Footer />

          <Toaster position="top-right" />
        </Providers>
      </body>
    </html>
  );
}
