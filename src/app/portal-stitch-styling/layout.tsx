import { Analytics } from "@vercel/analytics/next";

export default function PortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {/* Space-themed background */}
      <div className="starfield"></div>
      <div className="nebula-glow" style={{ top: '15%', left: '10%' }}></div>
      <div className="nebula-glow" style={{ bottom: '15%', right: '10%' }}></div>

      <div className="relative z-10">
        {children}
      </div>
      <Analytics />
    </>
  );
}
