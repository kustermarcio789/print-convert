import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, ExternalLink, ChevronDown, ChevronRight, Zap, Clock, Cpu, Settings, Layers, Maximize, Thermometer, Shield, Wrench, Box, Printer, Gauge, ArrowRight, CheckCircle, XCircle, AlertTriangle, Star, Target, Cog, Package } from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';

/* ============================================================
   DADOS TÉCNICOS COMPLETOS
   ============================================================ */

// ---- KLIPPER VS MARLIN ----
const klipperVsMarlin = [
  {
    category: 'Arquitetura de Processamento',
    klipper: 'Utiliza um computador externo (Raspberry Pi, Orange Pi ou PC) como host principal. O firmware na placa da impressora apenas executa comandos de baixo nível, enquanto toda a cinemática, cálculos de aceleração e lógica complexa rodam no processador ARM do host, que é centenas de vezes mais potente que um microcontrolador ATmega ou STM32.',
    marlin: 'Firmware monolítico que roda inteiramente no microcontrolador da placa-mãe da impressora (ATmega2560, STM32F1/F4). Toda a lógica de movimento, interface e comunicação é processada no mesmo chip, o que limita a complexidade dos cálculos possíveis em tempo real.',
    vantagem: 'klipper'
  },
  {
    category: 'Velocidade de Impressão',
    klipper: 'Suporta velocidades de 300-600+ mm/s com acelerações de 10.000-20.000 mm/s². O Input Shaper compensa vibrações mecânicas em alta velocidade, permitindo imprimir rápido sem perder qualidade. Ideal para impressoras CoreXY modernas.',
    marlin: 'Tipicamente limitado a 60-150 mm/s em impressoras cartesianas tradicionais. Versões mais recentes (2.1+) suportam Input Shaping básico, mas a capacidade de processamento limita as acelerações máximas práticas a 3.000-5.000 mm/s².',
    vantagem: 'klipper'
  },
  {
    category: 'Configuração e Edição',
    klipper: 'Configuração via arquivo de texto simples (printer.cfg). Alterações são aplicadas com um simples restart do firmware, sem necessidade de recompilação. Macros em G-Code permitem automações complexas. Interface web (Mainsail/Fluidd) para controle remoto.',
    marlin: 'Configuração via arquivos C++ (Configuration.h e Configuration_adv.h). Cada alteração requer recompilação e upload do firmware via USB. Processo mais demorado, mas existem milhares de perfis pré-configurados para impressoras populares.',
    vantagem: 'klipper'
  },
  {
    category: 'Pressure Advance / Linear Advance',
    klipper: 'Pressure Advance com algoritmo avançado que compensa a compressão do filamento no hotend. Calibração simples via macro de teste. Funciona excepcionalmente bem em alta velocidade, reduzindo blobbing em cantos e oozing em retrações.',
    marlin: 'Linear Advance (LA) com funcionalidade similar. Versão 1.5 é estável e funcional. Requer calibração manual via torre de teste. Alguns drivers (TMC em modo StealthChop) podem ter incompatibilidades com LA ativo.',
    vantagem: 'empate'
  },
  {
    category: 'Input Shaping (Compensação de Vibração)',
    klipper: 'Input Shaper nativo com suporte a acelerômetro ADXL345/LIS2DW. Mede automaticamente as frequências de ressonância da impressora e aplica filtros (ZV, MZV, EI, 2HUMP_EI) para eliminar ghosting/ringing mesmo em velocidades extremas.',
    marlin: 'Input Shaping adicionado nas versões mais recentes (2.1.3+), mas com implementação mais básica. Suporte a acelerômetro ainda em desenvolvimento. Para a maioria dos usuários de Marlin, a solução é simplesmente reduzir a velocidade.',
    vantagem: 'klipper'
  },
  {
    category: 'Compatibilidade e Comunidade',
    klipper: 'Comunidade crescente e muito ativa. Requer hardware adicional (Raspberry Pi ~R$200-400). Compatível com a maioria das placas 32-bit. Não funciona bem com placas 8-bit antigas. Documentação oficial excelente em klipper3d.org.',
    marlin: 'A maior comunidade de firmware 3D do mundo. Compatível com praticamente todas as impressoras do mercado, incluindo placas 8-bit antigas. Milhares de tutoriais no YouTube. Suporte nativo na maioria das impressoras vendidas comercialmente.',
    vantagem: 'marlin'
  },
  {
    category: 'Interface e Controle Remoto',
    klipper: 'Interfaces web modernas: Mainsail (mais popular), Fluidd, OctoPrint. Controle total via navegador ou celular. Webcam integrada para monitoramento. Macros para automação (desligar após impressão, pré-aquecimento, etc.).',
    marlin: 'Tela LCD/TFT na impressora (interface física). Controle remoto via OctoPrint (requer Raspberry Pi separado). Algumas impressoras modernas com Marlin oferecem apps próprios (ex: Creality Print).',
    vantagem: 'klipper'
  },
  {
    category: 'Facilidade para Iniciantes',
    klipper: 'Curva de aprendizado mais íngreme. Requer conhecimento básico de Linux, SSH e edição de arquivos de configuração. A instalação inicial pode ser desafiadora para quem nunca usou terminal. Porém, uma vez configurado, é mais fácil de ajustar.',
    marlin: 'Mais amigável para iniciantes. A maioria das impressoras já vem com Marlin pré-instalado e configurado. Para uso básico, não é necessário nenhum conhecimento de firmware. Ideal para quem quer imprimir "out of the box".',
    vantagem: 'marlin'
  },
];

// ---- FILAMENTOS ----
const filamentos = [
  {
    nome: 'PLA (Ácido Polilático)',
    sigla: 'PLA',
    cor: '#4CAF50',
    tempExtrusao: '190-220°C',
    tempMesa: '50-60°C',
    dificuldade: 'Fácil',
    resistenciaMecanica: 3,
    resistenciaTermica: 2,
    flexibilidade: 1,
    facilidadeImpressao: 5,
    descricao: 'O filamento mais popular e amigável para iniciantes. Derivado de fontes renováveis (amido de milho), é biodegradável e não emite odores fortes durante a impressão. Excelente para protótipos, peças decorativas, cosplay e projetos educacionais.',
    aplicacoes: ['Protótipos visuais', 'Miniaturas e figuras', 'Peças decorativas', 'Projetos educacionais', 'Cosplay e adereços'],
    vantagens: ['Fácil de imprimir', 'Sem warping', 'Biodegradável', 'Cores vibrantes', 'Baixo custo'],
    desvantagens: ['Baixa resistência térmica (60°C)', 'Frágil sob impacto', 'Degrada com UV', 'Não ideal para peças mecânicas'],
    preco: '$$',
  },
  {
    nome: 'ABS (Acrilonitrila Butadieno Estireno)',
    sigla: 'ABS',
    cor: '#F44336',
    tempExtrusao: '230-250°C',
    tempMesa: '100-110°C',
    dificuldade: 'Intermediário',
    resistenciaMecanica: 4,
    resistenciaTermica: 4,
    flexibilidade: 2,
    facilidadeImpressao: 2,
    descricao: 'Material clássico da indústria, usado em peças LEGO e carcaças de eletrônicos. Oferece boa resistência mecânica e térmica, mas requer câmara fechada (enclosure) para evitar warping e emite gases tóxicos (estireno) durante a impressão.',
    aplicacoes: ['Carcaças de eletrônicos', 'Peças automotivas', 'Ferramentas', 'Peças mecânicas', 'Protótipos funcionais'],
    vantagens: ['Alta resistência térmica (105°C)', 'Boa resistência a impacto', 'Pode ser lixado e pintado', 'Acetona para acabamento liso'],
    desvantagens: ['Warping severo sem enclosure', 'Emite gases tóxicos', 'Requer mesa aquecida 100°C+', 'Difícil para iniciantes'],
    preco: '$$',
  },
  {
    nome: 'PETG (Polietileno Tereftalato Glicol)',
    sigla: 'PETG',
    cor: '#2196F3',
    tempExtrusao: '220-250°C',
    tempMesa: '70-80°C',
    dificuldade: 'Fácil-Intermediário',
    resistenciaMecanica: 4,
    resistenciaTermica: 3,
    flexibilidade: 3,
    facilidadeImpressao: 4,
    descricao: 'O melhor equilíbrio entre facilidade de impressão e propriedades mecânicas. Combina a facilidade do PLA com a resistência do ABS. Excelente para peças funcionais, recipientes para alimentos (food-safe) e aplicações que exigem resistência química.',
    aplicacoes: ['Peças funcionais', 'Recipientes food-safe', 'Peças externas', 'Suportes e brackets', 'Vasos e recipientes'],
    vantagens: ['Resistente e flexível', 'Pouco warping', 'Food-safe', 'Resistência química', 'Boa aderência entre camadas'],
    desvantagens: ['Stringing (fios)', 'Difícil de lixar', 'Absorve umidade', 'Superfície menos lisa que PLA'],
    preco: '$$',
  },
  {
    nome: 'TPU (Poliuretano Termoplástico)',
    sigla: 'TPU',
    cor: '#9C27B0',
    tempExtrusao: '210-230°C',
    tempMesa: '50-60°C',
    dificuldade: 'Intermediário-Avançado',
    resistenciaMecanica: 3,
    resistenciaTermica: 3,
    flexibilidade: 5,
    facilidadeImpressao: 2,
    descricao: 'Filamento flexível semelhante a borracha. Ideal para capas de celular, amortecedores, vedações, pneus de robôs e qualquer peça que precise absorver impacto ou flexionar. Requer extrusora Direct Drive para melhores resultados.',
    aplicacoes: ['Capas de celular', 'Vedações e juntas', 'Amortecedores', 'Pneus de robôs', 'Solas de sapato'],
    vantagens: ['Extremamente flexível', 'Absorve impacto', 'Resistente a abrasão', 'Durável', 'Resistente a óleos'],
    desvantagens: ['Difícil com Bowden', 'Impressão lenta (20-30mm/s)', 'Stringing excessivo', 'Requer Direct Drive'],
    preco: '$$$',
  },
  {
    nome: 'Nylon (Poliamida)',
    sigla: 'PA',
    cor: '#FF9800',
    tempExtrusao: '240-270°C',
    tempMesa: '70-90°C',
    dificuldade: 'Avançado',
    resistenciaMecanica: 5,
    resistenciaTermica: 4,
    flexibilidade: 4,
    facilidadeImpressao: 1,
    descricao: 'Material de engenharia com resistência mecânica excepcional. Usado em engrenagens, dobradiças, peças industriais e aplicações que exigem resistência ao desgaste. Absorve muita umidade e DEVE ser seco antes da impressão.',
    aplicacoes: ['Engrenagens e polias', 'Dobradiças funcionais', 'Peças industriais', 'Ferramentas', 'Componentes de drones'],
    vantagens: ['Resistência excepcional', 'Auto-lubrificante', 'Resistente ao desgaste', 'Flexível e forte', 'Longa durabilidade'],
    desvantagens: ['Absorve umidade rapidamente', 'Warping severo', 'Requer enclosure', 'Difícil aderência à mesa', 'Caro'],
    preco: '$$$$',
  },
  {
    nome: 'ASA (Acrilonitrila Estireno Acrilato)',
    sigla: 'ASA',
    cor: '#795548',
    tempExtrusao: '235-255°C',
    tempMesa: '90-110°C',
    dificuldade: 'Intermediário',
    resistenciaMecanica: 4,
    resistenciaTermica: 4,
    flexibilidade: 2,
    facilidadeImpressao: 3,
    descricao: 'O "ABS para uso externo". Oferece as mesmas propriedades mecânicas do ABS, mas com excelente resistência a raios UV e intempéries. Ideal para peças que ficam expostas ao sol e chuva, como suportes de câmeras, caixas de jardim e peças automotivas externas.',
    aplicacoes: ['Peças externas (sol/chuva)', 'Suportes de câmeras', 'Peças automotivas', 'Caixas de jardim', 'Sinalização externa'],
    vantagens: ['Resistente a UV', 'Resistente a intempéries', 'Boa resistência mecânica', 'Estável dimensionalmente'],
    desvantagens: ['Requer enclosure', 'Emite gases', 'Mais caro que ABS', 'Warping moderado'],
    preco: '$$$',
  },
  {
    nome: 'PC (Policarbonato)',
    sigla: 'PC',
    cor: '#607D8B',
    tempExtrusao: '260-310°C',
    tempMesa: '100-120°C',
    dificuldade: 'Avançado',
    resistenciaMecanica: 5,
    resistenciaTermica: 5,
    flexibilidade: 2,
    facilidadeImpressao: 1,
    descricao: 'Um dos materiais mais resistentes disponíveis para impressão 3D FDM. Usado em viseiras de capacete, janelas à prova de bala e componentes aeroespaciais. Requer temperaturas muito altas e enclosure obrigatório.',
    aplicacoes: ['Componentes estruturais', 'Peças transparentes', 'Proteções de segurança', 'Peças aeroespaciais', 'Lentes e viseiras'],
    vantagens: ['Extremamente resistente', 'Transparente', 'Resistência térmica 140°C+', 'Resistente a impacto'],
    desvantagens: ['Temp. muito altas (310°C)', 'Enclosure obrigatório', 'Absorve umidade', 'Requer all-metal hotend'],
    preco: '$$$$',
  },
  {
    nome: 'CF-Nylon (Nylon com Fibra de Carbono)',
    sigla: 'CF-PA',
    cor: '#212121',
    tempExtrusao: '250-280°C',
    tempMesa: '70-90°C',
    dificuldade: 'Avançado',
    resistenciaMecanica: 5,
    resistenciaTermica: 5,
    flexibilidade: 2,
    facilidadeImpressao: 1,
    descricao: 'O topo da cadeia de filamentos FDM. Nylon reforçado com fibras de carbono oferece rigidez e resistência comparáveis a alumínio em certas aplicações. Usado em drones de corrida, peças de robótica e ferramental industrial. Requer bico de aço endurecido.',
    aplicacoes: ['Frames de drones', 'Peças de robótica', 'Ferramental industrial', 'Próteses', 'Peças estruturais leves'],
    vantagens: ['Rigidez excepcional', 'Leve como alumínio', 'Resistência térmica alta', 'Acabamento profissional'],
    desvantagens: ['Muito caro', 'Desgasta bicos de latão', 'Requer bico hardened steel', 'Absorve umidade'],
    preco: '$$$$$',
  },
];

