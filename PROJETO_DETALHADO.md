# Detalhamento do Projeto 3DKPRINT

Este documento detalha a arquitetura, tecnologias e funcionalidades do website 3DKPRINT, um e-commerce de impressão 3D com painel administrativo e diversas ferramentas de gestão.

## 1. Visão Geral do Projeto

O 3DKPRINT é uma plataforma web desenvolvida para facilitar a interação entre clientes que buscam serviços de impressão 3D e prestadores de serviço. Ele oferece um sistema completo para gerenciamento de produtos, orçamentos, produção, prestadores de serviço e suporte ao cliente.

## 2. Tecnologias Utilizadas

O projeto é construído com um stack tecnológico moderno e robusto, focado em performance e escalabilidade:

*   **Frontend:** React com TypeScript
    *   **Framework:** React é utilizado para construir a interface de usuário de forma declarativa e eficiente.
    *   **Linguagem:** TypeScript adiciona tipagem estática ao JavaScript, melhorando a manutenibilidade e a detecção de erros em tempo de desenvolvimento.
*   **Estilização:** Tailwind CSS
    *   **Framework CSS:** Tailwind CSS é um framework CSS utility-first que permite a criação rápida de designs personalizados diretamente no markup, sem sair do HTML.
*   **Roteamento:** React Router
    *   **Biblioteca:** Gerencia a navegação entre as diferentes páginas e seções da aplicação, tanto no lado público quanto no painel administrativo.
*   **Visualização 3D:** Three.js / React Three Fiber
    *   **Biblioteca 3D:** Three.js é uma biblioteca JavaScript para exibir gráficos 3D no navegador. React Three Fiber é um renderizador React para Three.js, facilitando a integração de modelos 3D em componentes React.
*   **Geração de PDF:** jsPDF
    *   **Biblioteca:** Utilizada para gerar relatórios e outros documentos em formato PDF diretamente no cliente.
*   **Implantação (Deployment):** Vercel
    *   **Plataforma:** Vercel é utilizada para o deploy contínuo da aplicação, integrando-se diretamente com o repositório GitHub para automatizar as implantações a cada push.
*   **Armazenamento de Dados (Temporário):** localStorage
    *   **Mecanismo:** Para simular um backend e permitir a persistência de dados no lado do cliente, o `localStorage` do navegador é utilizado. Isso armazena dados de forma persistente entre as sessões do navegador, mas é importante notar que **não é uma solução de backend real** e os dados são específicos do navegador do usuário.

## 3. Arquitetura da Aplicação

A aplicação segue o padrão de **Single Page Application (SPA)**, onde todo o conteúdo é carregado dinamicamente em uma única página HTML. A estrutura é dividida em:

*   **Páginas Públicas:** Acessíveis a todos os usuários, incluindo o catálogo de produtos, formulário de orçamento e informações sobre serviços.
*   **Painel Administrativo:** Protegido por autenticação, acessível através das rotas `/admin/*`. Permite o gerenciamento completo do e-commerce.
*   **Gerenciamento Centralizado de Dados:** O arquivo `src/lib/dataStore.ts` atua como uma camada de persistência de dados baseada em `localStorage`, simulando um banco de dados para armazenar informações de produtos, orçamentos, usuários e prestadores.
*   **Autenticação:** Um sistema simples de autenticação por nome de usuário e senha é implementado para o painel administrativo. As credenciais de administrador são `kuster789jose` / `1@9b8z5X`.

## 4. Estrutura de Arquivos e Diretórios

A estrutura de diretórios do projeto é organizada de forma modular para facilitar o desenvolvimento e a manutenção. Abaixo está a árvore de diretórios gerada:

