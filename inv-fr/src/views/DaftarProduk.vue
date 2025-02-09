<template>
    <div class="container mx-auto p-4">
        <h1 class="text-2xl font-bold mb-4 gradient-text">Daftar Produk</h1>
        <div class="glass-table-container">
            <table>
                <thead>
                    <tr>
                        <th>Nama</th>
                        <th>Brand</th>
                        <th>Kategori</th>
                        <th>Harga</th>
                        <th>Deskripsi</th>
                        <th class="cursor-pointer sort-header" @click="toggleSortMenu" :data-active="sortOrder !== null">
                            <div class="sort-content">
                                <span>Stok</span>
                                <div class="sort-indicator">
                                    <div class="sort-icon-wrapper">
                                        <svg v-if="sortOrder === 'asc'" class="sort-icon" viewBox="0 0 24 24">
                                            <path d="M12 3.375L4.5 13.875h15L12 3.375zM12 6.625l3.875 5.25H8.125L12 6.625zM4.5 15.375h15v2h-15v-2z" fill="currentColor"/>
                                        </svg>
                                        <svg v-else-if="sortOrder === 'desc'" class="sort-icon" viewBox="0 0 24 24">
                                            <path d="M12 20.625L19.5 10.125h-15L12 20.625zM12 17.375l-3.875-5.25h7.75L12 17.375zM4.5 8.625h15v-2h-15v2z" fill="currentColor"/>
                                        </svg>
                                        <svg v-else class="sort-icon" viewBox="0 0 24 24">
                                            <path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z" fill="currentColor" fill-opacity="0.9"/>
                                        </svg>
                                    </div>
                                </div>
                            </div>
                            <div v-if="showSortMenu" class="sort-menu">
                                <div class="sort-menu-item" @click.stop="setSort('asc')" :class="{ active: sortOrder === 'asc' }">
                                    <div class="sort-menu-icon">
                                        <svg viewBox="0 0 24 24">
                                            <path d="M12 3.375L4.5 13.875h15L12 3.375zM12 6.625l3.875 5.25H8.125L12 6.625zM4.5 15.375h15v2h-15v-2z" fill="currentColor"/>
                                        </svg>
                                    </div>
                                    Stok Terendah ke Tertinggi
                                </div>
                                <div class="sort-menu-item" @click.stop="setSort('desc')" :class="{ active: sortOrder === 'desc' }">
                                    <div class="sort-menu-icon">
                                        <svg viewBox="0 0 24 24">
                                            <path d="M12 20.625L19.5 10.125h-15L12 20.625zM12 17.375l-3.875-5.25h7.75L12 17.375zM4.5 8.625h15v-2h-15v2z" fill="currentColor"/>
                                        </svg>
                                    </div>
                                    Stok Tertinggi ke Terendah
                                </div>
                                <div class="sort-menu-item" @click.stop="setSort(null)" :class="{ active: !sortOrder }">
                                    <div class="sort-menu-icon">
                                        <svg viewBox="0 0 24 24">
                                            <path d="M17.65 6.35A7.958 7.958 0 0012 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08A5.99 5.99 0 0112 18c-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z" fill="currentColor"/>
                                        </svg>
                                    </div>
                                    Reset Pengurutan
                                </div>
                            </div>
                        </th>
                        <th>Aksi</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="product in sortedProducts" :key="product._id">
                        <td>{{ product.name }}</td>
                        <td>{{ product.brand }}</td>
                        <td>{{ product.category }}</td>
                        <td>{{ formatPrice(product.price) }}</td>
                        <td>{{ product.description }}</td>
                        <td>{{ product.countInStock }}</td>
                        <td>
                            <button @click.prevent="updateProduct(product)" class="action-button bg-blue-500">
                                <svg xmlns="http://www.w3.org/2000/svg" class="button-icon" viewBox="0 0 20 20" fill="currentColor">
                                    <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z"/>
                                </svg>
                                Update
                            </button>
                            <button @click.prevent="deleteProduct(product._id)" class="action-button bg-red-500">
                                <svg xmlns="http://www.w3.org/2000/svg" class="button-icon" viewBox="0 0 20 20" fill="currentColor">
                                    <path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd"/>
                                </svg>
                                Delete
                            </button>
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
			sortOrder: null,
			showSortMenu: false,
		};
	},
	computed: {
		sortedProducts() {
			if (!this.sortOrder) return this.products;

			if (
				this._lastSortOrder === this.sortOrder &&
				this._lastProducts === this.products
			) {
				return this._lastSortedResult;
			}

			const sorted = [...this.products].sort((a, b) => {
				return this.sortOrder === "asc"
					? a.countInStock - b.countInStock
					: b.countInStock - a.countInStock;
			});

			this._lastSortOrder = this.sortOrder;
			this._lastProducts = this.products;
			this._lastSortedResult = sorted;

			return sorted;
		},
	},
	mounted() {
		this.ambilData();
		this.clickOutsideHandler = (e) => {
			if (this.showSortMenu && !e.target.closest(".sort-header")) {
				this.showSortMenu = false;
			}
		};
		document.addEventListener("click", this.clickOutsideHandler);
	},
	beforeUnmount() {
		document.removeEventListener("click", this.clickOutsideHandler);

		if (this._sortTimeout) {
			clearTimeout(this._sortTimeout);
		}
	},
	methods: {
		toggleSortMenu(event) {
			event.stopPropagation();
			this.showSortMenu = !this.showSortMenu;
		},

		setSort(order) {
			if (this._sortTimeout) {
				clearTimeout(this._sortTimeout);
			}
			this._sortTimeout = setTimeout(() => {
				this.sortOrder = order;
				this.showSortMenu = false;
			}, 150);
		},

		async handleAuthError(error) {
			if (error?.response?.status === 401) {
				alert("Anda harus login terlebih dahulu");
				this.$router.push("/login");
			}
		},

		async ambilData() {
			try {
				const response = await axios.get(
					`${import.meta.env.VITE_BACKEND_PORT}/products/`,
				);
				this.products = response.data.products;
			} catch (error) {
				await this.handleAuthError(error);
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
				await this.handleAuthError(error);
			}
		},

		updateProduct(product) {
			const dataProduct = JSON.stringify(product);
			localStorage.setItem("idProduct", dataProduct);

			this.$router.push("/update-product");
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
    position: fixed;
    top: 60px;
    left: 0;
    right: 0;
    bottom: 0;
    padding: min(2rem, 4vh);
    background: transparent;
    display: flex;
    flex-direction: column;
}

.glass-table-container {
    flex: 1;
    background: rgba(255, 255, 255, 0.7);
    border: 1px solid rgba(0, 0, 0, 0.1);
    border-radius: 8px;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08);
    overflow-y: auto;
    overflow-x: hidden;
    min-height: 0;
    position: relative;
    width: 100%;
}

