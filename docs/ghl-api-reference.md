# GHL API — Referência de Conversas e Mensagens

Documentação dos campos disponíveis nos endpoints de conversas do Go High Level (GHL).
Base URL: `https://services.leadconnectorhq.com`
Versão da API: `2021-04-15`

---

## Endpoints

| Método | Endpoint | Descrição |
|---|---|---|
| GET | `/conversations/search` | Busca conversas com filtros e paginação |
| GET | `/conversations/{id}` | Retorna uma conversa específica |
| GET | `/conversations/{id}/messages` | Retorna as mensagens de uma conversa |

---

## GET /conversations/search

### Parâmetros de query

| Parâmetro | Tipo | Obrigatório | Descrição |
|---|---|---|---|
| `locationId` | string | ✅ | ID da subconta |
| `limit` | number | ❌ | Máximo de resultados (padrão: 20) |
| `sort` | string | ❌ | `asc` ou `desc` |
| `sortBy` | string | ❌ | Campo de ordenação (ex: `last_message_date`) |
| `startAfterDate` | timestamp (ms) | ❌ | Cursor de paginação — timestamp em milissegundos do último item |
| `lastId` | string | ❌ | ID do último item para desempate na paginação |
| `contactId` | string | ❌ | Filtrar por contato |
| `assignedTo` | string | ❌ | Filtrar por agente responsável (use `unassigned` para não atribuídos) |
| `status` | string | ❌ | `all`, `read`, `unread`, `starred` |
| `query` | string | ❌ | Busca textual |
| `lastMessageType` | string | ❌ | Tipo da última mensagem |
| `lastMessageDirection` | string | ❌ | Direção da última mensagem |

### Campos retornados por conversa

| Campo | Tipo | Descrição |
|---|---|---|
| `id` | string | ID único da conversa |
| `contactId` | string | ID do contato |
| `locationId` | string | ID da subconta |
| `fullName` | string | Nome completo do contato |
| `contactName` | string | Nome alternativo do contato |
| `email` | string | E-mail do contato |
| `phone` | string | Telefone do contato |
| `type` | string | Canal principal da conversa (ver tabela de canais) |
| `lastMessageBody` | string | Texto da última mensagem |
| `lastMessageType` | string | Tipo da última mensagem |
| `lastMessageDate` | number | Timestamp (ms) da última mensagem |
| `unreadCount` | number | Quantidade de mensagens não lidas |
| `assignedTo` | string | ID do agente responsável |
| `starred` | boolean | Se a conversa está marcada como favorita |
| `deleted` | boolean | Se está na lixeira |
| `inbox` | boolean | Se está na inbox principal |

---

## GET /conversations/{conversationId}

Retorna os mesmos campos acima com alguns adicionais:

| Campo | Tipo | Descrição |
|---|---|---|
| `userId` | string | ID do usuário |
| `inbox` | object | Objeto com detalhes do inbox (pode conter `status`) |

---

## GET /conversations/{conversationId}/messages

### Parâmetros de query

| Parâmetro | Tipo | Obrigatório | Descrição |
|---|---|---|---|
| `limit` | number | ❌ | Mensagens por página (padrão: 20, máx: 100) |
| `lastMessageId` | string | ❌ | ID da última mensagem para paginação |
| `type` | string | ❌ | Filtrar por tipo de mensagem (separado por vírgula) |

### Campos retornados por mensagem

| Campo | Tipo | Descrição |
|---|---|---|
| `id` | string | ID único da mensagem |
| `conversationId` | string | ID da conversa |
| `contactId` | string | ID do contato |
| `locationId` | string | ID da subconta |
| `direction` | string | `inbound` (cliente) ou `outbound` (equipe/bot) |
| `messageType` | string | Tipo da mensagem (ver tabela de canais) |
| `body` | string | Conteúdo de texto da mensagem |
| `dateAdded` | string | Timestamp ISO de envio |
| `userId` | string | ID do humano que enviou — **nulo se foi bot ou automação** |
| `status` | string | Status de entrega (ver tabela abaixo) |
| `attachments` | string[] | URLs de arquivos anexados |
| `source` | string | Origem da mensagem (ver tabela abaixo) |
| `contentType` | string | MIME type (ex: `text/plain`) |
| `altId` | string | Identificador alternativo |
| `conversationProviderId` | string | ID do provedor da conversa |
| `meta` | object | Metadados extras (detalhes abaixo) |

### Objeto `meta` (presente em ligações e e-mails)

| Campo | Tipo | Descrição |
|---|---|---|
| `callDuration` | string | Duração da ligação em segundos |
| `callStatus` | string | Status da ligação (ver tabela abaixo) |
| `email.messageIds` | string[] | IDs das mensagens do thread de e-mail |

---

## Tabela de canais (`type` / `messageType`)

