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
| Repositórios por projeto                   | ✅ Implementado |
| Breadcrumb dinâmico (slug-aware)           | ✅ Implementado |
| About page reescrita                       | ✅ Implementado |
| Sidebar collapsed mode                     | ✅ Implementado |

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

## Fase 2 — ✅ Refinamento (Concluído)

> Limpeza de placeholders, UX refinements e configuração por projeto.

### 2.1 Limpeza da UI ✅

- Removidos itens placeholder do nav-user (Billing, Notifications, Account)
- Language toggle com bandeiras (🇧🇷 / 🇺🇸)
- Sidebar footer com comportamento correto em modo collapsed
- About page reescrita com features reais do produto

### 2.2 Repositórios por Projeto ✅

- Migration `004_project_repositories.sql` — coluna `repositories jsonb` na tabela `projects`
- Tipo `ProjectRepository` (`{ label, url }`) em `types/project.ts`
- Service `updateProjectRepositories()` em `services/supabase/projects.ts`
- Header mostra dropdown de repos quando o projeto tem repositórios configurados
- Settings com card para gerenciar repositórios do projeto

### 2.3 Breadcrumb Dinâmico ✅

- Breadcrumb agora strip o `$projectSlug` do pathname antes de buscar labels
- Labels corretos para `/dashboard`, `/analytics` e demais rotas dentro de projeto
- Rota `/` mostra "Projects" em vez de "Dashboard"

---

## Fase 3 — Polimento & DX

> **Objetivo:** remover código morto, sincronizar tipos e garantir qualidade de build.

### 3.1 Knip — Dead Code Cleanup

- Rodar `npx knip` e remover exports/arquivos não utilizados
- Garantir que `knip.json` ignora apenas o necessário

### 3.2 Supabase Types Sync

- Aplicar migration `004_project_repositories.sql` com `npx supabase db push`
- Regenerar tipos com `npx supabase gen types typescript --local > src/types/supabase.ts`
- Remover casts `as unknown as` temporários em `services/supabase/projects.ts`

### 3.3 Testes & CI

- Adicionar Vitest com cobertura básica para hooks e services
- Lint + type-check no CI

---

## Fase 4 — Mobile & Companion App

> **Objetivo:** conectar o Studio ao app mobile que usa o sistema de conquistas.  
> **Horizonte estimado:** médio prazo (o app mobile já existe — ver repos `wakemind` e `wakemindapp`)

### 4.1 Contexto

O app mobile companion **já existe** (`github.com/WallysonGalvao/wakemind`). O Studio é a interface de **criação e gestão**; o app é a interface de **execução e unlock**. Isso eleva a prioridade do SDK de conquistas (4.3) e da sincronização (4.2) — não são nice-to-haves, são parte central do produto.

### 4.2 Sincronização Studio ↔ App

- Assets gerados no Studio ficam disponíveis no app (via CDN ou Supabase Storage)
- Conquistas desbloqueadas no app aparecem no Studio com timestamp e dados do evento
- Webhooks ou Realtime (Supabase) para atualização ao vivo

### 4.3 SDK de Conquistas

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
| ~~O app mobile já existe?~~   | ✅ Sim — `wakemind` repo confirmado | Fase 4 elevada |
| ~~Monetização~~               | ✅ Descartada — projeto interno     | —              |

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
