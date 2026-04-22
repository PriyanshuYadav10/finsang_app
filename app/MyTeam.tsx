import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Modal,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import CustomAlert from "../components/CustomAlert";
import Colors from "../constants/Colors";
import { useUser } from "../Contexts/UserContext";
import {
  CreateInvitationRequest,
  teamApi,
  TeamInvitation,
  TeamMember,
} from "../lib/teamApi";

export default function MyTeamScreen() {
  const router = useRouter();
  const { userDetails, isTeamLeader } = useUser();
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [invitations, setInvitations] = useState<TeamInvitation[]>([]);
  const [loading, setLoading] = useState(true);
  const [inviteModalVisible, setInviteModalVisible] = useState(false);
  const [inviteForm, setInviteForm] = useState<CreateInvitationRequest>({
    member_name: "",
    member_phone: "",
    member_email: "",
  });
  const [inviting, setInviting] = useState(false);
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertConfig, setAlertConfig] = useState({
    title: "",
    message: "",
    type: "info" as "success" | "error" | "warning" | "info",
    onConfirm: () => {},
    showCancel: false
  });

  useEffect(() => {
    if (isTeamLeader) {
      fetchTeamData();
    }
  }, [isTeamLeader]);

  const fetchTeamData = async () => {
    try {
      setLoading(true);
      const [membersData, invitationsData] = await Promise.all([
        teamApi.getMyTeamMembers(),
        teamApi.getMyInvitations(),
      ]);
      setTeamMembers(membersData);
      setInvitations(invitationsData);
    } catch (error) {
      console.error("Error fetching team data:", error);
      setAlertConfig({
        title: "Error",
        message: "Failed to load team data",
        type: "error",
        onConfirm: () => setAlertVisible(false),
        showCancel: false
      });
      setAlertVisible(true);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateInvitation = async () => {
    if (!inviteForm.member_name || !inviteForm.member_phone) {
      setAlertConfig({
        title: "Error",
        message: "Please fill in name and phone number",
        type: "error",
        onConfirm: () => setAlertVisible(false),
        showCancel: false
      });
      setAlertVisible(true);
      return;
    }

    try {
      setInviting(true);
      const invitation = await teamApi.createInvitation(inviteForm);

      // Generate invitation link
      const invitationLink = teamApi.generateInvitationLink(
        invitation.invitation_token
      );

      // Share the invitation
      await Share.share({
        message: `Hey ${inviteForm.member_name}!

You've been invited to join my Finsang Pro team! 🚀

Download the Finsang Pro app and use this link to join:
${invitationLink}

Join my team and start earning together! 💰`,
        title: "Finsang Pro Team Invitation",
      });

      setInviteModalVisible(false);
      setInviteForm({ member_name: "", member_phone: "", member_email: "" });
      fetchTeamData(); // Refresh data

      setAlertConfig({
        title: "Success",
        message: "Invitation sent successfully!",
        type: "success",
        onConfirm: () => setAlertVisible(false),
        showCancel: false
      });
      setAlertVisible(true);
    } catch (error) {
      console.error("Error creating invitation:", error);
      setAlertConfig({
        title: "Error",
        message: "Failed to create invitation",
        type: "error",
        onConfirm: () => setAlertVisible(false),
        showCancel: false
      });
      setAlertVisible(true);
    } finally {
      setInviting(false);
    }
  };

  const handleRemoveMember = async (memberId: string, memberName: string) => {
    setAlertConfig({
      title: "Remove Team Member",
      message: `Are you sure you want to remove ${memberName} from your team?`,
      type: "warning",
      onConfirm: async () => {
        setAlertVisible(false);
        try {
          await teamApi.removeTeamMember(memberId);
          fetchTeamData();
          setAlertConfig({
            title: "Success",
            message: "Team member removed successfully",
            type: "success",
            onConfirm: () => setAlertVisible(false),
            showCancel: false
          });
          setAlertVisible(true);
        } catch (error) {
          console.error("Error removing team member:", error);
          setAlertConfig({
            title: "Error",
            message: "Failed to remove team member",
            type: "error",
            onConfirm: () => setAlertVisible(false),
            showCancel: false
          });
          setAlertVisible(true);
        }
      },
      showCancel: true
    });
    setAlertVisible(true);
  };

  const renderTeamMember = ({ item }: { item: TeamMember }) => (
    <View style={styles.memberCard}>
      <View style={styles.memberInfo}>
        <View style={styles.memberAvatar}>
          <Text style={styles.memberInitials}>
            {item.member_name.slice(0, 2).toUpperCase()}
          </Text>
        </View>
        <View style={styles.memberDetails}>
          <Text style={styles.memberName}>{item.member_name}</Text>
          <Text style={styles.memberPhone}>{item.member_phone}</Text>
          <Text style={styles.memberEmail}>
            {item.member_email || "No email"}
          </Text>
          <Text style={styles.memberStatus}>
            Status: {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
          </Text>
        </View>
      </View>
      <TouchableOpacity
        style={styles.removeButton}
        onPress={() => handleRemoveMember(item.member_id, item.member_name)}
      >
        <Ionicons name="trash-outline" size={20} color="#FF4444" />
      </TouchableOpacity>
    </View>
  );

  const renderInvitation = ({ item }: { item: TeamInvitation }) => (
    <View style={styles.invitationCard}>
      <View style={styles.invitationInfo}>
        <Text style={styles.invitationName}>{item.member_name}</Text>
        <Text style={styles.invitationPhone}>{item.member_phone}</Text>
        <Text style={styles.invitationEmail}>
          {item.member_email || "No email"}
        </Text>
        <Text
          style={[
            styles.invitationStatus,
            {
              color:
                item.status === "pending"
                  ? "#FFA500"
                  : item.status === "accepted"
                  ? "#4CAF50"
                  : "#F44336",
            },
          ]}
        >
          Status: {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
        </Text>
      </View>
      <View style={styles.invitationDate}>
        <Text style={styles.invitationDateText}>
          {new Date(item.created_at).toLocaleDateString()}
        </Text>
      </View>
    </View>
  );

  if (!isTeamLeader) {
    return (
      <SafeAreaView style={{ backgroundColor: Colors.white, flex: 1 }}>
        <View style={styles.container}>
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => router.back()}
            >
              <Ionicons name="arrow-back" size={24} color={Colors.primary} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>My Team</Text>
          </View>
          <View style={styles.accessDenied}>
            <Ionicons name="people-outline" size={64} color="#757575" />
            <Text style={styles.accessDeniedText}>Access Denied</Text>
            <Text style={styles.accessDeniedSubtext}>
              Only team leaders can access team management features.
            </Text>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  if (loading) {
    return (
      <SafeAreaView style={{ backgroundColor: Colors.white, flex: 1 }}>
        <View style={styles.container}>
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => router.back()}
            >
              <Ionicons name="arrow-back" size={24} color={Colors.primary} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>My Team</Text>
          </View>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={Colors.primary} />
            <Text style={styles.loadingText}>Loading team data...</Text>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ backgroundColor: Colors.white, flex: 1 }}>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color={Colors.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>My Team</Text>
          <TouchableOpacity
            style={styles.inviteButton}
            onPress={() => setInviteModalVisible(true)}
          >
            <Ionicons
              name="person-add-outline"
              size={24}
              color={Colors.primary}
            />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content}>
          {/* Team Stats */}
          <View style={styles.statsContainer}>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{teamMembers.length}</Text>
              <Text style={styles.statLabel}>Team Members</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>
                {invitations.filter((i) => i.status === "pending").length}
              </Text>
              <Text style={styles.statLabel}>Pending Invites</Text>
            </View>
          </View>

          {/* Team Members Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Team Members</Text>
            {teamMembers.length > 0 ? (
              <FlatList
                data={teamMembers}
                renderItem={renderTeamMember}
                keyExtractor={(item) => item.id}
                scrollEnabled={false}
              />
            ) : (
              <View style={styles.emptyState}>
                <Ionicons name="people-outline" size={48} color="#757575" />
                <Text style={styles.emptyText}>No team members yet</Text>
                <Text style={styles.emptySubtext}>
                  Invite people to build your team
                </Text>
              </View>
            )}
          </View>

          {/* Invitations Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Invitations</Text>
            {invitations.length > 0 ? (
              <FlatList
                data={invitations}
                renderItem={renderInvitation}
                keyExtractor={(item) => item.id}
                scrollEnabled={false}
              />
            ) : (
              <View style={styles.emptyState}>
                <Ionicons name="mail-outline" size={48} color="#757575" />
                <Text style={styles.emptyText}>No invitations</Text>
                <Text style={styles.emptySubtext}>
                  Create invitations to grow your team
                </Text>
              </View>
            )}
          </View>
        </ScrollView>

        {/* Invite Modal */}
        <Modal
          visible={inviteModalVisible}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setInviteModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Invite Team Member</Text>
                <TouchableOpacity onPress={() => setInviteModalVisible(false)}>
                  <Ionicons name="close" size={24} color="#757575" />
                </TouchableOpacity>
              </View>

              <View style={styles.modalBody}>
                <Text style={styles.inputLabel}>Full Name *</Text>
                <TextInput
                  style={styles.textInput}
                  value={inviteForm.member_name}
                  onChangeText={(text) =>
                    setInviteForm((prev) => ({ ...prev, member_name: text }))
                  }
                  placeholder="Enter full name"
                />

                <Text style={styles.inputLabel}>Phone Number *</Text>
                <TextInput
                  style={styles.textInput}
                  value={inviteForm.member_phone}
                  onChangeText={(text) =>
                    setInviteForm((prev) => ({ ...prev, member_phone: text }))
                  }
                  placeholder="Enter phone number"
                  keyboardType="phone-pad"
                />

                <Text style={styles.inputLabel}>Email (Optional)</Text>
                <TextInput
                  style={styles.textInput}
                  value={inviteForm.member_email}
                  onChangeText={(text) =>
                    setInviteForm((prev) => ({ ...prev, member_email: text }))
                  }
                  placeholder="Enter email address"
                  keyboardType="email-address"
                />
              </View>

              <View style={styles.modalFooter}>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={() => setInviteModalVisible(false)}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.sendButton, inviting && styles.disabledButton]}
                  onPress={handleCreateInvitation}
                  disabled={inviting}
                >
                  {inviting ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <Text style={styles.sendButtonText}>Send Invitation</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
        
        <CustomAlert
          visible={alertVisible}
          title={alertConfig.title}
          message={alertConfig.message}
          type={alertConfig.type}
          onConfirm={alertConfig.onConfirm}
          onCancel={alertConfig.showCancel ? () => setAlertVisible(false) : undefined}
          cancelText="Cancel"
          confirmText={alertConfig.title === "Remove Team Member" ? "Remove" : "OK"}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 20,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
  },
  inviteButton: {
    padding: 8,
  },
  content: {
    flex: 1,
  },
  statsContainer: {
    flexDirection: "row",
    padding: 16,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: "bold",
    color: Colors.primary,
  },
  statLabel: {
    fontSize: 14,
    color: "#666",
    marginTop: 4,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginHorizontal: 16,
    marginBottom: 12,
  },
  memberCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 8,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  memberInfo: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },
  memberAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.primary,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  memberInitials: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  memberDetails: {
    flex: 1,
  },
  memberName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  memberPhone: {
    fontSize: 14,
    color: "#666",
    marginTop: 2,
  },
  memberEmail: {
    fontSize: 12,
    color: "#999",
    marginTop: 2,
  },
  memberStatus: {
    fontSize: 12,
    color: "#666",
    marginTop: 4,
  },
  removeButton: {
    padding: 8,
  },
  invitationCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 8,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  invitationInfo: {
    flex: 1,
  },
  invitationName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  invitationPhone: {
    fontSize: 14,
    color: "#666",
    marginTop: 2,
  },
  invitationEmail: {
    fontSize: 12,
    color: "#999",
    marginTop: 2,
  },
  invitationStatus: {
    fontSize: 12,
    fontWeight: "500",
    marginTop: 4,
  },
  invitationDate: {
    alignItems: "flex-end",
  },
  invitationDateText: {
    fontSize: 12,
    color: "#999",
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 32,
    paddingHorizontal: 16,
  },
  emptyText: {
    fontSize: 16,
    color: "#666",
    marginTop: 12,
    fontWeight: "500",
  },
  emptySubtext: {
    fontSize: 14,
    color: "#999",
    marginTop: 4,
    textAlign: "center",
  },
  accessDenied: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
  },
  accessDeniedText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    marginTop: 16,
  },
  accessDeniedSubtext: {
    fontSize: 16,
    color: "#666",
    marginTop: 8,
    textAlign: "center",
    lineHeight: 24,
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#666",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "80%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
  },
  modalBody: {
    padding: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
    marginTop: 16,
  },
  textInput: {
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  modalFooter: {
    flexDirection: "row",
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: "#e0e0e0",
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: "#f5f5f5",
    alignItems: "center",
  },
  cancelButtonText: {
    color: "#666",
    fontSize: 16,
    fontWeight: "600",
  },
  sendButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: Colors.primary,
    alignItems: "center",
  },
  sendButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  disabledButton: {
    backgroundColor: "#ccc",
    opacity: 0.7,
  },
});
