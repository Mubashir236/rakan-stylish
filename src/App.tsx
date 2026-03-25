import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "next-themes";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Services from "./pages/Services";
import Education from "./pages/Education";
import Membership from "./pages/Membership";
import Booking from "./pages/Booking";
import CollectionGrid from "./pages/CollectionGrid";
import NotFound from "./pages/NotFound";
import AdminPortal from "./pages/AdminPortal";
import PaymentSuccess from "./pages/PaymentSuccess";

const App = () => (
  <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/services" element={<Services />} />
          <Route path="/education" element={<Education />} />
          <Route path="/membership" element={<Membership />} />
          <Route path="/booking" element={<Booking />} />
          <Route path="/payment-success" element={<PaymentSuccess />} />
          <Route path="/admin" element={<AdminPortal />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </ThemeProvider>
);

export default App;
