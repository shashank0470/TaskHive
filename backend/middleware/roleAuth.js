const Team = require("../models/Team");
const Project = require("../models/Project");

const checkTeamMembership = async (req, res, next) => {
  try {
    const teamId = req.params.teamId || req.body.teamId;
    const team = await Team.findById(teamId);

    if (!team) {
      return res.status(404).json({ message: "Team not found" });
    }

    const isMember =
      team.members.includes(req.user._id) ||
      team.createdBy.equals(req.user._id);

    if (!isMember) {
      return res
        .status(403)
        .json({ message: "Access denied. Not a team member." });
    }

    req.team = team;
    next();
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

const checkProjectAccess = async (req, res, next) => {
  try {
    const projectId = req.params.projectId || req.body.projectId;
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

    req.project = project;
    next();
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = { checkTeamMembership, checkProjectAccess };
