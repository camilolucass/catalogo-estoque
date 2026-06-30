# Controle de estoque

Desenvolvi este projeto para um desafio técnico. A proposta é simples: cadastrar categorias e produtos, registrar entradas e saídas e consultar o saldo de estoque sem complicar a operação.

[Acessar a aplicação](https://catalogo-estoque-five.vercel.app)

## Acesso para avaliação

```text
Usuário: Climba
Senha: conquistarterritorio
```

Essa conta existe somente para a avaliação do projeto.

## O que foi implementado

- cadastro, edição e exclusão de categorias;
- cadastro, edição e inativação de produtos;
- preço, estoque mínimo e categoria por produto;
- registro de entradas e saídas com data e observação;
- atualização automática do saldo;
- bloqueio de saídas maiores que o estoque disponível;
- alertas para estoque baixo e produtos sem saldo;
- histórico de movimentações e responsável pela operação;
- filtros e busca nas telas de produtos e movimentações;
- dashboard responsivo com indicadores e gráficos.

## Tecnologias usadas

- Next.js, React e TypeScript;
- Tailwind CSS e shadcn/ui;
- Supabase Auth e PostgreSQL;
- Recharts;
- Vitest, ESLint e GitHub Actions;
- Vercel.

## Como organizei a solução

Eu deixei a interface responsável apenas pela interação com o usuário. As validações importantes ficam no servidor e também no banco, principalmente a regra que impede o estoque de ficar negativo.

O saldo inicial entra como uma movimentação, produtos com histórico são inativados em vez de excluídos e as movimentações não podem ser alteradas depois de registradas. Assim, o saldo atual pode ser conferido com o histórico.

## Rodando o projeto

É necessário ter Node.js 22 ou superior e pnpm 11.

```powershell
pnpm install
Copy-Item .env.example .env.local
pnpm dev
```

O projeto usa um Supabase online. Não é necessário instalar ou executar o Supabase localmente.

Preencha estas variáveis em `.env.local`:

```env
SUPABASE_URL=
SUPABASE_PUBLISHABLE_KEY=
DEMO_USERNAME=Climba
DEMO_USER_EMAIL=
```

`SUPABASE_SECRET_KEY` e `DEMO_USER_PASSWORD` são usados somente pelo script de criação da conta de teste. A chave secreta não deve ficar no ambiente da aplicação.

## Comandos de verificação

```powershell
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

## Estrutura principal

```text
src/app          páginas e rotas da API
src/components   componentes da interface
src/lib          autenticação, validações e acesso aos dados
supabase         migração do banco de dados
scripts          criação do usuário de avaliação
docs             guia de uso e documentação técnica
```

## Publicação

- Aplicação: https://catalogo-estoque-five.vercel.app
- Repositório: https://github.com/camilolucass/catalogo-estoque
- Banco e autenticação: Supabase online

## Documentação

- [Guia de uso](./docs/GUIA-DE-USO.md): passo a passo para utilizar cada parte do sistema.
- [Documentação técnica](./docs/DOCUMENTACAO-TECNICA.md): arquitetura, banco, regras, segurança e tecnologias usadas.
