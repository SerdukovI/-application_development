// src/screens/ParkingScreen.tsx
import React, { useState, useEffect } from "react";
import {
	View,
	Text,
	StyleSheet,
	TouchableOpacity,
	ActivityIndicator,
} from "react-native";
import * as Location from "expo-location";
import MapView, { Marker } from "react-native-maps";
import { useTheme } from "../context/ThemeContext";

export default function ParkingScreen() {
	const [location, setLocation] = useState<any>(null);
	const [errorMsg, setErrorMsg] = useState<string | null>(null);
	const { colors } = useTheme();

	useEffect(() => {
		getLocation();
	}, []);

	const getLocation = async () => {
		setErrorMsg(null);
		setLocation(null);

		let { status } = await Location.requestForegroundPermissionsAsync();
		if (status !== "granted") {
			setErrorMsg(
				"Разрешение на доступ к геолокации отклонено. Включите его в настройках.",
			);
			return;
		}

		try {
			let loc = await Location.getCurrentPositionAsync({
				accuracy: Location.Accuracy.High,
			});
			setLocation(loc.coords);
		} catch (error) {
			setErrorMsg("Не удалось определить местоположение. Проверьте GPS.");
		}
	};

	if (errorMsg) {
		return (
			<View
				style={[styles.centerContainer, { backgroundColor: colors.background }]}
			>
				<Text style={[styles.errorText, { color: "#e84118" }]}>{errorMsg}</Text>
				<TouchableOpacity
					style={[styles.button, { backgroundColor: colors.primary }]}
					onPress={getLocation}
				>
					<Text style={styles.buttonText}>Попробовать снова</Text>
				</TouchableOpacity>
			</View>
		);
	}

	if (!location) {
		return (
			<View
				style={[styles.centerContainer, { backgroundColor: colors.background }]}
			>
				<ActivityIndicator size="large" color={colors.primary} />
				<Text style={[styles.loadingText, { color: colors.subtext }]}>
					Определяем координаты...
				</Text>
			</View>
		);
	}

	return (
		<View style={styles.container}>
			<MapView
				style={styles.map}
				initialRegion={{
					latitude: location.latitude,
					longitude: location.longitude,
					latitudeDelta: 0.005,
					longitudeDelta: 0.005,
				}}
				showsUserLocation={true}
			>
				<Marker
					coordinate={{
						latitude: location.latitude,
						longitude: location.longitude,
					}}
					title="Ваше авто здесь"
					description="Место последней парковки"
					pinColor="#e84118"
				/>
			</MapView>

			<View style={[styles.footer, { backgroundColor: colors.card }]}>
				<Text style={[styles.coordText, { color: colors.subtext }]}>
					Координаты: {location.latitude.toFixed(5)},{" "}
					{location.longitude.toFixed(5)}
				</Text>
				<TouchableOpacity
					style={[styles.button, { backgroundColor: colors.primary }]}
					onPress={getLocation}
				>
					<Text style={styles.buttonText}>Обновить локацию</Text>
				</TouchableOpacity>
			</View>
		</View>
	);
}

const styles = StyleSheet.create({
	container: { flex: 1 },
	map: { flex: 1 },
	centerContainer: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
		padding: 20,
	},
	loadingText: { marginTop: 12, fontSize: 16 },
	errorText: { fontSize: 16, textAlign: "center", marginBottom: 20 },
	footer: {
		padding: 20,
		borderTopLeftRadius: 20,
		borderTopRightRadius: 20,
		elevation: 10,
		alignItems: "center",
	},
	coordText: { fontSize: 14, marginBottom: 12, fontWeight: "600" },
	button: {
		padding: 14,
		borderRadius: 12,
		width: "100%",
		alignItems: "center",
	},
	buttonText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
});
