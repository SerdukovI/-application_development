// src/screens/TripsScreen.tsx
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
import { Vehicle, Trip } from "../types";
import { useTheme } from "../context/ThemeContext";

export default function TripsScreen() {
	const [trips, setTrips] = useState<Trip[]>([]);
	const [vehicles, setVehicles] = useState<Vehicle[]>([]);
	const [modalVisible, setModalVisible] = useState(false);

	const [selectedVehicleId, setSelectedVehicleId] = useState<number | null>(
		null,
	);
	const [startMileage, setStartMileage] = useState("");
	const [endMileage, setEndMileage] = useState("");

	const { colors } = useTheme();

	useEffect(() => {
		loadData();
	}, []);

	const loadData = () => {
		try {
			const v = db.getAllSync<Vehicle>("SELECT * FROM Vehicles;");
			setVehicles(v);
			if (v.length > 0 && !selectedVehicleId) setSelectedVehicleId(v[0].id);

			const t = db.getAllSync(`
        SELECT Trips.*, Vehicles.brand, Vehicles.model 
        FROM Trips 
        JOIN Vehicles ON Trips.vehicleId = Vehicles.id 
        ORDER BY Trips.date DESC;
      `);
			setTrips(t as any);
		} catch (error) {
			console.error("Ошибка загрузки данных:", error);
		}
	};

	const addTrip = () => {
		if (!selectedVehicleId || !startMileage || !endMileage) {
			Alert.alert("Ошибка", "Заполните все поля.");
			return;
		}
		const start = parseInt(startMileage);
		const end = parseInt(endMileage);
		if (end <= start) {
			Alert.alert("Ошибка", "Конечный пробег должен быть больше начального.");
			return;
		}
		try {
			const dateNow = new Date().toISOString();
			db.runSync(
				`INSERT INTO Trips (vehicleId, date, startMileage, endMileage, durationMinutes, type) VALUES (?, ?, ?, ?, ?, ?);`,
				[selectedVehicleId, dateNow, start, end, 60, "personal"],
			);
			db.runSync("UPDATE Vehicles SET currentMileage = ? WHERE id = ?;", [
				end,
				selectedVehicleId,
			]);
			setStartMileage("");
			setEndMileage("");
			setModalVisible(false);
			loadData();
		} catch (error) {
			console.error(error);
		}
	};

	const deleteTrip = (id: number) => {
		Alert.alert("Удалить поездку?", "Это действие нельзя отменить.", [
			{ text: "Отмена", style: "cancel" },
			{
				text: "Удалить",
				style: "destructive",
				onPress: () => {
					db.runSync("DELETE FROM Trips WHERE id = ?;", [id]);
					loadData();
				},
			},
		]);
	};

	return (
		<View style={[styles.container, { backgroundColor: colors.background }]}>
			<Text style={[styles.title, { color: colors.text }]}>Журнал поездок</Text>

			{trips.length === 0 ? (
				<View style={styles.emptyState}>
					<Text style={[styles.emptyText, { color: colors.subtext }]}>
						Поездок пока нет.
					</Text>
				</View>
			) : (
				<FlatList
					data={trips}
					keyExtractor={(item) => item.id.toString()}
					renderItem={({ item }) => (
						<View style={[styles.card, { backgroundColor: colors.card }]}>
							<View style={styles.cardHeader}>
								<View>
									<Text style={[styles.carName, { color: colors.text }]}>
										{(item as any).brand} {(item as any).model}
									</Text>
									<Text style={[styles.tripInfo, { color: colors.subtext }]}>
										Пробег: {item.startMileage} - {item.endMileage} км
									</Text>
									<Text style={styles.tripDistance}>
										Пройдено: {item.endMileage - item.startMileage} км
									</Text>
								</View>
								<TouchableOpacity
									onPress={() => deleteTrip(item.id)}
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
				<Text style={styles.addButtonText}>+ Записать поездку</Text>
			</TouchableOpacity>

			<Modal visible={modalVisible} animationType="slide" transparent={true}>
				<View style={styles.modalContainer}>
					<View style={[styles.modalContent, { backgroundColor: colors.card }]}>
						<Text style={[styles.modalTitle, { color: colors.text }]}>
							Новая поездка
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
							placeholder="Начальный пробег (км)"
							placeholderTextColor={colors.subtext}
							value={startMileage}
							onChangeText={setStartMileage}
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
							placeholder="Конечный пробег (км)"
							placeholderTextColor={colors.subtext}
							value={endMileage}
							onChangeText={setEndMileage}
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
								onPress={addTrip}
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
	tripDistance: {
		fontSize: 16,
		color: "#44bd32",
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
