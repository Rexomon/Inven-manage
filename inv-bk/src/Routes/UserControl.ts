import { Elysia } from "elysia";
import Redis from "../Config/Redis";
import AuthUser from "../Middleware/Auth";
import UserModel from "../Models/UserModel";
import { JwtAksesToken, JwtRefreshToken } from "../Middleware/Jwt";
import { UserLoginTypes, UserRegisterTypes } from "../Types/UserTypes";

const Users = new Elysia({ prefix: "/users" })
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
				const userLogin = await UserModel.findOne({ username: username });
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

				const [AccessToken, refreshAccessToken] = await Promise.all([
					JwtAksesToken.sign({
						id: userLogin.id,
						username: userLogin.username,
						email: userLogin.email,
						exp: currentTime + 1800,
					}),

					JwtRefreshToken.sign({
						id: userLogin.id,
						exp: currentTime + 604800,
					}),
				]);

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
				return { message: "Sukses Login" };
			} catch (error) {
				set.status = 500;
				console.error(error);
				return { message: "Internal server error occurred" };
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

				const validateUser = await UserModel.findOne({
					$or: [{ username: username }, { email: email }],
				});

				if (validateUser) {
					if (validateUser.username === username) {
						set.status = 409;
						return { message: "Username sudah terdaftar" };
					}
					if (validateUser.email === email) {
						set.status = 400;
						return { message: "Email sudah terdaftar" };
					}
				}

				const hashPassword = await Bun.password.hash(password, {
					algorithm: "argon2id",
					memoryCost: 21000,
					timeCost: 2,
				});

				// Jika validasi berhasil, buat pengguna baru
				await UserModel.create({
					username: username,
					password: hashPassword,
					email: email,
				});

				set.status = 201;
				return { message: "Pengguna berhasil didaftarkan" };
			} catch (error) {
				set.status = 500;
				console.error(error);
				return { message: "Internal server error occurred" };
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

				// Check if the refresh token matches the one stored in Redis
				const redisToken = await Redis.get(
					`refreshToken:${storedRefreshToken.id}`,
				);
				if (!redisToken || redisToken !== refreshToken.value) {
					set.status = 401;
					return { message: "Unauthorized" };
				}

				const user = await UserModel.findOne({ _id: storedRefreshToken.id });
				if (!user) {
					set.status = 401;
					return { message: "Unauthorized" };
				}

				const currentTime = Math.floor(Date.now() / 1000);

				const [newAccessToken, newRefreshToken] = await Promise.all([
					JwtAksesToken.sign({
						id: user.id,
						username: user.username,
						email: user.email,
						exp: currentTime + 1800,
					}),

					JwtRefreshToken.sign({
						id: user.id,
						exp: currentTime + 604800,
					}),
				]);

				aksesToken.set({
					value: newAccessToken,
					httpOnly: true,
					sameSite: "lax",
					secure: true,
					maxAge: 1800,
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
				return { message: "Token refreshed" };
			} catch (error) {
				set.status = 500;
				console.error(error);
			}
		},
	)

	//==Authenticated Routes==
	// Get current user
	.use(AuthUser)
	.get("/profile", async ({ set, user }) => {
		set.status = 200;
		return { message: "Halo", user };
	})

	.post(
		"/logout",
		async ({ set, user, cookie: { aksesToken, refreshToken } }) => {
			aksesToken.remove();
			refreshToken.remove();

			await Redis.del(`refreshToken:${user.id}`);

			set.status = 200;
			return { message: "Logout berhasil" };
		},
	);

export default Users;
