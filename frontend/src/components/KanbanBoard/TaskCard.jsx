import { useState } from "react";
import { Draggable } from "react-beautiful-dnd";
import TaskModal from "../Tasks/TaskModal";

const TaskCard = ({ task, index, onTaskUpdate, onTaskDelete }) => {
  const [showModal, setShowModal] = useState(false);

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800";
      case "medium":
        return "bg-yellow-100 text-yellow-800";
      case "low":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString();
  };

  return (
    <>
      <Draggable draggableId={task._id} index={index}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.draggableProps}
            {...provided.dragHandleProps}
            className={`bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer ${
              snapshot.isDragging ? "rotate-3 shadow-lg" : ""
            }`}
            onClick={() => setShowModal(true)}
          >
            <h4 className="font-medium text-gray-900 mb-2">{task.title}</h4>
            {task.description && (
              <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                {task.description}
              </p>
            )}

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                {task.priority && (
                  <span
                    className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(
                      task.priority
                    )}`}
                  >
                    {task.priority}
                  </span>
                )}
              </div>

              {task.dueDate && (
                <span className="text-xs text-gray-500">
                  {formatDate(task.dueDate)}
                </span>
              )}
            </div>

            {task.assignedTo && (
              <div className="mt-2 flex items-center">
                <div className="w-6 h-6 bg-indigo-500 rounded-full flex items-center justify-center">
                  <span className="text-xs text-white font-medium">
                    {task.assignedTo.name?.charAt(0).toUpperCase()}
                  </span>
                </div>
                <span className="ml-2 text-sm text-gray-600">
                  {task.assignedTo.name}
                </span>
              </div>
            )}
          </div>
        )}
      </Draggable>

      {showModal && (
        <TaskModal
          task={task}
          onClose={() => setShowModal(false)}
          onTaskUpdate={onTaskUpdate}
          onTaskDelete={onTaskDelete}
        />
      )}
    </>
  );
};

export default TaskCard;
