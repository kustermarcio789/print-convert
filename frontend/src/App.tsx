import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Index from "./pages/Index";
import { Products } from "./pages/Products";
import Services from "./pages/Services";
import Quote from "./pages/Quote";
import QuoteSuccess from "./pages/QuoteSuccess";
import Portfolio from "./pages/Portfolio";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Brands from "./pages/Brands";
import BrandDetail from "./pages/BrandDetail";
import UploadFile from "./pages/UploadFile";
import MyAccount from "./pages/MyAccount";
import PaintQuote from './pages/PaintQuote';
import ModelingQuote from './pages/ModelingQuote';
import MaintenanceQuote from './pages/MaintenanceQuote';
import AdminLogin from './pages/admin/AdminLogin';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminOrcamentos from './pages/admin/AdminOrcamentos';
import AdminUsuarios from './pages/admin/AdminUsuarios';
import AdminProdutos from './pages/admin/AdminProdutos';
import AdminEstoque from './pages/admin/AdminEstoque';
import AdminProdutosSite from './pages/admin/AdminProdutosSite';
import AdminVendas from './pages/admin/AdminVendas';
import AdminProducao from './pages/admin/AdminProducao';
import AdminRelatorios from './pages/admin/AdminRelatorios';
import AdminRelatorioVendas from './pages/admin/AdminRelatorioVendas';
import AdminRelatorioProducao from './pages/admin/AdminRelatorioProducao';
import AdminDashboardExecutivo from './pages/admin/AdminDashboardExecutivo';
import AdminOrcamentoDetalhes from './pages/admin/AdminOrcamentoDetalhes';
import AdminOrcamentoManual from './pages/admin/AdminOrcamentoManual';
import AdminMarcas from './pages/admin/AdminMarcas';
import AdminImpressoras from './pages/admin/AdminImpressoras';
import AdminPortfolio from './pages/admin/AdminPortfolio';
import AdminLeads from './pages/admin/AdminLeads';
import AdminGerenciarUsuarios from './pages/admin/AdminGerenciarUsuarios';
import AdminAuditoria from './pages/admin/AdminAuditoria';
import AdminPedidos from './pages/admin/AdminPedidos';
import AdminProdutoDetalhe from './pages/admin/AdminProdutoDetalhe';
import ProtectedRoute from './components/admin/ProtectedRoute';
import About from './pages/About';
import Contact from './pages/Contact';
import ReturnPolicy from './pages/ReturnPolicy';
import Terms from './pages/Terms';
import Privacy from './pages/Privacy';
import Help from './pages/Help';
import Calculator3D from './pages/Calculator3D';
import Demo3D from './pages/Demo3D';
import ModelViewerDocs from './pages/ModelViewerDocs';
import Consultor3D from './pages/Consultor3D';
import Knowledge from './pages/Knowledge';
import Community from './pages/Community';



