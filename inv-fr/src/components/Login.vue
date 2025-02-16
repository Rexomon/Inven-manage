<template>
    <div class="flex items-center justify-center min-h-screen">
        <div class="glass-container p-8 rounded-lg w-full max-w-md">
            <h1 class="text-2xl font-bold text-center mb-6 text-gray-800">Sign in</h1>
            <form @submit.prevent="submitLogin" class="space-y-4">
                <div class="input-group">
                    <label for="username" class="block text-sm font-medium text-gray-700">Username</label>
                    <input v-model="form.username" type="text" id="username" placeholder="Username" required
                        class="glass-input" />
                </div>
                <div class="input-group">
                    <label for="password" class="block text-sm font-medium text-gray-700">Password</label>
                    <div class="relative">
                        <input v-model="form.password" :type="showPassword ? 'text' : 'password'" id="password"
                            placeholder="Password" required class="glass-input pr-10" />
                        <button type="button" @click="togglePassword"
                            class="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none cursor-pointer">
                            <i :class="showPassword ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
                        </button>
                    </div>
                    <p v-if="statusError" class="error-message">{{ statusError }}</p>
                </div>
                <p class="text-gray-700">
                    Belum punya akun?
                    <RouterLink class="text-blue-600 hover:text-blue-800 transition-colors" to="/signup">Sign up</RouterLink>
                </p>
                <button type="submit"
                    class="w-full py-2 px-4 bg-blue-600 text-white font-semibold rounded-md
                    shadow hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2
                    focus:ring-blue-500 transition-all duration-300 cursor-pointer">
                    Sign in
                </button>
            </form>
        </div>
    </div>
</template>

<script>
import axios from "axios";
import { ref } from "vue";
import { useToast } from "vue-toast-notification";
import "vue-toast-notification/dist/theme-sugar.css";

const form = ref({
	username: "",
	password: "",
});

export default {
	setup() {
		const toast = useToast();
		return { toast };
	},
	data() {
		return {
			form,
			statusError: "",
			showPassword: false,
		};
	},

	watch: {
		form: {
			handler() {
				this.statusError = "";
			},
			deep: true,
		},
	},

	methods: {
		togglePassword() {
			this.showPassword = !this.showPassword;
		},
		async submitLogin() {
			try {
				const response = await axios.post(
					`${import.meta.env.VITE_BACKEND_PORT}/user/login`,
					form.value,
				);

				if (response.data.pesan === "Sukses Login") {
					this.toast.success("Login berhasil!");
					this.$router.push("/");
				}
			} catch (error) {
				if (error.response.status === 400) {
					this.toast.error(error.response.data.message);
					this.statusError = error.response.data.message;
				} else {
					this.toast.error(error.message);
				}
			}
		},
	},
};
</script>

<style scoped>
html, body {
    height: 100%;
    margin: 0;
}

.glass-container {
    background: rgba(255, 255, 255, 0.8);
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.2);
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.glass-input {
    width: 100%;
    background: rgba(255, 255, 255, 0.9);
    border: 1px solid rgba(0, 0, 0, 0.1);
    padding: 0.5rem 1rem;
    color: #333;
    border-radius: 0.375rem;
    outline: none;
    transition: all 0.3s ease;
}

.glass-input:focus {
    border-color: #3b82f6;
    box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1);
}

.glass-input::placeholder {
    color: rgba(0, 0, 0, 0.4);
}

.error-message {
    color: #dc2626;
    font-size: 0.875rem;
    margin-top: 0.25rem;
}

.min-h-screen {
    min-height: 100vh;
}

/* Untuk layar dengan lebar maksimum 1024px (desktop kecil) */
@media (max-width: 1024px) {
    .min-h-screen {
        min-height: 100vh;
    }
}
</style>
