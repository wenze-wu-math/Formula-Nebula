# Settings Module - 个性化设置系统

Formula Nebula 的完整个性化设置系统，包括设置页面、存储机制和跨设备同步功能。

## 功能特性

### 1. 设置页面 (Settings Page)
完整的设置用户界面，包含：
- **外观设置**: 主题选择（浅色/深色/自动）、语言选择、字体大小、动画设置、紧凑模式
- **通知设置**: 邮件通知、推送通知、协作更新、周报、通知音效
- **偏好设置**: 自动保存、保存间隔、教程显示、默认视图
- **隐私与安全**: 个人资料可见性、分析分享、数据保留期限、双因素认证
- **无障碍**: 高对比度模式、减少动画、屏幕阅读器模式、焦点指示
- **快捷键**: 预定义快捷键显示和管理
- **数据管理**: 导出/导入设置、清除数据

### 2. 存储机制 (Storage)
灵活的存储系统：
- **本地存储**: 使用 localStorage 保存用户设置
- **缓存层**: 内存缓存以减少磁盘 I/O
- **合并策略**: 智能合并本地和远程设置
- **错误恢复**: 自动处理存储失败和恢复

### 3. 同步功能 (Synchronization)
跨设备设置同步：
- **自动同步**: 定时自动同步到服务器
- **手动同步**: 按需即时同步
- **冲突解决**: 使用深度合并策略处理冲突
- **离线支持**: 离线时本地保存，恢复连接时自动同步
- **认证支持**: 集成 Bearer token 认证

## 使用方法

### 基础使用

```javascript
import { initializeSettings } from './src/settings/index.js';

// 初始化设置管理器
const settingsManager = initializeSettings({
  container: document.getElementById('settings-container'),
  userId: 'user-123',
  syncEndpoint: 'https://api.example.com/settings',
  autoSync: true,
  onSave: (settings) => console.log('设置已保存', settings),
  onChange: (settings) => console.log('设置已更改', settings)
});

// 打开设置面板
settingsManager.open();

// 关闭设置面板
settingsManager.close();

// 获取当前设置
const currentSettings = settingsManager.getSettings();

// 保存设置
await settingsManager.saveSettings();
```

### 导出/导入设置

```javascript
// 导出设置为 JSON
settingsManager.exportSettings();

// 导入设置从 JSON 文件
settingsManager.importSettings(event);
```

### 独立存储操作

```javascript
import { SettingsStorage } from './src/settings/index.js';

const storage = new SettingsStorage({
  storageKey: 'my-app-settings',
  syncEndpoint: 'https://api.example.com/settings',
  userId: 'user-123',
  autoSync: true
});

// 加载本地设置
const localSettings = storage.loadLocal();

// 保存本地设置
storage.saveLocal(newSettings);

// 从服务器加载
const remoteSettings = await storage.loadRemote();

// 同步本地和远程
const syncedSettings = await storage.sync();

// 导出/导入
const json = storage.export();
storage.import(json);

// 清除
storage.clear();
```

### 注册设置变更监听

```javascript
// 监听语言变更
window.addEventListener('language-changed', (e) => {
  console.log('语言已更改为:', e.detail.language);
});

// 监听时区变更
window.addEventListener('timezone-changed', (e) => {
  console.log('时区已更改为:', e.detail.timezone);
});
```

## 设置结构

```javascript
{
  theme: 'auto',                    // 'light', 'dark', 'auto'
  language: 'en',                   // 语言代码
  timezone: 'auto',                 // 时区设置
  notifications: {
    email: true,                    // 邮件通知
    push: true,                     // 推送通知
    collaborationUpdates: true,    // 协作更新
    weeklyDigest: false,           // 周报
    sound: true                     // 通知音效
  },
  preferences: {
    autoSave: true,                // 自动保存
    autoSaveInterval: 30,          // 保存间隔（秒）
    showTutorials: true,           // 显示教程
    compactMode: false,            // 紧凑模式
    enableAnimations: true,        // 启用动画
    fontSize: 'medium',            // 字体大小
    defaultView: 'dashboard'       // 默认视图
  },
  privacy: {
    profileVisibility: 'private',  // 'private', 'friends', 'public'
    shareAnalytics: true,          // 分享分析数据
    dataRetention: '90days',       // 数据保留期限
    twoFactorAuth: false           // 双因素认证
  },
  accessibility: {
    highContrast: false,           // 高对比度
    reduceMotion: false,           // 减少动画
    fontSize: 'normal',            // 无障碍字体
    screenReaderMode: false,       // 屏幕阅读器模式
    focusIndicator: true           // 焦点指示
  },
  shortcuts: {
    searchFocus: 'Ctrl+K',        // 搜索焦点快捷键
    toggleSettings: 'Ctrl+,',     // 打开设置快捷键
    toggleTheme: 'Ctrl+Shift+L'   // 切换主题快捷键
  }
}
```

