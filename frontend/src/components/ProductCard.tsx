import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Printer } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ProductCardProps {
  id: string;
  nome: string;
  tipo: 'fdm' | 'resina';
  descricao: string;
  preco: number;
  imagem?: string;
  destaque?: boolean;
}

export default function ProductCard({
  id,
  nome,
  tipo,
  descricao,
  preco,
  imagem,
  destaque = false,
}: ProductCardProps) {
  const navigate = useNavigate();

  const handleViewDetails = () => {
    navigate(`/produto/${id}`);
  };

  const handleQuote = () => {
    navigate(`/produto/${id}`, { state: { scrollToQuote: true } });
  };

  return (
    <motion.div
      whileHover={{ y: -8 }}
      className={`group relative rounded-lg overflow-hidden border transition-all ${
        destaque
          ? 'border-primary/50 bg-gradient-to-br from-primary/5 to-secondary/5 shadow-lg'
          : 'border-border bg-card hover:shadow-lg'
      }`}
    >
      {/* Badge */}
      {destaque && (
        <div className="absolute top-4 right-4 z-10">
          <div className="px-3 py-1 bg-primary text-white text-xs font-semibold rounded-full">
            Destaque
          </div>
        </div>
      )}

      {/* Imagem */}
      <div className="relative h-48 bg-gradient-to-br from-primary/10 to-secondary/10 overflow-hidden flex items-center justify-center">
        {imagem ? (
          <img
            src={imagem}
            alt={nome}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
          />
        ) : (
          <Printer className="w-24 h-24 text-muted-foreground opacity-30 group-hover:scale-110 transition-transform duration-300" />
        )}
      </div>

      {/* Conteúdo */}
      <div className="p-6 space-y-4">
        {/* Tipo */}
        <div className="inline-block">
          <span className="text-xs font-semibold px-2 py-1 rounded-full bg-primary/10 text-primary">
            {tipo === 'fdm' ? 'FDM' : 'Resina'}
          </span>
        </div>

        {/* Título */}
        <h3 className="text-lg font-bold text-foreground line-clamp-2">
          {nome}
        </h3>

        {/* Descrição */}
        <p className="text-sm text-muted-foreground line-clamp-2">
          {descricao}
        </p>

        {/* Preço */}
        <div className="pt-2 border-t border-border">
          <p className="text-sm text-muted-foreground mb-1">Valor Base</p>
          <p className="text-2xl font-bold text-primary">
            R$ {preco.toLocaleString('pt-BR')}
          </p>
        </div>

        {/* Botões */}
        <div className="flex gap-2 pt-4">
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={handleViewDetails}
          >
            Ver Detalhes
          </Button>
          <Button
            size="sm"
            className="flex-1 gap-2"
            onClick={handleQuote}
          >
            Orçamento
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
