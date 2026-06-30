# Sistema de controle de estoque

Aplicação web para catálogo de produtos e controle seguro de estoque. Categorias, produtos e movimentações são reunidos em um dashboard responsivo com métricas, gráficos, filtros e histórico auditável.

## Tecnologias

- Next.js 16, React 19 e TypeScript
- Tailwind CSS 4 e shadcn/ui
- Supabase Auth e PostgreSQL
- Recharts para visualização de dados
- Vercel para deploy e previews
- Vitest, ESLint e TypeScript para qualidade

## Funcionalidades

- Login por usuário e senha
- CRUD de categorias
- CRUD e inativação segura de produtos
- Estoque mínimo configurável por produto
- Entradas e saídas com atualização automática do saldo
- Bloqueio transacional de saída superior ao estoque
- Histórico imutável com usuário responsável
- Busca e filtros por categoria, disponibilidade e tipo
- Dashboard com indicadores, gráficos e movimentações recentes
- Layout responsivo para desktop e dispositivos móveis

## Segurança

- Nenhuma chave administrativa é enviada ao navegador.
- Todas as operações de escrita são autenticadas e validadas no servidor.
- O PostgreSQL repete as regras com constraints, grants e RLS.
- O saldo não possui permissão de alteração direta.
- Movimentações e saldo são atualizados na mesma transação.
- `SELECT ... FOR UPDATE` serializa saídas concorrentes.
- Movimentações não podem ser atualizadas ou excluídas.
- Cookies de sessão usam `HttpOnly`, `Secure` e `SameSite` em produção.
- Cabeçalhos de segurança são enviados pelo Next.js.

## Usuário de teste

```text
Usuário: Climba
Senha: conquistarterritorio
```

Esta é uma conta exclusivamente demonstrativa. Não reutilize a senha em outros serviços e remova ou rotacione a conta após a avaliação.

## Executar localmente

Requisitos: Node.js 22+ e pnpm 11.

```bash
pnpm install
cp .env.example .env.local
pnpm dev
```

Para visualizar a interface sem um projeto Supabase, configure em `.env.local`:

```env
APP_DEMO_MODE=true
DEMO_USERNAME=Climba
DEMO_USER_EMAIL=climba@example.com
DEMO_USER_PASSWORD=conquistarterritorio
DEMO_SESSION_SECRET=uma-chave-local-aleatoria
```

O modo demonstrativo só funciona fora de produção. Em produção, o Supabase é obrigatório.

## Configurar o Supabase

1. Crie ou selecione um projeto Supabase.
2. Aplique a migração em `supabase/migrations`.
3. Configure as variáveis abaixo sem o prefixo `NEXT_PUBLIC_`:

```env
SUPABASE_URL=
SUPABASE_PUBLISHABLE_KEY=
SUPABASE_SECRET_KEY=
DEMO_USERNAME=Climba
DEMO_USER_EMAIL=climba@example.com
DEMO_USER_PASSWORD=conquistarterritorio
```

4. Execute `pnpm provision:demo` uma única vez.
5. Remova `SUPABASE_SECRET_KEY` do ambiente da aplicação depois do provisionamento. Ela não é necessária em runtime.

## Verificações

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

## Deploy na Vercel

1. Publique o repositório no GitHub.
2. Importe o repositório na Vercel.
3. Configure `SUPABASE_URL`, `SUPABASE_PUBLISHABLE_KEY`, `DEMO_USERNAME` e `DEMO_USER_EMAIL` para Production.
4. Não configure `SUPABASE_SECRET_KEY` no runtime da Vercel.
5. Cadastre a URL de produção permitida no Supabase Auth.

Link de produção: a preencher após o deploy.

## Decisões técnicas

O Next.js funciona como Backend for Frontend: a interface chama somente rotas da própria aplicação. A chave publishable fica no servidor por escolha arquitetural, embora não seja secreta. A autorização final permanece no PostgreSQL por meio de RLS e privilégios por coluna.

Produtos que nunca tiveram movimentações podem ser excluídos fisicamente. Produtos com histórico são inativados. Categorias com produtos vinculados não podem ser excluídas. O estoque inicial é registrado como uma movimentação de entrada, preservando a reconciliação entre saldo e histórico.

## Relato rápido

O trabalho começou pela modelagem das entidades e das regras críticas de concorrência. Em seguida foram implementadas as fronteiras de autenticação, validação no servidor e segurança do banco. A interface foi construída sobre esse núcleo com foco em leitura rápida, estados claros e responsividade.

Foram utilizados Next.js, React, TypeScript, Supabase, PostgreSQL, Tailwind CSS, shadcn/ui, Recharts, GitHub e Vercel. Inteligência artificial foi utilizada como apoio na arquitetura, implementação, revisão das regras de negócio, testes e documentação. As decisões finais priorizam rastreabilidade, consistência do estoque e clareza para o avaliador.
