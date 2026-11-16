// src/screens/ServiceScreen.tsx
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
} from "react-native";
import { db } from "../database/db";
import { ServiceLog } from "../types";
import { useTheme } from "../context/ThemeContext";

export default function ServiceScreen({ route }: any) {
	const { vehicleId, brand, model } = route.params;
	const [logs, setLogs] = useState<ServiceLog[]>([]);
	const [modalVisible, setModalVisible] = useState(false);

	const [mileage, setMileage] = useState("");
	const [description, setDescription] = useState("");
	const [cost, setCost] = useState("");

	const { colors } = useTheme();

	useEffect(() => {
		loadLogs();
	}, []);

	const loadLogs = () => {
		try {
			const l = db.getAllSync<ServiceLog>(
				"SELECT * FROM Service_Log WHERE vehicleId = ? ORDER BY date DESC;",
				[vehicleId],
			);
			setLogs(l);
		} catch (error) {
			console.error(error);
		}
	};

	const addService = () => {
		if (!mileage || !description || !cost) {
			Alert.alert("Ошибка", "Заполните все поля.");
			return;
		}
		try {
			const dateNow = new Date().toISOString();
			db.runSync(
				"INSERT INTO Service_Log (vehicleId, date, mileage, description, totalCost) VALUES (?, ?, ?, ?, ?);",
				[vehicleId, dateNow, parseInt(mileage), description, parseFloat(cost)],
			);
			setMileage("");
			setDescription("");
			setCost("");
			setModalVisible(false);
			loadLogs();
		} catch (error) {
			console.error(error);
		}
	};

	return (
		<View style={[styles.container, { backgroundColor: colors.background }]}>
			<Text style={[styles.title, { color: colors.text }]}>
				Ремонты: {brand} {model}
			</Text>

			<FlatList
				data={logs}
				keyExtractor={(item) => item.id.toString()}
				renderItem={({ item }) => (
					<View style={[styles.card, { backgroundColor: colors.card }]}>
						<Text style={[styles.desc, { color: colors.text }]}>
							{item.description}
						</Text>
						<Text style={[styles.info, { color: colors.subtext }]}>
							Пробег: {item.mileage} км
						</Text>
						<Text style={styles.cost}>Стоимость: {item.totalCost} ₽</Text>
					</View>
				)}
				ListEmptyComponent={
					<Text style={[styles.emptyText, { color: colors.subtext }]}>
						Ремонтов пока нет.
					</Text>
				}
			/>

			<TouchableOpacity
				style={[styles.addButton, { backgroundColor: colors.primary }]}
				onPress={() => setModalVisible(true)}
			>
				<Text style={styles.addButtonText}>+ Добавить ремонт</Text>
			</TouchableOpacity>

			<Modal visible={modalVisible} animationType="slide" transparent={true}>
				<View style={styles.modalContainer}>
					<View style={[styles.modalContent, { backgroundColor: colors.card }]}>
						<Text style={[styles.modalTitle, { color: colors.text }]}>
							Новый ремонт
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
							placeholder="Что делали? (например, Замена масла)"
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
							placeholder="Стоимость (₽)"
							placeholderTextColor={colors.subtext}
							value={cost}
							onChangeText={setCost}
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
								onPress={addService}
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
	title: { fontSize: 22, fontWeight: "bold", marginTop: 10, marginBottom: 20 },
	card: { padding: 16, borderRadius: 12, marginBottom: 12, elevation: 3 },
	desc: { fontSize: 16, fontWeight: "bold" },
	info: { fontSize: 14, marginTop: 4 },
	cost: { fontSize: 16, color: "#e84118", marginTop: 8, fontWeight: "bold" },
	emptyText: { fontSize: 16, textAlign: "center", marginTop: 20 },
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
