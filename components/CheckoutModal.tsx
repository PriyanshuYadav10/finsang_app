import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import CustomAlert from './CustomAlert';
import { useCart } from '../Contexts/CartContext';
import { useAddress, Address } from '../Contexts/AddressContext';
import AddressForm from './AddressForm';
import Colors from '@/constants/Colors';

interface CheckoutModalProps {
  visible: boolean;
  onClose: () => void;
  onCheckout: (selectedAddress: Address) => void;
}

export default function CheckoutModal({ visible, onClose, onCheckout }: CheckoutModalProps) {
  const { cartItems, getCartTotal, getCartCount } = useCart();
  const { addresses, getDefaultAddress, setDefaultAddress, deleteAddress } = useAddress();
  
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [loading, setLoading] = useState(false);
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertConfig, setAlertConfig] = useState({
    title: "",
    message: "",
    type: "info" as "success" | "error" | "warning" | "info",
    onConfirm: () => {},
    showCancel: false
  });

  // Set default address as selected when modal opens
  React.useEffect(() => {
    if (visible) {
      const defaultAddr = getDefaultAddress();
      setSelectedAddress(defaultAddr);
    }
  }, [visible, addresses]);

  const handleAddressSelect = (address: Address) => {
    setSelectedAddress(address);
  };

  const handleAddAddress = () => {
    setEditingAddress(null);
    setShowAddressForm(true);
  };

  const handleEditAddress = (address: Address) => {
    setEditingAddress(address);
    setShowAddressForm(true);
  };

  const handleAddressFormSave = () => {
    setShowAddressForm(false);
    setEditingAddress(null);
    // Refresh selected address
    const defaultAddr = getDefaultAddress();
    setSelectedAddress(defaultAddr);
  };

  const handleAddressFormCancel = () => {
    setShowAddressForm(false);
    setEditingAddress(null);
  };

  const handleSetDefaultAddress = async (address: Address) => {
    try {
      await setDefaultAddress(address.id);
    } catch (error) {
      setAlertConfig({
        title: "Error",
        message: "Failed to set default address",
        type: "error",
        onConfirm: () => setAlertVisible(false),
        showCancel: false
      });
      setAlertVisible(true);
    }
  };

  const handleDeleteAddress = async (address: Address) => {
    setAlertConfig({
      title: "Delete Address",
      message: "Are you sure you want to delete this address?",
      type: "warning",
      onConfirm: async () => {
        setAlertVisible(false);
        try {
          await deleteAddress(address.id);
          if (selectedAddress?.id === address.id) {
            const defaultAddr = getDefaultAddress();
            setSelectedAddress(defaultAddr);
          }
        } catch (error) {
          setAlertConfig({
            title: "Error",
            message: "Failed to delete address",
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

  const handleProceedToCheckout = async () => {
    if (!selectedAddress) {
      setAlertConfig({
        title: "Error",
        message: "Please select a delivery address",
        type: "error",
        onConfirm: () => setAlertVisible(false),
        showCancel: false
      });
      setAlertVisible(true);
      return;
    }

    if (cartItems.length === 0) {
      setAlertConfig({
        title: "Error",
        message: "Your cart is empty",
        type: "error",
        onConfirm: () => setAlertVisible(false),
        showCancel: false
      });
      setAlertVisible(true);
      return;
    }

    setLoading(true);
    try {
      await onCheckout(selectedAddress);
    } catch (error) {
      setAlertConfig({
        title: "Error",
        message: "Failed to process checkout",
        type: "error",
        onConfirm: () => setAlertVisible(false),
        showCancel: false
      });
      setAlertVisible(true);
    } finally {
      setLoading(false);
    }
  };

  const renderAddressCard = (address: Address) => {
    const isSelected = selectedAddress?.id === address.id;
    
    return (
      <TouchableOpacity
        key={address.id}
        style={[styles.addressCard, isSelected && styles.addressCardSelected]}
        onPress={() => handleAddressSelect(address)}
      >
        <View style={styles.addressHeader}>
          <View style={styles.addressTypeContainer}>
            <Ionicons 
              name={address.type === 'home' ? 'home' : address.type === 'work' ? 'business' : 'location'} 
              size={16} 
              color={Colors.primary} 
            />
            <Text style={styles.addressType}>
              {address.type.charAt(0).toUpperCase() + address.type.slice(1)}
            </Text>
            {address.is_default && (
              <View style={styles.defaultBadge}>
                <Text style={styles.defaultBadgeText}>Default</Text>
              </View>
            )}
          </View>
          
          <View style={styles.addressActions}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => handleEditAddress(address)}
            >
              <Ionicons name="create-outline" size={16} color="#6b7280" />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => handleDeleteAddress(address)}
            >
              <Ionicons name="trash-outline" size={16} color="#ef4444" />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.addressContent}>
          <Text style={styles.addressName}>{address.name}</Text>
          <Text style={styles.addressPhone}>{address.phone}</Text>
          <Text style={styles.addressText}>
            {address.address_line1}
            {address.address_line2 && `, ${address.address_line2}`}
          </Text>
          <Text style={styles.addressText}>
            {address.city}, {address.state} - {address.pincode}
          </Text>
        </View>

        {isSelected && (
          <View style={styles.selectedIndicator}>
            <Ionicons name="checkmark-circle" size={20} color={Colors.primary} />
            <Text style={styles.selectedText}>Selected</Text>
          </View>
        )}

        {!address.is_default && (
          <TouchableOpacity
            style={styles.setDefaultButton}
            onPress={() => handleSetDefaultAddress(address)}
          >
            <Text style={styles.setDefaultText}>Set as Default</Text>
          </TouchableOpacity>
        )}
      </TouchableOpacity>
    );
  };

  if (showAddressForm) {
    return (
      <Modal
        visible={visible}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <AddressForm
          address={editingAddress || undefined}
          onSave={handleAddressFormSave}
          onCancel={handleAddressFormCancel}
          isEditing={!!editingAddress}
        />
      </Modal>
    );
  }

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color="#6b7280" />
          </TouchableOpacity>
          <Text style={styles.title}>Checkout</Text>
          <View style={styles.headerRight} />
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Delivery Address Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Delivery Address</Text>
              <TouchableOpacity onPress={handleAddAddress} style={styles.addButton}>
                <Ionicons name="add" size={20} color={Colors.primary} />
                <Text style={styles.addButtonText}>Add Address</Text>
              </TouchableOpacity>
            </View>

            {addresses.length === 0 ? (
              <View style={styles.emptyAddress}>
                <Ionicons name="location-outline" size={48} color="#9ca3af" />
                <Text style={styles.emptyAddressTitle}>No addresses found</Text>
                <Text style={styles.emptyAddressText}>Add a delivery address to continue</Text>
                <TouchableOpacity style={styles.addFirstAddressButton} onPress={handleAddAddress}>
                  <Text style={styles.addFirstAddressText}>Add Your First Address</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.addressesList}>
                {addresses.map(renderAddressCard)}
              </View>
            )}
          </View>

          {/* Order Summary Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Order Summary</Text>
            
            <View style={styles.orderItems}>
              {cartItems.map((item) => (
                <View key={item.id} style={styles.orderItem}>
                  <View style={styles.orderItemInfo}>
                    <Text style={styles.orderItemName} numberOfLines={2}>{item.name}</Text>
                    <Text style={styles.orderItemQuantity}>Qty: {item.quantity}</Text>
                  </View>
                  <Text style={styles.orderItemPrice}>₹{(item.price * item.quantity).toFixed(2)}</Text>
                </View>
              ))}
            </View>

            <View style={styles.orderSummary}>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Subtotal ({getCartCount()} items)</Text>
                <Text style={styles.summaryValue}>₹{getCartTotal().toFixed(2)}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Delivery Fee</Text>
                <Text style={styles.summaryValue}>₹0.00</Text>
              </View>
              <View style={styles.summaryDivider} />
              <View style={styles.summaryRow}>
                <Text style={styles.totalLabel}>Total</Text>
                <Text style={styles.totalValue}>₹{getCartTotal().toFixed(2)}</Text>
              </View>
            </View>
          </View>
        </ScrollView>

        {/* Bottom Action Bar */}
        <View style={styles.bottomBar}>
          <View style={styles.totalContainer}>
            <Text style={styles.totalText}>Total: ₹{getCartTotal().toFixed(2)}</Text>
          </View>
          
          <TouchableOpacity
            style={[
              styles.checkoutButton,
              (!selectedAddress || cartItems.length === 0 || loading) && styles.checkoutButtonDisabled
            ]}
            onPress={handleProceedToCheckout}
            disabled={!selectedAddress || cartItems.length === 0 || loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#ffffff" />
            ) : (
              <>
                <Ionicons name="card-outline" size={20} color="#ffffff" />
                <Text style={styles.checkoutButtonText}>Proceed to Payment</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
        
        <CustomAlert
          visible={alertVisible}
          title={alertConfig.title}
          message={alertConfig.message}
          type={alertConfig.type}
          onConfirm={alertConfig.onConfirm}
          onCancel={alertConfig.showCancel ? () => setAlertVisible(false) : undefined}
          cancelText="Cancel"
          confirmText={alertConfig.title === "Delete Address" ? "Delete" : "OK"}
        />
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  closeButton: {
    padding: 4,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1f2937',
  },
  headerRight: {
    width: 32,
  },
  content: {
    flex: 1,
  },
  section: {
    backgroundColor: '#ffffff',
    marginBottom: 16,
    padding: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1f2937',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  addButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.primary,
  },
  emptyAddress: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyAddressTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyAddressText: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 24,
  },
  addFirstAddressButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  addFirstAddressText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  addressesList: {
    gap: 12,
  },
  addressCard: {
    borderWidth: 2,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    padding: 16,
    backgroundColor: '#ffffff',
  },
  addressCardSelected: {
    borderColor: Colors.primary,
    backgroundColor: '#f0f9ff',
  },
  addressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  addressTypeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  addressType: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.primary,
  },
  defaultBadge: {
    backgroundColor: '#10b981',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  defaultBadgeText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: '600',
  },
  addressActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    padding: 4,
  },
  addressContent: {
    gap: 4,
  },
  addressName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },
  addressPhone: {
    fontSize: 14,
    color: '#6b7280',
  },
  addressText: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
  },
  selectedIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  selectedText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.primary,
  },
  setDefaultButton: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  setDefaultText: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: '500',
  },
  orderItems: {
    gap: 12,
    marginBottom: 20,
  },
  orderItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingVertical: 8,
  },
  orderItemInfo: {
    flex: 1,
    marginRight: 16,
  },
  orderItemName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1f2937',
    marginBottom: 4,
  },
  orderItemQuantity: {
    fontSize: 12,
    color: '#6b7280',
  },
  orderItemPrice: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
  },
  orderSummary: {
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    paddingTop: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#6b7280',
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1f2937',
  },
  summaryDivider: {
    height: 1,
    backgroundColor: '#e5e7eb',
    marginVertical: 12,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1f2937',
  },
  totalValue: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.primary,
  },
  bottomBar: {
    backgroundColor: '#ffffff',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  totalContainer: {
    flex: 1,
  },
  totalText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },
  checkoutButton: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    gap: 8,
  },
  checkoutButtonDisabled: {
    backgroundColor: '#9ca3af',
  },
  checkoutButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
});
