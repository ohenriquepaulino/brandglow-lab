# Campo "Profissão" com autocomplete em /ads

## Objetivo
Adicionar um campo obrigatório de área de atuação nos dois formulários da página /ads, com sugestões enquanto o usuário digita (campo aberto, aceita qualquer texto), e mostrar essa informação no CRM.

## Como o autocomplete vai funcionar
- Campo de texto normal com rótulo "Qual é a sua principal área de atuação?".
- Ao digitar 2+ caracteres, aparece uma lista curta (até 6) de sugestões filtradas de uma lista fixa de profissões/nichos comuns, sem chamadas externas.
- O usuário pode clicar/selecionar com teclado (setas + Enter, Esc fecha) ou simplesmente ignorar as sugestões e escrever o que quiser.
- Obrigatório: mínimo 2 caracteres, com o mesmo feedback visual de erro dos outros campos (borda laranja + mensagem).
- Aparece somente em /ads; o formulário da home permanece exatamente como está.

Lista inicial de sugestões (editável depois): Advocacia, Arquitetura, Estética e beleza, Odontologia, Medicina, Nutrição, Psicologia, Fisioterapia, Personal trainer, Contabilidade, Consultoria, Marketing, Infoprodutos, Moda, Alimentação e restaurantes, Imobiliário, Construção civil, Educação, Tecnologia, E-commerce, Turismo, Pet, Eventos, Outro.

## O que muda

Formulário (`src/components/site/ContactSection.tsx`)
- Nova prop opcional `showProfession` (ativada só na /ads via `FormSlot` em `src/routes/ads.tsx`, que já alimenta os dois formulários da página).
- Novo subcomponente de campo com sugestões (combobox acessível: `role="combobox"`, `aria-expanded`, `aria-activedescendant`), estilizado com as classes `input-light` existentes.
- O valor entra na validação do formulário e é enviado como `profissao` no POST.

Backend (`src/routes/api/public/leads/submit.ts`)
- Aceita `profissao` opcional (texto, até 80 caracteres, validado com zod) e grava no lead.
- Inclui a profissão no e-mail de notificação de novo lead (`src/lib/email-templates/new-lead.tsx`).

Banco
- Nova coluna `profissao` (texto, opcional) na tabela de leads, via migração. Nada mais é alterado — nenhuma política, coluna ou configuração existente é mexida.

CRM (sem mudar configurações)
- `LeadPanel`: nova linha "Área de atuação" quando houver valor.
- `LeadCard`: exibe a profissão como texto discreto abaixo do nome, apenas quando existir.
- Tipo `Lead` em `src/lib/crm-auth.ts` recebe `profissao: string | null`.

## Ordem de execução
1. Migração para adicionar a coluna.
2. Ajustes no formulário, na rota de envio, no template de e-mail e no CRM.
