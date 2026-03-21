import type { Metadata } from "next";
import { Header } from "./components/header/Header";
import { Footer } from "./components/footer/Footer";
import "./globals.css";


export const metadata: Metadata = {
  title: " Project TTCS",
  description: "Project TTCS: Xây dựng website bán laptop",
};

export default function RootLayout({
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
