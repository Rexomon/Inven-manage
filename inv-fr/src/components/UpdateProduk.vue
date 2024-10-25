<template>
    <div class="min-h-screen bg-gray-50 py-8">
      <div class="max-w-lg mx-auto bg-white rounded-xl shadow-sm p-6">
        <div class="flex items-center justify-between mb-6">
          <h1 class="text-xl font-medium text-gray-800">Update Produk</h1>
        </div>

        <form @submit.prevent="updateBarang" class="space-y-5">
          <!-- Grid Layout untuk input yang berkaitan -->
          <div class="grid grid-cols-2 gap-4">
            <!-- Nama Produk -->
            <div class="col-span-2">
              <label class="text-sm text-gray-600 mb-1 block">Nama Produk</label>
              <input
                v-model="form.name"
                type="text"
                class="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-blue-400 transition-colors"
                placeholder="Masukkan nama produk"
                required
              />
            </div>

            <!-- Brand & Kategori -->
            <div>
              <label class="text-sm text-gray-600 mb-1 block">Merek</label>
              <input
                v-model="form.brand"
                type="text"
                class="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-blue-400 transition-colors"
                placeholder="Merek produk"
                required
              />
            </div>

            <div>
              <label class="text-sm text-gray-600 mb-1 block">Kategori</label>
              <input
                v-model="form.category"
                type="text"
                class="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-blue-400 transition-colors"
                placeholder="Kategori produk"
                required
              />
            </div>

            <!-- Harga & Stok -->
            <div>
              <label class="text-sm text-gray-600 mb-1 block">Harga</label>
              <div class="relative">
                <span class="absolute left-3 top-2 text-gray-500">Rp</span>
                <input
                  v-model="form.price"
                  type="number"
                  class="w-full pl-8 pr-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-blue-400 transition-colors"
                  placeholder="0"
                  required
                />
              </div>
            </div>

            <div>
              <label class="text-sm text-gray-600 mb-1 block">Stok</label>
              <input
                v-model="form.countInStock"
                type="number"
                class="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-blue-400 transition-colors"
                placeholder="0"
                required
              />
            </div>

            <!-- Deskripsi -->
            <div class="col-span-2">
              <label class="text-sm text-gray-600 mb-1 block">Deskripsi</label>
              <textarea
                v-model="form.description"
                rows="3"
                class="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-blue-400 transition-colors resize-none"
                placeholder="Tambahkan deskripsi produk..."
                required
              ></textarea>
            </div>
          </div>

          <!-- Action Buttons -->
          <div class="grid grid-cols-2 gap-3 pt-2">
            <button
              type="button"
              @click="$router.push('/list-products')"
              class="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 py-2.5 rounded-lg transition-colors duration-200"
            >
              Batal
            </button>
            <button
              type="submit"
              class="w-full bg-blue-500 hover:bg-blue-600 text-white py-2.5 rounded-lg transition-colors duration-200"
            >
              Simpan Perubahan
            </button>
          </div>
        </form>
      </div>
    </div>
  </template>

  <script>
import { ref } from "vue";
import axios from "axios";

export default {
	data() {
		return {
			form: ref({
				name: "",
				price: 0,
				brand: "",
				category: "",
				countInStock: 0,
				description: "",
			}),
		};
	},

	mounted() {
		this.productData();
	},

	methods: {
		productData() {
			try {
				const data = localStorage.getItem("idProduct");
				if (!data) {
					console.error("No product data found");
					this.$router.push("/list-products");
					return;
				}
				const ambilData = JSON.parse(data);
				this.form.name = ambilData.name;
				this.form.price = ambilData.price;
				this.form.brand = ambilData.brand;
				this.form.category = ambilData.category;
				this.form.countInStock = ambilData.countInStock;
				this.form.description = ambilData.description;
			} catch (error) {
				console.error("Error loading product data:", error);
				this.$router.push("/list-products");
			}
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
				if (error.response?.status === 401) {
					alert("Anda harus login terlebih dahulu!");
					this.$router.push("/login");
				}
				console.error("Error updating product:", error);
			}
		},
	},
};
</script>

<style scoped>
    .max-w-lg {
        margin-top: 3rem;
    }


    input::-webkit-outer-spin-button,
    input::-webkit-inner-spin-button {
        -webkit-appearance: none;
        margin: 0;
    }

    input[type=number] {
        -moz-appearance: textfield;
        appearance: textfield;
    }
</style>
