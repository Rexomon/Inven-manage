import type Elysia from "elysia";
import redis from "../Config/Redis";
import SkemaUser from "../Models/userModel";
import { JwtAksesToken, JwtRefreshToken } from "./Jwt";

const AuthUser = (app: Elysia) =>
	app
		.use(JwtAksesToken())
		.use(JwtRefreshToken())

		.derive(
			async ({
				cookie: { aksesToken, refreshToken },
				set,
				JwtAksesToken,
				JwtRefreshToken,
			}) => {
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

					const redisToken = await redis.get(`refreshToken:${userLoggedIn.id}`);
					if (redisToken !== refreshToken.value) {
						set.status = 401;
						return { message: "Invalid Token" };
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
