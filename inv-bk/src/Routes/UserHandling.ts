import { Elysia } from "elysia";
import Redis from "../Config/Redis";
import AuthUser from "../Middleware/Auth";
import SkemaUser from "../Models/userModel";
import { JwtAksesToken, JwtRefreshToken } from "../Middleware/Jwt";
import { UserLoginTypes, UserRegisterTypes } from "../Types/UserTypes";

const users = new Elysia({ prefix: "/user" })
	.use(JwtAksesToken())
	.use(JwtRefreshToken())
	.post(
		// Login user
		"/login",
		async ({
			body,
			set,
			cookie: { aksesToken, refreshToken },
			JwtAksesToken,
			JwtRefreshToken,
		}) => {
			try {
				const { username, password } = body;

				// Check if username exists in the database
				const userLogin = await SkemaUser.findOne({ username: username });
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

				// Generate access token and refresh token
				const currentTime = Math.floor(Date.now() / 1000);

				const AccessToken = await JwtAksesToken.sign({
					id: userLogin.id,
					username: userLogin.username,
					email: userLogin.email,
					iat: currentTime,
					exp: currentTime + 1800,
				});

				const refreshAccessToken = await JwtRefreshToken.sign({
					id: userLogin.id,
					iat: currentTime,
					exp: currentTime + 604800,
				});

				// Set the access token and refresh token to the cookie
				aksesToken.set({
					value: AccessToken,
					httpOnly: true,
					sameSite: "lax",
					secure: true, // Gunakan "secure: true" jika menggunakan HTTPS
					maxAge: 1800,
				});

				refreshToken.set({
					value: refreshAccessToken,
					httpOnly: true,
					sameSite: "lax",
					secure: true, // Gunakan "secure: true" jika menggunakan HTTPS
					maxAge: 604800,
				});

				await Redis.setex(
					`refreshToken:${userLogin.id}`,
					604800,
					refreshAccessToken,
				);

				set.status = 200;
				return {
					pesan: "Sukses Login",
					token: { aksesToken: AccessToken, refreshToken: refreshAccessToken },
				};
			} catch (error) {
				set.status = 500;
				console.error(error);
			}
		},
		{
			body: UserLoginTypes,
		},
	)
	// Register user
	.post(
		"/register",
		async ({ body, set }) => {
			try {
				const { username, password, email } = body;

				const usernameRegex = /^\S+$/;
				if (!username.match(usernameRegex)) {
					set.status = 422;
					return { message: "Username tidak boleh mengandung spasi" };
				}

				// Cek apakah username sudah terdaftar
				const validateUsername = await SkemaUser.findOne({
					username: username,
				});
				if (validateUsername) {
					set.status = 400;
					return { message: "Username sudah terdaftar" };
				}

				// Cek apakah email sudah terdaftar
				const validateEmail = await SkemaUser.findOne({ email: email });
				if (validateEmail) {
					set.status = 400;
					return { message: "Email sudah terdaftar" };
				}

				const hashPassword = await Bun.password.hash(password);

				// Jika validasi berhasil, buat pengguna baru
				await SkemaUser.create({
					username: username,
					password: hashPassword,
					email: email,
				});

				set.status = 201;
				return { message: "Pengguna berhasil didaftarkan" };
			} catch (error) {
				set.status = 500;
				console.error(error);
			}
		},
		{
			body: UserRegisterTypes,
		},
	)
	// Refresh token
	.post(
		"/refresh",
		async ({
			set,
			cookie: { aksesToken, refreshToken },
			JwtAksesToken,
			JwtRefreshToken,
		}) => {
			try {
				if (!refreshToken.value) {
					set.status = 401;
					return { message: "Unauthorized" };
				}

				const storedRefreshToken = await JwtRefreshToken.verify(
					refreshToken.value as string,
				);
				if (!storedRefreshToken) {
					set.status = 401;
					return { message: "Unauthorized" };
				}

				const user = await SkemaUser.findOne({ _id: storedRefreshToken.id });
				if (!user) {
					set.status = 401;
					return { message: "Unauthorized" };
				}

				const currentTime = Math.floor(Date.now() / 1000);

				const newAccessToken = await JwtAksesToken.sign({
					id: user.id,
					username: user.username,
					email: user.email,
					iat: currentTime,
				});

				aksesToken.set({
					value: newAccessToken,
					httpOnly: true,
					sameSite: "lax",
					secure: true,
					maxAge: 1800,
				});

				const newRefreshToken = await JwtRefreshToken.sign({
					id: user.id,
					iat: currentTime,
				});

				refreshToken.set({
					value: newRefreshToken,
					httpOnly: true,
					sameSite: "lax",
					secure: true,
					maxAge: 604800,
				});

				await Redis.setex(`refreshToken:${user.id}`, 604800, newRefreshToken);

				set.status = 200;
				return {
					message: "Token refreshed",
					token: { aksesToken: newAccessToken, refreshToken: newRefreshToken },
				};
			} catch (error) {
				set.status = 500;
				console.error(error);
			}
		},
	)

  //==Authenticated Routes==
	// Get current user
	.use(AuthUser)
	.get("/current", async ({ set, user }) => {
		if (!user) {
			set.status = 401;
			return { message: "Unauthorized" };
		}
		set.status = 200;
		return { message: "Halo", user };
	})

	.post(
		"/logout",
		async ({ set, user, cookie: { aksesToken, refreshToken } }) => {
			if (!user) {
				set.status = 400;
				return { message: "User belum login!" };
			}

			aksesToken.remove();
			refreshToken.remove();

			await Redis.del(`refreshToken:${user.id}`);

			set.status = 200;
			return { message: "Logout berhasil" };
		},
	);

export default users;
