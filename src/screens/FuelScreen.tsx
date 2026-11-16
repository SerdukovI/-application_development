// src/screens/FuelScreen.tsx
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
	ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { db } from "../database/db";
import { Vehicle, FuelLog } from "../types";
import { useTheme } from "../context/ThemeContext";

export default function FuelScreen() {
	const [logs, setLogs] = useState<FuelLog[]>([]);
	const [vehicles, setVehicles] = useState<Vehicle[]>([]);
	const [modalVisible, setModalVisible] = useState(false);

	// Состояния формы
	const [selectedVehicleId, setSelectedVehicleId] = useState<number | null>(
		null,
	);
	const [mileage, setMileage] = useState("");
	const [liters, setLiters] = useState("");
	const [price, setPrice] = useState("");

	const { colors } = useTheme();
	const totalCost = (parseFloat(liters) || 0) * (parseFloat(price) || 0);

	useEffect(() => {
		loadData();
	}, []);

	const loadData = () => {
		try {
			const v = db.getAllSync<Vehicle>("SELECT * FROM Vehicles;");
			setVehicles(v);
			if (v.length > 0 && !selectedVehicleId) {
				setSelectedVehicleId(v[0].id);
			}

			const l = db.getAllSync(`
        SELECT Fuel_Log.*, Vehicles.brand, Vehicles.model 
        FROM Fuel_Log 
        JOIN Vehicles ON Fuel_Log.vehicleId = Vehicles.id 
        ORDER BY Fuel_Log.date DESC;
      `);
			setLogs(l as any);
		} catch (error) {
			console.error("Ошибка загрузки данных:", error);
		}
	};

	const addFuelLog = () => {
		if (!selectedVehicleId || !mileage || !liters || !price) {
			Alert.alert("Ошибка", "Заполните все поля.");
			return;
		}

		try {
			const dateNow = new Date().toISOString();
			db.runSync(
				`INSERT INTO Fuel_Log (vehicleId, date, mileage, liters, pricePerLiter, totalCost) 
         VALUES (?, ?, ?, ?, ?, ?);`,
				[
					selectedVehicleId,
					dateNow,
					parseInt(mileage),
					parseFloat(liters),
					parseFloat(price),
					totalCost,
				],
			);

			setMileage("");
			setLiters("");
			setPrice("");
			setModalVisible(false);
			loadData();
		} catch (error) {
			console.error("Ошибка добавления заправки:", error);
			Alert.alert("Ошибка", "Не удалось сохранить данные.");
		}
	};

	const deleteFuelLog = (id: number) => {
		Alert.alert("Удалить заправку?", "Эти данные будут утеряны.", [
			{ text: "Отмена", style: "cancel" },
			{
				text: "Удалить",
				style: "destructive",
				onPress: () => {
					db.runSync("DELETE FROM Fuel_Log WHERE id = ?;", [id]);
					loadData();
				},
			},
		]);
	};

	return (
		<View style={[styles.container, { backgroundColor: colors.background }]}>
			<Text style={[styles.title, { color: colors.text }]}>Заправки</Text>

			{logs.length === 0 ? (
				<View style={styles.emptyState}>
					<Text style={[styles.emptyText, { color: colors.subtext }]}>
						Заправок пока нет.
					</Text>
				</View>
			) : (
				<FlatList
					data={logs}
					keyExtractor={(item) => item.id.toString()}
					showsVerticalScrollIndicator={false}
					renderItem={({ item }) => (
						<View style={[styles.card, { backgroundColor: colors.card }]}>
							<View style={styles.cardHeader}>
								<View>
									<Text style={[styles.carName, { color: colors.text }]}>
										{(item as any).brand} {(item as any).model}
									</Text>
									<Text style={[styles.tripInfo, { color: colors.subtext }]}>
										{item.liters} л • {item.pricePerLiter} ₽/л
									</Text>
									<Text style={styles.totalCost}>
										Итого: {item.totalCost.toFixed(2)} ₽
									</Text>
								</View>
								<TouchableOpacity
									onPress={() => deleteFuelLog(item.id)}
									style={{ padding: 4 }}
								>
									<Ionicons name="trash-outline" size={22} color="#e84118" />
								</TouchableOpacity>
							</View>
						</View>
					)}
				/>
			)}

			<TouchableOpacity
				style={[styles.addButton, { backgroundColor: colors.primary }]}
				onPress={() => setModalVisible(true)}
			>
				<Text style={styles.addButtonText}>+ Добавить заправку</Text>
			</TouchableOpacity>

			<Modal visible={modalVisible} animationType="slide" transparent={true}>
				<View style={styles.modalContainer}>
					<View style={[styles.modalContent, { backgroundColor: colors.card }]}>
						<Text style={[styles.modalTitle, { color: colors.text }]}>
							Новая заправка
						</Text>

						<Text style={[styles.label, { color: colors.subtext }]}>
							Выберите авто:
						</Text>
						<ScrollView
							horizontal
							showsHorizontalScrollIndicator={false}
							style={styles.vehicleList}
						>
							{vehicles.map((v) => (
								<TouchableOpacity
									key={v.id}
									style={[
										styles.vehicleOption,
										{
											backgroundColor: colors.inputBg,
											borderColor: colors.border,
										},
										selectedVehicleId === v.id && {
											backgroundColor: colors.primary,
											borderColor: colors.primary,
										},
									]}
									onPress={() => setSelectedVehicleId(v.id)}
								>
									<Text
										style={[
											styles.vehicleText,
											{ color: colors.text },
											selectedVehicleId === v.id && {
												color: "#fff",
												fontWeight: "bold",
											},
										]}
									>
										{v.brand} {v.model}
									</Text>
								</TouchableOpacity>
							))}
						</ScrollView>

						<TextInput
							style={[
								styles.input,
								{
									backgroundColor: colors.inputBg,
									color: colors.text,
									borderColor: colors.border,
								},
							]}
							placeholder="Пробег (км)"
							placeholderTextColor={colors.subtext}
							value={mileage}
							onChangeText={setMileage}
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
							placeholder="Залито литров"
							placeholderTextColor={colors.subtext}
							value={liters}
							onChangeText={setLiters}
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
							placeholder="Цена за литр (₽)"
							placeholderTextColor={colors.subtext}
							value={price}
							onChangeText={setPrice}
							keyboardType="numeric"
						/>

						<View
							style={[styles.totalBox, { backgroundColor: colors.inputBg }]}
						>
							<Text style={[styles.totalLabel, { color: colors.text }]}>
								Общая стоимость:
							</Text>
							<Text style={[styles.totalValue, { color: colors.primary }]}>
								{totalCost.toFixed(2)} ₽
							</Text>
						</View>

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
								onPress={addFuelLog}
							>
								<Text style={styles.saveButtonText}>Сохранить</Text>
							</TouchableOpacity>
						</View>
					</View>
				</View>
			</Modal>
		</View>
	);
}

