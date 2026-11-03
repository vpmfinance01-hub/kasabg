import { Header, Footer } from "@/components/SiteChrome";
export default function SiteLayout({ children }) {
  return (
    <div className="site">
      <Header />
      <main>{children}</main>
      <Footer />
    </div>
  );
}
