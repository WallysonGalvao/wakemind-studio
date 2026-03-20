# Fenrir — Roadmap

> Documento vivo. Atualizar conforme decisões forem tomadas.

**Fenrir** é o Hub multi-projeto da Three Wolves. Reúne criação de assets (imagem e som com IA) e analytics de produto (Mixpanel + RevenueCat) em um workspace unificado por projeto.

---

## Estado atual

| Feature                                    | Status          |
| ------------------------------------------ | --------------- |
| Hub overview (lista de projetos)           | ✅ Implementado |
| Projeto: Dashboard (KPIs + gráfico)        | ✅ Implementado |
| Projeto: Geração de imagem (OpenAI)        | ✅ Implementado |
| Projeto: Geração de som (OpenAI TTS)       | ✅ Implementado |
| Projeto: Biblioteca de conquistas          | ✅ Implementado |
| Projeto: Analytics (Mixpanel + RevenueCat) | ✅ Implementado |
| Projeto: Settings / Integrações (Vault)    | ✅ Implementado |
| Auth (Supabase)                            | ✅ Implementado |
| Storage (Supabase)                         | ✅ Implementado |
| Edge Functions (5 deployed)                | ✅ Implementado |
| React Query (server state)                 | ✅ Implementado |
| React Compiler                             | ✅ Habilitado   |
| Retenção cohort (heatmap)                  | ✅ Implementado |
| Sistema de créditos                        | ❌ Não iniciado |
| Progresso de conquistas                    | ❌ Não iniciado |

---

## Fase 1 — ✅ MVP (Concluído)

> Todas as rotas com conteúdo real e a experiência básica funcionando do início ao fim.

### 1.1 Sound Generation (`/$projectSlug/generate/sound`) ✅

Implementado com OpenAI TTS (gpt-4o-mini-tts / tts-1 / tts-1-hd):

- Edge Function `generate-sound` chamando `/v1/audio/speech`
- 7 presets de voz (Narrator, Friendly NPC, Mysterious NPC, Announcer, 8-bit Character, Villain, Custom)
- 9 vozes OpenAI (alloy, ash, coral, echo, fable, onyx, nova, sage, shimmer)
- Controle de velocidade (0.25x – 4.0x), instruções de tom (gpt-4o-mini-tts)
- Formatos: MP3, Opus, AAC, FLAC, WAV
- Preview com `<audio>` nativo + download
- Assets salvos em Supabase Storage + DB

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

| Decisão                       | Opções                              | Impacto        |
| ----------------------------- | ----------------------------------- | -------------- |
| ~~Backend provider~~          | ✅ Supabase (implementado)          | —              |
| ~~Sound generation provider~~ | ✅ OpenAI TTS (implementado)        | —              |
| ~~O app mobile já existe?~~   | ✅ Sim — `wakemind` repo confirmado | Fase 5 elevada |
| Modelo de créditos            | Por geração, por mês, por plano     | Fase 4.1       |

---

## Arquitetura Atual (referência)

```
src/
├── routes/                        # File-based routing (TanStack Router)
│   ├── __root.tsx                 # Layout: sidebar + header
│   ├── index.tsx                  # Hub overview (projetos) ✅
│   └── $projectSlug/
│       ├── dashboard.tsx          # KPIs, charts, data table ✅
│       ├── analytics.tsx          # Mixpanel + RevenueCat ✅
│       ├── library.tsx            # Conquistas ✅
│       ├── settings.tsx           # Integrações (Vault) ✅
│       └── generate/
│           ├── image.tsx          # Geração de imagem ✅
│           └── sound.tsx          # Geração de som ✅
├── services/
│   ├── supabase/                  # DB, storage, edge functions
│   └── analytics/                 # Mixpanel + RevenueCat proxies
├── hooks/
│   ├── use-generation.ts          # Image generation hook
│   ├── use-sound-generation.ts    # Sound generation hook
│   ├── use-auth.tsx               # Auth hook
│   └── use-settings.ts            # Config
├── lib/library/
│   ├── achievements/packages/     # Pacotes de conquistas
│   ├── image/styles.ts            # Config de estilo e buildPrompt
│   └── sound/presets.ts           # Voice presets (7 presets)
├── configs/
│   └── react-query.ts             # QueryClient centralizado
├── constants/                     # achievements, brand, packages
├── types/                         # TypeScript interfaces
└── components/
    ├── analytics/                 # metric-card, charts, heatmap
    ├── dashboard/                 # KPIs, gráfico, tabela
    ├── generation/                # generate-button, options, preview, style-editor
    ├── layout/                    # Sidebar, header, nav-user
    └── ui/                        # 25+ componentes shadcn/ui
```

**Stack:** React 19 · React Compiler · TanStack Router · @tanstack/react-query · Tailwind CSS v4 · Radix UI · Recharts · Supabase · Zod · sonner · Vite

---

_Última atualização: Julho 2025_
