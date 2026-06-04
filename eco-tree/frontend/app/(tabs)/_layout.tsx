import { Tabs } from "expo-router";
import CustomTabBar from "../../components/CustomTabBar";
import type { BottomTabBarProps } from "@react-navigation/bottom-tabs";

const renderTabBar = (props: BottomTabBarProps) => <CustomTabBar {...props} />;

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{ headerShown: false }}
      tabBar={renderTabBar}
    >
      <Tabs.Screen name="index" options={{ title: "Home" }} />
      <Tabs.Screen name="map" options={{ title: "Map" }} />
      <Tabs.Screen name="qr-scan" options={{ title: "Scan" }} />
      <Tabs.Screen name="ai" options={{ title: "Assistant" }} />
      <Tabs.Screen name="profile" options={{ title: "Profile" }} />
    </Tabs>
  );
}
