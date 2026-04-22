import { supabase } from './supabase';

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  product_name: string;
  product_image_url?: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  created_at: string;
}

export interface Order {
  id: string;
  user_id: string;
  shop_id: string;
  order_number: string;
  total_amount: number;
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  shipping_address: any;
  payment_status: 'pending' | 'paid' | 'failed' | 'refunded';
  payment_method?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  order_items?: OrderItem[];
  shop_name?: string;
}

export interface CreateOrderData {
  shop_id: string;
  total_amount: number;
  shipping_address: any;
  payment_method?: string;
  notes?: string;
  items: Array<{
    product_id: string;
    product_name: string;
    product_image_url?: string;
    quantity: number;
    unit_price: number;
    total_price: number;
  }>;
}

export interface OrdersResponse {
  orders: Order[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export const ordersApi = {
  // Create a new order
  async createOrder(orderData: CreateOrderData): Promise<Order> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      // Start a transaction
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          user_id: user.id,
          shop_id: orderData.shop_id,
          total_amount: orderData.total_amount,
          shipping_address: orderData.shipping_address,
          payment_method: orderData.payment_method,
          notes: orderData.notes
        })
        .select()
        .single();

      if (orderError) {
        throw orderError;
      }

      // Insert order items
      const orderItems = orderData.items.map(item => ({
        order_id: order.id,
        ...item
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) {
        throw itemsError;
      }

      return order;
    } catch (error) {
      console.error('Error creating order:', error);
      throw error;
    }
  },

  // Get user's order history
  async getUserOrders({ page = 1, limit = 20, status }: { page?: number; limit?: number; status?: string }): Promise<OrdersResponse> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      let query = supabase
        .from('orders')
        .select(`
          *,
          order_items (*),
          user_shops!orders_shop_id_fkey (shop_name)
        `, { count: 'exact' })
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      // Apply status filter
      if (status && status !== 'all') {
        query = query.eq('status', status);
      }

      // Apply pagination
      const offset = (page - 1) * limit;
      query = query.range(offset, offset + limit - 1);

      const { data, error, count } = await query;

      if (error) {
        throw error;
      }

      return {
        orders: data || [],
        pagination: {
          page,
          limit,
          total: count || 0,
          totalPages: Math.ceil((count || 0) / limit)
        }
      };
    } catch (error) {
      console.error('Error fetching user orders:', error);
      throw error;
    }
  },

  // Get order details by ID
  async getOrderById(orderId: string): Promise<Order> {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (*),
          user_shops!orders_shop_id_fkey (shop_name)
        `)
        .eq('id', orderId)
        .single();

      if (error) {
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error fetching order:', error);
      throw error;
    }
  },

  // Update order status
  async updateOrderStatus(orderId: string, status: Order['status']): Promise<Order> {
    try {
      const { data, error } = await supabase
        .from('orders')
        .update({ status })
        .eq('id', orderId)
        .select()
        .single();

      if (error) {
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error updating order status:', error);
      throw error;
    }
  },

  // Cancel order
  async cancelOrder(orderId: string): Promise<Order> {
    try {
      const { data, error } = await supabase
        .from('orders')
        .update({ 
          status: 'cancelled',
          notes: 'Order cancelled by user'
        })
        .eq('id', orderId)
        .select()
        .single();

      if (error) {
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error cancelling order:', error);
      throw error;
    }
  }
};