// ---- RESINAS ----
const resinas = [
  {
    nome: 'Resina Standard (Padrão)',
    sigla: 'STD',
    cor: '#9C27B0',
    tempCura: '2-4s por camada',
    comprimentoOnda: '405nm UV',
    dificuldade: 'Fácil',
    detalhes: 5,
    resistenciaMecanica: 2,
    flexibilidade: 1,
    facilidadeUso: 4,
    descricao: 'A resina mais comum e acessível. Ideal para miniaturas, figuras decorativas e protótipos visuais. Oferece excelente resolução de detalhes e acabamento liso, mas é relativamente frágil e quebradiça. Disponível em grande variedade de cores, incluindo transparente.',
    aplicacoes: ['Miniaturas de RPG/Wargame', 'Figuras decorativas', 'Protótipos visuais', 'Modelos arquitetônicos', 'Bijuterias simples'],
    vantagens: ['Preço acessível (R$80-120/kg)', 'Excelente resolução de detalhes', 'Cura rápida', 'Grande variedade de cores', 'Fácil de usar para iniciantes'],
    desvantagens: ['Frágil e quebradiça', 'Baixa resistência a impacto', 'Amarela com exposição UV prolongada', 'Odor moderado durante impressão'],
    preco: '$$',
    dicasPosProcessamento: 'Lavar em IPA 95%+ por 3-5 minutos. Curar em câmara UV por 5-10 minutos. Remover suportes antes da cura final para facilitar.',
  },
  {
    nome: 'Resina Water-Washable (Lavável em Água)',
    sigla: 'WW',
    cor: '#00BCD4',
    tempCura: '2-5s por camada',
    comprimentoOnda: '405nm UV',
    dificuldade: 'Fácil',
    detalhes: 4,
    resistenciaMecanica: 2,
    flexibilidade: 1,
    facilidadeUso: 5,
    descricao: 'Resina que pode ser limpa apenas com água, eliminando a necessidade de álcool isopropílico (IPA). Ideal para iniciantes e quem não quer lidar com solventes. A qualidade de detalhes é ligeiramente inferior à standard, mas a conveniência compensa.',
    aplicacoes: ['Miniaturas (iniciantes)', 'Protótipos rápidos', 'Peças decorativas', 'Uso educacional', 'Hobby e artesanato'],
    vantagens: ['Sem necessidade de IPA', 'Limpeza fácil com água', 'Menos odor', 'Ideal para iniciantes', 'Mais segura de manusear'],
    desvantagens: ['Detalhes ligeiramente inferiores', 'Pode inchar se deixada na água', 'Menos resistente que standard', 'NUNCA descartar água de lavagem no ralo (tóxica)'],
    preco: '$$',
    dicasPosProcessamento: 'Lavar em água morna por 2-3 minutos. Secar completamente antes de curar UV. IMPORTANTE: a água de lavagem deve ser exposta ao sol para curar resíduos antes do descarte.',
  },
  {
    nome: 'Resina Tough / ABS-Like',
    sigla: 'TOUGH',
    cor: '#FF5722',
    tempCura: '3-6s por camada',
    comprimentoOnda: '405nm UV',
    dificuldade: 'Intermediário',
    detalhes: 4,
    resistenciaMecanica: 4,
    flexibilidade: 2,
    facilidadeUso: 3,
    descricao: 'Resina formulada para simular as propriedades mecânicas do ABS. Muito mais resistente a impacto que a resina standard, com alguma flexibilidade antes de quebrar. Ideal para peças funcionais, encaixes snap-fit e protótipos que precisam de resistência.',
    aplicacoes: ['Peças funcionais', 'Encaixes snap-fit', 'Protótipos mecânicos', 'Cases e carcaças', 'Ferramentas leves'],
    vantagens: ['Resistente a impacto', 'Alguma flexibilidade', 'Boa resolução de detalhes', 'Ideal para peças funcionais', 'Simula propriedades do ABS'],
    desvantagens: ['Mais cara que standard', 'Cura mais lenta', 'Requer pós-cura mais longa', 'Pode ter leve shrinkage'],
    preco: '$$$',
    dicasPosProcessamento: 'Lavar em IPA por 3-5 minutos. Curar UV por 15-20 minutos para máxima resistência. Pós-cura mais longa = peça mais forte.',
  },
  {
    nome: 'Resina Flexível (Flex/Elastic)',
    sigla: 'FLEX',
    cor: '#E91E63',
    tempCura: '4-8s por camada',
    comprimentoOnda: '405nm UV',
    dificuldade: 'Intermediário',
    detalhes: 3,
    resistenciaMecanica: 2,
    flexibilidade: 5,
    facilidadeUso: 2,
    descricao: 'Resina com propriedades elásticas semelhantes à borracha. Após curada, a peça pode ser dobrada e flexionada sem quebrar. Ideal para vedações, amortecedores, solas de sapato em miniatura e qualquer peça que precise de elasticidade.',
    aplicacoes: ['Vedações e juntas', 'Amortecedores', 'Modelos anatômicos flexíveis', 'Capas protetoras', 'Solas e palmilhas (protótipo)'],
    vantagens: ['Altamente flexível', 'Resistente a rasgos', 'Boa elongação', 'Absorve impacto', 'Toque emborrachado'],
    desvantagens: ['Difícil de remover suportes', 'Detalhes finos limitados', 'Cura mais lenta', 'Preço elevado', 'Pode grudar na FEP'],
    preco: '$$$$',
    dicasPosProcessamento: 'Lavar em IPA por 5-8 minutos (cuidado para não deformar). Curar UV por 5-10 minutos apenas — cura excessiva torna a peça rígida.',
  },
  {
    nome: 'Resina Dental / Biocompatível',
    sigla: 'DENTAL',
    cor: '#FFC107',
    tempCura: '5-10s por camada',
    comprimentoOnda: '405nm UV',
    dificuldade: 'Avançado',
    detalhes: 5,
    resistenciaMecanica: 4,
    flexibilidade: 1,
    facilidadeUso: 2,
    descricao: 'Resinas certificadas para uso odontológico e médico. Biocompatíveis (Classe I ou II), podem ser usadas para guias cirúrgicos, modelos dentários, placas de bruxismo e alinhadores. Requerem pós-processamento rigoroso e certificação da impressora.',
    aplicacoes: ['Modelos dentários', 'Guias cirúrgicos', 'Placas de bruxismo', 'Alinhadores transparentes', 'Provisórios dentários'],
    vantagens: ['Biocompatível certificada', 'Precisão dimensional excepcional', 'Aprovada para uso intraoral', 'Resistente e durável', 'Acabamento profissional'],
    desvantagens: ['Muito cara (R$300-600/kg)', 'Requer pós-processamento rigoroso', 'Necessita impressora calibrada', 'Regulamentação específica', 'Prazo de validade curto'],
    preco: '$$$$$',
    dicasPosProcessamento: 'Protocolo rigoroso: lavar em IPA 99% por 3 min, secar, curar UV a 60°C por 30-60 min. Seguir instruções do fabricante para certificação.',
  },
  {
    nome: 'Resina Calcinável (Castable)',
    sigla: 'CAST',
    cor: '#FF6F00',
    tempCura: '4-8s por camada',
    comprimentoOnda: '405nm UV',
    dificuldade: 'Avançado',
    detalhes: 5,
    resistenciaMecanica: 1,
    flexibilidade: 1,
    facilidadeUso: 2,
    descricao: 'Resina projetada para ser completamente queimada (calcinada) em forno, deixando zero resíduo de cinzas. Usada no processo de fundição por cera perdida para criar joias em ouro, prata e outros metais. A peça impressa serve como modelo para o molde.',
    aplicacoes: ['Joalheria (anéis, brincos, pingentes)', 'Fundição de metais preciosos', 'Próteses dentárias metálicas', 'Peças industriais fundidas', 'Esculturas em metal'],
    vantagens: ['Zero resíduo de cinzas', 'Detalhes ultra-finos', 'Compatível com fundição tradicional', 'Superfície lisa perfeita', 'Reproduz detalhes microscópicos'],
    desvantagens: ['Muito frágil (apenas para molde)', 'Cara (R$250-500/kg)', 'Requer forno de calcinação', 'Não é peça final', 'Processo complexo'],
    preco: '$$$$$',
    dicasPosProcessamento: 'Lavar em IPA, curar UV levemente. Embutir em gesso refratário. Calcinar em forno seguindo rampa: 150°C→350°C→730°C. Fundir metal no molde.',
  },
  {
    nome: 'Resina de Alta Temperatura',
    sigla: 'HT',
    cor: '#795548',
    tempCura: '5-8s por camada',
    comprimentoOnda: '405nm UV',
    dificuldade: 'Avançado',
    detalhes: 4,
    resistenciaMecanica: 4,
    flexibilidade: 1,
    facilidadeUso: 2,
    descricao: 'Resina formulada para suportar temperaturas elevadas (até 200-300°C) após pós-cura térmica. Ideal para moldes de injeção de baixa tiragem, protótipos que serão expostos a calor e peças próximas a motores ou fontes de calor.',
    aplicacoes: ['Moldes de injeção (baixa tiragem)', 'Peças próximas a motores', 'Protótipos automotivos', 'Ferramental industrial', 'Testes de resistência térmica'],
    vantagens: ['Suporta até 200-300°C', 'Boa rigidez', 'Estabilidade dimensional em calor', 'Ideal para moldes', 'Resistência química'],
    desvantagens: ['Requer pós-cura térmica em forno', 'Frágil à temperatura ambiente', 'Cara', 'Processo complexo', 'Disponibilidade limitada'],
    preco: '$$$$',
    dicasPosProcessamento: 'Lavar em IPA, curar UV, depois pós-cura térmica em forno: rampa lenta até 160°C por 2-3 horas para atingir HDT máximo.',
  },
  {
    nome: 'Resina Transparente (Clear)',
    sigla: 'CLEAR',
    cor: '#B3E5FC',
    tempCura: '3-5s por camada',
    comprimentoOnda: '405nm UV',
    dificuldade: 'Intermediário',
    detalhes: 5,
    resistenciaMecanica: 2,
    flexibilidade: 1,
    facilidadeUso: 3,
    descricao: 'Resina que produz peças transparentes ou translúcidas. Com pós-processamento adequado (lixamento progressivo e verniz), pode atingir transparência próxima ao vidro. Ideal para lentes, difusores de luz, protótipos de embalagens e peças decorativas.',
    aplicacoes: ['Lentes e difusores', 'Protótipos de embalagens', 'Peças decorativas iluminadas', 'Modelos de fluidos', 'Cases transparentes'],
    vantagens: ['Transparência quando polida', 'Excelente resolução', 'Efeito visual impressionante', 'Boa para protótipos de vidro', 'Versátil'],
    desvantagens: ['Requer polimento extenso', 'Amarela com UV prolongado', 'Frágil como standard', 'Marcas de suporte visíveis', 'Pós-processamento trabalhoso'],
    preco: '$$$',
    dicasPosProcessamento: 'Lavar em IPA, curar UV. Para transparência: lixar progressivamente (400→800→1200→2000), aplicar verniz transparente UV ou mergulhar em resina e curar novamente.',
  },
];

// ---- FDM VS RESINA ----
const fdmVsResina = [
  { aspecto: 'Resolução', fdm: '100-400 microns (camada)', resina: '25-50 microns (camada)', vantagem: 'resina' },
  { aspecto: 'Tamanho Máximo', fdm: '220x220x250mm (típico) até 400x400x500mm', resina: '130x80x150mm (típico) até 300x165x300mm', vantagem: 'fdm' },
  { aspecto: 'Resistência Mecânica', fdm: 'Alta (especialmente Nylon, PETG, PC)', resina: 'Média-Baixa (resinas padrão são frágeis)', vantagem: 'fdm' },
  { aspecto: 'Detalhes Finos', fdm: 'Limitado (linhas de camada visíveis)', resina: 'Excepcional (superfície quase lisa)', vantagem: 'resina' },
  { aspecto: 'Custo por Peça', fdm: 'Baixo (filamento ~R$80-120/kg)', resina: 'Médio-Alto (resina ~R$120-250/kg)', vantagem: 'fdm' },
  { aspecto: 'Pós-processamento', fdm: 'Mínimo (remover suportes, lixar)', resina: 'Extenso (lavar IPA, curar UV, remover suportes)', vantagem: 'fdm' },
  { aspecto: 'Segurança', fdm: 'Seguro (PLA não tóxico)', resina: 'Requer cuidados (resina líquida é tóxica, usar luvas)', vantagem: 'fdm' },
  { aspecto: 'Velocidade', fdm: '40-500mm/s dependendo da máquina', resina: 'Cura camada inteira de uma vez (rápido para lotes)', vantagem: 'empate' },
  { aspecto: 'Materiais Disponíveis', fdm: '50+ tipos de filamento', resina: '20+ tipos de resina (standard, tough, flex, dental)', vantagem: 'fdm' },
  { aspecto: 'Ideal Para', fdm: 'Peças funcionais, protótipos grandes, ferramentas', resina: 'Miniaturas, joalheria, odontologia, detalhes finos', vantagem: 'empate' },
];

// ---- GUIA LINEAR VS RODINHAS ----
const guiaVsRodinhas = [
  { aspecto: 'Precisão', guia: 'Excelente — tolerância de 0.01mm. Movimento suave e sem folga lateral.', rodinha: 'Boa — tolerância de 0.05-0.1mm. Pode ter folga se os excêntricos não estiverem bem ajustados.', vantagem: 'guia' },
  { aspecto: 'Durabilidade', guia: 'Superior — rolamentos de esferas em aço endurecido duram anos sem manutenção significativa.', rodinha: 'Limitada — as rodinhas de policarbonato/POM desgastam com o tempo e criam "flat spots" que afetam a qualidade.', vantagem: 'guia' },
  { aspecto: 'Velocidade Máxima', guia: 'Ideal para alta velocidade (300-600mm/s). Sem vibração lateral mesmo em acelerações extremas.', rodinha: 'Limitada a 100-200mm/s. Em velocidades altas, as rodinhas podem patinar ou vibrar, causando artefatos.', vantagem: 'guia' },
  { aspecto: 'Manutenção', guia: 'Mínima — lubrificação ocasional com graxa de lítio a cada 6-12 meses.', rodinha: 'Frequente — verificar e ajustar excêntricos a cada 2-3 meses. Substituir rodinhas gastas a cada 6-12 meses.', vantagem: 'guia' },
  { aspecto: 'Custo', guia: 'Alto — kit de guias lineares MGN12H custa R$150-400 dependendo da qualidade.', rodinha: 'Baixo — rodinhas de reposição custam R$5-15 cada. Sistema completo já vem na impressora.', vantagem: 'rodinha' },
  { aspecto: 'Instalação', guia: 'Complexa — requer alinhamento preciso, peças impressas de adaptação e conhecimento mecânico.', rodinha: 'Simples — sistema plug-and-play. Ajuste apenas com chave Allen nos excêntricos.', vantagem: 'rodinha' },
  { aspecto: 'Ruído', guia: 'Silencioso — movimento suave sem atrito de polímero.', rodinha: 'Silencioso — rodinhas de POM são naturalmente silenciosas.', vantagem: 'empate' },
  { aspecto: 'Impressoras Exemplo', guia: 'Prusa MK4, Bambu Lab X1C/P1S, Voron 2.4, RatRig V-Core', rodinha: 'Ender 3 V2, CR-10, Anycubic Kobra, Artillery Sidewinder', vantagem: 'empate' },
];

