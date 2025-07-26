import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { DragDropContext } from "react-beautiful-dnd";
import Column from "./Column";
import CreateTask from "../Tasks/CreateTask";
import api from "../../services/api";
import toast from "react-hot-toast";

const KanbanBoard = () => {
  const { projectId } = useParams();
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [showCreateTask, setShowCreateTask] = useState(false);
  const [loading, setLoading] = useState(true);

  const columns = {
    todo: { id: "todo", title: "To Do", color: "bg-gray-100" },
    inprogress: {
      id: "inprogress",
      title: "In Progress",
      color: "bg-blue-100",
    },
    done: { id: "done", title: "Done", color: "bg-green-100" },
  };

  useEffect(() => {
    fetchProjectData();
  }, [projectId]);

  const fetchProjectData = async () => {
    try {
      const [projectRes, tasksRes] = await Promise.all([
        api.get(`/projects/${projectId}`),
        api.get(`/tasks/project/${projectId}`),
      ]);
      setProject(projectRes.data);
      setTasks(tasksRes.data);
    } catch (error) {
      toast.error("Failed to fetch project data");
    } finally {
      setLoading(false);
    }
  };

  const onDragEnd = async (result) => {
    if (!result.destination) return;

    const { source, destination, draggableId } = result;

    if (source.droppableId === destination.droppableId) return;

    try {
      await api.put(`/tasks/${draggableId}`, {
        status: destination.droppableId,
      });

      const updatedTasks = tasks.map((task) =>
        task._id === draggableId
          ? { ...task, status: destination.droppableId }
          : task
      );
      setTasks(updatedTasks);
      toast.success("Task moved successfully!");
    } catch (error) {
      toast.error("Failed to move task");
    }
  };

  const handleTaskCreated = (newTask) => {
    setTasks([...tasks, newTask]);
    setShowCreateTask(false);
  };

  const handleTaskUpdate = (updatedTask) => {
    setTasks(
      tasks.map((task) => (task._id === updatedTask._id ? updatedTask : task))
    );
  };

  const handleTaskDelete = (taskId) => {
    setTasks(tasks.filter((task) => task._id !== taskId));
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <div className="px-4 py-6 sm:px-0">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {project?.title}
            </h1>
            <p className="text-gray-600 mt-1">{project?.description}</p>
          </div>
          <button
            onClick={() => setShowCreateTask(true)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm font-medium"
          >
            Add Task
          </button>
        </div>

        <DragDropContext onDragEnd={onDragEnd}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {Object.values(columns).map((column) => (
              <Column
                key={column.id}
                column={column}
                tasks={tasks.filter((task) => task.status === column.id)}
                onTaskUpdate={handleTaskUpdate}
                onTaskDelete={handleTaskDelete}
              />
            ))}
          </div>
        </DragDropContext>

        {showCreateTask && (
          <CreateTask
            projectId={projectId}
            onTaskCreated={handleTaskCreated}
            onClose={() => setShowCreateTask(false)}
          />
        )}
      </div>
    </div>
  );
};

export default KanbanBoard;
