/**
 * Premium Feature Configuration
 *
 * Defines subscription tiers, pricing, and feature availability
 */

export const PREMIUM_TIERS = {
  free: {
    id: 'free',
    name: '免费版',
    description: '完整的 3D 可视化与知识图谱',
    trial: null,
    features: {
      core: [
        '464 条定理与猜想',
        '1620 条验证关系',
        '3D 星云可视化',
        '基础搜索',
        '路径查找',
        '导出 SVG',
        '3 个自定义收藏',
        '10 条个人注释'
      ]
    }
  },

  scholar: {
    id: 'scholar',
    name: '学者版',
    description: '面向研究生和自学者的 AI 辅助学习',
    trial: 14,
    features: {
      core: [
        '所有免费版功能',
        '25 个自定义收藏',
        '100 条注释',
        '导出 PNG / PDF'
      ],
      ai: [
        '语义搜索 100 次/天',
        '定理发现 5 次/月',
        '概念解释（高级）',
        '交互式练习'
      ],
      learning: [
        '8 条专家策划路径',
        '3 条同时激活',
        '进度追踪',
        '间隔重复'
      ]
    }
  },

  professional: {
    id: 'professional',
    name: '专业版',
    description: '面向职业数学家的研究工具',
    trial: 7,
    features: {
      core: [
        '所有学者版功能',
        '100 个收藏',
        '500 条注释',
        '导出 LaTeX',
        '30 天历史版本'
      ],
      ai: [
        '语义搜索 500 次/天',
        '定理发现 25 次/月',
        '证明生成 10 次/月',
        '证明验证 25 次/月',
        '研究助手',
        '概念解释（专家）'
      ],
      research: [
        '论文分析 50 篇/月',
        '引用网络 1000 篇',
        '证明链分析',
        '研究时间线',
        '5 位协作者'
      ],
      learning: [
        '10 条激活路径',
        '个人 AI 导师',
        '创建 5 门课程'
      ]
    }
  },

  research: {
    id: 'research',
    name: '研究版',
    description: '不受限制的研究与开发',
    trial: 7,
    features: {
      core: [
        '所有专业版功能',
        '无限收藏',
        '无限注释',
        '完整历史版本',
        '完整 API 访问'
      ],
      ai: [
        '无限语义搜索',
        '无限定理发现',
        '无限证明生成',
        '无限证明验证',
        '优先级研究助手',
        '自定义概念解释'
      ],
      research: [
        '无限论文分析',
        '无限引用网络',
        '无限协作者',
        'Git 集成',
        '高优先级处理'
      ],
      learning: [
        '无限激活路径',
        '无限课程创建'
      ]
    }
  }
};

export const PRICING = {
  free: {
    monthly: 0,
    annual: 0
  },
  scholar: {
    monthly: 12,
    annual: 96  // 20% discount
  },
  professional: {
    monthly: 29,
    annual: 280  // 20% discount
  },
  research: {
    monthly: 69,
    annual: 660  // 20% discount
  }
};

export const INSTITUTIONAL_PRICING = {
  department: {
    basePrice: 499,
    minUsers: 5,
    maxUsers: 24,
    perUserCost: null  // Flat fee
  },
  university: {
    basePrice: 1499,
    minUsers: 25,
    maxUsers: null,  // No limit
    perUserCost: 60  // Approximately
  },
  enterprise: {
    basePrice: 'custom',
    minUsers: 100,
    maxUsers: null,
    perUserCost: 'negotiable'
  }
};

