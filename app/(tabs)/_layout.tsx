import { useExperienceSwitch } from "@/Contexts/ExperienceContext";
import { useSearch } from "@/Contexts/SearchContext";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { Tabs } from "expo-router";
import { TouchableOpacity } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Colors from "../../constants/Colors";

export default function TabLayout() {
  const insets = useSafeAreaInsets();
  const { switchToExperience } = useExperienceSwitch();
  const { setSearchVisible } = useSearch();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors.primary,
        tabBarShowLabel: true,
        tabBarStyle: {
          height: 55 + insets.bottom,
          paddingTop: 4,
          // paddingBottom: insets.bottom,
        },
        headerTitleStyle: {
          fontSize: 18,
          fontWeight: "600",
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color }) => (
            <FontAwesome size={22} name="home" color={color} />
          ),
          headerTintColor: "white",
          // headerStyle: {
          //   backgroundColor: Colors.primary,
          // },
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="products"
        options={{
          title: "Products",
          tabBarIcon: ({ color }) => (
            <FontAwesome size={22} name="th-large" color={color} />
          ),
          headerTintColor: "white",
          headerStyle: {
            backgroundColor: Colors.primary,
          },
          headerLeft: () => (
            <TouchableOpacity onPress={() => setSearchVisible(true)}>
              <FontAwesome
                name="search"
                size={25}
                color={"white"}
                style={{ marginLeft: 15, padding: 10 }}
              />
            </TouchableOpacity>
          ),
        }}
      />
      <Tabs.Screen
        name="grow"
        options={{
          title: "Grow your Customers",
          tabBarIcon: ({ color }) => (
            <FontAwesome size={22} name="dollar" color={color} />
          ),
          headerTintColor: "white",
          headerStyle: {
            backgroundColor: Colors.primary,
          },
          headerLeft: () => (
            <FontAwesome
              name="line-chart"
              size={25}
              color={"white"}
              style={{ marginLeft: 15, padding: 10 }}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="training"
        options={{
          title: "Training",
          tabBarIcon: ({ color }) => (
            <FontAwesome size={22} name="book" color={color} />
          ),
          headerTintColor: "white",
          headerStyle: {
            backgroundColor: Colors.primary,
          },
          headerLeft: () => (
            <FontAwesome
              name="question-circle"
              size={25}
              color={"white"}
              style={{ marginLeft: 15, padding: 10 }}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="leads"
        options={{
          title: "Leads",
          tabBarIcon: ({ color }) => (
            <FontAwesome size={22} name="users" color={color} />
          ),
          headerTintColor: "white",
          headerStyle: {
            backgroundColor: Colors.primary,
          },
          headerLeft: () => (
            <FontAwesome
              name="user-plus"
              size={25}
              color={"white"}
              style={{ marginLeft: 15, padding: 10 }}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="mart"
        options={{
          title: "Mart",
          tabBarIcon: ({ color }) => (
            <FontAwesome size={22} name="shopping-cart" color={color} />
          ),
          headerTintColor: "white",
          headerStyle: {
            backgroundColor: Colors.primary,
          },
        }}
        listeners={{
          tabPress: (e) => {
            e.preventDefault();
            switchToExperience("finsangmart");
          },
        }}
      />
    </Tabs>
  );
}
