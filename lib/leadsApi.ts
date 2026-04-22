import { supabase } from './supabase';

export interface Lead {
  id: string;
  finsang_id?: number;
  product_name: string;
  user_name: string;
  user_mobile: string;
  user_email: string;
  user_income: number | null;
  user_pincode: string;
  user_age: number;
  sender_name: string | null;
  sender_phone: string | null;
  status: string;
  notes: string | null;
  created_at: string;
  product_application_url: string;
  team_member_name?: string;
  team_member_phone?: string;
}

export interface LeadFilters {
  page?: number;
  limit?: number;
  status?: string;
  search?: string;
}

export interface MyLeadFilters extends LeadFilters {
  senderId: string;
  startDate?: string;
  endDate?: string;
}

export interface LeadUpdate {
  leadId: string;
  status: string;
  notes: string;
}

export interface UserDetailsUpdate {
  leadId: string;
  user_name: string;
  user_mobile: string;
  user_email: string;
  user_income?: number;
  user_pincode: string;
  user_age: number;
}

export interface LeadStats {
  total: number;
  pending: number;
  contacted: number;
  applied: number;
  rejected: number;
}

export interface LeadsResponse {
  leads: Lead[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export const leadsApi = {
  // Fetch all leads with optional filters
  async getLeads({ page = 1, limit = 20, status, search }: LeadFilters): Promise<LeadsResponse> {
    try {
      let query = supabase
        .from('shared_product_leads')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false });

      // Apply status filter
      if (status && status !== 'all') {
        query = query.eq('status', status);
      }

      // Apply search filter
      if (search && search.trim()) {
        query = query.or(`user_name.ilike.%${search}%,user_mobile.ilike.%${search}%,user_email.ilike.%${search}%,product_name.ilike.%${search}%`);
      }

      // Apply pagination
      const offset = (page - 1) * limit;
      query = query.range(offset, offset + limit - 1);

      const { data, error, count } = await query;

      if (error) {
        throw error;
      }

      return {
        leads: data || [],
        pagination: {
          page,
          limit,
          total: count || 0,
          totalPages: Math.ceil((count || 0) / limit)
        }
      };
    } catch (error) {
      console.error('Error fetching leads:', error);
      throw error;
    }
  },

  // Fetch leads for the current user (sender) including team member leads
  async getMyLeads({ page = 1, limit = 20, status, search, senderId, startDate, endDate }: MyLeadFilters): Promise<LeadsResponse> {
    try {
      // First, get all team member IDs for this sender
      const { data: teamMembers, error: teamError } = await supabase
        .from('team_members')
        .select('member_id, member_name, member_phone')
        .eq('team_leader_id', senderId)
        .eq('status', 'active');

      if (teamError) {
        throw teamError;
      }

      // Get all sender IDs (including team members)
      const senderIds = [senderId, ...(teamMembers?.map(member => member.member_id) || [])];

      let query = supabase
        .from('shared_product_leads')
        .select('*', { count: 'exact' })
        .in('sender_id', senderIds)
        .order('created_at', { ascending: false });

      // Apply status filter
      if (status && status !== 'all') {
        query = query.eq('status', status);
      }

      // Apply search filter
      if (search && search.trim()) {
        query = query.or(`user_name.ilike.%${search}%,user_mobile.ilike.%${search}%,user_email.ilike.%${search}%,product_name.ilike.%${search}%`);
      }

      // Apply date range filter
      if (startDate && endDate) {
        query = query.gte('created_at', `${startDate}T00:00:00.000Z`)
                   .lte('created_at', `${endDate}T23:59:59.999Z`);
      }

      // Apply pagination
      const offset = (page - 1) * limit;
      query = query.range(offset, offset + limit - 1);

      const { data, error, count } = await query;

      if (error) {
        throw error;
      }

      // Add team member information to leads
      const leadsWithTeamInfo = (data || []).map(lead => {
        const teamMember = teamMembers?.find(member => member.member_id === lead.sender_id);
        return {
          ...lead,
          team_member_name: teamMember?.member_name || null,
          team_member_phone: teamMember?.member_phone || null,
        };
      });

      return {
        leads: leadsWithTeamInfo,
        pagination: {
          page,
          limit,
          total: count || 0,
          totalPages: Math.ceil((count || 0) / limit)
        }
      };
    } catch (error) {
      console.error('Error fetching my leads:', error);
      throw error;
    }
  },

  // Update lead status and notes
  async updateLead({ leadId, status, notes }: LeadUpdate): Promise<Lead> {
    try {
      const { data, error } = await supabase
        .from('shared_product_leads')
        .update({
          status,
          notes,
          updated_at: new Date().toISOString()
        })
        .eq('id', leadId)
        .select()
        .single();

      if (error) {
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error updating lead:', error);
      throw error;
    }
  },

  // Update user details
  async updateUserDetails({ leadId, user_name, user_mobile, user_email, user_income, user_pincode, user_age }: UserDetailsUpdate): Promise<Lead> {
    try {
      const { data, error } = await supabase
        .from('shared_product_leads')
        .update({
          user_name,
          user_mobile,
          user_email,
          user_income,
          user_pincode,
          user_age,
          updated_at: new Date().toISOString()
        })
        .eq('id', leadId)
        .select()
        .single();

      if (error) {
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error updating user details:', error);
      throw error;
    }
  },

  // Get lead statistics
  async getLeadStats(): Promise<LeadStats> {
    try {
      const { data, error } = await supabase
        .from('shared_product_leads')
        .select('status');

      if (error) {
        throw error;
      }

      const stats = {
        total: data.length,
        pending: data.filter(lead => lead.status === 'pending').length,
        contacted: data.filter(lead => lead.status === 'contacted').length,
        applied: data.filter(lead => lead.status === 'applied').length,
        rejected: data.filter(lead => lead.status === 'rejected').length,
      };

      return stats;
    } catch (error) {
      console.error('Error fetching lead stats:', error);
      throw error;
    }
  },

  // Get leads by sender (for user's own shared products)
  async getLeadsBySender(senderId: string): Promise<Lead[]> {
    try {
      const { data, error } = await supabase
        .from('shared_product_leads')
        .select('*')
        .eq('sender_id', senderId)
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Error fetching sender leads:', error);
      throw error;
    }
  }
}; 