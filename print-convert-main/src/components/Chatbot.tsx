import { useState, useEffect, useRef } from 'react';
import { MessageCircle, X, Send, Bot, User, ChevronRight, RotateCcw, ExternalLink } from 'lucide-react';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
  quickReplies?: string[];
  isWhatsAppCTA?: boolean;
}

/* ============================================================
   BASE DE CONHECIMENTO EXPANDIDA — FUNIL INTELIGENTE
   ============================================================ */
const KNOWLEDGE_BASE: Record<string, { keywords: string[]; response: string; quickReplies?: string[]; followUp?: string }> = {
  servicos: {
    keywords: ['serviço', 'serviços', 'impressão', 'que vocês fazem', 'o que fazem', 'o que oferecem', 'trabalham com'],
    response: `Oferecemos serviços completos de impressão 3D:

**Impressão 3D FDM** — Peças em PLA, ABS, PETG, TPU, Nylon e mais
**Impressão 3D Resina (SLA)** — Alta precisão para miniaturas e joalheria
**Modelagem 3D** — Criação de modelos personalizados (Fusion 360, Blender, SolidWorks)
**Pintura Premium** — Acabamento profissional com primer, tinta e verniz
**Manutenção** — Reparo e calibração de impressoras 3D

Qual serviço te interessa? Posso explicar cada um em detalhes!`,
    quickReplies: ['Impressão FDM', 'Impressão Resina', 'Modelagem 3D', 'Pintura Premium', 'Manutenção'],
  },
  orcamento: {
    keywords: ['orçamento', 'orçar', 'preço', 'quanto custa', 'valor', 'cotação', 'custo', 'quanto sai', 'quanto fica'],
    response: `Para solicitar um orçamento personalizado:

1. Acesse a página de **Orçamento** no menu superior
2. Escolha o tipo de serviço (impressão, modelagem, pintura ou manutenção)
3. Envie seu arquivo 3D (.STL, .OBJ, .3MF) — você verá uma prévia 3D do modelo!
4. Preencha as especificações (material, cor, quantidade)
5. Receba o orçamento em até **24 horas**!

**Dica:** Quanto mais detalhes você fornecer, mais preciso será o orçamento.

Quer que eu te direcione para a página de orçamento?`,
    quickReplies: ['Ir para Orçamento', 'Materiais disponíveis', 'Prazos de entrega', 'Preciso de ajuda'],
  },
  materiais: {
    keywords: ['material', 'materiais', 'filamento', 'resina', 'pla', 'abs', 'petg', 'tpu', 'nylon'],
    response: `Trabalhamos com os principais materiais do mercado:

**PLA** — Biodegradável, fácil impressão. Ideal para protótipos e decoração. (190-220°C)
**ABS** — Resistente ao calor (105°C). Para peças mecânicas e carcaças. (230-250°C)
**PETG** — Equilíbrio perfeito. Resistente, flexível e food-safe. (220-250°C)
**TPU** — Flexível como borracha. Capas, vedações, amortecedores. (210-230°C)
**Nylon** — Engenharia. Engrenagens, dobradiças, peças industriais. (240-270°C)
**Tritan** — Transparente, resistente a impacto. Copos, garrafas. (250-270°C)
**ASA** — Resistente a UV. Ideal para peças externas. (235-255°C)
**Resina Standard** — Alta resolução (25-50 microns). Miniaturas perfeitas.
**Resina Tough** — Resina resistente para peças funcionais.

Não sabe qual material usar? Me diga o que vai imprimir e eu recomendo!`,
    quickReplies: ['PLA vs PETG', 'Material mais resistente', 'Material flexível', 'Não sei qual usar'],
  },
  pla_petg: {
    keywords: ['pla vs petg', 'pla ou petg', 'diferença pla petg', 'melhor pla petg'],
    response: `**PLA vs PETG — Comparação direta:**

| Aspecto | PLA | PETG |
|---------|-----|------|
| Facilidade | Muito fácil | Fácil |
| Resist. Térmica | 60°C | 80°C |
| Resist. Mecânica | Média | Alta |
| Flexibilidade | Baixa | Média |
| Food-safe | Não | Sim |
| Preço | R$80-100/kg | R$90-120/kg |

**Resumo:** Use **PLA** para protótipos visuais e peças decorativas. Use **PETG** para peças funcionais que precisam de resistência.

Quer saber sobre outros materiais ou fazer um orçamento?`,
    quickReplies: ['Outros materiais', 'Fazer orçamento', 'Material mais resistente'],
  },
  resistente: {
    keywords: ['mais resistente', 'mais forte', 'resistência', 'durável', 'engenharia', 'industrial'],
    response: `Para peças que exigem máxima resistência:

1. **Nylon (PA)** — Resistência excepcional, auto-lubrificante. Engrenagens e peças mecânicas.
2. **Policarbonato (PC)** — O mais resistente. Viseiras e componentes aeroespaciais.
3. **CF-Nylon** — Nylon com fibra de carbono. Rigidez comparável ao alumínio.
4. **PETG** — Boa resistência com facilidade de impressão.
5. **ABS** — Clássico industrial, resistente ao calor.

Para aplicações críticas, recomendo uma consulta com nossa equipe técnica para garantir o material certo.

Quer que eu explique mais sobre algum desses materiais?`,
    quickReplies: ['Fazer orçamento', 'Preciso de ajuda técnica', 'Outros materiais'],
  },
  flexivel: {
    keywords: ['flexível', 'flexibilidade', 'borracha', 'elástico', 'tpu', 'dobrar'],
    response: `Para peças flexíveis, o material ideal é o **TPU (Poliuretano Termoplástico)**:

**Dureza:** 95A (similar a borracha de pneu)
**Aplicações:** Capas de celular, vedações, juntas, amortecedores, solas de sapato
**Temperatura:** 210-230°C
**Dica:** Requer impressão lenta (20-30mm/s) e extrusora Direct Drive

Também temos **TPU 85A** (mais macio) para maior flexibilidade.

Quer fazer um orçamento com TPU?`,
    quickReplies: ['Fazer orçamento', 'Outros materiais', 'Prazos de entrega'],
  },
  prazo: {
    keywords: ['prazo', 'quanto tempo', 'demora', 'entrega', 'quando fica pronto', 'dias'],
    response: `Nossos prazos médios de produção:

**Impressão 3D FDM:** 2-5 dias úteis (simples) / 5-10 dias (complexas)
**Impressão 3D Resina:** 2-4 dias úteis
**Modelagem 3D:** 3-10 dias úteis (depende da complexidade)
**Pintura Premium:** 3-7 dias úteis (inclui cura)
**Manutenção:** 1-5 dias úteis

**Envio:** Correios (PAC/SEDEX) para todo o Brasil.
**Urgente?** Consulte nosso serviço expresso com prioridade!

Quer fazer um orçamento agora?`,
    quickReplies: ['Fazer orçamento', 'Formas de pagamento', 'Preciso de ajuda'],
  },
  pagamento: {
    keywords: ['pagamento', 'pagar', 'forma de pagamento', 'cartão', 'pix', 'boleto', 'parcela'],
    response: `Formas de pagamento aceitas:

**PIX** — Pagamento instantâneo (5% de desconto!)
**Cartão de Crédito** — Parcelamento em até 12x
**Boleto Bancário** — Vencimento em 3 dias úteis
**Transferência Bancária** — Banco do Brasil / Nubank

**Política:** 50% na aprovação do orçamento + 50% na entrega.
Para projetos acima de R$500, condições especiais!

Quer fazer um orçamento?`,
    quickReplies: ['Fazer orçamento', 'Prazos de entrega', 'Preciso de ajuda'],
  },
  contato: {
    keywords: ['contato', 'telefone', 'email', 'whatsapp', 'falar', 'atendimento', 'endereço', 'localização'],
    response: `Nossos canais de contato:

**WhatsApp:** (43) 9 9174-1518
**E-mail:** 3dk.print.br@gmail.com
**Instagram:** @3dk.print
**Site:** www.3dkprint.com.br

**Horário de atendimento:**
Segunda a Sexta: 8h às 18h
Sábado: 9h às 13h

Antes de ir para o WhatsApp, posso te ajudar com alguma dúvida aqui?`,
    quickReplies: ['Tenho uma dúvida', 'Quero fazer orçamento', 'Falar no WhatsApp'],
  },
  produtos: {
    keywords: ['produto', 'produtos', 'comprar', 'loja', 'venda', 'catálogo', 'peças prontas'],
    response: `Trabalhamos com:

**Peças para Impressoras 3D:**
- Bicos (nozzles) de latão, aço e rubi
- Hotends e heatbreaks all-metal
- Correias GT2, polias e rolamentos
- Guias lineares MGN12H
- Mesas PEI e superfícies de impressão
- Motores de passo NEMA 17

**Filamentos e Resinas:**
- PLA, ABS, PETG, TPU, Nylon, ASA
- Resinas standard, tough e flexíveis

**Peças Impressas Sob Demanda:**
- Protótipos personalizados
- Miniaturas e figuras
- Peças mecânicas funcionais

Quer saber mais sobre algum item?`,
    quickReplies: ['Fazer orçamento', 'Materiais disponíveis', 'Preciso de ajuda'],
  },
  klipper: {
    keywords: ['klipper', 'firmware', 'marlin', 'raspberry', 'input shaper', 'pressure advance'],
    response: `**Klipper** é o firmware mais avançado para impressoras 3D:

**Vantagens:**
- Velocidades de 300-600mm/s
- Input Shaper para eliminar ghosting
- Pressure Advance para cantos perfeitos
- Interface web (Mainsail/Fluidd)

**Oferecemos instalação do Klipper** na sua impressora! Inclui:
- Instalação do Klipper + Mainsail
- Calibração completa (PID, Input Shaper, PA)
- Configuração de macros personalizadas

Visite nossa página de **Conhecimento** para saber mais, ou use o **Consultor 3D** para encontrar a impressora ideal!`,
    quickReplies: ['Instalar Klipper', 'Consultor 3D', 'Página de Conhecimento'],
  },
  impressora: {
    keywords: ['impressora', 'comprar impressora', 'qual impressora', 'recomenda', 'melhor impressora', 'ender', 'bambu', 'prusa'],
    response: `Quer encontrar a impressora 3D ideal para você?

Temos uma ferramenta incrível: o **Consultor 3D**! Ele faz perguntas sobre seu perfil e recomenda as melhores impressoras com comparativos detalhados.

**Acesse:** Menu > Consultor 3D

Ou posso te dar uma recomendação rápida aqui! Me diga:
- Qual seu orçamento?
- Para que vai usar? (hobby, produção, miniaturas...)
- Já tem experiência com impressão 3D?`,
    quickReplies: ['Ir para Consultor 3D', 'Até R$1.500', 'R$1.500 a R$3.000', 'Acima de R$3.000'],
  },
  manutencao: {
    keywords: ['manutenção', 'conserto', 'reparo', 'calibração', 'problema', 'não funciona', 'entupido', 'entupiu'],
    response: `Serviço de manutenção e reparo de impressoras 3D:

**Problemas comuns que resolvemos:**
- Hotend entupido / troca de bico
- Nivelamento e calibração da mesa
- Troca de correias e polias
- Upgrade de extrusora (Bowden → Direct Drive)
- Instalação de guias lineares
- Troca de placa-mãe e drivers
- Instalação de firmware Klipper

**Como funciona:**
1. Descreva o problema
2. Receba diagnóstico e orçamento
3. Envie a impressora ou agende visita técnica
4. Receba de volta funcionando!

Prazo médio: 1-5 dias úteis.`,
    quickReplies: ['Solicitar manutenção', 'Instalar Klipper', 'Preciso de ajuda'],
  },
  modelagem: {
    keywords: ['modelagem', 'modelar', 'modelo 3d', 'desenho', 'projeto', 'cad', 'fusion', 'blender'],
    response: `Serviço de modelagem 3D profissional:

**Softwares:** Fusion 360, Blender, SolidWorks, ZBrush

**O que modelamos:**
- Peças mecânicas sob medida
- Protótipos de produtos
- Personagens e miniaturas
- Peças de reposição
- Projetos de engenharia

**Processo:**
1. Envie referências (fotos, desenhos, medidas)
2. Receba o orçamento
3. Modelamos com revisões incluídas
4. Entregamos o .STL pronto para impressão

Prazo: 3-10 dias úteis.`,
    quickReplies: ['Solicitar modelagem', 'Fazer orçamento', 'Ver portfólio'],
  },
  comunidade: {
    keywords: ['comunidade', 'grupo', 'whatsapp grupo', 'discord', 'facebook grupo', 'fórum'],
    response: `Faça parte da comunidade 3DKPRINT!

**Grupos no WhatsApp:**
- Comunidade 3D Brasil — Dicas, notícias e projetos
- Vendas 3D Brasil — Compra e venda de impressoras
- 3D Resina Brasil — Tudo sobre impressão em resina
- STL Compartilha — Arquivos STL gratuitos

Acesse a página **Comunidade** no menu para links diretos!`,
    quickReplies: ['Ir para Comunidade', 'Página de Conhecimento', 'Consultor 3D'],
  },
  conhecimento: {
    keywords: ['conhecimento', 'aprender', 'tutorial', 'guia', 'como funciona', 'fdm', 'sla', 'tecnologia'],
    response: `Nossa página de **Conhecimento** é uma enciclopédia completa:

- Klipper vs Marlin — Comparação de firmwares
- Guia de Filamentos — PLA, ABS, PETG, TPU, Nylon, PC, ASA, CF
- FDM vs Resina — Qual tecnologia escolher
- Guia Linear vs Rodinhas — Sistemas de movimentação
- Tipos de Impressoras — Cartesiana, CoreXY, Delta
- Impressoras Modernas vs Antigas
- História da Impressão 3D

Acesse pelo menu: **Conhecimento**`,
    quickReplies: ['Ir para Conhecimento', 'Consultor 3D', 'Fazer orçamento'],
  },
  enviar_arquivo: {
    keywords: ['enviar arquivo', 'upload', 'stl', 'obj', '3mf', 'arquivo 3d', 'mandar arquivo'],
    response: `Para enviar seu arquivo 3D:

**Formatos aceitos:** .STL, .OBJ, .3MF, .STEP, .IGES
**Tamanho máximo:** 100MB por arquivo

**Como enviar:**
1. Acesse a página de **Orçamento**
2. Faça upload do seu modelo 3D
3. Veja a **prévia 3D** do seu modelo na tela!
4. Escolha material, cor e quantidade
5. Receba o orçamento!

**Dica:** Arquivos .3MF preservam cores e configurações.`,
    quickReplies: ['Ir para Orçamento', 'Materiais disponíveis', 'Preciso de ajuda'],
  },
  consultor: {
    keywords: ['consultor', 'consultor 3d', 'qual impressora comprar', 'me ajude a escolher', 'não sei qual'],
    response: `Nosso **Consultor 3D** é uma ferramenta inteligente que te ajuda a encontrar a impressora perfeita!

**Como funciona:**
1. Responda 5 perguntas rápidas sobre seu perfil
2. O sistema analisa suas necessidades
3. Receba 3 recomendações com comparativos detalhados

Inclui informações sobre:
- Velocidade, volume, firmware
- Guia linear vs rodinhas
- Klipper vs Marlin
- Prós e contras de cada máquina

**Acesse:** Menu > Consultor 3D`,
    quickReplies: ['Ir para Consultor 3D', 'Fazer orçamento', 'Ver serviços'],
  },
  pintura: {
    keywords: ['pintura', 'pintar', 'acabamento', 'primer', 'verniz', 'tinta', 'pintura premium'],
    response: `Serviço de **Pintura Premium** para peças 3D:

**Níveis de acabamento:**
- **Básico** — Lixamento + primer + 1 cor
- **Intermediário** — Lixamento fino + primer + pintura detalhada
- **Premium** — Acabamento perfeito + detalhes + verniz UV
- **Artístico** — Pintura à mão com efeitos especiais

**Processo:**
1. Envie fotos ou referências do acabamento desejado
2. Receba orçamento detalhado
3. Enviamos a peça pintada com proteção UV

Quer solicitar um orçamento de pintura?`,
    quickReplies: ['Orçamento de Pintura', 'Ver portfólio', 'Preciso de ajuda'],
  },
  nao_sei: {
    keywords: ['não sei', 'nao sei', 'me ajude', 'ajuda', 'preciso de ajuda', 'help', 'socorro'],
    response: `Sem problemas! Estou aqui para te ajudar.

Me diga um pouco sobre o que você precisa:

**Quer imprimir algo?** → Me diga o que é e eu recomendo o melhor material e processo
**Quer comprar uma impressora?** → Use nosso Consultor 3D para encontrar a ideal
**Tem um problema técnico?** → Descreva e eu ajudo a diagnosticar
**Quer aprender sobre impressão 3D?** → Acesse nossa página de Conhecimento

Ou simplesmente me diga com suas palavras o que precisa!`,
    quickReplies: ['Quero imprimir algo', 'Quero comprar impressora', 'Problema técnico', 'Quero aprender'],
  },
  quero_imprimir: {
    keywords: ['quero imprimir', 'preciso imprimir', 'imprimir algo', 'imprimir uma peça', 'imprimir peça'],
    response: `Ótimo! Para te ajudar melhor, me diga:

1. **O que vai imprimir?** (peça decorativa, funcional, miniatura, protótipo...)
2. **Tem o arquivo 3D?** (.STL, .OBJ, .3MF) — Se não tiver, fazemos a modelagem!
3. **Qual o tamanho aproximado?**
4. **Precisa de algum material específico?**

Com essas informações, posso te direcionar para o melhor serviço e material.

Ou se preferir, vá direto para o **Orçamento** e envie seu arquivo — você verá uma prévia 3D na tela!`,
    quickReplies: ['Ir para Orçamento', 'Não tenho arquivo 3D', 'Materiais disponíveis', 'Preciso de modelagem'],
  },
};

