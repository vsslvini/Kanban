
export interface Task {
  id: string;        
  title: string;
  description?: string; 
  status: 'A Fazer' | 'Em Progresso' | 'Concluídas';
  createdAt?: string; 
}

export const TASK_STATUSES: Task['status'][] = ['A Fazer', 'Em Progresso', 'Concluídas'];