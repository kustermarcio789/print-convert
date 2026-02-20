import { useState, useEffect, useRef } from 'react';
import { MessageCircle, X, Send, Bot, User } from 'lucide-react';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

const KNOWLEDGE_BASE = {
  servicos: {
    keywords: ['serviço', 'serviços', 'impressão', 'modelagem', 'pintura', 'manutenção', 'que vocês fazem', 'o que fazem', 'help desk', 'suporte'],
    response: `Oferecemos os seguintes serviços especializados:

🖨️ **Impressão 3D** - Produção de peças em FDM e Resina (PLA, ABS, PETG, etc.)
🎨 **Modelagem 3D** - Criação de arquivos digitais, protótipos e projetos personalizados
🎨 **Pintura e Acabamento** - Pintura automotiva, aerografia e pós-processamento profissional
🔧 **Manutenção de Impressoras** - Conserto, calibração e upgrades de hardware
🛠️ **Help Desk e Suporte** - Manutenção à distância, desentupimento de bico, dicas de resfriamento e suporte técnico para usuários.

Para solicitar um orçamento, acesse nossa página de Orçamentos!`
  },
  orcamento: {
    keywords: ['orçamento', 'orçar', 'preço', 'quanto custa', 'valor', 'cotação', 'arquivo', 'enviar arquivo'],
    response: `Para solicitar um orçamento personalizado:

1. Acesse a página de **Orçamentos** no menu superior.
2. Escolha o tipo de serviço (Impressão, Modelagem, etc.).
3. Faça o upload do seu arquivo (STL, OBJ, STEP, etc.).
4. **Novidade:** Agora você pode visualizar seu arquivo em 3D assim que fizer o upload!
5. Preencha os detalhes e envie.

Nossa equipe responderá com o valor exato em até 24 horas! 📧`
  },
  materiais: {
    keywords: ['material', 'materiais', 'filamento', 'resina', 'pla', 'abs', 'petg', 'pei', 'mesa pei', 'placa pei'],
    response: `Trabalhamos com materiais de alta qualidade:

🔹 **PLA** - Biodegradável, ideal para protótipos e decoração.
🔹 **ABS** - Resistente e durável, ideal para peças mecânicas.
🔹 **PETG** - Equilíbrio entre resistência e facilidade de impressão.
🔹 **Resina** - Altíssima precisão para miniaturas e joias.
🔹 **Placas PEI Personalizadas** - Temos mesas PEI para Creality (K1, K1 Max, Ender 3), Voron, Sovol e muito mais!

Podemos ajudar a escolher o melhor material para sua necessidade específica!`
  },
  prazo: {
    keywords: ['prazo', 'quanto tempo', 'demora', 'entrega', 'quando fica pronto'],
    response: `Nossos prazos médios de entrega são:

⏱️ **Impressão 3D**: 2 a 5 dias úteis.
🎨 **Modelagem 3D**: 3 a 7 dias úteis.
🖌️ **Pintura**: 3 a 5 dias úteis adicionais.
🔧 **Manutenção**: 1 a 3 dias úteis.

Projetos urgentes podem ser analisados individualmente! 🚀`
  },
  pagamento: {
    keywords: ['pagamento', 'pagar', 'forma de pagamento', 'cartão', 'pix', 'boleto'],
    response: `Facilitamos seu pagamento:

💳 **Cartão de Crédito** - Parcelamento em até 12x.
📱 **PIX** - Pagamento instantâneo com processamento imediato.
🧾 **Boleto Bancário** - Compensação em até 2 dias úteis.

O pagamento é 100% seguro através de nossa plataforma! 🔒`
  },
  contato: {
    keywords: ['contato', 'telefone', 'email', 'whatsapp', 'falar', 'atendimento', 'onde fica'],
    response: `Fale conosco agora mesmo:

📱 **WhatsApp**: (43) 9174-1518 (Clique no botão verde no canto da tela!)
📧 **E-mail**: 3dk.print@gmail.com
📍 **Localização**: Jacarezinho - PR (Atendemos todo o Brasil via transportadora)

Nosso horário comercial é de Segunda a Sexta, das 9h às 18h.`
  },
  produtos: {
    keywords: ['produto', 'produtos', 'comprar', 'loja', 'venda', 'catálogo', 'pei', 'mesa'],
    response: `Confira nossos destaques na loja:

🛒 **Mesa PEI Personalizada** - Para Creality K1/K1C, Voron, Sovol e outras.
🛒 **Peças de Reposição** - Hotends, bicos, correias e motores.
🛒 **Colecionáveis** - Action figures e itens de decoração exclusivos.

Acesse o menu **Produtos** para ver fotos e preços atualizados!`
  },
  prestador: {
    keywords: ['prestador', 'trabalhar', 'parceiro', 'cadastro prestador', 'ser prestador', 'vender'],
    response: `Seja um parceiro 3DKPRINT:

✅ Cadastre sua impressora e ofereça serviços de impressão.
✅ Ofereça suporte técnico e Help Desk.
✅ Receba pagamentos garantidos pela plataforma.

Acesse **Cadastro de Prestador** no menu e comece a faturar com sua máquina!`
  }
};

