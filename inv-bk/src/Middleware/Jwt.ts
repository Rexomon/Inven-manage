import tokenManager from "jsonwebtoken";

const passKeySecret: string = process.env.PASS_RAHASIA as string;

export const EnkodeTok = (payload: object) => {
	return tokenManager.sign(payload, passKeySecret, {expiresIn: "15m"});
};

export const verifyTok = (token: string) => {
	return tokenManager.verify(token, passKeySecret);
};
