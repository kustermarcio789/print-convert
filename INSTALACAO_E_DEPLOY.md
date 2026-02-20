# Guia de Instalação e Deploy - 3DKPRINT v2.0

Este guia detalha como instalar, configurar e fazer deploy da plataforma 3DKPRINT com todas as novas funcionalidades.

## Pré-requisitos

Antes de começar, certifique-se de ter instalado:
- **Node.js** 18+ ([nodejs.org](https://nodejs.org))
- **npm** ou **yarn** (geralmente vem com Node.js)
- **Git** ([git-scm.com](https://git-scm.com))
- Conta no **GitHub** ([github.com](https://github.com))
- Conta no **Vercel** ([vercel.com](https://vercel.com))
- Conta no **Supabase** ([supabase.com](https://supabase.com))
- Conta no **OpenAI** ([openai.com](https://openai.com))

---

## Passo 1: Clonar o Repositório

```bash
# Clone o repositório
git clone https://github.com/seu-usuario/print-convert-new.git

# Entre no diretório
cd print-convert-new

# Instale as dependências
npm install
```

---

## Passo 2: Configurar Supabase

### 2.1 Criar Projeto no Supabase

1. Acesse [supabase.com](https://supabase.com) e faça login
2. Clique em **"New Project"**
3. Preencha os dados:
   - **Project Name**: `3dkprint`
   - **Database Password**: Escolha uma senha forte
   - **Region**: Escolha `South America (São Paulo)` para melhor performance
4. Clique em **"Create new project"** e aguarde (pode levar 2-3 minutos)

### 2.2 Executar o Schema SQL

1. No dashboard do Supabase, vá para **SQL Editor**
2. Clique em **"New Query"**
3. Copie todo o conteúdo do arquivo `supabase_schema.sql`
4. Cole no editor e clique em **"Run"**
5. Aguarde a conclusão (deve ver "Success" ao final)

### 2.3 Obter as Credenciais

1. Vá para **Settings > API**
2. Copie:
   - **Project URL** → será `REACT_APP_SUPABASE_URL`
   - **anon public** (chave) → será `REACT_APP_SUPABASE_ANON_KEY`

---

## Passo 3: Configurar OpenAI

### 3.1 Criar Chave de API

1. Acesse [platform.openai.com](https://platform.openai.com)
2. Faça login ou crie uma conta
3. Vá para **API keys** no menu lateral
4. Clique em **"Create new secret key"**
5. Copie a chave (você não poderá vê-la novamente!)

### 3.2 Adicionar Créditos

1. Vá para **Billing > Overview**
2. Clique em **"Add to balance"**
3. Adicione pelo menos R$ 50 para testes

---

## Passo 4: Configurar Variáveis de Ambiente

### 4.1 Criar arquivo `.env.local`

```bash
# Na raiz do projeto, crie o arquivo
cp .env.example .env.local
```

### 4.2 Preencher as variáveis

Abra `.env.local` e preencha com seus valores:

```bash
# Supabase (obtido no Passo 2.3)
REACT_APP_SUPABASE_URL=https://seu-projeto.supabase.co
REACT_APP_SUPABASE_ANON_KEY=sua-chave-anonima-aqui

# OpenAI (obtido no Passo 3.1)
REACT_APP_OPENAI_API_KEY=sk-sua-chave-aqui
REACT_APP_OPENAI_MODEL=gpt-3.5-turbo

# Gerais
REACT_APP_URL=https://www.3dkprint.com.br
REACT_APP_ENV=development
```

---

## Passo 5: Testar Localmente

### 5.1 Iniciar o servidor de desenvolvimento

```bash
npm run dev
```

Você verá algo como:
```
  VITE v5.0.8  ready in 234 ms

  ➜  Local:   http://localhost:5173/
  ➜  press h to show help
```

### 5.2 Acessar a aplicação

Abra seu navegador em [http://localhost:5173](http://localhost:5173)

### 5.3 Testar funcionalidades

- [ ] Página inicial carrega
- [ ] Clique em "Registrar" e crie uma conta
- [ ] Faça login com a conta criada
- [ ] Acesse o formulário de orçamento
- [ ] Teste o chatbot (ícone no canto inferior direito)
- [ ] Acesse o painel admin (Login > Admin)
  - Usuário: `kuster789jose`
  - Senha: `1@9b8z5X`

---

## Passo 6: Fazer Build para Produção

```bash
# Compilar para produção
npm run build

# Testar o build localmente
npm run preview
```

---

## Passo 7: Deploy no Vercel

### 7.1 Conectar ao GitHub

1. Faça push do código para GitHub:
```bash
git add .
git commit -m "Implementar melhorias v2.0 com Supabase e OpenAI"
git push origin main
```

### 7.2 Fazer Deploy no Vercel

1. Acesse [vercel.com](https://vercel.com)
2. Clique em **"New Project"**
3. Selecione o repositório `print-convert-new`
4. Clique em **"Import"**

### 7.3 Configurar Variáveis de Ambiente

1. Na página de configuração do Vercel, vá para **Environment Variables**
2. Adicione as mesmas variáveis do `.env.local`:
   - `REACT_APP_SUPABASE_URL`
   - `REACT_APP_SUPABASE_ANON_KEY`
   - `REACT_APP_OPENAI_API_KEY`
   - `REACT_APP_OPENAI_MODEL`
   - `REACT_APP_URL`
   - `REACT_APP_ENV=production`

3. Clique em **"Deploy"**

### 7.4 Apontar o Domínio

1. No Vercel, vá para **Settings > Domains**
2. Clique em **"Add Domain"**
3. Digite `www.3dkprint.com.br`
4. Siga as instruções para atualizar os registros DNS no seu provedor de domínio

---

## Passo 8: Configurar Autenticação (Opcional mas Recomendado)

### 8.1 Configurar E-mail de Confirmação

1. No Supabase, vá para **Authentication > Email Templates**
2. Customize os templates de confirmação de e-mail
3. Adicione o logo e branding da 3DKPRINT

### 8.2 Configurar Redirect URLs

1. Vá para **Authentication > URL Configuration**
2. Adicione:
   - `http://localhost:3000` (desenvolvimento)
   - `https://www.3dkprint.com.br` (produção)
   - `https://3dkprint.vercel.app` (preview)

---

## Passo 9: Configurar Notificações por E-mail (Opcional)

Para ativar o envio automático de e-mails:

### 9.1 Criar Conta no SendGrid ou Resend

- **SendGrid**: [sendgrid.com](https://sendgrid.com)
- **Resend**: [resend.com](https://resend.com) (recomendado)

### 9.2 Criar Supabase Function

1. No Supabase, vá para **Functions**
2. Clique em **"Create a new function"**
3. Nome: `send-email`
4. Cole o código fornecido em `src/lib/emailService.ts`

---

## Checklist Final

Antes de considerar o projeto "pronto para produção":

### Segurança
- [ ] Variáveis de ambiente configuradas no Vercel
- [ ] SSL/HTTPS ativado (automático no Vercel)
- [ ] RLS (Row Level Security) ativado no Supabase
- [ ] Senhas de admin alteradas

### Performance
- [ ] Build otimizado (`npm run build`)
- [ ] Imagens comprimidas
- [ ] Cache configurado no Vercel

### Funcionalidades
- [ ] Login/Registro funcionando
- [ ] Chatbot respondendo
- [ ] Upload de imagens funcionando
- [ ] Orçamentos sendo salvos no banco
- [ ] E-mails sendo enviados (se configurado)

### Monitoramento
- [ ] Sentry ou similar configurado para rastreamento de erros
- [ ] Google Analytics configurado
- [ ] Logs do Supabase sendo monitorados

---

## Troubleshooting

### Erro: "Cannot find module '@supabase/supabase-js'"
```bash
# Instale as dependências novamente
npm install
```

### Erro: "REACT_APP_SUPABASE_URL is not defined"
- Verifique se o arquivo `.env.local` existe
- Reinicie o servidor de desenvolvimento (`npm run dev`)
- No Vercel, verifique se as variáveis estão em **Environment Variables**

### Erro: "OpenAI API error: Invalid API key"
- Verifique se a chave está correta em `.env.local`
- Certifique-se de que a conta OpenAI tem créditos disponíveis

### Erro: "Database connection failed"
- Verifique se o Supabase está online
- Verifique se `REACT_APP_SUPABASE_URL` está correto
- Tente criar um novo projeto no Supabase

---

## Próximos Passos

Após o deploy bem-sucedido:

1. **Testar em Produção**: Acesse https://www.3dkprint.com.br e teste todas as funcionalidades
2. **Configurar Backups**: No Supabase, ative backups automáticos
3. **Monitorar Performance**: Use as ferramentas do Vercel para monitorar
4. **Adicionar Pagamento**: Integre Stripe ou PagSeguro
5. **Marketing**: Comece a promover o site

---

## Suporte

Se encontrar problemas:

1. Verifique os logs no Vercel: **Deployments > Logs**
2. Verifique os logs do Supabase: **Logs**
3. Abra uma issue no GitHub
4. Entre em contato via WhatsApp: (43) 99174-1518

---

## Conclusão

Parabéns! Você agora tem uma plataforma 3DKPRINT profissional, escalável e pronta para crescimento. 

**Próximas melhorias sugeridas**:
- Integração com sistema de pagamento
- App mobile
- Integração com WhatsApp Business API
- Sistema de avaliações e reviews
- Dashboard para clientes acompanharem produção em tempo real

Boa sorte! 🚀
