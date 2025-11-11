import { useState, useEffect } from "react";
import "./App.css";
import type { Task } from "./types/task";
import { TASK_STATUSES } from "./types/task";
import api from "./services/api";
import { KanbanColumn } from "./components/KanbanColumn/KanbanColumn";
import { TaskCard } from "./components/TaskCard/TaskCard";
import {
  DndContext,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
} from "@dnd-kit/core";
import type { DragEndEvent, DragStartEvent } from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";
import { TaskModal } from "./components/TaskModal/TaskModal";

const columns = TASK_STATUSES;

function App() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await api.get<Task[]>("/tasks");
        setTasks(response.data || []);
      } catch (error) {
        setError("Falha ao carregar tarefas, verificar o backend.");
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchTasks();
  }, []);

  const handleAddTask = async (taskData: {
    titulo: string;
    descricao?: string;
    status: Task["status"];
  }) => {
    try {
      const response = await api.post<Task>("/tasks", taskData);
      setTasks((prevTasks) => [...prevTasks, response.data]);
    } catch (err) {
      console.error("Falha ao criar tarefa", err);
      throw new Error("Falha na API ao criar tarefa.");
    }
  };

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const activeId = active.id as number;
    const task = tasks.find((t) => t.id === activeId);
    if (task) {
      setActiveTask(task);
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    setActiveTask(null);

    const { active, over } = event;
    if (!over) return;
    const activeId = active.id as number;
    const activeTask = tasks.find((t) => t.id === activeId);
    if (!activeTask) return;
    const overId = over.id;

    let newStatus: Task["status"] | undefined = undefined;

    if (typeof overId === "string") {
      if (columns.includes(overId as any)) {
        newStatus = overId as Task["status"];
      }
    } else {
      const overTask = tasks.find((t) => t.id === overId);
      if (overTask) {
        newStatus = overTask.status;
      }
    }
    if (!newStatus || newStatus === activeTask.status) {
      if (typeof overId === "number") {
        const activeIndex = tasks.findIndex((t) => t.id === activeId);
        const overIndex = tasks.findIndex((t) => t.id === overId);

        if (
          activeIndex !== -1 &&
          overIndex !== -1 &&
          tasks[activeIndex].status === tasks[overIndex].status
        ) {
          setTasks((prevTasks) => {
            return arrayMove(prevTasks, activeIndex, overIndex);
          });
        }
      }
      return;
    }

    setTasks((prevTasks) => {
      return prevTasks.map((task) =>
        task.id === activeId ? { ...task, status: newStatus! } : task
      );
    });

    try {
      await api.put(`/tasks/${activeId}`, {
        ...activeTask,
        status: newStatus,
      });
    } catch (err) {
      console.error("Falha ao atualizar tarefa no backend", err);
      setError("Erro ao salvar a tarefa. Revertendo...");
      setTasks((prevTasks) => {
        return prevTasks.map((task) =>
          task.id === activeId
            ? { ...task, status: activeTask.status }
            : task
        );
      });
      setTimeout(() => setError(null), 3000);
    }
  };

  const todoTasks = tasks.filter((task) => task.status === "A Fazer");
  const inProgressTasks = tasks.filter(
    (task) => task.status === "Em Progresso"
  );
  const doneTasks = tasks.filter((task) => task.status === "Concluídas");

  if (loading) {
    return (
      <div className="app">
        <header className="app-header">
          <h1>Meu Kanban</h1>
        </header>
        <main>
          <p>Carregando tarefas...</p>
        </main>
      </div>
    );
  }
  if (error) {
    return (
      <div className="app">
        <header className="app-header">
          <h1>Meu Kanban</h1>
        </header>
        <main>
          <p className="error-message">{error}</p>
        </main>
      </div>
    );
  }

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="app">
        <header className="app-header">
          <h1>Meu Kanban</h1>
          <button
            className="add-task-button"
            onClick={() => setIsModalOpen(true)}
          ></button>
        </header>
        <main className="kanban-board">
          <KanbanColumn
            title={TASK_STATUSES[0]}
            tasks={todoTasks}
          />
          <KanbanColumn
            title={TASK_STATUSES[1]}
            tasks={inProgressTasks}
          />
          <KanbanColumn
            title={TASK_STATUSES[2]}
            tasks={doneTasks}
          />
        </main>
      </div>

      <DragOverlay>
        {activeTask ? <TaskCard task={activeTask} /> : null}
      </DragOverlay>
      <TaskModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAddTask={handleAddTask}
      />
    </DndContext>
  );
}

export default App;