<template>
    <div class="container mx-auto p-4">
        <h1 class="text-2xl font-bold mb-4">Daftar Produk</h1>
        <div class="table-container">
            <table class="min-w-full bg-white">
                <thead>
                    <tr>
                        <th class="py-2 px-4 border-b">Nama</th>
                        <th class="py-2 px-4 border-b">Brand</th>
                        <th class="py-2 px-4 border-b">Kategori</th>
                        <th class="py-2 px-4 border-b">Harga</th>
                        <th class="py-2 px-4 border-b">Deskripsi</th>
                        <th class="py-2 px-4 border-b">Stok</th>
                        <th class="py-2 px-4 border-b">Aksi</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="product in products" :key="product._id">
                        <td class="py-2 px-4 border-b">{{ product.name }}</td>
                        <td class="py-2 px-4 border-b">{{ product.brand }}</td>
                        <td class="py-2 px-4 border-b">{{ product.category }}</td>
                        <td class="py-2 px-4 border-b">{{ formatPrice(product.price) }}</td>
                        <td class="py-2 px-4 border-b">{{ product.description }}</td>
                        <td class="py-2 px-4 border-b">{{ product.countInStock }}</td>
                        <td class="py-2 px-4 border-b">
                            <button @click="updateProduct(product)" class="action-button bg-blue-500 text-white">Update</button>
                            <button @click="deleteProduct(product._id)" class="action-button bg-red-500 text-white">Delete</button>
                        </td>
                    </tr>
                </tbody>
            </table>
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
    max-width: 180vh;
    margin-top: 60px;
}

.table-container {
    max-height: 70vh; /* Atur tinggi maksimum sesuai kebutuhan */
    overflow-y: auto; /* Membuat tabel dapat discroll secara vertikal */
}

table {
    width: 100%;
    border-collapse: collapse;
}

th, td {
    text-align: left;
    padding: 8px;
    border-bottom: 1px solid #ddd;
}

th {
    background-color: #f4f4f4;
    position: sticky;
    top: 0;
    z-index: 1;
}

tbody tr:nth-child(even) {
    background-color: #f9f9f9;
}

.action-button {
    width: 80px; /* Atur lebar tombol */
    height: 36px; /* Atur tinggi tombol */
    margin-right: 4px; /* Jarak antar tombol */
    padding: 0; /* Hilangkan padding default */
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border-radius: 4px;
}
</style>
