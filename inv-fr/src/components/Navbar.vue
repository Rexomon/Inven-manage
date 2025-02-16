<template>
    <nav class="bg-gray-800 p-4 fixed w-full top-0 z-50">
      <div class="container mx-auto flex justify-between items-center">
        <div class="text-white text-lg font-bold">Riylunz Inventory</div>
        <div class="hidden md:flex space-x-4">
          <router-link to="/" class="text-white hover:text-gray-300">Home</router-link>
          <router-link v-if="!isLoggedIn" to="/login" class="text-white hover:text-gray-300">Sign in</router-link>
          <router-link v-if="isLoggedIn" to="#" @click.prevent="handleLogout()" class="text-white hover:text-gray-300">Logout</router-link>
        </div>
        <div class="md:hidden">
          <button @click="toggleMenu" class="text-white focus:outline-none">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16m-7 6h7"></path>
            </svg>
          </button>
        </div>
      </div>
      <div v-if="isMenuOpen" class="md:hidden">
        <router-link to="/" class="block text-white hover:text-gray-300 py-2" @click.native="isMenuOpen = false">Home</router-link>
        <router-link v-if="!isLoggedIn" to="/login" class="block text-white hover:text-gray-300 py-2" @click.native="isMenuOpen = false">Sign in</router-link>
        <router-link v-if="isLoggedIn" to="#" @click.prevent="handleLogout()" class="block text-white hover:text-gray-300 py-2" @click.native="isMenuOpen = false">Logout</router-link>
      </div>
    </nav>
  </template>

<script>
import axios from "axios";
import { useToast } from "vue-toast-notification";
import "vue-toast-notification/dist/theme-sugar.css";

export default {
	data() {
		return {
			isMenuOpen: false,
			isLoggedIn: false,
		};
	},

	setup() {
		const toast = useToast();
		return { toast };
	},

	watch: {
		$route: {
			handler() {
				const usedRoute = [
					"/login",
					"/signup",
					"/reports",
					"/list-products",
					"/add-product",
					"/update-product",
				];
				if (!usedRoute.includes(this.$route.path)) {
					this.checkLogin();
				}
			},
		},
	},

	methods: {
		toggleMenu() {
			this.isMenuOpen = !this.isMenuOpen;
		},

		async checkLogin() {
			try {
				const currentUser = await axios.get(
					`${import.meta.env.VITE_BACKEND_PORT}/user/current`,
				);

				const userLogin = currentUser.data.user.username;

				if (userLogin) {
					this.isLoggedIn = true;
				}
			} catch (error) {
				if (error.response.status === 401) {
					await this.refreshLogin();
				}
			}
		},
		async refreshLogin() {
			try {
				const refreshLogin = await axios.post(
					`${import.meta.env.VITE_BACKEND_PORT}/user/refresh`,
				);

				if (refreshLogin.data.message === "Token refreshed") {
					this.isLoggedIn = true;
				}
			} catch (error) {
				if (error.response.status === 401) {
					this.isLoggedIn = false;
				}
			}
		},

		async handleLogout() {
			const userLogout = await axios.post(
				`${import.meta.env.VITE_BACKEND_PORT}/user/logout`,
			);

			if (userLogout.data.message === "Logout berhasil") {
				this.isLoggedIn = false;
				this.toast.success("Logout berhasil!");
			}
		},
	},
};
</script>

<style scoped>

    body {
        padding-top: 64px;
    }

</style>
