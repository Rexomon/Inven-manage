import { t } from "elysia";

export const UserLoginTypes = t.Object({
	username: t.String({ error: "Username cannot be empty", pattern: "^\\S+$" }),
	password: t.String({ error: "Password cannot be empty" }),
});

export const UserRegisterTypes = t.Object({
	username: t.String({ error: "Username cannot be empty", pattern: "^\\S+$" }),
	password: t.String({ error: "Password cannot be empty" }),
	email: t.String({ format: "email", error: "Invalid email format" }),
});
