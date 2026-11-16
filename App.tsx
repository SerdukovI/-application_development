// App.tsx
import React, { useState, useEffect } from "react";
import {
	NavigationContainer,
	DefaultTheme,
	DarkTheme,
} from "@react-navigation/native";
import { seedInitialData } from "./src/database/seedData";
import AppNavigator from "./src/navigation/AppNavigator";
import { initDatabase } from "./src/database/db";
import LoginScreen from "./src/screens/LoginScreen";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { View, ActivityIndicator } from "react-native";
import { ThemeProvider, useTheme } from "./src/context/ThemeContext";

function AppContent() {
	const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);
	const { isDark, colors } = useTheme();

	useEffect(() => {
		initDatabase();
		seedInitialData();
		checkLogin();
	}, []);

	const checkLogin = async () => {
		try {
			const login = await AsyncStorage.getItem("@user_login");
			setIsLoggedIn(!!login);
		} catch (e) {
			setIsLoggedIn(false);
		}
	};

	if (isLoggedIn === null) {
		return (
			<View
				style={{
					flex: 1,
					justifyContent: "center",
					alignItems: "center",
					backgroundColor: colors.background,
				}}
			>
				<ActivityIndicator size="large" color={colors.primary} />
			</View>
		);
	}

	return (
		<NavigationContainer theme={isDark ? DarkTheme : DefaultTheme}>
			{isLoggedIn ? (
				<AppNavigator onLogout={() => setIsLoggedIn(false)} />
			) : (
				<LoginScreen onLogin={() => setIsLoggedIn(true)} />
			)}
		</NavigationContainer>
	);
}

export default function App() {
	return (
		<ThemeProvider>
			<AppContent />
		</ThemeProvider>
	);
}
