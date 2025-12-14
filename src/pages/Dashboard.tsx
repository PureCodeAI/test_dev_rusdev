  const getProjectStatusText = (status: string) => {
    switch (status) {
      case 'preview': return 'Предпросмотр';
      case 'published': return 'Опубликован';
      case 'draft': return 'Черновик';
      case 'archived': return 'Архив';
      default: return status;
    }
  };

  const getProjectStatusColor = (status: string) => {
    switch (status) {
      case 'preview': return 'bg-blue-100 text-blue-800';
      case 'published': return 'bg-green-100 text-green-800';
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'archived': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleDuplicateProject = async (projectId: number) => {
    try {
      const project = activeProjects.find(p => p.id === projectId);
      if (!project) return;

      const projectData = {
        name: `${project.name} (копия)`,
        type: project.type,
        user_id: user?.id,
      };

      let newProjectId: number;
      let newProject: Project;

      try {
        const response = await fetch(`${API_ENDPOINTS.projects}/${projectId}/duplicate`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(projectData)
        });

        const data = await response.json();
        
        if (response.ok) {
          newProjectId = data.project.id;
          newProject = {
            ...data.project,
            status: 'draft' as const
          };
        } else {
          throw new Error(data.error || 'API error');
        }
      } catch (apiError) {
        logger.warn('API error, creating local duplicate', { error: apiError instanceof Error ? apiError.message : String(apiError) });
        newProjectId = Date.now();
        newProject = {
          id: newProjectId,
          name: projectData.name,
          type: projectData.type,
          status: 'draft' as const,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
      }

      const localProjects = localStorage.getItem(`projects_${userId}`);
      const projects: Project[] = localProjects ? JSON.parse(localProjects) : [];
      projects.push(newProject);
      localStorage.setItem(`projects_${userId}`, JSON.stringify(projects));
      setActiveProjects(projects);
      loadStatsFromProjects(projects);

      toast({
        title: "Проект дублирован",
        description: `Проект "${project.name}" успешно скопирован`
      });
    } catch (error) {
      toast({
        title: "Ошибка",
        description: "Не удалось дублировать проект",
        variant: "destructive"
      });
    }
  };

  const handleArchiveProject = async (projectId: number) => {
    try {
      const project = activeProjects.find(p => p.id === projectId);
      if (!project) return;

      try {
        await fetch(`${API_ENDPOINTS.projects}/${projectId}/archive`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          }
        });
      } catch (apiError) {
        logger.warn('API error, archiving locally', { error: apiError instanceof Error ? apiError.message : String(apiError) });
      }

      const localProjects = localStorage.getItem(`projects_${userId}`);
      const projects: Project[] = localProjects ? JSON.parse(localProjects) : [];
      const updatedProjects = projects.map(p => 
        p.id === projectId ? { ...p, status: 'archived' as const } : p
      );
      localStorage.setItem(`projects_${userId}`, JSON.stringify(updatedProjects));
      setActiveProjects(updatedProjects.filter(p => p.status !== 'archived'));
      loadStatsFromProjects(updatedProjects);

      toast({
        title: "Проект архивирован",
        description: `Проект "${project.name}" перемещен в архив`
      });
    } catch (error) {
      toast({
        title: "Ошибка",
        description: "Не удалось архивировать проект",
        variant: "destructive"
      });
    }
  };

  const handleDeleteProject = async (projectId: number) => {
    try {
      const project = activeProjects.find(p => p.id === projectId);
      if (!project) return;

      try {
        await fetch(`${API_ENDPOINTS.projects}/${projectId}`, {
          method: 'DELETE'
        });
      } catch (apiError) {
        logger.warn('API error, deleting locally', { error: apiError instanceof Error ? apiError.message : String(apiError) });
      }

      const localProjects = localStorage.getItem(`projects_${userId}`);
      const projects: Project[] = localProjects ? JSON.parse(localProjects) : [];
      const updatedProjects = projects.filter(p => p.id !== projectId);
      localStorage.setItem(`projects_${userId}`, JSON.stringify(updatedProjects));
      setActiveProjects(updatedProjects);
      loadStatsFromProjects(updatedProjects);

      toast({
        title: "Проект удален",
        description: `Проект "${project.name}" успешно удален`
      });
    } catch (error) {
      toast({
        title: "Ошибка",
        description: "Не удалось удалить проект",
        variant: "destructive"
      });
    }
  };

  const handleRenameProject = async (projectId: number, newName: string) => {
    try {
      const project = activeProjects.find(p => p.id === projectId);
      if (!project) return;

      try {
        await fetch(`${API_ENDPOINTS.projects}/${projectId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ name: newName })
        });
      } catch (apiError) {
        logger.warn('API error, renaming locally', { error: apiError instanceof Error ? apiError.message : String(apiError) });
      }

      const localProjects = localStorage.getItem(`projects_${userId}`);
      const projects: Project[] = localProjects ? JSON.parse(localProjects) : [];
      const updatedProjects = projects.map(p => 
        p.id === projectId ? { ...p, name: newName, updated_at: new Date().toISOString() } : p
      );
      localStorage.setItem(`projects_${userId}`, JSON.stringify(updatedProjects));
      setActiveProjects(updatedProjects);
      loadStatsFromProjects(updatedProjects);

      toast({
        title: "Проект переименован",
        description: `Проект переименован в "${newName}"`
      });
    } catch (error) {
      toast({
        title: "Ошибка",
        description: "Не удалось переименовать проект",
        variant: "destructive"
      });
    }
  };
            onDuplicateProject={handleDuplicateProject}
            onArchiveProject={handleArchiveProject}
            onDeleteProject={handleDeleteProject}
            onRenameProject={handleRenameProject}