import { useState, useEffect } from "react";
import CreateTeam from "./CreateTeam";
import api from "../../services/api";
import toast from "react-hot-toast";

const TeamManager = () => {
  const [teams, setTeams] = useState([]);
  const [showCreateTeam, setShowCreateTeam] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [inviteEmail, setInviteEmail] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTeams();
  }, []);

  const fetchTeams = async () => {
    try {
      const response = await api.get("/teams");
      setTeams(response.data);
    } catch (error) {
      toast.error("Failed to fetch teams");
    } finally {
      setLoading(false);
    }
  };

  const handleTeamCreated = (newTeam) => {
    setTeams([...teams, newTeam]);
    setShowCreateTeam(false);
  };

  const handleInviteMember = async (e) => {
    e.preventDefault();
    if (!selectedTeam || !inviteEmail) return;

    try {
      await api.post(`/teams/${selectedTeam._id}/invite`, {
        email: inviteEmail,
      });
      setInviteEmail("");
      toast.success("Invitation sent successfully!");
      fetchTeams(); // Refresh teams to get updated member list
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to send invitation");
    }
  };

  const handleRemoveMember = async (teamId, memberId) => {
    if (!window.confirm("Are you sure you want to remove this member?")) return;

    try {
      await api.delete(`/teams/${teamId}/members/${memberId}`);
      toast.success("Member removed successfully!");
      fetchTeams();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to remove member");
    }
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
          <h1 className="text-3xl font-bold text-gray-900">Team Management</h1>
          <button
            onClick={() => setShowCreateTeam(true)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm font-medium"
          >
            Create Team
          </button>
        </div>

        {teams.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">
              No teams yet. Create your first team!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Teams List */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Your Teams
              </h2>
              <div className="space-y-4">
                {teams.map((team) => (
                  <div
                    key={team._id}
                    className={`bg-white p-6 rounded-lg shadow cursor-pointer transition-colors ${
                      selectedTeam?._id === team._id
                        ? "ring-2 ring-indigo-500"
                        : "hover:shadow-md"
                    }`}
                    onClick={() => setSelectedTeam(team)}
                  >
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      {team.teamName}
                    </h3>
                    <p className="text-sm text-gray-600 mb-2">
                      {team.members.length} member
                      {team.members.length !== 1 ? "s" : ""}
                    </p>
                    <div className="flex items-center space-x-2">
                      {team.members.slice(0, 3).map((member) => (
                        <div
                          key={member._id}
                          className="w-8 h-8 bg-indigo-500 rounded-full flex items-center justify-center"
                        >
                          <span className="text-xs text-white font-medium">
                            {member.name?.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      ))}
                      {team.members.length > 3 && (
                        <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                          <span className="text-xs text-gray-600 font-medium">
                            +{team.members.length - 3}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Team Details */}
            <div>
              {selectedTeam ? (
                <div className="bg-white p-6 rounded-lg shadow">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">
                    {selectedTeam.teamName}
                  </h2>

                  {/* Invite Member Form */}
                  <div className="mb-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-3">
                      Invite Member
                    </h3>
                    <form
                      onSubmit={handleInviteMember}
                      className="flex space-x-2"
                    >
                      <input
                        type="email"
                        placeholder="Enter email address"
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                        value={inviteEmail}
                        onChange={(e) => setInviteEmail(e.target.value)}
                        required
                      />
                      <button
                        type="submit"
                        className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm font-medium"
                      >
                        Invite
                      </button>
                    </form>
                  </div>

                  {/* Members List */}
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-3">
                      Members ({selectedTeam.members.length})
                    </h3>
                    <div className="space-y-3">
                      {selectedTeam.members.map((member) => (
                        <div
                          key={member._id}
                          className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                        >
                          <div className="flex items-center">
                            <div className="w-10 h-10 bg-indigo-500 rounded-full flex items-center justify-center">
                              <span className="text-sm text-white font-medium">
                                {member.name?.charAt(0).toUpperCase()}
                              </span>
                            </div>
                            <div className="ml-3">
                              <p className="text-sm font-medium text-gray-900">
                                {member.name}
                              </p>
                              <p className="text-sm text-gray-500">
                                {member.email}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span
                              className={`px-2 py-1 text-xs font-medium rounded-full ${
                                member.role === "admin"
                                  ? "bg-purple-100 text-purple-800"
                                  : "bg-green-100 text-green-800"
                              }`}
                            >
                              {member.role || "member"}
                            </span>
                            {member.role !== "admin" && (
                              <button
                                onClick={() =>
                                  handleRemoveMember(
                                    selectedTeam._id,
                                    member._id
                                  )
                                }
                                className="text-red-600 hover:text-red-800 text-sm font-medium"
                              >
                                Remove
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-gray-50 p-6 rounded-lg text-center">
                  <p className="text-gray-500">
                    Select a team to view details and manage members
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {showCreateTeam && (
          <CreateTeam
            onTeamCreated={handleTeamCreated}
            onClose={() => setShowCreateTeam(false)}
          />
        )}
      </div>
    </div>
  );
};

export default TeamManager;