import Checkout from './pages/Checkout';
import { ProductDetails } from './pages/ProductDetails';
import QuoteMultiple from './pages/QuoteMultiple';
import QuoteConfirmation from './pages/QuoteConfirmation';
import SEOContent from './pages/SEOContent';
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
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/servicos" element={<Services />} />
          <Route path="/orcamento" element={<Quote />} />
          <Route path="/orcamento-multi" element={<QuoteMultiple />} />
          <Route path="/orcamento-sucesso" element={<QuoteSuccess />} />
          <Route path="/orcamento/confirmacao/:id" element={<QuoteConfirmation />} />
          <Route path="/produto/:productId" element={<ProductDetails />} />
          <Route path="/orcamento-pintura" element={<PaintQuote />} />
          <Route path="/orcamento-modelagem" element={<ModelingQuote />} />
          <Route path="/orcamento-manutencao" element={<MaintenanceQuote />} />
          <Route path="/portfolio" element={<Portfolio />} />
          <Route path="/consultor-3d" element={<Consultor3D />} />
          <Route path="/conhecimento" element={<Knowledge />} />
          <Route path="/comunidade" element={<Community />} />

          <Route path="/login" element={<Login />} />
          <Route path="/cadastro" element={<Register />} />
          <Route path="/marcas" element={<Brands />} />
          <Route path="/marcas/:brandId" element={<BrandDetail />} />
          <Route path="/seo/:slug" element={<SEOContent />} />
          <Route path="/enviar-arquivo" element={<UploadFile />} />
          <Route path="/minha-conta" element={<MyAccount />} />
          {/* Admin Routes */}
          <Route path="/admin" element={<Navigate to="/admin/login" replace />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin/dashboard" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
          <Route path="/admin/orcamentos" element={<ProtectedRoute><AdminOrcamentos /></ProtectedRoute>} />
          <Route path="/admin/orcamentos/:id" element={<ProtectedRoute><AdminOrcamentoDetalhes /></ProtectedRoute>} />
          <Route path="/admin/orcamento-manual" element={<ProtectedRoute><AdminOrcamentoManual /></ProtectedRoute>} />
          <Route path="/admin/usuarios" element={<ProtectedRoute><AdminUsuarios /></ProtectedRoute>} />
          <Route path="/admin/produtos" element={<ProtectedRoute><AdminProdutos /></ProtectedRoute>} />
          <Route path="/admin/produtos/:id" element={<ProtectedRoute><AdminProdutoDetalhe /></ProtectedRoute>} />
          <Route path="/admin/vendas" element={<ProtectedRoute><AdminVendas /></ProtectedRoute>} />
          <Route path="/admin/estoque" element={<ProtectedRoute><AdminEstoque /></ProtectedRoute>} />
          <Route path="/admin/produtos-site" element={<ProtectedRoute><AdminProdutosSite /></ProtectedRoute>} />
          <Route path="/admin/producao" element={<ProtectedRoute><AdminProducao /></ProtectedRoute>} />
          <Route path="/admin/relatorios" element={<ProtectedRoute><AdminRelatorios /></ProtectedRoute>} />
          <Route path="/admin/relatorios/vendas" element={<ProtectedRoute><AdminRelatorioVendas /></ProtectedRoute>} />
          <Route path="/admin/relatorios/producao" element={<ProtectedRoute><AdminRelatorioProducao /></ProtectedRoute>} />
          <Route path="/admin/relatorios/dashboard" element={<ProtectedRoute><AdminDashboardExecutivo /></ProtectedRoute>} />
          <Route path="/admin/marcas" element={<ProtectedRoute><AdminMarcas /></ProtectedRoute>} />
          <Route path="/admin/impressoras" element={<ProtectedRoute><AdminImpressoras /></ProtectedRoute>} />
          <Route path="/admin/portfolio" element={<ProtectedRoute><AdminPortfolio /></ProtectedRoute>} />
          <Route path="/admin/pedidos" element={<ProtectedRoute><AdminPedidos /></ProtectedRoute>} />
          <Route path="/admin/leads" element={<ProtectedRoute><AdminLeads /></ProtectedRoute>} />
          <Route path="/admin/gerenciar-usuarios" element={<ProtectedRoute><AdminGerenciarUsuarios /></ProtectedRoute>} />
          <Route path="/admin/auditoria" element={<ProtectedRoute><AdminAuditoria /></ProtectedRoute>} />
          {/* Institutional Pages */}
          <Route path="/sobre" element={<About />} />
          <Route path="/contato" element={<Contact />} />
          <Route path="/devolucao" element={<ReturnPolicy />} />
          <Route path="/termos" element={<Terms />} />
          <Route path="/privacidade" element={<Privacy />} />
          <Route path="/ajuda" element={<Help />} />
          <Route path="/calculadora" element={<Calculator3D />} />
          <Route path="/demo-3d" element={<Demo3D />} />
          <Route path="/model-viewer-docs" element={<ModelViewerDocs />} />



          <Route path="/checkout/:productId" element={<Checkout />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
