import { Elysia, t } from "elysia";
import { EnkodeTok } from "../Middleware/Jwt";
import AuthUser from "../Middleware/Auth";
import userModel from "../Models/userModel";

const users = new Elysia({ prefix: "/user" })
	.post(
		// Login user
		"/login",
		async ({ body, set, cookie: { aksesToken } }) => {
			try {
				const { username, password } = body;

				// Check if username exists in the database
				const userLogin = await userModel.findOne({ username: username });
				if (!userLogin) {
					set.status = 400;
					return { message: "Username atau Password salah" };
				}

				// Verify the password with the stored password
				const PasswordCheck = await Bun.password.verify(
					password,
					userLogin.password,
				);
				if (!PasswordCheck) {
					set.status = 400;
					return { message: "Username atau Password salah" };
				}

				// Create JWT token
				const UserToken = EnkodeTok({
					id: userLogin.id,
					username: userLogin.username,
					email: userLogin.email,
				});

				// Set cookie with AccessToken details
				aksesToken.set({
					value: UserToken,
					httpOnly: true,
					sameSite: "lax",
					secure: true, // Gunakan "secure: true" jika menggunakan HTTPS
					maxAge: 900,
				});

				set.status = 201;
				return { pesan: "sukses" };
			} catch (error) {
				console.error(error);
			}
		},
		{
			body: t.Object({
				username: t.String(),
				password: t.String(),
			}),
		},
	)
	// Register user
	.post(
		"/register",
		async ({ body, set }) => {
			const { username, password, email } = body;

			// Cek apakah username sudah terdaftar
			const validateUsername = await userModel.findOne({ username: username });
			if (validateUsername) {
				set.status = 400;
				return { message: "Username sudah terdaftar" };
			}

			// Cek apakah email sudah terdaftar
			const validateEmail = await userModel.findOne({ email: email });
			if (validateEmail) {
				set.status = 400;
				return { message: "Email sudah terdaftar" };
			}

			const hashPassword = await Bun.password.hash(password);

			// Jika validasi berhasil, buat pengguna baru
			await userModel.create({
				username: username,
				password: hashPassword,
				email: email,
			});
			set.status = 201;
			return { message: "Pengguna berhasil didaftarkan" };
		},
		{
			body: t.Object({
				username: t.String(),
				password: t.String(),
				email: t.String(),
			}),
		},
	)
	// Get current user
	.group("/current", (app) =>
		app.use(AuthUser).get("/", async ({ set, user }) => {
			if (!user) {
				set.status = 401;
				return { message: "Unauthorized" };
			}
			set.status = 200;
			return { message: "Halo", user };
		}),
	);

export default users;
