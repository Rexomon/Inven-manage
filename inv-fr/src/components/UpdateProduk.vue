<template>
    <div class="max-w-2xl mx-auto p-4">
        <h1 class="text-2xl font-bold mb-4">Ubah Produk</h1>
        <form @submit.prevent="updateBarang" class="space-y-4">
            <div>
            <label for="name" class="block text-sm font-medium text-gray-700">Nama Produk</label>
            <input v-model="form.name" type="text" id="name" placeholder="Nama Produk" class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" required />
            </div>
            <div>
            <label for="price" class="block text-sm font-medium text-gray-700">Harga</label>
            <input v-model="form.price" type="number" id="price" class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" required />
            </div>
            <div>
            <label for="brand" class="block text-sm font-medium text-gray-700">Merek</label>
            <input v-model="form.brand" type="text" id="brand" placeholder="Merek" class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" required />
            </div>
            <div>
            <label for="category" class="block text-sm font-medium text-gray-700">Kategori</label>
            <input v-model="form.category" type="text" id="category" placeholder="Kategori" class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" required />
            </div>
            <div>
            <label for="countInStock" class="block text-sm font-medium text-gray-700">Jumlah Stok</label>
            <input v-model="form.countInStock" type="number" id="countInStock" placeholder="Jumlah Stok" class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" required />
            </div>
            <div>
            <label for="description" class="block text-sm font-medium text-gray-700">Deskripsi</label>
            <textarea v-model="form.description" id="description" placeholder="Barangnya bagus..." class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" required></textarea>
            </div>
            <div>
            <button type="submit" class="w-full bg-blue-500 text-white p-2 rounded-md shadow-sm hover:bg-blue-600">Ubah Produk</button>
            </div>
        </form>
        </div>
</template>

<script>
import { ref } from "vue";
import axios from "axios";

const form = ref({
	name: "",
	price: 0,
	brand: "",
	category: "",
	countInStock: 0,
	description: "",
});

export default {
	data() {
		return {
			form,
		};
	},

	mounted() {
		this.productData();
	},
	methods: {
		productData() {
			const data = localStorage.getItem("idProduct");
			const ambilData = JSON.parse(data);
			this.form.name = ambilData.name;
			this.form.price = ambilData.price;
			this.form.brand = ambilData.brand;
			this.form.category = ambilData.category;
			this.form.countInStock = ambilData.countInStock;
			this.form.description = ambilData.description;
		},

		async updateBarang() {
			try {
				const data = localStorage.getItem("idProduct");
				const ambilData = JSON.parse(data);
				const response = await axios.patch(
					`${import.meta.env.VITE_BACKEND_PORT}/products/update/${ambilData._id}`,
					this.form,
				);

				if (response.status === 200) {
					alert("Produk berhasil diubah!");
					window.location.href = "/list-products";
				}
			} catch (error) {
				if (error.response.status === 401) {
					alert("Anda harus login terlebih dahulu!");
					this.$router.push("/login");
				}
				console.error(error);
			}
		},
	},
};
</script>

<style scoped>
.max-w-2xl {
    margin-top: 60px;
}
</style>
