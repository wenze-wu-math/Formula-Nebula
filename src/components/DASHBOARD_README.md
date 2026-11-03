# User Dashboard Component

A comprehensive user dashboard system for Formula Nebula with real-time updates, data fetching, and responsive design.

## Overview

The User Dashboard consists of three main components:

1. **UserDashboard.js** - Main dashboard UI component
2. **dashboardService.js** - Data fetching and API integration service
3. **realtimeService.js** - WebSocket-based real-time updates service
4. **UserDashboard.css** - Complete styling with dark mode support

## Features

### 1. Components
- User information display (profile, tier, join date)
- Statistics grid (formulas, workspaces, collaborators, tutorials)
- Usage tracking (API calls, storage)
- Recent activity feed
- Favorite formulas gallery
- Active collaborations list
- Notifications panel

### 2. Data Fetching
- Asynchronous API integration with error handling
- Request timeout management
- Data caching with configurable expiry
- Parallel data loading for performance
- Fallback default values on API failures

### 3. Real-time Updates
- WebSocket connection management
- Automatic reconnection with exponential backoff
- Channel-based subscription system
- Heartbeat mechanism
- Message queuing for offline scenarios
- Event-based architecture

## Installation

1. Include the required JavaScript files:

```html
<script src="src/services/realtimeService.js"></script>
<script src="src/services/dashboardService.js"></script>
<script src="src/components/UserDashboard.js"></script>
```

2. Include the CSS stylesheet:

```html
<link rel="stylesheet" href="src/components/UserDashboard.css">
```

3. Create a container in your HTML:

```html
<div id="dashboard-container"></div>
```

## Quick Start

### Basic Usage

```javascript
const dashboard = new UserDashboard({
  container: document.getElementById('dashboard-container'),
  userId: 'user-123',
  onUpdate: (data) => {
    console.log('Dashboard updated:', data);
  }
});
```

### With Real-time Updates

```javascript
const dashboard = new UserDashboard({
  container: document.getElementById('dashboard-container'),
  userId: 'user-123'
});

// Listen for real-time connection status
dashboard.realtimeService.addEventListener('connected', () => {
  console.log('Connected to live updates');
});

dashboard.realtimeService.addEventListener('disconnected', () => {
  console.log('Disconnected from live updates');
});

// Subscribe to specific updates
dashboard.realtimeService.subscribe(`user:user-123`, (data) => {
  console.log('Real-time update:', data);
});
```

## API Reference

### UserDashboard Class

#### Constructor Options
```javascript
{
  container: HTMLElement,           // Required: DOM element for dashboard
  userId: string,                   // Required: User ID for data fetching
  onUpdate: Function                // Optional: Callback when dashboard updates
}
```

#### Methods

- `loadDashboardData()` - Fetch fresh dashboard data from server
- `render()` - Render dashboard UI
- `destroy()` - Clean up and remove dashboard
- `updateUI()` - Update specific UI elements without full re-render

#### Properties

- `dashboardData` - Current dashboard data object
- `realtimeService` - WebSocket service instance
- `dataService` - API service instance

### DashboardDataService Class

#### Constructor Options
```javascript
{
  baseUrl: string,                  // API base URL (default: '/api')
  timeout: number,                  // Request timeout in ms (default: 30000)
  cacheExpiry: number              // Cache expiry in ms (default: 300000)
}
```

#### Methods

- `fetchDashboardData(userId)` - Fetch complete dashboard data
- `fetchUserInfo(userId)` - Get user profile information
- `fetchUserStats(userId)` - Get user statistics
- `fetchRecentActivity(userId, limit)` - Get recent activity
- `fetchFavoriteFormulas(userId, limit)` - Get favorite formulas
- `fetchCollaborations(userId, limit)` - Get active collaborations
- `fetchUsageData(userId)` - Get usage statistics
- `fetchNotifications(userId, limit)` - Get user notifications
- `dismissNotification(notificationId)` - Mark notification as read
- `clearNotifications(userId)` - Clear all notifications
- `recordActivity(userId, activityData)` - Record user activity
- `updateUserSettings(userId, settings)` - Update user settings
- `invalidateCache(key)` - Clear cache entries

### RealtimeService Class

#### Constructor Options
```javascript
{
  wsUrl: string,                    // WebSocket URL
  reconnectAttempts: number,        // Max reconnect attempts (default: 5)
  reconnectDelay: number,           // Initial reconnect delay (default: 3000)
  heartbeatInterval: number         // Heartbeat interval (default: 30000)
}
```

#### Methods

- `subscribe(channel, callback)` - Subscribe to channel updates
- `unsubscribe(channel, callback)` - Unsubscribe from channel
- `publish(channel, data)` - Publish message to channel
- `addEventListener(event, callback)` - Listen for service events
- `removeEventListener(event, callback)` - Remove event listener
- `getStatus()` - Get connection status
- `disconnect()` - Disconnect and clean up

