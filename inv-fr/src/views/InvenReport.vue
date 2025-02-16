<template>
    <div class="container-fluid mx-auto p-4 grid grid-cols-1 md:grid-cols-2 gap-4 min-h-screen bg-gray-50 pt-20">
        <!-- Ringkasan dan Navigasi -->
        <div class="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
            <!-- Card Barang Masuk -->
            <router-link to="/reports/in" class="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow">
                <div class="flex justify-between items-center mb-4">
                    <h2 class="text-lg font-medium">Barang Masuk</h2>
                    <span class="text-3xl font-bold text-green-600">{{ totalBarangMasuk }}</span>
                </div>
                <div class="h-48">
                    <Bar :data="chartDataMasuk" :options="chartOptions" />
                </div>
                <div class="mt-4 text-center">
                    <span class="inline-flex items-center px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-800">
                        Lihat Detail Barang Masuk
                        <svg class="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                        </svg>
                    </span>
                </div>
            </router-link>

            <!-- Card Barang Keluar -->
            <router-link to="/reports/out" class="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow">
                <div class="flex justify-between items-center mb-4">
                    <h2 class="text-lg font-medium">Barang Keluar</h2>
                    <span class="text-3xl font-bold text-red-600">{{ totalBarangKeluar }}</span>
                </div>
                <div class="h-48">
                    <Bar :data="chartDataKeluar" :options="chartOptions" />
                </div>
                <div class="mt-4 text-center">
                    <span class="inline-flex items-center px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-800">
                        Lihat Detail Barang Keluar
                        <svg class="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                        </svg>
                    </span>
                </div>
            </router-link>
        </div>

        <!-- Statistik Perbandingan -->
        <div class="md:col-span-2 bg-white rounded-lg shadow-sm p-6">
            <h2 class="text-lg font-medium mb-4">Perbandingan Barang Masuk dan Keluar</h2>
            <div class="h-64">
                <Line :data="comparisonChartData" :options="comparisonChartOptions" />
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import axios from "axios";
import {
	BarElement,
	CategoryScale,
	Chart as ChartJS,
	Legend,
	LineElement,
	LinearScale,
	PointElement,
	Title,
	Tooltip,
} from "chart.js";
import { computed, onMounted, ref } from "vue";
import { Bar, Line } from "vue-chartjs";
import { useRouter } from "vue-router";
import { useToast } from "vue-toast-notification";
import "vue-toast-notification/dist/theme-sugar.css";

// Register ChartJS components
ChartJS.register(
	CategoryScale,
	LinearScale,
	BarElement,
	LineElement,
	PointElement,
	Title,
	Tooltip,
	Legend,
);

// Types
interface InventoryItem {
	quantity: number;
	date_in?: string;
	date_out?: string;
}

interface StockChangeLog {
	id: number;
	item_id: number;
	quantity_change: number;
	change_type: "in" | "out";
	timestamp: string;
}

// Setup router and toast
const router = useRouter();
const toast = useToast();

// Reactive state
const inventoryIn = ref<InventoryItem[]>([]);
const inventoryOut = ref<InventoryItem[]>([]);
const stockChangeLogs = ref<StockChangeLog[]>([]);

// Chart options
const chartOptions = {
	responsive: true,
	maintainAspectRatio: false,
};

const comparisonChartOptions = {
	responsive: true,
	maintainAspectRatio: false,
	plugins: {
		legend: {
			position: "top" as const,
			labels: {
				usePointStyle: true,
				pointStyle: "circle",
				cursor: "pointer",
				padding: 20,
				font: {
					size: 14,
				},
			},
		},
		tooltip: {
			mode: "index" as const,
			intersect: false,
		},
	},
};

// Computed properties
const totalBarangMasuk = computed(() =>
	inventoryIn.value.reduce((sum, item) => sum + item.quantity, 0),
);

const totalBarangKeluar = computed(() =>
	inventoryOut.value.reduce((sum, item) => sum + item.quantity, 0),
);

// Helper functions
const formatDate = (dateString: string) => {
	const date = new Date(dateString);
	return date.toLocaleDateString("id-ID", {
		day: "numeric",
		month: "short",
		year: "numeric",
		hour: "2-digit",
		minute: "2-digit",
	});
};

