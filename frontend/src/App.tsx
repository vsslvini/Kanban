import { useState, useEffect } from 'react';
import './App.css'; 
import type { Task } from './types/task'; 


function App() {
  const [tasks, setTasks] = useState<Task[]>([]);

  useEffect(() => {
    console.log("App montado!");

    const mockTasks: Task[] = [
      { id: "1", title: "Configurar API", status: "Concluídas" },
      { id: "2", title: "Criar Frontend", status: "Em Progresso" },
      { id: "3", title: "Estilizar Colunas", status: "A Fazer" },
    ];
    setTasks(mockTasks);

  }, []); 

  return (
    <div className="app">
      <header className="app-header">
        <h1>Meu Kanban</h1>
      </header>
      
      <main className="kanban-board">
        {tasks.map(task => (
          <div key={task.id}>
            <p>{task.title} ({task.status})</p>
          </div>
        ))}
      </main>
    </div>
  );
}

export default App;