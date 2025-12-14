// Хук для работы с правами доступа

import { useAuth } from '@/context/AuthContext';
import { FEATURE_PERMISSIONS } from '@/types/access';

export const usePermissions = () => {
  const { hasPermission, hasRole, isOwner, isAdmin, user } = useAuth();

  // Проверка доступа к функции
  const canAccessFeature = (feature: string): boolean => {
    if (!user) return false;
    
    // Владелец имеет доступ ко всему
    if (isOwner()) return true;
    
    // Проверяем право доступа к функции
    const permission = FEATURE_PERMISSIONS[feature];
    if (permission) {
      return hasPermission(permission);
    }
    
    return false;
  };

  // Проверка доступа к странице
  const canAccessPage = (_path: string): boolean => {
    if (!user) return false;
    
    // Владелец имеет доступ ко всему
    if (isOwner()) return true;
    
    // Проверяем через hasPermission (PAGE_PERMISSIONS проверяется в ProtectedRoute)
    return true; // Базовая проверка, детальная в ProtectedRoute
  };

  return {
    hasPermission,
    hasRole,
    isOwner,
    isAdmin,
    canAccessFeature,
    canAccessPage,
    user,
  };
};

