'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  X,
  Wifi,
  WifiOff,
  CheckCircle,
  AlertTriangle,
  Info,
  AlertCircle,
  Vibrate
} from 'lucide-react';

type NotificationType = 'success' | 'error' | 'warning' | 'info';

interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message?: string;
  duration?: number;
  persistent?: boolean;
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface NotificationContextType {
  notifications: Notification[];
  addNotification: (notification: Omit<Notification, 'id'>) => void;
  removeNotification: (id: string) => void;
  clearAll: () => void;
}

const NotificationContext = React.createContext<NotificationContextType | null>(null);

export function useNotifications() {
  const context = React.useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
}

const getNotificationIcon = (type: NotificationType) => {
  switch (type) {
    case 'success':
      return <CheckCircle className="h-5 w-5 text-green-600" />;
    case 'error':
      return <AlertCircle className="h-5 w-5 text-red-600" />;
    case 'warning':
      return <AlertTriangle className="h-5 w-5 text-orange-600" />;
    case 'info':
    default:
      return <Info className="h-5 w-5 text-blue-600" />;
  }
};

const getNotificationStyles = (type: NotificationType) => {
  switch (type) {
    case 'success':
      return 'bg-green-50 border-green-200 text-green-800';
    case 'error':
      return 'bg-red-50 border-red-200 text-red-800';
    case 'warning':
      return 'bg-orange-50 border-orange-200 text-orange-800';
    case 'info':
    default:
      return 'bg-blue-50 border-blue-200 text-blue-800';
  }
};

