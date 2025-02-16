<template>
    <div class="min-h-screen flex items-center justify-center py-4 px-4 sm:py-8 mt-14 sm:mt-0">
      <div class="w-full max-w-lg bg-white rounded-2xl shadow-lg p-4 sm:p-8 transform transition-all duration-300 hover:shadow-xl">
        <h1 class="text-xl sm:text-2xl font-semibold text-gray-800 mb-4 sm:mb-6 border-b pb-3">Tambah Produk Baru</h1>

        <form @submit.prevent="tambahBarang" class="space-y-4 sm:space-y-6">
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
            <!-- Nama Produk -->
            <div class="col-span-1 sm:col-span-2">
              <label class="text-sm font-medium text-gray-700 mb-1.5 sm:mb-2 block">Nama Produk</label>
              <input
                v-model="form.name"
                type="text"
                class="w-full px-3 sm:px-4 py-2 sm:py-2.5 border border-gray-300 rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                placeholder="Masukkan nama produk"
                required
              />
            </div>

            <!-- Brand & Kategori -->
            <div>
              <label class="text-sm font-medium text-gray-700 mb-1.5 sm:mb-2 block">Merek</label>
              <input
                v-model="form.brand"
                type="text"
                class="w-full px-3 sm:px-4 py-2 sm:py-2.5 border border-gray-300 rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                placeholder="Merek produk"
                required
              />
            </div>

            <div>
              <label class="text-sm font-medium text-gray-700 mb-1.5 sm:mb-2 block">Kategori</label>
              <input
                v-model="form.category"
                type="text"
                class="w-full px-3 sm:px-4 py-2 sm:py-2.5 border border-gray-300 rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                placeholder="Kategori produk"
                required
              />
            </div>

            <!-- Harga & Stok -->
            <div>
              <label class="text-sm font-medium text-gray-700 mb-1.5 sm:mb-2 block">Harga</label>
              <div class="relative">
                <span class="absolute left-3 sm:left-4 top-2 sm:top-2.5 text-gray-500 font-medium">Rp</span>
                <input
                  v-model="form.price"
                  type="number"
                  class="w-full pl-9 sm:pl-10 pr-3 sm:pr-4 py-2 sm:py-2.5 border border-gray-300 rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  placeholder="0"
                  required
                />
              </div>
            </div>

            <div>
              <label class="text-sm font-medium text-gray-700 mb-1.5 sm:mb-2 block">Stok</label>
              <input
                v-model="form.countInStock"
                type="number"
                class="w-full px-3 sm:px-4 py-2 sm:py-2.5 border border-gray-300 rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                placeholder="0"
                required
              />
            </div>

            <!-- Deskripsi -->
            <div class="col-span-1 sm:col-span-2">
              <label class="text-sm font-medium text-gray-700 mb-1.5 sm:mb-2 block">Deskripsi</label>
              <textarea
                v-model="form.description"
                rows="4"
                class="w-full px-3 sm:px-4 py-2 sm:py-2.5 border border-gray-300 rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-none"
                placeholder="Tambahkan deskripsi produk..."
                required
              ></textarea>
            </div>
          </div>

          <!-- Submit Button -->
          <div class="pt-2 sm:pt-4">
            <button
              type="submit"
              class="w-full bg-blue-500 hover:bg-blue-600 text-white py-2.5 sm:py-3 rounded-lg sm:rounded-xl transition-all duration-200 flex items-center justify-center gap-2 font-medium shadow-md hover:shadow-lg transform hover:-translate-y-0.5 cursor-pointer"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clip-rule="evenodd" />
              </svg>
              <span>Simpan Produk</span>
            </button>
          </div>
        </form>
      </div>
    </div>
</template>

<script>
import axios from "axios";
import { ref } from "vue";
import { useToast } from "vue-toast-notification";
import "vue-toast-notification/dist/theme-sugar.css";

export default {
	setup() {
		const toast = useToast();
		return { toast };
	},
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
					this.toast.success("Produk berhasil ditambahkan!");
					this.$router.push("/list-products");
				}
			} catch (error) {
				if (error.response?.status === 401) {
					this.toast.error("Anda harus login terlebih dahulu!");
					this.$router.push("/login");
				} else {
					this.toast.error("Terjadi kesalahan saat menambah produk");
					this.toast.error(error.message);
				}
			}
		},
	},
};
</script>

<style scoped>
.max-w-lg {
    animation: fadeIn 0.5s ease-out;
}

@keyframes fadeIn {
    from {
        opacity: 0;
        transform: translateY(10px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
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

input, textarea {
    transition: all 0.2s ease;
}

input:hover, textarea:hover {
    border-color: #93c5fd;
}
</style>
