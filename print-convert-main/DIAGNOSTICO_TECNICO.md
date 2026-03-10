# Diagnóstico Técnico - Auditoria de Projeto

## 1. Visão Geral do Projeto

O projeto `print-convert` é uma aplicação web desenvolvida com **Vite**, **React**, e **TypeScript**, utilizando **TailwindCSS** para estilização e componentes **Shadcn UI**. A gestão de estado e rotas é feita com `react-router-dom` e `react-query`. A persistência de dados e autenticação são gerenciadas através do **Supabase**.

## 2. Escopo da Auditoria

Esta auditoria abrangeu os seguintes pontos, conforme solicitado:

- Mapeamento da estrutura do projeto.
- Validação do build local.
- Verificação de variáveis de ambiente.
- Análise de rotas protegidas, autenticação e autorização.
- Revisão da integração com APIs (Supabase).
- Análise de componentes do painel administrativo (CRUD, persistência, logs, tratamento de exceções, feedback visual, validação de inputs).

## 3. Detalhamento do Diagnóstico

### 3.1. Bugs Encontrados

#### 3.1.1. Conflito de Dependência `three`

Durante a instalação das dependências (`npm install`), foi identificado um conflito de `peer dependency` com a biblioteca `three.js`, utilizada pelo `@google/model-viewer`. A versão `three@0.183.1` instalada no projeto entra em conflito com a `peer dependency` esperada pelo `@google/model-viewer` (`^0.172.0`).

- **Impacto**: Embora a instalação tenha sido forçada com `--legacy-peer-deps`, isso pode levar a comportamentos inesperados ou quebras futuras se as versões não forem compatíveis em tempo de execução. O build foi concluído, mas a estabilidade do `model-viewer` precisa ser verificada.
- **Referência**: `npm error ERESOLVE could not resolve` durante `npm install`.

#### 3.1.2. Aviso de Tamanho de Chunk no Build

O processo de build (`npm run build`) gerou um aviso sobre o tamanho de alguns *chunks* JavaScript serem maiores que 500 kB após a minificação.

- **Impacto**: *Chunks* grandes podem impactar negativamente o tempo de carregamento inicial da aplicação, especialmente em conexões de internet mais lentas, prejudicando a experiência do usuário e o SEO.
- **Referência**: `(!) Some chunks are larger than 500 kB after minification.`

### 3.2. Problemas de Arquitetura

#### 3.2.1. Autenticação e Autorização Inseguras no Painel Administrativo

O componente `AdminLogin.tsx` implementa a autenticação do painel administrativo de forma altamente insegura:

- **Credenciais Hardcoded**: O `MASTER_ADMIN_EMAIL` e `MASTER_ADMIN_PASS`, juntamente com as `STAFF_ACCOUNTS`, estão **diretamente codificados no frontend** (`AdminLogin.tsx`). Isso expõe as credenciais a qualquer pessoa que inspecione o código-fonte da aplicação.
- **Autenticação Baseada em `localStorage`**: A verificação de autenticação (`localStorage.getItem('admin_authenticated') === 'true'`) é feita no lado do cliente. Isso significa que um usuário mal-intencionado pode simplesmente manipular o `localStorage` para obter acesso ao painel administrativo sem autenticação real.
- **Falta de Backend para Autenticação Admin**: Não há indícios de uma camada de backend robusta para gerenciar a autenticação e autorização de administradores, o que é fundamental para a segurança de um painel administrativo.

- **Impacto**: **Crítico**. Qualquer pessoa pode obter acesso total ao painel administrativo, comprometendo a segurança dos dados, a integridade do sistema e a privacidade dos usuários. Esta é a falha de segurança mais grave identificada.

#### 3.2.2. Exposição da Chave `VITE_SUPABASE_ANON_KEY`

A chave `VITE_SUPABASE_ANON_KEY` está presente no arquivo `.env` e, por ser uma variável `VITE_`, é exposta no bundle do frontend. Embora o Supabase seja projetado para lidar com chaves públicas no frontend, a ausência de uma camada de backend para operações sensíveis pode ser um risco.

