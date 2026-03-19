# Wakemind Studio — Roadmap

> Documento vivo. Atualizar conforme decisões forem tomadas.

**Wakemind Studio** é a ferramenta de criação e gestão do ecossistema Wakemind. Permite que desenvolvedores e criadores gerem assets de imagem e som com qualidade de jogo usando IA, gerenciem uma biblioteca de ícones de conquistas e configurem os blocos de construção do sistema de recompensas que roda dentro do app mobile Wakemind. O Studio é a interface de _criação_; o app é a interface de _execução_.

---

## Estado atual (Março 2026)

| Rota / Feature                             | Status                       |
| ------------------------------------------ | ---------------------------- |
| Dashboard (KPIs + gráfico)                 | ✅ Implementado (dados mock) |
| Geração de imagem (OpenAI)                 | ✅ Implementado              |
| Biblioteca de conquistas (41 achievements) | ✅ Implementado              |
| Settings (API key)                         | ✅ Implementado              |
| Geração de som                             | 🚧 Placeholder               |
| About                                      | ✅ Implementado              |
| Backend / Auth                             | ❌ Não iniciado              |
| Progresso de conquistas                    | ❌ Não iniciado              |
| Sistema de créditos                        | ❌ Não iniciado              |

---

## Fase 1 — Fechar o MVP

> **Objetivo:** ter todas as rotas com conteúdo real e a experiência básica funcionando do início ao fim.  
> **Horizonte estimado:** curto prazo

### 1.1 Sound Generation (`/generate/sound`)

Implementar a geração de áudio seguindo o mesmo padrão arquitetural do `generate/image.tsx`:

- Criar `src/services/openai/sound.ts` (ou ElevenLabs como provider alternativo)
- Criar `src/lib/library/sound/presets.ts` com presets de estilo (ambient, 8-bit, SFX, etc.)
- Rota com campos: nome, descrição, preset de estilo, duração, formato (mp3/wav)
- Preview no browser com `<audio>` nativo
- Download do arquivo gerado

**Decisão pendente:** OpenAI TTS, ElevenLabs, fal.ai ou outro provider?

---

## Fase 2 — Configuração & Exportação de Conquistas

> **Objetivo:** aprofundar as ferramentas de visualização e exportação de pacotes — o Studio é responsável pela _criação_ e configuração; o tracking e unlock acontecem no app mobile.  
> **Horizonte estimado:** médio prazo

### 2.1 Export de Pacote

- Exportar o pacote de conquistas em JSON padronizado
- Útil para importar no app mobile ou compartilhar configurações entre projetos
- Botão "Export Package" na aba de conquistas da biblioteca

---

## Fase 3 — Autenticação & Backend

> **Objetivo:** sair do modo localStorage-only; ter usuários, dados persistidos e API key segura.  
> **Horizonte estimado:** médio prazo

### 3.1 Autenticação

**Provider sugerido:** Supabase Auth (ou Clerk)

- Login com email/senha e OAuth (Google)
- Sessão persistida; `nav-user.tsx` já tem o slot de avatar/email pronto
- Rota `/login` e proteção de rotas autenticadas

### 3.2 Proxy de API Key

Em vez de armazenar a OpenAI key no browser do usuário:

- Backend Edge Function (Supabase ou Cloudflare Worker) que faz a chamada à OpenAI
- O cliente envia apenas o prompt + opções; o servidor injeta a key
- Remove a necessidade de cada usuário ter sua própria key
- Habilita rate limiting e consumo de créditos por conta

### 3.3 Perfis & Progresso Sincronizado

- Progresso de conquistas salvo no banco, não no browser
- Histórico de assets gerados por usuário
- Configurações sincronizadas entre dispositivos

### 3.4 Dashboard Real

Com backend:

- KPIs vindos de queries reais (assets gerados, conquistas desbloqueadas, créditos consumidos)
- Gráfico mostrando atividade real do usuário (geração por dia, streaks)
- Dados da tabela (`data.json`) substituídos por listagem de atividade real

---

## Fase 4 — Monetização & Escala

> **Objetivo:** ativar o modelo de negócio que já está desenhado no código.  
> **Horizonte estimado:** longo prazo

### 4.1 Sistema de Créditos

O dashboard já exibe "Generation Credits (450)" como KPI — implementar de fato:

- Cada geração de imagem/som consome créditos
- Créditos associados a um plano mensal
- UI de saldo no header ou sidebar
- Alerta quando créditos estão baixos