const DEFAULT_RESPONSE = `Não encontrei uma resposta específica, mas posso te ajudar!

Posso te orientar sobre:
• **Serviços** — Impressão, modelagem, pintura, manutenção
• **Orçamento** — Como solicitar e prazos
• **Materiais** — PLA, ABS, PETG, TPU, Nylon, Resina
• **Impressoras** — Use nosso Consultor 3D!
• **Conhecimento** — Enciclopédia técnica completa

Se preferir falar com um humano, posso te direcionar para o WhatsApp!`;

const DEFAULT_QUICK_REPLIES = ['Ver serviços', 'Fazer orçamento', 'Consultor 3D', 'Falar no WhatsApp'];

const GREETING = `Olá! Bem-vindo à **3DKPRINT**! 

Sou o assistente virtual e estou aqui para te ajudar a encontrar exatamente o que precisa.

Antes de falar com nossa equipe no WhatsApp, posso te ajudar com:
• Informações sobre **serviços e materiais**
• **Orçamentos** de impressão, modelagem e pintura
• Encontrar a **impressora 3D ideal** para você
• Dúvidas técnicas sobre **impressão 3D**

Como posso ajudar?`;

const GREETING_QUICK_REPLIES = ['Quero imprimir algo', 'Fazer orçamento', 'Consultor 3D', 'Materiais disponíveis'];

