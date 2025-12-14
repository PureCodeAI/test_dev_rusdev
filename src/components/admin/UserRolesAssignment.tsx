import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Icon from '@/components/ui/icon';
import { API_ENDPOINTS } from '@/config/api';
import { useToast } from '@/hooks/use-toast';

interface User {
  id: number;
  full_name: string;
  email: string;
  user_type: string;
}

interface Role {
  id: number;
  name: string;
  display_name: string;
  description: string;
  is_system: boolean;
}

interface UserRole {
  id: number;
  name: string;
  display_name: string;
  assigned_at: string;
}

interface UserRolesAssignmentProps {
  user?: User | null;
  onUpdate?: () => void;
}

export const UserRolesAssignment = ({ user: propUser, onUpdate }: UserRolesAssignmentProps = {}) => {
  const [selectedUser] = useState<User | null>(propUser || null);
  const { toast } = useToast();
  const [allRoles, setAllRoles] = useState<Role[]>([]);
  const [userRoles, setUserRoles] = useState<UserRole[]>([]);
  const [loading, setLoading] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const [selectedRoleId, setSelectedRoleId] = useState<string>('');

  const loadRoles = useCallback(async () => {
    try {
      const response = await fetch(API_ENDPOINTS.roles);
      if (response.ok) {
        const data = await response.json();
        setAllRoles(data);
      }
    } catch (error) {
      toast({
        title: "Ошибка",
        description: "Не удалось загрузить роли",
        variant: "destructive"
      });
    }
  }, [toast]);

  const loadUserRoles = useCallback(async () => {
    if (!selectedUser?.id) return;
    try {
      setLoading(true);
      const response = await fetch(`${API_ENDPOINTS.roles}?user_id=${selectedUser.id}`);
      if (response.ok) {
        const data = await response.json();
        setUserRoles(data);
      }
    } catch (error) {
      toast({
        title: "Ошибка",
        description: "Не удалось загрузить роли пользователя",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [selectedUser?.id, toast]);

  useEffect(() => {
    if (showDialog && selectedUser) {
      loadRoles();
      loadUserRoles();
    }
  }, [showDialog, selectedUser, loadRoles, loadUserRoles]);

  const handleAssignRole = async () => {
    if (!selectedRoleId || !selectedUser) {
      toast({
        title: "Ошибка",
        description: "Выберите роль и пользователя",
        variant: "destructive"
      });
      return;
    }

    const currentUserId = localStorage.getItem('userId');
    if (!currentUserId) {
      toast({
        title: "Ошибка",
        description: "Необходима авторизация",
        variant: "destructive"
      });
      return;
    }

    try {
      const response = await fetch(`${API_ENDPOINTS.roles}/assign`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: selectedUser.id,
          role_id: parseInt(selectedRoleId),
          assigned_by: parseInt(currentUserId)
        })
      });

      if (response.ok) {
        toast({
          title: "Успешно",
          description: "Роль назначена"
        });
        setSelectedRoleId('');
        loadUserRoles();
        if (onUpdate) onUpdate();
      } else {
        const data = await response.json();
        throw new Error(data.error || 'Ошибка назначения роли');
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Не удалось назначить роль";
      toast({
        title: "Ошибка",
        description: errorMessage,
        variant: "destructive"
      });
    }
  };

  const handleRemoveRole = async (roleId: number) => {
    if (!selectedUser) return;
    if (!confirm('Вы уверены, что хотите снять эту роль?')) return;

    try {
      const response = await fetch(
        `${API_ENDPOINTS.roles}/assign?user_id=${selectedUser.id}&role_id=${roleId}`,
        { method: 'DELETE' }
      );

      if (response.ok) {
        toast({
          title: "Успешно",
          description: "Роль снята"
        });
        loadUserRoles();
        if (onUpdate) onUpdate();
      } else {
        const data = await response.json();
        throw new Error(data.error || 'Ошибка снятия роли');
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Не удалось снять роль";
      toast({
        title: "Ошибка",
        description: errorMessage,
        variant: "destructive"
      });
    }
  };

  const availableRoles = allRoles.filter(
    role => !userRoles.some(ur => ur.id === role.id)
  );

  if (!selectedUser) {
    return (
      <Card className="bg-gray-800 border-gray-700">
        <CardContent className="p-6">
          <p className="text-gray-400 text-center">Выберите пользователя для управления ролями</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Dialog open={showDialog} onOpenChange={setShowDialog}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline">
          <Icon name="UserCog" className="mr-2" size={14} />
          Роли
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-gray-800 border-gray-700 max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-white">Управление ролями: {selectedUser.full_name}</DialogTitle>
          <DialogDescription className="text-gray-400">
            Назначение и снятие ролей для пользователя
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <h4 className="text-white font-semibold mb-3">Текущие роли</h4>
            {loading ? (
              <div className="text-center py-4 text-gray-400">Загрузка...</div>
            ) : userRoles.length === 0 ? (
              <div className="text-center py-4 text-gray-400 border border-gray-700 rounded-lg">
                Роли не назначены
              </div>
            ) : (
              <div className="space-y-2">
                {userRoles.map((role) => (
                  <div
                    key={role.id}
                    className="flex items-center justify-between p-3 border border-gray-700 rounded-lg"
                  >
                    <div>
                      <Badge className="bg-primary text-white mr-2">{role.display_name}</Badge>
                      <span className="text-sm text-gray-400">
                        Назначена: {new Date(role.assigned_at).toLocaleDateString('ru-RU')}
                      </span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveRole(role.id)}
                      className="text-red-400 hover:text-red-300"
                    >
                      <Icon name="X" size={14} />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div>
            <h4 className="text-white font-semibold mb-3">Назначить роль</h4>
            <div className="flex gap-2">
              <Select value={selectedRoleId} onValueChange={setSelectedRoleId}>
                <SelectTrigger className="flex-1 bg-gray-900 border-gray-700 text-white">
                  <SelectValue placeholder="Выберите роль" />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-700">
                  {availableRoles.map((role) => (
                    <SelectItem
                      key={role.id}
                      value={role.id.toString()}
                      className="text-white focus:bg-gray-700"
                    >
                      {role.display_name}
                      {role.is_system && (
                        <Badge className="ml-2 bg-blue-100 text-blue-700">Системная</Badge>
                      )}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button onClick={handleAssignRole} disabled={!selectedRoleId}>
                <Icon name="Plus" className="mr-2" size={14} />
                Назначить
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

