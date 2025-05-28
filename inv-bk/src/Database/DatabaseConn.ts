import mongoose from "mongoose";

const conToDatabase = async () => {
	const dbConnectString: string = process.env.DB_CONNECT as string;

	if (!dbConnectString) {
		console.error("Database connection string is not defined");
		process.exit(1);
	}

	try {
		const mongooseConnection = await mongoose.connect(dbConnectString);
		console.log(
			"Database connected successfully",
			mongooseConnection.connection.host,
			mongooseConnection.connection.name,
		);
	} catch (error) {
		console.error("Database connection error:", error);
		process.exit(1);
	}
};

export const safelyCloseMongoDB = async () => {
	try {
		await mongoose.connection.close();
		console.log("MongoDB connection closed safely.");
	} catch (error) {
		console.error("Error closing MongoDB connection:", error);
	}
};

export default conToDatabase;
