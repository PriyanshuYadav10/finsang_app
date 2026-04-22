import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/lib/supabase';
import { useUser } from './UserContext';
import * as Crypto from 'expo-crypto';

export interface Address {
  id: string;
  type: 'home' | 'work' | 'other';
  name: string;
  phone: string;
  address_line1: string;
  address_line2?: string;
  city: string;
  state: string;
  pincode: string;
  is_default: boolean;
  created_at: string;
}

interface AddressContextType {
  addresses: Address[];
  addAddress: (address: Omit<Address, 'id' | 'created_at'>) => Promise<void>;
  updateAddress: (id: string, address: Partial<Address>) => Promise<void>;
  deleteAddress: (id: string) => Promise<void>;
  setDefaultAddress: (id: string) => Promise<void>;
  getDefaultAddress: () => Address | null;
  loading: boolean;
}

const AddressContext = createContext<AddressContextType | undefined>(undefined);

export const useAddress = () => {
  const context = useContext(AddressContext);
  if (!context) {
    throw new Error('useAddress must be used within an AddressProvider');
  }
  return context;
};

interface AddressProviderProps {
  children: ReactNode;
}

export const AddressProvider: React.FC<AddressProviderProps> = ({ children }) => {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const { userDetails } = useUser();

  useEffect(() => {
    if (userDetails?.id) {
      loadAddresses();
    }
  }, [userDetails?.id]);

  const loadAddresses = async () => {
    try {
      setLoading(true);
      const { data: userData, error } = await supabase
        .from('users')
        .select('addresses')
        .eq('id', userDetails?.id)
        .single();

      if (error) {
        console.error('Error loading addresses:', error);
        return;
      }

      const userAddresses = userData?.addresses || [];
      setAddresses(userAddresses);
    } catch (error) {
      console.error('Error loading addresses:', error);
    } finally {
      setLoading(false);
    }
  };

  const addAddress = async (address: Omit<Address, 'id' | 'created_at'>) => {
    try {
      if (!userDetails?.id) {
        console.error('User not logged in');
        return;
      }

      const newAddress: Address = {
        ...address,
        id: Crypto.randomUUID(),
        created_at: new Date().toISOString(),
      };

      // If this is the first address, make it default
      if (addresses.length === 0) {
        newAddress.is_default = true;
      }

      // If this address is set as default, unset other defaults
      if (newAddress.is_default) {
        const updatedAddresses = addresses.map(addr => ({
          ...addr,
          is_default: false
        }));
        setAddresses([...updatedAddresses, newAddress]);
      } else {
        setAddresses([...addresses, newAddress]);
      }

      // Update the addresses in the users table
      const { error } = await supabase
        .from('users')
        .update({ 
          addresses: newAddress.is_default 
            ? addresses.map(addr => ({ ...addr, is_default: false })).concat(newAddress)
            : addresses.concat(newAddress)
        })
        .eq('id', userDetails.id);

      if (error) {
        console.error('Error adding address:', error);
        // Revert local state on error
        setAddresses(addresses);
      }
    } catch (error) {
      console.error('Error adding address:', error);
    }
  };

  const updateAddress = async (id: string, updates: Partial<Address>) => {
    try {
      if (!userDetails?.id) {
        console.error('User not logged in');
        return;
      }

      const updatedAddresses = addresses.map(addr => 
        addr.id === id ? { ...addr, ...updates } : addr
      );

      // If setting as default, unset other defaults
      if (updates.is_default) {
        updatedAddresses.forEach(addr => {
          if (addr.id !== id) {
            addr.is_default = false;
          }
        });
      }

      setAddresses(updatedAddresses);

      const { error } = await supabase
        .from('users')
        .update({ addresses: updatedAddresses })
        .eq('id', userDetails.id);

      if (error) {
        console.error('Error updating address:', error);
        // Revert local state on error
        setAddresses(addresses);
      }
    } catch (error) {
      console.error('Error updating address:', error);
    }
  };

  const deleteAddress = async (id: string) => {
    try {
      if (!userDetails?.id) {
        console.error('User not logged in');
        return;
      }

      const addressToDelete = addresses.find(addr => addr.id === id);
      const updatedAddresses = addresses.filter(addr => addr.id !== id);

      // If deleting the default address, make the first remaining address default
      if (addressToDelete?.is_default && updatedAddresses.length > 0) {
        updatedAddresses[0].is_default = true;
      }

      setAddresses(updatedAddresses);

      const { error } = await supabase
        .from('users')
        .update({ addresses: updatedAddresses })
        .eq('id', userDetails.id);

      if (error) {
        console.error('Error deleting address:', error);
        // Revert local state on error
        setAddresses(addresses);
      }
    } catch (error) {
      console.error('Error deleting address:', error);
    }
  };

  const setDefaultAddress = async (id: string) => {
    await updateAddress(id, { is_default: true });
  };

  const getDefaultAddress = () => {
    return addresses.find(addr => addr.is_default) || null;
  };

  const value: AddressContextType = {
    addresses,
    addAddress,
    updateAddress,
    deleteAddress,
    setDefaultAddress,
    getDefaultAddress,
    loading,
  };

  return (
    <AddressContext.Provider value={value}>
      {children}
    </AddressContext.Provider>
  );
};