const formatDateShort = (date: Date) => {
	return date.toLocaleDateString("id-ID", {
		day: "numeric",
		month: "short",
	});
};

const formatDateForCompare = (date: Date) => {
	return date.toISOString().split("T")[0];
};

const getLastSevenDays = () => {
	const dates = [];
	for (let i = 6; i >= 0; i--) {
		const date = new Date();
		date.setDate(date.getDate() - i);
		dates.push(date);
	}
	return dates;
};

const groupDataByDate = (
	data: InventoryItem[],
	dateField: "date_in" | "date_out",
) => {
	return data.reduce((acc: Record<string, number>, item) => {
		const date = new Date(item[dateField] as string)
			.toISOString()
			.split("T")[0];
		acc[date] = (acc[date] || 0) + item.quantity;
		return acc;
	}, {});
};

// Chart data computations
const chartDataMasuk = computed(() => {
	const lastSevenDays = getLastSevenDays();
	const data = groupDataByDate(inventoryIn.value, "date_in");

	return {
		labels: lastSevenDays.map(formatDateShort),
		datasets: [
			{
				label: "Barang Masuk",
				backgroundColor: "rgba(34, 197, 94, 0.2)",
				borderColor: "rgb(34, 197, 94)",
				borderWidth: 1,
				data: lastSevenDays.map(
					(date) => data[formatDateForCompare(date)] || 0,
				),
			},
		],
	};
});

const chartDataKeluar = computed(() => {
	const lastSevenDays = getLastSevenDays();
	const data = groupDataByDate(inventoryOut.value, "date_out");

	return {
		labels: lastSevenDays.map(formatDateShort),
		datasets: [
			{
				label: "Barang Keluar",
				backgroundColor: "rgba(239, 68, 68, 0.2)",
				borderColor: "rgb(239, 68, 68)",
				borderWidth: 1,
				data: lastSevenDays.map(
					(date) => data[formatDateForCompare(date)] || 0,
				),
			},
		],
	};
});

const comparisonChartData = computed(() => {
	const lastSevenDays = getLastSevenDays();
	const dataIn = groupDataByDate(inventoryIn.value, "date_in");
	const dataOut = groupDataByDate(inventoryOut.value, "date_out");

	return {
		labels: lastSevenDays.map(formatDateShort),
		datasets: [
			{
				label: "Barang Masuk",
				borderColor: "rgb(34, 197, 94)",
				backgroundColor: "rgba(34, 197, 94, 0.1)",
				data: lastSevenDays.map(
					(date) => dataIn[formatDateForCompare(date)] || 0,
				),
				fill: true,
			},
			{
				label: "Barang Keluar",
				borderColor: "rgb(239, 68, 68)",
				backgroundColor: "rgba(239, 68, 68, 0.1)",
				data: lastSevenDays.map(
					(date) => dataOut[formatDateForCompare(date)] || 0,
				),
				fill: true,
			},
		],
	};
});

const getInventoryIn = async () => {
	try {
		const response = await axios.get(
			`${import.meta.env.VITE_BACKEND_PORT}/inventory/in`,
		);
		inventoryIn.value = response.data.invenIn;
	} catch (error: unknown) {
		if (axios.isAxiosError(error)) {
			if (error.response?.status === 401) {
				toast.error("Anda harus login terlebih dahulu!");
				toast.error(error.message || "Terjadi kesalahan");
				await router.push("/login");
			} else {
				this.toast.error(error.message);
			}
		}
	}
};

const getInventoryOut = async () => {
	try {
		const response = await axios.get(
			`${import.meta.env.VITE_BACKEND_PORT}/inventory/out`,
		);
		inventoryOut.value = response.data.invenOut;
	} catch (error: unknown) {}
};

// Lifecycle hooks
onMounted(async () => {
	await Promise.all([getInventoryIn(), getInventoryOut()]);
});
</script>

<style scoped>
.container-fluid {
    padding-top: 84px;
    width: 100%;
    max-width: 100%;
    margin: 0 auto;
    background: linear-gradient(to right, #f3f4f6, #e5e7eb);
}
</style>
