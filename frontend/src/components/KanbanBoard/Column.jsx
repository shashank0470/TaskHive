import { Droppable } from "react-beautiful-dnd";
import TaskCard from "./TaskCard";

const Column = ({ column, tasks, onTaskUpdate, onTaskDelete }) => {
  return (
    <div className={`${column.color} p-4 rounded-lg`}>
      <h3 className="font-semibold text-gray-800 mb-4">
        {column.title} ({tasks.length})
      </h3>

      <Droppable droppableId={column.id}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={`min-h-[200px] space-y-3 ${
              snapshot.isDraggingOver ? "bg-gray-200" : ""
            }`}
          >
            {tasks.map((task, index) => (
              <TaskCard
                key={task._id}
                task={task}
                index={index}
                onTaskUpdate={onTaskUpdate}
                onTaskDelete={onTaskDelete}
              />
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </div>
  );
};

export default Column;
