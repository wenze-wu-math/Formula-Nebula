/**
 * 公式诗云 · Formula Nebula - 师徒市场界面
 * Mentorship Marketplace UI
 *
 * 视觉化界面 + 交互组件
 */

import {
  MatchMentorMentee,
  ApplyForMentorship,
  CreateMentoringPlan,
  TrackMilestones,
  SendMentoringUpdate,
  GetAvailableMentors,
  GetLearnerMentorships,
  GetMentorshipStatistics
} from './mentorship.js';

// ============================================================================
// 主界面: 师徒市场
// ============================================================================

export class MentorshipMarketplace {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    this.currentView = 'browse'; // browse, matches, myMentorships, dashboard
    this.currentUser = null;
    this.init();
  }

  init() {
    this.render();
    this.attachEventListeners();
  }

  render() {
    this.container.innerHTML = `
      <div class="mentorship-marketplace">
        <!-- 顶部导航 -->
        <nav class="marketplace-nav">
          <div class="nav-brand">
            <h1>🎓 师徒市场</h1>
            <p class="tagline">连接智慧,传承知识</p>
          </div>
          <div class="nav-tabs">
            <button class="nav-tab active" data-view="browse">
              <span class="icon">🔍</span>
              <span>浏览导师</span>
            </button>
            <button class="nav-tab" data-view="matches">
              <span class="icon">✨</span>
              <span>智能匹配</span>
            </button>
            <button class="nav-tab" data-view="myMentorships">
              <span class="icon">📚</span>
              <span>我的师徒</span>
            </button>
            <button class="nav-tab" data-view="dashboard">
              <span class="icon">📊</span>
              <span>进度看板</span>
            </button>
          </div>
        </nav>

        <!-- 主内容区域 -->
        <main class="marketplace-content">
          <div id="view-container"></div>
        </main>

        <!-- 侧边栏 (统计信息) -->
        <aside class="marketplace-sidebar">
          <div class="stats-widget" id="stats-widget"></div>
        </aside>
      </div>
    `;

    this.renderView(this.currentView);
    this.renderStats();
  }

  renderView(view) {
    const container = this.container.querySelector('#view-container');

    switch (view) {
      case 'browse':
        this.renderBrowseView(container);
        break;
      case 'matches':
        this.renderMatchesView(container);
        break;
      case 'myMentorships':
        this.renderMyMentorshipsView(container);
        break;
      case 'dashboard':
        this.renderDashboardView(container);
        break;
    }
  }

  // ============================================================================
  // 视图: 浏览导师
  // ============================================================================

  renderBrowseView(container) {
    const mentorsData = GetAvailableMentors();

    container.innerHTML = `
      <div class="browse-view">
        <div class="view-header">
          <h2>可用导师 (${mentorsData.total})</h2>
          <div class="filters">
            <input type="text" placeholder="搜索专业领域..." class="search-input" id="search-expertise">
            <select class="filter-select" id="filter-level">
              <option value="">所有等级</option>
              <option value="教授">教授</option>
              <option value="博士后">博士后</option>
              <option value="博士生">博士生</option>
            </select>
            <select class="filter-select" id="filter-availability">
              <option value="">所有可用性</option>
              <option value="高">高可用性</option>
              <option value="中">中可用性</option>
            </select>
          </div>
        </div>

        <div class="mentors-grid" id="mentors-grid">
          ${this.renderMentorCards(mentorsData.mentors)}
        </div>
      </div>
    `;

    this.attachBrowseFilters();
  }

  renderMentorCards(mentors) {
    return mentors.map(mentor => `
      <div class="mentor-card" data-mentor-id="${mentor.id}">
        <div class="mentor-header">
          <div class="mentor-avatar">
            <span class="avatar-placeholder">${mentor.name[0]}</span>
          </div>
          <div class="mentor-info">
            <h3 class="mentor-name">${mentor.name}</h3>
            <p class="mentor-level">${mentor.level}</p>
          </div>
          <div class="mentor-rating">
            <span class="rating-stars">${this.renderStars(mentor.rating)}</span>
            <span class="rating-value">${mentor.rating}</span>
          </div>
        </div>

        <div class="mentor-expertise">
          ${mentor.expertise.map(exp => `
            <span class="expertise-tag">${exp}</span>
          `).join('')}
        </div>

        <div class="mentor-meta">
          <div class="meta-item">
            <span class="meta-icon">👥</span>
            <span class="meta-text">${mentor.openSlots} 个空位</span>
          </div>
          <div class="meta-item">
            <span class="meta-icon">⏰</span>
            <span class="meta-text">${mentor.availability}可用性</span>
          </div>
        </div>

        <div class="mentor-actions">
          <button class="btn btn-primary btn-apply" data-mentor-id="${mentor.id}">
            申请指导
          </button>
          <button class="btn btn-secondary btn-view-profile" data-mentor-id="${mentor.id}">
            查看详情
          </button>
        </div>
      </div>
    `).join('');
  }

  renderStars(rating) {
    const fullStars = Math.floor(rating);
    const halfStar = rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);

    return '★'.repeat(fullStars) +
           (halfStar ? '½' : '') +
           '☆'.repeat(emptyStars);
  }

  attachBrowseFilters() {
    const searchInput = this.container.querySelector('#search-expertise');
    const levelFilter = this.container.querySelector('#filter-level');
    const availFilter = this.container.querySelector('#filter-availability');

    const applyFilters = () => {
      const searchTerm = searchInput.value.toLowerCase();
      const levelValue = levelFilter.value;
      const availValue = availFilter.value;

      const cards = this.container.querySelectorAll('.mentor-card');

      cards.forEach(card => {
        const mentorId = card.dataset.mentorId;
        const mentorsData = GetAvailableMentors();
        const mentor = mentorsData.mentors.find(m => m.id === mentorId);

        if (!mentor) return;

        const matchesSearch = !searchTerm ||
          mentor.expertise.some(exp => exp.toLowerCase().includes(searchTerm));
        const matchesLevel = !levelValue || mentor.level === levelValue;
        const matchesAvail = !availValue || mentor.availability === availValue;

        card.style.display = matchesSearch && matchesLevel && matchesAvail ? 'block' : 'none';
      });
    };

    searchInput.addEventListener('input', applyFilters);
    levelFilter.addEventListener('change', applyFilters);
    availFilter.addEventListener('change', applyFilters);
  }

  // ============================================================================
  // 视图: 智能匹配
  // ============================================================================

  renderMatchesView(container) {
    container.innerHTML = `
      <div class="matches-view">
        <div class="view-header">
          <h2>智能匹配导师</h2>
          <p class="view-description">
            根据您的兴趣和目标,我们推荐最适合的导师
          </p>
        </div>

        <div class="learner-profile-form" id="learner-profile-form">
          <h3>完善您的学习档案</h3>

          <div class="form-group">
            <label>您的姓名</label>
            <input type="text" class="form-input" id="learner-name" placeholder="请输入姓名">
          </div>

          <div class="form-group">
            <label>当前水平</label>
            <select class="form-input" id="learner-level">
              <option value="">请选择</option>
              <option value="自学者">自学者</option>
              <option value="本科">本科生</option>
              <option value="硕士">硕士生</option>
              <option value="博士">博士生</option>
            </select>
          </div>

          <div class="form-group">
            <label>兴趣领域 (多选)</label>
            <div class="checkbox-group" id="interests-group">
              <label><input type="checkbox" value="代数几何"> 代数几何</label>
              <label><input type="checkbox" value="同调代数"> 同调代数</label>
              <label><input type="checkbox" value="范畴论"> 范畴论</label>
              <label><input type="checkbox" value="交换代数"> 交换代数</label>
              <label><input type="checkbox" value="微分几何"> 微分几何</label>
              <label><input type="checkbox" value="代数数论"> 代数数论</label>
            </div>
          </div>

          <div class="form-group">
            <label>学习风格</label>
            <select class="form-input" id="learner-style">
              <option value="">请选择</option>
              <option value="视觉型">视觉型</option>
              <option value="听觉型">听觉型</option>
              <option value="实践型">实践型</option>
              <option value="理论型">理论型</option>
            </select>
          </div>

          <div class="form-group">
            <label>每周可投入时间 (小时)</label>
            <input type="number" class="form-input" id="learner-time" placeholder="例如: 10" min="1" max="40">
          </div>

          <div class="form-group">
            <label>学习目标</label>
            <textarea class="form-textarea" id="learner-goals" rows="4" placeholder="请描述您的学习目标..."></textarea>
          </div>

          <button class="btn btn-primary btn-large" id="btn-find-matches">
            🔍 查找匹配导师
          </button>
        </div>

        <div class="matches-results" id="matches-results" style="display: none;"></div>
      </div>
    `;

    this.attachMatchesForm();
  }

  attachMatchesForm() {
    const btnFindMatches = this.container.querySelector('#btn-find-matches');

    btnFindMatches.addEventListener('click', () => {
      const learnerProfile = this.collectLearnerProfile();

      if (!learnerProfile) {
        alert('请填写完整的学习档案');
        return;
      }

      const matches = MatchMentorMentee(learnerProfile);
      this.renderMatchesResults(matches);
    });
  }

  collectLearnerProfile() {
    const name = this.container.querySelector('#learner-name').value;
    const level = this.container.querySelector('#learner-level').value;
    const style = this.container.querySelector('#learner-style').value;
    const time = parseInt(this.container.querySelector('#learner-time').value);
    const goals = this.container.querySelector('#learner-goals').value;

    const interestsCheckboxes = this.container.querySelectorAll('#interests-group input:checked');
    const interests = Array.from(interestsCheckboxes).map(cb => cb.value);

    if (!name || !level || interests.length === 0 || !style || !time || !goals) {
      return null;
    }

    return {
      id: `learner_${Date.now()}`,
      name,
      currentLevel: level,
      interests,
      learningStyle: style,
      timeCommitment: time,
      goals: goals.split('\n').filter(g => g.trim()),
      background: []
    };
  }

  renderMatchesResults(matches) {
    const resultsContainer = this.container.querySelector('#matches-results');
    const formContainer = this.container.querySelector('#learner-profile-form');

    formContainer.style.display = 'none';
    resultsContainer.style.display = 'block';

    resultsContainer.innerHTML = `
      <div class="matches-header">
        <h3>为您找到 ${matches.suggestions.length} 位匹配导师</h3>
        <button class="btn btn-secondary" id="btn-back-to-form">← 修改档案</button>
      </div>

      <div class="matches-list">
        ${matches.suggestions.map((match, index) => `
          <div class="match-card">
            <div class="match-rank">
              <span class="rank-number">#${index + 1}</span>
              <span class="match-score">匹配度 ${match.score}%</span>
            </div>

            <div class="match-mentor">
              <div class="mentor-basic">
                <h4>${match.mentor.name}</h4>
                <p>${match.mentor.level} · ${match.mentor.expertise.join(", ")}</p>
              </div>

              <div class="match-breakdown">
                <h5>匹配分析:</h5>
                <div class="breakdown-bars">
                  ${Object.entries(match.breakdown).map(([key, value]) => `
                    <div class="breakdown-item">
                      <span class="breakdown-label">${this.getBreakdownLabel(key)}</span>
                      <div class="breakdown-bar">
                        <div class="breakdown-fill" style="width: ${value * 100}%"></div>
                      </div>
                      <span class="breakdown-value">${Math.round(value * 100)}%</span>
                    </div>
                  `).join('')}
                </div>
              </div>

              <div class="match-reasons">
                <h5>推荐理由:</h5>
                <ul>
                  ${match.reasons.map(reason => `<li>${reason}</li>`).join('')}
                </ul>
              </div>

              <div class="match-commitment">
                <p>预计每周学习: <strong>${match.estimatedWeeklyHours} 小时</strong></p>
              </div>

              <button class="btn btn-primary btn-apply-match" data-mentor-id="${match.mentor.id}">
                申请该导师
              </button>
            </div>
          </div>
        `).join('')}
      </div>
    `;

    // 返回按钮
    const btnBack = resultsContainer.querySelector('#btn-back-to-form');
    btnBack.addEventListener('click', () => {
      formContainer.style.display = 'block';
      resultsContainer.style.display = 'none';
    });
  }

  getBreakdownLabel(key) {
    const labels = {
      expertise: '专业契合',
      teachingStyle: '风格匹配',
      availability: '时间匹配',
      rating: '导师评分',
      levelMatch: '水平匹配'
    };
    return labels[key] || key;
  }

  // ============================================================================
  // 视图: 我的师徒关系
  // ============================================================================

  renderMyMentorshipsView(container) {
    // 示例: 假设当前用户ID
    const currentUserId = 'learner_001';

    container.innerHTML = `
      <div class="my-mentorships-view">
        <div class="view-header">
          <h2>我的师徒关系</h2>
        </div>

        <div class="mentorships-placeholder">
          <div class="placeholder-icon">📚</div>
          <p>您还没有建立师徒关系</p>
          <button class="btn btn-primary" onclick="window.mentorshipMarketplace.switchView('matches')">
            立即寻找导师
          </button>
        </div>
      </div>
    `;
  }

  // ============================================================================
  // 视图: 进度看板
  // ============================================================================

  renderDashboardView(container) {
    container.innerHTML = `
      <div class="dashboard-view">
        <div class="view-header">
          <h2>学习进度看板</h2>
        </div>

        <div class="dashboard-placeholder">
          <div class="placeholder-icon">📊</div>
          <p>建立师徒关系后,这里将显示您的学习进度</p>
        </div>
      </div>
    `;
  }

  // ============================================================================
  // 侧边栏: 统计信息
  // ============================================================================

  renderStats() {
    const stats = GetMentorshipStatistics();
    const statsWidget = this.container.querySelector('#stats-widget');

    statsWidget.innerHTML = `
      <h3>平台统计</h3>
      <div class="stat-item">
        <span class="stat-icon">👨‍🏫</span>
        <div class="stat-content">
          <span class="stat-value">${stats.totalMentors}</span>
          <span class="stat-label">位导师</span>
        </div>
      </div>
      <div class="stat-item">
        <span class="stat-icon">👨‍🎓</span>
        <div class="stat-content">
          <span class="stat-value">${stats.totalLearners}</span>
          <span class="stat-label">位学习者</span>
        </div>
      </div>
      <div class="stat-item">
        <span class="stat-icon">🤝</span>
        <div class="stat-content">
          <span class="stat-value">${stats.activeMentorships}</span>
          <span class="stat-label">活跃师徒</span>
        </div>
      </div>
      <div class="stat-item">
        <span class="stat-icon">⭐</span>
        <div class="stat-content">
          <span class="stat-value">${stats.averageRating}</span>
          <span class="stat-label">平均评分</span>
        </div>
      </div>

      <div class="popular-expertise">
        <h4>热门领域</h4>
        ${stats.popularExpertise.map(exp => `
          <div class="expertise-item">
            <span class="expertise-name">${exp.name}</span>
            <span class="expertise-count">${exp.count}</span>
          </div>
        `).join('')}
      </div>
    `;
  }

  // ============================================================================
  // 事件处理
  // ============================================================================

  attachEventListeners() {
    // 导航标签切换
    this.container.addEventListener('click', (e) => {
      if (e.target.closest('.nav-tab')) {
        const tab = e.target.closest('.nav-tab');
        const view = tab.dataset.view;
        this.switchView(view);
      }

      // 申请导师按钮
      if (e.target.classList.contains('btn-apply') ||
          e.target.classList.contains('btn-apply-match')) {
        const mentorId = e.target.dataset.mentorId;
        this.showApplicationModal(mentorId);
      }
    });
  }

  switchView(view) {
    this.currentView = view;

    // 更新导航标签激活状态
    this.container.querySelectorAll('.nav-tab').forEach(tab => {
      tab.classList.toggle('active', tab.dataset.view === view);
    });

    this.renderView(view);
  }

  showApplicationModal(mentorId) {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
      <div class="modal-content">
        <div class="modal-header">
          <h3>申请导师指导</h3>
          <button class="modal-close">×</button>
        </div>

        <div class="modal-body">
          <div class="form-group">
            <label>申请动机 (至少100字)</label>
            <textarea class="form-textarea" id="application-motivation" rows="8"
              placeholder="请详细说明:&#10;1. 为什么选择这位导师?&#10;2. 您的学习目标是什么?&#10;3. 您有哪些相关背景?&#10;4. 您能投入多少时间和精力?"></textarea>
          </div>

          <div class="form-tips">
            <strong>提示:</strong> 详细的申请动机能显著提高通过率
          </div>
        </div>

        <div class="modal-footer">
          <button class="btn btn-secondary modal-cancel">取消</button>
          <button class="btn btn-primary modal-submit" data-mentor-id="${mentorId}">提交申请</button>
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    // 关闭模态框
    const closeModal = () => modal.remove();
    modal.querySelector('.modal-close').addEventListener('click', closeModal);
    modal.querySelector('.modal-cancel').addEventListener('click', closeModal);
    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeModal();
    });

    // 提交申请
    modal.querySelector('.modal-submit').addEventListener('click', () => {
      const motivation = modal.querySelector('#application-motivation').value;

      if (motivation.length < 100) {
        alert('申请动机至少需要100字,请详细说明');
        return;
      }

      // 假设当前用户ID (实际应用中从登录状态获取)
      const learnerId = `learner_${Date.now()}`;

      const result = ApplyForMentorship(learnerId, mentorId, motivation);

      if (result.success) {
        alert(`申请已提交!\\n\\n质量评分: ${result.qualityScore}/100\\n${result.qualityFeedback.message}`);
        closeModal();
      } else {
        alert(`申请失败: ${result.reason}`);
      }
    });
  }
}

// ============================================================================
// 初始化
// ============================================================================

export function initMentorshipMarketplace(containerId = 'mentorship-marketplace') {
  window.mentorshipMarketplace = new MentorshipMarketplace(containerId);
  return window.mentorshipMarketplace;
}
