import { ReactNode } from "react";
import { useLocation } from "react-router-dom";
import Navbar from "./Navbar";
import Footer from "./Footer";
import HeroWebGLBackground from "./HeroWebGLBackground";
import Chatbot from "./Chatbot";
import { useIsMobile } from "@/hooks/use-mobile";
import heroBgMain from "@/assets/heroBG-1.jpg";

const Layout = ({ children }: { children: ReactNode }) => {
  const { pathname } = useLocation();
  const isLookPage = pathname.startsWith("/look/");
  const isMobile = useIsMobile();

  return (
    <div className={`min-h-screen flex flex-col ${isLookPage ? "bg-background" : "bg-transparent"}`}>
      {!isLookPage && (
        <>
          <HeroWebGLBackground imageUrl={heroBgMain} isMobile={isMobile} fixed />
          <div className="fixed inset-0 z-[1] pointer-events-none bg-white/60" aria-hidden />
        </>
      )}
      <Navbar />
      <main className="flex-1 relative z-10">{children}</main>
      <Footer />
      <Chatbot />
    </div>
  );
};

export default Layout;
