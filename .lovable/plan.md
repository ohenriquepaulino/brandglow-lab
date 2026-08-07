# Ajustes nos formulários do /ads

Escopo: apenas os formulários da página `/ads` (o da home fica igual).

## O que muda no formulário do /ads

- Remoção do campo "@ do Instagram" (só no /ads).
- O campo de faturamento passa a se chamar "FATURAMENTO MENSAL DA EMPRESA" e ganha a opção "Ainda não estou faturando" (primeira da lista), mantendo as faixas atuais.
- Envio continua indo para o CRM e disparando o e-mail de novo lead, com UTMs preservadas.

## Destino após o envio

- Quem escolhe qualquer faixa de faturamento continua indo para `/obrigado` (com o evento Lead do Facebook, como hoje).
- Quem escolhe "Ainda não estou faturando" vai para uma nova página `/tks`, com o mesmo texto/estilo da página de obrigado, mas **sem** disparar o evento Lead do Pixel.
- O envio para a API do Meta (Conversions API) também não acontece para esses leads, para não contar conversão de nenhum dos dois lados.

## Marcação no CRM

- Leads com faturamento "Ainda não estou faturando" aparecem no Kanban com uma tarja vermelha no card (faixa vermelha no topo/lateral do card e o selo de faturamento em vermelho), para identificação imediata.
- Como o Instagram não é mais coletado no /ads, o card do CRM e o painel de detalhes deixam de exibir o link quando o lead não tem Instagram (sem quebrar leads antigos, que continuam mostrando).

## Detalhes técnicos

- `src/components/site/ContactSection.tsx`: novas props (ex.: `hideInstagram`, `revenueLabel`, `redirectToNoRevenue`) usadas apenas pelo `/ads`; validação do Instagram só se aplica quando o campo existe; escolha do destino conforme o valor selecionado; quando não faturando, envia flag `skip_meta: true` e não chama `fbq`.
- `src/routes/api/public/leads/submit.ts`: `instagram` passa a ser opcional no schema Zod; nova flag booleana opcional para pular `sendMetaLead`; insert grava `instagram` como `null` quando ausente. Migração para tornar `leads.instagram` nullable (nenhuma alteração de dados existentes).
- Nova rota `src/routes/tks.tsx` (noindex), sem `fbq('track','Lead')`, copiando o layout de `src/routes/obrigado.tsx`.
- `src/components/crm/LeadCard.tsx` e `src/components/crm/LeadPanel.tsx`: tarja vermelha quando `faturamento` é "Ainda não estou faturando" e render condicional do Instagram.
