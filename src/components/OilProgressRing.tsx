// src/components/OilProgressRing.tsx
import React from "react";
import { View, Text, StyleSheet } from "react-native";
import Svg, { Circle } from "react-native-svg";

interface Props {
	currentMileage: number;
	lastOilChangeMileage: number;
	maxLife?: number; // Максимальный ресурс масла (по умолчанию 10 000 км)
}

export default function OilProgressRing({
	currentMileage,
	lastOilChangeMileage,
	maxLife = 10000,
}: Props) {
	const distanceSinceChange = currentMileage - lastOilChangeMileage;
	let remainingLife = maxLife - distanceSinceChange;

	if (remainingLife < 0) remainingLife = 0;

	const percentage = (remainingLife / maxLife) * 100;

	// Цвет в зависимости от остатка
	let color = "#44bd32"; // Зеленый
	if (percentage <= 30) color = "#e1b12c"; // Желтый
	if (percentage <= 10) color = "#e84118"; // Красный

	const radius = 40;
	const strokeWidth = 8;
	const circumference = 2 * Math.PI * radius;
	const strokeDashoffset = circumference - (percentage / 100) * circumference;

	return (
		<View style={styles.container}>
			<Svg height="100" width="100" viewBox="0 0 100 100">
				{/* Фоновое кольцо */}
				<Circle
					cx="50"
					cy="50"
					r={radius}
					stroke="#e1e2e6"
					strokeWidth={strokeWidth}
					fill="transparent"
				/>
				{/* Заполненное кольцо */}
				<Circle
					cx="50"
					cy="50"
					r={radius}
					stroke={color}
					strokeWidth={strokeWidth}
					fill="transparent"
					strokeDasharray={circumference}
					strokeDashoffset={strokeDashoffset}
					strokeLinecap="round"
					transform="rotate(-90 50 50)" // Поворот, чтобы начиналось сверху
				/>
			</Svg>
			<Text style={[styles.percentageText, { color }]}>
				{Math.round(percentage)}%
			</Text>
			<Text style={styles.label}>Ресурс масла</Text>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		alignItems: "center",
		justifyContent: "center",
		marginVertical: 10,
	},
	percentageText: {
		position: "absolute",
		top: 35,
		fontSize: 20,
		fontWeight: "bold",
	},
	label: { marginTop: 5, fontSize: 12, color: "#718093" },
});