- **Impacto**: Moderado. Embora a chave `anon` do Supabase seja projetada para ser pública, a dependência exclusiva do frontend para todas as operações de CRUD (como visto em `apiClient.ts`) pode levar a vulnerabilidades se as políticas de RLS (Row Level Security) do Supabase não forem configuradas de forma extremamente rigorosa e auditada. Operações de `delete` e `update` sensíveis deveriam idealmente passar por um backend para validação adicional e para evitar a exposição de lógica de negócios.

#### 3.2.3. Duplicação de Código para Menu de Navegação

O array `menuItems` que define a navegação do sidebar do painel administrativo está duplicado em múltiplos componentes (e.g., `AdminUsuarios.tsx`, `AdminOrcamentos.tsx`, `AdminProdutos.tsx`).

- **Impacto**: Baixo. Dificulta a manutenção e escalabilidade. Qualquer alteração no menu exige modificação em vários arquivos, aumentando a chance de erros e inconsistências.

### 3.3. Falhas de Segurança

- **Autenticação e Autorização do Painel Administrativo**: Conforme detalhado em 3.2.1, esta é a falha de segurança mais crítica. As credenciais hardcoded e a autenticação baseada em `localStorage` são vulnerabilidades graves.
- **Exposição de Chave Supabase**: Conforme detalhado em 3.2.2, a exposição da chave `anon` do Supabase no frontend, sem uma camada de backend para intermediar operações sensíveis, pode ser uma falha de segurança se as políticas de RLS não forem robustas.

### 3.4. Código Duplicado

- **Menu de Navegação do Admin**: O array `menuItems` é duplicado em `AdminUsuarios.tsx`, `AdminOrcamentos.tsx`, `AdminProdutos.tsx`, entre outros componentes do painel administrativo.

### 3.5. Endpoints Quebrados / Integrações

- **`VITE_API_URL` Vazio**: A variável de ambiente `VITE_API_URL` no arquivo `.env` está vazia. Se houver uma API externa que o projeto deveria consumir (além do Supabase), ela não está configurada.
- **API Supabase**: As APIs de CRUD para `produtos`, `orcamentos`, `prestadores`, `usuarios`, `vendas`, `estoque` e `producao` estão implementadas em `apiClient.ts` utilizando o Supabase. A funcionalidade básica de CRUD parece estar presente. No entanto, a ausência de tratamento de erros mais robusto (além de `console.error`) pode levar a uma experiência de usuário ruim em caso de falhas na API.

### 3.6. Possíveis Gargalos de Performance

- **Tamanho do Bundle JavaScript**: O aviso de *chunks* grandes (acima de 500 kB) sugere que o carregamento inicial da aplicação pode ser lento. Isso pode ser mitigado com *code splitting* (divisão de código) usando `dynamic import()` ou configurando `rollupOptions.output.manualChunks` no `vite.config.ts`.

## 4. Recomendações Preliminares

Com base neste diagnóstico inicial, as seguintes ações são prioritárias:

1.  **Refatorar Autenticação Admin**: Implementar um sistema de autenticação seguro para o painel administrativo, idealmente com um backend dedicado que gerencie credenciais e sessões, e que utilize autenticação baseada em tokens (JWT) ou sessões seguras. Remover todas as credenciais hardcoded do frontend.
2.  **Proteger Operações Sensíveis**: Para operações de CRUD sensíveis (como exclusão de usuários, produtos, etc.), considerar a implementação de uma camada de backend que valide as requisições e proteja a chave de serviço do Supabase, se aplicável, ou utilize políticas de RLS extremamente rigorosas no Supabase.
3.  **Otimização de Performance**: Investigar e implementar *code splitting* para reduzir o tamanho dos *chunks* JavaScript e melhorar o tempo de carregamento da aplicação.
4.  **Refatorar Código Duplicado**: Criar um componente de sidebar reutilizável para o painel administrativo, que receba os itens de menu como `props` ou de um arquivo de configuração centralizado.
5.  **Tratamento de Erros da API**: Implementar um tratamento de erros mais abrangente nas chamadas de API, fornecendo feedback visual adequado ao usuário em caso de falhas.
6.  **Variáveis de Ambiente**: Clarificar o propósito da variável `VITE_API_URL` e configurá-la corretamente ou removê-la se não for utilizada.

## 5. Próximos Passos

Com este diagnóstico em mãos, o próximo passo será focar nas correções mais críticas, começando pela segurança do painel administrativo, e em seguida, implementar os testes automatizados conforme o plano.
