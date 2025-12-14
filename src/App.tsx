
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ErrorReport } from "@/components/ErrorReport";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import SiteEditor from "./pages/SiteEditor";
import BotEditor from "./pages/BotEditor";
import Ads from "./pages/Ads";
import Products from "./pages/Products";
import Statistics from "./pages/Statistics";
import University from "./pages/University";
import Onboarding from "./pages/Onboarding";
import AIChat from "./pages/AIChat";
import Exchange from "./pages/Exchange";
import Marketplace from "./pages/Marketplace";
import MarketplaceLanding from "./pages/MarketplaceLanding";
import Settings from "./pages/Settings";
import Admin from "./pages/Admin";
import Domains from "./pages/Domains";
import Capabilities from "./pages/Capabilities";
import Pricing from "./pages/Pricing";
import Community from "./pages/Community";
import Support from "./pages/Support";
import SupportTickets from "./pages/SupportTickets";
import SiteBuilder from "./pages/SiteBuilder";
import BotBuilder from "./pages/BotBuilder";
import Advertising from "./pages/Advertising";
import Analytics from "./pages/Analytics";
import KnowledgeBase from "./pages/KnowledgeBase";
import Documentation from "./pages/Documentation";
import PaymentMethods from "./pages/PaymentMethods";
import Partners from "./pages/Partners";
import ReportViolation from "./pages/ReportViolation";
import About from "./pages/About";
import Contacts from "./pages/Contacts";
import News from "./pages/News";
import Promotions from "./pages/Promotions";
import Blog from "./pages/Blog";
import Reviews from "./pages/Reviews";
import FAQ from "./pages/FAQ";
import Contact from "./pages/Contact";
import NotFound from "./pages/NotFound";
import { AuthProvider } from "./context/AuthContext";
import { ProtectedRoute } from "./components/ProtectedRoute";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <ErrorReport />
      <AuthProvider>
        <BrowserRouter>
          <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/capabilities" element={<Capabilities />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/marketplace-landing" element={<MarketplaceLanding />} />
          <Route path="/community" element={<Community />} />
          <Route path="/support" element={<Support />} />
          <Route path="/site-builder" element={<SiteBuilder />} />
          <Route path="/bot-builder" element={<BotBuilder />} />
          <Route path="/advertising" element={<Advertising />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/knowledge-base" element={<KnowledgeBase />} />
          <Route path="/documentation" element={<Documentation />} />
          <Route path="/payment-methods" element={<PaymentMethods />} />
          <Route path="/partners" element={<Partners />} />
          <Route path="/report-violation" element={<ReportViolation />} />
          <Route path="/about" element={<About />} />
          <Route path="/contacts" element={<Contacts />} />
          <Route path="/news" element={<News />} />
          <Route path="/promotions" element={<Promotions />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/reviews" element={<Reviews />} />
          <Route path="/faq" element={<FAQ />} />
          <Route path="/contact" element={<Contact />} />
          
          {/* Защищенные маршруты личного кабинета */}
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/editor/site/:id" element={<ProtectedRoute requiredPermission="projects.edit"><SiteEditor /></ProtectedRoute>} />
          <Route path="/editor/bot/:id" element={<ProtectedRoute requiredPermission="bots.edit"><BotEditor /></ProtectedRoute>} />
          <Route path="/dashboard/ads" element={<ProtectedRoute requiredPermission="ads.view"><Ads /></ProtectedRoute>} />
          <Route path="/dashboard/products" element={<ProtectedRoute requiredPermission="products.view"><Products /></ProtectedRoute>} />
          <Route path="/dashboard/statistics" element={<ProtectedRoute requiredPermission="statistics.view"><Statistics /></ProtectedRoute>} />
          <Route path="/university" element={<ProtectedRoute requiredPermission="academy.view"><University /></ProtectedRoute>} />
          <Route path="/university/onboarding" element={<ProtectedRoute requiredPermission="academy.view"><Onboarding /></ProtectedRoute>} />
          <Route path="/dashboard/ai-chat" element={<ProtectedRoute requiredPermission="ai.chat"><AIChat /></ProtectedRoute>} />
          <Route path="/exchange" element={<ProtectedRoute requiredPermission="exchange.view"><Exchange /></ProtectedRoute>} />
          <Route path="/marketplace" element={<ProtectedRoute requiredPermission="marketplace.view"><Marketplace /></ProtectedRoute>} />
          <Route path="/dashboard/settings" element={<ProtectedRoute requiredPermission="settings.view"><Settings /></ProtectedRoute>} />
          <Route path="/dashboard/domains" element={<ProtectedRoute requiredPermission="domains.view"><Domains /></ProtectedRoute>} />
          <Route path="/dashboard/support" element={<ProtectedRoute><SupportTickets /></ProtectedRoute>} />
          <Route path="/admin" element={<ProtectedRoute requiredPermission="admin.view"><Admin /></ProtectedRoute>} />
          
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
      </AuthProvider>
  </TooltipProvider>
  </QueryClientProvider>
);

export default App;