```
/home/ubuntu/print-convert-new:
src

/home/ubuntu/print-convert-new/src:
App.tsx
components
data
lib
pages

/home/ubuntu/print-convert-new/src/components:
Chatbot.tsx
layout

/home/ubuntu/print-convert-new/src/components/layout:
Footer.tsx
Header.tsx
Layout.tsx
WhatsAppButton.tsx

/home/ubuntu/print-convert-new/src/data:
products.ts

/home/ubuntu/print-convert-new/src/lib:
dataStore.ts
materiaisData.ts
pdfExporter.ts

/home/ubuntu/print-convert-convert-new/src/pages:
Index.tsx
Products.tsx
Quote.tsx
RegisterProvider.tsx
admin

/home/ubuntu/print-convert-new/src/pages/admin:
AdminDashboard.tsx
AdminDashboardExecutivo.tsx
AdminOrcamentos.tsx
AdminPrestadores.tsx
AdminProducao.tsx
AdminProdutosSite.tsx
AdminRelatorioProducao.tsx
AdminRelatorioVendas.tsx
AdminRelatorios.tsx
AdminVendas.tsx
```

## 5. Funcionalidades Implementadas

As seguintes funcionalidades foram desenvolvidas e integradas ao sistema:

*   **Gerenciamento de Produtos:** Operações CRUD (Criar, Ler, Atualizar, Deletar) para produtos, incluindo duplicação e edição. Layout modal horizontal para edição.
*   **Controle de Produção:** Sistema para rastreamento da produção e consumo de materiais.
*   **Sistema de Relatórios:** Relatórios abrangentes de vendas, produção e um dashboard executivo com projeções. Funcionalidade de exportação para PDF.
*   **Chatbot AI:** Chatbot 24/7 com base de conhecimento para suporte ao cliente.
*   **Integração WhatsApp:** Botão flutuante para contato direto via WhatsApp.
*   **Gerenciamento de Orçamentos:** Criação, duplicação e exclusão de orçamentos.
*   **Gerenciamento de Prestadores de Serviço:** Histórico, edição, duplicação e exclusão de prestadores.
*   **Gerenciamento de Vendas:** Detalhes do cliente e opção de exclusão de vendas.
*   **Upload de Arquivos GLB:** Sistema para visualização de modelos 3D.
*   **Controle de Estoque de Materiais:** Alertas para baixo estoque.
*   **Implantações Contínuas:** Múltiplos deploys para Vercel via integração GitHub.

## 6. Correções e Melhorias Recentes

As seguintes correções e melhorias foram implementadas:

*   **Persistência de Dados:** Corrigida a persistência de registros de usuários e prestadores no `localStorage`.
*   **Visualização 3D no Upload:** Implementada a visualização 3D imediata de arquivos GLB/STL/OBJ/3MF/STEP após o upload no formulário de orçamento.
*   **Serviços de Help Desk para Prestadores:** Adicionada a categoria de serviços de Help Desk (manutenção remota, desentupimento de bico, dicas de resfriamento, etc.) no cadastro de prestadores.
*   **Remoção de Seleção de Serviços Antiga:** Removida a seção de seleção de serviços genéricos do formulário de cadastro de prestadores, focando nos serviços de Help Desk.
*   **Novos Produtos Placa PEI:** Adicionados novos produtos de placas PEI para diversas marcas de impressoras (Creality K1/K1C/Ender 3V3/K1 MAX, Voron V0/2.4, Sovol SV06 Plus/SV08/SV08 MAX).

## 7. Próximos Passos (Pendências)

Embora muitas funcionalidades tenham sido implementadas e corrigidas, ainda existem algumas pendências a serem abordadas para a funcionalidade completa do site:

*   **Visibilidade do Botão WhatsApp:** Verificar e corrigir o estilo e `z-index` do botão WhatsApp para garantir sua visibilidade.
*   **Exibição de Imagens de Produtos:** Corrigir os caminhos das imagens em `products.ts` e garantir que as imagens sejam exibidas corretamente.
*   **Funcionalidade de Edição de Orçamentos:** Implementar a funcionalidade de edição de orçamentos no painel administrativo.
*   **Melhoria do Chatbot:** Expandir a base de conhecimento e aprimorar as respostas do chatbot para torná-lo mais útil e contextual.

Este documento serve como um guia abrangente para entender o projeto 3DKPRINT, suas capacidades e o estado atual de desenvolvimento.
