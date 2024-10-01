import type Elysia from "elysia";
import { verifyTok } from "./Jwt";

const AuthUser = (app: Elysia) =>
	app.derive(async ({ cookie: { aksesToken }, set }) => {
		if (!aksesToken.value) {
			set.status = 401;
			return { message: "Token not found" };
		}

		try {
			const userLoggedIn = verifyTok(aksesToken.value as string);

			if (!userLoggedIn) {
				set.status = 401;
				return { message: "Invalid Token" };
			}

            const user = userLoggedIn;

			//Penting!
			return { user }; //Mengembalikan data user yang sedang login
		} catch (error) {
			set.status = 401;
			return { message: "Unauthorized" };
		}
	});

export default AuthUser;
