<template>
    <div class="container mx-auto p-4">
      <h1 class="text-2xl font-bold mb-4">Daftar Produk</h1>
      <div class="space-y-4">
        <div v-for="product in products" :key="product._id" class="bg-white shadow-md rounded-lg overflow-hidden p-4">
          <h2 class="text-lg font-semibold">{{ product.name }}</h2>
          <p class="text-gray-600">Brand: {{ product.brand }}</p>
          <p class="text-gray-600">Category: {{ product.category }}</p>
          <p class="text-gray-800 font-bold">Price: {{ formatPrice(product.price) }}</p>
          <p class="text-gray-600">Description: {{ product.description }}</p>
          <p class="text-gray-600">Stok: {{ product.countInStock }}</p>
          <div class="flex space-x-2 mt-4">
            <button @click="updateProduct(product)" class="bg-blue-500 text-white px-4 py-2 rounded">Update</button>
            <button @click="deleteProduct(product._id)" class="bg-red-500 text-white px-4 py-2 rounded">Delete</button>
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
			products: [],
		};
	},
	mounted() {
		this.ambilData();
	},
	methods: {
		async ambilData() {
			try {
				const response = await axios.get(
					`${import.meta.env.VITE_BACKEND_PORT}/products/`,
				);
                const isiData = response.data.products;
				this.products = isiData;
			} catch (error) {
				if (error.response.status === 401) {
					alert("Anda harus login terlebih dahulu");
					this.$router.push("/login");
				}
			}
		},

		async deleteProduct(productId) {
			try {
				await axios.delete(
					`${import.meta.env.VITE_BACKEND_PORT}/products/delete/${productId}`,
				);
				this.products = this.products.filter(
					(product) => product._id !== productId,
				);
			} catch (error) {
				if (error.response.status === 401) {
					alert("Anda harus login terlebih dahulu");
					this.$router.push("/login");
				}
			}
		},

		updateProduct(product) {
			const dataProduct = JSON.stringify(product);
			localStorage.setItem("idProduct", dataProduct);

            window.location.href = "/update-product";
		},

		formatPrice(value) {
			const formattedValue = new Intl.NumberFormat("id-ID", {
				style: "currency",
				currency: "IDR",
				minimumFractionDigits: 0,
				maximumFractionDigits: 0,
			}).format(value);
			return formattedValue.replace(/,00$/, "");
		},
	},
};
</script>

  <style scoped>
  .container {
    max-width: 800px;
    margin-top: 60px;
  }
  </style>
