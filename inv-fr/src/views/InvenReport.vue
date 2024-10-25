<template>
    <div class="container-fluid mx-auto p-4 grid grid-cols-1 md:grid-cols-3 gap-4 min-h-screen bg-gray-50 pt-20">
      <!-- Produk Masuk -->
      <div class="bg-white rounded-lg shadow-sm flex flex-col">
        <div class="sticky top-0 bg-white p-4 border-b z-10">
          <h2 class="text-lg font-medium">Produk Masuk</h2>
        </div>
        <div class="flex-grow overflow-auto">
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

      <!-- Produk Keluar -->
      <div class="bg-white rounded-lg shadow-sm flex flex-col">
        <div class="sticky top-0 bg-white p-4 border-b z-10">
          <h2 class="text-lg font-medium">Produk Keluar</h2>
        </div>
        <div class="flex-grow overflow-auto">
          <div class="divide-y">
            <div v-for="item in sortedInventoryOut" :key="item._id"
                 class="p-3 hover:bg-gray-50 transition-colors">
              <div class="flex justify-between items-start mb-2">
                <span class="font-medium text-base">{{ item.product_name }}</span>
                <span class="text-xs text-gray-500 whitespace-nowrap ml-2">
                  {{ formatDate(item.date_out) }}
                </span>
              </div>
              <div class="grid grid-cols-2 gap-2 text-sm text-gray-600">
                <div>Brand: {{ item.brand }}</div>
                <div>Kategori: {{ item.category }}</div>
                <div>Jumlah: {{ item.quantity }}</div>
                <div>PIC: {{ item.username_pembuat }}</div>
                <div class="col-span-2 text-xs italic">
                  Alasan: {{ item.alasannya }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Logs Perubahan -->
      <div class="bg-white rounded-lg shadow-sm flex flex-col">
        <div class="sticky top-0 bg-white p-4 border-b z-10">
          <h2 class="text-lg font-medium">Logs Perubahan</h2>
        </div>
        <div class="flex-grow overflow-auto">
          <div class="divide-y">
            <div v-for="log in sortedStockChangeLogs" :key="log._id"
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
  </template>

  <script>
import axios from "axios";

export default {
	data() {
		return {
			inventoryIn: [],
			inventoryOut: [],
			stockChangeLogs: [],
		};
	},

	computed: {
		sortedInventoryIn() {
			return [...this.inventoryIn].sort(
				(a, b) => new Date(b.date_in) - new Date(a.date_in),
			);
		},
		sortedInventoryOut() {
			return [...this.inventoryOut].sort(
				(a, b) => new Date(b.date_out) - new Date(a.date_out),
			);
		},
		sortedStockChangeLogs() {
			return [...this.stockChangeLogs].sort(
				(a, b) => new Date(b.date_change) - new Date(a.date_change),
			);
		},
	},

	methods: {
		formatDate(dateString) {
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
		},

		async getInventoryIn() {
			try {
				const response = await axios.get(
					`${import.meta.env.VITE_BACKEND_PORT}/inventory/in`,
				);
				this.inventoryIn = response.data.invenIn;
			} catch (error) {
				if (error.response?.status === 401) {
					alert("Anda harus login terlebih dahulu");
					this.$router.push("/login");
				}
			}
		},

		async getInventoryOut() {
			try {
				const response = await axios.get(
					`${import.meta.env.VITE_BACKEND_PORT}/inventory/out`,
				);
				this.inventoryOut = response.data.invenOut;
			} catch (error) {
				console.error("Error fetching inventory out:", error);
			}
		},

		async getStockChangeLogs() {
			try {
				const response = await axios.get(
					`${import.meta.env.VITE_BACKEND_PORT}/inventory/logs`,
				);
				this.stockChangeLogs = response.data.stockChange;
			} catch (error) {
				console.error("Error fetching stock change logs:", error);
			}
		},
	},

	mounted() {
		this.getInventoryIn();
		this.getInventoryOut();
		this.getStockChangeLogs();
	},
};
</script>

  <style scoped>
  .container-fluid {
    padding-top: 84px;
    width: 100%;
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
