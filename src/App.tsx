import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Products from "./pages/Products";
import ProductDetail from "./pages/ProductDetail";
import Services from "./pages/Services";
import Quote from "./pages/Quote";
import Portfolio from "./pages/Portfolio";
import Blog from "./pages/Blog";
import Login from "./pages/Login";
import Register from "./pages/Register";
import RegisterProvider from "./pages/RegisterProvider";
import Brands from "./pages/Brands";
import BrandDetail from "./pages/BrandDetail";
import UploadFile from "./pages/UploadFile";
import Providers from "./pages/Providers";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/produtos" element={<Products />} />
          <Route path="/produtos/:id" element={<ProductDetail />} />
          <Route path="/servicos" element={<Services />} />
          <Route path="/orcamento" element={<Quote />} />
          <Route path="/portfolio" element={<Portfolio />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/login" element={<Login />} />
          <Route path="/cadastro" element={<Register />} />
          <Route path="/cadastro-prestador" element={<RegisterProvider />} />
          <Route path="/marcas" element={<Brands />} />
          <Route path="/marcas/:brandId" element={<BrandDetail />} />
          <Route path="/enviar-arquivo" element={<UploadFile />} />
          <Route path="/prestadores" element={<Providers />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
