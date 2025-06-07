import type Elysia from "elysia";
import Redis from "../Config/Redis";
import SkemaUser from "../Models/userModel";
import { JwtAksesToken } from "./Jwt";

const AuthUser = (app: Elysia) =>
	app
		.use(JwtAksesToken())

		.derive(
			async ({ cookie: { aksesToken, refreshToken }, set, JwtAksesToken }) => {
				if (!aksesToken.value) {
					set.status = 401;
					return { message: "Token not found" };
				}

				try {
					const userLoggedIn = await JwtAksesToken.verify(
						aksesToken.value as string,
					);

					if (!userLoggedIn) {
						set.status = 401;
						return { message: "Invalid Token" };
					}

					const isUserExist = await SkemaUser.findOne({ _id: userLoggedIn.id });
					if (!isUserExist) {
						set.status = 401;
						return { message: "User not found" };
					}

					// Single session check
					const redisRefreshToken = await Redis.get(
						`refreshToken:${userLoggedIn.id}`,
					);
					if (!redisRefreshToken) {
						set.status = 401;
						return { message: "Session expired" };
					}
					if (redisRefreshToken !== refreshToken.value) {
						set.status = 401;
						return { message: "Session invalid" };
					}

					const user = userLoggedIn;

					//Penting!
					return { user };
					//Mengembalikan data user yang sedang login
				} catch (error) {
					set.status = 401;
					return { message: "Unauthorized" };
				}
			},
		);

export default AuthUser;
