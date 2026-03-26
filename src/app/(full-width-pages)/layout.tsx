import "../globals.css";
import ReactQueryProvider from "@/providers/ReactQueryProvider";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body suppressHydrationWarning className="dark:bg-gray-900">
        <ReactQueryProvider>{children}</ReactQueryProvider>
      </body>
    </html>
  );
}