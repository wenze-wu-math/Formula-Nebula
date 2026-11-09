/**
 * Premium Features Modal UI Component
 *
 * Displays subscription tiers, features, and upgrade options
 */

import { PREMIUM_TIERS, PREMIUM_FEATURES, PRICING } from '../premium/config.js';

export class PremiumModal {
  constructor() {
    this.modal = null;
    this.selectedTier = 'scholar';
    this.billingCycle = 'monthly'; // 'monthly' | 'annual'
    this.create();
  }

  create() {
    this.modal = document.createElement('div');
    this.modal.id = 'premium-modal';
    this.modal.className = 'modal-overlay hidden';
    this.modal.innerHTML = this.buildHTML();
    document.body.appendChild(this.modal);
    this.attachListeners();
  }

  buildHTML() {
    return `
      <div class="modal-container premium-modal">
        <div class="modal-header">
          <h2>升级至 Formula Nebula Premium</h2>
          <p class="subtitle">解锁 AI 驱动的定理发现、证明生成与高级研究工具</p>
          <button class="modal-close" aria-label="关闭">×</button>
        </div>

        <!-- Billing Toggle -->
        <div class="billing-toggle">
          <button class="toggle-btn active" data-cycle="monthly">按月付费</button>
          <button class="toggle-btn" data-cycle="annual">
            按年付费
            <span class="discount-badge">省 20%</span>
          </button>
        </div>

        <!-- Pricing Cards -->
        <div class="pricing-grid">
          ${this.buildTierCard('free')}
          ${this.buildTierCard('scholar')}
          ${this.buildTierCard('professional')}
          ${this.buildTierCard('research')}
        </div>

        <!-- Feature Comparison Table -->
        <div class="feature-comparison">
          <h3>功能对比</h3>
          <div class="comparison-table-wrapper">
            ${this.buildComparisonTable()}
          </div>
        </div>

        <!-- Institutional Options -->
        <div class="institutional-section">
          <h3>机构方案</h3>
          <div class="institutional-cards">
            ${this.buildInstitutionalCard('department')}
            ${this.buildInstitutionalCard('university')}
            ${this.buildInstitutionalCard('enterprise')}
          </div>
          <a href="#contact-sales" class="contact-sales-btn">联系销售团队</a>
        </div>

        <!-- FAQ -->
        <div class="faq-section">
          <h3>常见问题</h3>
          ${this.buildFAQ()}
        </div>

        <!-- Trust Signals -->
        <div class="trust-signals">
          <div class="signal">
            <span class="icon">🔒</span>
            <span>安全付款 · Stripe 加密</span>
          </div>
          <div class="signal">
            <span class="icon">↩️</span>
            <span>30 天退款保证</span>
          </div>
          <div class="signal">
            <span class="icon">🎓</span>
            <span>学生享 40% 折扣</span>
          </div>
          <div class="signal">
            <span class="icon">🌍</span>
            <span>全球 2000+ 研究者信赖</span>
          </div>
        </div>
      </div>
    `;
  }

  buildTierCard(tierId) {
    const tier = PREMIUM_TIERS[tierId];
    const pricing = PRICING[tierId];
    const isPopular = tierId === 'scholar';
    const isCurrent = tierId === 'free'; // TODO: Get from user state

    const monthlyPrice = this.billingCycle === 'annual'
      ? pricing.annual / 12
      : pricing.monthly;

    return `
      <div class="pricing-card ${isPopular ? 'popular' : ''} ${isCurrent ? 'current' : ''}" data-tier="${tierId}">
        ${isPopular ? '<div class="popular-badge">最受欢迎</div>' : ''}
        ${isCurrent ? '<div class="current-badge">当前方案</div>' : ''}

        <div class="tier-header">
          <h4>${tier.name}</h4>
          <div class="tier-price">
            ${tierId === 'free'
              ? '<span class="price-amount">免费</span>'
              : `
                <span class="price-currency">$</span>
                <span class="price-amount">${Math.floor(monthlyPrice)}</span>
                <span class="price-period">/月</span>
              `
            }
          </div>
          ${this.billingCycle === 'annual' && tierId !== 'free'
            ? `<div class="annual-note">按年计费 $${pricing.annual}</div>`
            : ''
          }
          <p class="tier-description">${tier.description}</p>
        </div>

        <div class="tier-features">
          <h5>核心功能</h5>
          <ul>
            ${tier.features.core.map(f => `
              <li>
                <span class="check">✓</span>
                ${f}
              </li>
            `).join('')}
          </ul>

          ${tier.features.ai?.length ? `
            <h5>AI 功能</h5>
            <ul>
              ${tier.features.ai.map(f => `
                <li>
                  <span class="check ai-check">⭐</span>
                  ${f}
                </li>
              `).join('')}
            </ul>
          ` : ''}

          ${tier.features.research?.length ? `
            <h5>研究工具</h5>
            <ul>
              ${tier.features.research.map(f => `
                <li>
                  <span class="check">✓</span>
                  ${f}
                </li>
              `).join('')}
            </ul>
          ` : ''}

          ${tier.features.learning?.length ? `
            <h5>学习资源</h5>
            <ul>
              ${tier.features.learning.map(f => `
                <li>
                  <span class="check">✓</span>
                  ${f}
                </li>
              `).join('')}
            </ul>
          ` : ''}
        </div>

        <div class="tier-cta">
          ${this.buildCTAButton(tierId, isCurrent)}
        </div>
      </div>
    `;
  }

