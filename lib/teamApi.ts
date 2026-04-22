import { supabase } from "./supabase";

export interface TeamMember {
  id: string;
  team_leader_id: string;
  member_id: string;
  member_name: string;
  member_phone: string;
  member_email?: string;
  status: "pending" | "active" | "inactive";
  joined_at: string;
  created_at: string;
  updated_at: string;
}

export interface TeamInvitation {
  id: string;
  team_leader_id: string;
  invitation_token: string;
  member_name: string;
  member_phone: string;
  member_email?: string;
  status: "pending" | "accepted" | "expired";
  expires_at: string;
  created_at: string;
  accepted_at?: string;
}

export interface CreateInvitationRequest {
  member_name: string;
  member_phone: string;
  member_email?: string;
}

export const teamApi = {
  // Create a new team invitation
  async createInvitation(
    request: CreateInvitationRequest
  ): Promise<TeamInvitation> {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error("User not authenticated");

    const { data, error } = await supabase
      .from("team_invitations")
      .insert({
        team_leader_id: user.id,
        invitation_token: `inv_${Math.random()
          .toString(36)
          .substr(2, 16)}_${Date.now()}`,
        member_name: request.member_name,
        member_phone: request.member_phone,
        member_email: request.member_email,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Get all invitations for a team leader
  async getMyInvitations(): Promise<TeamInvitation[]> {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error("User not authenticated");

    const { data, error } = await supabase
      .from("team_invitations")
      .select("*")
      .eq("team_leader_id", user.id)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data || [];
  },

  // Get all team members for a team leader
  async getMyTeamMembers(): Promise<TeamMember[]> {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error("User not authenticated");

    const { data, error } = await supabase
      .from("team_members")
      .select("*")
      .eq("team_leader_id", user.id)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data || [];
  },

  // Accept team invitation
  async acceptInvitation(invitationToken: string): Promise<boolean> {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      throw new Error("User must be logged in to accept invitation");
    }

    const { data, error } = await supabase.rpc("accept_team_invitation", {
      p_invitation_token: invitationToken,
      p_member_id: user.id,
    });

    if (error) throw error;
    return data;
  },

  // Check if user has restricted access
  async checkRestrictedAccess(): Promise<boolean> {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return false;

    const { data, error } = await supabase
      .from("users")
      .select("has_restricted_access, team_role")
      .eq("id", user.id)
      .single();

    if (error) return false;
    return data?.has_restricted_access || data?.team_role === "member";
  },

  // Get team leader info for a member
  async getTeamLeaderInfo(): Promise<{
    leader_name: string;
    leader_phone: string;
  } | null> {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return null;

    const { data, error } = await supabase
      .from("team_member_details")
      .select("leader_name, leader_phone")
      .eq("member_id", user.id)
      .single();

    if (error) return null;
    return data;
  },

  // Remove team member
  async removeTeamMember(memberId: string): Promise<void> {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error("User not authenticated");

    const { error } = await supabase
      .from("team_members")
      .delete()
      .eq("team_leader_id", user.id)
      .eq("member_id", memberId);

    if (error) throw error;

    // Update user's team role back to leader
    const { error: updateError } = await supabase
      .from("users")
      .update({
        team_role: "leader",
        team_leader_id: null,
        has_restricted_access: false,
      })
      .eq("id", memberId);

    if (updateError) throw updateError;
  },

  // Get invitation link for sharing
  generateInvitationLink(invitationToken: string): string {
    // Use Next.js admin panel URL for clickable invitations
    // For development: http://localhost:3000/invite?token=${invitationToken}
    // For production: https://finsang.in/invite?token=${invitationToken}
    return `https://admin.finsang.in/invite?token=${invitationToken}`;
  },

  // Extract invitation token from URL
  extractInvitationToken(url: string): string | null {
    const match = url.match(/[?&]token=([^&]+)/);
    return match ? match[1] : null;
  },
};
