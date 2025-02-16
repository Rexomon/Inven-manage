import { t } from "elysia";

export const UserLoginTypes = t.Object({
	username: t.String(),
	password: t.String(),
});

export const UserRegisterTypes = t.Object({
	username: t.String({ pattern: "^\\S+$" }),
	password: t.String(),
	email: t.String({ format: "email" }),
});
