import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Cartoonizer — AI Stylizer",
  description: "Stylize your photos into cartoons & art",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}