import CustomAlert from "@/components/CustomAlert";
import { Ionicons } from "@expo/vector-icons";
import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Modal,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Colors from "../../constants/Colors";
import { useAuth } from "../../Contexts/AuthContexts";
import { Lead, leadsApi, UserDetailsUpdate } from "../../lib/leadsApi";

export default function LeadsScreen() {
  const { user } = useAuth();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  // const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  // const [editModalVisible, setEditModalVisible] = useState(false);
  // const [editStatus, setEditStatus] = useState('');
  // const [editNotes, setEditNotes] = useState('');

  // User details editing state
  const [userDetailsModalVisible, setUserDetailsModalVisible] = useState(false);
  const [editingUserDetails, setEditingUserDetails] =
    useState<UserDetailsUpdate>({
      leadId: "",
      user_name: "",
      user_mobile: "",
      user_email: "",
      user_income: 0,
      user_pincode: "",
      user_age: 0,
    });

  // Download report modal state
  const [downloadModalVisible, setDownloadModalVisible] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [downloadLoading, setDownloadLoading] = useState(false);
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertConfig, setAlertConfig] = useState({
    title: "",
    message: "",
    type: "info" as "success" | "error" | "warning" | "info"
  });

  const fetchLeads = async () => {
    try {
      setLoading(true);

      if (!user?.id) {
        setLeads([]);
        return;
      }

      const result = await leadsApi.getMyLeads({
        status: statusFilter,
        search: searchQuery,
        page: 1,
        limit: 50,
        senderId: user.id,
      });

      setLeads(result.leads);
    } catch (error) {
      console.error("Error:", error);
      setAlertConfig({
        title: "Error",
        message: "Failed to fetch leads",
        type: "error"
      });
      setAlertVisible(true);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchLeads();
    setRefreshing(false);
  };

  useEffect(() => {
    fetchLeads();
  }, [searchQuery, statusFilter]);

  // const updateLead = async () => {
  //   if (!selectedLead) return;

  //   try {
  //     await leadsApi.updateLead({
  //       leadId: selectedLead.id,
  //       status: editStatus,
  //       notes: editNotes
  //     });

  //     Alert.alert('Success', 'Lead updated successfully');
  //     setEditModalVisible(false);
  //     fetchLeads(); // Refresh the list
  //   } catch (error) {
  //     console.error('Error:', error);
  //     Alert.alert('Error', 'Failed to update lead');
  //   }
  // };

  const updateUserDetails = async () => {
    try {
      await leadsApi.updateUserDetails(editingUserDetails);

      setAlertConfig({
        title: "Success",
        message: "User details updated successfully",
        type: "success"
      });
      setAlertVisible(true);
      setUserDetailsModalVisible(false);
      fetchLeads(); // Refresh the list
    } catch (error) {
      console.error("Error:", error);
      setAlertConfig({
        title: "Error",
        message: "Failed to update user details",
        type: "error"
      });
      setAlertVisible(true);
    }
  };

  // const openEditModal = (lead: Lead) => {
  //   setSelectedLead(lead);
  //   setEditStatus(lead.status);
  //   setEditNotes(lead.notes || '');
  //   setEditModalVisible(true);
  // };

  const openUserDetailsModal = (lead: Lead) => {
    setEditingUserDetails({
      leadId: lead.id,
      user_name: lead.user_name,
      user_mobile: lead.user_mobile,
      user_email: lead.user_email,
      user_income: lead.user_income || 0,
      user_pincode: lead.user_pincode,
      user_age: lead.user_age,
    });
    setUserDetailsModalVisible(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "#FFA500";
      case "contacted":
        return "#2196F3";
      case "applied":
        return "#4CAF50";
      case "rejected":
        return "#F44336";
      default:
        return "#757575";
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const setQuickDateRange = (range: "week" | "month") => {
    const today = new Date();
    const endDate = today.toISOString().split("T")[0];

    if (range === "week") {
      const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
      setStartDate(weekAgo.toISOString().split("T")[0]);
    } else {
      const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
      setStartDate(monthAgo.toISOString().split("T")[0]);
    }

    setEndDate(endDate);
  };

  const downloadReport = async () => {
    if (!startDate || !endDate) {
      setAlertConfig({
        title: "Error",
        message: "Please select both start and end dates",
        type: "error"
      });
      setAlertVisible(true);
      return;
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays > 31) {
      setAlertConfig({
        title: "Error",
        message: "Maximum date range is 31 days",
        type: "error"
      });
      setAlertVisible(true);
      return;
    }

    try {
      setDownloadLoading(true);

      // Fetch leads data for the selected date range
      const result = await leadsApi.getMyLeads({
        status: "all",
        search: "",
        page: 1,
        limit: 1000,
        senderId: user?.id || "",
        startDate: startDate,
        endDate: endDate,
      });

      // Create CSV content
      const csvHeaders = [
        "Finsang ID",
        "User Name",
        "Mobile",
        "Email",
        "Age",
        "Pincode",
        "Income",
        "Product Name",
        "Status",
        "Created Date",
        "Sender Name",
      ].join(",");

      const csvRows = result.leads.map((lead) =>
        [
          lead.finsang_id || "N/A",
          `"${lead.user_name}"`,
          lead.user_mobile,
          `"${lead.user_email}"`,
          lead.user_age,
          lead.user_pincode,
          lead.user_income || "",
          `"${lead.product_name}"`,
          lead.status,
          new Date(lead.created_at).toLocaleDateString("en-IN"),
          `"${lead.sender_name || ""}"`,
        ].join(",")
      );

      const csvContent = [csvHeaders, ...csvRows].join("\n");

      // Create file
      const fileName = `leads_report_${startDate}_to_${endDate}.csv`;
      const fileUri = `${FileSystem.documentDirectory}${fileName}`;

      await FileSystem.writeAsStringAsync(fileUri, csvContent, {
        encoding: FileSystem.EncodingType.UTF8,
      });

      // Share the file
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(fileUri, {
          mimeType: "text/csv",
          dialogTitle: "Download Leads Report",
        });
      } else {
        setAlertConfig({
          title: "Success",
          message: `Report saved as ${fileName}`,
          type: "success"
        });
        setAlertVisible(true);
      }

      setDownloadModalVisible(false);
      setStartDate("");
      setEndDate("");
    } catch (error) {
      console.error("Download error:", error);
      setAlertConfig({
        title: "Error",
        message: "Failed to download report",
        type: "error"
      });
      setAlertVisible(true);
    } finally {
      setDownloadLoading(false);
    }
  };

  const renderLeadItem = ({ item }: { item: Lead }) => (
    <View style={styles.leadCard}>
      <View style={styles.leadHeader}>
        <View style={styles.leadTitleSection}>
          <Text style={styles.productName}>{item.product_name}</Text>
        </View>

        <View
          style={[
            styles.statusBadge,
            { backgroundColor: getStatusColor(item.status) },
          ]}
        >
          <Text style={styles.statusText}>{item.status.toUpperCase()}</Text>
        </View>
      </View>

      <View style={styles.userInfo}>
        <Text style={styles.userName}>{item.user_name}</Text>
        <Text style={styles.userContact}>
          {item.user_mobile} • {item.user_email}
        </Text>
        <Text style={styles.userDetails}>
          Age: {item.user_age} • Pincode: {item.user_pincode}
          {item.user_income &&
            ` • Income: ₹${item.user_income.toLocaleString()}`}
        </Text>
      </View>

      {item.sender_name && (
        <View style={styles.senderInfo}>
          <View style={styles.senderInfoContainer}>
            <Text style={styles.senderLabel}>
              Shared by: {item.sender_name}
              {item.team_member_name && (
                <Text style={styles.teamMemberLabel}> (Team Member)</Text>
              )}
            </Text>
            {item.finsang_id && (
              <View style={styles.finsangIdBadge}>
                <Text style={styles.finsangIdText}>
                  Finsang ID: {item.finsang_id}
                </Text>
              </View>
            )}
          </View>
          {item.sender_phone && (
            <Text style={styles.senderPhone}>
              +91 {item.sender_phone.slice(2)}
            </Text>
          )}
          {item.team_member_phone && (
            <Text style={styles.teamMemberPhone}>
              Team Member: +91 {item.team_member_phone.slice(2)}
            </Text>
          )}
        </View>
      )}

      <View style={styles.leadFooter}>
        <Text style={styles.dateText}>{formatDate(item.created_at)}</Text>
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => openUserDetailsModal(item)}
          >
            <Ionicons name="person" size={16} color="#4CAF50" />
            <Text style={styles.actionButtonText}>Edit User</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  const renderFilterButtons = () => (
    <View style={styles.filterContainer}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {["all", "pending", "contacted", "applied", "rejected"].map(
          (status) => (
            <TouchableOpacity
              key={status}
              style={[
                styles.filterButton,
                statusFilter === status && styles.filterButtonActive,
              ]}
              onPress={() => setStatusFilter(status)}
            >
              <Text
                style={[
                  styles.filterButtonText,
                  statusFilter === status && styles.filterButtonTextActive,
                ]}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </Text>
            </TouchableOpacity>
          )
        )}
      </ScrollView>
    </View>
  );

  if (loading && leads.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2196F3" />
        <Text style={styles.loadingText}>Loading leads...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.title}>My Shared Leads</Text>
          <Text style={styles.subtitle}>{leads.length} leads found</Text>
        </View>
        <TouchableOpacity
          style={styles.downloadButton}
          onPress={() => setDownloadModalVisible(true)}
        >
          <Ionicons name="download-outline" size={20} color="#2196F3" />
          <Text style={styles.downloadButtonText}>Report</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.searchContainer}>
        <Ionicons
          name="search"
          size={20}
          color="#757575"
          style={styles.searchIcon}
        />
        <TextInput
          style={styles.searchInput}
          placeholder="Search leads..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {renderFilterButtons()}

      <FlatList
        data={leads}
        renderItem={renderLeadItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="document-outline" size={64} color="#757575" />
            <Text style={styles.emptyText}>No leads found</Text>
            <Text style={styles.emptySubtext}>
              {user?.id
                ? "Share products to see leads here"
                : "Please login to view your leads"}
            </Text>
          </View>
        }
      />

      {/* Edit Modal */}
      {/* <Modal
        visible={editModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setEditModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Edit Lead</Text>
              <TouchableOpacity onPress={() => setEditModalVisible(false)}>
                <Ionicons name="close" size={24} color="#757575" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              {selectedLead && (
                <>
                  <Text style={styles.modalLabel}>Product</Text>
                  <Text style={styles.modalValue}>{selectedLead.product_name}</Text>

                  <Text style={styles.modalLabel}>User</Text>
                  <Text style={styles.modalValue}>{selectedLead.user_name}</Text>
                  <Text style={styles.modalSubValue}>{selectedLead.user_mobile} • {selectedLead.user_email}</Text>

                  <Text style={styles.modalLabel}>Status</Text>
                  <View style={styles.statusPicker}>
                    {['pending', 'contacted', 'applied', 'rejected'].map((status) => (
                      <TouchableOpacity
                        key={status}
                        style={[
                          styles.statusOption,
                          editStatus === status && styles.statusOptionActive
                        ]}
                        onPress={() => setEditStatus(status)}
                      >
                        <Text style={[
                          styles.statusOptionText,
                          editStatus === status && styles.statusOptionTextActive
                        ]}>
                          {status.charAt(0).toUpperCase() + status.slice(1)}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>

                  <Text style={styles.modalLabel}>Notes</Text>
                  <TextInput
                    style={styles.notesInput}
                    placeholder="Add notes..."
                    value={editNotes}
                    onChangeText={setEditNotes}
                    multiline
                    numberOfLines={4}
                  />
                </>
              )}
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setEditModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.saveButton}
                onPress={updateLead}
              >
                <Text style={styles.saveButtonText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal> */}

      {/* User Details Edit Modal */}
      <Modal
        visible={userDetailsModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setUserDetailsModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Edit User Details</Text>
              <TouchableOpacity
                onPress={() => setUserDetailsModalVisible(false)}
              >
                <Ionicons name="close" size={24} color="#757575" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              <Text style={styles.modalLabel}>Full Name</Text>
              <TextInput
                style={styles.textInput}
                value={editingUserDetails.user_name}
                onChangeText={(text) =>
                  setEditingUserDetails((prev) => ({
                    ...prev,
                    user_name: text,
                  }))
                }
                placeholder="Enter full name"
              />

              <Text style={styles.modalLabel}>Mobile Number</Text>
              <TextInput
                style={styles.textInput}
                value={editingUserDetails.user_mobile}
                onChangeText={(text) =>
                  setEditingUserDetails((prev) => ({
                    ...prev,
                    user_mobile: text,
                  }))
                }
                placeholder="Enter mobile number"
                keyboardType="phone-pad"
              />

              <Text style={styles.modalLabel}>Email</Text>
              <TextInput
                style={styles.textInput}
                value={editingUserDetails.user_email}
                onChangeText={(text) =>
                  setEditingUserDetails((prev) => ({
                    ...prev,
                    user_email: text,
                  }))
                }
                placeholder="Enter email address"
                keyboardType="email-address"
              />

              <Text style={styles.modalLabel}>Age</Text>
              <TextInput
                style={styles.textInput}
                value={editingUserDetails.user_age.toString()}
                onChangeText={(text) =>
                  setEditingUserDetails((prev) => ({
                    ...prev,
                    user_age: parseInt(text) || 0,
                  }))
                }
                placeholder="Enter age"
                keyboardType="numeric"
              />

              <Text style={styles.modalLabel}>Pincode</Text>
              <TextInput
                style={styles.textInput}
                value={editingUserDetails.user_pincode}
                onChangeText={(text) =>
                  setEditingUserDetails((prev) => ({
                    ...prev,
                    user_pincode: text,
                  }))
                }
                placeholder="Enter pincode"
                keyboardType="numeric"
              />

              <Text style={styles.modalLabel}>Income (Optional)</Text>
              <TextInput
                style={styles.textInput}
                value={editingUserDetails.user_income?.toString() || ""}
                onChangeText={(text) =>
                  setEditingUserDetails((prev) => ({
                    ...prev,
                    user_income: parseFloat(text) || 0,
                  }))
                }
                placeholder="Enter monthly income"
                keyboardType="numeric"
              />
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setUserDetailsModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.saveButton}
                onPress={updateUserDetails}
              >
                <Text style={styles.saveButtonText}>Save Changes</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Download Report Modal */}
      <Modal
        visible={downloadModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setDownloadModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.downloadModalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Download Report</Text>
              <TouchableOpacity onPress={() => setDownloadModalVisible(false)}>
                <Ionicons name="close" size={24} color="#757575" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              <Text style={styles.modalLabel}>Select Date Range</Text>
              <Text style={styles.modalSubtext}>Maximum 31 days allowed</Text>

              <View style={styles.quickDateButtons}>
                <TouchableOpacity
                  style={styles.quickDateButton}
                  onPress={() => setQuickDateRange("week")}
                >
                  <Text style={styles.quickDateButtonText}>Last Week</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.quickDateButton}
                  onPress={() => setQuickDateRange("month")}
                >
                  <Text style={styles.quickDateButtonText}>Last Month</Text>
                </TouchableOpacity>
              </View>

              <Text style={styles.modalLabel}>Start Date</Text>
              <TextInput
                style={styles.textInput}
                value={startDate}
                onChangeText={setStartDate}
                placeholder="YYYY-MM-DD"
                keyboardType="numeric"
              />

              <Text style={styles.modalLabel}>End Date</Text>
              <TextInput
                style={styles.textInput}
                value={endDate}
                onChangeText={setEndDate}
                placeholder="YYYY-MM-DD"
                keyboardType="numeric"
              />

              <Text style={styles.modalSubtext}>
                Report will include: Finsang ID, User Details, Product Info,
                Status, and Date
              </Text>
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setDownloadModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.saveButton,
                  downloadLoading && styles.disabledButton,
                ]}
                onPress={downloadReport}
                disabled={downloadLoading}
              >
                {downloadLoading ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <>
                    <Ionicons
                      name="download"
                      size={16}
                      color="#fff"
                      style={{ marginRight: 8 }}
                    />
                    <Text style={styles.saveButtonText}>Download CSV</Text>
                  </>
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
        onConfirm={() => setAlertVisible(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  headerContent: {
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
  },
  subtitle: {
    fontSize: 14,
    color: "#757575",
    marginTop: 4,
  },
  downloadButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#f5f5f5",
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  downloadButtonText: {
    fontSize: 14,
    color: "#2196F3",
    marginLeft: 8,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    margin: 16,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
  },
  filterContainer: {
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    borderRadius: 20,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  filterButtonActive: {
    backgroundColor: "#2196F3",
    borderColor: "#2196F3",
  },
  filterButtonText: {
    color: "#757575",
    fontSize: 14,
  },
  filterButtonTextActive: {
    color: "#fff",
  },
  listContainer: {
    padding: 16,
  },
  leadCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  leadHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  leadTitleSection: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  productName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginRight: 8,
  },
  finsangIdBadge: {
    backgroundColor: "#E0E0E0",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
  },
  finsangIdText: {
    fontSize: 12,
    color: "#333",
    fontWeight: "bold",
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "bold",
  },
  userInfo: {
    marginBottom: 12,
  },
  userName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  userContact: {
    fontSize: 14,
    color: "#757575",
    marginTop: 2,
  },
  userDetails: {
    fontSize: 12,
    color: "#757575",
    marginTop: 2,
  },
  senderInfo: {
    marginBottom: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
  },
  senderLabel: {
    fontSize: 14,
    color: "#333",
    fontWeight: "500",
  },
  senderPhone: {
    fontSize: 12,
    color: "#757575",
    marginTop: 2,
  },
  leadFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
  },
  dateText: {
    fontSize: 12,
    color: "#757575",
  },
  editButton: {
    padding: 4,
  },
  actionButtons: {
    flexDirection: "row",
    gap: 8,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: "#f5f5f5",
  },
  actionButtonText: {
    fontSize: 12,
    color: "#333",
    marginLeft: 4,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#757575",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 64,
  },
  emptyText: {
    fontSize: 18,
    color: "#757575",
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: "#757575",
    marginTop: 8,
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
  downloadModalContent: {
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
    padding: 10,
  },
  modalLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
    marginTop: 16,
  },
  modalValue: {
    fontSize: 16,
    color: "#333",
  },
  modalSubValue: {
    fontSize: 14,
    color: "#757575",
    marginTop: 4,
  },
  statusPicker: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  statusOption: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#f5f5f5",
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  statusOptionActive: {
    backgroundColor: "#2196F3",
    borderColor: "#2196F3",
  },
  statusOptionText: {
    color: "#757575",
    fontSize: 14,
  },
  statusOptionTextActive: {
    color: "#fff",
  },
  notesInput: {
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    textAlignVertical: "top",
    minHeight: 100,
  },
  textInput: {
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 16,
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
    color: "#757575",
    fontSize: 16,
    fontWeight: "600",
  },
  saveButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: "#2196F3",
    alignItems: "center",
  },
  saveButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  disabledButton: {
    backgroundColor: "#ccc",
    opacity: 0.7,
  },
  quickDateButtons: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 16,
  },
  quickDateButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: "#f5f5f5",
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  quickDateButtonText: {
    fontSize: 14,
    color: "#333",
    fontWeight: "600",
  },
  modalSubtext: {
    fontSize: 12,
    color: "#757575",
    marginTop: 8,
    marginBottom: 16,
  },
  senderInfoContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  teamMemberLabel: {
    color: Colors.primary,
    fontWeight: "600",
  },
  teamMemberPhone: {
    fontSize: 12,
    color: Colors.primary,
    marginTop: 2,
    fontWeight: "500",
  },
});
