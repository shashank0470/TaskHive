const express = require("express");
const { body, validationResult } = require("express-validator");
const Project = require("../models/Project");
const Team = require("../models/Team");
const auth = require("../middleware/auth");
const {
  checkTeamMembership,
  checkProjectAccess,
} = require("../middleware/roleAuth");

const router = express.Router();

// Get all projects for current user
router.get("/", auth, async (req, res) => {
  try {
    // Get user's teams
    const teams = await Team.find({
      $or: [{ createdBy: req.user._id }, { members: req.user._id }],
    });

    const teamIds = teams.map((team) => team._id);

    // Get projects for those teams
    const projects = await Project.find({
      teamId: { $in: teamIds },
    }).populate("teamId", "teamName");

    res.json(projects);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// Create project
router.post(
  "/",
  auth,
  [
    body("title")
      .trim()
      .isLength({ min: 2 })
      .withMessage("Title must be at least 2 characters"),
    body("teamId").isMongoId().withMessage("Valid team ID is required"),
  ],
  checkTeamMembership,
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ message: errors.array()[0].msg });
      }

      const { title, description, teamId } = req.body;

      const project = new Project({
        title,
        description,
        teamId,
        createdBy: req.user._id,
      });

      await project.save();
      await project.populate("teamId", "teamName");

      res.status(201).json(project);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  }
);

// Get project by ID
router.get("/:projectId", auth, checkProjectAccess, async (req, res) => {
  try {
    const project = await Project.findById(req.params.projectId).populate(
      "teamId",
      "teamName"
    );
    res.json(project);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// Get project team members
router.get(
  "/:projectId/members",
  auth,
  checkProjectAccess,
  async (req, res) => {
    try {
      const project = req.project;
      const team = await Team.findById(project.teamId).populate(
        "members",
        "name email"
      );
      res.json(team.members);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  }
);

// Update project
router.put(
  "/:projectId",
  auth,
  checkProjectAccess,
  [
    body("title")
      .optional()
      .trim()
      .isLength({ min: 2 })
      .withMessage("Title must be at least 2 characters"),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ message: errors.array()[0].msg });
      }

      const { title, description } = req.body;
      const project = req.project;

      if (title) project.title = title;
      if (description !== undefined) project.description = description;

      await project.save();
      await project.populate("teamId", "teamName");

      res.json(project);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  }
);

// Delete project
router.delete("/:projectId", auth, checkProjectAccess, async (req, res) => {
  try {
    const project = req.project;

    // Check if user is project creator
    if (!project.createdBy.equals(req.user._id)) {
      return res
        .status(403)
        .json({ message: "Only project creator can delete project" });
    }

    await Project.findByIdAndDelete(req.params.projectId);
    res.json({ message: "Project deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
