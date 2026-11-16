// src/screens/RemindersScreen.tsx
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
import { Vehicle, Reminder } from "../types";
import { useTheme } from "../context/ThemeContext";

export default function RemindersScreen() {
	const [reminders, setReminders] = useState<any[]>([]);
	const [vehicles, setVehicles] = useState<Vehicle[]>([]);
	const [modalVisible, setModalVisible] = useState(false);

	const [selectedVehicleId, setSelectedVehicleId] = useState<number | null>(
		null,
	);
	const [description, setDescription] = useState("");
	const [targetValue, setTargetValue] = useState("");

	const { colors } = useTheme();

	useEffect(() => {
		loadData();
	}, []);

	const loadData = () => {
		try {
			const v = db.getAllSync<Vehicle>("SELECT * FROM Vehicles;");
			setVehicles(v);
			if (v.length > 0 && !selectedVehicleId) setSelectedVehicleId(v[0].id);

			const r = db.getAllSync(`
        SELECT Reminders.*, Vehicles.brand, Vehicles.model 
        FROM Reminders 
        JOIN Vehicles ON Reminders.vehicleId = Vehicles.id;
      `);
			setReminders(r);
		} catch (error) {
			console.error(error);
		}
	};

	const addReminder = () => {
		if (!selectedVehicleId || !description || !targetValue) {
			Alert.alert("Ошибка", "Заполните все поля.");
			return;
		}
		try {
			db.runSync(
				"INSERT INTO Reminders (vehicleId, type, targetValue, description, isTriggered) VALUES (?, ?, ?, ?, ?);",
				[selectedVehicleId, "mileage", targetValue, description, 0],
			);
			setDescription("");
			setTargetValue("");
			setModalVisible(false);
			loadData();
		} catch (error) {
			console.error(error);
		}
	};

	const deleteReminder = (id: number) => {
		Alert.alert("Удалить напоминание?", "Оно больше не появится.", [
			{ text: "Отмена", style: "cancel" },
			{
				text: "Удалить",
				style: "destructive",
				onPress: () => {
					db.runSync("DELETE FROM Reminders WHERE id = ?;", [id]);
					loadData();
				},
			},
		]);
	};

	return (
		<View style={[styles.container, { backgroundColor: colors.background }]}>
			<Text style={[styles.title, { color: colors.text }]}>Напоминания</Text>

			<FlatList
				data={reminders}
				keyExtractor={(item) => item.id.toString()}
				showsVerticalScrollIndicator={false}
				renderItem={({ item }) => (
					<View style={[styles.card, { backgroundColor: colors.card }]}>
						<View style={styles.cardHeader}>
							<View>
								<Text style={[styles.desc, { color: colors.text }]}>
									{item.description}
								</Text>
								<Text style={[styles.info, { color: colors.subtext }]}>
									{item.brand} {item.model}
								</Text>
								<Text style={styles.target}>Цель: {item.targetValue} км</Text>
							</View>
							<TouchableOpacity
								onPress={() => deleteReminder(item.id)}
								style={{ padding: 4 }}
							>
								<Ionicons name="trash-outline" size={22} color="#e84118" />
							</TouchableOpacity>
						</View>
					</View>
				)}
				ListEmptyComponent={
					<Text style={[styles.emptyText, { color: colors.subtext }]}>
						Напоминаний пока нет.
					</Text>
				}
			/>

			<TouchableOpacity
				style={[styles.addButton, { backgroundColor: colors.primary }]}
				onPress={() => setModalVisible(true)}
			>
				<Text style={styles.addButtonText}>+ Добавить напоминание</Text>
			</TouchableOpacity>

			<Modal visible={modalVisible} animationType="slide" transparent={true}>
				<View style={styles.modalContainer}>
					<View style={[styles.modalContent, { backgroundColor: colors.card }]}>
						<Text style={[styles.modalTitle, { color: colors.text }]}>
							Новое напоминание
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
							placeholder="Что напомнить? (например, Замена масла)"
							placeholderTextColor={colors.subtext}
							value={description}
							onChangeText={setDescription}
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
							placeholder="На каком пробеге? (км)"
							placeholderTextColor={colors.subtext}
							value={targetValue}
							onChangeText={setTargetValue}
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
								onPress={addReminder}
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
	emptyText: { fontSize: 16, textAlign: "center", marginTop: 20 },

	card: { padding: 16, borderRadius: 12, marginBottom: 12, elevation: 3 },
	cardHeader: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "flex-start",
	},
	desc: { fontSize: 16, fontWeight: "bold" },
	info: { fontSize: 14, marginTop: 4 },
	target: { fontSize: 14, color: "#e1b12c", marginTop: 8, fontWeight: "bold" },

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
