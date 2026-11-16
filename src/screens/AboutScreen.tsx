// src/screens/AboutScreen.tsx
import React from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { useTheme } from "../context/ThemeContext";

export default function AboutScreen() {
	const { colors } = useTheme();

	const futureFeatures = [
		"Синхронизация с облаком: чтобы данные не терялись при смене телефона.",
		"Интеграция с OBD-II: считывание ошибок двигателя и реального расхода топлива прямо из «мозгов» машины.",
		"ИИ-ассистент: прогнозирование поломок на основе вашего стиля вождения и пробега.",
		"Экспорт отчетов: выгрузка истории заправок и ремонтов в PDF или Excel.",
		"Напоминания по дате: автоматическое напоминание об окончании страховки (ОСАГО) и техосмотра.",
		"Сообщество водителей: советы по ремонту и обмен опытом прямо в приложении.",
	];

	return (
		<ScrollView
			style={[styles.container, { backgroundColor: colors.background }]}
		>
			<View style={styles.header}>
				<Text style={[styles.logo, { color: colors.primary }]}>
					AutoTracker
				</Text>
				<Text style={[styles.version, { color: colors.subtext }]}>
					Версия 1.0.0
				</Text>
			</View>

			<View style={[styles.card, { backgroundColor: colors.card }]}>
				<Text style={[styles.cardTitle, { color: colors.text }]}>
					О приложении
				</Text>
				<Text style={[styles.text, { color: colors.subtext }]}>
					AutoTracker — это ваш умный помощник на дороге. Мы создали это
					приложение, чтобы каждый автовладелец мог легко контролировать свои
					расходы, следить за здоровьем автомобиля и никогда не забывать о
					важных датах.
				</Text>
			</View>

			<View style={[styles.card, { backgroundColor: colors.card }]}>
				<Text style={[styles.cardTitle, { color: colors.text }]}>
					Планы по доработке
				</Text>
				<Text
					style={[styles.text, { color: colors.subtext, marginBottom: 12 }]}
				>
					Мы постоянно работаем над улучшением приложения. В будущих обновлениях
					появятся:
				</Text>

				{futureFeatures.map((feature, index) => (
					<View key={index} style={styles.featureItem}>
						<Text style={[styles.bullet, { color: colors.primary }]}>•</Text>
						<Text style={[styles.featureText, { color: colors.text }]}>
							{feature}
						</Text>
					</View>
				))}
			</View>

			<Text style={[styles.footer, { color: colors.subtext }]}>
				Сделано с любовью к автомобилям и React Native 💙
			</Text>

			<View style={{ height: 40 }} />
		</ScrollView>
	);
}

const styles = StyleSheet.create({
	container: { flex: 1, padding: 16 },
	header: { alignItems: "center", marginTop: 20, marginBottom: 30 },
	logo: { fontSize: 36, fontWeight: "bold" },
	version: { fontSize: 14, marginTop: 4 },
	card: { padding: 20, borderRadius: 16, marginBottom: 16, elevation: 3 },
	cardTitle: { fontSize: 18, fontWeight: "bold", marginBottom: 12 },
	text: { fontSize: 15, lineHeight: 22 },
	featureItem: {
		flexDirection: "row",
		marginBottom: 10,
		alignItems: "flex-start",
	},
	bullet: { fontSize: 18, fontWeight: "bold", marginRight: 8, lineHeight: 20 },
	featureText: { flex: 1, fontSize: 15, lineHeight: 20 },
	footer: {
		textAlign: "center",
		fontSize: 14,
		marginTop: 20,
		fontStyle: "italic",
	},
});
