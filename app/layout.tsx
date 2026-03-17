import type { Metadata } from "next";
import "./scss/global.scss";
import Header from "./components/header";

export const metadata: Metadata = {
  title: "E-YURT",
  description: "Basit bir okul projesi",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr">
      <body>
        <Header />
        {children}
      </body>
    </html>
  );
}
