import "../globals.css";
import ReactQueryProvider from "@/providers/ReactQueryProvider";

export default function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <ReactQueryProvider>
        <div className="dark:bg-gray-900 min-h-screen">
          {children}
        </div>
      </ReactQueryProvider>
    </>
  );
}