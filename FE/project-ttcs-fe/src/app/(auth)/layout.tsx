import type { Metadata } from "next";


export const metadata: Metadata = {
  title: " Project TTCS",
  description: "Project TTCS: Xây dựng website bán laptop",
};

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" suppressHydrationWarning>
      <body>
        {children}
      </body>
    </html>
  );
}
