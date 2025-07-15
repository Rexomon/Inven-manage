import { t } from "elysia";

export const UserRegisterTypes = t.Object({
	username: t.String({
		minLength: 3,
		error:
			"Username cannot contain spaces and must be at least 3 characters long",
		pattern: "^\\S+$",
	}),
	password: t.String({ minLength: 1, error: "Password cannot be empty" }),
	email: t.String({ format: "email", error: "Invalid email format" }),
});

export const UserLoginTypes = t.Omit(UserRegisterTypes, ["email"]);
