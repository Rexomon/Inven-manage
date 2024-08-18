<template>
<div class="container-fluid mx-auto p-4 flex flex-wrap gap-4 min-h-screen overflow-hidden">
        <!-- Inventory In -->
    <div class="card bg-white shadow-lg rounded-lg w-full md:w-1/3 flex flex-col">
        <div class="sticky top-0 bg-white p-4 z-10">
            <h2 class="text-2xl font-semibold">Produk Masuk</h2>
        </div>
        <div class="overflow-y-auto p-4 flex-grow">
            <ul>
                <li v-for="item in inventoryIn" :key="item._id" class="mb-2">
                    <div class="text-xl font-semibold">{{ item.product_name }}</div>
                    <div class="text-base text-gray-700 font-semibold">Pengguna: {{ item.username_pembuat }}</div>
                    <div class="text-base text-gray-700">Jumlah: {{ item.quantity }}</div>
                    <div class="text-base text-gray-700">Tanggal: {{ new Date(item.date_in).toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric' }) }}</div>
                    <hr>
                </li>
            </ul>
        </div>
    </div>

    <!-- Inventory Out -->
    <div class="card bg-white shadow-lg rounded-lg w-full md:w-1/3 flex flex-col">
        <div class="sticky top-0 bg-white p-4 z-10">
            <h2 class="text-2xl font-semibold">Produk Keluar</h2>
        </div>
        <div class="overflow-y-auto p-4 flex-grow">
            <ul>
                <li v-for="item in inventoryOut" :key="item._id" class="mb-2">
                    <div class="text-xl font-semibold">{{ item.product_name }}</div>
                    <div class="text-base text-gray-700 font-semibold">Pengguna: {{ item.username_pembuat }}</div>
                    <div class="text-base text-gray-700">Alasan: {{ item.alasannya }}</div>
                    <div class="text-base text-gray-700">Jumlah: {{ item.quantity }}</div>
                    <div class="text-base text-gray-700">Tanggal: {{ new Date(item.date_out).toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric' }) }}</div>
                    <hr>
                </li>
            </ul>
        </div>
    </div>

    <!-- Stock Change Logs -->
    <div class="card bg-white shadow-lg rounded-lg w-full md:w-1/3 flex flex-col">
        <div class="sticky top-0 bg-white p-4 z-10">
            <h2 class="text-2xl font-semibold">Logs Perubahan</h2>
        </div>
        <div class="overflow-y-auto p-4 flex-grow">
            <ul>
                <li v-for="log in stockChangeLogs" :key="log._id" class="mb-2">
                    <div class="text-xl font-semibold">{{ log.change_type }}</div>
                    <div class="text-base text-gray-700 font-semibold">Pengguna: {{ log.username }}</div>
                    <div class="text-base text-gray-700">Produk: {{ log.product_name }}</div>
                    <div class="text-base text-gray-700">Jumlah: {{ log.quantity_change }}</div>
                    <div class="text-base text-gray-700">Tanggal: {{ new Date(log.date_change).toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric' }) }}</div>
                    <hr>
                </li>
            </ul>
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

	mounted() {
		this.getInventoryIn();
		this.getInventoryOut();
		this.getStockChangeLogs();
	},

	methods: {
		async getInventoryIn() {
			try {
				const response = await axios.get(
					`${import.meta.env.VITE_BACKEND_PORT}/inventory/in`,
				);
				const isiData = response.data.invenIn;
				this.inventoryIn = isiData;
			} catch (error) {
				if (error.response.status === 401) {
					alert("Anda harus login terlebih dahulu");
					this.$router.push("/login");
				}
			}
		},
		async getInventoryOut() {
			const response = await axios.get(
				`${import.meta.env.VITE_BACKEND_PORT}/inventory/out`,
			);
			this.inventoryOut = response.data.invenOut;
		},
		async getStockChangeLogs() {
			const response = await axios.get(
				`${import.meta.env.VITE_BACKEND_PORT}/inventory/logs`,
			);
			const isiLogs = response.data.stockChange;
			this.stockChangeLogs = isiLogs;
		},
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
    display: flex;
}

hr {
    margin-top: 8px
}
.card {
    min-height: 300px;
    max-height: calc(100vh - 104px); /* 100vh dikurangi padding-top dan margin untuk memastikan tidak melebihi layar */
    overflow-y: auto; /* Mengatur card agar bisa discroll jika konten terlalu tinggi */
}

@media (min-width: 768px) {
    .card {
    flex: 1 1 calc(33.333% - 16px);
    }
}
</style>
