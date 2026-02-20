# Guia de Configuração do Supabase para 3DKPRINT

Este guia detalha como configurar o Supabase para transformar o 3DKPRINT em uma plataforma profissional com banco de dados real, autenticação e armazenamento de arquivos.

## 1. Criar uma Conta no Supabase

1.  Acesse [supabase.com](https://supabase.com)
2.  Clique em **"Start your project"**
3.  Faça login com sua conta GitHub ou crie uma nova conta
4.  Crie uma nova organização (ex: "3DKPRINT")
5.  Crie um novo projeto com as seguintes configurações:
    - **Nome:** `3dkprint`
    - **Database Password:** Escolha uma senha forte
    - **Region:** Escolha a região mais próxima (ex: `South America (São Paulo)`)

## 2. Inicializar o Banco de Dados

Após criar o projeto:

1.  No dashboard do Supabase, vá para **SQL Editor**
2.  Clique em **"New Query"**
3.  Copie e cole todo o conteúdo do arquivo `supabase_schema.sql`
4.  Clique em **"Run"** para executar o script
5.  Aguarde a conclusão (deve criar todas as tabelas automaticamente)

## 3. Configurar Variáveis de Ambiente

1.  Copie o arquivo `.env.example` para `.env.local`:
    ```bash
    cp .env.example .env.local
    ```

2.  No dashboard do Supabase, vá para **Settings > API**
3.  Copie os seguintes valores:
    - **Project URL** → `REACT_APP_SUPABASE_URL`
    - **anon public** (chave) → `REACT_APP_SUPABASE_ANON_KEY`

4.  Seu arquivo `.env.local` deve ficar assim:
    ```
    REACT_APP_SUPABASE_URL=https://seu-projeto.supabase.co
    REACT_APP_SUPABASE_ANON_KEY=sua-chave-anonima-aqui
    REACT_APP_OPENAI_API_KEY=sua-chave-openai-aqui
    REACT_APP_OPENAI_MODEL=gpt-3.5-turbo
    ```

## 4. Configurar Autenticação (Auth)

### Habilitar Autenticação por E-mail

1.  No Supabase, vá para **Authentication > Providers**
2.  Certifique-se de que **Email** está habilitado
3.  Vá para **Authentication > Email Templates**
4.  Customize os templates de e-mail se necessário

### Configurar Redirect URLs

1.  Vá para **Authentication > URL Configuration**
2.  Adicione as seguintes URLs:
    - `http://localhost:3000` (desenvolvimento)
    - `https://www.3dkprint.com.br` (produção)
    - `https://3dkprint.vercel.app` (se usar Vercel)

## 5. Configurar Storage (Armazenamento de Arquivos)

O Supabase Storage permite armazenar imagens, modelos 3D e outros arquivos.

1.  No Supabase, vá para **Storage**
2.  Clique em **"Create a new bucket"** e crie os seguintes buckets:
    - `produtos` (para imagens de produtos)
    - `orcamentos` (para arquivos 3D enviados pelos clientes)
    - `producao` (para documentos de produção)

3.  Para cada bucket, configure as políticas de acesso:
    - Vá para **Policies**
    - Adicione uma política para permitir leitura pública:
      ```sql
      CREATE POLICY "Public Access"
      ON storage.objects FOR SELECT
      USING (bucket_id = 'seu-bucket-aqui');
      ```

## 6. Integrar com OpenAI (Para Chatbot IA)

1.  Acesse [platform.openai.com](https://platform.openai.com)
2.  Crie uma conta ou faça login
3.  Vá para **API keys** e clique em **"Create new secret key"**
4.  Copie a chave e adicione ao seu `.env.local`:
    ```
    REACT_APP_OPENAI_API_KEY=sk-sua-chave-aqui
    ```

## 7. Instalar Dependências

Execute o seguinte comando para instalar o cliente Supabase:

```bash
npm install @supabase/supabase-js
```

## 8. Atualizar o Código da Aplicação

Os seguintes arquivos já foram criados com suporte ao Supabase:

- `src/lib/supabaseClient.ts` - Cliente Supabase com todas as funções
- `src/components/ChatbotIA.tsx` - Chatbot integrado com OpenAI
- `src/components/ImageUploader.tsx` - Upload de imagens
- `src/components/OrcamentoEditModal.tsx` - Edição de orçamentos

## 9. Migrar Dados do localStorage

Para migrar dados existentes do localStorage para o Supabase:

1.  Crie um script de migração (opcional)
2.  Execute manualmente no console do navegador:
   ```javascript
   // Obter dados do localStorage
   const produtos = JSON.parse(localStorage.getItem('produtos_site') || '[]');
   const orcamentos = JSON.parse(localStorage.getItem('orcamentos') || '[]');
   const usuarios = JSON.parse(localStorage.getItem('usuarios') || '[]');
   
   // Copiar para o Supabase (use as funções em supabaseClient.ts)
   ```

## 10. Testar a Integração

1.  Inicie o servidor de desenvolvimento:
    ```bash
    npm run dev
    ```

2.  Teste os seguintes fluxos:
    - Criar uma conta de usuário
    - Fazer login
    - Enviar um orçamento
    - Upload de imagem
    - Chat com IA

## 11. Deploy no Vercel

1.  Faça push do código para GitHub
2.  No Vercel, vá para **Settings > Environment Variables**
3.  Adicione as mesmas variáveis do `.env.local`:
   - `REACT_APP_SUPABASE_URL`
   - `REACT_APP_SUPABASE_ANON_KEY`
   - `REACT_APP_OPENAI_API_KEY`
   - `REACT_APP_OPENAI_MODEL`

4.  Faça um novo deploy

## Troubleshooting

### Erro: "Supabase URL ou chave não configuradas"
- Verifique se o arquivo `.env.local` existe e contém as variáveis corretas
- Reinicie o servidor de desenvolvimento após adicionar variáveis

### Erro: "Falha ao fazer upload de arquivo"
- Verifique se os buckets de Storage foram criados
- Verifique as políticas de acesso (RLS) do bucket

### Erro: "OpenAI API não responde"
- Verifique se a chave da API está correta
- Verifique se você tem créditos disponíveis na conta OpenAI
- Verifique o limite de requisições

## Próximos Passos

Após configurar o Supabase:

1.  **Implementar Autenticação Completa:** Adicionar login/registro para clientes
2.  **Automação de E-mails:** Configurar notificações automáticas via SendGrid ou Mailgun
3.  **Webhooks:** Configurar webhooks para eventos importantes
4.  **Backups:** Configurar backups automáticos do banco de dados
5.  **Monitoramento:** Configurar alertas para performance e erros

Para mais informações, consulte a [documentação oficial do Supabase](https://supabase.com/docs).
