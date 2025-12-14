// Компонент для защиты маршрутов

import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { PAGE_PERMISSIONS } from '@/types/access';
import { logger } from '@/utils/logger';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredPermission?: string;
  requiredRole?: string;
  requireAuth?: boolean;
}

export const ProtectedRoute = ({
  children,
  requiredPermission,
  requiredRole,
  requireAuth = true,
}: ProtectedRouteProps) => {
  const { user, roles, hasPermission, hasRole, isHydrating, isLoadingRoles, isLoadingPermissions } = useAuth();
  const location = useLocation();

  // Пока идёт гидратация пользователя из localStorage — ничего не рендерим, чтобы не редиректить
  if (isHydrating) {
    return null;
  }

  // Если требуется авторизация, но пользователь не авторизован
  if (requireAuth && !user) {
    logger.warn('Unauthorized access attempt', { 
      path: location.pathname,
      error: 'User not authenticated'
    });
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Ждём загрузки ролей/прав если пользователь авторизован
  // Важно: проверяем это ПОСЛЕ проверки авторизации, чтобы не блокировать неавторизованных
  if (user && (isLoadingRoles || isLoadingPermissions)) {
    return null; // можно вывести лоадер при необходимости
  }

  // Дополнительная проверка: если роли не загружены и не загружаются, но пользователь авторизован
  // Это может означать, что загрузка завершилась с ошибкой или еще не началась
  // Для owner разрешаем доступ даже если роли еще не загружены (owner имеет все права по умолчанию)
  const isOwnerRole = user && roles.some((r) => r?.name === 'owner');
  
  // Если требуется конкретная роль
  if (requiredRole && !isOwnerRole && !hasRole(requiredRole)) {
    logger.warn('Access denied: role required', { 
      path: location.pathname, 
      requiredRole,
      userRoles: user?.roles?.map(r => r.name) || [],
      error: 'Insufficient role'
    });
    return <Navigate to="/dashboard" replace />;
  }

  // Если требуется конкретное право
  // Owner имеет все права, поэтому пропускаем проверку для owner
  if (requiredPermission && !isOwnerRole && !hasPermission(requiredPermission)) {
    logger.warn('Access denied: permission required', { 
      path: location.pathname, 
      requiredPermission,
      error: 'Insufficient permission'
    });
    return <Navigate to="/dashboard" replace />;
  }

  // Проверяем право доступа к странице по маппингу
  // Сначала проверяем точное совпадение
  let pagePermission = PAGE_PERMISSIONS[location.pathname];
  
  // Если точного совпадения нет, проверяем паттерны с параметрами
  if (!pagePermission) {
    for (const [pattern, permission] of Object.entries(PAGE_PERMISSIONS)) {
      if (pattern.includes(':')) {
        // Заменяем :id и другие параметры на регулярное выражение
        const regexPattern = pattern.replace(/:[^/]+/g, '[^/]+');
        const regex = new RegExp(`^${regexPattern}$`);
        if (regex.test(location.pathname)) {
          pagePermission = permission;
          break;
        }
      }
    }
  }
  
  // Owner имеет все права, поэтому пропускаем проверку для owner
  if (pagePermission && !isOwnerRole && !hasPermission(pagePermission)) {
    logger.warn('Access denied: page permission required', { 
      path: location.pathname, 
      pagePermission,
      error: 'Insufficient page permission'
    });
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

