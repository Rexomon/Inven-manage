<template>
    <div class="min-h-screen bg-gray-50">
        <!-- Loading dan Error States -->
        <div v-if="isLoading" class="flex items-center justify-center min-h-screen">
            <div class="text-gray-500">Memuat data...</div>
        </div>
        <div v-else-if="errorMessage" class="flex items-center justify-center min-h-screen">
            <div class="text-red-500">{{ errorMessage }}</div>
        </div>
        <div v-else class="container mx-auto p-4 pt-20">
            <!-- Grafik Analisis - Static Section -->
            <div class="bg-white rounded-lg shadow-sm p-6 mb-6">
                <div class="flex justify-between items-center mb-4">
                    <h2 class="text-lg font-medium">Analisis Barang Masuk</h2>
                    <div class="flex gap-2">
                        <select v-model="timeRange" class="px-3 py-1 border rounded-md text-sm cursor-pointer">
                            <option value="7">7 Hari Terakhir</option>
                            <option value="30">30 Hari Terakhir</option>
                            <option value="90">90 Hari Terakhir</option>
                        </select>
                    </div>
                </div>
                <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div class="bg-green-50 rounded-lg p-4">
                        <h3 class="text-sm text-green-600 mb-1">Total Barang Masuk</h3>
                        <p class="text-2xl font-bold">{{ totalQuantity }}</p>
                    </div>
                    <div class="bg-blue-50 rounded-lg p-4">
                        <h3 class="text-sm text-blue-600 mb-1">Rata-rata per Hari</h3>
                        <p class="text-2xl font-bold">{{ averagePerDay }}</p>
                    </div>
                    <div class="bg-purple-50 rounded-lg p-4">
                        <h3 class="text-sm text-purple-600 mb-1">Total Transaksi</h3>
                        <p class="text-2xl font-bold">{{ totalTransactions }}</p>
                    </div>
                </div>
                <div class="h-64 mb-6">
                    <Line :data="chartData" :options="chartOptions" />
                </div>
            </div>

            <!-- Tabel Data - Scrollable Section -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <!-- Produk Masuk -->
                <div class="bg-white rounded-lg shadow-sm h-[calc(100vh-28rem)]">
                    <div class="sticky top-0 bg-white p-4 border-b z-10">
                        <h2 class="text-lg font-medium">Produk Masuk</h2>
                    </div>
                    <div class="overflow-y-auto h-[calc(100%-4rem)]">
                        <div class="divide-y">
                            <div v-for="item in sortedInventoryIn" :key="item._id"
                                 class="p-3 hover:bg-gray-50 transition-colors">
                                <div class="flex justify-between items-start mb-2">
                                    <span class="font-medium text-base">{{ item.product_name }}</span>
                                    <span class="text-xs text-gray-500 whitespace-nowrap ml-2">
                                      {{ formatDate(item.date_in) }}
                                    </span>
                                </div>
                                <div class="grid grid-cols-2 gap-2 text-sm text-gray-600">
                                    <div>Brand: {{ item.brand }}</div>
                                    <div>Kategori: {{ item.category }}</div>
                                    <div>Jumlah: {{ item.quantity }}</div>
                                    <div>PIC: {{ item.username_pembuat }}</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Logs Perubahan Barang Masuk -->
                <div class="bg-white rounded-lg shadow-sm h-[calc(100vh-28rem)]">
                    <div class="sticky top-0 bg-white p-4 border-b z-10">
                        <h2 class="text-lg font-medium">Logs Perubahan Barang Masuk</h2>
                    </div>
                    <div class="overflow-y-auto h-[calc(100%-4rem)]">
                        <div class="divide-y">
                            <div v-for="log in filteredIncomingLogs" :key="log._id"
                                 class="p-3 hover:bg-gray-50 transition-colors">
                                <div class="flex justify-between items-start mb-2">
                                    <span class="font-medium text-base">{{ log.product_name }}</span>
                                    <span class="text-xs text-gray-500 whitespace-nowrap ml-2">
                                      {{ formatDate(log.date_change) }}
                                    </span>
                                </div>
                                <div class="grid grid-cols-2 gap-2 text-sm text-gray-600">
                                    <div>Tipe: {{ log.change_type }}</div>
                                    <div>Kategori: {{ log.category }}</div>
                                    <div>Brand: {{ log.brand }}</div>
                                    <div>PIC: {{ log.username }}</div>
                                    <div>Jumlah: {{ log.quantity_change }}</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import type { AxiosError } from "axios";
