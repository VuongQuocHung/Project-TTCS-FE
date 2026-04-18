import type { Metadata } from "next";
import React from "react";
import { Header } from "@/app/components/header/Header";
import { Footer } from "@/app/components/footer/Footer";

export const metadata: Metadata = {
  title: "HĐP STORE",
  description: "Project TTCS: Xây dựng website bán laptop của Hưng, Đức, Phúc",
};

export default function MainLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <Header />
      {children}
      <Footer />
    </>
  );
}