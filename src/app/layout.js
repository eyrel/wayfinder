import "./globals.css";

export const metadata = {
  title: "Wayfinder — Changi transit assistant",
  description: "Wayfinding, flight enquiries and multilingual help for transit passengers at Changi Airport.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