#### Events

- `connected` - Connection established
- `disconnected` - Connection lost
- `reconnect_failed` - Max reconnection attempts reached
- `error` - Connection error occurred
- `message` - Generic message received

## Data Structure

### Dashboard Data Object
```javascript
{
  user: {
    name: string,
    email: string,
    avatar: string,
    joinDate: ISO8601 timestamp,
    tier: 'free' | 'pro' | 'premium'
  },
  stats: {
    totalFormulas: number,
    savedWorkspaces: number,
    collaborators: number,
    completedTutorials: number
  },
  recentActivity: Array<{
    id: string,
    type: string,
    title: string,
    description: string,
    timestamp: ISO8601 timestamp
  }>,
  favoriteFormulas: Array<{
    id: string,
    name: string,
    latex: string,
    category: string
  }>,
  collaborations: Array<{
    id: string,
    projectName: string,
    description: string,
    status: 'active' | 'pending' | 'inactive',
    members: Array<{
      id: string,
      name: string,
      avatar: string
    }>
  }>,
  usage: {
    apiCalls: number,
    storageUsed: number,
    lastUpdated: ISO8601 timestamp
  },
  notifications: Array<{
    id: string,
    title: string,
    message: string,
    type: 'info' | 'success' | 'warning' | 'error',
    timestamp: ISO8601 timestamp,
    read: boolean
  }>
}
```

## Real-time Message Format

### Incoming Messages
```javascript
{
  channel: string,
  data: {
    type: 'activity' | 'stats' | 'notification',
    payload: object
  }
}
```

### Subscription Messages
```javascript
{
  type: 'subscribe' | 'unsubscribe' | 'publish',
  channel: string,
  data?: object
}
```

## Styling

The dashboard uses CSS custom properties for theming:

```css
--bg-primary: primary background color
--bg-secondary: secondary background color
--text-primary: primary text color
--text-secondary: secondary text color
--border-color: border color
--accent-color: primary accent color
--accent-color-light: light accent color
```

### Dark Mode

Add `data-theme="dark"` to the HTML element to enable dark mode:

```html
<html data-theme="dark">
```

### Responsive Design

The dashboard is fully responsive:
- Desktop: Multi-column layouts with optimal spacing
- Tablet: 2-column grid for stats
- Mobile: Single-column layout with touch-optimized controls

## Examples

### Complete Setup
```javascript
// See dashboard-example.js for complete implementation
const { dashboard, syncManager } = setupCompleteUserDashboard();
```

### Recording Activities
```javascript
await dashboard.dataService.recordActivity(userId, {
  type: 'create',
  title: 'Formula saved',
  description: 'New formula: E=mc²',
  timestamp: new Date().toISOString()
});
```

### Handling Real-time Events
```javascript
dashboard.realtimeService.subscribe(`user:${userId}`, (data) => {
  if (data.type === 'notification') {
    showPushNotification(data.payload);
  }
});
```

### Custom Theme
```javascript
customizeDashboardTheme(dashboard, 'dark');
```

## Browser Compatibility

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers (iOS Safari 14+, Chrome Android 90+)

## Performance Considerations

1. **Data Caching**: Dashboard data is cached for 5 minutes by default
2. **Lazy Loading**: Images are lazy-loaded on viewport intersection
3. **Virtual Scrolling**: Long lists can use virtual scrolling (see example)
4. **Debounced Resize**: Responsive updates are debounced
5. **Request Timeouts**: API requests have 30-second timeout

## Security

- XSS Prevention: All user input is HTML-escaped
- CSRF Protection: Uses standard fetch with bearer token
- Session Management: Auth token from localStorage
- WebSocket Security: Uses WSS (WebSocket Secure) in production

## Error Handling

The dashboard handles errors gracefully:

- API failures return default empty values
- WebSocket disconnections trigger automatic reconnection
- Failed requests use exponential backoff
- All errors are logged to console for debugging

## Troubleshooting

### Dashboard Not Loading
- Check console for errors
- Verify user ID is valid
- Ensure API endpoint is correct
- Check network tab for failed requests

### Real-time Updates Not Working
- Verify WebSocket URL is correct
- Check browser console for connection errors
- Ensure WebSocket is not blocked by firewall
- Check server-side WebSocket implementation

### Performance Issues
- Enable browser caching
- Reduce number of notifications displayed
- Implement virtual scrolling for long lists
- Profile with browser DevTools

## Contributing

To extend the dashboard:

1. Create new sub-components in `/src/components/`
2. Add new data fetching methods to `DashboardDataService`
3. Add new WebSocket channels to `RealtimeService`
4. Update CSS in `UserDashboard.css`
5. Add examples to `dashboard-example.js`

## License

Part of the Formula Nebula project.
