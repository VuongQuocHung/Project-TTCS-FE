import type { Metadata } from "next";
import { Header } from "@/app/components/header/Header";
import { Footer } from "@/app/components/footer/Footer";

export const metadata: Metadata = {
  title: "VPH STORE",
  description: "Project TTCS: Xây dựng website bán laptop của Vũ, Phúc, Hưng",
};

export default function MainLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" suppressHydrationWarning>
      <body>
        <Header />
        {children}
        <Footer />
      </body>
    </html>
  );
}
