// src/navigation/AppNavigator.tsx
import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../context/ThemeContext";

// Импорты экранов
import GarageScreen from "../screens/GarageScreen";
import TripsScreen from "../screens/TripsScreen";
import FuelScreen from "../screens/FuelScreen";
import AnalyticsScreen from "../screens/AnalyticsScreen";
import RemindersScreen from "../screens/RemindersScreen";
import ServiceScreen from "../screens/ServiceScreen";
import ParkingScreen from "../screens/ParkingScreen";
import ProfileScreen from "../screens/ProfileScreen";
import AboutScreen from "../screens/AboutScreen";

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function TabNavigator({ onLogout }: { onLogout: () => void }) {
	const { colors } = useTheme();

	return (
		<Tab.Navigator
			screenOptions={({ route }) => ({
				headerShown: false,
				tabBarActiveTintColor: colors.primary,
				tabBarInactiveTintColor: colors.subtext,
				tabBarStyle: {
					backgroundColor: colors.card,
					borderTopColor: colors.border,
				},
				tabBarIcon: ({ color, size }) => {
					let iconName: any;
					if (route.name === "Гараж") iconName = "car-sport-outline";
					else if (route.name === "Поездки") iconName = "map-outline";
					else if (route.name === "Заправки") iconName = "water-outline";
					else if (route.name === "Аналитика") iconName = "pie-chart-outline";
					else if (route.name === "Напоминания")
						iconName = "notifications-outline";
					return <Ionicons name={iconName} size={size} color={color} />;
				},
			})}
		>
			<Tab.Screen name="Гараж">
				{(props) => <GarageScreen {...props} onLogout={onLogout} />}
			</Tab.Screen>
			<Tab.Screen name="Поездки" component={TripsScreen} />
			<Tab.Screen name="Заправки" component={FuelScreen} />
			<Tab.Screen name="Аналитика" component={AnalyticsScreen} />
			<Tab.Screen name="Напоминания" component={RemindersScreen} />
		</Tab.Navigator>
	);
}

export default function AppNavigator({ onLogout }: { onLogout: () => void }) {
	const { colors } = useTheme();

	const headerOptions = {
		headerTintColor: colors.primary,
		headerStyle: { backgroundColor: colors.card },
		headerTitleStyle: { color: colors.text },
	};

	return (
		<Stack.Navigator>
			<Stack.Screen name="MainTabs" options={{ headerShown: false }}>
				{(props) => <TabNavigator {...props} onLogout={onLogout} />}
			</Stack.Screen>

			<Stack.Screen
				name="Service"
				component={ServiceScreen}
				options={{ ...headerOptions, title: "Ремонты и ТО" }}
			/>

			<Stack.Screen
				name="Parking"
				component={ParkingScreen}
				options={{ ...headerOptions, title: "Где моё авто?" }}
			/>

			<Stack.Screen name="Profile">
				{(props) => <ProfileScreen {...props} onLogout={onLogout} />}
			</Stack.Screen>

			{/* РЕГИСТРАЦИЯ ЭКРАНА "О ПРИЛОЖЕНИИ" */}
			<Stack.Screen
				name="About"
				component={AboutScreen}
				options={{ ...headerOptions, title: "О приложении" }}
			/>
		</Stack.Navigator>
	);
}
