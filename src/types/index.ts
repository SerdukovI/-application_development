// src/types/index.ts

export interface Vehicle {
	id: number;
	brand: string;
	model: string;
	year: number;
	plateNumber: string;
	currentMileage: number;
	lastOilChangeMileage?: number;
}

export interface Trip {
	id: number;
	vehicleId: number;
	date: string;
	startMileage: number;
	endMileage: number;
	durationMinutes: number;
	parkingLatitude: number | null;
	parkingLongitude: number | null;
	type: "work" | "personal";
}

export interface FuelLog {
	id: number;
	vehicleId: number;
	date: string;
	mileage: number;
	liters: number;
	pricePerLiter: number;
	totalCost: number;
}

export interface ServiceLog {
	id: number;
	vehicleId: number;
	date: string;
	mileage: number;
	description: string;
	totalCost: number;
}

export interface Reminder {
	id: number;
	vehicleId: number;
	type: "mileage" | "date";
	targetValue: string | number;
	description: string;
	isTriggered: boolean;
}
