import jwt from "@elysiajs/jwt";

const passKeySecret: string = Bun.env.PASS_RAHASIA as string;

export function JwtAksesToken() {
	return jwt({
		name: "JwtAksesToken",
		secret: passKeySecret,
	});
}

export function JwtRefreshToken() {
	return jwt({
		name: "JwtRefreshToken",
		secret: passKeySecret,
	});
}
