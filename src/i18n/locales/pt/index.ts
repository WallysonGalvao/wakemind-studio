const pt = {
  // ── Brand ───────────────────────────────────────────────────────────────
  brand: {
    studio: "Three Wolves",
    product: "Fenrir",
    tagline: "Hub Multi-projeto para Criação de Assets & Analytics",
  },

  // ── Common ───────────────────────────────────────────────────────────────
  common: {
    save: "Salvar",
    cancel: "Cancelar",
    create: "Criar",
    delete: "Excluir",
    update: "Atualizar",
    connect: "Conectar",
    loading: "Carregando…",
    connected: "Conectado",
    open: "Abrir",
    close: "Fechar",
    search: "Buscar",
    or: "ou",
    back: "Voltar",
    download: "Download",
    export: "Exportar",
    settings: "Configurações",
    preview: "Visualização",
    noData: "Sem dados disponíveis",
    comingSoon: "Em breve",
  },

  // ── Navigation ───────────────────────────────────────────────────────────
  nav: {
    dashboard: "Dashboard",
    generateImage: "Gerar Imagem",
    generateSound: "Gerar Som",
    library: "Biblioteca",
    analytics: "Analytics",
    settings: "Configurações",
    projects: "Projetos",
    getHelp: "Ajuda",
    newProject: "Novo projeto…",
    fenrir: "Fenrir by Three Wolves",
    github: "GitHub",
    mobile: "Mobile",
    lp: "LP",
    studio: "Studio",
    about: "Sobre",
    package: "Pacote",
  },

  // ── User menu ────────────────────────────────────────────────────────────
  userMenu: {
    account: "Conta",
    billing: "Faturamento",
    notifications: "Notificações",
    logOut: "Sair",
    language: "Idioma",
  },

  // ── Auth ──────────────────────────────────────────────────────────────────
  auth: {
    appName: "Fenrir by Three Wolves",
    signIn: "Entrar",
    signUp: "Criar conta",
    signingIn: "Entrando…",
    signingUp: "Criando conta…",
    signInSubtitle: "Entre na sua conta",
    signUpSubtitle: "Crie sua conta",
    email: "Email",
    emailPlaceholder: "voce@exemplo.com",
    emailInvalid: "Informe um email válido",
    password: "Senha",
    passwordPlaceholder: "••••••••",
    passwordMinLength: "A senha deve ter pelo menos 8 caracteres",
    continueWithGoogle: "Continuar com Google",
    alreadyHaveAccount: "Já tem uma conta?",
    dontHaveAccount: "Não tem uma conta?",
    checkEmail: "Confira seu email para confirmar a conta e depois entre.",
  },

  // ── Pages ─────────────────────────────────────────────────────────────────
  pages: {
    // Projects (index)
    projects: {
      title: "Projetos",
      subtitle: "Gerencie seus apps e projetos.",
      newProject: "Novo Projeto",
      emptyTitle: "Nenhum projeto ainda",
      emptyDescription: "Crie seu primeiro projeto para começar.",
      createProject: "Criar Projeto",
      created: "Criado",
      deleteBtn: "Excluir",
      settingsBtn: "Configurações",
      createDialog: {
        title: "Criar Novo Projeto",
        description:
          "Projetos permitem organizar assets e analytics para cada um dos seus apps.",
        nameLabel: "Nome *",
        namePlaceholder: "ex. WakeMind, Meu App",
        slugLabel: "Slug *",
        slugPlaceholder: "ex. wakemind",
        slugHelper: "Usado na URL: /{{slug}}/dashboard",
        creating: "Criando…",
        createBtn: "Criar Projeto",
      },
    },

    // Dashboard
    dashboard: {
      subtitle: "Visão geral do dashboard para este projeto.",
      stats: {
        totalAssets: "Total de Assets",
        totalAssetsDesc: "Todos os assets gerados",
        imagesGenerated: "Imagens Geradas",
        imagesGeneratedDesc: "Assets de imagem",
        imagesGeneratedFooter: "Criados via geração de imagem",
        soundsGenerated: "Sons Gerados",
        soundsGeneratedDesc: "Assets de áudio",
        soundsGeneratedFooter: "Criados via geração de som",
        storageUsed: "Armazenamento Usado",
        storageUsedDesc: "Armazenamento local",
        storageUsedFooter: "Armazenado no IndexedDB do navegador",
        combined: "Imagens + sons combinados",
      },
      chart: {
        title: "Atividade de Geração",
        descriptionDesktop: "Assets gerados ao longo do tempo",
        descriptionMobile: "Atividade",
        last3Months: "Últimos 3 meses",
        last30Days: "Últimos 30 dias",
        last7Days: "Últimos 7 dias",
        images: "Imagens",
        sounds: "Sons",
      },
      table: {
        name: "Nome",
        type: "Tipo",
        model: "Modelo",
        created: "Criado",
        image: "Imagem",
        sound: "Som",
        customizeColumns: "Personalizar Colunas",
        columns: "Colunas",
        openMenu: "Abrir menu",
        dragToReorder: "Arrastar para reordenar",
        selectAll: "Selecionar tudo",
        selectRow: "Selecionar linha",
        empty: "Nenhum asset ainda. Gere uma imagem ou som para começar.",
        assetCount: "{{count}} asset(s)",
        selectedRows: "{{selected}} de {{total}} linha(s) selecionada(s).",
        rowsPerPage: "Linhas por página",
        pageOf: "Página {{current}} de {{total}}",
        firstPage: "Ir para primeira página",
        previousPage: "Ir para página anterior",
        nextPage: "Ir para próxima página",
        lastPage: "Ir para última página",
      },
    },

    // Analytics
    analytics: {
      title: "Analytics",
      metricsFor: "Métricas de",
      integrations: "Integrações",
      configureIntegrations: "Configurar Integrações",
      emptyTitle: "Nenhuma integração conectada",
      emptyDescription:
        "Conecte Mixpanel, RevenueCat, App Store Connect ou Google Play nas configurações do projeto para ver dados de analytics em tempo real.",
      kpis: {
        dau: "Usuários Ativos Diários",
        mrr: "MRR",
        churnRate: "Taxa de Churn",
        activeSubscriptions: "Assinaturas Ativas",
        connectMixpanel: "Conectar Mixpanel",
        fromMixpanel: "Do Mixpanel",
        connectRevenuecat: "Conectar RevenueCat",
        fromRevenuecat: "Do RevenueCat",
      },
      stores: {
        title: "App Stores",
        description: "Avaliações e reviews da App Store e Google Play.",
        iosRating: "Avaliação iOS",
        androidRating: "Avaliação Android",
        iosReviews: "Reviews iOS",
        androidReviews: "Reviews Android",
        connectAppStore: "Conectar App Store",
        connectGooglePlay: "Conectar Google Play",
        ratings: "{{count}} avaliações",
        recentReviews: "Reviews recentes",
      },
    },

    // Library
    library: {
      title: "Biblioteca",
      subtitle: "Navegue por pacotes de ícones de conquistas e assets gerados.",
      searchPlaceholder: "Buscar pacotes…",
      sortOptions: {
        lastEdited: "Última edição",
        name: "Nome",
        assetCount: "Qtd. de assets",
      },
      createPackage: "Criar novo pacote",
      custom: "Custom",
      emptyAssets: "Nenhum asset gerado ainda.",
      emptyAssetsHint: "Selecione uma conquista e clique em Gerar.",
      editedJustNow: "Editado agora",
      editedMinutes: "Editado há {{count}}m",
      editedHours: "Editado há {{count}}h",
      editedDays: "Editado há {{count}}d",
      contextMenu: {
        open: "Abrir",
        exportJson: "Exportar JSON",
        deletePackage: "Excluir pacote",
      },
    },

    // Settings
    settings: {
      title: "Configurações",
      subtitle: "Gerencie preferências de",
      account: {
        title: "Conta",
        description:
          "Conectado como {{email}}. A geração de assets é alimentada pela OpenAI via Three Wolves.",
      },
      appStores: {
        title: "App Stores",
        description:
          "Conecte suas contas das lojas de apps para ver avaliações e reviews.",
      },
      providers: {
        mixpanel: {
          title: "Mixpanel",
          description: "Conecte seu projeto Mixpanel para ver métricas de engajamento.",
          helpAction: "Encontre os dois valores em",
          helpLink: "Configurações do Projeto Mixpanel",
          fields: {
            projectId: "Project ID",
            projectIdPlaceholder: "ex. 3978835",
            apiSecret: "API Secret",
            apiSecretPlaceholder: "Cole seu API Secret",
          },
        },
        revenuecat: {
          title: "RevenueCat",
          description:
            "Conecte o RevenueCat para rastrear métricas de receita (MRR, assinaturas ativas, taxa de churn).",
          helpAction: "Encontre suas credenciais em",
          helpLink: "Dashboard do RevenueCat",
          fields: {
            projectId: "Project ID",
            projectIdPlaceholder: "ex. proj1ab2c3d4",
            apiKey: "v2 Secret API Key",
            apiKeyPlaceholder: "Cole sua v2 Secret API key",
          },
        },
        appstore: {
          title: "App Store Connect",
          description:
            "Conecte o App Store Connect para ver avaliações e reviews do iOS.",
          helpAction: "Crie uma API key em",
          helpLink: "Usuários e Acesso → Integrações",
          fields: {
            bundleId: "Bundle ID",
            bundleIdPlaceholder: "ex. com.wgsoftwares.wakemind",
            issuerId: "Issuer ID",
            issuerIdPlaceholder: "ex. 57246542-96fe-1a63-e053-0824d011072a",
            keyId: "Key ID",
            keyIdPlaceholder: "ex. 2X9R4HXF34",
            privateKey: "Private Key (.p8)",
            privateKeyPlaceholder: "Cole o conteúdo do seu arquivo .p8",
          },
        },
        playstore: {
          title: "Google Play Console",
          description: "Conecte o Google Play para ver avaliações e reviews do Android.",
          helpAction: "Crie uma Service Account em",
          helpLink: "Google Play Console → API Access",
          fields: {
            packageName: "Package Name",
            packageNamePlaceholder: "ex. com.wgsoftwares.wakemind",
            serviceAccountJson: "Service Account JSON",
            serviceAccountJsonPlaceholder:
              'Cole seu service account JSON ({"type":"service_account",...})',
          },
        },
      },
      connectedSuccess: "{{provider}} conectado com sucesso",
      failedToSave: "Falha ao salvar integração",
      secretPlaceholder: "••••••••••••",
    },

    // Generate Image
    generateImage: {
      title: "Gerar Imagem",
      subtitle: "Gere assets de jogo usando a API de geração de imagens da OpenAI.",
      asset: "Asset",
      packageLabel: "Pacote *",
      packagePlaceholder: "Selecione um pacote…",
      nameLabel: "Nome *",
      namePlaceholder: "ex. Trigo, Espada de Ferro, Cristal de Fogo",
      descriptionLabel: "Descrição",
      descriptionHint: "(opcional — substitui o nome no prompt)",
      descriptionPlaceholder:
        "ex. Uma espiga de trigo dourada, madura e brilhante, com algumas folhas na base",
      generating: "Gerando…",
      generateBtn: "Gerar Imagem",
    },

    // Generate Sound
    generateSound: {
      title: "Gerar Som",
      subtitle: "Gere assets de voz e áudio usando a API TTS da OpenAI.",
      asset: "Asset",
      presetLabel: "Preset",
      presetPlaceholder: "Selecione um preset de voz…",
      nameLabel: "Nome *",
      namePlaceholder: "ex. Missão Aceita, Fanfarra de Vitória",
      textLabel: "Texto para falar *",
      textPlaceholder:
        "ex. Missão aceita! Procure o artefato ancestral nas Cavernas de Cristal.",
      generationOptions: "Opções de Geração",
      modelLabel: "Modelo",
      voiceLabel: "Voz",
      formatLabel: "Formato",
      speedLabel: "Velocidade ({{speed}}x)",
      voiceInstructions: "Instruções de Voz",
      voiceInstructionsPlaceholder:
        "Descreva tom, emoção, ritmo… ex. Fale em um tom caloroso e misterioso com pausas dramáticas.",
      voiceInstructionsHint:
        "Suportado apenas pelo gpt-4o-mini-tts. Controla tom, emoção e estilo.",
      generating: "Gerando…",
      generateBtn: "Gerar Som",
      generatingAudio: "Gerando áudio…",
      audioEmptyState: "Seu áudio aparecerá aqui",
      downloadFormat: "Download .{{format}}",
    },

    // Package Detail
    packageDetail: {
      achievements: "Conquistas",
      assets: "Assets",
      achievementCount: "{{count}} Conquistas",
      assetCount: "{{count}} Assets",
      exportJson: "Exportar JSON",
      backToLibrary: "Voltar para Biblioteca",
      selectAchievement: "Selecione uma conquista para gerar um asset",
      generatingFor: "Gerando para",
      descriptionLabel: "Descrição",
      descriptionHint: "(opcional — substitui o nome no prompt)",
      descriptionPlaceholder: "ex. Uma espiga de trigo dourada, madura e brilhante",
      generatedPrompt: "Prompt Gerado",
      downloadFormat: "Download .{{format}}",
      contextMenu: {
        selectForGeneration: "Selecionar para geração",
        copyId: "Copiar ID",
        viewAsset: "Ver asset",
        downloadAsset: "Baixar asset",
        regenerate: "Regenerar",
      },
    },

    // About
    about: {
      title: "Wakemind Studio",
      subtitle:
        "Criação de assets e gerenciamento de conquistas para o ecossistema Wakemind",
      description:
        "Wakemind Studio é o companheiro criativo do app mobile Wakemind — uma ferramenta que permite a desenvolvedores e criadores gerar assets de imagem com qualidade de jogo e efeitos sonoros com IA, gerenciar uma biblioteca de ícones de conquistas e configurar os componentes do sistema de recompensas que roda dentro da experiência Wakemind.",
      howToUse: "Como usar",
      generateImageCard: {
        title: "Gerar Imagem",
        description:
          "Crie ícones e assets prontos para jogo com um único prompt. Escolha um preset de estilo, defina as dimensões e baixe seu PNG em segundos.",
        cta: "Abrir Gerador",
      },
      generateSoundCard: {
        title: "Gerar Som",
        description:
          "Produza trilhas ambiente, SFX 8-bit e sons de notificação para combinar com suas conquistas e alarmes do jogo.",
        cta: "Abrir Gerador",
      },
      libraryCard: {
        title: "Navegar na Biblioteca",
        description:
          "Revise o catálogo completo de ícones de conquistas incluídos no Pacote Básico. Visualize cada tier e ícone antes de exportar.",
        cta: "Abrir Biblioteca",
      },
      providers: {
        title: "Provedores",
        description: "Serviços externos que alimentam as funcionalidades de geração",
        openai: {
          name: "OpenAI",
          description:
            "Geração de imagens via `gpt-image-1` e `dall-e-3`. Requer uma chave de API pessoal configurada nas Configurações.",
          docs: "Docs",
        },
        sound: {
          name: "Provedor de Som",
          description:
            "A geração de som suportará OpenAI TTS, ElevenLabs ou fal.ai. A seleção do provedor estará disponível nas Configurações quando a funcionalidade for lançada.",
        },
      },
      stack: {
        title: "Stack",
        description: "Tecnologias principais usadas neste projeto",
      },
    },
  },

  // ── Components ────────────────────────────────────────────────────────────
  components: {
    generationOptions: {
      title: "Opções de Geração",
      model: "Modelo",
      size: "Tamanho",
      quality: "Qualidade",
      format: "Formato",
      background: "Fundo",
      qualityStandard: "Padrão",
      qualityHd: "HD",
      bgTransparent: "Transparente",
      bgOpaque: "Opaco",
    },

    preview: {
      title: "Visualização",
      loading: "Gerando imagem…",
      empty: "Sua imagem aparecerá aqui",
      downloadFormat: "Download .{{format}}",
    },

    styleConfig: {
      title: "Style Config",
      description: "Pré-preenchido do pacote. Edite livremente para sobrescrever.",
      placeholder: "Selecione um pacote acima para carregar sua style config…",
    },

    createPackage: {
      title: "Criar Novo Pacote",
      description:
        "Crie um pacote de assets personalizado para organizar suas imagens geradas.",
      nameLabel: "Nome *",
      namePlaceholder: "ex. Ícones Fantasia, Itens Pixel…",
      nameRequired: "Nome do pacote é obrigatório",
      nameTooLong: "Nome muito longo",
      descriptionLabel: "Descrição",
      descriptionPlaceholder: "Breve descrição deste pacote",
      descriptionTooLong: "Descrição muito longa",
      colorLabel: "Cor",
      colorAriaLabel: "Cor {{preset}}",
      failedToCreate: "Falha ao criar pacote.",
      creating: "Criando…",
      createBtn: "Criar Pacote",
    },

    assetGrid: {
      empty: "Nenhum asset gerado ainda.",
      emptyHint: "Selecione uma conquista e clique em Gerar.",
      contextMenu: {
        viewDetails: "Ver detalhes",
        download: "Download",
        delete: "Excluir",
      },
    },

    assetDetail: {
      package: "Pacote",
      model: "Modelo",
      type: "Tipo",
      prompt: "PROMPT",
      download: "Download",
      deleteAsset: "Excluir asset",
    },

    ratingsBreakdown: {
      title: "Distribuição de Avaliações",
      description: "Distribuição por estrelas (iOS vs Android)",
      empty: "Sem dados de avaliações disponíveis",
      ios: "iOS",
      android: "Android",
    },

    reviewsFeed: {
      title: "Reviews Recentes",
      description: "Últimos reviews da App Store e Google Play",
      empty: "Sem reviews disponíveis",
      ios: "iOS",
      android: "Android",
    },

    activeUsersChart: {
      title: "Usuários Ativos",
      description: "DAU / WAU / MAU ao longo do tempo",
      empty: "Sem dados disponíveis",
    },

    revenueChart: {
      title: "Receita",
      description: "MRR e Taxa de Churn ao longo do tempo",
      empty: "Sem dados disponíveis",
      mrrAxis: "MRR ($)",
      churnAxis: "Churn (%)",
    },

    topEvents: {
      title: "Top Eventos",
      description: "Eventos mais acionados do Mixpanel",
      event: "Evento",
      count: "Contagem",
      empty: "Sem dados de eventos disponíveis",
    },

    retention: {
      title: "Retenção",
      description: "Retenção de usuários por coorte semanal",
      cohort: "Coorte",
      users: "Usuários",
      week: "S{{index}}",
      weekTooltip: "Semana {{index}}",
      dateWeekTooltip: "{{date}} · Semana {{index}}",
      retainedTooltip: "{{pct}}% retidos ({{users}} usuários)",
      empty: "Sem dados de retenção disponíveis",
    },
  },

  // ── Validation ────────────────────────────────────────────────────────────
  validation: {
    required: "Campo obrigatório",
    emailInvalid: "Informe um email válido",
    passwordMinLength: "A senha deve ter pelo menos {{min}} caracteres",
    nameTooLong: "Nome muito longo",
    descriptionTooLong: "Descrição muito longa",
  },
} as const;

export default pt;
