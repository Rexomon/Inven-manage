import jwt from "@elysiajs/jwt";

const accessTokenSecret: string = Bun.env.JWT_ACCESS_TOKEN as string;
const refreshTokenSecret: string = Bun.env.JWT_REFRESH_TOKEN as string;

if (!accessTokenSecret) {
	console.error("JWT_ACCESS_TOKEN is not set in environment variables");
	process.exit(1);
}

if (!refreshTokenSecret) {
	console.error("JWT_REFRESH_TOKEN is not set in environment variables");
	process.exit(1);
}

export function JwtAksesToken() {
	return jwt({
		name: "JwtAksesToken",
		secret: accessTokenSecret,
		exp: "30m",
	});
}

export function JwtRefreshToken() {
	return jwt({
		name: "JwtRefreshToken",
		secret: refreshTokenSecret,
		exp: "7d",
	});
}
