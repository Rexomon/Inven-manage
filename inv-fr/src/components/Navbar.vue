<template>
    <nav class="bg-gray-800 p-4 fixed w-full top-0 z-50">
      <div class="container mx-auto flex justify-between items-center">
        <div class="text-white text-lg font-bold">Riylunz Inventory</div>
        <div class="hidden md:flex space-x-4">
          <router-link to="/" class="text-white hover:text-gray-300">Home</router-link>
          <router-link to="/login" class="text-white hover:text-gray-300">Sign in</router-link>
        </div>
      </div>
    </nav>
  </template>

<script>
export default {};
</script>

<style scoped>

    body {
        padding-top: 64px;
    }

</style>
