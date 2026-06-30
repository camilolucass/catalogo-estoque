# Relato do desenvolvimento

Comecei o projeto pelas regras de estoque, porque essa era a parte em que um erro teria mais impacto. Modelei categorias, produtos e movimentações e deixei o saldo protegido tanto pela aplicação quanto pelo banco de dados.

O ponto que exigiu mais cuidado foi a saída de produtos. Não bastava validar o valor exibido na tela: duas requisições ao mesmo tempo também não poderiam deixar o saldo negativo. Por isso, a movimentação e a atualização do saldo acontecem na mesma transação no PostgreSQL.

Depois dessa base, montei as telas de cadastro, os filtros e o dashboard. Preferi uma interface direta, com poucos atalhos e alertas visuais somente onde eles ajudam a tomar uma ação.

Também preparei autenticação, políticas de acesso no Supabase, testes das regras principais, integração contínua no GitHub e deploy na Vercel.

Usei inteligência artificial como apoio durante a implementação, principalmente para revisar código, testar cenários e organizar a documentação. As decisões sobre escopo, regras e apresentação foram ajustadas para manter o projeto coerente com o desafio.

## Melhorias que ainda fariam sentido

Se o sistema fosse evoluir além do teste, eu priorizaria:

- exportação do histórico em CSV;
- filtro de movimentações por período;
- paginação quando o volume de dados crescer;
- gestão de mais usuários e níveis de acesso;
- recuperação de senha.

Não incluí essas funções agora porque aumentariam o escopo sem melhorar a demonstração das regras principais do desafio.