const styles = StyleSheet.create({
	container: { flex: 1, padding: 16 },
	title: { fontSize: 24, fontWeight: "bold", marginTop: 40, marginBottom: 20 },
	emptyState: { flex: 1, justifyContent: "center", alignItems: "center" },
	emptyText: { fontSize: 16, textAlign: "center" },

	card: { padding: 16, borderRadius: 12, marginBottom: 12, elevation: 3 },
	cardHeader: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "flex-start",
	},
	carName: { fontSize: 16, fontWeight: "bold" },
	tripInfo: { fontSize: 14, marginTop: 4 },
	totalCost: {
		fontSize: 16,
		color: "#e1b12c",
		marginTop: 8,
		fontWeight: "bold",
	},

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
	label: { fontSize: 14, marginBottom: 8 },
	vehicleList: { flexDirection: "row", marginBottom: 16 },
	vehicleOption: {
		padding: 10,
		borderRadius: 8,
		marginRight: 10,
		borderWidth: 1,
	},
	vehicleText: { fontSize: 14 },
	input: { padding: 12, borderRadius: 8, marginBottom: 12, borderWidth: 1 },
	totalBox: {
		flexDirection: "row",
		justifyContent: "space-between",
		padding: 12,
		borderRadius: 8,
		marginBottom: 16,
	},
	totalLabel: { fontSize: 16 },
	totalValue: { fontSize: 16, fontWeight: "bold" },
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
