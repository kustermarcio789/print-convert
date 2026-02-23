import { MessageCircle } from 'lucide-react';

interface WhatsAppButtonProps {
  phoneNumber?: string;
  message?: string;
}

export function WhatsAppButton({ 
  phoneNumber = "5543991741518", 
  message = "Olá! Gostaria de saber mais sobre os serviços de impressão 3D." 
}: WhatsAppButtonProps) {
  const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="whatsapp-float group"
      aria-label="Fale conosco pelo WhatsApp"
    >
      <MessageCircle className="h-7 w-7 text-white fill-white" />
      <span className="absolute right-full mr-3 px-3 py-2 bg-white text-foreground text-sm font-medium rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
        Fale conosco
      </span>
    </a>
  );
}