function NotificationItem({
  notification,
  onRemove
}: {
  notification: Notification;
  onRemove: (id: string) => void;
}) {
  const [isVisible, setIsVisible] = React.useState(false);
  const [isRemoving, setIsRemoving] = React.useState(false);

  React.useEffect(() => {
    // Animate in
    const timer = setTimeout(() => setIsVisible(true), 10);
    return () => clearTimeout(timer);
  }, []);

  React.useEffect(() => {
    if (notification.duration && !notification.persistent) {
      const timer = setTimeout(() => {
        handleRemove();
      }, notification.duration);
      return () => clearTimeout(timer);
    }
  }, [notification.duration, notification.persistent]);

  const handleRemove = () => {
    setIsRemoving(true);
    setIsVisible(false);
    setTimeout(() => onRemove(notification.id), 300);
  };

  // Trigger haptic feedback on mobile
  React.useEffect(() => {
    if ('vibrate' in navigator && notification.type === 'error') {\n      navigator.vibrate(100);\n    }\n  }, [notification.type]);\n\n  return (\n    <div\n      className={cn(\n        'transform transition-all duration-300 ease-out',\n        isVisible && !isRemoving\n          ? 'translate-x-0 opacity-100 scale-100'\n          : 'translate-x-full opacity-0 scale-95'\n      )}\n    >\n      <div\n        className={cn(\n          'relative flex items-start gap-3 p-4 rounded-lg border shadow-lg backdrop-blur-sm',\n          'touch-manipulation',\n          getNotificationStyles(notification.type)\n        )}\n      >\n        <div className=\"flex-shrink-0\">\n          {getNotificationIcon(notification.type)}\n        </div>\n        <div className=\"flex-1 min-w-0\">\n          <p className=\"text-sm font-medium\">{notification.title}</p>\n          {notification.message && (\n            <p className=\"text-xs mt-1 opacity-90\">{notification.message}</p>\n          )}\n          {notification.action && (\n            <Button\n              variant=\"ghost\"\n              size=\"sm\"\n              onClick={notification.action.onClick}\n              className=\"mt-2 h-7 px-2 text-xs\"\n            >\n              {notification.action.label}\n            </Button>\n          )}\n        </div>\n        <Button\n          variant=\"ghost\"\n          size=\"icon\"\n          onClick={handleRemove}\n          className=\"h-6 w-6 flex-shrink-0 opacity-70 hover:opacity-100\"\n        >\n          <X className=\"h-4 w-4\" />\n        </Button>\n      </div>\n    </div>\n  );\n}\n\nfunction NotificationContainer() {\n  const { notifications, removeNotification } = useNotifications();\n\n  if (notifications.length === 0) return null;\n\n  return (\n    <div className=\"fixed top-4 right-4 z-50 space-y-2 w-80 max-w-[calc(100vw-2rem)]\">\n      {notifications.map((notification) => (\n        <NotificationItem\n          key={notification.id}\n          notification={notification}\n          onRemove={removeNotification}\n        />\n      ))}\n    </div>\n  );\n}\n\nexport function NotificationProvider({ children }: { children: React.ReactNode }) {\n  const [notifications, setNotifications] = React.useState<Notification[]>([]);\n\n  const addNotification = React.useCallback((notification: Omit<Notification, 'id'>) => {\n    const id = Math.random().toString(36).substr(2, 9);\n    const newNotification = {\n      id,\n      duration: 5000, // Default 5 seconds\n      ...notification,\n    };\n    \n    setNotifications(prev => [...prev, newNotification]);\n  }, []);\n\n  const removeNotification = React.useCallback((id: string) => {\n    setNotifications(prev => prev.filter(n => n.id !== id));\n  }, []);\n\n  const clearAll = React.useCallback(() => {\n    setNotifications([]);\n  }, []);\n\n  const value = React.useMemo(() => ({\n    notifications,\n    addNotification,\n    removeNotification,\n    clearAll,\n  }), [notifications, addNotification, removeNotification, clearAll]);\n\n  return (\n    <NotificationContext.Provider value={value}>\n      {children}\n      <NotificationContainer />\n    </NotificationContext.Provider>\n  );\n}\n\n// Connection Status Component\nexport function ConnectionStatus() {\n  const [isOnline, setIsOnline] = React.useState(true);\n  const [showStatus, setShowStatus] = React.useState(false);\n  const { addNotification } = useNotifications();\n\n  React.useEffect(() => {\n    const handleOnline = () => {\n      setIsOnline(true);\n      setShowStatus(true);\n      addNotification({\n        type: 'success',\n        title: 'Connection restored',\n        message: 'You are back online',\n        duration: 3000,\n      });\n      setTimeout(() => setShowStatus(false), 3000);\n    };\n\n    const handleOffline = () => {\n      setIsOnline(false);\n      setShowStatus(true);\n      addNotification({\n        type: 'warning',\n        title: 'Connection lost',\n        message: 'Some features may be limited',\n        persistent: true,\n      });\n    };\n\n    setIsOnline(navigator.onLine);\n    window.addEventListener('online', handleOnline);\n    window.addEventListener('offline', handleOffline);\n\n    return () => {\n      window.removeEventListener('online', handleOnline);\n      window.removeEventListener('offline', handleOffline);\n    };\n  }, [addNotification]);\n\n  if (!showStatus && isOnline) return null;\n\n  return (\n    <div className={cn(\n      'fixed top-16 left-4 right-4 z-40 p-3 rounded-lg shadow-lg',\n      'flex items-center gap-2 text-sm font-medium',\n      isOnline \n        ? 'bg-green-50 text-green-700 border border-green-200'\n        : 'bg-orange-50 text-orange-700 border border-orange-200'\n    )}>\n      {isOnline ? (\n        <Wifi className=\"h-4 w-4\" />\n      ) : (\n        <WifiOff className=\"h-4 w-4\" />\n      )}\n      <span>\n        {isOnline ? 'Back online' : 'You are offline'}\n      </span>\n      {!isOnline && (\n        <Badge variant=\"outline\" className=\"ml-auto text-xs\">\n          Limited functionality\n        </Badge>\n      )}\n    </div>\n  );\n}\n\n// Touch Feedback Component\nexport function TouchFeedback({\n  children,\n  className,\n  disabled = false,\n  ...props\n}: React.HTMLAttributes<HTMLDivElement> & {\n  disabled?: boolean;\n}) {\n  const [isPressed, setIsPressed] = React.useState(false);\n\n  const handleTouchStart = () => {\n    if (!disabled) {\n      setIsPressed(true);\n      // Haptic feedback\n      if ('vibrate' in navigator) {\n        navigator.vibrate(10);\n      }\n    }\n  };\n\n  const handleTouchEnd = () => {\n    if (!disabled) {\n      setIsPressed(false);\n    }\n  };\n\n  return (\n    <div\n      className={cn(\n        'transition-transform duration-100 touch-manipulation select-none',\n        isPressed && !disabled && 'scale-95',\n        disabled && 'opacity-50 pointer-events-none',\n        className\n      )}\n      onTouchStart={handleTouchStart}\n      onTouchEnd={handleTouchEnd}\n      onMouseDown={handleTouchStart}\n      onMouseUp={handleTouchEnd}\n      onMouseLeave={handleTouchEnd}\n      {...props}\n    >\n      {children}\n    </div>\n  );\n}