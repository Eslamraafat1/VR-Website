import SiteHeader from "@/components/site-header";
import SiteFooter from "@/components/site-footer";
import MobileDock from "@/components/mobile-dock";

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SiteHeader />
      <main id="main" className="min-h-screen pt-16 md:pt-20">{children}</main>
      <SiteFooter />
      <MobileDock />
    </>
  );
}
