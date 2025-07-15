import Elysia from "elysia";
import Redis from "../Config/Redis";
import UserModel from "../Models/UserModel";
import { JwtAksesToken } from "./Jwt";

const AuthUser = new Elysia()
	.use(JwtAksesToken())
	.state("user", { id: "", email: "", username: "", iat: false })
	.onBeforeHandle(
		async ({
			cookie: { aksesToken, refreshToken },
			set,
			store,
			JwtAksesToken,
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

				const [isUserExist, redisRefreshToken] = await Promise.all([
					UserModel.exists({ _id: userLoggedIn.id }),
					Redis.get(`refreshToken:${userLoggedIn.id}`),
				]);

				if (!isUserExist) {
					set.status = 401;
					return { message: "User not found" };
				}

				// Single session check
				if (!redisRefreshToken || redisRefreshToken !== refreshToken.value) {
					set.status = 401;
					return { message: "Session is invalid or expired" };
				}

				store.user = {
					id: userLoggedIn.id,
					email: userLoggedIn.email,
					username: userLoggedIn.username,
					iat: userLoggedIn.iat,
				} as typeof store.user;
			} catch (error) {
				set.status = 500;
				console.error(error);
				return { message: "An internal server error occurred" };
			}
		},
	)
	.resolve(({ store }) => {
		return { user: store.user };
	})
	.as("scoped");

export default AuthUser;