table {
    width: 100%;
    min-width: max-content;
    border-collapse: separate;
    border-spacing: 0;
    color: #333;
}

thead {
    position: sticky;
    top: 0;
    z-index: 2;
    background: rgb(164, 155, 148);
    -webkit-transform: translateZ(0);
    transform: translateZ(0);
    will-change: transform;
}

th {
    padding: 1rem;
    font-weight: 600;
    text-align: left;
    border-bottom: 1px solid rgba(0, 0, 0, 0.1);
    color: #ffffff;
    background: transparent;
    -webkit-font-smoothing: antialiased;
}

td {
    padding: 1rem;
    border-bottom: 1px solid rgba(0, 0, 0, 0.1);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    background: rgba(255, 255, 255, 0.7);
    position: relative;
    z-index: 1;
    max-width: 200px;
}

td:last-child {
    min-width: 180px;
    max-width: none;
    white-space: nowrap;
}

tr:hover td {
    background: rgba(255, 255, 255, 0.9);
}

.sort-header {
    position: relative;
    min-width: 140px !important;
}

.sort-content {
    display: flex;
    align-items: center;
    gap: 12px;
    min-height: 40px;
    padding: 4px;
    border-radius: 8px;
}

.sort-icon-wrapper {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    border-radius: 6px;
    background: #f0f0f0;
    transition: all 0.3s ease;
}

