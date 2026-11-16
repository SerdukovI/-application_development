// src/context/ThemeContext.tsx
import React, { createContext, useState, useContext, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const lightColors = {
	background: "#f5f6fa",
	card: "#ffffff",
	text: "#2f3640",
	subtext: "#718093",
	primary: "#0097e6",
	inputBg: "#f5f6fa",
	border: "#dcdde1",
};

export const darkColors = {
	background: "#121212",
	card: "#1e1e1e",
	text: "#ffffff",
	subtext: "#a0a0a0",
	primary: "#0097e6",
	inputBg: "#2d2d2d",
	border: "#444444",
};

const ThemeContext = createContext<any>(null);

export const ThemeProvider = ({ children }: any) => {
	const [isDark, setIsDark] = useState(false);

	useEffect(() => {
		const loadTheme = async () => {
			const savedTheme = await AsyncStorage.getItem("@dark_mode");
			if (savedTheme === "true") setIsDark(true);
		};
		loadTheme();
	}, []);

	const toggleTheme = async () => {
		const newMode = !isDark;
		setIsDark(newMode);
		await AsyncStorage.setItem("@dark_mode", String(newMode));
	};

	const colors = isDark ? darkColors : lightColors;

	return (
		<ThemeContext.Provider value={{ isDark, toggleTheme, colors }}>
			{children}
		</ThemeContext.Provider>
	);
};

export const useTheme = () => useContext(ThemeContext);
