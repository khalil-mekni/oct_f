import ReactQueryProvider from "@/providers/ReactQueryProvider";
import NotificationsPageClient from "./NotificationsPageClient";

export default function NotificationsPage() {
  return (
    <ReactQueryProvider>
      <NotificationsPageClient />
    </ReactQueryProvider>
  );
}