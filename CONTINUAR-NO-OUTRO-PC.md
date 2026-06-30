# Continuar o sistema de controle de estoque em outro PC

## 1. Preparar o computador

Instale:

- Git
- Node.js 22 ou superior
- pnpm 11

Para ativar o pnpm com o Corepack:

```powershell
corepack enable
corepack prepare pnpm@11.7.0 --activate
```

## 2. Extrair e instalar

Extraia o ZIP, abra o PowerShell dentro da pasta `catalogo-estoque` e execute:

```powershell
pnpm install
Copy-Item .env.example .env.local
```

Edite `.env.local` para usar o modo local de demonstração:

```env
APP_DEMO_MODE=true
DEMO_USERNAME=Climba
DEMO_USER_EMAIL=climba@example.com
DEMO_USER_PASSWORD=conquistarterritorio
DEMO_SESSION_SECRET=troque-por-uma-chave-local-grande
```

Inicie a aplicação:

```powershell
pnpm dev
```

Acesse `http://localhost:3000`.

## 3. Verificar o ambiente

```powershell
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

## Estado atual

Já implementado:

- Autenticação por usuário e senha
- Dashboard gráfico e responsivo
- CRUD de categorias e produtos
- Registro de entradas e saídas
- Bloqueio de estoque negativo no servidor e no PostgreSQL
- Histórico por produto
- Filtros, alertas visuais e estados de erro
- Migração Supabase com RLS, grants e transações
- CI do GitHub, Dependabot e documentação

Próximas etapas externas:

1. Aplicar a migração ao projeto Supabase escolhido.
2. Configurar as variáveis reais do Supabase.
3. Executar `pnpm provision:demo` para criar o usuário Climba.
4. Publicar o repositório no GitHub.
5. Importar o repositório na Vercel e realizar o deploy.

Consulte o `README.md` para detalhes de segurança e produção.
