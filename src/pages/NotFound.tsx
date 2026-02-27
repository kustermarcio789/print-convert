import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Home, ArrowLeft } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <Layout>
      <div className="flex min-h-[70vh] items-center justify-center bg-background px-4">
        <div className="text-center max-w-md">
          <div className="mb-6 inline-flex h-24 w-24 items-center justify-center rounded-full bg-accent/10">
            <span className="text-5xl font-bold text-accent">404</span>
          </div>
          <h1 className="mb-4 text-3xl font-bold text-foreground">Página não encontrada</h1>
          <p className="mb-8 text-lg text-muted-foreground leading-relaxed">
            Oops! A página que você está procurando não existe ou foi movida.
            Caminho tentado: <code className="bg-muted px-1 rounded text-accent font-mono text-sm">{location.pathname}</code>
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button asChild variant="default" className="w-full sm:w-auto bg-accent text-accent-foreground hover:bg-accent/90">
              <Link to="/">
                <Home className="mr-2 h-4 w-4" /> Voltar para o Início
              </Link>
            </Button>
            <Button asChild variant="outline" className="w-full sm:w-auto">
              <button onClick={() => window.history.back()}>
                <ArrowLeft className="mr-2 h-4 w-4" /> Voltar Anterior
              </button>
            </Button>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default NotFound;