// ---- TIPOS DE IMPRESSORAS ----
const tiposImpressoras = [
  {
    tipo: 'Cartesiana (Bed Slinger)',
    descricao: 'A arquitetura mais comum e acessível. A mesa (bed) move-se no eixo Y, enquanto a cabeça de impressão move-se nos eixos X e Z. É chamada de "bed slinger" porque a mesa literalmente "arremessa" para frente e para trás durante a impressão.',
    comoFunciona: 'O eixo Y é movido pela mesa aquecida (que pode pesar 500g-1kg com a peça). O eixo X é movido pela cabeça de impressão. O eixo Z sobe camada por camada. A massa da mesa em movimento limita a velocidade máxima e a aceleração.',
    vantagens: ['Mais barata do mercado', 'Fácil de montar e manter', 'Grande volume de impressão por custo', 'Milhares de tutoriais disponíveis', 'Peças de reposição abundantes'],
    desvantagens: ['Velocidade limitada pela massa da mesa', 'Ghosting/ringing em peças altas', 'Vibrações da mesa afetam qualidade', 'Não ideal para velocidades acima de 150mm/s'],
    exemplos: 'Creality Ender 3 V3, Anycubic Kobra 3, Artillery Sidewinder X4 Plus',
    velocidadeMax: '60-150 mm/s',
    precoFaixa: 'R$800 - R$3.000',
    cor: '#4CAF50',
    videoUrl: 'https://www.youtube.com/embed/EzUxiXQdMVY',
    videoTitle: 'CoreXY vs Bed Slinger vs Delta',
    diferenciais: [
      'Mesa se move no eixo Y (frente/trás)',
      'Cabeça move nos eixos X e Z',
      'Estrutura simples e robusta',
      'Ideal para iniciantes',
      'Maior volume de impressão por custo',
      'Fácil manutenção e upgrades'
    ]
  },
  {
    tipo: 'CoreXY',
    descricao: 'Arquitetura premium onde a mesa move-se apenas no eixo Z (para cima/baixo), enquanto a cabeça de impressão move-se nos eixos X e Y usando um sistema de correias cruzadas. Como a mesa não se move horizontalmente, permite velocidades e acelerações muito superiores.',
    comoFunciona: 'Duas correias longas trabalham em conjunto: quando ambas giram na mesma direção, a cabeça move-se em X; quando giram em direções opostas, move-se em Y. A mesa sobe/desce em Z. A massa em movimento é mínima (apenas a cabeça), permitindo acelerações de 10.000-20.000 mm/s².',
    vantagens: ['Velocidades extremas (300-600mm/s)', 'Acelerações altíssimas', 'Mesa estável (sem vibração)', 'Qualidade superior em alta velocidade', 'Ideal para Klipper + Input Shaper'],
    desvantagens: ['Mais cara', 'Montagem mais complexa', 'Tensionamento de correias crítico', 'Menor volume por custo', 'Manutenção requer mais conhecimento'],
    exemplos: 'Bambu Lab X1C/P1S/A1, Voron 2.4/Trident, Sovol SV08, Elegoo Centauri Carbon',
    velocidadeMax: '300-700 mm/s',
    precoFaixa: 'R$2.500 - R$15.000',
    cor: '#2196F3',
    videoUrl: 'https://www.youtube.com/embed/z33S74ltZwU',
    videoTitle: 'Cartesian Vs. CoreXY, Delta & Polar',
    diferenciais: [
      'Mesa fixa (só sobe/desce em Z)',
      'Correias cruzadas movem a cabeça em X/Y',
      'Aceleração de 10.000-20.000 mm/s²',
      'Ideal para alta velocidade',
      'Estrutura fechada (enclosure)',
      'Melhor qualidade em velocidade alta'
    ]
  },
  {
    tipo: 'Delta',
    descricao: 'Arquitetura com três braços verticais dispostos em triângulo. A cabeça de impressão é suspensa por três conjuntos de braços articulados que se movem simultaneamente para posicionar o bico em qualquer ponto do volume cilíndrico de impressão.',
    comoFunciona: 'Três motores de passo controlam a altura de três carros que deslizam em trilhos verticais. Braços paralelos conectam os carros a um efetor central (a cabeça). A cinemática delta calcula a posição de cada carro para posicionar o bico no ponto desejado. O volume de impressão é cilíndrico.',
    vantagens: ['Muito rápida em movimentos', 'Estrutura alta e compacta', 'Excelente para peças altas e finas', 'Movimento suave e fluido', 'Visualmente impressionante'],
    desvantagens: ['Calibração complexa', 'Volume útil menor que o aparente', 'Menos precisa nas bordas', 'Peças de reposição menos comuns', 'Difícil de modificar'],
    exemplos: 'Anycubic Predator, FLSUN V400/Super Racer, SeeMeCNC Rostock',
    velocidadeMax: '200-400 mm/s',
    precoFaixa: 'R$2.000 - R$5.000',
    cor: '#FF9800',
    videoUrl: 'https://www.youtube.com/embed/BTU6UGm15Zc',
    videoTitle: 'Delta vs Cartesian 3D Printers',
    diferenciais: [
      'Três braços articulados em triângulo',
      'Volume de impressão cilíndrico',
      'Movimento extremamente rápido',
      'Estrutura vertical compacta',
      'Cinemática complexa (3 motores)',
      'Ideal para peças altas e finas'
    ]
  },
  {
    tipo: 'Resina (MSLA/DLP)',
    descricao: 'Utiliza luz UV para curar resina fotossensível líquida camada por camada. A tecnologia MSLA (Masked SLA) usa uma tela LCD como máscara, enquanto DLP usa um projetor. Cada camada inteira é curada de uma vez, independente da complexidade.',
    comoFunciona: 'Um tanque (VAT) contém resina líquida. Uma tela LCD/LED emite luz UV que cura a resina na forma da camada atual. A plataforma de construção sobe gradualmente, puxando a peça para fora da resina. Cada camada leva 1-8 segundos para curar, independente de quantas peças estão na plataforma.',
    vantagens: ['Resolução excepcional (25-50 microns)', 'Superfície quase perfeita', 'Ideal para miniaturas e joalheria', 'Velocidade constante por camada', 'Detalhes impossíveis em FDM'],
    desvantagens: ['Resina tóxica (usar luvas)', 'Pós-processamento obrigatório', 'Volume de impressão menor', 'Custo por peça maior', 'Peças frágeis (resina standard)'],
    exemplos: 'Elegoo Saturn 4 Ultra 12K/16K, Elegoo Saturn 3 Ultra, Anycubic Photon Mono M7',
    velocidadeMax: '80-170 mm/h (vertical)',
    precoFaixa: 'R$1.500 - R$8.000',
    cor: '#9C27B0',
    videoUrl: 'https://www.youtube.com/embed/RYjq62ICqRY',
    videoTitle: 'Impressoras de Resina - Como Funcionam',
    diferenciais: [
      'Cura por luz UV (LCD/LED)',
      'Resolução de 25-50 microns',
      'Superfície quase perfeita',
      'Camada inteira curada de uma vez',
      'Ideal para detalhes extremos',
      'Pós-processamento obrigatório (IPA + UV)'
    ]
  },
  {
    tipo: 'Multi-Cabeçote (IDEX/Toolchanger)',
    descricao: 'A nova geração de impressoras 3D com múltiplos cabeçotes independentes, como a Snapmaker U1. Permitem impressão multicolorida e multimaterial com MUITO MENOS desperdício comparado a sistemas AMS/MMU tradicionais (como Bambu Lab). Cada cabeçote opera independentemente, eliminando a necessidade de purga de material.',
    comoFunciona: 'Impressoras IDEX (Independent Dual Extruder) possuem dois ou mais cabeçotes que se movem independentemente. Quando um cabeçote não está em uso, ele se estaciona fora da área de impressão. Sistemas Toolchanger vão além: a impressora troca automaticamente entre diferentes ferramentas (hotends) durante a impressão, similar a uma CNC com troca de ferramentas.',
    vantagens: ['Impressão multicolorida sem desperdício', 'Múltiplos materiais na mesma peça', 'Sem torre de purga (economia de filamento)', 'Suporte solúvel (PVA/HIPS) fácil', 'Modo espelho/duplicação (2 peças iguais)', 'Menos desperdício que AMS/MMU'],
    desvantagens: ['Custo mais elevado', 'Calibração de offset entre cabeçotes', 'Área de impressão reduzida (IDEX)', 'Complexidade mecânica maior', 'Menos opções no mercado'],
    exemplos: 'Snapmaker U1, Sovol SV08 Plus, BCN3D Epsilon, Raise3D E2',
    velocidadeMax: '200-500 mm/s',
    precoFaixa: 'R$5.000 - R$25.000',
    cor: '#E91E63',
    videoUrl: 'https://www.youtube.com/embed/z33S74ltZwU',
    videoTitle: 'Impressoras Multi-Cabeçote vs AMS',
    diferenciais: [
      'Cabeçotes independentes (IDEX)',
      'Troca automática de ferramentas (Toolchanger)',
      'Impressão multicolorida SEM torre de purga',
      'Economia de até 80% de material vs AMS',
      'Suporte solúvel fácil (PVA)',
      'Modo espelho: 2 peças simultâneas'
    ],
    alertaDestaque: '⚠️ ATENÇÃO: Sistemas AMS (como Bambu Lab) desperdiçam até 30-40% de filamento em torres de purga para impressão multicolorida. Impressoras multi-cabeçote como a Snapmaker U1 eliminam esse desperdício quase completamente, economizando material e dinheiro a longo prazo.'
  },
];

// ---- IMPRESSORAS MULTI-CABEÇOTE (NOVA GERAÇÃO) ----
const multiCabecote = [
  {
    nome: 'Snapmaker J1/J1s',
    tipo: 'IDEX (Independent Dual Extrusion)',
    descricao: 'A Snapmaker J1 utiliza tecnologia IDEX com dois cabeçotes de impressão completamente independentes. Cada cabeçote pode se mover de forma autônoma, permitindo imprimir duas peças simultaneamente (modo Duplicação) ou usar materiais diferentes na mesma peça (modo Espelho/Multi-material).',
    vantagens: ['Dois cabeçotes independentes', 'Modo Duplicação (2 peças ao mesmo tempo)', 'Modo Espelho (peças simétricas)', 'Material de suporte solúvel (PVA)', 'Menos desperdício que AMS', 'Troca de material sem purga'],
    desvantagens: ['Volume de impressão dividido no modo dual', 'Mais complexa de calibrar', 'Preço elevado'],
    desperdicioMaterial: 'Mínimo — cada cabeçote tem seu próprio filamento, sem necessidade de purga entre trocas.',
    cor: '#E91E63',
  },
  {
    nome: 'Snapmaker U1 (Lançamento 2025-26)',
    tipo: 'Multi-Cabeçote Modular',
    descricao: 'A Snapmaker U1 representa a nova geração de impressoras multi-cabeçote. Com sistema modular que permite até 4 cabeçotes, ela oferece impressão multicolorida com desperdício mínimo de material, ao contrário do sistema AMS da Bambu Lab que desperdiça grandes quantidades de filamento em cada troca de cor.',
    vantagens: ['Até 4 cabeçotes modulares', 'Desperdício mínimo de material', 'Troca de cor sem torre de purga', 'Impressão colorida eficiente', 'Sistema modular expansível', 'Qualidade profissional'],
    desvantagens: ['Preço premium', 'Tecnologia nova (menos comunidade)', 'Disponibilidade limitada inicialmente'],
    desperdicioMaterial: 'Muito baixo — sistema multi-cabeçote elimina a necessidade de torre de purga, economizando até 90% do material desperdiçado pelo AMS.',
    cor: '#00BCD4',
  },
  {
    nome: 'Bambu Lab AMS (Automatic Material System)',
    tipo: 'Sistema de Troca de Filamento (Single Nozzle)',
    descricao: 'O AMS da Bambu Lab permite imprimir com até 4 cores/materiais usando um único bico. O sistema retrai o filamento atual, carrega o próximo e faz uma purga para limpar o bico. Apesar de popular e fácil de usar, gera GRANDE desperdício de material a cada troca de cor.',
    vantagens: ['Fácil de usar', 'Até 16 cores (4 AMS)', 'Integração perfeita com Bambu Studio', 'Detecção de filamento', 'Carregamento automático'],
    desvantagens: ['GRANDE desperdício de material (torre de purga)', 'Cada troca de cor desperdiça 2-5g de filamento', 'Torre de purga pode usar mais material que a peça', 'Impressões multi-cor demoram muito mais', 'Custo real muito maior que aparenta'],
    desperdicioMaterial: 'ALTO — cada troca de cor requer purga de 2-5g. Em peças com muitas trocas, a torre de purga pode consumir 50-200g de filamento desperdiçado, às vezes mais que a própria peça.',
    cor: '#FF5722',
  },
  {
    nome: 'Prusa MMU3 (Multi Material Upgrade)',
    tipo: 'Sistema de Troca de Filamento (Single Nozzle)',
    descricao: 'O MMU3 da Prusa é similar ao AMS da Bambu Lab — usa um único bico e troca entre até 5 filamentos. Também gera desperdício por purga, mas a Prusa oferece opções de "wipe into infill" para reduzir o desperdício.',
    vantagens: ['5 materiais/cores', 'Open-source', 'Wipe into infill (reduz desperdício)', 'Compatível com PrusaSlicer', 'Boa documentação'],
    desvantagens: ['Desperdício de material por purga', 'Falhas de carregamento ocasionais', 'Impressões mais lentas', 'Requer calibração cuidadosa'],
    desperdicioMaterial: 'Médio-Alto — similar ao AMS, mas com opção de purgar no preenchimento da peça, reduzindo o desperdício em 30-50%.',
    cor: '#FF9800',
  },
];

// ---- COMPARATIVO DE DESPERDÍCIO ----
const desperdicioComparativo = [
  { sistema: 'IDEX (Snapmaker J1)', desperdicoPorTroca: '0-0.5g', desperdicoTotal100Trocas: '~0-50g', eficiencia: 95, tipo: 'Multi-cabeçote' },
  { sistema: 'Multi-Cabeçote (Snapmaker U1)', desperdicoPorTroca: '0-0.3g', desperdicoTotal100Trocas: '~0-30g', eficiencia: 98, tipo: 'Multi-cabeçote' },
  { sistema: 'AMS (Bambu Lab)', desperdicoPorTroca: '2-5g', desperdicoTotal100Trocas: '~200-500g', eficiencia: 60, tipo: 'Single nozzle + purga' },
  { sistema: 'MMU3 (Prusa)', desperdicoPorTroca: '1.5-4g', desperdicoTotal100Trocas: '~150-400g', eficiencia: 65, tipo: 'Single nozzle + purga' },
  { sistema: 'Palette 3 Pro', desperdicoPorTroca: '1-3g', desperdicoTotal100Trocas: '~100-300g', eficiencia: 70, tipo: 'Splicing externo' },
];

// ---- HISTÓRIA DA IMPRESSÃO 3D ----
const history3D = [
  { year: '1981', title: 'Primeiro Conceito', description: 'Dr. Hideo Kodama, do Instituto de Pesquisa Industrial de Nagoya (Japão), publica o primeiro relato de um sistema de prototipagem rápida usando fotopolímeros curados por UV. Infelizmente, não conseguiu patentear a invenção.' },
  { year: '1984', title: 'SLA Inventada', description: 'Chuck Hull inventa a Estereolitografia (SLA) e funda a 3D Systems. Ele cria o formato de arquivo .STL, que se torna o padrão universal para impressão 3D até hoje.' },
  { year: '1988', title: 'FDM Patenteada', description: 'Scott Crump inventa o processo de Modelagem por Deposição Fundida (FDM) e funda a Stratasys. A tecnologia deposita filamento termoplástico camada por camada.' },
  { year: '1992', title: 'SLS Comercial', description: 'DTM Corporation (adquirida pela 3D Systems) lança a primeira impressora SLS (Sinterização Seletiva a Laser), usando laser para fundir pó de nylon.' },
  { year: '2005', title: 'Projeto RepRap', description: 'Dr. Adrian Bowyer, da Universidade de Bath, inicia o projeto RepRap — a primeira impressora 3D auto-replicante de código aberto. Este projeto revoluciona a impressão 3D ao torná-la acessível.' },
  { year: '2009', title: 'Patente FDM Expira', description: 'A patente original de FDM da Stratasys expira, abrindo caminho para uma explosão de impressoras 3D de baixo custo. Empresas como MakerBot e Ultimaker surgem.' },
  { year: '2012', title: 'Era Desktop', description: 'Impressoras como a Prusa i3 e a Ultimaker 2 popularizam a impressão 3D doméstica. O preço cai de US$10.000 para menos de US$1.000.' },
  { year: '2014', title: 'Creality Ender 3', description: 'A Creality lança a Ender 3, que se torna a impressora 3D mais vendida da história. Seu preço acessível (~US$200) democratiza a tecnologia globalmente.' },
  { year: '2020', title: 'Firmware Klipper', description: 'O firmware Klipper ganha popularidade massiva, permitindo que impressoras antigas atinjam velocidades antes impossíveis. A comunidade Voron cresce exponencialmente.' },
  { year: '2022', title: 'Era Ultra-Fast', description: 'Bambu Lab lança a X1 Carbon, a primeira impressora consumer com velocidades de 500mm/s "out of the box". A indústria inteira acelera em resposta.' },
  { year: '2024', title: 'IA e Automação', description: 'Impressoras com câmeras de IA detectam falhas automaticamente. Sistemas multi-cor (AMS) se tornam padrão. Preços de impressoras rápidas caem abaixo de US$300.' },
  { year: '2025-26', title: 'Presente e Futuro', description: 'Impressão 3D em metal se torna acessível para pequenas empresas. Bioprinting avança em órgãos artificiais. Impressoras FDM atingem 1000mm/s em laboratórios. A impressão 3D se consolida como ferramenta essencial na indústria.' },
];

