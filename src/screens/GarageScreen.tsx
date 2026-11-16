// src/screens/GarageScreen.tsx
import React, { useState, useEffect } from "react";
import {
	View,
	Text,
	StyleSheet,
	FlatList,
	TouchableOpacity,
	Modal,
	TextInput,
	Alert,
	KeyboardAvoidingView,
	Platform,
	Image,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { db } from "../database/db";
import { Vehicle } from "../types";
import OilProgressRing from "../components/OilProgressRing";
import { useTheme } from "../context/ThemeContext";

export default function GarageScreen({ navigation }: any) {
	const [vehicles, setVehicles] = useState<Vehicle[]>([]);
	const [modalVisible, setModalVisible] = useState(false);

	const [brand, setBrand] = useState("");
	const [model, setModel] = useState("");
	const [year, setYear] = useState("");
	const [plate, setPlate] = useState("");
	const [mileage, setMileage] = useState("");

	const { colors } = useTheme();

	useEffect(() => {
		const unsubscribe = navigation.addListener("focus", () => {
			loadVehicles();
		});
		return unsubscribe;
	}, [navigation]);

	const loadVehicles = () => {
		try {
			const result = db.getAllSync<Vehicle>("SELECT * FROM Vehicles;");
			setVehicles(result);
		} catch (error) {
			console.error("Ошибка загрузки машин:", error);
		}
	};

	const addVehicle = () => {
		if (!brand || !model) {
			Alert.alert("Ошибка", "Пожалуйста, заполните марку и модель.");
			return;
		}
		try {
			const currentM = parseInt(mileage) || 0;
			db.runSync(
				"INSERT INTO Vehicles (brand, model, year, plateNumber, currentMileage, lastOilChangeMileage) VALUES (?, ?, ?, ?, ?, ?);",
				[brand, model, parseInt(year) || 0, plate, currentM, currentM],
			);
			setBrand("");
			setModel("");
			setYear("");
			setPlate("");
			setMileage("");
			setModalVisible(false);
			loadVehicles();
		} catch (error) {
			console.error("Ошибка добавления авто:", error);
			Alert.alert("Ошибка", "Не удалось сохранить данные.");
		}
	};

	const deleteVehicle = (id: number) => {
		Alert.alert(
			"Удалить авто?",
			"Все поездки, заправки и ремонты этой машины будут безвозвратно удалены!",
			[
				{ text: "Отмена", style: "cancel" },
				{
					text: "Удалить",
					style: "destructive",
					onPress: () => {
						try {
							db.runSync("DELETE FROM Vehicles WHERE id = ?;", [id]);
							loadVehicles();
						} catch (e) {
							Alert.alert("Ошибка", "Не удалось удалить авто.");
						}
					},
				},
			],
		);
	};

	// ЛОКАЛЬНЫЕ КАРТИНКИ (используем require)
	const getCarImage = (vBrand: string) => {
		const b = vBrand.toLowerCase();
		try {
			if (b.includes("toyota")) return require("../../assets/cars/toyota.jpg");
			if (b.includes("bmw")) return require("../../assets/cars/bmw.jpg");
			if (b.includes("kia")) return require("../../assets/cars/kia.jpg");
			if (b.includes("lada") || b.includes("ваз"))
				return require("../../assets/cars/lada.jpg");
			return require("../../assets/cars/default.jpg");
		} catch (e) {
			// Если картинок нет, чтобы приложение не упало, возвращаем null
			return null;
		}
	};

	return (
		<View style={[styles.container, { backgroundColor: colors.background }]}>
			<View style={styles.header}>
				<Text style={[styles.title, { color: colors.text }]}>Мой Гараж</Text>
				<TouchableOpacity onPress={() => navigation.navigate("Profile")}>
					<Ionicons
						name="person-circle-outline"
						size={40}
						color={colors.text}
					/>
				</TouchableOpacity>
			</View>

			{vehicles.length === 0 ? (
				<View style={styles.emptyState}>
					<Text style={[styles.emptyText, { color: colors.subtext }]}>
						У вас пока нет добавленных автомобилей.
					</Text>
				</View>
			) : (
				<FlatList
					data={vehicles}
					keyExtractor={(item) => item.id.toString()}
					showsVerticalScrollIndicator={false}
					renderItem={({ item }) => {
						const localImage = getCarImage(item.brand);

						return (
							<View style={styles.card}>
								{/* Если картинка есть - отображаем её */}
								{localImage && (
									<Image
										source={localImage}
										style={styles.cardImage}
										resizeMode="cover"
									/>
								)}

								<View style={styles.cardOverlay}>
									<View style={styles.cardHeader}>
										<View>
											<Text style={styles.carName}>
												{item.brand} {item.model}
											</Text>
											<Text style={styles.carInfo}>
												{item.year} • {item.plateNumber}
											</Text>
										</View>
										<TouchableOpacity
											onPress={() => deleteVehicle(item.id)}
											style={{ padding: 4 }}
										>
											<Ionicons
												name="trash-outline"
												size={24}
												color="#ff4757"
											/>
										</TouchableOpacity>
									</View>

									<Text style={styles.carMileage}>
										Пробег: {item.currentMileage} км
									</Text>

									<OilProgressRing
										currentMileage={item.currentMileage}
										lastOilChangeMileage={item.lastOilChangeMileage || 0}
									/>

									<TouchableOpacity
										style={[
											styles.serviceButton,
											{ backgroundColor: "rgba(255,255,255,0.15)" },
										]}
										onPress={() =>
											navigation.navigate("Service", {
												vehicleId: item.id,
												brand: item.brand,
												model: item.model,
											})
										}
									>
										<Text style={[styles.serviceButtonText, { color: "#fff" }]}>
											Ремонты и ТО
										</Text>
									</TouchableOpacity>

									<TouchableOpacity
										style={[
											styles.serviceButton,
											{ backgroundColor: "#e1b12c", marginTop: 8 },
										]}
										onPress={() => navigation.navigate("Parking")}
									>
										<Text style={[styles.serviceButtonText, { color: "#fff" }]}>
											Где моё авто?
										</Text>
									</TouchableOpacity>
								</View>
							</View>
						);
					}}
				/>
			)}

			<TouchableOpacity
				style={[styles.addButton, { backgroundColor: colors.primary }]}
				onPress={() => setModalVisible(true)}
			>
				<Text style={styles.addButtonText}>+ Добавить авто</Text>
			</TouchableOpacity>

			<Modal visible={modalVisible} animationType="slide" transparent={true}>
				<KeyboardAvoidingView
					behavior={Platform.OS === "ios" ? "padding" : "height"}
					style={styles.modalContainer}
				>
					<View style={[styles.modalContent, { backgroundColor: colors.card }]}>
						<Text style={[styles.modalTitle, { color: colors.text }]}>
							Новый автомобиль
						</Text>

						<TextInput
							style={[
								styles.input,
								{
									backgroundColor: colors.inputBg,
									color: colors.text,
									borderColor: colors.border,
								},
							]}
							placeholder="Марка (например, Toyota)"
							placeholderTextColor={colors.subtext}
							value={brand}
							onChangeText={setBrand}
						/>
						<TextInput
							style={[
								styles.input,
								{
									backgroundColor: colors.inputBg,
									color: colors.text,
									borderColor: colors.border,
								},
							]}
							placeholder="Модель (например, Camry)"
							placeholderTextColor={colors.subtext}
							value={model}
							onChangeText={setModel}
						/>
						<TextInput
							style={[
								styles.input,
								{
									backgroundColor: colors.inputBg,
									color: colors.text,
									borderColor: colors.border,
								},
							]}
							placeholder="Год выпуска"
							placeholderTextColor={colors.subtext}
							value={year}
							onChangeText={setYear}
							keyboardType="numeric"
						/>
						<TextInput
							style={[
								styles.input,
								{
									backgroundColor: colors.inputBg,
									color: colors.text,
									borderColor: colors.border,
								},
							]}
							placeholder="Госномер"
							placeholderTextColor={colors.subtext}
							value={plate}
							onChangeText={setPlate}
						/>
						<TextInput
							style={[
								styles.input,
								{
									backgroundColor: colors.inputBg,
									color: colors.text,
									borderColor: colors.border,
								},
							]}
							placeholder="Текущий пробег (км)"
							placeholderTextColor={colors.subtext}
							value={mileage}
							onChangeText={setMileage}
							keyboardType="numeric"
						/>

						<View style={styles.modalButtons}>
							<TouchableOpacity
								style={[
									styles.cancelButton,
									{ backgroundColor: colors.border },
								]}
								onPress={() => setModalVisible(false)}
							>
								<Text style={[styles.cancelButtonText, { color: colors.text }]}>
									Отмена
								</Text>
							</TouchableOpacity>
							<TouchableOpacity
								style={[styles.saveButton, { backgroundColor: colors.primary }]}
								onPress={addVehicle}
							>
								<Text style={styles.saveButtonText}>Сохранить</Text>
							</TouchableOpacity>
						</View>
					</View>
				</KeyboardAvoidingView>
			</Modal>
		</View>
	);
}

const styles = StyleSheet.create({
	container: { flex: 1, padding: 16 },
	header: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		marginTop: 40,
		marginBottom: 20,
	},
	title: { fontSize: 24, fontWeight: "bold" },
	emptyState: { flex: 1, justifyContent: "center", alignItems: "center" },
	emptyText: { fontSize: 16, textAlign: "center" },

	card: {
		marginBottom: 16,
		borderRadius: 12,
		overflow: "hidden",
		minHeight: 380,
		backgroundColor: "#2d2d2d", // Фон, если картинки нет
		position: "relative",
	},
	cardImage: {
		position: "absolute",
		top: 0,
		left: 0,
		right: 0,
		bottom: 0,
		width: "100%",
		height: "100%",
	},
	cardOverlay: {
		flex: 1,
		padding: 16,
		backgroundColor: "rgba(0, 0, 0, 0.6)",
	},
	cardHeader: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "flex-start",
	},
	carName: { fontSize: 20, fontWeight: "bold", color: "#fff" },
	carInfo: { fontSize: 14, marginTop: 4, color: "#dcdde1" },
	carMileage: {
		fontSize: 15,
		marginTop: 8,
		fontWeight: "bold",
		color: "#0097e6",
	},

	serviceButton: {
		marginTop: 12,
		padding: 12,
		borderRadius: 8,
		alignItems: "center",
	},
	serviceButtonText: { fontWeight: "bold" },

	addButton: {
		padding: 16,
		borderRadius: 12,
		alignItems: "center",
		marginBottom: 20,
	},
	addButtonText: { color: "#fff", fontSize: 16, fontWeight: "bold" },

	modalContainer: {
		flex: 1,
		justifyContent: "center",
		backgroundColor: "rgba(0,0,0,0.5)",
		padding: 20,
	},
	modalContent: { borderRadius: 16, padding: 20 },
	modalTitle: {
		fontSize: 20,
		fontWeight: "bold",
		marginBottom: 16,
		textAlign: "center",
	},
	input: { padding: 12, borderRadius: 8, marginBottom: 12, borderWidth: 1 },
	modalButtons: {
		flexDirection: "row",
		justifyContent: "space-between",
		marginTop: 10,
	},
	cancelButton: {
		flex: 1,
		padding: 14,
		marginRight: 8,
		borderRadius: 8,
		alignItems: "center",
	},
	cancelButtonText: { fontWeight: "bold" },
	saveButton: {
		flex: 1,
		padding: 14,
		marginLeft: 8,
		borderRadius: 8,
		alignItems: "center",
	},
	saveButtonText: { color: "#fff", fontWeight: "bold" },
});
