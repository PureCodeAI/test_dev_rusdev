import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import Icon from '@/components/ui/icon';
import { API_ENDPOINTS } from '@/config/api';
import { useToast } from '@/hooks/use-toast';

interface Role {
  id: number;
  name: string;
  display_name: string;
  description: string;
  is_system: boolean;
  users_count: number;
  permissions_count: number;
}

interface Permission {
  id: number;
  name: string;
  display_name: string;
  category: string;
  description: string;
  has_permission?: boolean;
}

export const RolesManagement = () => {
  const { toast } = useToast();
  const [roles, setRoles] = useState<Role[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [loading, setLoading] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newRole, setNewRole] = useState({ name: '', display_name: '', description: '' });

  const loadRoles = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(API_ENDPOINTS.roles);
      if (response.ok) {
        const data = await response.json();
        setRoles(data);
      }
    } catch (error) {
      toast({
        title: "Ошибка",
        description: "Не удалось загрузить роли",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const loadPermissions = useCallback(async (roleId: number) => {
    try {
      const response = await fetch(`${API_ENDPOINTS.permissions}?role_id=${roleId}`);
      if (response.ok) {
        const data = await response.json();
        setPermissions(data);
      }
    } catch (error) {
      toast({
        title: "Ошибка",
        description: "Не удалось загрузить права",
        variant: "destructive"
      });
    }
  }, [toast]);

  useEffect(() => {
    loadRoles();
  }, [loadRoles]);

  useEffect(() => {
    if (selectedRole) {
      loadPermissions(selectedRole.id);
    }
  }, [selectedRole, loadPermissions]);

  const handleCreateRole = async () => {
    if (!newRole.name || !newRole.display_name) {
      toast({
        title: "Ошибка",
        description: "Заполните все обязательные поля",
        variant: "destructive"
      });
      return;
    }

    try {
      const response = await fetch(API_ENDPOINTS.roles, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newRole)
      });

      if (response.ok) {
        toast({
          title: "Успешно",
          description: "Роль создана"
        });
        setShowCreateDialog(false);
        setNewRole({ name: '', display_name: '', description: '' });
        loadRoles();
      } else {
        const data = await response.json();
        throw new Error(data.error || 'Ошибка создания роли');
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Не удалось создать роль";
      toast({
        title: "Ошибка",
        description: errorMessage,
        variant: "destructive"
      });
    }
  };

  const handleTogglePermission = async (roleId: number, permissionId: number, hasPermission: boolean) => {
    try {
      const url = hasPermission
        ? `${API_ENDPOINTS.permissions}/assign?role_id=${roleId}&permission_id=${permissionId}`
        : `${API_ENDPOINTS.permissions}/assign?role_id=${roleId}&permission_id=${permissionId}`;
      
      const response = await fetch(url, {
        method: hasPermission ? 'DELETE' : 'POST',
        headers: { 'Content-Type': 'application/json' }
      });

      if (response.ok) {
        loadPermissions(roleId);
        toast({
          title: "Успешно",
          description: hasPermission ? "Право снято" : "Право назначено"
        });
      } else {
        throw new Error('Ошибка изменения прав');
      }
    } catch (error) {
      toast({
        title: "Ошибка",
        description: "Не удалось изменить права",
        variant: "destructive"
      });
    }
  };

  const handleDeleteRole = async (roleId: number) => {
    if (!confirm('Вы уверены, что хотите удалить эту роль?')) return;

    try {
      const response = await fetch(`${API_ENDPOINTS.roles}?id=${roleId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        toast({
          title: "Успешно",
          description: "Роль удалена"
        });
        if (selectedRole?.id === roleId) {
          setSelectedRole(null);
        }
        loadRoles();
      } else {
        const data = await response.json();
        throw new Error(data.error || 'Ошибка удаления роли');
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Не удалось удалить роль";
      toast({
        title: "Ошибка",
        description: errorMessage,
        variant: "destructive"
      });
    }
  };

  const groupedPermissions = permissions.reduce((acc, perm) => {
    if (!acc[perm.category]) {
      acc[perm.category] = [];
    }
    acc[perm.category].push(perm);
    return acc;
  }, {} as Record<string, Permission[]>);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Управление ролями</h2>
          <p className="text-gray-400">Создание и настройка ролей с правами доступа</p>
        </div>
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button>
              <Icon name="Plus" className="mr-2" size={16} />
              Создать роль
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-gray-800 border-gray-700">
            <DialogHeader>
              <DialogTitle className="text-white">Создать новую роль</DialogTitle>
              <DialogDescription className="text-gray-400">
                Создайте новую роль для управления доступом
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-white">Код роли (латиница)</Label>
                <Input
                  value={newRole.name}
                  onChange={(e) => setNewRole({ ...newRole, name: e.target.value })}
                  placeholder="moderator_new"
                  className="bg-gray-900 border-gray-700 text-white"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-white">Название</Label>
                <Input
                  value={newRole.display_name}
                  onChange={(e) => setNewRole({ ...newRole, display_name: e.target.value })}
                  placeholder="Новый модератор"
                  className="bg-gray-900 border-gray-700 text-white"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-white">Описание</Label>
                <Input
                  value={newRole.description}
                  onChange={(e) => setNewRole({ ...newRole, description: e.target.value })}
                  placeholder="Описание роли"
                  className="bg-gray-900 border-gray-700 text-white"
                />
              </div>
              <Button onClick={handleCreateRole} className="w-full">
                Создать
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Роли</CardTitle>
              <CardDescription className="text-gray-400">Выберите роль для настройки</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {loading ? (
                <div className="text-center py-8 text-gray-400">Загрузка...</div>
              ) : roles.length === 0 ? (
                <div className="text-center py-8 text-gray-400">Нет ролей</div>
              ) : (
                roles.map((role) => (
                  <div
                    key={role.id}
                    onClick={() => setSelectedRole(role)}
                    className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                      selectedRole?.id === role.id
                        ? 'border-primary bg-primary/10'
                        : 'border-gray-700 hover:bg-gray-700/50'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-white">{role.display_name}</h3>
                          {role.is_system && (
                            <Badge className="bg-blue-100 text-blue-700">Системная</Badge>
                          )}
                        </div>
                        <p className="text-sm text-gray-400 mb-2">{role.description}</p>
                        <div className="flex gap-4 text-xs text-gray-500">
                          <span>Пользователей: {role.users_count || 0}</span>
                          <span>Прав: {role.permissions_count || 0}</span>
                        </div>
                      </div>
                      {!role.is_system && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteRole(role.id);
                          }}
                          className="text-red-400 hover:text-red-300"
                        >
                          <Icon name="Trash2" size={16} />
                        </Button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2">
          {selectedRole ? (
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-white">{selectedRole.display_name}</CardTitle>
                    <CardDescription className="text-gray-400">
                      Настройка прав доступа для роли
                    </CardDescription>
                  </div>
                  {selectedRole.is_system && (
                    <Badge className="bg-blue-100 text-blue-700">Системная роль</Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {Object.entries(groupedPermissions).map(([category, perms]) => (
                    <div key={category}>
                      <h4 className="text-lg font-semibold text-white mb-3 capitalize">
                        {category === 'users' ? 'Пользователи' :
                         category === 'content' ? 'Контент' :
                         category === 'finance' ? 'Финансы' :
                         category === 'system' ? 'Система' :
                         category === 'analytics' ? 'Аналитика' :
                         category === 'projects' ? 'Проекты' :
                         category === 'exchange' ? 'Биржа' :
                         category === 'marketplace' ? 'Маркетплейс' : category}
                      </h4>
                      <div className="space-y-2">
                        {perms.map((permission) => (
                          <div
                            key={permission.id}
                            className="flex items-center justify-between p-3 border border-gray-700 rounded-lg hover:bg-gray-700/50 transition-colors"
                          >
                            <div className="flex-1">
                              <Label className="text-white font-medium cursor-pointer">
                                {permission.display_name}
                              </Label>
                              {permission.description && (
                                <p className="text-xs text-gray-400 mt-1">{permission.description}</p>
                              )}
                            </div>
                            <Switch
                              checked={permission.has_permission || false}
                              onCheckedChange={(checked) =>
                                handleTogglePermission(selectedRole.id, permission.id, !checked)
                              }
                              disabled={selectedRole.name === 'owner'}
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="bg-gray-800 border-gray-700">
              <CardContent className="p-12 text-center">
                <Icon name="Shield" size={48} className="mx-auto mb-4 text-gray-600" />
                <p className="text-gray-400">Выберите роль для настройки прав доступа</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

