import { Project, ProjectExport, createProject } from '../types/project';

export function exportProject(project: Project): ProjectExport {
  return {
    version: '1.0',
    exportedAt: new Date().toISOString(),
    project: {
      name: project.name,
      description: project.description,
      settings: project.settings,
      elements: project.elements,
      notes: project.notes
    }
  };
}

export function downloadProject(project: Project) {
  const exportData = exportProject(project);
  const jsonString = JSON.stringify(exportData, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${project.name.replace(/[^a-z0-9]/gi, '_')}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function importProject(file: File): Promise<Project> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const exportData = JSON.parse(content) as ProjectExport;
        
        if (!validateExportData(exportData)) {
          reject(new Error('Invalid project file format'));
          return;
        }
        
        const newProject = createProjectFromExport(exportData);
        resolve(newProject);
      } catch (error) {
        reject(error instanceof Error ? error : new Error('Failed to import project'));
      }
    };
    
    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };
    
    reader.readAsText(file);
  });
}

function validateExportData(data: any): data is ProjectExport {
  if (!data || typeof data !== 'object') return false;
  if (data.version !== '1.0') return false;
  if (!data.exportedAt || typeof data.exportedAt !== 'string') return false;
  if (!data.project || typeof data.project !== 'object') return false;
  if (!data.project.name || typeof data.project.name !== 'string') return false;
  if (!Array.isArray(data.project.elements)) return false;
  if (!Array.isArray(data.project.notes)) return false;
  return true;
}

function createProjectFromExport(exportData: ProjectExport): Project {
  const now = new Date();
  const projectData = exportData.project;
  
  const elements = projectData.elements.map(el => ({
    ...el,
    id: `el-${el.id}-${now.getTime()}`,
    createdAt: now,
    updatedAt: now
  }));
  
  const notes = projectData.notes.map(note => ({
    ...note,
    id: `note-${note.id}-${now.getTime()}`,
    createdAt: now,
    updatedAt: now
  }));
  
  return {
    id: `project-${now.getTime()}`,
    name: projectData.name,
    description: projectData.description,
    createdAt: now,
    updatedAt: now,
    lastOpenedAt: now,
    isFavorite: false,
    isArchived: false,
    elements,
    notes,
    settings: projectData.settings,
    metadata: {
      wordCount: 0,
      characterCount: 0,
      elementCount: elements.length,
      lastEditSession: '',
      collaboratorCount: 0,
      version: 1,
      exportCount: 1,
      lastEditAt: now,
      createdAt: now
    }
  };
}