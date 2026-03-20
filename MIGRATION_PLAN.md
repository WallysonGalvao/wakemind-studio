# Plano de Migração — WakeMind Studio → Fenrir

> Documento de referência para a transformação do WakeMind Studio no **Fenrir** — Hub multi-projeto da Three Wolves com suporte a Analytics.
>
> **Projeto Supabase:** `fenrir`

---

## Visão Geral

O WakeMind Studio será convertido no **Fenrir**, o Hub centralizado da software house Three Wolves, permitindo:

- **Múltiplos projetos** (app1, app2, etc.) dentro de uma única interface
- **Braço de Assets** — criação de imagens e sons com IA (funcionalidade atual)
- **Braço de Analytics** — métricas de Mixpanel (engajamento) e RevenueCat (receita)

---

## Estado Atual do Projeto

| Componente | Status                                       | Detalhes                                                                                                       |
| ---------- | -------------------------------------------- | -------------------------------------------------------------------------------------------------------------- |
| Database   | 3 tabelas (`profiles`, `packages`, `assets`) | RLS por `user_id`, sem conceito de projeto                                                                     |
| Auth       | Supabase Auth                                | Auto-create profile via trigger                                                                                |
| Rotas      | 8 rotas fixas                                | `/`, `/library`, `/settings`, `/generate/image`, `/generate/sound`, `/about`, `/login`, `/packages/$packageId` |
| Geração    | OpenAI (imagem)                              | Som é placeholder                                                                                              |
| Storage    | Supabase Storage (bucket `assets`)           | Signed URLs com TTL de 1h                                                                                      |
| Analytics  | Nenhum                                       | Apenas KPIs mock no dashboard                                                                                  |

---

## Fase 1 — Migração do Esquema (SQL)

### 1.1 Criar Tabela `projects`

```sql
-- 002_projects.sql

-- ── Projects ──────────────────────────────────────────────────
create table if not exists public.projects (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references auth.users on delete cascade,
  name         text not null,
  slug         text not null,

  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

alter table public.projects enable row level security;

create policy "Users can view their own projects"
  on public.projects for select
  using (auth.uid() = user_id);

create policy "Users can insert their own projects"
  on public.projects for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own projects"
  on public.projects for update
  using (auth.uid() = user_id);

create policy "Users can delete their own projects"
  on public.projects for delete
  using (auth.uid() = user_id);

-- Unicidade do slug por usuário
create unique index if not exists projects_slug_user_id_idx
  on public.projects (slug, user_id);
```

> **Nota sobre tipos de ID:** O schema atual usa `text` para PKs de `packages` e `assets`. A tabela `projects` segue a melhor prática com `uuid`. A divergência é intencional e documentada.

> **Nota sobre timestamps:** O schema atual usa `bigint` (epoch ms) em `packages`/`assets`. A tabela `projects` usa `timestamptz` (correto). Uma migração futura pode uniformizar.

### 1.2 Credenciais de Analytics (Supabase Vault)

