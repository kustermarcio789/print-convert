# Instruções de Deploy - 3DKPRINT

## Resumo das Correções

O site foi corrigido com sucesso. Os principais problemas resolvidos foram:

1. **Variáveis de Ambiente**: Alteradas de `process.env.REACT_APP_*` para `import.meta.env.VITE_*`
2. **Configuração do Vite**: Simplificada para evitar conflitos de resolução
3. **Dependências**: Instaladas com `--legacy-peer-deps` para resolver conflitos

## Pré-requisitos

- Node.js 20.x ou superior
- npm 10.x ou superior
- Credenciais do Supabase
- Chave de API da OpenAI (opcional, para o chatbot)

## Passos para Deploy

### 1. Preparar o Ambiente Local

```bash
# Clonar ou extrair o projeto
cd site_3dkprint

# Instalar dependências
npm install --legacy-peer-deps
```

### 2. Configurar Variáveis de Ambiente

Criar arquivo `.env.local` na raiz do projeto:

```env
# Supabase
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua-chave-anonima-aqui

# OpenAI (Chatbot)
VITE_OPENAI_API_KEY=sua-chave-openai-aqui
VITE_OPENAI_MODEL=gpt-3.5-turbo

# Configurações Gerais
VITE_URL=https://www.3dkprint.com.br
VITE_ENV=production
```

### 3. Compilar para Produção

```bash
npm run build
```

Os arquivos compilados estarão em `./dist/`

### 4. Testar Localmente (Opcional)

```bash
npm run preview
```

Acesse `http://localhost:4173` para visualizar a versão de produção.

## Deploy em Diferentes Plataformas

### Vercel (Recomendado)

```bash
# Instalar Vercel CLI
npm install -g vercel

# Fazer deploy
vercel
```

Configurar variáveis de ambiente no painel do Vercel.

### Netlify

```bash
# Instalar Netlify CLI
npm install -g netlify-cli

# Fazer deploy
netlify deploy --prod --dir=dist
```

### Servidor Tradicional (Apache, Nginx)

1. Compilar: `npm run build`
2. Copiar conteúdo de `dist/` para o servidor web
3. Configurar rewrite rules para SPA:

**Nginx:**
```nginx
location / {
  try_files $uri $uri/ /index.html;
}
```

**Apache:**
```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . /index.html [L]
</IfModule>
```

## Verificação Pós-Deploy

1. ✅ Verificar se o site carrega corretamente
2. ✅ Testar formulários de orçamento
3. ✅ Verificar se o chatbot IA funciona (se configurado)
4. ✅ Testar login/registro
5. ✅ Verificar responsividade em dispositivos móveis
6. ✅ Verificar console do navegador para erros

## Troubleshooting

### Erro: "Variáveis de ambiente não configuradas"

**Solução**: Adicionar as variáveis ao arquivo `.env.local` ou configurar no painel do seu provedor de hosting.

### Erro: "Cannot find module"

**Solução**: Executar `npm install --legacy-peer-deps` novamente.

### Erro: "Supabase connection failed"

**Solução**: Verificar se as credenciais do Supabase estão corretas em `.env.local`.

### Página em branco após deploy

**Solução**: 
1. Verificar console do navegador (F12)
2. Verificar se o arquivo `index.html` foi copiado
3. Verificar se o servidor está servindo arquivos estáticos corretamente

## Performance

O site foi compilado com sucesso. Avisos de performance:

- **Bundle Size**: O arquivo principal é ~2.6 MB (comprimido: ~725 KB)
- **Recomendação**: Implementar code-splitting dinâmico para melhor performance

## Monitoramento

Recomenda-se configurar:

1. **Sentry** ou similar para rastreamento de erros
2. **Google Analytics** para monitoramento de tráfego
3. **Uptime Monitoring** para verificar disponibilidade

## Suporte

Para dúvidas ou problemas:

- Email: 3dk.print.br@gmail.com
- WhatsApp: (43) 99174-1518
- Website: https://www.3dkprint.com.br

---

**Status**: ✅ Pronto para Deploy
**Data**: 2026-02-22
**Versão**: 2.0.0