  buildCTAButton(tierId, isCurrent) {
    if (isCurrent) {
      return '<button class="cta-btn current" disabled>当前方案</button>';
    }

    if (tierId === 'free') {
      return '<button class="cta-btn secondary">保持免费</button>';
    }

    const tier = PREMIUM_TIERS[tierId];
    return `
      <button class="cta-btn primary" data-action="upgrade" data-tier="${tierId}">
        ${tier.trial ? `免费试用 ${tier.trial} 天` : '立即升级'}
      </button>
    `;
  }

  buildComparisonTable() {
    const features = PREMIUM_FEATURES;
    const tiers = ['free', 'scholar', 'professional', 'research'];

    return `
      <table class="comparison-table">
        <thead>
          <tr>
            <th class="feature-col">功能</th>
            ${tiers.map(t => `<th>${PREMIUM_TIERS[t].name}</th>`).join('')}
          </tr>
        </thead>
        <tbody>
          ${Object.entries(features).map(([category, items]) => `
            <tr class="category-row">
              <td colspan="${tiers.length + 1}"><strong>${category}</strong></td>
            </tr>
            ${items.map(item => `
              <tr>
                <td class="feature-name">
                  ${item.name}
                  ${item.description ? `<span class="info-tooltip" data-tooltip="${item.description}">ⓘ</span>` : ''}
                </td>
                ${tiers.map(tier => `
                  <td class="feature-value">${this.formatFeatureValue(item.tiers[tier])}</td>
                `).join('')}
              </tr>
            `).join('')}
          `).join('')}
        </tbody>
      </table>
    `;
  }

  formatFeatureValue(value) {
    if (value === true) return '<span class="check-mark">✓</span>';
    if (value === false || value === null) return '<span class="x-mark">—</span>';
    if (typeof value === 'string') return value;
    if (typeof value === 'number') return value.toLocaleString();
    return value;
  }

  buildInstitutionalCard(type) {
    const cards = {
      department: {
        name: '院系方案',
        price: '$499',
        period: '/月',
        users: '5-24 名用户',
        features: [
          '所有 Research 功能',
          'SSO 单点登录 (SAML)',
          '课程管理面板',
          '学生进度分析',
          '批量用户管理',
          '99.5% SLA 保证'
        ]
      },
      university: {
        name: '大学方案',
        price: '$1,499',
        period: '/月',
        users: '25+ 名用户',
        features: [
          '所有院系功能',
          '自定义域名',
          'LMS 集成',
          '私有定理库',
          '100GB 机构存储',
          '99.9% SLA 保证',
          '专属客户经理',
          '季度培训会议'
        ],
        popular: true
      },
      enterprise: {
        name: '企业方案',
        price: '定制',
        period: '',
        users: '100+ 名用户',
        features: [
          '所有大学功能',
          '私有化部署选项',
          '完全品牌定制',
          '无限存储',
          '99.95% SLA 保证',
          '24/7 专属支持',
          '定制开发',
          '合规认证'
        ]
      }
    };

    const card = cards[type];
    return `
      <div class="institutional-card ${card.popular ? 'popular' : ''}">
        ${card.popular ? '<div class="popular-badge">推荐</div>' : ''}
        <h4>${card.name}</h4>
        <div class="inst-price">
          <span class="amount">${card.price}</span>
          <span class="period">${card.period}</span>
        </div>
        <div class="inst-users">${card.users}</div>
        <ul class="inst-features">
          ${card.features.map(f => `<li><span class="check">✓</span>${f}</li>`).join('')}
        </ul>
        <button class="cta-btn ${card.popular ? 'primary' : 'secondary'}" data-action="contact-sales" data-plan="${type}">
          联系销售
        </button>
      </div>
    `;
  }