| Canal | Valor |
|---|---|
| WhatsApp | `TYPE_WHATSAPP` |
| SMS | `TYPE_SMS` |
| E-mail | `TYPE_EMAIL` |
| Facebook Messenger | `TYPE_FACEBOOK` |
| Instagram DM | `TYPE_INSTAGRAM` |
| Google Meu Negócio | `TYPE_GMB` |
| Chat do site | `TYPE_WEBCHAT` |
| Chat ao vivo | `TYPE_LIVE_CHAT` |
| Ligação | `TYPE_CALL` |
| Ligação IVR | `TYPE_IVR_CALL` |
| Ligação customizada | `TYPE_CUSTOM_CALL` |
| Review | `TYPE_REVIEW` |
| SMS customizado | `TYPE_CUSTOM_SMS` |
| E-mail customizado | `TYPE_CUSTOM_EMAIL` |
| SMS via provedor | `TYPE_CUSTOM_PROVIDER_SMS` |
| E-mail via provedor | `TYPE_CUSTOM_PROVIDER_EMAIL` |
| SMS de campanha | `TYPE_CAMPAIGN_SMS` |
| E-mail de campanha | `TYPE_CAMPAIGN_EMAIL` |
| Ligação de campanha | `TYPE_CAMPAIGN_CALL` |
| Voicemail de campanha | `TYPE_CAMPAIGN_VOICEMAIL` |
| Facebook de campanha | `TYPE_CAMPAIGN_FACEBOOK` |
| GMB de campanha | `TYPE_CAMPAIGN_GMB` |
| SMS manual de campanha | `TYPE_CAMPAIGN_MANUAL_SMS` |
| Ligação manual de campanha | `TYPE_CAMPAIGN_MANUAL_CALL` |
| Solicitação de review por SMS | `TYPE_SMS_REVIEW_REQUEST` |
| No-show por SMS | `TYPE_SMS_NO_SHOW_REQUEST` |
| Comentário no Facebook | `TYPE_FACEBOOK_COMMENT` |
| Comentário no Instagram | `TYPE_INSTAGRAM_COMMENT` |
| Comentário interno | `TYPE_INTERNAL_COMMENT` |
| Atividade — contato | `TYPE_ACTIVITY_CONTACT` |
| Atividade — fatura | `TYPE_ACTIVITY_INVOICE` |
| Atividade — pagamento | `TYPE_ACTIVITY_PAYMENT` |
| Atividade — oportunidade | `TYPE_ACTIVITY_OPPORTUNITY` |
| Atividade — agendamento | `TYPE_ACTIVITY_APPOINTMENT` |
| Atividade — ação de funcionário | `TYPE_ACTIVITY_EMPLOYEE_ACTION_LOG` |
| Info do chat ao vivo | `TYPE_LIVE_CHAT_INFO_MESSAGE` |

---

## Status de entrega de mensagem (`status`)

| Valor | Descrição |
|---|---|
| `pending` | Aguardando envio |
| `sent` | Enviada |
| `delivered` | Entregue ao destinatário |
| `read` | Lida |
| `opened` | Aberta (e-mail) |
| `clicked` | Link clicado (e-mail) |
| `failed` | Falha no envio |
| `undelivered` | Não entregue |
| `scheduled` | Agendada |
| `connected` | Conectada (ligação) |
| `opt_out` | Contato optou por sair |

---

## Status de ligação (`meta.callStatus`)

| Valor | Descrição |
|---|---|
| `pending` | Aguardando |
| `completed` | Concluída |
| `answered` | Atendida |
| `busy` | Ocupado |
| `no-answer` | Não atendida |
| `failed` | Falhou |
| `canceled` | Cancelada |
| `voicemail` | Caiu no voicemail |

---

## Origem da mensagem (`source`)

| Valor | Descrição |
|---|---|
| `app` | Enviada manualmente pelo app/CRM |
| `api` | Enviada via API |
| `workflow` | Disparada por um workflow de automação |
| `campaign` | Disparada por uma campanha |
| `bulk_actions` | Enviada em massa |

---

## O que está salvo no banco hoje vs disponível na API

| Campo | Na API | No banco | Dashboard |
|---|---|---|---|
| Canal (`type`) | ✅ | ✅ | ✅ |
| Tags do contato | ✅ | ✅ | ✅ |
| Direção da mensagem | ✅ | ✅ | ✅ |
| `userId` (humano vs bot) | ✅ | ✅ | ✅ tempo resp. humana |
| Agente responsável (`assignedTo`) | ✅ | ❌ | ❌ |
| Status da mensagem | ✅ | ❌ | ❌ |
| Origem da mensagem (`source`) | ✅ | ❌ | ❌ |
| Duração de ligação | ✅ | ❌ | ❌ |
| Conversa favoritada (`starred`) | ✅ | ❌ | ❌ |
| Preview última mensagem | ✅ | ❌ | ❌ |

---

*Gerado em 01/04/2026 — API Version 2021-04-15*