**⚠️ NÃO armazenar tokens em plain text.** Utilizar o [Supabase Vault](https://supabase.com/docs/guides/database/vault) para criptografia:

```sql
-- 003_project_secrets.sql

-- Tabela de referência para secrets do Vault
create table if not exists public.project_integrations (
  id           uuid primary key default gen_random_uuid(),
  project_id   uuid not null references public.projects(id) on delete cascade,
  provider     text not null check (provider in ('mixpanel', 'revenuecat')),
  vault_secret_id uuid not null, -- referência ao Supabase Vault

  created_at   timestamptz not null default now(),

  unique (project_id, provider)
);

alter table public.project_integrations enable row level security;

create policy "Users can manage integrations of their projects"
  on public.project_integrations for all
  using (
    project_id in (
      select id from public.projects where user_id = auth.uid()
    )
  );
```

Fluxo para salvar um token:

1. Edge Function recebe o token via HTTPS
2. Insere no Vault: `select vault.create_secret('token_value', 'mixpanel_token_proj_xyz')`
3. Salva o `vault_secret_id` retornado na tabela `project_integrations`
4. Para ler: `select * from vault.decrypted_secrets where id = vault_secret_id`

### 1.3 Vincular Tabelas Existentes a Projetos

```sql
-- 004_add_project_id.sql

-- Adicionar coluna project_id (nullable inicialmente)
alter table public.packages
  add column if not exists project_id uuid references public.projects(id) on delete cascade;

alter table public.assets
  add column if not exists project_id uuid references public.projects(id) on delete cascade;
```

---

## Fase 2 — Migração de Dados Existentes

```sql
-- 005_migrate_existing_data.sql

-- Criar projeto padrão para cada usuário que já possui packages
insert into public.projects (user_id, name, slug)
select distinct user_id, 'Meu Primeiro Projeto', 'default'
from public.packages
on conflict do nothing;

-- Vincular packages ao projeto padrão
update public.packages p
set project_id = pr.id
from public.projects pr
where p.user_id = pr.user_id
  and pr.slug = 'default'
  and p.project_id is null;

-- Vincular assets ao projeto padrão
update public.assets a
set project_id = pr.id
from public.projects pr
where a.user_id = pr.user_id
  and pr.slug = 'default'
  and a.project_id is null;
```

---

## Fase 3 — Constraints e Segurança

### 3.1 Tornar `project_id` Obrigatório

```sql
-- 006_enforce_project_id.sql

alter table public.packages alter column project_id set not null;
alter table public.assets alter column project_id set not null;
```

### 3.2 Atualizar Políticas RLS

As políticas atuais filtram apenas por `user_id`. Precisamos garantir que um usuário não consiga vincular dados a projetos alheios:

```sql
-- 007_update_rls_policies.sql

-- ── Packages: impedir referência cruzada ──────────────────────
drop policy if exists "Users can insert their own packages" on public.packages;
create policy "Users can insert their own packages"
  on public.packages for insert
  with check (
    auth.uid() = user_id
    and project_id in (select id from public.projects where user_id = auth.uid())
  );

drop policy if exists "Users can update their own packages" on public.packages;
create policy "Users can update their own packages"
  on public.packages for update
  using (auth.uid() = user_id)
  with check (
    project_id in (select id from public.projects where user_id = auth.uid())
  );

-- ── Assets: impedir referência cruzada ────────────────────────
drop policy if exists "Users can insert their own assets" on public.assets;
create policy "Users can insert their own assets"
  on public.assets for insert
  with check (
    auth.uid() = user_id
    and project_id in (select id from public.projects where user_id = auth.uid())
  );

drop policy if exists "Users can delete their own assets" on public.assets;
create policy "Users can delete their own assets"
  on public.assets for delete
  using (auth.uid() = user_id);
```

---

## Fase 4 — Atualização do Frontend

### 4.1 Regenerar Tipos TypeScript

```bash
npx supabase gen types typescript --project-id fenrir > src/types/supabase.ts
```

### 4.2 Novo Tipo `Project`

```typescript
// src/types/project.ts
export interface Project {
  id: string;
  user_id: string;
  name: string;
  slug: string;
  created_at: string;
  updated_at: string;
}

export interface ProjectIntegration {
  id: string;
  project_id: string;
  provider: "mixpanel" | "revenuecat";
  vault_secret_id: string;
  created_at: string;
}
```

### 4.3 Serviço de Projects

```
src/services/supabase/projects.ts
  - createProject(name, slug)
  - getAllProjects()
  - getProjectBySlug(slug)
  - updateProject(id, data)
  - deleteProject(id)
```

### 4.4 Atualizar Serviços Existentes

Todos os serviços que fazem queries precisam receber e filtrar por `projectId`:

| Serviço                               | Funções Afetadas                                                       |
| ------------------------------------- | ---------------------------------------------------------------------- |
| `services/supabase/packages.ts`       | `savePackage()`, `getAllCustomPackages()`                              |
| `services/supabase/assets.ts`         | `saveAsset()`, `getAllAssets()`, `computeStats()`, `computeActivity()` |
| `services/supabase/generate-image.ts` | Payload precisa incluir `project_id`                                   |

### 4.5 Contexto de Projeto

```
src/hooks/use-project.ts
  - ProjectContext + ProjectProvider
  - currentProject (do URL param)
  - switchProject(slug)
```

### 4.6 Reestruturação de Rotas

**De:**

```
src/routes/
├── index.tsx          → Dashboard global
├── library.tsx        → Biblioteca
├── settings.tsx       → Configurações
└── generate/
    ├── image.tsx
    └── sound.tsx
```

**Para:**

```
src/routes/
├── index.tsx                    → Hub Overview (todos os projetos)
├── $projectSlug/
│   ├── _layout.tsx              → ProjectProvider + validação
│   ├── index.tsx                → Dashboard do projeto
│   ├── library.tsx              → Biblioteca do projeto
│   ├── settings.tsx             → Config do projeto (integrações)
│   ├── analytics.tsx            → Métricas (Mixpanel + RevenueCat)
│   ├── generate/
│   │   ├── image.tsx
│   │   └── sound.tsx
│   └── packages/
│       └── $packageId.tsx
```

### 4.7 Sidebar — Project Switcher

Adicionar um seletor de projetos no topo do `AppSidebar`:

- Dropdown com lista de projetos do usuário
- Opção "Criar novo projeto"
- Ao trocar, navega para `/:projectSlug`

---

## Fase 5 — Braço de Analytics

### 5.1 Arquitetura

As APIs do Mixpanel e RevenueCat **não suportam CORS** para requisições do browser. Todas as chamadas devem passar por **Supabase Edge Functions** como proxy.

```
Browser → Edge Function → Mixpanel/RevenueCat API
                ↓
         Vault (decrypt token)
```

### 5.2 Edge Functions

```
supabase/functions/
├── analytics-mixpanel/index.ts    → Proxy para Mixpanel Data Export API
└── analytics-revenuecat/index.ts  → Proxy para RevenueCat REST API v2
```

### 5.3 Mixpanel — Métricas Alvo

| Métrica                    | Endpoint              | Descrição                   |
| -------------------------- | --------------------- | --------------------------- |
| Active Users (DAU/WAU/MAU) | `/api/2.0/engage`     | Usuários ativos por período |
| Top Events                 | `/api/2.0/events/top` | Eventos mais disparados     |
| Retention                  | `/api/2.0/retention`  | Retenção por cohort         |
| Funnel                     | `/api/2.0/funnels`    | Conversão em fluxos chave   |

### 5.4 RevenueCat — Métricas Alvo

| Métrica              | Endpoint                             | Descrição                 |
| -------------------- | ------------------------------------ | ------------------------- |
| MRR                  | `/v2/projects/{id}/metrics/overview` | Receita recorrente mensal |
| Active Subscriptions | `/v2/projects/{id}/metrics/overview` | Assinantes ativos         |
| Churn Rate           | `/v2/projects/{id}/metrics/overview` | Taxa de cancelamento      |
| Revenue by Product   | `/v2/projects/{id}/metrics/overview` | Receita por produto       |

### 5.5 Serviços Frontend

```
src/services/analytics/
├── mixpanel.ts       → fetchActiveUsers(), fetchTopEvents(), fetchRetention()
└── revenuecat.ts     → fetchOverview(), fetchMRR(), fetchChurnRate()
```

### 5.6 Componentes de Dashboard

```
src/components/analytics/
├── metric-card.tsx           → Card de métrica individual (KPI)
├── active-users-chart.tsx    → Gráfico DAU/WAU/MAU (recharts)
├── revenue-chart.tsx         → Gráfico MRR + Churn (recharts)
├── top-events-table.tsx      → Tabela de eventos mais populares
└── retention-heatmap.tsx     → Heatmap de retenção por cohort
```

---

## Ordem de Execução

```
M1  Criar migration 002 (tabela projects + RLS)
 │
M2  Criar migration 003 (project_integrations + Vault)
 │
M3  Criar migration 004 (add project_id nullable)
 │
M4  Criar migration 005 (migrar dados existentes)
 │
M5  Criar migration 006 (project_id NOT NULL)
 │
M6  Criar migration 007 (atualizar RLS)
 │
M7  Regenerar tipos TypeScript
 │
M8  Criar serviço + hook de Projects
 │
M9  Atualizar serviços existentes (packages, assets)
 │
M10 Reestruturar rotas com $projectSlug
 │
M11 Implementar Project Switcher no sidebar
 │
M12 Implementar Hub Overview (rota /)
 │
M13 Criar Edge Functions de proxy (Mixpanel + RevenueCat)
 │
M14 Criar serviços de analytics no frontend
 │
M15 Implementar dashboard de Analytics
```

---

## Riscos e Mitigações

| Risco                                         | Impacto   | Probabilidade | Mitigação                                                     |
| --------------------------------------------- | --------- | ------------- | ------------------------------------------------------------- |
| API keys vazam se armazenadas em plain text   | **Alto**  | Média         | Usar Supabase Vault desde o dia 1                             |
| CORS bloqueia chamadas ao Mixpanel/RevenueCat | **Alto**  | Alta          | Edge Functions como proxy obrigatório                         |
| Migração corrompe dados existentes            | **Alto**  | Baixa         | Backup + testar em staging antes                              |
| Reestruturação de rotas quebra deep links     | **Médio** | Alta          | Criar redirects das rotas antigas                             |
| Limites de rate da API do Mixpanel/RevenueCat | **Médio** | Média         | Cache com TTL (5-15 min) via Edge Function                    |
| Complexidade do refactor para multi-projeto   | **Médio** | Alta          | Implementar incrementalmente, projeto "default" como fallback |

---

## Decisões Técnicas Pendentes

| Decisão                         | Opções                                        | Recomendação                                          |
| ------------------------------- | --------------------------------------------- | ----------------------------------------------------- |
| Identificador de projeto na URL | `$projectId` (uuid) vs `$projectSlug` (texto) | `$projectSlug` — mais legível, já tem unique index    |
| Cache de métricas analytics     | Edge Function cache vs Supabase table         | Edge Function com cache header (simples)              |
| Mixpanel API                    | Data Export API vs Insights API               | Insights API (mais moderna, suporta JQL)              |
| RevenueCat API                  | v1 vs v2                                      | v2 (endpoints de metrics consolidados)                |
| Storage multi-tenant            | Bucket único vs bucket por projeto            | Bucket único, path: `userId/projectId/assetId.format` |

---

## Referências

- [Supabase Vault](https://supabase.com/docs/guides/database/vault)
- [Mixpanel Data Export API](https://developer.mixpanel.com/reference/overview)
- [RevenueCat REST API v2](https://www.revenuecat.com/docs/api-v2)
- [TanStack Router — Route Params](https://tanstack.com/router/latest/docs/framework/react/guide/route-params)
