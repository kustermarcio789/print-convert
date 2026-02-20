import { MessageCircle } from 'lucide-react';

export function WhatsAppButton() {
  const phoneNumber = '554391741518';
  const message = encodeURIComponent('Olá! Gostaria de saber mais sobre os serviços de impressão 3D.');
  const whatsappUrl = `https://wa.me/${phoneNumber}?text=${message}`;

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 bg-green-500 text-white p-4 rounded-full shadow-2xl hover:bg-green-600 transition-all hover:scale-110 z-50 flex items-center justify-center group"
      title="Fale conosco pelo WhatsApp"
    >
      <MessageCircle className="h-6 w-6" />
      <span className="absolute right-full mr-3 bg-white text-green-600 px-2 py-1 rounded text-xs font-bold shadow-sm opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
        Fale conosco!
      </span>
    </a>
  );
}
