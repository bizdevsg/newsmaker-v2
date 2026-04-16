import type { Metadata } from "next";
import { Roboto } from "next/font/google";
import "../../node_modules/@fortawesome/fontawesome-free/css/all.min.css";
import "./globals.css";
import { cookies } from "next/headers";
import { LoadingProvider } from "@/components/providers/LoadingProvider";

const roboto = Roboto({
  subsets: ["latin"],
  weight: ["100", "300", "400", "500", "700", "900"],
  variable: "--font-roboto",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Newsmaker 23",
    template: "News Maker 23 - %s",
  },
  description: "Institutional market dashboard mockup",
  icons: {
    icon: [
      { url: "/assets/favicon.png", type: "image/png" },
      { url: "/icon.png", type: "image/png" },
    ],
    shortcut: ["/assets/favicon.png"],
    apple: [{ url: "/assets/favicon.png", type: "image/png" }],
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const locale = cookieStore.get("NEXT_LOCALE")?.value ?? "id";

  return (
    <html lang={locale}>
      <body
        className={`${roboto.variable} antialiased`}
        suppressHydrationWarning
      >
        <LoadingProvider>{children}</LoadingProvider>
      </body>
    </html>
  );
}
