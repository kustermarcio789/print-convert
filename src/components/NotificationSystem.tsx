import { useState, useEffect, createContext, useContext } from 'react';
import { Bell, X, Check, AlertCircle, Info, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';

export type NotificationType = 'success' | 'error' | 'warning' | 'info';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface NotificationContextType {
  notifications: Notification[];
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => void;
  removeNotification: (id: string) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearAll: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within NotificationProvider');
  }
  return context;
}

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const addNotification = (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
    const newNotification: Notification = {
      ...notification,
      id: Math.random().toString(36).substr(2, 9),
      timestamp: new Date(),
      read: false
    };
    setNotifications((prev) => [newNotification, ...prev]);

    // Auto-remove após 5 segundos se não tiver ação
    if (!notification.action) {
      setTimeout(() => {
        removeNotification(newNotification.id);
      }, 5000);
    }
  };

  const removeNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const clearAll = () => {
    setNotifications([]);
  };

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        addNotification,
        removeNotification,
        markAsRead,
        markAllAsRead,
        clearAll
      }}
    >
      {children}
      <NotificationToasts />
    </NotificationContext.Provider>
  );
}

function NotificationToasts() {
  const { notifications, removeNotification } = useNotifications();
  const recentNotifications = notifications.slice(0, 3);

  return (
    <div className="fixed bottom-4 right-4 z-50 space-y-2 max-w-md">
      <AnimatePresence>
        {recentNotifications.map((notification) => (
          <NotificationToast
            key={notification.id}
            notification={notification}
            onClose={() => removeNotification(notification.id)}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}

function NotificationToast({
  notification,
  onClose
}: {
  notification: Notification;
  onClose: () => void;
}) {
  const icons = {
    success: CheckCircle,
    error: AlertCircle,
    warning: AlertCircle,
    info: Info
  };

  const colors = {
    success: 'bg-green-50 border-green-200 text-green-800',
    error: 'bg-red-50 border-red-200 text-red-800',
    warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
    info: 'bg-blue-50 border-blue-200 text-blue-800'
  };

  const Icon = icons[notification.type];

  return (
    <motion.div
      initial={{ opacity: 0, y: 50, scale: 0.3 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.5, transition: { duration: 0.2 } }}
      className={`${colors[notification.type]} border rounded-lg shadow-lg p-4 min-w-[320px]`}
    >
      <div className="flex items-start gap-3">
        <Icon className="w-5 h-5 flex-shrink-0 mt-0.5" />
        
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-sm mb-1">{notification.title}</h4>
          <p className="text-sm opacity-90">{notification.message}</p>
          
          {notification.action && (
            <Button
              size="sm"
              variant="ghost"
              className="mt-2 h-7 text-xs"
              onClick={() => {
                notification.action!.onClick();
                onClose();
              }}
            >
              {notification.action.label}
            </Button>
          )}
        </div>

        <button
          onClick={onClose}
          className="flex-shrink-0 opacity-70 hover:opacity-100 transition-opacity"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </motion.div>
  );
}

export function NotificationBell() {
  const { notifications, markAllAsRead, clearAll } = useNotifications();
  const [showPanel, setShowPanel] = useState(false);
  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setShowPanel(!showPanel)}
        className="relative"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </Button>

      {showPanel && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setShowPanel(false)}
          />
          <div className="absolute right-0 top-full mt-2 w-96 bg-white rounded-lg shadow-xl border z-50 max-h-[600px] overflow-hidden flex flex-col">
            <div className="p-4 border-b flex items-center justify-between">
              <h3 className="font-semibold">Notificações</h3>
              <div className="flex gap-2">
                {unreadCount > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={markAllAsRead}
                    className="text-xs"
                  >
                    Marcar todas como lidas
                  </Button>
                )}
                {notifications.length > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearAll}
                    className="text-xs"
                  >
                    Limpar tudo
                  </Button>
                )}
              </div>
            </div>

            <div className="overflow-y-auto flex-1">
              {notifications.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  <Bell className="w-12 h-12 mx-auto mb-2 opacity-20" />
                  <p>Nenhuma notificação</p>
                </div>
              ) : (
                <div className="divide-y">
                  {notifications.map((notification) => (
                    <NotificationItem
                      key={notification.id}
                      notification={notification}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function NotificationItem({ notification }: { notification: Notification }) {
  const { markAsRead, removeNotification } = useNotifications();

  const icons = {
    success: CheckCircle,
    error: AlertCircle,
    warning: AlertCircle,
    info: Info
  };

  const colors = {
    success: 'text-green-600',
    error: 'text-red-600',
    warning: 'text-yellow-600',
    info: 'text-blue-600'
  };

  const Icon = icons[notification.type];

  return (
    <div
      className={`p-4 hover:bg-gray-50 transition-colors ${
        !notification.read ? 'bg-blue-50/30' : ''
      }`}
    >
      <div className="flex items-start gap-3">
        <Icon className={`w-5 h-5 flex-shrink-0 mt-0.5 ${colors[notification.type]}`} />
        
        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-sm mb-1">{notification.title}</h4>
          <p className="text-sm text-gray-600 mb-1">{notification.message}</p>
          <p className="text-xs text-gray-400">
            {notification.timestamp.toLocaleString('pt-BR')}
          </p>
          
          {notification.action && (
            <Button
              size="sm"
              variant="outline"
              className="mt-2 h-7 text-xs"
              onClick={() => {
                notification.action!.onClick();
                markAsRead(notification.id);
              }}
            >
              {notification.action.label}
            </Button>
          )}
        </div>

        <div className="flex flex-col gap-1">
          {!notification.read && (
            <button
              onClick={() => markAsRead(notification.id)}
              className="text-blue-600 hover:text-blue-700"
              title="Marcar como lida"
            >
              <Check className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={() => removeNotification(notification.id)}
            className="text-gray-400 hover:text-gray-600"
            title="Remover"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
