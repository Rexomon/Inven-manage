<script>
import axios from "axios";
import { ref } from "vue";

const totalProducts = ref(0);
const lowStockProducts = ref(0);
const outOfStockProducts = ref(0);

export default {
	data() {
		return {
			totalProducts,
			lowStockProducts,
			outOfStockProducts,
			isVerified: false,
			showOverlay: true,
		};
	},

	mounted() {
		this.fetchData();
		this.verifyStatus();
		if (this.showOverlay) {
			window.onloadTurnstileCallback = () => {
				turnstile.render("#myTurnstile", {
					sitekey: "0x4AAAAAAAwzSq23sgTJwVH2",
					callback: this.handlerVerification,
				});
			};
		}
	},

	methods: {
		verifyStatus() {
			const isVerified = localStorage.getItem("isVerified");
			if (isVerified === "true") {
				this.showOverlay = false;
			}
		},

		handlerVerification() {
			localStorage.setItem("isVerified", true);
			this.showOverlay = false;
			setTimeout(() => {
				document.getElementById("myTurnstile").style.display = "none";
			}, 3000);
		},

		async fetchData() {
			try {
				const response = await axios.get(
					`${import.meta.env.VITE_BACKEND_PORT}/products/summary`,
				);
				const isiData = response.data.summary;

				if (isiData) {
					totalProducts.value = isiData.productCount;
					lowStockProducts.value = isiData.lowStock.length;
					outOfStockProducts.value = isiData.outOfStock.length;
				}
			} catch (error) {
				console.error("Error fetching products:", error);
			}
		},
	},
};
</script>

<template>
  <main class="p-4">
    <h1 class="text-2xl font-bold mb-6 gradient-text">Dashboard Inventaris</h1>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div class="glass-card p-6 rounded-xl">
        <h2 class="text-xl font-semibold text-white mb-2">Total Produk</h2>
        <p class="text-4xl font-bold text-white">{{ totalProducts }}</p>
      </div>
      <div class="glass-card p-6 rounded-xl">
        <h2 class="text-xl font-semibold text-white mb-2">Produk Stok Rendah</h2>
        <p class="text-4xl font-bold text-white">{{ lowStockProducts }}</p>
      </div>
      <div class="glass-card p-6 rounded-xl">
        <h2 class="text-xl font-semibold text-white mb-2">Produk Stok Habis</h2>
        <p class="text-4xl font-bold text-white">{{ outOfStockProducts }}</p>
      </div>
    </div>

    <div class="mt-10">
      <h2 class="text-xl font-semibold mb-8 text-gray-700">Tautan Cepat</h2>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
        <router-link to="/add-product" class="quick-link">
          <svg xmlns="http://www.w3.org/2000/svg" class="quick-link-icon" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clip-rule="evenodd" />
          </svg>
          <span class="block text-lg font-semibold">Tambah Produk Baru</span>
        </router-link>
        <router-link to="/list-products" class="quick-link">
          <svg xmlns="http://www.w3.org/2000/svg" class="quick-link-icon" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clip-rule="evenodd" />
          </svg>
          <span class="block text-lg font-semibold">Lihat Daftar Produk</span>
        </router-link>
        <router-link to="/reports" class="quick-link">
          <svg xmlns="http://www.w3.org/2000/svg" class="quick-link-icon" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M3 3a1 1 0 011-1h12a1 1 0 011 1v3a1 1 0 01-.293.707L12 11.414V15a1 1 0 01-.293.707l-2 2A1 1 0 018 17v-5.586L3.293 6.707A1 1 0 013 6V3z" clip-rule="evenodd" />
          </svg>
          <span class="block text-lg font-semibold">Laporan Inventaris</span>
        </router-link>
      </div>
    </div>
    <div v-if="showOverlay" class="overlay">
        <div id="myTurnstile" class="turnstile-container"></div>
    </div>
  </main>
</template>

<style scoped>
main {
    position: fixed;
    top: 60px;
    left: 0;
    right: 0;
    bottom: 0;
    padding: min(2rem, 4vh);
    background: transparent;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
}

.glass-card {
    background: rgba(255, 255, 255, 0.7);
    border: 1px solid rgba(0, 0, 0, 0.1);
    border-radius: 8px;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08);
}

.glass-card:hover {
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.12);
}

.glass-card h2, .glass-card p {
    color: #333 !important;
}