// Contador de interações para funil
let interactionCount = 0;

/* ============================================================
   COMPONENTE CHATBOT — FUNIL INTELIGENTE
   ============================================================ */

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showPulse, setShowPulse] = useState(true);
  const [showAutoMessage, setShowAutoMessage] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      addBotMessage(GREETING, GREETING_QUICK_REPLIES);
      interactionCount = 0;
    }
  }, [isOpen]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Pulse animation
  useEffect(() => {
    const timer = setTimeout(() => setShowPulse(false), 10000);
    return () => clearTimeout(timer);
  }, []);

  // Auto message after 5 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!isOpen) setShowAutoMessage(true);
    }, 5000);
    const hideTimer = setTimeout(() => setShowAutoMessage(false), 15000);
    return () => { clearTimeout(timer); clearTimeout(hideTimer); };
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const addBotMessage = (text: string, quickReplies?: string[], isWhatsAppCTA?: boolean) => {
    const newMessage: Message = {
      id: Date.now().toString() + Math.random(),
      text,
      sender: 'bot',
      timestamp: new Date(),
      quickReplies,
      isWhatsAppCTA,
    };
    setMessages(prev => [...prev, newMessage]);
  };

  const addUserMessage = (text: string) => {
    const newMessage: Message = {
      id: Date.now().toString() + Math.random(),
      text,
      sender: 'user',
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, newMessage]);
  };

  const getBotResponse = (userMessage: string): { text: string; quickReplies?: string[]; isWhatsAppCTA?: boolean } => {
    const lowerMessage = userMessage.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    interactionCount++;

    // Saudações
    if (lowerMessage.match(/\b(oi|ola|hey|alo|bom dia|boa tarde|boa noite|eae|e ai)\b/)) {
      return { text: `Olá! Como posso ajudar você hoje?`, quickReplies: GREETING_QUICK_REPLIES };
    }

    // Agradecimentos
    if (lowerMessage.match(/\b(obrigad|valeu|thanks|brigado|grato)\b/)) {
      return { text: `Por nada! Fico feliz em ajudar. Precisa de mais alguma coisa?`, quickReplies: ['Fazer orçamento', 'Consultor 3D', 'Não, obrigado'] };
    }

    // Despedida
    if (lowerMessage.match(/\b(tchau|bye|ate mais|ate logo|falou|flw|nao obrigado)\b/)) {
      return { text: `Até mais! Se precisar de algo, estarei aqui 24/7. Boas impressões! 🖨️` };
    }

    // Navigation — Funil para páginas internas
    if (lowerMessage.includes('ir para orcamento') || lowerMessage.includes('fazer orcamento') || lowerMessage.includes('solicitar modelagem') || lowerMessage.includes('solicitar manutencao') || lowerMessage.includes('orcamento de pintura')) {
      const page = lowerMessage.includes('modelagem') ? '/orcamento-modelagem' : lowerMessage.includes('manutencao') ? '/orcamento-manutencao' : lowerMessage.includes('pintura') ? '/orcamento-pintura' : '/orcamento';
      return { text: `Perfeito! Acesse a página de orçamento:\n\n👉 **${page}**\n\nLá você pode enviar seu arquivo 3D e ver uma prévia 3D do modelo antes de solicitar!`, quickReplies: ['Materiais disponíveis', 'Prazos de entrega'] };
    }

    if (lowerMessage.includes('ir para consultor') || lowerMessage.includes('consultor 3d')) {
      return { text: `Ótima escolha! O Consultor 3D vai te ajudar a encontrar a impressora ideal.\n\n👉 Acesse pelo menu: **Consultor 3D**\n\nSão apenas 5 perguntas rápidas e você recebe recomendações personalizadas!`, quickReplies: ['Fazer orçamento', 'Página de Conhecimento'] };
    }

    if (lowerMessage.includes('ir para comunidade')) {
      return { text: `Acesse a página de **Comunidade** pelo menu!\n\nLá você encontra 4 grupos de WhatsApp ativos:\n- Comunidade 3D Brasil\n- Vendas 3D Brasil\n- 3D Resina Brasil\n- STL Compartilha`, quickReplies: ['Página de Conhecimento', 'Consultor 3D'] };
    }

    if (lowerMessage.includes('ir para conhecimento') || lowerMessage.includes('pagina de conhecimento') || lowerMessage.includes('quero aprender')) {
      return { text: `Nossa enciclopédia técnica tem tudo sobre impressão 3D!\n\n👉 Acesse pelo menu: **Conhecimento**\n\nConteúdo sobre firmwares, filamentos, tecnologias, tipos de impressoras e muito mais!`, quickReplies: ['Consultor 3D', 'Materiais disponíveis'] };
    }

    // Falar no WhatsApp — Funil final
    if (lowerMessage.includes('falar no whatsapp') || lowerMessage.includes('falar com atendente') || lowerMessage.includes('falar com humano') || lowerMessage.includes('whatsapp')) {
      return {
        text: `Claro! Nossa equipe está pronta para te atender:\n\n**WhatsApp:** (43) 9 9174-1518\n**Horário:** Seg-Sex 8h-18h | Sáb 9h-13h\n\nClique no botão abaixo para abrir o WhatsApp:`,
        quickReplies: ['Abrir WhatsApp'],
        isWhatsAppCTA: true,
      };
    }

    // Budget quick replies for impressora
    if (lowerMessage.includes('ate r$1.500') || lowerMessage.includes('ate 1500') || lowerMessage.includes('ate r$ 1.500')) {
      return { text: `Para até R$1.500, as melhores opções são:\n\n**Creality Ender 3 V3 SE** (R$800-1.200)\n- Auto-nivelamento, Direct Drive, boa comunidade\n- Ideal para iniciantes\n\n**Creality Ender 3 V3** (R$1.500-2.200)\n- Klipper nativo, guias lineares, 600mm/s!\n- Melhor custo-benefício da categoria\n\nUse o **Consultor 3D** para uma análise mais completa!`, quickReplies: ['Ir para Consultor 3D', 'Fazer orçamento', 'Preciso de ajuda'] };
    }
    if (lowerMessage.includes('r$1.500 a r$3.000') || lowerMessage.includes('1500 a 3000')) {
      return { text: `Para R$1.500-3.000, excelentes opções:\n\n**Bambu Lab A1 Mini** (R$1.800-2.500)\n- Plug and play, multi-cor, calibração automática\n\n**Anycubic Kobra 3** (R$2.500-3.500)\n- Klipper, guias lineares, multi-cor\n\n**Elegoo Saturn 4 Ultra** (R$3.000-5.000) — Resina\n- 12K resolução, detalhes incríveis\n\nUse o **Consultor 3D** para comparativos detalhados!`, quickReplies: ['Ir para Consultor 3D', 'Fazer orçamento'] };
    }
    if (lowerMessage.includes('acima de r$3.000') || lowerMessage.includes('acima de 3000')) {
      return { text: `Para acima de R$3.000, as melhores do mercado:\n\n**Bambu Lab P1S** (R$4.500-6.000)\n- CoreXY, câmara fechada, AMS multi-cor\n\n**Bambu Lab X1 Carbon** (R$8.000-12.000)\n- Topo de linha, LiDAR, IA, fibra de carbono\n\n**Voron 2.4** (R$4.000-10.000 kit)\n- Open-source, CoreXY+Klipper, customizável\n\nUse o **Consultor 3D** para a recomendação perfeita!`, quickReplies: ['Ir para Consultor 3D', 'Fazer orçamento'] };
    }

    // Buscar na base de conhecimento
    for (const [, data] of Object.entries(KNOWLEDGE_BASE)) {
      for (const keyword of data.keywords) {
        const normalizedKeyword = keyword.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
        if (lowerMessage.includes(normalizedKeyword)) {
          // Após 3+ interações, sugerir WhatsApp como opção
          const qr = data.quickReplies ? [...data.quickReplies] : [];
          if (interactionCount >= 3 && !qr.includes('Falar no WhatsApp')) {
            qr.push('Falar no WhatsApp');
          }
          return { text: data.response, quickReplies: qr };
        }
      }
    }

    // Default — após muitas interações, sugerir WhatsApp
    const qr = [...DEFAULT_QUICK_REPLIES];
    if (interactionCount >= 2 && !qr.includes('Falar no WhatsApp')) {
      qr.push('Falar no WhatsApp');
    }
    return { text: DEFAULT_RESPONSE, quickReplies: qr };
  };

  const handleSend = (text?: string) => {
    const messageText = text || inputText.trim();
    if (!messageText) return;

    // Se clicar em "Abrir WhatsApp", redirecionar
    if (messageText === 'Abrir WhatsApp') {
      window.open('https://wa.me/5543991741518?text=Olá! Vim pelo site 3DKPRINT e gostaria de mais informações.', '_blank');
      addUserMessage(messageText);
      setTimeout(() => addBotMessage('WhatsApp aberto! Nossa equipe vai te responder em breve. Enquanto isso, posso ajudar com mais alguma coisa?', ['Fazer orçamento', 'Consultor 3D', 'Não, obrigado']), 500);
      return;
    }

    // Links de navegação
    if (messageText === 'Ir para Orçamento') { window.location.href = '/orcamento'; return; }
    if (messageText === 'Ir para Consultor 3D') { window.location.href = '/consultor-3d'; return; }
    if (messageText === 'Ir para Comunidade') { window.location.href = '/comunidade'; return; }
    if (messageText === 'Ir para Conhecimento') { window.location.href = '/conhecimento'; return; }
    if (messageText === 'Ver portfólio') { window.location.href = '/portfolio'; return; }
    if (messageText === 'Solicitar modelagem') { window.location.href = '/orcamento-modelagem'; return; }
    if (messageText === 'Solicitar manutenção') { window.location.href = '/orcamento-manutencao'; return; }
    if (messageText === 'Orçamento de Pintura') { window.location.href = '/orcamento-pintura'; return; }

    addUserMessage(messageText);
    setInputText('');

    setIsTyping(true);
    const delay = Math.min(800 + messageText.length * 20, 2000);
    setTimeout(() => {
      const response = getBotResponse(messageText);
      addBotMessage(response.text, response.quickReplies, response.isWhatsAppCTA);
      setIsTyping(false);
    }, delay);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleReset = () => {
    setMessages([]);
    interactionCount = 0;
    setTimeout(() => addBotMessage(GREETING, GREETING_QUICK_REPLIES), 300);
  };

  return (
    <>
      {/* Botão Flutuante do Chat */}
      {!isOpen && (
        <div className="fixed bottom-6 right-6 z-50">
          {/* Auto message bubble */}
          {showAutoMessage && (
            <div className="absolute bottom-full right-0 mb-3 animate-fade-in">
              <div className="bg-white text-gray-800 text-sm font-medium px-4 py-3 rounded-2xl rounded-br-md shadow-lg border border-gray-200 max-w-[250px]">
                <p>Olá! Posso te ajudar a encontrar o que precisa? 💬</p>
                <div className="absolute bottom-0 right-4 w-3 h-3 bg-white border-r border-b border-gray-200 transform translate-y-1.5 rotate-45"></div>
              </div>
            </div>
          )}
          <button
            onClick={() => { setIsOpen(true); setShowPulse(false); setShowAutoMessage(false); }}
            className="group relative"
            aria-label="Abrir chat"
          >
            <div className="relative">
              {showPulse && (
                <div className="absolute inset-0 bg-blue-500 rounded-full animate-ping opacity-30" />
              )}
              <div className="relative bg-gradient-to-br from-blue-600 to-indigo-700 text-white p-4 rounded-full shadow-lg hover:shadow-xl hover:scale-110 transition-all">
                <MessageCircle className="h-6 w-6" />
              </div>
              {/* Notification dot */}
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-white flex items-center justify-center">
                <span className="text-[8px] text-white font-bold">1</span>
              </div>
            </div>
          </button>
        </div>
      )}

      {/* Janela do Chat */}
      {isOpen && (
        <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 w-[calc(100vw-2rem)] sm:w-[400px] h-[min(600px,calc(100vh-3rem))] bg-white rounded-2xl shadow-2xl flex flex-col z-50 border border-gray-200 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 text-white p-4 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="p-2 bg-white/20 rounded-full backdrop-blur-sm">
                  <Bot className="h-5 w-5" />
                </div>
                <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-400 rounded-full border-2 border-blue-700" />
              </div>
              <div>
                <h3 className="font-bold text-sm">Assistente 3DKPRINT</h3>
                <p className="text-[11px] text-blue-200">Online — Tire suas dúvidas aqui!</p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button onClick={handleReset} className="hover:bg-white/20 p-2 rounded-full transition-colors" aria-label="Reiniciar conversa" title="Reiniciar conversa">
                <RotateCcw className="h-4 w-4" />
              </button>
              <button onClick={() => setIsOpen(false)} className="hover:bg-white/20 p-2 rounded-full transition-colors" aria-label="Fechar chat">
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Mensagens */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-gray-50 to-white">
            {messages.map((message) => (
              <div key={message.id}>
                <div className={`flex gap-2 ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                  {message.sender === 'bot' && (
                    <div className="flex-shrink-0 w-7 h-7 bg-blue-100 rounded-full flex items-center justify-center mt-1">
                      <Bot className="h-4 w-4 text-blue-600" />
                    </div>
                  )}
                  <div className={`max-w-[80%] rounded-2xl px-4 py-3 ${message.sender === 'user' ? 'bg-blue-600 text-white rounded-br-md' : 'bg-white text-gray-800 border border-gray-200 rounded-bl-md shadow-sm'}`}>
                    <p className="text-[13px] leading-relaxed whitespace-pre-line">{message.text}</p>
                    <p className={`text-[10px] mt-1.5 ${message.sender === 'user' ? 'text-blue-200' : 'text-gray-400'}`}>
                      {message.timestamp.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                  {message.sender === 'user' && (
                    <div className="flex-shrink-0 w-7 h-7 bg-gray-200 rounded-full flex items-center justify-center mt-1">
                      <User className="h-4 w-4 text-gray-600" />
                    </div>
                  )}
                </div>

                {/* WhatsApp CTA Button */}
                {message.isWhatsAppCTA && (
                  <div className="ml-9 mt-3">
                    <a
                      href="https://wa.me/5543991741518?text=Olá! Vim pelo site 3DKPRINT e gostaria de mais informações."
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-5 py-3 rounded-xl text-sm font-bold transition-colors shadow-md"
                    >
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                      Abrir WhatsApp
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>
                )}

                {/* Quick Replies */}
                {message.sender === 'bot' && message.quickReplies && (
                  <div className="flex flex-wrap gap-2 mt-2 ml-9">
                    {message.quickReplies.filter(r => r !== 'Abrir WhatsApp').map((reply, i) => (
                      <button
                        key={i}
                        onClick={() => handleSend(reply)}
                        className={`text-[11px] px-3 py-1.5 rounded-full transition-colors flex items-center gap-1 ${
                          reply === 'Falar no WhatsApp'
                            ? 'bg-green-50 text-green-700 border border-green-200 hover:bg-green-100'
                            : 'bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100'
                        }`}
                      >
                        <ChevronRight className="w-3 h-3" />
                        {reply}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {isTyping && (
              <div className="flex gap-2 justify-start">
                <div className="flex-shrink-0 w-7 h-7 bg-blue-100 rounded-full flex items-center justify-center">
                  <Bot className="h-4 w-4 text-blue-600" />
                </div>
                <div className="bg-white border border-gray-200 rounded-2xl rounded-bl-md px-4 py-3 shadow-sm">
                  <div className="flex gap-1.5">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-3 border-t border-gray-100 bg-white shrink-0">
            <div className="flex gap-2">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder="Digite sua dúvida..."
                className="flex-1 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <button
                onClick={() => handleSend()}
                disabled={!inputText.trim()}
                className="bg-blue-600 text-white p-2.5 rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                aria-label="Enviar mensagem"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
            <p className="text-[10px] text-gray-400 text-center mt-2">
              Tire suas dúvidas aqui antes de falar com nossa equipe
            </p>
          </div>
        </div>
      )}
    </>
  );
}
