const express = require("express");
const { body, validationResult } = require("express-validator");
const Team = require("../models/Team");
const User = require("../models/User");
const auth = require("../middleware/auth");
const { checkTeamMembership } = require("../middleware/roleAuth");

const router = express.Router();

// Get all teams for current user
router.get("/", auth, async (req, res) => {
  try {
    const teams = await Team.find({
      $or: [{ createdBy: req.user._id }, { members: req.user._id }],
    }).populate("members", "name email role");

    res.json(teams);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// Create team
router.post(
  "/",
  auth,
  [
    body("teamName")
      .trim()
      .isLength({ min: 2 })
      .withMessage("Team name must be at least 2 characters"),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ message: errors.array()[0].msg });
      }

      const { teamName } = req.body;

      const team = new Team({
        teamName,
        createdBy: req.user._id,
        members: [req.user._id],
      });

      await team.save();
      await team.populate("members", "name email role");

      res.status(201).json(team);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  }
);

// Get team by ID
router.get("/:teamId", auth, checkTeamMembership, async (req, res) => {
  try {
    const team = await Team.findById(req.params.teamId).populate(
      "members",
      "name email role"
    );
    res.json(team);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// Invite member to team
router.post(
  "/:teamId/invite",
  auth,
  checkTeamMembership,
  [body("email").isEmail().withMessage("Please provide a valid email")],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ message: errors.array()[0].msg });
      }

      const { email } = req.body;
      const team = req.team;

      const user = await User.findOne({ email });
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      if (team.members.includes(user._id)) {
        return res
          .status(400)
          .json({ message: "User is already a team member" });
      }

      team.members.push(user._id);
      await team.save();
      await team.populate("members", "name email role");

      res.json(team);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  }
);

// Remove member from team
router.delete(
  "/:teamId/members/:memberId",
  auth,
  checkTeamMembership,
  async (req, res) => {
    try {
      const team = req.team;
      const { memberId } = req.params;

      // Check if user is team creator
      if (!team.createdBy.equals(req.user._id)) {
        return res
          .status(403)
          .json({ message: "Only team creator can remove members" });
      }

      // Can't remove team creator
      if (team.createdBy.equals(memberId)) {
        return res.status(400).json({ message: "Cannot remove team creator" });
      }

      team.members = team.members.filter((member) => !member.equals(memberId));
      await team.save();
      await team.populate("members", "name email role");

      res.json(team);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  }
);

module.exports = router;
