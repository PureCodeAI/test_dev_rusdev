// Компонент для управления доступом пользователей и ролей

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Icon from '@/components/ui/icon';
import API_ENDPOINTS from '@/config/api';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/context/AuthContext';
import { logger } from '@/utils/logger';
import type { Role, Permission } from '@/types/access';
import { PERMISSION_CATEGORIES } from '@/types/access';

interface User {
  id: number;
  full_name: string;
  email: string;
  roles: Role[];
}

interface UserPermissionOverride {
  user_id: number;
  permission_id: number;
  granted: boolean;
}

export const AccessManagement = () => {
  const { toast } = useToast();
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [userOverrides, setUserOverrides] = useState<UserPermissionOverride[]>([]);
  const [userPermissions, setUserPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'users' | 'roles'>('users');

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      await Promise.all([
        loadUsers(),
        loadRoles(),
        loadPermissions(),
      ]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    if (selectedUser) {
      loadUserOverrides(selectedUser.id);
      loadUserPermissions(selectedUser.id);
    }
  }, [selectedUser]);

  const loadUsers = async () => {
    try {
      const response = await fetch(`${API_ENDPOINTS.blocks}?type=admin&action=get_users`);
      if (response.ok) {
        const data = await response.json();
        setUsers(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      logger.error('Error loading users', error instanceof Error ? error : new Error(String(error)));
    }
  };

  const loadRoles = async () => {
    try {
      const response = await fetch(API_ENDPOINTS.roles);
      if (response.ok) {
        const data = await response.json();
        setRoles(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      logger.error('Error loading roles', error instanceof Error ? error : new Error(String(error)));
    }
  };

  const loadPermissions = async () => {
    try {
      const response = await fetch(API_ENDPOINTS.permissions);
      if (response.ok) {
        const data = await response.json();
        setPermissions(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      logger.error('Error loading permissions', error instanceof Error ? error : new Error(String(error)));
    }
  };

  const loadUserOverrides = async (userId: number) => {
    try {
      const response = await fetch(`${API_ENDPOINTS.permissions}?user_id=${userId}&action=overrides`);
      if (response.ok) {
        const data = await response.json();
        setUserOverrides(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      logger.error('Error loading user overrides', error instanceof Error ? error : new Error(String(error)));
    }
  };

  const loadUserPermissions = async (userId: number) => {
    try {
      const response = await fetch(`${API_ENDPOINTS.permissions}?user_id=${userId}`);
      if (response.ok) {
        const data = await response.json();
        setUserPermissions(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      logger.error('Error loading user permissions', error instanceof Error ? error : new Error(String(error)));
    }
  };

  const toggleUserPermission = async (userId: number, permissionId: number, granted: boolean) => {
    try {
      const response = await fetch(`${API_ENDPOINTS.permissions}?action=user_override`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Id': String(currentUser?.id || ''),
        },
        body: JSON.stringify({
          user_id: userId,
          permission_id: permissionId,
          granted,
        }),
      });

      if (response.ok) {
        toast({
          title: 'Успешно',
          description: 'Доступ обновлен',
        });
        if (selectedUser) {
          await Promise.all([
            loadUserOverrides(selectedUser.id),
            loadUserPermissions(selectedUser.id),
          ]);
        }
      } else {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to update permission');
      }
    } catch (error) {
      logger.error('Error toggling user permission', error instanceof Error ? error : new Error(String(error)));
      toast({
        title: 'Ошибка',
        description: 'Не удалось обновить доступ',
        variant: 'destructive',
      });
    }
  };

  const toggleRolePermission = async (roleId: number, permissionId: number, granted: boolean) => {
    try {
      const endpoint = `${API_ENDPOINTS.permissions}/assign`;
      const method = granted ? 'POST' : 'DELETE';
      
      const response = await fetch(endpoint + (method === 'DELETE' ? `?role_id=${roleId}&permission_id=${permissionId}` : ''), {
        method,
        headers: {
          'Content-Type': 'application/json',
          'X-User-Id': String(currentUser?.id || ''),
        },
        ...(method === 'POST' ? {
          body: JSON.stringify({
            role_id: roleId,
            permission_id: permissionId,
          }),
        } : {}),
      });

      if (response.ok) {
        toast({
          title: 'Успешно',
          description: 'Доступ обновлен',
        });
        if (selectedRole) {
          loadRolePermissions(selectedRole.id);
        }
      } else {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to update permission');
      }
    } catch (error) {
      logger.error('Error toggling role permission', error instanceof Error ? error : new Error(String(error)));
      toast({
        title: 'Ошибка',
        description: error instanceof Error ? error.message : 'Не удалось обновить доступ',
        variant: 'destructive',
      });
    }
  };

  const loadRolePermissions = async (roleId: number) => {
    try {
      const response = await fetch(`${API_ENDPOINTS.permissions}?role_id=${roleId}`);
      if (response.ok) {
        const data = await response.json();
        // Обновляем permissions с информацией о правах роли
        setPermissions((prev) => 
          prev.map(p => {
            const hasPermission = data.some((rp: Permission) => rp.id === p.id && rp.has_permission);
            return { ...p, has_permission: hasPermission };
          })
        );
      }
    } catch (error) {
      logger.error('Error loading role permissions', error instanceof Error ? error : new Error(String(error)));
    }
  };

  const getPermissionGroups = () => {
    const groups: Record<string, Permission[]> = {};
    permissions.forEach(permission => {
      if (!groups[permission.category]) {
        groups[permission.category] = [];
      }
      groups[permission.category].push(permission);
    });
    return groups;
  };

  const isPermissionOverridden = (permissionId: number): boolean => {
    if (!selectedUser) return false;
    const override = userOverrides.find(o => o.permission_id === permissionId);
    return override !== undefined;
  };

  const getPermissionStatus = (permissionId: number): boolean | null => {
    if (!selectedUser) return null;
    
    // Сначала проверяем переопределения (они имеют приоритет)
    const override = userOverrides.find(o => o.permission_id === permissionId);
    if (override !== undefined) return override.granted;
    
    // Затем проверяем права через роли пользователя
    const userPermission = userPermissions.find(p => p.id === permissionId);
    if (userPermission) {
      return userPermission.has_permission === true;
    }
    
    return false;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Icon name="Loader2" className="animate-spin" size={24} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white">Управление доступом</h2>
        <p className="text-gray-400">Настройка прав доступа для пользователей и ролей</p>
      </div>

      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'users' | 'roles')}>
        <TabsList className="bg-gray-800">
          <TabsTrigger value="users">Доступ пользователей</TabsTrigger>
          <TabsTrigger value="roles">Доступ ролей</TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="space-y-4">
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Выберите пользователя</CardTitle>
              <CardDescription className="text-gray-400">
                Настройте индивидуальные права доступа для конкретного пользователя
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Select
                value={selectedUser?.id.toString() || ''}
                onValueChange={(value) => {
                  const user = users.find(u => u.id === Number(value));
                  setSelectedUser(user || null);
                }}
              >
                <SelectTrigger className="w-full bg-gray-700 border-gray-600 text-white">
                  <SelectValue placeholder="Выберите пользователя" />
                </SelectTrigger>
                <SelectContent className="bg-gray-700 text-white">
                  {users.map((u) => (
                    <SelectItem key={u.id} value={u.id.toString()}>
                      {u.full_name} ({u.email})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          {selectedUser && (
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">
                  Права доступа: {selectedUser.full_name}
                </CardTitle>
                <CardDescription className="text-gray-400">
                  Роли: {selectedUser.roles.map(r => r.display_name).join(', ')}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {Object.entries(getPermissionGroups()).map(([category, categoryPermissions]) => (
                  <div key={category} className="space-y-2">
                    <h3 className="text-lg font-semibold text-white">
                      {PERMISSION_CATEGORIES[category as keyof typeof PERMISSION_CATEGORIES] || category}
                    </h3>
                    <div className="space-y-2">
                      {categoryPermissions.map((permission) => {
                        const isOverridden = isPermissionOverridden(permission.id);
                        const status = getPermissionStatus(permission.id);
                        
                        return (
                          <div key={permission.id} className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <Label className="text-white">{permission.display_name}</Label>
                                {isOverridden && (
                                  <Badge variant="outline" className="text-xs">
                                    Переопределено
                                  </Badge>
                                )}
                              </div>
                              <p className="text-sm text-gray-400">{permission.description}</p>
                            </div>
                            <Switch
                              checked={status === true}
                              onCheckedChange={(checked) => {
                                toggleUserPermission(selectedUser.id, permission.id, checked);
                              }}
                            />
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="roles" className="space-y-4">
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Выберите роль</CardTitle>
              <CardDescription className="text-gray-400">
                Настройте права доступа для роли (применяется ко всем пользователям с этой ролью)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Select
                value={selectedRole?.id.toString() || ''}
                onValueChange={(value) => {
                  const role = roles.find(r => r.id === Number(value));
                  setSelectedRole(role || null);
                  if (role) {
                    loadRolePermissions(role.id);
                  }
                }}
              >
                <SelectTrigger className="w-full bg-gray-700 border-gray-600 text-white">
                  <SelectValue placeholder="Выберите роль" />
                </SelectTrigger>
                <SelectContent className="bg-gray-700 text-white">
                  {roles.map((r) => (
                    <SelectItem key={r.id} value={r.id.toString()}>
                      {r.display_name} {r.is_system && <Badge variant="outline">Системная</Badge>}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          {selectedRole && (
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">
                  Права доступа: {selectedRole.display_name}
                </CardTitle>
                <CardDescription className="text-gray-400">
                  {selectedRole.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {Object.entries(getPermissionGroups()).map(([category, categoryPermissions]) => (
                  <div key={category} className="space-y-2">
                    <h3 className="text-lg font-semibold text-white">
                      {PERMISSION_CATEGORIES[category as keyof typeof PERMISSION_CATEGORIES] || category}
                    </h3>
                    <div className="space-y-2">
                      {categoryPermissions.map((permission) => (
                        <div key={permission.id} className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
                          <div className="flex-1">
                            <Label className="text-white">{permission.display_name}</Label>
                            <p className="text-sm text-gray-400">{permission.description}</p>
                          </div>
                          <Switch
                            checked={permission.has_permission === true}
                            onCheckedChange={(checked) => {
                              toggleRolePermission(selectedRole.id, permission.id, checked);
                            }}
                            disabled={selectedRole.is_system && selectedRole.name === 'owner'}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