.quick-link {
    padding: 1.2rem !important;
    border-radius: 10px;
    color: white;
    font-weight: 600;
    cursor: pointer;
    border: 2px solid rgba(255, 255, 255, 0.2);
    position: relative;
    overflow: hidden;
    transition: all 0.2s ease;
    backdrop-filter: blur(5px);
    -webkit-backdrop-filter: blur(5px);
    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
    letter-spacing: 0.5px;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    height: 90px;
}

.quick-link-icon {
    width: 24px;
    height: 24px;
    fill: currentColor;
}

.quick-link:nth-child(1) {
    background: linear-gradient(135deg, #3498db, #2980b9);
    box-shadow: 0 4px 15px rgba(52, 152, 219, 0.3);
    border-color: rgba(52, 152, 219, 0.5);
}

.quick-link:nth-child(2) {
    background: linear-gradient(135deg, #f39c12, #d35400);
    box-shadow: 0 4px 15px rgba(243, 156, 18, 0.3);
    border-color: rgba(243, 156, 18, 0.5);
}

.quick-link:nth-child(3) {
    background: linear-gradient(135deg, #2ecc71, #27ae60);
    box-shadow: 0 4px 15px rgba(46, 204, 113, 0.3);
    border-color: rgba(46, 204, 113, 0.5);
}

.quick-link:hover {
    transform: translateY(-2px);
    filter: brightness(110%);
}

.quick-link:nth-child(1):hover {
    box-shadow: 0 6px 20px rgba(52, 152, 219, 0.4);
}

.quick-link:nth-child(2):hover {
    box-shadow: 0 6px 20px rgba(243, 156, 18, 0.4);
}

.quick-link:nth-child(3):hover {
    box-shadow: 0 6px 20px rgba(46, 204, 113, 0.4);
}

.quick-link:active {
    transform: translateY(1px);
    filter: brightness(95%);
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
}

.quick-link span {
    font-size: 1.1rem;
    font-weight: 600;
}

.quick-link::before {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(135deg,
        rgba(255, 255, 255, 0.2) 0%,
        rgba(255, 255, 255, 0.1) 50%,
        rgba(255, 255, 255, 0) 100%);
    pointer-events: none;
}


.quick-link::after {
    display: none;
}

@keyframes spotlight {
    0% {
        opacity: 0;
    }
    100% {
        opacity: 0;
    }
}

@media (max-width: 768px) {
    .quick-link {
        padding: 1rem !important;
        height: 80px;
    }

    .quick-link span {
        font-size: 1rem;
    }

    .quick-link-icon {
        width: 20px;
        height: 20px;
    }

    .quick-link::before {
    background: linear-gradient(
        170deg,
        rgba(255, 255, 255, 0.2),
        rgba(255, 255, 255, 0.05) 20%,
        transparent
        );
    }

    .quick-link:hover {
    transform: none;
    border-color: rgba(255, 255, 255, 0.4);
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
    }

    .quick-link:active {
    transform: scale(0.98);
    transition: transform 0.1s ease;
    }
}

.quick-link::before,
.quick-link::after {
    display: none;
}

.quick-link::after {
    content: '';
    position: absolute;
    top: -50%;
    left: -50%;
    width: 200%;
    height: 200%;
    background: radial-gradient(
        circle at center,
        rgba(255, 255, 255, 0.1) 0%,
        transparent 70%
    );
    opacity: 0;
    transform: scale(1.5);
    pointer-events: none;
}

.quick-link:hover::after {
    opacity: 0.4;
    animation: spotlight 1s ease-out forwards;
}

h1, h2 {
    color: #333 !important;
}

.overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.8);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
}

.turnstile-container {
    background: rgba(255, 255, 255, 0.95);
    padding: 20px;
    border-radius: 10px;
    border: 1px solid rgba(0, 0, 0, 0.1);
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}

.gradient-text {
    background: linear-gradient(45deg, #2980b9, #3498db, #4aa6e0, #48c6ef, #6dd5ed);
    -webkit-background-clip: text;
    background-clip: text;
    color: transparent !important;
    font-weight: bold;
    font-size: 2.5rem;
    text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.08);
    letter-spacing: 0.5px;
}


.mt-10 h2 {
    color: #1a202c !important;
    font-weight: 700;
    font-size: 1.5rem;
    margin-bottom: 2rem;
    letter-spacing: 0.3px;
}
</style>
