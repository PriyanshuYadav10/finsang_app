import { Buffer } from 'buffer';
import * as FileSystem from 'expo-file-system';
import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContexts';

// Define the shape of user details (customize as needed)
interface UserDetails {
  id: string;
  phone?: string;
  email?: string;
  name?: string;
  username:string;
  pincode?:number;
  occupation?:string;
  experience?:string;
  selled_products?:[];
  pan_number:string;
  heard_about:string;
  team_role?: 'leader' | 'member';
  team_leader_id?: string;
  has_restricted_access?: boolean;
}

interface UserContextType {
  userDetails: UserDetails | null;
  loading: boolean;
  fetchUserDetails: () => Promise<void>;
  updateUserDetails: (updates: Partial<UserDetails>) => Promise<void>;
  uploadProfileImage: (uri: string) => Promise<string | null>;
  isTeamMember: boolean;
  isTeamLeader: boolean;
  hasRestrictedAccess: boolean;
}

const UserContext = createContext<UserContextType>({
  userDetails: null,
  loading: false,
  fetchUserDetails: async () => {},
  updateUserDetails: async () => {},
  uploadProfileImage: async () => null,
  isTeamMember: false,
  isTeamLeader: false,
  hasRestrictedAccess: false,
});

export function UserProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [userDetails, setUserDetails] = useState<UserDetails | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchUserDetails = async () => {
    if (!user) return;
    setLoading(true);
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single();
    if (!error && data) {
      setUserDetails(data);
    }
    setLoading(false);
  };

  // useEffect(()=>{
  //   fetchUserDetails()
  // },[user])

  const updateUserDetails = async (updates: Partial<UserDetails>) => {
    if (!user) return;
    setLoading(true);
    const { data, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', user.id)
      .single();
    if (!error && data) {
      setUserDetails(data);
    }
    setLoading(false);
  };

  // Uploads a profile image to Supabase Storage and returns the public URL
  const uploadProfileImage = async (uri: string, oldImageUrl?: string): Promise<string | null> => {
    if (!user) return null;
    try {
      // Delete old image if oldImageUrl is provided
      if (oldImageUrl) {
        // Extract file name from the URL
        const parts = oldImageUrl.split('/');
        const fileName = parts[parts.length - 1].split('?')[0];
        if (fileName) {
          await supabase.storage.from('profileimages').remove([fileName]);
        }
      }
      // Read the file as base64 using expo-file-system
      const fileExt = uri.split('.').pop();
      const fileName = `${user.id}_${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;
      const base64 = await FileSystem.readAsStringAsync(uri, { encoding: FileSystem.EncodingType.Base64 });
      const contentType = `image/${fileExt === 'jpg' ? 'jpeg' : fileExt}`;
      const blob = Buffer.from(base64, 'base64');
      let { error: uploadError } = await supabase.storage
        .from('profileimages')
        .upload(filePath, blob, {
          contentType,
          upsert: true,
        });
      if (uploadError) throw uploadError;
      const { data } = supabase.storage.from('profileimages').getPublicUrl(filePath);
      return data.publicUrl;
    } catch (e) {
      console.error('Image upload error:', e);
      return null;
    }
  };

  useEffect(() => {
    if (user) {
      fetchUserDetails();
    } else {
      setUserDetails(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  // Calculate team-related boolean values
  const isTeamMember = userDetails?.team_role === 'member';
  const isTeamLeader = userDetails?.team_role === 'leader' || !userDetails?.team_role;
  const hasRestrictedAccess = userDetails?.has_restricted_access || false;

  return (
    <UserContext.Provider value={{ 
      userDetails, 
      loading, 
      fetchUserDetails, 
      updateUserDetails, 
      uploadProfileImage,
      isTeamMember,
      isTeamLeader,
      hasRestrictedAccess
    }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  return useContext(UserContext);
} 