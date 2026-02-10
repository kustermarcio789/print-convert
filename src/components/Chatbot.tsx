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
    keywords: ['serviço', 'serviços', 'impressão', 'modelagem', 'pintura', 'manutenção', 'que vocês fazem', 'o que fazem'],
    response: `Oferecemos os seguintes serviços:

🖨️ **Impressão 3D** - Impressão de peças em diversos materiais (PLA, ABS, PETG, Resina)
🎨 **Modelagem 3D** - Criação de modelos 3D personalizados
🎨 **Pintura** - Acabamento e pintura de peças impressas
🔧 **Manutenção** - Manutenção e reparo de impressoras 3D

Para solicitar um orçamento, acesse nossa página de Orçamentos!`
  },
  orcamento: {
    keywords: ['orçamento', 'orçar', 'preço', 'quanto custa', 'valor', 'cotação'],
    response: `Para solicitar um orçamento:

1. Acesse a página de **Orçamentos** no menu
2. Escolha o tipo de serviço desejado
3. Preencha os detalhes do seu projeto
4. Envie o formulário

Nossa equipe responderá em até 24 horas! 📧`
  },
  materiais: {
    keywords: ['material', 'materiais', 'filamento', 'resina', 'pla', 'abs', 'petg'],
    response: `Trabalhamos com diversos materiais:

🔹 **PLA** - Biodegradável, fácil impressão, ideal para protótipos
🔹 **ABS** - Resistente, durável, ideal para peças mecânicas
🔹 **PETG** - Resistente e flexível, uso alimentício
🔹 **TPU** - Flexível, ideal para peças que precisam de elasticidade
🔹 **Resina** - Alta precisão, acabamento superior
🔹 **Nylon** - Muito resistente, uso industrial

Cada material tem características específicas. Podemos ajudar a escolher o melhor para seu projeto!`
  },
  prazo: {
    keywords: ['prazo', 'quanto tempo', 'demora', 'entrega', 'quando fica pronto'],
    response: `Os prazos variam conforme o projeto:

⏱️ **Impressão 3D**: 2-7 dias úteis
🎨 **Modelagem 3D**: 3-10 dias úteis
🖌️ **Pintura**: 2-5 dias úteis
🔧 **Manutenção**: 1-3 dias úteis

Prazos podem variar conforme complexidade. Consulte-nos para prazos expressos! 🚀`
  },
  pagamento: {
    keywords: ['pagamento', 'pagar', 'forma de pagamento', 'cartão', 'pix', 'boleto'],
    response: `Aceitamos as seguintes formas de pagamento:

💳 **Cartão de Crédito** - Parcelamento em até 12x
📱 **PIX** - Pagamento instantâneo com desconto
🧾 **Boleto Bancário** - Vencimento em 3 dias úteis
💰 **Transferência Bancária**

Pagamento seguro e protegido! 🔒`
  },
  contato: {
    keywords: ['contato', 'telefone', 'email', 'whatsapp', 'falar', 'atendimento'],
    response: `Entre em contato conosco:

📧 **E-mail**: 3dk.print@gmail.com
📱 **WhatsApp**: (43) 9174-1518
🌐 **Site**: www.3dkprint.com.br
📍 **Endereço**: Rua Bento Antônio, Vila Santana, Jacarezinho - PR

Horário de atendimento: Segunda a Sexta, 9h às 18h`
  },
  produtos: {
    keywords: ['produto', 'produtos', 'comprar', 'loja', 'venda', 'catálogo'],
    response: `Confira nossos produtos:

🛒 **Produtos para Impressão 3D**:
- Filamentos (PLA, ABS, PETG, TPU)
- Resinas
- Peças e acessórios
- Impressoras 3D

Acesse nossa **Loja** no menu para ver o catálogo completo!`
  },
  prestador: {
    keywords: ['prestador', 'trabalhar', 'parceiro', 'cadastro prestador', 'ser prestador'],
    response: `Quer se tornar um prestador de serviços?

✅ **Cadastre-se** como prestador
✅ **Escolha** os serviços que oferece
✅ **Receba** solicitações de clientes
✅ **Ganhe** dinheiro com seus serviços!

Acesse **Cadastro de Prestador** no menu para começar!`
  },
  horario: {
    keywords: ['horário', 'horario', 'funciona', 'aberto', 'abre', 'fecha'],
    response: `🕐 **Horário de Funcionamento**:

Segunda a Sexta: 9h às 18h
Sábado: 9h às 13h
Domingo: Fechado

Atendimento online 24/7 através deste chat! 🤖`
  }
};

