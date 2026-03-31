import type { Metadata } from "next";
import { Roboto } from "next/font/google";
import "../../node_modules/@fortawesome/fontawesome-free/css/all.min.css";
import "./globals.css";
import { cookies } from "next/headers";
import { LoadingProvider } from "@/components/providers/LoadingProvider";

const roboto = Roboto({
  variable: "--font-roboto",
  subsets: ["latin"],
  weight: ["300", "400", "500", "700"],
});

export const metadata: Metadata = {
  title: {
    default: "Newsmaker 23",
    template: "%s - Newsmaker 23",
  },
  description: "Institutional market dashboard mockup",
  icons: {
    icon: "/assets/favicon.png",
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
