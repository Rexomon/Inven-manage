<template>
    <div class="flex items-center justify-center min-h-screen bg-gray-100">
        <div class="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
            <h1 class="text-2xl font-bold text-center mb-6">Sign up</h1>
            <form @submit.prevent="submitRegister" class="space-y-4">
            <div>
                <label for="username" class="block text-sm font-medium text-gray-700">Username</label>
                <input v-model="form.username" type="text" id="username" placeholder="Username" required class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
                <p v-if="usernameError" class="error-message">{{ usernameError }}</p>
            </div>
            <div>
                <label for="password" class="block text-sm font-medium text-gray-700">Password</label>
                <input v-model="form.password" type="password" id="password" placeholder="Password" required class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
            </div>
            <div>
                <label for="email" class="block text-sm font-medium text-gray-700">Email</label>
                <input v-model="form.email" type="email" id="email" placeholder="Email" required class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
                <p v-if="emailError" class="error-message">{{ emailError }}</p>
            </div>
            <p >
                Sudah punya akun?
                <RouterLink class="jenck" to="/login">Sign in</RouterLink>
            </p>
            <button type="submit" class="w-full py-2 px-4 bg-blue-800 text-white font-semibold rounded-md shadow hover:bg-blue-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">Sign up</button>
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
	email: "",
});

export default {
	setup() {
		const toast = useToast();
		return { toast };
	},
	data() {
		return {
			form,
			usernameError: "",
			emailError: "",
		};
	},

	watch: {
		form: {
			handler() {
				this.usernameError = "";
				this.emailError = "";
			},
			deep: true,
		},
	},

	methods: {
		async submitRegister() {
			try {
				const response = await axios.post(
					`${import.meta.env.VITE_BACKEND_PORT}/user/register`,
					form.value,
				);

				if (response.data.message === "Pengguna berhasil didaftarkan") {
					this.toast.success("Pengguna berhasil didaftarkan!");
					this.$router.push("/login");
				}
			} catch (error) {
				if (error.response.data.message === "Username sudah terdaftar") {
					this.toast.error("Username sudah terdaftar");
					this.usernameError = "Username sudah terdaftar";
				}
				if (error.response.data.message === "Email sudah terdaftar") {
					this.toast.error("Email sudah terdaftar");
					this.emailError = "Email sudah terdaftar";
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

.error-message {
    color: red;
}

.jenck {
    color: #007bff;
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
