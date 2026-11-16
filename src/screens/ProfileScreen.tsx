// src/screens/ProfileScreen.tsx
import React, { useState, useEffect } from "react";
import {
	View,
	Text,
	TouchableOpacity,
	StyleSheet,
	Switch,
	Image,
	Alert,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useTheme } from "../context/ThemeContext";

export default function ProfileScreen({ onLogout, navigation }: any) {
	const [userName, setUserName] = useState("Пользователь");
	const [avatarUri, setAvatarUri] = useState<string | null>(null);
	const { isDark, toggleTheme, colors } = useTheme();

	useEffect(() => {
		const loadData = async () => {
			const name = await AsyncStorage.getItem("@user_login");
			if (name) setUserName(name);

			const savedAvatar = await AsyncStorage.getItem("@user_avatar");
			if (savedAvatar) setAvatarUri(savedAvatar);
		};
		loadData();
	}, []);

	const handleLogout = async () => {
		await AsyncStorage.removeItem("@user_login");
		await AsyncStorage.removeItem("@user_password");
		// Фото можно оставить или тоже удалить, оставим на память
		onLogout();
	};

	const pickImage = async () => {
		// 1. Запрашиваем разрешение на доступ к галерее
		const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

		if (status !== "granted") {
			Alert.alert(
				"Ошибка",
				"Нам нужен доступ к вашей галерее, чтобы выбрать фото.",
			);
			return;
		}

		// 2. Открываем галерею
		const result = await ImagePicker.launchImageLibraryAsync({
			mediaTypes: ImagePicker.MediaTypeOptions.Images,
			allowsEditing: true,
			aspect: [1, 1], // Квадратное фото для аватарки
			quality: 0.5, // Сжимаем качество, чтобы не занимало много места
		});

		// 3. Если пользователь выбрал фото, сохраняем его
		if (!result.canceled) {
			const uri = result.assets[0].uri;
			setAvatarUri(uri);
			await AsyncStorage.setItem("@user_avatar", uri);
		}
	};

	return (
		<View style={[styles.container, { backgroundColor: colors.background }]}>
			{/* Блок аватарки */}
			<TouchableOpacity onPress={pickImage} style={styles.avatarContainer}>
				{avatarUri ? (
					<Image source={{ uri: avatarUri }} style={styles.avatarImage} />
				) : (
					<View
						style={[
							styles.avatarPlaceholder,
							{ backgroundColor: colors.primary },
						]}
					>
						<Text style={styles.avatarText}>
							{userName.charAt(0).toUpperCase()}
						</Text>
					</View>
				)}

				{/* Иконка камеры поверх аватарки */}
				<View
					style={[styles.cameraIconBadge, { backgroundColor: colors.card }]}
				>
					<Ionicons name="camera" size={20} color={colors.primary} />
				</View>
			</TouchableOpacity>

			<Text style={[styles.name, { color: colors.text }]}>{userName}</Text>
			<Text style={[styles.role, { color: colors.subtext }]}>Водитель</Text>

			{/* Блок настроек */}
			<View style={{ width: "100%", marginBottom: 20 }}>
				{/* Переключатель темы */}
				<View
					style={[
						styles.themeToggle,
						{ backgroundColor: colors.card, borderColor: colors.border },
					]}
				>
					<Text style={[styles.themeText, { color: colors.text }]}>
						Темная тема
					</Text>
					<Switch value={isDark} onValueChange={toggleTheme} />
				</View>

				{/* Кнопка "О приложении" */}
				<TouchableOpacity
					style={[
						styles.themeToggle,
						{
							backgroundColor: colors.card,
							borderColor: colors.border,
							marginTop: 12,
						},
					]}
					onPress={() => navigation.navigate("About")}
				>
					<Text style={[styles.themeText, { color: colors.text }]}>
						О приложении
					</Text>
					<Ionicons
						name="information-circle-outline"
						size={24}
						color={colors.primary}
					/>
				</TouchableOpacity>
			</View>

			<TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
				<Text style={styles.logoutText}>Выйти из аккаунта</Text>
			</TouchableOpacity>

			<TouchableOpacity
				style={[styles.backButton, { backgroundColor: colors.card }]}
				onPress={() => navigation.goBack()}
			>
				<Text style={[styles.backText, { color: colors.text }]}>
					Вернуться в Гараж
				</Text>
			</TouchableOpacity>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		alignItems: "center",
		paddingTop: 60,
		paddingHorizontal: 20,
	},

	// Стили для аватарки
	avatarContainer: { marginBottom: 16, position: "relative" },
	avatarImage: { width: 110, height: 110, borderRadius: 55 },
	avatarPlaceholder: {
		width: 110,
		height: 110,
		borderRadius: 55,
		justifyContent: "center",
		alignItems: "center",
	},
	avatarText: { fontSize: 44, color: "#fff", fontWeight: "bold" },
	cameraIconBadge: {
		position: "absolute",
		bottom: 0,
		right: 0,
		width: 36,
		height: 36,
		borderRadius: 18,
		justifyContent: "center",
		alignItems: "center",
		elevation: 5,
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.2,
		shadowRadius: 4,
	},

	name: { fontSize: 24, fontWeight: "bold" },
	role: { fontSize: 16, marginTop: 4, marginBottom: 30 },

	themeToggle: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		width: "100%",
		padding: 16,
		borderRadius: 12,
		borderWidth: 1,
	},
	themeText: { fontSize: 16, fontWeight: "bold" },

	logoutButton: {
		backgroundColor: "#ff4757",
		padding: 16,
		borderRadius: 12,
		width: "100%",
		alignItems: "center",
		marginBottom: 12,
	},
	logoutText: { color: "#fff", fontSize: 16, fontWeight: "bold" },

	backButton: {
		padding: 16,
		borderRadius: 12,
		width: "100%",
		alignItems: "center",
	},
	backText: { fontSize: 16, fontWeight: "bold" },
});
