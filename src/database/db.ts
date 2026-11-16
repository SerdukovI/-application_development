// src/database/db.ts
import * as SQLite from "expo-sqlite";

// Открываем базу данных (если её нет, она создастся)
export const db = SQLite.openDatabaseSync("autotracker.db");

export const initDatabase = () => {
	try {
		// Включаем поддержку внешних ключей (Foreign Keys)
		db.execSync("PRAGMA foreign_keys = ON;");

		// 1. Таблица Автомобилей (Гараж)
		db.execSync(`
      CREATE TABLE IF NOT EXISTS Vehicles (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        brand TEXT NOT NULL,
        model TEXT NOT NULL,
        year INTEGER,
        plateNumber TEXT,
        currentMileage INTEGER DEFAULT 0,
        lastOilChangeMileage INTEGER DEFAULT 0
      );
    `);

		// 2. Таблица Поездок
		db.execSync(`
      CREATE TABLE IF NOT EXISTS Trips (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        vehicleId INTEGER NOT NULL,
        date TEXT NOT NULL,
        startMileage INTEGER NOT NULL,
        endMileage INTEGER NOT NULL,
        durationMinutes INTEGER,
        parkingLatitude REAL,
        parkingLongitude REAL,
        type TEXT CHECK(type IN ('work', 'personal')) DEFAULT 'personal',
        FOREIGN KEY (vehicleId) REFERENCES Vehicles(id) ON DELETE CASCADE
      );
    `);

		// 3. Таблица Заправок
		db.execSync(`
      CREATE TABLE IF NOT EXISTS Fuel_Log (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        vehicleId INTEGER NOT NULL,
        date TEXT NOT NULL,
        mileage INTEGER NOT NULL,
        liters REAL NOT NULL,
        pricePerLiter REAL NOT NULL,
        totalCost REAL NOT NULL,
        FOREIGN KEY (vehicleId) REFERENCES Vehicles(id) ON DELETE CASCADE
      );
    `);

		// 4. Таблица Ремонтов и ТО
		db.execSync(`
      CREATE TABLE IF NOT EXISTS Service_Log (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        vehicleId INTEGER NOT NULL,
        date TEXT NOT NULL,
        mileage INTEGER NOT NULL,
        description TEXT,
        totalCost REAL NOT NULL,
        FOREIGN KEY (vehicleId) REFERENCES Vehicles(id) ON DELETE CASCADE
      );
    `);

		// 5. Таблица Запчастей (привязана к ремонту)
		db.execSync(`
      CREATE TABLE IF NOT EXISTS Service_Parts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        serviceId INTEGER NOT NULL,
        partName TEXT NOT NULL,
        partNumber TEXT,
        price REAL NOT NULL,
        FOREIGN KEY (serviceId) REFERENCES Service_Log(id) ON DELETE CASCADE
      );
    `);

		// 6. Таблица Напоминаний
		db.execSync(`
      CREATE TABLE IF NOT EXISTS Reminders (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        vehicleId INTEGER NOT NULL,
        type TEXT CHECK(type IN ('mileage', 'date')) NOT NULL,
        targetValue TEXT NOT NULL,
        description TEXT,
        isTriggered INTEGER DEFAULT 0,
        FOREIGN KEY (vehicleId) REFERENCES Vehicles(id) ON DELETE CASCADE
      );
    `);

		console.log("База данных успешно инициализирована");
	} catch (error) {
		console.error("Ошибка при инициализации базы данных:", error);
	}
};