// Feature matrix for comparison table
export const PREMIUM_FEATURES = {
  '核心功能': [
    {
      name: '定理库',
      description: '可访问的定理与猜想数量',
      tiers: {
        free: 464,
        scholar: '全部',
        professional: '全部',
        research: '全部'
      }
    },
    {
      name: '自定义收藏',
      description: '保存的定理集合数量',
      tiers: {
        free: 3,
        scholar: 25,
        professional: 100,
        research: '无限'
      }
    },
    {
      name: '注释',
      description: '个人笔记与标记',
      tiers: {
        free: 10,
        scholar: 100,
        professional: 500,
        research: '无限'
      }
    },
    {
      name: '导出格式',
      description: '支持的文件导出格式',
      tiers: {
        free: 'SVG',
        scholar: 'SVG, PNG, PDF',
        professional: '全部 + LaTeX',
        research: '全部格式'
      }
    },
    {
      name: '历史版本',
      description: '访问过往版本',
      tiers: {
        free: false,
        scholar: false,
        professional: '30 天',
        research: '完整'
      }
    }
  ],

  'AI 功能': [
    {
      name: '语义搜索',
      description: '自然语言理解搜索',
      tiers: {
        free: '10/天',
        scholar: '100/天',
        professional: '500/天',
        research: '无限'
      }
    },
    {
      name: '定理发现',
      description: 'AI 建议潜在定理',
      tiers: {
        free: false,
        scholar: '5/月',
        professional: '25/月',
        research: '无限'
      }
    },
    {
      name: '证明生成',
      description: '生成证明草图',
      tiers: {
        free: false,
        scholar: false,
        professional: '10/月',
        research: '无限'
      }
    },
    {
      name: '证明验证',
      description: '自动化证明检查',
      tiers: {
        free: false,
        scholar: false,
        professional: '25/月',
        research: '无限'
      }
    },
    {
      name: '概念解释',
      description: '多层次 AI 生成解释',
      tiers: {
        free: '基础',
        scholar: '高级',
        professional: '专家',
        research: '专家 + 定制'
      }
    },
    {
      name: '研究助手',
      description: 'AI 研究建议',
      tiers: {
        free: false,
        scholar: false,
        professional: true,
        research: '优先级'
      }
    }
  ],

  '学习资源': [
    {
      name: '学习路径',
      description: '专家策划的学习旅程',
      tiers: {
        free: '浏览',
        scholar: '3 条激活',
        professional: '10 条激活',
        research: '无限'
      }
    },
    {
      name: '进度追踪',
      description: '学习进度分析',
      tiers: {
        free: '基础',
        scholar: true,
        professional: true,
        research: true
      }
    },
    {
      name: '交互式练习',
      description: '带反馈的结构化练习',
      tiers: {
        free: false,
        scholar: '基础',
        professional: '高级',
        research: '高级'
      }
    },
    {
      name: '间隔重复',
      description: '优化记忆的复习调度',
      tiers: {
        free: false,
        scholar: true,
        professional: true,
        research: true
      }
    },
    {
      name: '个人 AI 导师',
      description: '自适应教学',
      tiers: {
        free: false,
        scholar: false,
        professional: true,
        research: '优先级'
      }
    },
    {
      name: '课程创建',
      description: '创建自定义学习路径',
      tiers: {
        free: false,
        scholar: false,
        professional: '5 门',
        research: '无限'
      }
    }
  ],

  '研究工具': [
    {
      name: '论文分析',
      description: '从论文提取定理',
      tiers: {
        free: false,
        scholar: '10/月',
        professional: '50/月',
        research: '无限'
      }
    },
    {
      name: '引用网络',
      description: '文献引用可视化',
      tiers: {
        free: false,
        scholar: '100 篇',
        professional: '1000 篇',
        research: '无限'
      }
    },
    {
      name: '依赖追踪',
      description: '定理依赖关系',
      tiers: {
        free: false,
        scholar: true,
        professional: true,
        research: true
      }
    },
    {
      name: '证明链分析',
      description: '逻辑依赖树',
      tiers: {
        free: false,
        scholar: false,
        professional: true,
        research: true
      }
    },
    {
      name: '研究时间线',
      description: '数学思想历史发展',
      tiers: {
        free: false,
        scholar: false,
        professional: true,
        research: true
      }
    },
    {
      name: '协作工具',
      description: '团队注释与讨论',
      tiers: {
        free: false,
        scholar: false,
        professional: '5 位',
        research: '无限'
      }
    },
    {
      name: 'API 访问',
      description: '程序化访问',
      tiers: {
        free: false,
        scholar: false,
        professional: '受限',
        research: '完整'
      }
    }
  ],

  '支持服务': [
    {
      name: '社区论坛',
      description: '用户交流',
      tiers: {
        free: true,
        scholar: true,
        professional: true,
        research: true
      }
    },
    {
      name: '邮件支持',
      description: '响应时间',
      tiers: {
        free: false,
        scholar: '48 小时',
        professional: '24 小时',
        research: '12 小时'
      }
    },
    {
      name: '优先处理',
      description: 'AI 操作优先级',
      tiers: {
        free: false,
        scholar: false,
        professional: true,
        research: '高优先级'
      }
    }
  ]
};

