import "bootstrap/dist/css/bootstrap.min.css";
import "./globals.css";
import BootstrapClient from "@/components/BootstrapClient";

export const metadata = {
  title: "BKBS — Bright Kingdom British School",
  description:
    "Bright Kingdom British School Website. Profile, Result, Attendance and Announcement.",
  keywords: ["BKBS", "School", "Next.js", "Bootstrap", "Education"],
  authors: [{ name: "BKBS" }],
  openGraph: {
    title: "BKBS — Bright Kingdom British School",
    description: "Profile, Result, Attendance and Announcement",
    type: "website",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="container-fluid p-0">
        <BootstrapClient />
        {children}
      </body>
    </html>
  );
}