.sort-icon-wrapper:hover {
    background: #e0e0e0;
    transform: scale(1.1);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.sort-icon {
    width: 20px;
    height: 20px;
    color: #666;
    transition: transform 0.3s ease;
}

.sort-header:hover .sort-icon {
    transform: translateY(-1px);
    color: #333;
}

.sort-header[data-active="true"] .sort-icon-wrapper {
    background: #e8f0fe;
    border: 1px solid #d0e3ff;
}

.sort-header[data-active="true"] .sort-icon {
    color: #1a73e8;
}

.sort-header[data-active="true"]:hover .sort-icon-wrapper {
    background: #d0e3ff;
    box-shadow: 0 2px 6px rgba(26, 115, 232, 0.2);
}

.sort-menu {
    position: absolute;
    top: calc(100% + 4px);
    right: 0;
    background: #ffffff;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    z-index: 1000;
    min-width: 220px;
    border: 1px solid #e0e0e0;
    max-height: calc(100vh - 100%);
    overflow-y: auto;
}

.sort-menu-item {
    padding: 10px 16px;
    cursor: pointer;
    display: flex;
    align-items: center;
    color: #333;
    border-bottom: 1px solid #e0e0e0;
}

.sort-menu-item:hover {
    background: #f5f5f5;
}

.sort-menu-item.active {
    background: #e0e0e0;
}

.sort-menu-icon {
    width: 24px;
    height: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-right: 12px;
    border-radius: 4px;
    background: rgba(255, 255, 255, 0.1);
    padding: 4px;
}

.sort-menu-item:last-child .sort-menu-icon svg {
    transition: transform 0.5s ease;
}

.sort-menu-item:last-child:hover .sort-menu-icon svg {
    transform: rotate(-360deg);
}

.action-button {
    padding: 0.4rem 0.8rem;
    margin-right: 0.4rem;
    border-radius: 6px;
    color: white;
    font-weight: 600;
    cursor: pointer;
    border: 1px solid rgba(255, 255, 255, 0.2);
    position: relative;
    overflow: hidden;
    transition: all 0.2s ease;
    backdrop-filter: blur(5px);
    -webkit-backdrop-filter: blur(5px);
    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
    letter-spacing: 0.2px;
    display: inline-flex;
    align-items: center;
    gap: 4px;
    font-size: 0.9rem;
    min-width: 85px;
    justify-content: center;
}

.button-icon {
    width: 16px;
    height: 16px;
    fill: currentColor;
}

.action-button.bg-blue-500 {
    background: linear-gradient(135deg, #3498db, #2980b9);
    box-shadow: 0 4px 15px rgba(52, 152, 219, 0.3);
    border-color: rgba(52, 152, 219, 0.5);
}

.action-button.bg-red-500 {
    background: linear-gradient(135deg, #e74c3c, #c0392b);
    box-shadow: 0 4px 15px rgba(231, 76, 60, 0.3);
    border-color: rgba(231, 76, 60, 0.5);
}

.action-button:hover {
    transform: translateY(-2px);
    filter: brightness(110%);
}

.action-button.bg-blue-500:hover {
    box-shadow: 0 6px 20px rgba(52, 152, 219, 0.4);
}

.action-button.bg-red-500:hover {
    box-shadow: 0 6px 20px rgba(231, 76, 60, 0.4);
}

.action-button:active {
    transform: translateY(1px);
    filter: brightness(95%);
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
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

@media (max-width: 768px) {
    .container {
        padding: 1rem;
    }

    .glass-table-container {
        overflow-x: auto;
    }

    .sort-icon-wrapper {
        width: 36px;
        height: 36px;
    }

    .sort-icon {
        width: 24px;
        height: 24px;
    }

    .sort-menu-icon {
        width: 20px;
        height: 20px;
        padding: 3px;
    }

    .gradient-text {
        font-size: 2rem;
    }
}

@media (max-width: 1366px) {
    td {
        padding: 0.75rem 0.5rem;
        font-size: 0.9rem;
    }

    td:last-child {
        padding-right: 1rem;
        min-width: 190px;
    }

    .action-button {
        padding: 0.35rem 0.5rem;
        font-size: 0.85rem;
        margin-right: 0.3rem;
        min-width: 80px;
    }

    .button-icon {
        width: 14px;
        height: 14px;
    }

    th {
        padding: 0.75rem 0.5rem;
    }
}
</style>
