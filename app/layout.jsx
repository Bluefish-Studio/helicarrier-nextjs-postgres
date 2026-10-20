import "./style.css";

export const metadata = {
  title: "Launch board · Helicarrier example",
  description: "A small Next.js and PostgreSQL deployment example for Helicarrier.",
  robots: { index: false, follow: false },
};

export default function Layout({ children }) {
  return <html lang="en"><body>{children}</body></html>;
}