const DEFAULT_RESPONSE = `Entendi! Para te ajudar melhor, você poderia ser mais específico? 😊

Posso falar sobre:
• **Serviços e Help Desk** (manutenção, suporte)
• **Orçamentos e Visualização 3D**
• **Materiais e Mesas PEI**
• **Prazos e Entregas**
• **Formas de Pagamento**
• **Como ser um Prestador**

O que você gostaria de saber?`;

const GREETING = `Olá! 👋 Bem-vindo à 3DKPRINT!

Sou seu assistente inteligente. Posso tirar dúvidas sobre nossos serviços de impressão 3D, modelagem, manutenção e até te ajudar com orçamentos! 🤖

Como posso ser útil agora?`;

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setTimeout(() => {
        addBotMessage(GREETING);
      }, 500);
    }
  }, [isOpen]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const addBotMessage = (text: string) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      text,
      sender: 'bot',
      timestamp: new Date()
    };
    setMessages(prev => [...prev, newMessage]);
  };

  const addUserMessage = (text: string) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      text,
      sender: 'user',
      timestamp: new Date()
    };
    setMessages(prev => [...prev, newMessage]);
  };

  const getBotResponse = (userMessage: string): string => {
    const lowerMessage = userMessage.toLowerCase();

    if (lowerMessage.match(/\b(oi|olá|ola|bom dia|boa tarde|boa noite)\b/)) {
      return `Olá! 😊 É um prazer atender você. Em que posso ajudar hoje?`;
    }

    if (lowerMessage.match(/\b(obrigado|obrigada|valeu|show|top)\b/)) {
      return `Por nada! Fico feliz em ajudar. Se precisar de mais alguma coisa, é só chamar! 👍`;
    }

    for (const [category, data] of Object.entries(KNOWLEDGE_BASE)) {
      for (const keyword of data.keywords) {
        if (lowerMessage.includes(keyword.toLowerCase())) {
          return data.response;
        }
      }
    }

    return DEFAULT_RESPONSE;
  };

  const handleSend = () => {
    if (!inputText.trim()) return;

    addUserMessage(inputText);
    const currentInput = inputText;
    setInputText('');

    setIsTyping(true);
    setTimeout(() => {
      const response = getBotResponse(currentInput);
      addBotMessage(response);
      setIsTyping(false);
    }, 800);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      {/* Botão Flutuante do Chatbot */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-24 right-6 bg-blue-600 text-white p-4 rounded-full shadow-2xl hover:bg-blue-700 transition-all hover:scale-110 z-50 flex items-center justify-center group"
          title="Chat de Atendimento"
        >
          <MessageCircle className="h-6 w-6" />
          <span className="absolute right-full mr-3 bg-white text-blue-600 px-2 py-1 rounded text-xs font-bold shadow-sm opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
            Dúvidas? Fale comigo!
          </span>
        </button>
      )}

      {/* Janela do Chat */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 w-[350px] sm:w-[400px] h-[550px] bg-white rounded-2xl shadow-2xl flex flex-col z-50 border border-gray-100 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-300">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white p-5 flex items-center justify-between shadow-md">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
                <Bot className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-bold text-lg leading-tight">3DK Assistant</h3>
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                  <p className="text-xs text-blue-100">IA Ativa 24/7</p>
                </div>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="hover:bg-white/20 p-2 rounded-full transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Mensagens */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/50">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-2 ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {message.sender === 'bot' && (
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-sm">
                    <Bot className="h-5 w-5 text-white" />
                  </div>
                )}
                <div
                  className={`max-w-[85%] rounded-2xl p-3.5 shadow-sm ${
                    message.sender === 'user'
                      ? 'bg-blue-600 text-white rounded-tr-none'
                      : 'bg-white text-gray-800 border border-gray-100 rounded-tl-none'
                  }`}
                >
                  <p className="text-sm leading-relaxed whitespace-pre-line">{message.text}</p>
                  <p className={`text-[10px] mt-1.5 font-medium ${message.sender === 'user' ? 'text-blue-100' : 'text-gray-400'}`}>
                    {message.timestamp.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            ))}
            
            {isTyping && (
              <div className="flex gap-2 justify-start">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <Bot className="h-5 w-5 text-white" />
                </div>
                <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
                  <div className="flex gap-1.5">
                    <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                    <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-4 bg-white border-t border-gray-100">
            <div className="flex gap-2 bg-gray-50 p-1.5 rounded-xl border border-gray-200 focus-within:border-blue-400 transition-colors">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Como posso ajudar?"
                className="flex-1 px-3 py-2 bg-transparent focus:outline-none text-sm"
              />
              <button
                onClick={handleSend}
                disabled={!inputText.trim()}
                className="bg-blue-600 text-white p-2.5 rounded-lg hover:bg-blue-700 transition-all disabled:opacity-50 disabled:grayscale shadow-md active:scale-95"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
            <p className="text-[10px] text-center text-gray-400 mt-2">
              3DKPRINT - Tecnologia em Impressão 3D
            </p>
          </div>
        </div>
      )}
    </>
  );
}