## API 参考

### SettingsManager 类

#### 构造函数

```javascript
new SettingsManager(options)
```

**选项**:
- `container` (HTMLElement): 设置面板容器
- `userId` (string): 用户 ID
- `syncEndpoint` (string): 服务器端同步端点
- `autoSync` (boolean): 是否启用自动同步，默认 true
- `onSave` (function): 保存时的回调函数
- `onChange` (function): 设置更改时的回调函数

#### 方法

- `init()`: 初始化设置管理器
- `loadSettings()`: 从存储加载设置
- `saveSettings()`: 保存设置
- `applySettings()`: 应用设置到 UI
- `getSettings()`: 获取当前设置副本
- `exportSettings()`: 导出设置为 JSON 文件
- `importSettings(event)`: 从 JSON 文件导入设置
- `open()`: 打开设置面板
- `close()`: 关闭设置面板
- `resetToDefaults()`: 恢复所有设置为默认值
- `destroy()`: 销毁管理器并清理资源

### SettingsStorage 类

#### 构造函数

```javascript
new SettingsStorage(options)
```

**选项**:
- `storageKey` (string): localStorage 键名
- `syncEndpoint` (string): 服务器端同步端点
- `userId` (string): 用户 ID
- `autoSync` (boolean): 是否启用自动同步

#### 方法

- `loadLocal()`: 从本地存储加载设置
- `saveLocal(settings)`: 保存设置到本地存储
- `loadRemote()`: 从服务器加载设置
- `saveRemote(settings)`: 保存设置到服务器
- `sync()`: 同步本地和远程设置
- `mergeSettings(local, remote)`: 合并本地和远程设置
- `startAutoSync()`: 启动自动同步
- `stopAutoSync()`: 停止自动同步
- `syncToServer()`: 立即同步到服务器
- `export()`: 导出设置为 JSON 字符串
- `import(settingsJSON)`: 从 JSON 字符串导入设置
- `clear()`: 清除所有设置
- `destroy()`: 销毁并清理资源

## 服务器端集成

### 必需的端点

#### GET /user/{userId}/settings
获取用户设置

**响应**:
```json
{
  "theme": "auto",
  "language": "en",
  ...
}
```

#### POST /user/{userId}/settings
保存用户设置

**请求体**:
```json
{
  "settings": {...},
  "clientTimestamp": 1234567890,
  "version": 1
}
```

**响应**:
```json
{
  "success": true,
  "timestamp": 1234567890
}
```

### 认证

所有请求都需要在 `Authorization` 头中提供 Bearer token:

```
Authorization: Bearer <your-token>
```

## 样式自定义

### CSS 变量

所有主要样式都使用 CSS 变量定义，可以通过覆盖这些变量来自定义外观：

```css
:root {
  --primary-color: #6366f1;
  --secondary-color: #8b5cf6;
  --accent-color: #ec4899;
  --dark-bg: #0f172a;
  --light-bg: #f8fafc;
  --text-dark: #1e293b;
  --text-light: #94a3b8;
  --border-color: #e2e8f0;
  --transition-duration: 0.3s;
}
```

## 无障碍特性

- ✅ 完整的键盘导航支持
- ✅ ARIA 标签和角色
- ✅ 高对比度模式
- ✅ 屏幕阅读器优化
- ✅ 焦点指示器
- ✅ 减少动画选项
- ✅ 语义化 HTML

## 响应式设计

设置面板在所有设备上都能正常工作：
- 桌面（800px+）：侧边栏 + 主内容区域
- 平板电脑（768px）：水平选项卡导航
- 手机（480px）：垂直堆叠布局

## 性能优化

- 本地缓存以减少服务器请求
- 智能批处理同步操作
- 防止并发同步
- 延迟加载设置面板
- 内存高效的深度合并算法

## 最佳实践

1. **始终提供 userId 和 syncEndpoint** 以启用跨设备同步
2. **实现适当的错误处理** 用于服务器同步操作
3. **定期测试导出/导入** 功能以确保数据完整性
4. **提供用户反馈** 通过通知系统
5. **遵守无障碍标准** 并对用户进行测试

## 浏览器兼容性

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- 移动浏览器（iOS Safari 14+，Chrome Android）

## 许可证

MIT License - 查看 LICENSE 文件获取详细信息

## 支持

如有问题或建议，请在项目仓库中提交 Issue 或 Pull Request。
