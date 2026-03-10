# Problemas Encontrados

## 1. Login - Botões com ícones (deve ser só botão limpo)
- Login.tsx tem botões com ícones (LogIn, UserPlus, ShieldCheck) e descrições
- Usuário quer apenas botões simples sem ícones/loguinhos

## 2. Produtos - Faltam fotos reais
- Products.tsx usa ícones placeholder (Printer icon) em vez de fotos reais
- Imagens referenciadas: /images/printers/elegoo-centauri.png etc. mas não existem
- Precisa buscar imagens reais das impressoras e organizar por marca

## 3. Login Admin - Senha diferente!
- AdminLogin.tsx (rota /admin/login): senha = '1@9b8z5X' (com @ e b minúsculo)
- Login.tsx (rota /login, modo admin): senha = '1A9B8Z5X' (tudo maiúsculo)
- Usuário tenta com '1A9B8Z5X' - funciona no Login.tsx mas NÃO no AdminLogin.tsx
- ProtectedRoute redireciona para /admin/login quando não autenticado
- SOLUÇÃO: Unificar senhas para '1A9B8Z5X' em ambos os arquivos

## 4. Configurações da Conta - Precisa mais campos
- MyAccount.tsx tem apenas: Nome, Email, WhatsApp, CEP
- Precisa adicionar: CPF, Endereço completo (rua, número, bairro, cidade, estado), Data nascimento
- Todos os campos devem ser editáveis