const DEFAULT_RESPONSE = `Desculpe, não entendi sua pergunta. 😅

Posso ajudar com:
• Serviços oferecidos
• Solicitação de orçamento
• Materiais disponíveis
• Prazos de entrega
• Formas de pagamento
• Informações de contato
• Produtos à venda
• Cadastro de prestadores

Digite sua dúvida ou escolha um dos tópicos acima!`;

const GREETING = `Olá! 👋 Bem-vindo à 3DKPRINT!

Sou seu assistente virtual e estou aqui para ajudar 24/7! 🤖

Como posso ajudar você hoje?`;

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      addBotMessage(GREETING);
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

    // Saudações
    if (lowerMessage.match(/\b(oi|olá|ola|hey|alo|alô)\b/)) {
      return `Olá! 😊 Como posso ajudar você hoje?`;
    }

    // Agradecimentos
    if (lowerMessage.match(/\b(obrigad|valeu|thanks)\b/)) {
      return `Por nada! 😊 Estou sempre aqui para ajudar. Precisa de mais alguma coisa?`;
    }

    // Buscar resposta na base de conhecimento
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

    // Adicionar mensagem do usuário
    addUserMessage(inputText);
    setInputText('');

    // Simular digitação do bot
    setIsTyping(true);
    setTimeout(() => {
      const response = getBotResponse(inputText);
      addBotMessage(response);
      setIsTyping(false);
    }, 1000);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      {/* Botão Flutuante */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 bg-blue-600 text-white p-4 rounded-full shadow-lg hover:bg-blue-700 transition-all hover:scale-110 z-50"
          aria-label="Abrir chat"
        >
          <MessageCircle className="h-6 w-6" />
        </button>
      )}

      {/* Janela do Chat */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 w-96 h-[600px] bg-white rounded-lg shadow-2xl flex flex-col z-50 border border-gray-200">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4 rounded-t-lg flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-full">
                <Bot className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-bold">3DKPRINT Assistant</h3>
                <p className="text-xs text-blue-100">Online 24/7</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="hover:bg-white/20 p-2 rounded-full transition-colors"
              aria-label="Fechar chat"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Mensagens */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-2 ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {message.sender === 'bot' && (
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <Bot className="h-5 w-5 text-blue-600" />
                  </div>
                )}
                <div
                  className={`max-w-[75%] rounded-lg p-3 ${
                    message.sender === 'user'
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-gray-900 border border-gray-200'
                  }`}
                >
                  <p className="text-sm whitespace-pre-line">{message.text}</p>
                  <p className={`text-xs mt-1 ${message.sender === 'user' ? 'text-blue-100' : 'text-gray-500'}`}>
                    {message.timestamp.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
                {message.sender === 'user' && (
                  <div className="flex-shrink-0 w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                    <User className="h-5 w-5 text-gray-600" />
                  </div>
                )}
              </div>
            ))}
            
            {isTyping && (
              <div className="flex gap-2 justify-start">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <Bot className="h-5 w-5 text-blue-600" />
                </div>
                <div className="bg-white border border-gray-200 rounded-lg p-3">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-4 border-t border-gray-200 bg-white rounded-b-lg">
            <div className="flex gap-2">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Digite sua mensagem..."
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={handleSend}
                disabled={!inputText.trim()}
                className="bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Enviar mensagem"
              >
                <Send className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