### 4.2 Premium Achievements

19 das 41 conquistas já estão marcadas como `isPremium: true`. Implementar o gate:

- Conquistas premium visíveis na biblioteca mas marcadas com badge "Pro"
- Progresso bloqueado para plano gratuito
- CTA para upgrade ao tentar desbloquear

### 4.3 Planos de Assinatura

| Plano      | Créditos/mês | Achievements     | Assets salvos |
| ---------- | ------------ | ---------------- | ------------- |
| Free       | 50           | 22 (não-premium) | 20            |
| Studio Pro | 500          | 41 (todos)       | Ilimitado     |
| Team       | Custom       | 41 + white-label | Ilimitado     |

### 4.4 Marketplace de Assets

- Usuários podem publicar assets gerados para a comunidade
- Curadoria por categoria (ícones, sons, backgrounds)
- Download gratuito de assets da comunidade (consome créditos ou não?)

### 4.5 Multi-Provider de Geração

- Abstrair o provider em `src/services/generation/` com interface comum
- Suporte a: OpenAI, Stability AI, fal.ai (imagem); OpenAI TTS, ElevenLabs (som)
- Usuário escolhe o provider nas Settings por categoria

---

## Fase 5 — Mobile & Companion App

> **Objetivo:** conectar o Studio ao app mobile que usa o sistema de conquistas.  
> **Horizonte estimado:** médio prazo (o app mobile já existe — ver repos `wakemind` e `wakemindapp`)

### 5.1 Contexto

O app mobile companion **já existe** (`github.com/WallysonGalvao/wakemind`). O Studio é a interface de **criação e gestão**; o app é a interface de **execução e unlock**. Isso eleva a prioridade do SDK de conquistas (5.3) e da sincronização (5.2) — não são nice-to-haves, são parte central do produto.

### 5.2 Sincronização Studio ↔ App

- Assets gerados no Studio ficam disponíveis no app (via CDN ou Supabase Storage)
- Conquistas desbloqueadas no app aparecem no Studio com timestamp e dados do evento
- Webhooks ou Realtime (Supabase) para atualização ao vivo

### 5.3 SDK de Conquistas

O `BASIC_ACHIEVEMENT_PACKAGE` já é uma estrutura exportável. Evoluir para:

- Pacote npm `@wakemind/achievements` consumível no app mobile
- Contrato de tipos compartilhado entre Studio e app
- Versionamento de pacotes de conquistas (v1, v2, custom)

---

## Decisões em Aberto

| Decisão                          | Opções                              | Impacto        |
| -------------------------------- | ----------------------------------- | -------------- |
| Backend provider                 | Supabase, Firebase, custom Node/Bun | Fase 3 inteira |
| Sound generation provider        | OpenAI TTS, ElevenLabs, fal.ai      | Fase 1.1       |
| ~~O app mobile já existe?~~      | ✅ Sim — `wakemind` repo confirmado | Fase 5 elevada |
| Persistência local (pré-backend) | IndexedDB vs localStorage           | Fase 1.3       |
| Modelo de créditos               | Por geração, por mês, por plano     | Fase 4.1       |

---

## Arquitetura Atual (referência)

```
src/
├── routes/                        # File-based routing (TanStack Router)
│   ├── __root.tsx                 # Layout: sidebar + header
│   ├── index.tsx                  # Dashboard ✅
│   ├── about.tsx                  # About ✅
│   ├── library.tsx                # Conquistas ✅
│   ├── settings.tsx               # API key ✅
│   └── generate/
│       ├── image.tsx              # Geração de imagem ✅
│       └── sound.tsx              # Placeholder
├── services/
│   └── openai/
│       └── image.ts               # Chamada à API (axios)
├── lib/library/
│   ├── achievements/packages/     # Pacotes de conquistas
│   └── image/styles.ts            # Config de estilo e buildPrompt
├── hooks/
│   ├── use-settings.ts            # Leitura/escrita de config (localStorage)
│   └── use-mobile.tsx
├── constants/achievements.ts      # 41 conquistas definidas
├── types/achievements.ts          # Enums e tipos
└── components/
    ├── dashboard/                 # KPIs, gráfico, tabela
    ├── layout/                    # Sidebar, header, nav-user
    └── ui/                        # 20+ componentes shadcn/ui
```

**Stack principal:** React 19 · TanStack Router · Tailwind CSS v4 · Radix UI · Recharts · axios · Zod · sonner · Vite 7

---

_Última atualização: Março 2026_
