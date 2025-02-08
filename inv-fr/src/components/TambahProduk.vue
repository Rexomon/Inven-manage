<template>
    <div class="min-h-screen bg-gray-50 py-8">
      <div class="max-w-lg mx-auto bg-white rounded-xl shadow-sm p-6">
        <h1 class="text-xl font-medium text-gray-800 mb-6">Tambah Produk Baru</h1>

        <form @submit.prevent="tambahBarang" class="space-y-5">
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

          <!-- Submit Button -->
          <div class="pt-2">
            <button
              type="submit"
              class="w-full bg-blue-500 hover:bg-blue-600 text-white py-2.5 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Simpan Produk</span>
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
	methods: {
		async tambahBarang() {
			try {
				const response = await axios.post(
					`${import.meta.env.VITE_BACKEND_PORT}/products/create`,
					this.form,
				);

				if (response.status === 201) {
					alert("Produk berhasil ditambahkan!");
					window.location.href = "/list-products";
				}
			} catch (error) {
				if (error.response?.status === 401) {
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

    .max-w-lg{
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
