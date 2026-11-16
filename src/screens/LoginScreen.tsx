// src/screens/LoginScreen.tsx
import React, { useState } from "react";
import {
	View,
	Text,
	TextInput,
	TouchableOpacity,
	StyleSheet,
	Alert,
	KeyboardAvoidingView,
	Platform,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useTheme } from "../context/ThemeContext";

export default function LoginScreen({ onLogin }: { onLogin: () => void }) {
	const [login, setLogin] = useState("");
	const [password, setPassword] = useState("");
	const { colors } = useTheme();

	const handleLogin = async () => {
		// ВАЛИДАЦИЯ
		if (login.trim().length < 3) {
			Alert.alert("Ошибка", "Логин должен содержать минимум 3 символа.");
			return;
		}
		if (password.length < 4) {
			Alert.alert("Ошибка", "Пароль должен содержать минимум 4 символа.");
			return;
		}

		try {
			// Для демо просто сохраняем
			await AsyncStorage.setItem("@user_login", login);
			await AsyncStorage.setItem("@user_password", password);
			onLogin();
		} catch (e) {
			Alert.alert("Ошибка", "Не удалось сохранить данные.");
		}
	};

	return (
		<KeyboardAvoidingView
			behavior={Platform.OS === "ios" ? "padding" : "height"}
			style={[styles.container, { backgroundColor: colors.background }]}
		>
			<Text style={[styles.logo, { color: colors.primary }]}>AutoTracker</Text>
			<Text style={[styles.subtitle, { color: colors.subtext }]}>
				Войдите в свой аккаунт
			</Text>

			<TextInput
				style={[
					styles.input,
					{
						backgroundColor: colors.card,
						color: colors.text,
						borderColor: colors.border,
					},
				]}
				placeholder="Логин"
				placeholderTextColor={colors.subtext}
				value={login}
				onChangeText={setLogin}
				autoCapitalize="none"
			/>

			<TextInput
				style={[
					styles.input,
					{
						backgroundColor: colors.card,
						color: colors.text,
						borderColor: colors.border,
					},
				]}
				placeholder="Пароль"
				placeholderTextColor={colors.subtext}
				value={password}
				onChangeText={setPassword}
				secureTextEntry
			/>

			<TouchableOpacity
				style={[styles.button, { backgroundColor: colors.primary }]}
				onPress={handleLogin}
			>
				<Text style={styles.buttonText}>Войти</Text>
			</TouchableOpacity>
		</KeyboardAvoidingView>
	);
}

const styles = StyleSheet.create({
	container: { flex: 1, justifyContent: "center", padding: 20 },
	logo: {
		fontSize: 36,
		fontWeight: "bold",
		textAlign: "center",
		marginBottom: 8,
	},
	subtitle: { fontSize: 16, textAlign: "center", marginBottom: 40 },
	input: {
		padding: 16,
		borderRadius: 12,
		fontSize: 16,
		marginBottom: 16,
		borderWidth: 1,
	},
	button: { padding: 16, borderRadius: 12, alignItems: "center" },
	buttonText: { color: "#fff", fontSize: 18, fontWeight: "bold" },
});
