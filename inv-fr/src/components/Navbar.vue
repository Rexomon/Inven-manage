<template>
    <nav class="bg-gray-800 p-4 fixed w-full top-0 z-50">
      <div class="container mx-auto flex justify-between items-center">
        <div class="text-white text-lg font-bold">Riylunz Inventory</div>
        <div class="hidden md:flex space-x-4">
          <router-link to="/" class="text-white hover:text-gray-300">Home</router-link>
          <router-link to="/login" class="text-white hover:text-gray-300">Sign in</router-link>
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
        <router-link to="/login" class="block text-white hover:text-gray-300 py-2" @click.native="isMenuOpen = false">Sign in</router-link>
      </div>
    </nav>
  </template>

<script>
export default {
	data() {
		return {
			isMenuOpen: false,
		};
	},
	methods: {
		toggleMenu() {
			this.isMenuOpen = !this.isMenuOpen;
		},
	},
};
</script>

<style scoped>

    body {
        padding-top: 64px;
    }

</style>
