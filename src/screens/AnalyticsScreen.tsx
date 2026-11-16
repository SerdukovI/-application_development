// src/screens/AnalyticsScreen.tsx
import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, ScrollView, Dimensions } from "react-native";
import { PieChart, BarChart } from "react-native-gifted-charts";
import { db } from "../database/db";
import { useTheme } from "../context/ThemeContext";

const screenWidth = Dimensions.get("window").width;

export default function AnalyticsScreen({ navigation }: any) {
	const [totalFuelCost, setTotalFuelCost] = useState(0);
	const [totalServiceCost, setTotalServiceCost] = useState(0);
	const [totalDistance, setTotalDistance] = useState(0);
	const [costPerKm, setCostPerKm] = useState(0);
	const [barData, setBarData] = useState<any[]>([]);

	const { colors } = useTheme();

	useEffect(() => {
		const unsubscribe = navigation.addListener("focus", () => {
			calculateStats();
		});
		return unsubscribe;
	}, [navigation]);

	useEffect(() => {
		calculateStats();
	}, []);

	const calculateStats = () => {
		try {
			const fuelResult = db.getFirstSync<{ total: number }>(
				"SELECT SUM(totalCost) as total FROM Fuel_Log;",
			);
			const fuelCost = fuelResult?.total || 0;
			setTotalFuelCost(fuelCost);

			const serviceResult = db.getFirstSync<{ total: number }>(
				"SELECT SUM(totalCost) as total FROM Service_Log;",
			);
			const serviceCost = serviceResult?.total || 0;
			setTotalServiceCost(serviceCost);

			const distanceResult = db.getFirstSync<{ total: number }>(
				"SELECT SUM(endMileage - startMileage) as total FROM Trips;",
			);
			const distance = distanceResult?.total || 0;
			setTotalDistance(distance);

			const totalAllCosts = fuelCost + serviceCost;
			if (distance > 0) setCostPerKm(totalAllCosts / distance);

			const fuelLogs = db.getAllSync<{ pricePerLiter: number }>(
				"SELECT pricePerLiter FROM Fuel_Log ORDER BY date ASC LIMIT 5;",
			);
			const formattedBarData = fuelLogs.map((log, index) => ({
				value: log.pricePerLiter,
				label: `З-${index + 1}`,
				frontColor: colors.primary,
			}));
			setBarData(
				formattedBarData.length > 0
					? formattedBarData
					: [{ value: 0, label: "Нет данных" }],
			);
		} catch (error) {
			console.error("Ошибка при расчете статистики:", error);
		}
	};

	const pieData = [
		{ value: totalFuelCost, color: colors.primary, text: `${totalFuelCost} ₽` },
		{
			value: totalServiceCost,
			color: "#e84118",
			text: `${totalServiceCost} ₽`,
		},
	];

	return (
		<ScrollView
			style={[styles.container, { backgroundColor: colors.background }]}
		>
			<Text style={[styles.title, { color: colors.text }]}>Аналитика</Text>

			<View style={[styles.highlightCard, { backgroundColor: colors.card }]}>
				<Text style={[styles.highlightTitle, { color: colors.subtext }]}>
					Стоимость 1 км пути
				</Text>
				<Text style={[styles.highlightValue, { color: colors.primary }]}>
					{costPerKm.toFixed(2)} ₽
				</Text>
				<Text style={[styles.highlightSubtitle, { color: colors.subtext }]}>
					Общий пробег: {totalDistance} км
				</Text>
			</View>

			<View style={[styles.chartContainer, { backgroundColor: colors.card }]}>
				<Text style={[styles.chartTitle, { color: colors.text }]}>
					Расходы (Топливо + Ремонты)
				</Text>

				<View style={styles.legendContainer}>
					<View style={styles.legendItem}>
						<View
							style={[styles.legendColor, { backgroundColor: colors.primary }]}
						/>
						<Text style={[styles.legendText, { color: colors.subtext }]}>
							Топливо
						</Text>
					</View>
					<View style={styles.legendItem}>
						<View
							style={[styles.legendColor, { backgroundColor: "#e84118" }]}
						/>
						<Text style={[styles.legendText, { color: colors.subtext }]}>
							Ремонты
						</Text>
					</View>
				</View>

				<View style={styles.pieWrapper}>
					<PieChart
						data={pieData}
						donut
						radius={80}
						innerRadius={50}
						innerCircleColor={colors.card}
						centerLabelComponent={() => {
							return (
								<Text style={[styles.pieCenterText, { color: colors.text }]}>
									{totalFuelCost + totalServiceCost} ₽
								</Text>
							);
						}}
					/>
				</View>
			</View>

			<View style={[styles.chartContainer, { backgroundColor: colors.card }]}>
				<Text style={[styles.chartTitle, { color: colors.text }]}>
					Динамика цен на бензин (₽/л)
				</Text>
				<View style={{ paddingTop: 20, alignItems: "center" }}>
					<BarChart
						data={barData}
						width={screenWidth - 100}
						barWidth={30}
						noOfSections={4}
						barBorderRadius={4}
						yAxisThickness={0}
						xAxisThickness={1}
						xAxisColor={colors.subtext}
						rulesType="dashed"
						rulesColor={colors.border}
						yAxisTextStyle={{ color: colors.subtext }}
						xAxisLabelTextStyle={{ color: colors.subtext }}
					/>
				</View>
			</View>

			<View style={{ height: 40 }} />
		</ScrollView>
	);
}

const styles = StyleSheet.create({
	container: { flex: 1, padding: 16 },
	title: { fontSize: 24, fontWeight: "bold", marginTop: 40, marginBottom: 20 },
	highlightCard: {
		padding: 20,
		borderRadius: 16,
		marginBottom: 20,
		elevation: 3,
		alignItems: "center",
	},
	highlightTitle: { fontSize: 16, marginBottom: 8 },
	highlightValue: { fontSize: 32, fontWeight: "bold" },
	highlightSubtitle: { fontSize: 14, marginTop: 8 },
	chartContainer: {
		padding: 16,
		borderRadius: 16,
		marginBottom: 20,
		elevation: 3,
	},
	chartTitle: { fontSize: 16, fontWeight: "bold", marginBottom: 16 },
	legendContainer: {
		flexDirection: "row",
		justifyContent: "center",
		marginBottom: 10,
	},
	legendItem: {
		flexDirection: "row",
		alignItems: "center",
		marginHorizontal: 10,
	},
	legendColor: { width: 12, height: 12, borderRadius: 6, marginRight: 6 },
	legendText: { fontSize: 14 },
	pieWrapper: { alignItems: "center", paddingVertical: 10 },
	pieCenterText: { fontSize: 16, fontWeight: "bold" },
});
