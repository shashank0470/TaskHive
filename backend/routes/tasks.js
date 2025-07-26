const express = require("express");
const { body, validationResult } = require("express-validator");
const Task = require("../models/Task");
const Project = require("../models/Project");
const Team = require("../models/Team");
const auth = require("../middleware/auth");
const { checkProjectAccess } = require("../middleware/roleAuth");

const router = express.Router();

// Get tasks for a project
router.get(
  "/project/:projectId",
  auth,
  checkProjectAccess,
  async (req, res) => {
    try {
      const tasks = await Task.find({ projectId: req.params.projectId })
        .populate("assignedTo", "name email")
        .populate("createdBy", "name email")
        .sort({ createdAt: -1 });

      res.json(tasks);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  }
);

// Create task
router.post(
  "/",
  auth,
  [
    body("title")
      .trim()
      .isLength({ min: 2 })
      .withMessage("Title must be at least 2 characters"),
    body("projectId").isMongoId().withMessage("Valid project ID is required"),
    body("status")
      .optional()
      .isIn(["todo", "inprogress", "done"])
      .withMessage("Invalid status"),
    body("priority")
      .optional()
      .isIn(["low", "medium", "high"])
      .withMessage("Invalid priority"),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ message: errors.array()[0].msg });
      }

      const {
        title,
        description,
        status,
        priority,
        assignedTo,
        projectId,
        dueDate,
      } = req.body;

      // Check project access
      const project = await Project.findById(projectId).populate("teamId");
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }

      const team = project.teamId;
      const isMember =
        team.members.includes(req.user._id) ||
        team.createdBy.equals(req.user._id);

      if (!isMember) {
        return res
          .status(403)
          .json({ message: "Access denied. Not a team member." });
      }

      // Validate assignedTo user is team member
      if (assignedTo) {
        const isAssigneeTeamMember =
          team.members.includes(assignedTo) ||
          team.createdBy.equals(assignedTo);
        if (!isAssigneeTeamMember) {
          return res
            .status(400)
            .json({ message: "Cannot assign task to non-team member" });
        }
      }

      const task = new Task({
        title,
        description,
        status: status || "todo",
        priority: priority || "medium",
        assignedTo: assignedTo || null,
        projectId,
        dueDate: dueDate || null,
        createdBy: req.user._id,
      });

      await task.save();
      await task.populate("assignedTo", "name email");
      await task.populate("createdBy", "name email");

      res.status(201).json(task);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  }
);

// Get task by ID
router.get("/:taskId", auth, async (req, res) => {
  try {
    const task = await Task.findById(req.params.taskId)
      .populate("assignedTo", "name email")
      .populate("createdBy", "name email")
      .populate("projectId", "title");

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    // Check access through project
    const project = await Project.findById(task.projectId).populate("teamId");
    const team = project.teamId;
    const isMember =
      team.members.includes(req.user._id) ||
      team.createdBy.equals(req.user._id);

    if (!isMember) {
      return res
        .status(403)
        .json({ message: "Access denied. Not a team member." });
    }

    res.json(task);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// Update task
router.put(
  "/:taskId",
  auth,
  [
    body("title")
      .optional()
      .trim()
      .isLength({ min: 2 })
      .withMessage("Title must be at least 2 characters"),
    body("status")
      .optional()
      .isIn(["todo", "inprogress", "done"])
      .withMessage("Invalid status"),
    body("priority")
      .optional()
      .isIn(["low", "medium", "high"])
      .withMessage("Invalid priority"),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ message: errors.array()[0].msg });
      }

      const task = await Task.findById(req.params.taskId);
      if (!task) {
        return res.status(404).json({ message: "Task not found" });
      }

      // Check access through project
      const project = await Project.findById(task.projectId).populate("teamId");
      const team = project.teamId;
      const isMember =
        team.members.includes(req.user._id) ||
        team.createdBy.equals(req.user._id);

      if (!isMember) {
        return res
          .status(403)
          .json({ message: "Access denied. Not a team member." });
      }

      const { title, description, status, priority, assignedTo, dueDate } =
        req.body;

      // Validate assignedTo user is team member
      if (assignedTo) {
        const isAssigneeTeamMember =
          team.members.includes(assignedTo) ||
          team.createdBy.equals(assignedTo);
        if (!isAssigneeTeamMember) {
          return res
            .status(400)
            .json({ message: "Cannot assign task to non-team member" });
        }
      }

      // Update fields
      if (title) task.title = title;
      if (description !== undefined) task.description = description;
      if (status) task.status = status;
      if (priority) task.priority = priority;
      if (assignedTo !== undefined) task.assignedTo = assignedTo || null;
      if (dueDate !== undefined) task.dueDate = dueDate || null;

      await task.save();
      await task.populate("assignedTo", "name email");
      await task.populate("createdBy", "name email");

      res.json(task);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  }
);

// Delete task
router.delete("/:taskId", auth, async (req, res) => {
  try {
    const task = await Task.findById(req.params.taskId);
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    // Check access through project
    const project = await Project.findById(task.projectId).populate("teamId");
    const team = project.teamId;
    const isMember =
      team.members.includes(req.user._id) ||
      team.createdBy.equals(req.user._id);

    if (!isMember) {
      return res
        .status(403)
        .json({ message: "Access denied. Not a team member." });
    }

    // Only task creator or team creator can delete
    const canDelete =
      task.createdBy.equals(req.user._id) ||
      team.createdBy.equals(req.user._id);
    if (!canDelete) {
      return res
        .status(403)
        .json({ message: "Access denied. Cannot delete this task." });
    }

    await Task.findByIdAndDelete(req.params.taskId);
    res.json({ message: "Task deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