// Usage limits and quotas
export const USAGE_LIMITS = {
  free: {
    semanticSearch: { daily: 10, monthly: 300 },
    collections: 3,
    annotations: 10,
    export: { formats: ['svg'] }
  },
  scholar: {
    semanticSearch: { daily: 100, monthly: 3000 },
    theoremDiscovery: { monthly: 5 },
    collections: 25,
    annotations: 100,
    learningPaths: { active: 3 },
    paperAnalysis: { monthly: 10 },
    citationNetwork: { papers: 100 },
    export: { formats: ['svg', 'png', 'pdf'] }
  },
  professional: {
    semanticSearch: { daily: 500, monthly: 15000 },
    theoremDiscovery: { monthly: 25 },
    proofGeneration: { monthly: 10 },
    proofVerification: { monthly: 25 },
    collections: 100,
    annotations: 500,
    learningPaths: { active: 10 },
    courses: { create: 5 },
    paperAnalysis: { monthly: 50 },
    citationNetwork: { papers: 1000 },
    collaborators: 5,
    historyDays: 30,
    export: { formats: ['svg', 'png', 'pdf', 'latex', 'json'] }
  },
  research: {
    semanticSearch: { daily: -1, monthly: -1 },  // -1 = unlimited
    theoremDiscovery: { monthly: -1 },
    proofGeneration: { monthly: -1 },
    proofVerification: { monthly: -1 },
    collections: -1,
    annotations: -1,
    learningPaths: { active: -1 },
    courses: { create: -1 },
    paperAnalysis: { monthly: -1 },
    citationNetwork: { papers: -1 },
    collaborators: -1,
    historyDays: -1,
    export: { formats: ['svg', 'png', 'pdf', 'latex', 'json', 'tikz', 'graphml'] },
    api: {
      rateLimit: 10000,  // requests per hour
      fullAccess: true
    }
  }
};

// Feature flags
export const FEATURE_FLAGS = {
  proofGeneration: {
    enabled: true,
    beta: true,
    requiredTier: 'professional'
  },
  theoremDiscovery: {
    enabled: true,
    beta: true,
    requiredTier: 'scholar'
  },
  proofVerification: {
    enabled: true,
    beta: false,
    requiredTier: 'professional'
  },
  collaboration: {
    enabled: false,  // Coming Q2 2027
    beta: false,
    requiredTier: 'professional'
  },
  formalVerification: {
    enabled: false,  // Coming Q3 2027
    beta: false,
    requiredTier: 'research'
  }
};

// Discount codes
export const DISCOUNTS = {
  student: {
    code: 'STUDENT40',
    percentage: 0.40,
    verification: 'edu_email_or_id',
    applicableTiers: ['scholar', 'professional']
  },
  postdoc: {
    code: 'POSTDOC20',
    percentage: 0.20,
    verification: 'manual',
    applicableTiers: ['professional', 'research']
  },
  earlyAdopter: {
    code: 'EARLY40',
    percentage: 0.40,
    duration: 12,  // months
    maxUses: 500,
    applicableTiers: ['scholar', 'professional', 'research']
  },
  annual: {
    code: 'ANNUAL20',
    percentage: 0.20,
    autoApplied: true,
    applicableTiers: ['scholar', 'professional', 'research']
  }
};

// Contact information
export const CONTACT = {
  sales: 'sales@formula-nebula.com',
  support: 'support@formula-nebula.com',
  partnerships: 'partners@formula-nebula.com',
  press: 'press@formula-nebula.com',
  demo: 'https://calendly.com/formula-nebula/demo'
};