import axios from "axios";
import {
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
import { Line } from "vue-chartjs";
import { useRouter } from "vue-router";

ChartJS.register(
	CategoryScale,
	LinearScale,
	PointElement,
	LineElement,
	Title,
	Tooltip,
	Legend,
);

// Types
interface InventoryInItem {
	_id: string;
	product_name: string;
	brand: string;
	category: string;
	quantity: number;
	date_in: string;
	username_pembuat: string;
}

interface StockChangeLog {
	_id: string;
	product_name: string;
	brand: string;
	category: string;
	quantity_change: number;
	date_change: string;
	username: string;
	change_type: string;
}

interface ApiResponse<T> {
	invenIn?: T[];
	invenOut?: T[];
	stockChange?: StockChangeLog[];
	message?: string;
	status?: number;
}

// Router and State
const router = useRouter();
const inventoryIn = ref<InventoryInItem[]>([]);
const stockChangeLogs = ref<StockChangeLog[]>([]);
const timeRange = ref("7");
const isLoading = ref(true);
const errorMessage = ref<string | null>(null);

// Chart options
const chartOptions = {
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
	scales: {
		y: {
			beginAtZero: true,
			ticks: {
				precision: 0,
			},
		},
	},
};

// Computed
const sortedInventoryIn = computed(() =>
	[...inventoryIn.value].sort(
		(a, b) => new Date(b.date_in).getTime() - new Date(a.date_in).getTime(),
	),
);

const filteredIncomingLogs = computed(() =>
	[...stockChangeLogs.value]
		.filter((log) => log.change_type === "Penambahan")
		.sort(
			(a, b) =>
				new Date(b.date_change).getTime() - new Date(a.date_change).getTime(),
		),
);

const filteredData = computed(() => {
	const cutoffDate = new Date();
	cutoffDate.setDate(
		cutoffDate.getDate() - Number.parseInt(timeRange.value, 10),
	);
	return inventoryIn.value.filter(
		(item) => new Date(item.date_in) >= cutoffDate,
	);
});

const totalQuantity = computed(() =>
	filteredData.value.reduce((sum, item) => sum + item.quantity, 0),
);

const totalTransactions = computed(() => filteredData.value.length);

const averagePerDay = computed(() => {
	if (filteredData.value.length === 0) return "0";
	return (totalQuantity.value / Number.parseInt(timeRange.value, 10)).toFixed(
		1,
	);
});

const chartData = computed(() => {
	const data = groupDataByDate();
	const dates = Object.keys(data).sort();

	return {
		labels: dates.map((date) => formatDateShort(new Date(date))),
		datasets: [
			{
				label: "Jumlah Barang Masuk",
				borderColor: "rgb(34, 197, 94)",
				backgroundColor: "rgba(34, 197, 94, 0.1)",
				data: dates.map((date) => data[date].quantity),
				fill: true,
			},
			{
				label: "Jumlah Transaksi",
				borderColor: "rgb(59, 130, 246)",
				backgroundColor: "rgba(59, 130, 246, 0.1)",
				data: dates.map((date) => data[date].transactions),
				fill: true,
			},
		],
	};
});

// Methods
const formatDateShort = (date: Date): string => {
	try {
		return date.toLocaleDateString("id-ID", {
			day: "numeric",
			month: "short",
		});
	} catch (err) {
		console.error("Error formatting date:", err);
		return "-";
	}
};

const groupDataByDate = () => {
	const data: Record<string, { quantity: number; transactions: number }> = {};
	const cutoffDate = new Date();
	cutoffDate.setDate(
		cutoffDate.getDate() - Number.parseInt(timeRange.value, 10),
	);

	// Initialize all dates
	for (
		let d = new Date(cutoffDate);
		d <= new Date();
		d.setDate(d.getDate() + 1)
	) {
		const dateStr = d.toISOString().split("T")[0];
		data[dateStr] = { quantity: 0, transactions: 0 };
	}

	for (const item of filteredData.value) {
		const date = new Date(item.date_in).toISOString().split("T")[0];
		if (data[date]) {
			data[date].quantity += item.quantity;
			data[date].transactions += 1;
		}
	}

	return data;
};

const formatDate = (dateString: string): string => {
	try {
		const date = new Date(dateString);
		const formattedDate = date.toLocaleDateString("id-ID", {
			day: "numeric",
			month: "short",
			year: "numeric",
		});
		const formattedTime = date.toLocaleTimeString("id-ID", {
			hour: "2-digit",
			minute: "2-digit",
		});
		return `${formattedDate} ${formattedTime}`;
	} catch (err) {
		console.error("Error formatting date:", err);
		return dateString;
	}
};

// API calls
const getInventoryIn = async () => {
	try {
		const response = await axios.get<ApiResponse<InventoryInItem>>(
			`${import.meta.env.VITE_BACKEND_PORT}/inventory/in`,
		);
		if (response.data.invenIn) {
			inventoryIn.value = response.data.invenIn;
		}
	} catch (err) {
		const error = err as AxiosError;
		if (error.response?.status === 401) {
			errorMessage.value = "Anda harus login terlebih dahulu";
			await router.push("/login");
		} else {
			errorMessage.value = "Gagal memuat data barang masuk";
		}
		console.error("Error fetching inventory in:", error);
	}
};

const getStockChangeLogs = async () => {
	try {
		const response = await axios.get<ApiResponse<never>>(
			`${import.meta.env.VITE_BACKEND_PORT}/inventory/logs`,
		);
		if (response.data.stockChange) {
			stockChangeLogs.value = response.data.stockChange;
		}
	} catch (err) {
		const error = err as Error;
		console.error("Error fetching stock change logs:", error);
		errorMessage.value = "Gagal memuat data log perubahan";
	}
};

// Initial data load
onMounted(async () => {
	isLoading.value = true;
	errorMessage.value = null;
	try {
		await Promise.all([getInventoryIn(), getStockChangeLogs()]);
	} catch (err) {
		console.error("Error during initial data load:", err);
		errorMessage.value = "Terjadi kesalahan saat memuat data";
	} finally {
		isLoading.value = false;
	}
});
</script>

<style scoped>
.container {
    max-width: 100%;
    margin: 0 auto;
    background: linear-gradient(to right, #f3f4f6, #e5e7eb);
}

.sticky {
    position: sticky;
    top: 0;
    background: white;
    z-index: 10;
}
</style>
