# Guia de uso

Este guia mostra o fluxo principal do sistema, desde o acesso até a consulta do histórico de estoque.

## 1. Acessar o sistema

Abra a aplicação:

https://catalogo-estoque-five.vercel.app

Use as credenciais de avaliação:

```text
Usuário: Climba
Senha: conquistarterritorio
```

1. Preencha o campo **Usuário**.
2. Preencha o campo **Senha**.
3. Clique em **Entrar**.

Se os dados estiverem corretos, o sistema abrirá a visão geral do estoque.

## 2. Entender a visão geral

A primeira tela reúne um resumo da operação:

- **Produtos ativos:** quantidade de produtos disponíveis para uso;
- **Categorias:** total de categorias cadastradas;
- **Estoque baixo:** produtos com saldo menor que o estoque mínimo;
- **Sem estoque:** produtos com saldo igual a zero;
- **Fluxo de movimentações:** entradas e saídas registradas nos últimos sete dias;
- **Produtos por categoria:** distribuição dos produtos cadastrados;
- **Movimentações recentes:** últimas operações realizadas;
- **Produtos que exigem atenção:** itens com estoque baixo ou sem saldo.

Use o menu lateral para acessar **Produtos**, **Categorias** e **Movimentações**.

## 3. Cadastrar uma categoria

Cadastre a categoria antes do produto que será associado a ela.

1. Abra **Categorias** no menu lateral.
2. Clique em **Nova categoria**.
3. Informe o nome da categoria.
4. Se quiser, adicione uma descrição.
5. Clique em **Criar categoria**.

### Editar ou excluir uma categoria

1. Localize a categoria na tabela.
2. Abra o menu de ações no final da linha.
3. Escolha **Editar** ou **Excluir**.

Uma categoria que possui produtos vinculados não pode ser excluída. Nesse caso, transfira ou remova os produtos antes de tentar novamente.

O campo de busca pode ser usado para localizar uma categoria pelo nome.

## 4. Cadastrar um produto

1. Abra **Produtos** no menu lateral.
2. Clique em **Novo produto**.
3. Preencha os campos:
   - **Nome:** identificação do produto;
   - **Descrição:** informações complementares, se necessárias;
   - **Categoria:** grupo ao qual o produto pertence;
   - **Preço:** valor unitário;
   - **Estoque inicial:** quantidade disponível no cadastro;
   - **Estoque mínimo:** limite usado para o alerta de reposição.
4. Clique em **Criar produto**.

Quando o estoque inicial é maior que zero, o sistema registra automaticamente uma primeira movimentação de entrada com a observação **Estoque inicial**.

### Situações de estoque

- **Disponível:** saldo igual ou maior que o estoque mínimo;
- **Estoque baixo:** saldo maior que zero e menor que o estoque mínimo;
- **Sem estoque:** saldo igual a zero;
- **Inativo:** produto retirado da operação, mas mantido para preservar seu histórico.

### Buscar e filtrar produtos

Na parte superior da tela é possível:

- buscar pelo nome;
- filtrar por categoria;
- filtrar pela situação do estoque;
- mostrar produtos ativos, inativos ou todos.

### Ações de um produto

Abra o menu no final da linha para:

- **Ver histórico:** consultar todas as entradas e saídas do produto;
- **Movimentar:** abrir o formulário de movimentação já com o produto selecionado;
- **Editar:** alterar nome, descrição, categoria, preço ou estoque mínimo;
- **Excluir ou inativar:** remover o produto ou retirá-lo da operação.

O saldo não pode ser alterado na edição. Toda mudança de quantidade deve ser registrada em **Movimentações**.

Se o produto nunca teve movimentações, ele pode ser excluído. Se já possui histórico, será apenas inativado.

## 5. Registrar uma entrada

Use uma entrada quando novas unidades forem recebidas.

1. Abra **Movimentações**.
2. Selecione o produto.
3. Escolha o tipo **Entrada**.
4. Informe a quantidade.
5. Confira a data e a hora.
6. Se quiser, informe o motivo ou uma referência no campo **Observação**.
7. Clique em **Registrar entrada**.

O saldo será aumentado e a operação aparecerá no histórico.

## 6. Registrar uma saída

Use uma saída quando unidades deixarem o estoque.

1. Abra **Movimentações**.
2. Selecione o produto.
3. Escolha o tipo **Saída**.
4. Informe a quantidade.
5. Confira a data e a hora.
6. Adicione uma observação, se necessário.
7. Clique em **Registrar saída**.

O sistema mostra o saldo disponível e bloqueia qualquer saída maior que esse valor.

## 7. Consultar o histórico

O histórico fica na parte inferior da tela **Movimentações**.

Cada registro informa:

- produto;
- tipo da movimentação;
- quantidade;
- observação;
- usuário responsável;
- data e hora.

É possível buscar pelo nome do produto ou pela observação e filtrar por produto ou tipo de movimentação.

O histórico também pode ser aberto pelo menu de ações de cada produto.

## 8. Alternar entre tema claro e escuro

Clique no botão com o ícone de sol ou lua no canto superior direito. A escolha é salva no navegador e será mantida nos próximos acessos.

O mesmo botão está disponível na tela de login.

## 9. Encerrar a sessão

1. Clique no seu usuário, no canto superior direito.
2. Clique em **Sair do sistema**.

O sistema encerrará a sessão e voltará para a tela de acesso.
