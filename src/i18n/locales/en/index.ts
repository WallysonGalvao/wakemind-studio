const en = {
  // ── Brand ───────────────────────────────────────────────────────────────
  brand: {
    studio: "Three Wolves",
    product: "Fenrir",
    tagline: "Multi-project Hub for Asset Creation & Analytics",
  },

  // ── Common ───────────────────────────────────────────────────────────────
  common: {
    save: "Save",
    cancel: "Cancel",
    create: "Create",
    delete: "Delete",
    update: "Update",
    connect: "Connect",
    loading: "Loading…",
    connected: "Connected",
    open: "Open",
    close: "Close",
    search: "Search",
    or: "or",
    back: "Back",
    download: "Download",
    export: "Export",
    settings: "Settings",
    preview: "Preview",
    noData: "No data available",
    comingSoon: "Coming soon",
  },

  // ── Navigation ───────────────────────────────────────────────────────────
  nav: {
    dashboard: "Dashboard",
    generateImage: "Generate Image",
    generateSound: "Generate Sound",
    library: "Library",
    analytics: "Analytics",
    settings: "Settings",
    projects: "Projects",
    getHelp: "Get Help",
    newProject: "New project…",
    fenrir: "Fenrir",
    repos: "Repos",
    about: "About",
    package: "Package",
  },

  // ── User menu ────────────────────────────────────────────────────────────
  userMenu: {
    logOut: "Log out",
    language: "Language",
  },

  // ── Auth ──────────────────────────────────────────────────────────────────
  auth: {
    appName: "Fenrir",
    signIn: "Sign In",
    signUp: "Sign Up",
    signingIn: "Signing in…",
    signingUp: "Signing up…",
    signInSubtitle: "Sign in to your account",
    signUpSubtitle: "Create your account",
    email: "Email",
    emailPlaceholder: "you@example.com",
    emailInvalid: "Please enter a valid email",
    password: "Password",
    passwordPlaceholder: "••••••••",
    passwordMinLength: "Password must be at least 8 characters",
    continueWithGoogle: "Continue with Google",
    alreadyHaveAccount: "Already have an account?",
    dontHaveAccount: "Don't have an account?",
    checkEmail: "Check your email to confirm your account, then sign in.",
  },

  // ── Pages ─────────────────────────────────────────────────────────────────
  pages: {
    // Projects (index)
    projects: {
      title: "Projects",
      subtitle: "Manage your apps and projects.",
      newProject: "New Project",
      emptyTitle: "No projects yet",
      emptyDescription: "Create your first project to get started.",
      createProject: "Create Project",
      created: "Created",
      deleteBtn: "Delete",
      settingsBtn: "Settings",
      createDialog: {
        title: "Create New Project",
        description:
          "Projects let you organize assets and analytics for each of your apps.",
        nameLabel: "Name *",
        namePlaceholder: "e.g. WakeMind, My App",
        slugLabel: "Slug *",
        slugPlaceholder: "e.g. wakemind",
        slugHelper: "Used in the URL: /{{slug}}/dashboard",
        creating: "Creating…",
        createBtn: "Create Project",
      },
    },

    // Dashboard
    dashboard: {
      subtitle: "Dashboard overview for this project.",
      stats: {
        totalAssets: "Total Assets",
        totalAssetsDesc: "All generated assets",
        imagesGenerated: "Images Generated",
        imagesGeneratedDesc: "Image assets",
        imagesGeneratedFooter: "Created via image generation",
        soundsGenerated: "Sounds Generated",
        soundsGeneratedDesc: "Audio assets",
        soundsGeneratedFooter: "Created via sound generation",
        storageUsed: "Storage Used",
        storageUsedDesc: "Local storage",
        storageUsedFooter: "Stored in browser IndexedDB",
        combined: "Images + sounds combined",
      },
      chart: {
        title: "Generation Activity",
        descriptionDesktop: "Assets generated over time",
        descriptionMobile: "Activity",
        last3Months: "Last 3 months",
        last30Days: "Last 30 days",
        last7Days: "Last 7 days",
        images: "Images",
        sounds: "Sounds",
      },
      table: {
        name: "Name",
        type: "Type",
        model: "Model",
        created: "Created",
        image: "Image",
        sound: "Sound",
        customizeColumns: "Customize Columns",
        columns: "Columns",
        openMenu: "Open menu",
        dragToReorder: "Drag to reorder",
        selectAll: "Select all",
        selectRow: "Select row",
        empty: "No assets yet. Generate an image or sound to get started.",
        assetCount: "{{count}} asset(s)",
        selectedRows: "{{selected}} of {{total}} row(s) selected.",
        rowsPerPage: "Rows per page",
        pageOf: "Page {{current}} of {{total}}",
        firstPage: "Go to first page",
        previousPage: "Go to previous page",
        nextPage: "Go to next page",
        lastPage: "Go to last page",
      },
    },

    // Analytics
    analytics: {
      title: "Analytics",
      metricsFor: "Metrics for",
      integrations: "Integrations",
      configureIntegrations: "Configure Integrations",
      emptyTitle: "No integrations connected",
      emptyDescription:
        "Connect Mixpanel, RevenueCat, App Store Connect, or Google Play in your project settings to see real-time analytics data.",
      kpis: {
        dau: "Daily Active Users",
        mrr: "MRR",
        churnRate: "Churn Rate",
        activeSubscriptions: "Active Subscriptions",
        connectMixpanel: "Connect Mixpanel",
        fromMixpanel: "From Mixpanel",
        connectRevenuecat: "Connect RevenueCat",
        fromRevenuecat: "From RevenueCat",
      },
      stores: {
        title: "App Stores",
        description: "Ratings and reviews from the App Store and Google Play.",
        iosRating: "iOS Rating",
        androidRating: "Android Rating",
        iosReviews: "iOS Reviews",
        androidReviews: "Android Reviews",
        connectAppStore: "Connect App Store",
        connectGooglePlay: "Connect Google Play",
        ratings: "{{count}} ratings",
        recentReviews: "Recent reviews",
      },
    },

    // Library
    library: {
      title: "Library",
      subtitle: "Browse achievement icon packages and generated assets.",
      searchPlaceholder: "Search packages…",
      sortOptions: {
        lastEdited: "Last edited",
        name: "Name",
        assetCount: "Asset count",
      },
      createPackage: "Create new package",
      custom: "Custom",
      emptyAssets: "No assets generated yet.",
      emptyAssetsHint: "Select an achievement and click Generate.",
      editedJustNow: "Edited just now",
      editedMinutes: "Edited {{count}}m ago",
      editedHours: "Edited {{count}}h ago",
      editedDays: "Edited {{count}}d ago",
      contextMenu: {
        open: "Open",
        exportJson: "Export JSON",
        deletePackage: "Delete package",
      },
    },

    // Settings
    settings: {
      title: "Settings",
      subtitle: "Manage preferences for",
      repositories: {
        title: "Repositories",
        description:
          "Link the project's code repositories. These appear in the header for quick access.",
        labelPlaceholder: "e.g. Mobile",
        urlPlaceholder: "e.g. https://github.com/org/repo",
        add: "Add repository",
        saved: "Repositories saved",
      },
      appStores: {
        title: "App Stores",
        description: "Connect your app store accounts to view ratings and reviews.",
      },
      providers: {
        mixpanel: {
          title: "Mixpanel",
          description: "Connect your Mixpanel project to view engagement metrics.",
          helpAction: "Find both values under",
          helpLink: "Mixpanel Project Settings",
          fields: {
            projectId: "Project ID",
            projectIdPlaceholder: "e.g. 3978835",
            apiSecret: "API Secret",
            apiSecretPlaceholder: "Paste your API Secret",
          },
        },
        revenuecat: {
          title: "RevenueCat",
          description:
            "Connect RevenueCat to track revenue metrics (MRR, active subscriptions, churn rate).",
          helpAction: "Find your credentials under",
          helpLink: "RevenueCat Dashboard",
          fields: {
            projectId: "Project ID",
            projectIdPlaceholder: "e.g. proj1ab2c3d4",
            apiKey: "v2 Secret API Key",
            apiKeyPlaceholder: "Paste your v2 Secret API key",
          },
        },
        appstore: {
          title: "App Store Connect",
          description: "Connect App Store Connect to view iOS ratings and reviews.",
          helpAction: "Create an API key under",
          helpLink: "Users and Access → Integrations",
          fields: {
            bundleId: "Bundle ID",
            bundleIdPlaceholder: "e.g. com.wgsoftwares.wakemind",
            issuerId: "Issuer ID",
            issuerIdPlaceholder: "e.g. 57246542-96fe-1a63-e053-0824d011072a",
            keyId: "Key ID",
            keyIdPlaceholder: "e.g. 2X9R4HXF34",
            privateKey: "Private Key (.p8)",
            privateKeyPlaceholder: "Paste the contents of your .p8 file",
          },
        },
        playstore: {
          title: "Google Play Console",
          description: "Connect Google Play to view Android ratings and reviews.",
          helpAction: "Create a Service Account under",
          helpLink: "Google Play Console → API Access",
          fields: {
            packageName: "Package Name",
            packageNamePlaceholder: "e.g. com.wgsoftwares.wakemind",
            serviceAccountJson: "Service Account JSON",
            serviceAccountJsonPlaceholder:
              'Paste your service account JSON ({"type":"service_account",...})',
          },
        },
      },
      connectedSuccess: "{{provider}} connected successfully",
      failedToSave: "Failed to save integration",
      secretPlaceholder: "••••••••••••",
    },

    // Generate Image
    generateImage: {
      title: "Generate Image",
      subtitle: "Generate game assets using the OpenAI image generation API.",
      asset: "Asset",
      packageLabel: "Package *",
      packagePlaceholder: "Select a package…",
      nameLabel: "Name *",
      namePlaceholder: "e.g. Wheat, Iron Sword, Fire Crystal",
      descriptionLabel: "Description",
      descriptionHint: "(optional — overrides name in prompt)",
      descriptionPlaceholder:
        "e.g. A golden ear of wheat, ripe and glowing, with a few leaves at the base",
      generating: "Generating…",
      generateBtn: "Generate Image",
    },

    // Generate Sound
    generateSound: {
      title: "Generate Sound",
      subtitle: "Generate voice and audio assets using the OpenAI TTS API.",
      asset: "Asset",
      presetLabel: "Preset",
      presetPlaceholder: "Select a voice preset…",
      nameLabel: "Name *",
      namePlaceholder: "e.g. Quest Accepted, Victory Fanfare",
      textLabel: "Text to speak *",
      textPlaceholder:
        "e.g. Quest accepted! Seek the ancient artifact in the Crystal Caverns.",
      generationOptions: "Generation Options",
      modelLabel: "Model",
      voiceLabel: "Voice",
      formatLabel: "Format",
      speedLabel: "Speed ({{speed}}x)",
      voiceInstructions: "Voice Instructions",
      voiceInstructionsPlaceholder:
        "Describe tone, emotion, pacing… e.g. Speak in a warm, mysterious tone with dramatic pauses.",
      voiceInstructionsHint:
        "Supported only by gpt-4o-mini-tts. Controls tone, emotion, and style.",
      generating: "Generating…",
      generateBtn: "Generate Sound",
      generatingAudio: "Generating audio…",
      audioEmptyState: "Your audio will appear here",
      downloadFormat: "Download .{{format}}",
    },

    // Package Detail
    packageDetail: {
      achievements: "Achievements",
      assets: "Assets",
      achievementCount: "{{count}} Achievements",
      assetCount: "{{count}} Assets",
      exportJson: "Export JSON",
      backToLibrary: "Back to Library",
      selectAchievement: "Select an achievement to generate an asset",
      generatingFor: "Generating for",
      descriptionLabel: "Description",
      descriptionHint: "(optional — overrides name in prompt)",
      descriptionPlaceholder: "e.g. A golden ear of wheat, ripe and glowing",
      generatedPrompt: "Generated Prompt",
      downloadFormat: "Download .{{format}}",
      contextMenu: {
        selectForGeneration: "Select for generation",
        copyId: "Copy ID",
        viewAsset: "View asset",
        downloadAsset: "Download asset",
        regenerate: "Regenerate",
      },
    },

    // About
    about: {
      title: "Fenrir",
      subtitle: "Multi-project Hub for Game Asset Creation & Analytics",
      description:
        "Fenrir is a multi-project hub built by Three Wolves that lets game developers generate AI-powered image and sound assets, manage achievement icon libraries, and monitor product analytics — all from a single workspace. Each project has its own dashboard, generation tools, asset library, and analytics integrations.",
      features: "Features",
      dashboardCard: {
        title: "Dashboard",
        description:
          "Overview of your project with KPIs for total assets, images generated, sounds generated, and storage used. Includes an activity chart and searchable asset data table.",
      },
      generateImageCard: {
        title: "Image Generation",
        description:
          "Create game-ready icons and assets with AI using OpenAI gpt-image-1 or dall-e-3. Configure style presets, dimensions, quality, and background transparency.",
      },
      generateSoundCard: {
        title: "Sound Generation",
        description:
          "Generate voice and audio assets using OpenAI TTS. Choose from multiple voice presets, control speed, format, and tone with custom voice instructions.",
      },
      libraryCard: {
        title: "Asset Library",
        description:
          "Browse and manage achievement icon packages. Preview tiers (Bronze, Silver, Gold, Platinum), export as JSON, and create custom packages.",
      },
      analyticsCard: {
        title: "Analytics",
        description:
          "Real-time product metrics powered by Mixpanel (DAU, top events, retention) and RevenueCat (MRR, subscriptions, churn). Plus App Store and Google Play ratings and reviews.",
      },
      settingsCard: {
        title: "Integrations",
        description:
          "Connect external services per project — Mixpanel, RevenueCat, App Store Connect, and Google Play Console. API keys are stored securely via Supabase Vault.",
      },
      integrations: {
        title: "Integrations",
        description: "External services powering generation and analytics",
        openai: {
          name: "OpenAI",
          description:
            "Image generation via gpt-image-1 and dall-e-3. Sound generation via TTS API with multiple voice models.",
          docs: "Docs",
        },
        mixpanel: {
          name: "Mixpanel",
          description:
            "Engagement analytics — daily active users, top events, and retention cohort heatmaps.",
          docs: "Docs",
        },
        revenuecat: {
          name: "RevenueCat",
          description:
            "Revenue analytics — MRR, active subscriptions and churn rate tracking.",
          docs: "Docs",
        },
      },
      stack: {
        title: "Stack",
        description: "Core technologies used in this project",
      },
      gettingStarted: {
        title: "Getting Started",
        description:
          "Create a project from the hub to get your own dashboard, asset generators, library, and analytics.",
        link: "Go to Projects",
      },
    },
  },

  // ── Components ────────────────────────────────────────────────────────────
  components: {
    generationOptions: {
      title: "Generation Options",
      model: "Model",
      size: "Size",
      quality: "Quality",
      format: "Format",
      background: "Background",
      qualityStandard: "Standard",
      qualityHd: "HD",
      bgTransparent: "Transparent",
      bgOpaque: "Opaque",
    },

    preview: {
      title: "Preview",
      loading: "Generating image…",
      empty: "Your image will appear here",
      downloadFormat: "Download .{{format}}",
    },

    styleConfig: {
      title: "Style Config",
      description: "Pre-filled from the package. Edit freely to override.",
      placeholder: "Select a package above to load its style config…",
    },

    createPackage: {
      title: "Create New Package",
      description: "Create a custom asset package to organize your generated images.",
      nameLabel: "Name *",
      namePlaceholder: "e.g. Fantasy Icons, Pixel Items…",
      nameRequired: "Package name is required",
      nameTooLong: "Name is too long",
      descriptionLabel: "Description",
      descriptionPlaceholder: "Brief description for this package",
      descriptionTooLong: "Description is too long",
      colorLabel: "Color",
      colorAriaLabel: "{{preset}} color",
      failedToCreate: "Failed to create package.",
      creating: "Creating…",
      createBtn: "Create Package",
    },

    assetGrid: {
      empty: "No assets generated yet.",
      emptyHint: "Select an achievement and click Generate.",
      contextMenu: {
        viewDetails: "View details",
        download: "Download",
        delete: "Delete",
      },
    },

    assetDetail: {
      package: "Package",
      model: "Model",
      type: "Type",
      prompt: "PROMPT",
      download: "Download",
      deleteAsset: "Delete asset",
    },

    ratingsBreakdown: {
      title: "Ratings Breakdown",
      description: "Star distribution (iOS vs Android)",
      empty: "No ratings data available",
      ios: "iOS",
      android: "Android",
    },

    reviewsFeed: {
      title: "Recent Reviews",
      description: "Latest reviews from the App Store and Google Play",
      empty: "No reviews available",
      ios: "iOS",
      android: "Android",
    },

    activeUsersChart: {
      title: "Active Users",
      description: "DAU / WAU / MAU over time",
      empty: "No data available",
    },

    revenueChart: {
      title: "Revenue",
      description: "MRR and Churn Rate over time",
      empty: "No data available",
      mrrAxis: "MRR ($)",
      churnAxis: "Churn (%)",
    },

    topEvents: {
      title: "Top Events",
      description: "Most fired events from Mixpanel",
      event: "Event",
      count: "Count",
      empty: "No event data available",
    },

    retention: {
      title: "Retention",
      description: "User retention by weekly cohort",
      cohort: "Cohort",
      users: "Users",
      week: "W{{index}}",
      weekTooltip: "Week {{index}}",
      dateWeekTooltip: "{{date}} · Week {{index}}",
      retainedTooltip: "{{pct}}% retained ({{users}} users)",
      empty: "No retention data available",
    },
  },

  // ── Error Fallback ────────────────────────────────────────────────────────
  errorFallback: {
    title: "Something went wrong",
    description: "An unexpected error occurred.",
    retry: "Try again",
    goHome: "Go to home",
  },

  // ── Loading ────────────────────────────────────────────────────────────────
  loading: {
    projects: "Loading projects…",
    dashboard: "Loading dashboard…",
    library: "Loading library…",
    analytics: "Loading analytics…",
  },

  // ── Toast ──────────────────────────────────────────────────────────────────
  toast: {
    projectDeleted: "Project deleted",
    projectCreated: "Project created",
    projectDeleteFailed: "Failed to delete project",
    projectCreateFailed: "Failed to create project",
    assetDeleted: "Asset deleted",
    assetDeleteFailed: "Failed to delete asset",
    packageDeleted: "Package deleted",
    packageDeleteFailed: "Failed to delete package",
    packageCreated: "Package created",
    packageCreateFailed: "Failed to create package",
  },

  // ── Validation ────────────────────────────────────────────────────────────
  validation: {
    required: "Required",
    emailInvalid: "Please enter a valid email",
    passwordMinLength: "Password must be at least {{min}} characters",
    nameTooLong: "Name is too long",
    descriptionTooLong: "Description is too long",
  },
} as const;

export default en;
