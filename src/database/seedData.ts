// src/database/seedData.ts
import { db } from "./db";

export const seedInitialData = () => {
	try {
		// Проверяем, есть ли уже машины в базе
		const check = db.getFirstSync<{ count: number }>(
			"SELECT COUNT(*) as count FROM Vehicles;",
		);
		if (check && check.count > 0) {
			console.log("База уже содержит данные, пропускаем заполнение.");
			return;
		}

		console.log("База пуста. Заполняем тестовыми данными...");

		// 1. Добавляем 4 автомобиля (с реалистичным пробегом и заменой масла)
		const vehicles = [
			["Toyota", "Camry", 2021, "А123ВС 77", 45000, 40000], // Пробег 45к, масло менялось на 40к
			["BMW", "X5", 2019, "В456ЕК 99", 80000, 75000],
			["Kia", "Rio", 2018, "О789МН 50", 120000, 110000],
			["Lada", "Vesta", 2023, "Т321РУ 177", 15000, 10000],
		];
		vehicles.forEach((v) => {
			db.runSync(
				"INSERT INTO Vehicles (brand, model, year, plateNumber, currentMileage, lastOilChangeMileage) VALUES (?, ?, ?, ?, ?, ?);",
				v,
			);
		});

		// Получаем ID машин (1, 2, 3, 4) для связей
		const date = new Date().toISOString();

		// 2. Добавляем поездки (Trips)
		const trips = [
			[1, date, 40000, 40120, 60, "work"], // Toyota
			[1, date, 40120, 40450, 120, "personal"],
			[2, date, 75000, 75200, 90, "work"], // BMW
			[3, date, 110000, 110300, 180, "personal"], // Kia
			[4, date, 10000, 10150, 45, "personal"], // Lada
		];
		trips.forEach((t) => {
			db.runSync(
				"INSERT INTO Trips (vehicleId, date, startMileage, endMileage, durationMinutes, type) VALUES (?, ?, ?, ?, ?, ?);",
				t,
			);
		});

		// 3. Добавляем заправки (Fuel_Log)
		const fuels = [
			[1, date, 40450, 45, 55.5, 2497.5], // Toyota
			[2, date, 75200, 70, 62.0, 4340.0], // BMW
			[3, date, 110300, 40, 52.0, 2080.0], // Kia
			[4, date, 10150, 35, 53.5, 1872.5], // Lada
		];
		fuels.forEach((f) => {
			db.runSync(
				"INSERT INTO Fuel_Log (vehicleId, date, mileage, liters, pricePerLiter, totalCost) VALUES (?, ?, ?, ?, ?, ?);",
				f,
			);
		});

		// 4. Добавляем ремонты (Service_Log)
		const services = [
			[1, date, 40000, "Плановое ТО, замена масла и фильтров", 3500], // Toyota
			[3, date, 110000, "Замена передних тормозных колодок", 4800], // Kia
			[2, date, 75000, "Замена свечей зажигания", 6200], // BMW
		];
		services.forEach((s) => {
			db.runSync(
				"INSERT INTO Service_Log (vehicleId, date, mileage, description, totalCost) VALUES (?, ?, ?, ?, ?);",
				s,
			);
		});

		// 5. Добавляем напоминания (Reminders)
		const reminders = [
			[1, "mileage", "50000", "Замена масла (следующая)", 0], // Toyota
			[2, "mileage", "85000", "Замена тормозных дисков", 0], // BMW
			[3, "mileage", "125000", "Купить зимнюю резину", 0], // Kia
			[4, "mileage", "20000", "Первое ТО у дилера", 0], // Lada
		];
		reminders.forEach((r) => {
			db.runSync(
				"INSERT INTO Reminders (vehicleId, type, targetValue, description, isTriggered) VALUES (?, ?, ?, ?, ?);",
				r,
			);
		});

		console.log("Тестовые данные успешно добавлены!");
	} catch (error) {
		console.error("Ошибка при заполнении тестовых данных:", error);
	}
};