// ---- IMPRESSORAS MODERNAS VS ANTIGAS ----
const modernasVsAntigas = [
  { aspecto: 'Firmware', antiga: 'Marlin 1.x (8-bit)', moderna: 'Klipper ou firmware proprietário otimizado' },
  { aspecto: 'Velocidade', antiga: '40-60 mm/s', moderna: '300-600 mm/s' },
  { aspecto: 'Aceleração', antiga: '500-1000 mm/s²', moderna: '10.000-20.000 mm/s²' },
  { aspecto: 'Movimentação', antiga: 'Rodinhas V-Slot (POM)', moderna: 'Guias Lineares MGN (aço)' },
  { aspecto: 'Nivelamento', antiga: 'Manual (4 parafusos)', moderna: 'Automático (ABL/BLTouch/Eddy)' },
  { aspecto: 'Extrusora', antiga: 'Bowden (tubo PTFE longo)', moderna: 'Direct Drive (motor no cabeçote)' },
  { aspecto: 'Hotend', antiga: 'PTFE-lined (máx 240°C)', moderna: 'All-metal (máx 300°C+)' },
  { aspecto: 'Drivers', antiga: 'A4988 / DRV8825 (ruidosos)', moderna: 'TMC2209/2226 (silenciosos, StealthChop)' },
  { aspecto: 'Placa-mãe', antiga: '8-bit (ATmega2560)', moderna: '32-bit (STM32, ARM Cortex)' },
  { aspecto: 'Conectividade', antiga: 'Cartão SD / USB', moderna: 'Wi-Fi, Cloud, App, Câmera IA' },
  { aspecto: 'Multi-cor', antiga: 'Não disponível', moderna: 'AMS / MMU (4-16 cores)' },
  { aspecto: 'Preço Médio', antiga: 'R$800-1.500', moderna: 'R$1.500-5.000' },
  { aspecto: 'Exemplo', antiga: 'Ender 3 V1 (2018)', moderna: 'Bambu Lab P1S (2024)' },
];

/* ============================================================
   COMPONENTES AUXILIARES
   ============================================================ */

function RatingBar({ value, max = 5, label, color }: { value: number; max?: number; label: string; color: string }) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-xs text-muted-foreground w-32 shrink-0">{label}</span>
      <div className="flex-1 h-2 bg-muted/30 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          whileInView={{ width: `${(value / max) * 100}%` }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="h-full rounded-full"
          style={{ backgroundColor: color }}
        />
      </div>
      <span className="text-xs font-bold w-6 text-right">{value}/{max}</span>
    </div>
  );
}

function SectionTitle({ title, subtitle, id }: { title: string; subtitle: string; id?: string }) {
  return (
    <div id={id} className="text-center mb-16">
      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-3xl md:text-4xl font-bold mb-4"
      >
        {title}
      </motion.h2>
      <p className="text-muted-foreground max-w-2xl mx-auto text-lg">{subtitle}</p>
    </div>
  );
}

/* ============================================================
   COMPONENTE PRINCIPAL
   ============================================================ */

