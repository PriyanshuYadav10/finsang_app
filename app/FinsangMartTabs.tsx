import { Ionicons } from '@expo/vector-icons';
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import React from "react";
import BackToMainAppTab from "./finsangMartPages/BackToMainAppTab";
import HomeScreen from "./finsangMartPages/HomeScreen";
import ProductsScreen from "./finsangMartPages/ProductsScreen";
import ProfileScreen from "./finsangMartPages/ProfileScreen";
import CartScreen from "./finsangMartPages/CartScreen";
import Colors from '@/constants/Colors';
import { useCart } from "../Contexts/CartContext";

const Tab = createBottomTabNavigator();

export default function FinsangMartTabs() {
  const { getCartCount } = useCart();
  
  return (
    <>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ color, size }) => {
            let iconName = '';
            switch (route.name) {
              case 'Home': iconName = 'home-outline'; break;
              case 'Products': iconName = 'pricetags-outline'; break;
              case 'Cart': iconName = 'cart-outline'; break;
              case 'Profile': iconName = 'person-circle-outline'; break;
              case 'Back': iconName = 'arrow-back-circle-outline'; break;
            }
            return <Ionicons name={iconName as any} size={size} color={color} />;
          },
          tabBarActiveTintColor: '#2f2f2f',
          tabBarInactiveTintColor: '#aaa',
          headerShown: true,
          headerStyle: {
            backgroundColor: Colors.primary
          },
          headerTitleStyle: {
            color: Colors.white
          },
          headerLeft: () => {
            let iconName = '';
            switch (route.name) {
              case 'Home': iconName = 'home'; break;
              case 'Products': iconName = 'pricetags'; break;
              case 'Cart': iconName = 'cart'; break;
              case 'Profile': iconName = 'person-circle'; break;
              case 'Back': iconName = 'arrow-back-circle'; break;
            }
            return (
              <Ionicons
                name={iconName as any}
                size={25}
                color={'white'}
                style={{ marginLeft: 15, padding: 10 }}
              />
            );
          },
        })}
      >
        <Tab.Screen name="Home" component={HomeScreen} />
        <Tab.Screen name="Products" component={ProductsScreen} />
        <Tab.Screen 
          name="Cart" 
          component={CartScreen} 
          options={{ 
            tabBarBadge: getCartCount() > 0 ? getCartCount() : undefined,
            tabBarBadgeStyle: { backgroundColor: '#ef4444' }
          }} 
        />
        <Tab.Screen name="Profile" component={ProfileScreen} />
        <Tab.Screen name="Back" component={BackToMainAppTab} options={{ title: "Back" }} />
      </Tab.Navigator>

     
    </>
  );
} 