  buildFAQ() {
    const faqs = [
      {
        q: '免费版本会消失吗？',
        a: '不会。免费版本将永久保留完整的 3D 可视化、搜索和知识图谱功能。Premium 增加的是 AI、学习路径和研究工具。'
      },
      {
        q: '可以先试用吗？',
        a: 'Scholar 提供 14 天免费试用，Professional 和 Research 提供 7 天试用。无需信用卡。'
      },
      {
        q: '如果取消订阅会怎样？',
        a: '您在当前计费周期结束前仍可使用。注释和收藏将以只读模式保留 90 天。'
      },
      {
        q: 'AI 证明生成的准确率如何？',
        a: '我们的 AI 生成的证明草图结构正确率约 70%。我们对局限性保持透明，并显示置信度分数。始终需要人工验证。'
      },
      {
        q: '学生有折扣吗？',
        a: '有。经过验证的学生（通过 .edu 邮箱或学生证）可享受 40% 折扣。博士后和早期职业研究者可享受 20% 折扣。'
      },
      {
        q: '支持哪些支付方式？',
        a: '信用卡（Visa、MC、Amex）、PayPal，机构方案支持银行转账。即将支持支付宝和微信支付。'
      }
    ];

    return `
      <div class="faq-list">
        ${faqs.map((faq, i) => `
          <details class="faq-item" ${i === 0 ? 'open' : ''}>
            <summary>${faq.q}</summary>
            <p>${faq.a}</p>
          </details>
        `).join('')}
      </div>
      <a href="#" class="view-all-faq">查看完整 FAQ →</a>
    `;
  }

  attachListeners() {
    // Close button
    this.modal.querySelector('.modal-close').addEventListener('click', () => this.hide());

    // Click outside to close
    this.modal.addEventListener('click', (e) => {
      if (e.target === this.modal) this.hide();
    });

    // Billing cycle toggle
    this.modal.querySelectorAll('.toggle-btn').forEach(btn => {
      btn.addEventListener('click', (_e) => {
        this.modal.querySelectorAll('.toggle-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.billingCycle = btn.dataset.cycle;
        this.refresh();
      });
    });

    // CTA buttons
    this.modal.querySelectorAll('[data-action="upgrade"]').forEach(btn => {
      btn.addEventListener('click', (_e) => {
        const tier = btn.dataset.tier;
        this.handleUpgrade(tier);
      });
    });

    // Contact sales
    this.modal.querySelectorAll('[data-action="contact-sales"]').forEach(btn => {
      btn.addEventListener('click', (_e) => {
        const plan = btn.dataset.plan;
        this.handleContactSales(plan);
      });
    });

    // Tooltips
    this.modal.querySelectorAll('.info-tooltip').forEach(tip => {
      tip.addEventListener('mouseenter', (e) => {
        this.showTooltip(e.target, tip.dataset.tooltip);
      });
      tip.addEventListener('mouseleave', () => {
        this.hideTooltip();
      });
    });
  }

  handleUpgrade(tier) {
    console.log(`[Premium] Upgrade to ${tier} (${this.billingCycle})`);
    // TODO: Integrate with Stripe Checkout
    // window.location.href = `/checkout?tier=${tier}&billing=${this.billingCycle}`;

    // For now, show coming soon
    alert(`升级至 ${PREMIUM_TIERS[tier].name} 即将上线！\n\n我们正在完善支付系统，敬请期待。`);
  }

  handleContactSales(plan) {
    console.log(`[Premium] Contact sales for ${plan}`);
    // TODO: Open contact form or redirect
    window.location.href = `mailto:sales@formula-nebula.com?subject=Inquiry: ${plan} Plan`;
  }

  showTooltip(element, text) {
    const existing = document.querySelector('.premium-tooltip');
    if (existing) existing.remove();

    const tooltip = document.createElement('div');
    tooltip.className = 'premium-tooltip';
    tooltip.textContent = text;
    document.body.appendChild(tooltip);

    const rect = element.getBoundingClientRect();
    tooltip.style.left = `${rect.left + rect.width / 2}px`;
    tooltip.style.top = `${rect.bottom + 8}px`;
  }

  hideTooltip() {
    const tooltip = document.querySelector('.premium-tooltip');
    if (tooltip) tooltip.remove();
  }

  show() {
    this.modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
  }

  hide() {
    this.modal.classList.add('hidden');
    document.body.style.overflow = '';
  }

  refresh() {
    // Rebuild pricing cards with new billing cycle
    const grid = this.modal.querySelector('.pricing-grid');
    grid.innerHTML = `
      ${this.buildTierCard('free')}
      ${this.buildTierCard('scholar')}
      ${this.buildTierCard('professional')}
      ${this.buildTierCard('research')}
    `;

    // Reattach CTA listeners
    grid.querySelectorAll('[data-action="upgrade"]').forEach(btn => {
      btn.addEventListener('click', (_e) => {
        const tier = btn.dataset.tier;
        this.handleUpgrade(tier);
      });
    });
  }

  destroy() {
    if (this.modal) {
      this.modal.remove();
      this.modal = null;
    }
  }
}