export default function Knowledge() {
  const [expandedFirmware, setExpandedFirmware] = useState<string | null>(null);
  const [expandedFilamento, setExpandedFilamento] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'fdm' | 'resina'>('fdm');
  const [expandedPrinterType, setExpandedPrinterType] = useState<string | null>(null);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const offset = 80;
      const elementPosition = element.getBoundingClientRect().top + window.pageYOffset;
      window.scrollTo({ top: elementPosition - offset, behavior: 'smooth' });
    }
  };

  return (
    <Layout>
      {/* ============ HERO ============ */}
      <section className="bg-gradient-to-br from-primary via-primary to-primary/90 py-24 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-10 w-72 h-72 bg-accent rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-20 w-96 h-96 bg-blue-500 rounded-full blur-3xl" />
        </div>
        <div className="container-custom relative z-10">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-4xl">
            <span className="inline-block bg-accent/20 text-accent font-semibold text-sm uppercase tracking-wider px-4 py-2 rounded-full mb-6">
              Base de Conhecimento 3DKPRINT
            </span>
            <h1 className="text-4xl md:text-6xl font-bold text-primary-foreground mb-6 leading-tight">
              Enciclopédia Técnica da<br />
              <span className="text-accent">Impressão 3D</span>
            </h1>
            <p className="text-xl text-primary-foreground/80 mb-10 max-w-3xl leading-relaxed">
              O guia mais completo sobre firmwares, filamentos, tecnologias de impressão, tipos de máquinas e muito mais. 
              Conteúdo técnico detalhado para iniciantes e profissionais.
            </p>
            <div className="flex flex-wrap gap-4">
              <Button onClick={() => scrollToSection('firmware')} className="bg-accent text-accent-foreground hover:bg-accent/90 px-8 py-6 text-lg">
                Klipper vs Marlin
              </Button>
              <Button onClick={() => scrollToSection('filamentos')} variant="outline" className="!text-white border-white/40 hover:bg-white/10 px-8 py-6 text-lg">
                Guia de Filamentos
              </Button>
              <Button onClick={() => scrollToSection('resinas')} variant="outline" className="!text-white border-white/40 hover:bg-white/10 px-8 py-6 text-lg">
                Guia de Resinas
              </Button>
              <Button onClick={() => scrollToSection('fdm-resina')} variant="outline" className="!text-white border-white/40 hover:bg-white/10 px-8 py-6 text-lg">
                FDM vs Resina
              </Button>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-16">
              {[
                { label: 'Filamentos Analisados', value: '8+' },
                { label: 'Resinas Analisadas', value: '8+' },
                { label: 'Tipos de Impressoras', value: '5' },
                { label: 'Comparativos Técnicos', value: '30+' },
                { label: 'Anos de História', value: '40+' },
              ].map((stat, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + i * 0.1 }}
                  className="text-center"
                >
                  <div className="text-3xl font-bold text-accent">{stat.value}</div>
                  <div className="text-sm text-primary-foreground/60 mt-1">{stat.label}</div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ============ NAVEGAÇÃO RÁPIDA ============ */}
      <section className="bg-background border-b border-border sticky top-0 z-40">
        <div className="container-custom">
          <div className="flex overflow-x-auto gap-1 py-3 scrollbar-hide">
            {[
              { id: 'firmware', label: 'Klipper vs Marlin', icon: <Cpu className="w-4 h-4" /> },
              { id: 'filamentos', label: 'Filamentos', icon: <Thermometer className="w-4 h-4" /> },
              { id: 'resinas', label: 'Guia de Resinas', icon: <Layers className="w-4 h-4" /> },
              { id: 'fdm-resina', label: 'FDM vs Resina', icon: <Layers className="w-4 h-4" /> },
              { id: 'movimentacao', label: 'Guia vs Rodinhas', icon: <Settings className="w-4 h-4" /> },
              { id: 'tipos-impressoras', label: 'Tipos de Máquinas', icon: <Printer className="w-4 h-4" /> },
              { id: 'multi-cabecote', label: 'Multi-Cabeçote vs AMS', icon: <Cog className="w-4 h-4" /> },
              { id: 'modernas-antigas', label: 'Moderna vs Antiga', icon: <Gauge className="w-4 h-4" /> },
              { id: 'history', label: 'História', icon: <Clock className="w-4 h-4" /> },
              { id: 'voron', label: 'Voron Design', icon: <Box className="w-4 h-4" /> },
              { id: 'klipper-guide', label: 'Guia Klipper', icon: <Zap className="w-4 h-4" /> },
            ].map((nav) => (
              <button
                key={nav.id}
                onClick={() => scrollToSection(nav.id)}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-muted-foreground hover:text-accent hover:bg-accent/5 rounded-lg whitespace-nowrap transition-all"
              >
                {nav.icon}
                {nav.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ============ KLIPPER VS MARLIN ============ */}
      <section id="firmware" className="section-padding bg-background">
        <div className="container-custom">
          <SectionTitle
            title="Klipper vs Marlin: Batalha dos Firmwares"
            subtitle="Análise técnica profunda das diferenças entre os dois firmwares mais populares para impressoras 3D FDM."
          />

          <div className="max-w-5xl mx-auto space-y-4">
            {klipperVsMarlin.map((item, index) => (
              <motion.div
                key={item.category}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05 }}
                className="border border-border rounded-xl bg-white overflow-hidden shadow-sm hover:shadow-md transition-shadow"
              >
                <button
                  onClick={() => setExpandedFirmware(expandedFirmware === item.category ? null : item.category)}
                  className="w-full flex items-center justify-between p-5 text-left"
                >
                  <div className="flex items-center gap-3">
                    <span className={`w-3 h-3 rounded-full ${
                      item.vantagem === 'klipper' ? 'bg-orange-500' :
                      item.vantagem === 'marlin' ? 'bg-blue-500' : 'bg-gray-400'
                    }`} />
                    <span className="font-bold text-lg">{item.category}</span>
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                      item.vantagem === 'klipper' ? 'bg-orange-100 text-orange-600' :
                      item.vantagem === 'marlin' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'
                    }`}>
                      {item.vantagem === 'klipper' ? 'Vantagem Klipper' :
                       item.vantagem === 'marlin' ? 'Vantagem Marlin' : 'Empate'}
                    </span>
                  </div>
                  <ChevronDown className={`w-5 h-5 transition-transform ${expandedFirmware === item.category ? 'rotate-180' : ''}`} />
                </button>
                <AnimatePresence>
                  {expandedFirmware === item.category && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                      <div className="p-5 pt-0 grid grid-cols-1 md:grid-cols-2 gap-6 border-t border-border bg-muted/5">
                        <div className="p-4 rounded-lg bg-orange-50 border border-orange-200">
                          <h4 className="text-orange-600 font-bold text-sm uppercase mb-3 flex items-center gap-2">
                            <Zap className="w-4 h-4" /> Klipper
                          </h4>
                          <p className="text-sm leading-relaxed">{item.klipper}</p>
                        </div>
                        <div className="p-4 rounded-lg bg-blue-50 border border-blue-200">
                          <h4 className="text-blue-600 font-bold text-sm uppercase mb-3 flex items-center gap-2">
                            <Shield className="w-4 h-4" /> Marlin
                          </h4>
                          <p className="text-sm leading-relaxed">{item.marlin}</p>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>

          {/* Resumo Visual */}
          <div className="max-w-4xl mx-auto mt-16 grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="p-8 rounded-2xl bg-gradient-to-br from-orange-50 to-orange-100 border border-orange-200">
              <h3 className="text-2xl font-bold text-orange-700 mb-4">Escolha Klipper se...</h3>
              <ul className="space-y-3">
                {['Quer velocidades acima de 200mm/s', 'Tem um Raspberry Pi disponível', 'Gosta de personalizar e otimizar', 'Quer controle remoto via web', 'Usa impressora CoreXY'].map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm">
                    <CheckCircle className="w-4 h-4 text-orange-500 mt-0.5 shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="p-8 rounded-2xl bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200">
              <h3 className="text-2xl font-bold text-blue-700 mb-4">Escolha Marlin se...</h3>
              <ul className="space-y-3">
                {['É iniciante na impressão 3D', 'Quer simplicidade plug-and-play', 'Não quer hardware extra', 'Usa impressora cartesiana básica', 'Prefere tela LCD na impressora'].map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm">
                    <CheckCircle className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ============ GUIA DE FILAMENTOS ============ */}
      <section id="filamentos" className="section-padding bg-secondary/20">
        <div className="container-custom">
          <SectionTitle
            title="Guia Completo de Filamentos"
            subtitle="Análise detalhada de cada material: temperaturas, propriedades mecânicas, aplicações reais e dicas de impressão."
          />

          <div className="space-y-6 max-w-5xl mx-auto">
            {filamentos.map((fil, index) => (
              <motion.div
                key={fil.sigla}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05 }}
                className="border border-border rounded-2xl bg-white overflow-hidden shadow-sm"
              >
                <button
                  onClick={() => setExpandedFilamento(expandedFilamento === fil.sigla ? null : fil.sigla)}
                  className="w-full flex items-center justify-between p-6 text-left hover:bg-muted/5 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-lg"
                      style={{ backgroundColor: fil.cor }}
                    >
                      {fil.sigla.substring(0, 2)}
                    </div>
                    <div>
                      <h3 className="font-bold text-lg">{fil.nome}</h3>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-xs text-muted-foreground">Extrusão: {fil.tempExtrusao}</span>
                        <span className="text-xs text-muted-foreground">Mesa: {fil.tempMesa}</span>
                        <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                          fil.dificuldade === 'Fácil' ? 'bg-green-100 text-green-600' :
                          fil.dificuldade.includes('Intermediário') ? 'bg-yellow-100 text-yellow-600' :
                          'bg-red-100 text-red-600'
                        }`}>
                          {fil.dificuldade}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-bold text-muted-foreground">{fil.preco}</span>
                    <ChevronDown className={`w-5 h-5 transition-transform ${expandedFilamento === fil.sigla ? 'rotate-180' : ''}`} />
                  </div>
                </button>

                <AnimatePresence>
                  {expandedFilamento === fil.sigla && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                      <div className="p-6 pt-0 border-t border-border">
                        <p className="text-sm text-muted-foreground leading-relaxed mb-6">{fil.descricao}</p>

                        {/* Rating Bars */}
                        <div className="space-y-2 mb-6">
                          <RatingBar value={fil.resistenciaMecanica} label="Resist. Mecânica" color={fil.cor} />
                          <RatingBar value={fil.resistenciaTermica} label="Resist. Térmica" color={fil.cor} />
                          <RatingBar value={fil.flexibilidade} label="Flexibilidade" color={fil.cor} />
                          <RatingBar value={fil.facilidadeImpressao} label="Facilidade" color={fil.cor} />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          {/* Aplicações */}
                          <div className="p-4 bg-muted/10 rounded-lg">
                            <h4 className="font-bold text-sm mb-3 flex items-center gap-2">
                              <Target className="w-4 h-4 text-accent" /> Aplicações
                            </h4>
                            <ul className="space-y-1.5">
                              {fil.aplicacoes.map((app, i) => (
                                <li key={i} className="text-xs flex items-center gap-1.5">
                                  <ArrowRight className="w-3 h-3 text-accent" /> {app}
                                </li>
                              ))}
                            </ul>
                          </div>

                          {/* Vantagens */}
                          <div className="p-4 bg-green-50 rounded-lg">
                            <h4 className="font-bold text-sm mb-3 flex items-center gap-2 text-green-700">
                              <CheckCircle className="w-4 h-4" /> Vantagens
                            </h4>
                            <ul className="space-y-1.5">
                              {fil.vantagens.map((v, i) => (
                                <li key={i} className="text-xs flex items-center gap-1.5 text-green-700">
                                  <CheckCircle className="w-3 h-3" /> {v}
                                </li>
                              ))}
                            </ul>
                          </div>

                          {/* Desvantagens */}
                          <div className="p-4 bg-red-50 rounded-lg">
                            <h4 className="font-bold text-sm mb-3 flex items-center gap-2 text-red-700">
                              <XCircle className="w-4 h-4" /> Desvantagens
                            </h4>
                            <ul className="space-y-1.5">
                              {fil.desvantagens.map((d, i) => (
                                <li key={i} className="text-xs flex items-center gap-1.5 text-red-700">
                                  <XCircle className="w-3 h-3" /> {d}
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ GUIA DE RESINAS ============ */}
      <section id="resinas" className="section-padding bg-gradient-to-br from-purple-50 to-pink-50">
        <div className="container-custom">
          <SectionTitle
            title="Guia Completo de Resinas para Impressão 3D"
            subtitle="Conheça os 8 principais tipos de resina, suas propriedades, aplicações e dicas de pós-processamento para obter os melhores resultados."
          />

          {/* Aviso de Segurança */}
          <div className="max-w-4xl mx-auto mb-10 p-5 bg-yellow-50 border-2 border-yellow-300 rounded-2xl">
            <h4 className="font-bold text-yellow-800 flex items-center gap-2 mb-2 text-lg">
              <AlertTriangle className="w-5 h-5" /> Segurança ao Trabalhar com Resinas
            </h4>
            <p className="text-sm text-yellow-700 leading-relaxed">
              Resinas fotopoliméricas são <strong>tóxicas em estado líquido</strong>. Sempre use <strong>luvas de nitrilo</strong>, trabalhe em ambiente <strong>ventilado</strong>, 
              e nunca descarte resina líquida ou água de lavagem no ralo. Resina curada (sólida) é segura. Mantenha longe de crianças e animais.
            </p>
          </div>

          {/* Grid de Resinas */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {resinas.map((resina, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05 }}
                className="bg-white rounded-2xl shadow-lg border border-border overflow-hidden hover:shadow-xl transition-all duration-300 group"
              >
                {/* Header com cor */}
                <div className="p-3" style={{ backgroundColor: resina.cor + '15' }}>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider px-2 py-1 rounded-full text-white" style={{ backgroundColor: resina.cor }}>
                      {resina.sigla}
                    </span>
                    <span className="text-xs font-medium" style={{ color: resina.cor }}>{resina.dificuldade}</span>
                  </div>
                </div>

                <div className="p-5">
                  <h3 className="font-bold text-base mb-2 leading-tight">{resina.nome}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed mb-4">{resina.descricao}</p>

                  {/* Barras de propriedades */}
                  <div className="space-y-2 mb-4">
                    {[
                      { label: 'Detalhes', value: resina.detalhes },
                      { label: 'Resistência', value: resina.resistenciaMecanica },
                      { label: 'Flexibilidade', value: resina.flexibilidade },
                      { label: 'Facilidade', value: resina.facilidadeUso },
                    ].map((prop, i) => (
                      <div key={i}>
                        <div className="flex justify-between text-[10px] mb-0.5">
                          <span className="text-muted-foreground">{prop.label}</span>
                          <span className="font-bold">{prop.value}/5</span>
                        </div>
                        <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-500"
                            style={{ width: `${(prop.value / 5) * 100}%`, backgroundColor: resina.cor }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Info rápida */}
                  <div className="grid grid-cols-2 gap-2 mb-4">
                    <div className="text-center p-2 rounded-lg" style={{ backgroundColor: resina.cor + '10' }}>
                      <div className="text-[10px] text-muted-foreground">Cura</div>
                      <div className="font-bold text-[11px]">{resina.tempCura}</div>
                    </div>
                    <div className="text-center p-2 rounded-lg" style={{ backgroundColor: resina.cor + '10' }}>
                      <div className="text-[10px] text-muted-foreground">Preço</div>
                      <div className="font-bold text-[11px]">{resina.preco}</div>
                    </div>
                  </div>

                  {/* Aplicações */}
                  <div className="mb-3">
                    <h4 className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1.5">Aplicações</h4>
                    <div className="flex flex-wrap gap-1">
                      {resina.aplicacoes.slice(0, 3).map((app, i) => (
                        <span key={i} className="text-[9px] px-2 py-0.5 rounded-full border" style={{ borderColor: resina.cor + '40', color: resina.cor }}>
                          {app}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Vantagens e Desvantagens */}
                  <div className="grid grid-cols-2 gap-2 mb-3">
                    <div>
                      <h4 className="text-[10px] font-bold text-green-600 uppercase mb-1">Prós</h4>
                      {resina.vantagens.slice(0, 3).map((v, i) => (
                        <div key={i} className="flex items-start gap-1 text-[10px] mb-0.5">
                          <CheckCircle className="w-3 h-3 text-green-500 shrink-0 mt-0.5" /> <span>{v}</span>
                        </div>
                      ))}
                    </div>
                    <div>
                      <h4 className="text-[10px] font-bold text-red-600 uppercase mb-1">Contras</h4>
                      {resina.desvantagens.slice(0, 3).map((d, i) => (
                        <div key={i} className="flex items-start gap-1 text-[10px] mb-0.5">
                          <XCircle className="w-3 h-3 text-red-500 shrink-0 mt-0.5" /> <span>{d}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Dica de Pós-Processamento */}
                  <div className="p-3 rounded-lg bg-blue-50 border border-blue-100">
                    <h4 className="text-[10px] font-bold text-blue-700 uppercase mb-1">Pós-Processamento</h4>
                    <p className="text-[10px] text-blue-600 leading-relaxed">{resina.dicasPosProcessamento}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Tabela comparativa de resinas */}
          <div className="max-w-6xl mx-auto mt-12 overflow-x-auto">
            <h3 className="text-2xl font-bold text-center mb-6">Tabela Comparativa de Resinas</h3>
            <table className="w-full border-collapse bg-white rounded-xl overflow-hidden shadow-lg">
              <thead>
                <tr className="border-b-2 border-border bg-gray-50">
                  <th className="text-left p-3 font-bold text-xs uppercase tracking-wider text-muted-foreground">Resina</th>
                  <th className="text-center p-3 font-bold text-xs uppercase tracking-wider text-muted-foreground">Detalhes</th>
                  <th className="text-center p-3 font-bold text-xs uppercase tracking-wider text-muted-foreground">Resistência</th>
                  <th className="text-center p-3 font-bold text-xs uppercase tracking-wider text-muted-foreground">Flex</th>
                  <th className="text-center p-3 font-bold text-xs uppercase tracking-wider text-muted-foreground">Facilidade</th>
                  <th className="text-center p-3 font-bold text-xs uppercase tracking-wider text-muted-foreground">Preço</th>
                  <th className="text-left p-3 font-bold text-xs uppercase tracking-wider text-muted-foreground">Melhor Para</th>
                </tr>
              </thead>
              <tbody>
                {resinas.map((r, i) => (
                  <tr key={i} className={`border-b border-border ${i % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'} hover:bg-blue-50/50 transition-colors`}>
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: r.cor }} />
                        <span className="font-bold text-sm">{r.sigla}</span>
                      </div>
                    </td>
                    <td className="text-center p-3">
                      <div className="flex justify-center gap-0.5">
                        {[1,2,3,4,5].map(n => (
                          <Star key={n} className={`w-3 h-3 ${n <= r.detalhes ? 'text-yellow-500 fill-yellow-500' : 'text-gray-200'}`} />
                        ))}
                      </div>
                    </td>
                    <td className="text-center p-3">
                      <div className="flex justify-center gap-0.5">
                        {[1,2,3,4,5].map(n => (
                          <Star key={n} className={`w-3 h-3 ${n <= r.resistenciaMecanica ? 'text-orange-500 fill-orange-500' : 'text-gray-200'}`} />
                        ))}
                      </div>
                    </td>
                    <td className="text-center p-3">
                      <div className="flex justify-center gap-0.5">
                        {[1,2,3,4,5].map(n => (
                          <Star key={n} className={`w-3 h-3 ${n <= r.flexibilidade ? 'text-pink-500 fill-pink-500' : 'text-gray-200'}`} />
                        ))}
                      </div>
                    </td>
                    <td className="text-center p-3">
                      <div className="flex justify-center gap-0.5">
                        {[1,2,3,4,5].map(n => (
                          <Star key={n} className={`w-3 h-3 ${n <= r.facilidadeUso ? 'text-green-500 fill-green-500' : 'text-gray-200'}`} />
                        ))}
                      </div>
                    </td>
                    <td className="text-center p-3 font-bold text-sm" style={{ color: r.cor }}>{r.preco}</td>
                    <td className="p-3 text-xs text-muted-foreground">{r.aplicacoes[0]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Dicas gerais de pós-processamento */}
          <div className="max-w-4xl mx-auto mt-12 p-6 bg-gradient-to-r from-purple-50 to-blue-50 border-2 border-purple-200 rounded-2xl">
            <h4 className="font-bold text-purple-800 flex items-center gap-2 mb-3 text-lg">
              <Zap className="w-5 h-5" /> Equipamentos Essenciais para Resina
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-white rounded-xl">
                <h5 className="font-bold text-sm text-purple-700 mb-2">Lavagem</h5>
                <ul className="space-y-1 text-xs text-gray-600">
                  <li>• Wash & Cure Station (Elegoo Mercury, Anycubic)</li>
                  <li>• IPA 95%+ ou água (para Water-Washable)</li>
                  <li>• Recipiente ultrassônico (opcional)</li>
                </ul>
              </div>
              <div className="p-4 bg-white rounded-xl">
                <h5 className="font-bold text-sm text-purple-700 mb-2">Cura UV</h5>
                <ul className="space-y-1 text-xs text-gray-600">
                  <li>• Câmara UV 405nm (essencial)</li>
                  <li>• Mesa giratória para cura uniforme</li>
                  <li>• Timer para controle preciso</li>
                </ul>
              </div>
              <div className="p-4 bg-white rounded-xl">
                <h5 className="font-bold text-sm text-purple-700 mb-2">Segurança</h5>
                <ul className="space-y-1 text-xs text-gray-600">
                  <li>• Luvas de nitrilo (obrigatório)</li>
                  <li>• Máscara com filtro de carbono</li>
                  <li>• Óculos de proteção UV</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============ FDM VS RESINA ============ */}
      <section id="fdm-resina" className="section-padding bg-background">
        <div className="container-custom">
          <SectionTitle
            title="FDM vs Resina (SLA/DLP)"
            subtitle="Comparativo completo entre as duas tecnologias mais populares de impressão 3D."
          />

          {/* Tabs */}
          <div className="flex justify-center gap-4 mb-12">
            <button
              onClick={() => setActiveTab('fdm')}
              className={`px-8 py-4 rounded-xl font-bold text-lg transition-all ${
                activeTab === 'fdm' ? 'bg-blue-500 text-white shadow-lg' : 'bg-muted/30 text-muted-foreground hover:bg-muted/50'
              }`}
            >
              <Printer className="w-5 h-5 inline mr-2" /> FDM (Filamento)
            </button>
            <button
              onClick={() => setActiveTab('resina')}
              className={`px-8 py-4 rounded-xl font-bold text-lg transition-all ${
                activeTab === 'resina' ? 'bg-purple-500 text-white shadow-lg' : 'bg-muted/30 text-muted-foreground hover:bg-muted/50'
              }`}
            >
              <Layers className="w-5 h-5 inline mr-2" /> Resina (SLA)
            </button>
          </div>

          {/* Tabela Comparativa */}
          <div className="max-w-5xl mx-auto overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b-2 border-border">
                  <th className="text-left p-4 font-bold text-sm uppercase tracking-wider text-muted-foreground">Aspecto</th>
                  <th className="text-left p-4 font-bold text-sm uppercase tracking-wider text-blue-600">FDM (Filamento)</th>
                  <th className="text-left p-4 font-bold text-sm uppercase tracking-wider text-purple-600">Resina (SLA/DLP)</th>
                </tr>
              </thead>
              <tbody>
                {fdmVsResina.map((row, i) => (
                  <tr key={i} className={`border-b border-border ${i % 2 === 0 ? 'bg-muted/5' : ''}`}>
                    <td className="p-4 font-bold text-sm">{row.aspecto}</td>
                    <td className={`p-4 text-sm ${row.vantagem === 'fdm' ? 'text-blue-700 font-semibold bg-blue-50' : ''}`}>
                      {row.vantagem === 'fdm' && <CheckCircle className="w-4 h-4 inline mr-1 text-blue-500" />}
                      {row.fdm}
                    </td>
                    <td className={`p-4 text-sm ${row.vantagem === 'resina' ? 'text-purple-700 font-semibold bg-purple-50' : ''}`}>
                      {row.vantagem === 'resina' && <CheckCircle className="w-4 h-4 inline mr-1 text-purple-500" />}
                      {row.resina}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Resumo Visual */}
          <div className="max-w-4xl mx-auto mt-12 grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className={`p-8 rounded-2xl border-2 transition-all ${activeTab === 'fdm' ? 'border-blue-500 bg-blue-50 shadow-lg' : 'border-border bg-white'}`}>
              <h3 className="text-2xl font-bold text-blue-700 mb-2">FDM é ideal para:</h3>
              <p className="text-sm text-muted-foreground mb-4">Peças grandes, funcionais e resistentes</p>
              <ul className="space-y-2">
                {['Protótipos rápidos e baratos', 'Peças mecânicas e funcionais', 'Objetos grandes (até 40cm+)', 'Ferramentas e gabaritos', 'Uso educacional e hobby'].map((item, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm">
                    <CheckCircle className="w-4 h-4 text-blue-500 shrink-0" /> {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className={`p-8 rounded-2xl border-2 transition-all ${activeTab === 'resina' ? 'border-purple-500 bg-purple-50 shadow-lg' : 'border-border bg-white'}`}>
              <h3 className="text-2xl font-bold text-purple-700 mb-2">Resina é ideal para:</h3>
              <p className="text-sm text-muted-foreground mb-4">Detalhes finos e acabamento perfeito</p>
              <ul className="space-y-2">
                {['Miniaturas e figuras detalhadas', 'Joalheria e moldes', 'Odontologia e próteses', 'Peças com superfície lisa', 'Modelos arquitetônicos'].map((item, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm">
                    <CheckCircle className="w-4 h-4 text-purple-500 shrink-0" /> {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ============ GUIA LINEAR VS RODINHAS ============ */}
      <section id="movimentacao" className="section-padding bg-secondary/20">
        <div className="container-custom">
          <SectionTitle
            title="Guia Linear vs Rodinhas (V-Wheels)"
            subtitle="Análise técnica dos sistemas de movimentação: precisão, durabilidade, velocidade e custo."
          />

          <div className="max-w-5xl mx-auto overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b-2 border-border">
                  <th className="text-left p-4 font-bold text-sm uppercase tracking-wider text-muted-foreground">Aspecto</th>
                  <th className="text-left p-4 font-bold text-sm uppercase tracking-wider text-emerald-600">Guia Linear (MGN)</th>
                  <th className="text-left p-4 font-bold text-sm uppercase tracking-wider text-amber-600">Rodinhas (V-Slot)</th>
                </tr>
              </thead>
              <tbody>
                {guiaVsRodinhas.map((row, i) => (
                  <tr key={i} className={`border-b border-border ${i % 2 === 0 ? 'bg-muted/5' : ''}`}>
                    <td className="p-4 font-bold text-sm">{row.aspecto}</td>
                    <td className={`p-4 text-sm ${row.vantagem === 'guia' ? 'text-emerald-700 font-semibold bg-emerald-50' : ''}`}>
                      {row.vantagem === 'guia' && <CheckCircle className="w-4 h-4 inline mr-1 text-emerald-500" />}
                      {row.guia}
                    </td>
                    <td className={`p-4 text-sm ${row.vantagem === 'rodinha' ? 'text-amber-700 font-semibold bg-amber-50' : ''}`}>
                      {row.vantagem === 'rodinha' && <CheckCircle className="w-4 h-4 inline mr-1 text-amber-500" />}
                      {row.rodinha}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Dica */}
          <div className="max-w-3xl mx-auto mt-12 p-6 bg-amber-50 border border-amber-200 rounded-2xl">
            <h4 className="font-bold text-amber-800 flex items-center gap-2 mb-3">
              <AlertTriangle className="w-5 h-5" /> Dica Importante
            </h4>
            <p className="text-sm text-amber-700 leading-relaxed">
              Se você tem uma impressora com rodinhas (como a Ender 3) e imprime a velocidades abaixo de 100mm/s, 
              <strong> não há necessidade urgente de trocar para guias lineares</strong>. A diferença de qualidade é mínima em baixas velocidades. 
              O upgrade para guias lineares faz mais sentido quando combinado com Klipper e velocidades acima de 200mm/s.
            </p>
          </div>
        </div>
      </section>

      {/* ============ TIPOS DE IMPRESSORAS ============ */}
      <section id="tipos-impressoras" className="section-padding bg-background">
        <div className="container-custom">
          <SectionTitle
            title="Tipos de Impressoras 3D"
            subtitle="Conheça as diferentes arquiteturas de impressoras 3D, como funcionam e qual é a melhor para cada aplicação. Clique no vídeo ou no nome para ver os diferenciais."
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto">
            {tiposImpressoras.map((tipo, index) => {
              const showDetails = expandedPrinterType === tipo.tipo;
              const setShowDetails = (v: boolean) => setExpandedPrinterType(v ? tipo.tipo : null);
              return (
                <motion.div
                  key={tipo.tipo}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="border border-border rounded-2xl bg-white overflow-hidden shadow-sm hover:shadow-lg transition-shadow"
                >
                  {/* Vídeo embed */}
                  {(tipo as any).videoUrl && (
                    <div className="relative w-full bg-black" style={{ paddingBottom: '56.25%' }}>
                      <iframe
                        className="absolute inset-0 w-full h-full"
                        src={`${(tipo as any).videoUrl}?rel=0&modestbranding=1`}
                        title={(tipo as any).videoTitle || tipo.tipo}
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    </div>
                  )}

                  <div className="p-2">
                    <div
                      className="h-3 rounded-full"
                      style={{ backgroundColor: tipo.cor }}
                    />
                  </div>
                  <div className="p-6">
                    <button
                      onClick={() => setShowDetails(!showDetails)}
                      className="w-full text-left flex items-center justify-between mb-2 group"
                    >
                      <h3 className="text-xl font-bold group-hover:text-blue-600 transition-colors">{tipo.tipo}</h3>
                      <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${showDetails ? 'rotate-180' : ''}`} />
                    </button>
                    <p className="text-sm text-muted-foreground leading-relaxed mb-4">{tipo.descricao}</p>

                    {/* Alerta de desperdício (para multi-cabeçote) */}
                    {(tipo as any).alertaDestaque && (
                      <div className="p-4 bg-red-50 border-2 border-red-300 rounded-xl mb-4">
                        <p className="text-sm text-red-800 font-medium leading-relaxed">{(tipo as any).alertaDestaque}</p>
                      </div>
                    )}

                    <div className="p-4 bg-muted/10 rounded-lg mb-4">
                      <h4 className="font-bold text-xs uppercase tracking-wider text-muted-foreground mb-2">Como Funciona</h4>
                      <p className="text-xs leading-relaxed">{tipo.comoFunciona}</p>
                    </div>

                    <div className="grid grid-cols-3 gap-2 sm:gap-3 mb-4">
                      <div className="text-center p-3 bg-muted/10 rounded-lg">
                        <div className="text-xs text-muted-foreground">Velocidade</div>
                        <div className="font-bold text-sm mt-1">{tipo.velocidadeMax}</div>
                      </div>
                      <div className="text-center p-3 bg-muted/10 rounded-lg">
                        <div className="text-xs text-muted-foreground">Preço</div>
                        <div className="font-bold text-sm mt-1">{tipo.precoFaixa}</div>
                      </div>
                      <div className="text-center p-3 bg-muted/10 rounded-lg">
                        <div className="text-xs text-muted-foreground">Exemplos</div>
                        <div className="font-bold text-[10px] mt-1 leading-tight">{tipo.exemplos.split(',')[0]}</div>
                      </div>
                    </div>

                    {/* Diferenciais - aparecem ao clicar */}
                    <AnimatePresence>
                      {showDetails && (tipo as any).diferenciais && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3 }}
                          className="overflow-hidden"
                        >
                          <div className="p-4 rounded-xl mb-4" style={{ backgroundColor: tipo.cor + '10', borderColor: tipo.cor + '30', borderWidth: 1 }}>
                            <h4 className="font-bold text-sm mb-3" style={{ color: tipo.cor }}>Diferenciais desta Arquitetura</h4>
                            <div className="grid grid-cols-2 gap-2">
                              {(tipo as any).diferenciais.map((diff: string, i: number) => (
                                <div key={i} className="flex items-center gap-2 text-xs">
                                  <Star className="w-3 h-3 shrink-0" style={{ color: tipo.cor }} />
                                  <span>{diff}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <h4 className="text-xs font-bold text-green-600 uppercase mb-2">Vantagens</h4>
                        {tipo.vantagens.slice(0, 3).map((v, i) => (
                          <div key={i} className="flex items-center gap-1 text-[11px] mb-1">
                            <CheckCircle className="w-3 h-3 text-green-500 shrink-0" /> {v}
                          </div>
                        ))}
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-red-600 uppercase mb-2">Desvantagens</h4>
                        {tipo.desvantagens.slice(0, 3).map((d, i) => (
                          <div key={i} className="flex items-center gap-1 text-[11px] mb-1">
                            <XCircle className="w-3 h-3 text-red-500 shrink-0" /> {d}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Alerta sobre desperdício AMS vs Multi-Cabeçote */}
          <div className="max-w-4xl mx-auto mt-12 p-6 bg-gradient-to-r from-red-50 to-orange-50 border-2 border-red-200 rounded-2xl">
            <h4 className="font-bold text-red-800 flex items-center gap-2 mb-3 text-lg">
              <AlertTriangle className="w-6 h-6" /> Desperdício de Material: AMS/MMU vs Multi-Cabeçote
            </h4>
            <p className="text-sm text-red-700 leading-relaxed mb-4">
              Sistemas AMS (Bambu Lab) e MMU (Prusa) utilizam um único hotend e precisam fazer <strong>purga de material</strong> a cada troca de cor. 
              Isso gera uma <strong>torre de purga</strong> que pode consumir <strong>30-40% a mais de filamento</strong> do que a peça em si.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-red-100 rounded-xl">
                <h5 className="font-bold text-red-800 text-sm mb-2">❌ AMS/MMU (Bambu Lab, Prusa)</h5>
                <ul className="space-y-1 text-xs text-red-700">
                  <li>• Torre de purga a cada troca de cor</li>
                  <li>• Desperdício de 30-40% de filamento extra</li>
                  <li>• Tempo adicional para purga</li>
                  <li>• Custo oculto significativo a longo prazo</li>
                </ul>
              </div>
              <div className="p-4 bg-green-100 rounded-xl">
                <h5 className="font-bold text-green-800 text-sm mb-2">✅ Multi-Cabeçote (Snapmaker U1, IDEX)</h5>
                <ul className="space-y-1 text-xs text-green-700">
                  <li>• Sem torre de purga necessária</li>
                  <li>• Economia de até 80% de material</li>
                  <li>• Troca instantânea entre cabeçotes</li>
                  <li>• Investimento que se paga rápido</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============ MULTI-CABEÇOTE vs AMS ============ */}
      <section id="multi-cabecote" className="section-padding bg-gradient-to-br from-pink-50 to-purple-50">
        <div className="container-custom">
          <SectionTitle
            title="Multi-Cabeçote vs AMS/MMU: A Revolução da Impressão Multicolorida"
            subtitle="Entenda por que impressoras com múltiplos cabeçotes (como Snapmaker U1) estão mudando o jogo da impressão 3D colorida."
          />

          <div className="max-w-5xl mx-auto">
            {/* Comparação visual */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
              <div className="p-8 rounded-2xl bg-white border-2 border-red-200 shadow-lg">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                    <XCircle className="w-6 h-6 text-red-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-red-800">Sistema AMS/MMU</h3>
                    <p className="text-sm text-red-600">Bambu Lab AMS, Prusa MMU3</p>
                  </div>
                </div>
                <p className="text-sm text-gray-700 mb-4 leading-relaxed">
                  Utiliza um único hotend e troca o filamento a cada mudança de cor. O filamento anterior precisa ser 
                  <strong>purgado</strong> (expelido) antes de inserir o novo, gerando uma torre de desperdício.
                </p>
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm">
                    <XCircle className="w-4 h-4 text-red-500 shrink-0" />
                    <span><strong>30-40% de filamento desperdiçado</strong> em torre de purga</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <XCircle className="w-4 h-4 text-red-500 shrink-0" />
                    <span>Tempo extra para cada troca de cor (retract + purge + load)</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <XCircle className="w-4 h-4 text-red-500 shrink-0" />
                    <span>Risco de entupimento durante troca de filamento</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <XCircle className="w-4 h-4 text-red-500 shrink-0" />
                    <span>Contaminação de cor entre trocas</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <XCircle className="w-4 h-4 text-red-500 shrink-0" />
                    <span>Custo oculto: peça de R$50 gasta R$70+ em filamento</span>
                  </div>
                </div>
                <div className="mt-4 p-3 bg-red-50 rounded-lg">
                  <p className="text-xs text-red-700 font-medium">
                    Exemplo: Uma peça multicolorida de 200g pode gerar 60-80g de torre de purga desperdiçada.
                  </p>
                </div>
              </div>

              <div className="p-8 rounded-2xl bg-white border-2 border-green-200 shadow-lg">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                    <CheckCircle className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-green-800">Multi-Cabeçote (IDEX/Toolchanger)</h3>
                    <p className="text-sm text-green-600">Snapmaker U1, BCN3D, Raise3D</p>
                  </div>
                </div>
                <p className="text-sm text-gray-700 mb-4 leading-relaxed">
                  Cada cor/material tem seu próprio cabeçote dedicado. A troca é instantânea: um cabeçote se afasta e 
                  outro assume, <strong>sem necessidade de purga</strong>.
                </p>
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="w-4 h-4 text-green-500 shrink-0" />
                    <span><strong>Zero desperdício de material</strong> na troca de cor</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="w-4 h-4 text-green-500 shrink-0" />
                    <span>Troca instantânea entre cabeçotes (&lt;1 segundo)</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="w-4 h-4 text-green-500 shrink-0" />
                    <span>Sem risco de contaminação de cor</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="w-4 h-4 text-green-500 shrink-0" />
                    <span>Materiais diferentes na mesma peça (PLA + TPU)</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="w-4 h-4 text-green-500 shrink-0" />
                    <span>Modo espelho: 2 peças iguais ao mesmo tempo</span>
                  </div>
                </div>
                <div className="mt-4 p-3 bg-green-50 rounded-lg">
                  <p className="text-xs text-green-700 font-medium">
                    Exemplo: Mesma peça de 200g usa apenas 200g de filamento. Economia de R$20-30 por peça!
                  </p>
                </div>
              </div>
            </div>

            {/* Snapmaker U1 Destaque */}
            <div className="p-8 rounded-2xl bg-gradient-to-r from-purple-600 to-pink-600 text-white mb-8">
              <div className="flex flex-col md:flex-row items-center gap-8">
                <div className="flex-1">
                  <span className="inline-block bg-white/20 text-white text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full mb-4">
                    Destaque 2025/2026
                  </span>
                  <h3 className="text-2xl font-bold mb-3">Snapmaker U1 — A Revolução Multi-Cabeçote</h3>
                  <p className="text-white/90 leading-relaxed mb-4">
                    A Snapmaker U1 é uma das primeiras impressoras consumer com sistema de troca automática de ferramentas (toolchanger). 
                    Com até 4 cabeçotes independentes, permite impressão em até 4 cores/materiais simultaneamente sem NENHUM desperdício de purga.
                  </p>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-white/10 rounded-lg p-3">
                      <div className="text-2xl font-bold">4</div>
                      <div className="text-xs text-white/70">Cabeçotes Independentes</div>
                    </div>
                    <div className="bg-white/10 rounded-lg p-3">
                      <div className="text-2xl font-bold">0%</div>
                      <div className="text-xs text-white/70">Desperdício de Purga</div>
                    </div>
                    <div className="bg-white/10 rounded-lg p-3">
                      <div className="text-2xl font-bold">300+</div>
                      <div className="text-xs text-white/70">mm/s Velocidade</div>
                    </div>
                    <div className="bg-white/10 rounded-lg p-3">
                      <div className="text-2xl font-bold">80%</div>
                      <div className="text-xs text-white/70">Economia vs AMS</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Tabela comparativa detalhada */}
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b-2 border-border">
                    <th className="text-left p-4 font-bold text-sm uppercase tracking-wider text-muted-foreground">Aspecto</th>
                    <th className="text-left p-4 font-bold text-sm uppercase tracking-wider text-red-600">AMS/MMU</th>
                    <th className="text-left p-4 font-bold text-sm uppercase tracking-wider text-green-600">Multi-Cabeçote</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { aspecto: 'Desperdício de Material', ams: '30-40% extra em torre de purga', multi: 'Próximo de zero', vantagem: 'multi' },
                    { aspecto: 'Velocidade de Troca', ams: '15-30 segundos (retract + purge + load)', multi: '<1 segundo (troca de cabeçote)', vantagem: 'multi' },
                    { aspecto: 'Número de Cores', ams: '4-16 cores (com múltiplos AMS)', multi: '2-4 cores (IDEX/Toolchanger)', vantagem: 'ams' },
                    { aspecto: 'Custo Inicial', ams: 'R$1.500-3.000 (AMS)', multi: 'R$5.000-25.000 (impressora completa)', vantagem: 'ams' },
                    { aspecto: 'Custo por Peça', ams: 'Alto (desperdício de filamento)', multi: 'Baixo (sem desperdício)', vantagem: 'multi' },
                    { aspecto: 'Materiais Diferentes', ams: 'Limitado (mesmo tipo de hotend)', multi: 'Excelente (hotends diferentes)', vantagem: 'multi' },
                    { aspecto: 'Suporte Solúvel', ams: 'Difícil (contaminação)', multi: 'Fácil (cabeçote dedicado)', vantagem: 'multi' },
                    { aspecto: 'Modo Espelho/Duplicação', ams: 'Não disponível', multi: 'Sim (2 peças simultâneas)', vantagem: 'multi' },
                    { aspecto: 'Complexidade', ams: 'Simples (add-on)', multi: 'Média (mecânica mais complexa)', vantagem: 'ams' },
                  ].map((row, i) => (
                    <tr key={i} className={`border-b border-border ${i % 2 === 0 ? 'bg-muted/5' : ''}`}>
                      <td className="p-4 font-bold text-sm">{row.aspecto}</td>
                      <td className={`p-4 text-sm ${row.vantagem === 'ams' ? 'text-blue-700 font-semibold bg-blue-50' : row.vantagem === 'multi' ? 'text-red-600' : ''}`}>
                        {row.ams}
                      </td>
                      <td className={`p-4 text-sm ${row.vantagem === 'multi' ? 'text-green-700 font-semibold bg-green-50' : ''}`}>
                        {row.multi}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* ============ MODERNAS VS ANTIGAS ============ */}
      <section id="modernas-antigas" className="section-padding bg-secondary/20">
        <div className="container-custom">
          <SectionTitle
            title="Impressoras Modernas vs Antigas"
            subtitle="Como a tecnologia evoluiu: compare uma Ender 3 V1 (2018) com uma Bambu Lab P1S (2024)."
          />

          <div className="max-w-5xl mx-auto overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b-2 border-border">
                  <th className="text-left p-4 font-bold text-sm uppercase tracking-wider text-muted-foreground">Componente</th>
                  <th className="text-left p-4 font-bold text-sm uppercase tracking-wider text-red-500">
                    Antiga (2018-2020)
                  </th>
                  <th className="text-left p-4 font-bold text-sm uppercase tracking-wider text-green-600">
                    Moderna (2023-2026)
                  </th>
                </tr>
              </thead>
              <tbody>
                {modernasVsAntigas.map((row, i) => (
                  <tr key={i} className={`border-b border-border ${i % 2 === 0 ? 'bg-muted/5' : ''}`}>
                    <td className="p-4 font-bold text-sm">{row.aspecto}</td>
                    <td className="p-4 text-sm text-red-700">{row.antiga}</td>
                    <td className="p-4 text-sm text-green-700 font-semibold">{row.moderna}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="max-w-3xl mx-auto mt-12 p-6 bg-blue-50 border border-blue-200 rounded-2xl">
            <h4 className="font-bold text-blue-800 flex items-center gap-2 mb-3">
              <Zap className="w-5 h-5" /> Vale a pena fazer upgrade?
            </h4>
            <p className="text-sm text-blue-700 leading-relaxed">
              Se você tem uma impressora antiga como a Ender 3 V1, existem dois caminhos: <strong>fazer upgrade gradual</strong> (instalar Klipper, trocar para Direct Drive, adicionar guias lineares — custo total ~R$500-800) ou <strong>comprar uma impressora moderna</strong> como a Bambu Lab A1 Mini (~R$1.500) que já vem com tudo isso de fábrica. 
              Para quem gosta de aprender e modificar, o upgrade é mais divertido. Para quem quer resultados imediatos, uma impressora nova é mais prático.
            </p>
          </div>
        </div>
      </section>

      {/* ============ HISTÓRIA ============ */}
      <section id="history" className="section-padding bg-background">
        <div className="container-custom">
          <SectionTitle
            title="A História da Impressão 3D"
            subtitle="De 1981 até hoje: mais de 40 anos de evolução tecnológica que transformaram a manufatura."
          />

          <div className="max-w-4xl mx-auto">
            <div className="relative">
              {/* Linha central */}
              <div className="absolute left-8 md:left-1/2 top-0 bottom-0 w-0.5 bg-accent/20" />

              {history3D.map((event, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: index % 2 === 0 ? -30 : 30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.05 }}
                  className={`relative flex items-start mb-8 ${index % 2 === 0 ? 'md:flex-row-reverse' : ''}`}
                >
                  {/* Dot */}
                  <div className="absolute left-6 md:left-1/2 md:-translate-x-1/2 w-5 h-5 bg-accent rounded-full border-4 border-white shadow-lg z-10" />

                  {/* Card */}
                  <div className={`ml-16 md:ml-0 md:w-[calc(50%-2rem)] ${index % 2 === 0 ? 'md:mr-auto md:pr-8' : 'md:ml-auto md:pl-8'}`}>
                    <div className="bg-white p-6 rounded-xl border border-border shadow-sm hover:shadow-md transition-shadow">
                      <span className="text-accent font-bold text-2xl">{event.year}</span>
                      <h3 className="font-bold text-lg mt-1">{event.title}</h3>
                      <p className="text-sm text-muted-foreground mt-2 leading-relaxed">{event.description}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ============ VORON DESIGN ============ */}
      <section id="voron" className="section-padding bg-muted/20">
        <div className="container-custom">
          <SectionTitle
            title="Voron Design: A Impressora 3D Definitiva"
            subtitle="O projeto open-source mais avançado do mundo para impressoras 3D CoreXY de alta performance. Construída pela comunidade, para a comunidade."
          />

          {/* Hero Voron */}
          <div className="max-w-5xl mx-auto">
            <div className="grid md:grid-cols-2 gap-8 mb-12">
              <div className="bg-card border border-border rounded-2xl p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-red-500/10 rounded-xl flex items-center justify-center">
                    <Box className="w-6 h-6 text-red-500" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-foreground">O que é Voron?</h3>
                    <a href="https://vorondesign.com" target="_blank" rel="noopener noreferrer"
                      className="text-sm text-primary hover:underline flex items-center gap-1">
                      vorondesign.com <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  Voron é um projeto open-source de impressoras 3D CoreXY de alta performance, criado em 2019 por Maximilian Apodaca (mgulyurt) e mantido por uma comunidade global de engenheiros e entusiastas. Não é uma impressora comprada pronta — é um projeto que você <strong>monta do zero</strong>, imprimindo as próprias peças plásticas e comprando os componentes separadamente.
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  A filosofia Voron é simples: construir a melhor impressora 3D possível, sem compromissos de custo de produção em massa. Cada componente é escolhido pela qualidade, não pelo preço. O resultado é uma máquina capaz de imprimir a <strong>300-600mm/s</strong> com qualidade profissional.
                </p>
              </div>

              <div className="bg-card border border-border rounded-2xl p-8">
                <h3 className="text-xl font-bold text-foreground mb-6">Por que construir uma Voron?</h3>
                <div className="space-y-3">
                  {[
                    { icon: '⚡', title: 'Velocidade Extrema', desc: '300-600mm/s com Klipper + Input Shaper' },
                    { icon: '🔧', title: 'Totalmente Customizável', desc: 'Cada peça pode ser modificada e melhorada' },
                    { icon: '📐', title: 'Precisão Profissional', desc: 'Guias lineares MGN12H em todos os eixos' },
                    { icon: '🌡️', title: 'Câmara Fechada', desc: 'Ideal para ABS, ASA, Nylon, PC e filamentos técnicos' },
                    { icon: '🤝', title: 'Comunidade Ativa', desc: 'Discord com 100.000+ membros e suporte 24/7' },
                    { icon: '💰', title: 'Custo-Benefício', desc: 'Melhor performance por real investido' },
                  ].map((item, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <span className="text-xl flex-shrink-0">{item.icon}</span>
                      <div>
                        <p className="font-semibold text-foreground text-sm">{item.title}</p>
                        <p className="text-xs text-muted-foreground">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Modelos Voron */}
            <h3 className="text-2xl font-bold text-foreground mb-6 text-center">Modelos Voron</h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
              {[
                {
                  nome: 'Voron 0.2',
                  tamanho: '120×120×120mm',
                  tipo: 'CoreXY Compacto',
                  descricao: 'A menor Voron. Impressora de bancada compacta, perfeita para quem quer aprender a construir uma Voron sem investimento alto. Câmara fechada para filamentos técnicos. Usa motores NEMA14.',
                  preco: 'R$1.500 - R$3.000',
                  dificuldade: 'Intermediário',
                  cor: 'border-green-500/30 bg-green-500/5',
                  badge: 'bg-green-500',
                  ideal: 'Iniciantes em Voron, peças pequenas de alta qualidade',
                  specs: ['CoreXY compacto', 'NEMA14 motors', 'Câmara fechada', 'Klipper nativo', 'Comunidade enorme'],
                },
                {
                  nome: 'Voron 2.4',
                  tamanho: '250/300/350mm³',
                  tipo: 'CoreXY Gantry Duplo',
                  descricao: 'O modelo mais popular e icônico da família Voron. Usa um sistema de gantry duplo (4 motores no eixo Z) que garante nivelamento perfeito da mesa. A escolha dos profissionais para impressão de alta qualidade.',
                  preco: 'R$4.000 - R$8.000',
                  dificuldade: 'Avançado',
                  cor: 'border-red-500/30 bg-red-500/5',
                  badge: 'bg-red-500',
                  ideal: 'Profissionais, produção de peças técnicas, ABS/ASA',
                  specs: ['Gantry duplo (4 motores Z)', 'Guias lineares MGN12H', 'Câmara fechada', 'Klipper + Mainsail', 'Tap probe (sem BLTouch)'],
                },
                {
                  nome: 'Voron Trident',
                  tamanho: '250/300/350mm³',
                  tipo: 'CoreXY com 3 motores Z',
                  descricao: 'Evolução do Voron 2.4 com design simplificado. Usa 3 motores no eixo Z (mais simples que o gantry duplo do V2.4) mas mantém toda a performance. Mais fácil de montar e calibrar.',
                  preco: 'R$3.500 - R$7.000',
                  dificuldade: 'Avançado',
                  cor: 'border-blue-500/30 bg-blue-500/5',
                  badge: 'bg-blue-500',
                  ideal: 'Quem quer Voron 2.4 com montagem mais simples',
                  specs: ['3 motores Z independentes', 'Guias lineares', 'Câmara fechada', 'Klipper nativo', 'Mais fácil que V2.4'],
                },
                {
                  nome: 'Voron Switchwire',
                  tamanho: '250×250×200mm',
                  tipo: 'Cartesiana CoreXZ',
                  descricao: 'A única Voron com cinemática cartesiana (CoreXZ). Projetada para converter impressoras Ender 3 existentes em uma máquina de alta performance. Ótima para quem já tem uma Ender 3 e quer um upgrade radical.',
                  preco: 'R$2.000 - R$4.000',
                  dificuldade: 'Intermediário',
                  cor: 'border-purple-500/30 bg-purple-500/5',
                  badge: 'bg-purple-500',
                  ideal: 'Conversão de Ender 3, iniciantes em Voron',
                  specs: ['CoreXZ (cartesiana)', 'Conversão de Ender 3', 'Câmara fechada', 'Klipper', 'Custo mais baixo'],
                },
                {
                  nome: 'Voron Legacy',
                  tamanho: '230×230×230mm',
                  tipo: 'CoreXY Clássico',
                  descricao: 'O modelo original que iniciou tudo. Não é mais desenvolvido ativamente, mas ainda tem uma comunidade fiel. Usa rodinhas V-Slot em vez de guias lineares. Boa opção para quem quer uma Voron mais acessível.',
                  preco: 'R$1.500 - R$3.000',
                  dificuldade: 'Intermediário',
                  cor: 'border-gray-500/30 bg-gray-500/5',
                  badge: 'bg-gray-500',
                  ideal: 'Histórico, orçamento limitado',
                  specs: ['CoreXY original', 'Rodinhas V-Slot', 'Câmara fechada', 'Klipper', 'Projeto legado'],
                },
                {
                  nome: 'StealthBurner',
                  tamanho: 'Cabeçote Universal',
                  tipo: 'Toolhead Oficial',
                  descricao: 'Não é uma impressora, mas o cabeçote (toolhead) oficial de todas as Voron modernas. Suporta múltiplos hotends (Revo, Dragon, Rapido, Bambu), tem iluminação LED integrada e design aerodinâmico para alta velocidade.',
                  preco: 'R$300 - R$800',
                  dificuldade: 'Intermediário',
                  cor: 'border-orange-500/30 bg-orange-500/5',
                  badge: 'bg-orange-500',
                  ideal: 'Upgrade para qualquer Voron existente',
                  specs: ['Suporta múltiplos hotends', 'LEDs integrados', 'Sensor de filamento', 'Alta velocidade', 'Design aerodinâmico'],
                },
              ].map((modelo, i) => (
                <motion.div key={i} initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }}
                  className={`border-2 rounded-2xl p-6 ${modelo.cor}`}>
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h4 className="text-lg font-bold text-foreground">{modelo.nome}</h4>
                      <p className="text-xs text-muted-foreground">{modelo.tipo}</p>
                    </div>
                    <span className={`text-xs text-white px-2 py-1 rounded-full font-bold ${modelo.badge}`}>{modelo.dificuldade}</span>
                  </div>
                  <p className="text-sm text-muted-foreground mb-4 leading-relaxed">{modelo.descricao}</p>
                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">Volume:</span>
                      <span className="font-semibold">{modelo.tamanho}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">Investimento:</span>
                      <span className="font-semibold text-green-600">{modelo.preco}</span>
                    </div>
                    <div className="text-xs text-muted-foreground">✓ {modelo.ideal}</div>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {modelo.specs.map((spec, j) => (
                      <span key={j} className="text-xs px-2 py-0.5 bg-background/80 border border-border rounded-full text-muted-foreground">{spec}</span>
                    ))}
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Onde comprar peças */}
            <div className="bg-card border border-border rounded-2xl p-8 mb-8">
              <h3 className="text-xl font-bold text-foreground mb-6 flex items-center gap-2">
                <Package className="w-5 h-5 text-primary" /> Como Montar uma Voron: Guia de Compras
              </h3>
              <div className="grid md:grid-cols-3 gap-6">
                {[
                  {
                    categoria: '🖨️ Peças Impressas',
                    descricao: 'Todas as peças plásticas da Voron devem ser impressas em ABS ou ASA (obrigatório — PLA não aguenta o calor da câmara). Se você não tem uma impressora adequada, pode encomendar na 3DKPRINT.',
                    itens: ['ABS ou ASA (obrigatório)', 'Infill mínimo 40%', 'Paredes mínimo 4', 'Temperatura câmara >40°C', 'Cor padrão: preto + accent'],
                    cor: 'bg-blue-500/10 border-blue-500/20',
                  },
                  {
                    categoria: '⚙️ Componentes Mecânicos',
                    descricao: 'Motores, guias lineares, correias, parafusos e estrutura de alumínio. A maioria pode ser comprada no AliExpress (kits Voron) ou em fornecedores nacionais.',
                    itens: ['Perfis 2020/2040 alumínio', 'Guias lineares MGN12H', 'Motores NEMA17 (LDO ou OMC)', 'Correias GT2 6mm', 'Parafusos M3/M5 (kit)'],
                    cor: 'bg-green-500/10 border-green-500/20',
                  },
                  {
                    categoria: '🔌 Eletrônica',
                    descricao: 'Placa-mãe, Raspberry Pi, drivers TMC, hotend e sensores. A combinação mais popular é BTT Octopus + Raspberry Pi 4 + Klipper.',
                    itens: ['BTT Octopus Pro (placa)', 'Raspberry Pi 4 (host Klipper)', 'Drivers TMC2209', 'Hotend Revo/Dragon/Rapido', 'Probe Voron Tap (sem BLTouch)'],
                    cor: 'bg-orange-500/10 border-orange-500/20',
                  },
                ].map((cat, i) => (
                  <div key={i} className={`border rounded-xl p-5 ${cat.cor}`}>
                    <h4 className="font-bold text-foreground mb-2">{cat.categoria}</h4>
                    <p className="text-xs text-muted-foreground mb-3 leading-relaxed">{cat.descricao}</p>
                    <ul className="space-y-1">
                      {cat.itens.map((item, j) => (
                        <li key={j} className="text-xs text-foreground flex items-center gap-2">
                          <CheckCircle className="w-3 h-3 text-green-500 flex-shrink-0" /> {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>

            {/* Links oficiais */}
            <div className="bg-gradient-to-r from-red-500/10 to-red-600/5 border border-red-500/20 rounded-2xl p-6">
              <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
                <ExternalLink className="w-5 h-5 text-red-500" /> Recursos Oficiais Voron
              </h3>
              <div className="grid md:grid-cols-2 gap-4">
                {[
                  { label: 'Site Oficial', url: 'https://vorondesign.com', desc: 'Documentação, BOM e arquivos STL de todos os modelos' },
                  { label: 'GitHub Voron', url: 'https://github.com/VoronDesign', desc: 'Repositório oficial com todos os arquivos e atualizações' },
                  { label: 'Discord Voron', url: 'https://discord.gg/voron', desc: '100.000+ membros, suporte técnico e showcase' },
                  { label: 'Voron BOM', url: 'https://vorondesign.com/voron2.4', desc: 'Lista completa de materiais para cada modelo' },
                ].map((link, i) => (
                  <a key={i} href={link.url} target="_blank" rel="noopener noreferrer"
                    className="flex items-start gap-3 p-4 bg-background/80 border border-border rounded-xl hover:border-red-500/50 hover:bg-red-500/5 transition-all group">
                    <ExternalLink className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5 group-hover:scale-110 transition-transform" />
                    <div>
                      <p className="font-semibold text-foreground text-sm">{link.label}</p>
                      <p className="text-xs text-muted-foreground">{link.desc}</p>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============ GUIA KLIPPER ============ */}
      <section id="klipper-guide" className="section-padding bg-background">
        <div className="container-custom">
          <SectionTitle
            title="Guia Completo: Klipper"
            subtitle="Tudo que você precisa saber para instalar, configurar e dominar o Klipper — o firmware mais poderoso para impressoras 3D."
          />

          <div className="max-w-5xl mx-auto">
            {/* O que é Klipper */}
            <div className="grid md:grid-cols-2 gap-8 mb-12">
              <div className="bg-gradient-to-br from-orange-500/10 to-orange-600/5 border border-orange-500/20 rounded-2xl p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-orange-500/20 rounded-xl flex items-center justify-center">
                    <Zap className="w-6 h-6 text-orange-500" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-foreground">O que é Klipper?</h3>
                    <a href="https://www.klipper3d.org" target="_blank" rel="noopener noreferrer"
                      className="text-sm text-primary hover:underline flex items-center gap-1">
                      klipper3d.org <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  Klipper é um firmware open-source para impressoras 3D que transfere os cálculos complexos de movimento da placa-mãe da impressora para um computador externo (geralmente um Raspberry Pi). Isso permite usar processadores ARM muito mais potentes para calcular cinemática em tempo real.
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  Criado por Kevin O'Connor em 2016, o Klipper se tornou o padrão da indústria para impressoras de alta performance. É o firmware padrão em todas as impressoras Voron, Bambu Lab (firmware proprietário baseado em Klipper) e muitas outras.
                </p>
              </div>

              <div className="bg-card border border-border rounded-2xl p-8">
                <h3 className="text-xl font-bold text-foreground mb-6">Arquitetura do Klipper</h3>
                <div className="space-y-4">
                  {[
                    { componente: 'Raspberry Pi / SBC', papel: 'Host principal — roda o Klipper, calcula cinemática, processa G-Code', cor: 'bg-orange-500' },
                    { componente: 'Placa-mãe (BTT/MKS)', papel: 'Microcontrolador — executa comandos de baixo nível (mover motor, ler sensor)', cor: 'bg-blue-500' },
                    { componente: 'Mainsail / Fluidd', papel: 'Interface web — controle total via navegador ou celular', cor: 'bg-green-500' },
                    { componente: 'Moonraker', papel: 'API REST — conecta Klipper com a interface web e plugins', cor: 'bg-purple-500' },
                    { componente: 'printer.cfg', papel: 'Arquivo de configuração — define toda a impressora em texto simples', cor: 'bg-gray-500' },
                  ].map((item, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${item.cor}`} />
                      <div>
                        <p className="font-semibold text-foreground text-sm">{item.componente}</p>
                        <p className="text-xs text-muted-foreground">{item.papel}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Funcionalidades Klipper */}
            <h3 className="text-2xl font-bold text-foreground mb-6 text-center">Funcionalidades Exclusivas do Klipper</h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5 mb-12">
              {[
                {
                  titulo: 'Input Shaper',
                  icon: '📊',
                  descricao: 'Usa um acelerômetro ADXL345 para medir as frequências de ressonância da impressora. Aplica filtros matemáticos (ZV, MZV, EI) que cancelam as vibrações antes que aconteçam, eliminando ghosting/ringing mesmo a 500mm/s.',
                  como: 'Conectar ADXL345 ao Raspberry Pi → executar macro de calibração → Klipper gera perfil automaticamente',
                  cor: 'border-orange-500/30 bg-orange-500/5',
                },
                {
                  titulo: 'Pressure Advance',
                  icon: '🔧',
                  descricao: 'Compensa a compressão do filamento dentro do hotend. Quando a impressora desacelera, o Klipper reduz a pressão de extrusão antecipadamente, eliminando blobs em cantos e oozing em retrações.',
                  como: 'Imprimir torre de calibração → medir ponto de transição → definir pressure_advance no printer.cfg',
                  cor: 'border-blue-500/30 bg-blue-500/5',
                },
                {
                  titulo: 'Macros G-Code',
                  icon: '⚙️',
                  descricao: 'Sistema de macros poderoso que permite criar automações complexas: pré-aquecimento inteligente, limpeza do bico, mensagens na tela, condicionais e loops. Muito mais poderoso que o G-Code padrão.',
                  como: 'Definir macros no printer.cfg com [gcode_macro NOME] → chamar via interface web ou G-Code do slicer',
                  cor: 'border-green-500/30 bg-green-500/5',
                },
                {
                  titulo: 'Bed Mesh Leveling',
                  icon: '📐',
                  descricao: 'Mede a superfície da mesa em uma grade de pontos (ex: 5×5 = 25 pontos) e compensa imperfeições em tempo real durante a impressão. Funciona com qualquer probe: BLTouch, CR Touch, Voron Tap, Eddy.',
                  como: 'Configurar probe no printer.cfg → executar BED_MESH_CALIBRATE → salvar perfil → aplicar automaticamente',
                  cor: 'border-purple-500/30 bg-purple-500/5',
                },
                {
                  titulo: 'Resonance Testing',
                  icon: '🎵',
                  descricao: 'Ferramenta de diagnóstico que gera gráficos de frequência de ressonância para cada eixo. Identifica problemas mecânicos (correias frouxas, rolamentos ruins) e otimiza automaticamente os parâmetros de Input Shaper.',
                  como: 'Executar TEST_RESONANCES AXIS=X → Klipper gera CSV → processar com script Python → ver gráfico',
                  cor: 'border-pink-500/30 bg-pink-500/5',
                },
                {
                  titulo: 'Exclude Objects',
                  icon: '🎯',
                  descricao: 'Permite cancelar a impressão de um objeto específico em uma placa com múltiplas peças, sem cancelar tudo. Se uma peça falhar ou desprender, você pode excluí-la e continuar imprimindo as outras.',
                  como: 'Ativar no printer.cfg → slicer deve gerar marcadores de objeto → usar botão na interface Mainsail/Fluidd',
                  cor: 'border-teal-500/30 bg-teal-500/5',
                },
              ].map((feat, i) => (
                <motion.div key={i} initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }}
                  className={`border-2 rounded-2xl p-6 ${feat.cor}`}>
                  <div className="text-3xl mb-3">{feat.icon}</div>
                  <h4 className="text-lg font-bold text-foreground mb-2">{feat.titulo}</h4>
                  <p className="text-sm text-muted-foreground mb-4 leading-relaxed">{feat.descricao}</p>
                  <div className="bg-background/80 rounded-lg p-3 border border-border">
                    <p className="text-xs font-semibold text-foreground mb-1">Como usar:</p>
                    <p className="text-xs text-muted-foreground leading-relaxed">{feat.como}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Instalação */}
            <div className="bg-card border border-border rounded-2xl p-8 mb-8">
              <h3 className="text-xl font-bold text-foreground mb-6 flex items-center gap-2">
                <Settings className="w-5 h-5 text-primary" /> Como Instalar o Klipper: Passo a Passo
              </h3>
              <div className="space-y-4">
                {[
                  { passo: '1', titulo: 'Instalar KIAUH (Klipper Installation And Update Helper)', desc: 'SSH no Raspberry Pi → executar: git clone https://github.com/dw-0/kiauh.git → cd kiauh → ./kiauh.sh → selecionar Install → instalar Klipper, Moonraker, Mainsail/Fluidd', cor: 'bg-blue-500' },
                  { passo: '2', titulo: 'Compilar firmware para a placa-mãe', desc: 'No KIAUH → Advanced → Build firmware → selecionar o microcontrolador correto (STM32F446, ATmega2560, etc.) → compilar → copiar .bin para cartão SD → inserir na impressora', cor: 'bg-green-500' },
                  { passo: '3', titulo: 'Configurar printer.cfg', desc: 'Baixar configuração base para sua impressora em github.com/Klipper3d/klipper/config → editar pins, steps/mm, PID → salvar → FIRMWARE_RESTART', cor: 'bg-orange-500' },
                  { passo: '4', titulo: 'Calibrar PID e Steps', desc: 'PID_CALIBRATE HEATER=extruder TARGET=220 → PID_CALIBRATE HEATER=heater_bed TARGET=60 → calibrar rotation_distance do extrusor → salvar configurações', cor: 'bg-purple-500' },
                  { passo: '5', titulo: 'Input Shaper e Pressure Advance', desc: 'Conectar ADXL345 → SHAPER_CALIBRATE → aplicar perfil recomendado → imprimir torre de Pressure Advance → ajustar valor → imprimir!', cor: 'bg-red-500' },
                ].map((step, i) => (
                  <div key={i} className="flex items-start gap-4">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0 ${step.cor}`}>
                      {step.passo}
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">{step.titulo}</p>
                      <p className="text-sm text-muted-foreground mt-1 leading-relaxed">{step.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Interfaces web */}
            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <div className="bg-card border border-border rounded-2xl p-6">
                <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
                  <span className="text-2xl">🌊</span> Mainsail
                </h3>
                <p className="text-sm text-muted-foreground mb-4">A interface web mais popular para Klipper. Design limpo, responsivo e com todas as funcionalidades necessárias. Desenvolvida especificamente para Klipper com integração profunda.</p>
                <div className="space-y-2 mb-4">
                  {['Dashboard com temperatura, velocidade e progresso', 'Editor de G-Code com syntax highlighting', 'Gerenciador de arquivos e macros', 'Suporte a webcam e timelapse', 'Exclude Objects visual'].map((f, j) => (
                    <p key={j} className="text-xs text-muted-foreground flex items-center gap-2"><CheckCircle className="w-3 h-3 text-green-500" /> {f}</p>
                  ))}
                </div>
                <a href="https://docs.mainsail.xyz" target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-sm text-primary hover:underline">
                  docs.mainsail.xyz <ExternalLink className="w-3 h-3" />
                </a>
              </div>
              <div className="bg-card border border-border rounded-2xl p-6">
                <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
                  <span className="text-2xl">💧</span> Fluidd
                </h3>
                <p className="text-sm text-muted-foreground mb-4">Interface alternativa ao Mainsail, com design mais minimalista. Ambas são excelentes — a escolha é questão de preferência pessoal. Fluidd tem uma interface ligeiramente mais compacta.</p>
                <div className="space-y-2 mb-4">
                  {['Interface minimalista e responsiva', 'Controle completo via celular', 'Histórico de impressões', 'Suporte a múltiplas impressoras', 'Tema escuro/claro'].map((f, j) => (
                    <p key={j} className="text-xs text-muted-foreground flex items-center gap-2"><CheckCircle className="w-3 h-3 text-green-500" /> {f}</p>
                  ))}
                </div>
                <a href="https://docs.fluidd.xyz" target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-sm text-primary hover:underline">
                  docs.fluidd.xyz <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>

            {/* Links Klipper */}
            <div className="bg-gradient-to-r from-orange-500/10 to-orange-600/5 border border-orange-500/20 rounded-2xl p-6">
              <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
                <ExternalLink className="w-5 h-5 text-orange-500" /> Recursos Oficiais Klipper
              </h3>
              <div className="grid md:grid-cols-2 gap-4">
                {[
                  { label: 'Documentação Oficial', url: 'https://www.klipper3d.org', desc: 'Guia completo de instalação, configuração e referência de comandos' },
                  { label: 'GitHub Klipper', url: 'https://github.com/Klipper3d/klipper', desc: 'Código fonte e configurações de exemplo para centenas de impressoras' },
                  { label: 'KIAUH (Instalador)', url: 'https://github.com/dw-0/kiauh', desc: 'Ferramenta de instalação e atualização mais fácil para Klipper' },
                  { label: 'Discord Klipper', url: 'https://discord.klipper3d.org', desc: 'Comunidade oficial para suporte e discussão técnica' },
                ].map((link, i) => (
                  <a key={i} href={link.url} target="_blank" rel="noopener noreferrer"
                    className="flex items-start gap-3 p-4 bg-background/80 border border-border rounded-xl hover:border-orange-500/50 hover:bg-orange-500/5 transition-all group">
                    <ExternalLink className="w-4 h-4 text-orange-500 flex-shrink-0 mt-0.5 group-hover:scale-110 transition-transform" />
                    <div>
                      <p className="font-semibold text-foreground text-sm">{link.label}</p>
                      <p className="text-xs text-muted-foreground">{link.desc}</p>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============ CTA FINAL ============ */}
      <section className="section-padding bg-primary">
        <div className="container-custom text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-primary-foreground mb-6">
              Pronto para começar a imprimir?
            </h2>
            <p className="text-xl text-primary-foreground/80 mb-8 max-w-2xl mx-auto">
              Solicite um orçamento personalizado e nossa equipe vai ajudar você a escolher a melhor tecnologia e material para o seu projeto.
            </p>
            <div className="flex justify-center gap-4">
              <Button asChild className="bg-accent text-accent-foreground hover:bg-accent/90 px-8 py-6 text-lg">
                <a href="/orcamento">Solicitar Orçamento</a>
              </Button>
              <Button asChild variant="outline" className="!text-white border-white/40 hover:bg-white/10 px-8 py-6 text-lg">
                <a href="/comunidade">Entrar na Comunidade</a>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
    </Layout>
  );
}
