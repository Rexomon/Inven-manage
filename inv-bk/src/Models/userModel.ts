import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
    {
        username: {
            type: String,
            unique: true,
            required: true,
        },
        password: {
            type: String,
            required: true,
        },
        email: {
            type: String,
            unique: true,
            required: true,
        },
    },

    {
        timestamps: true,
    }
)

const SkemaUser = mongoose.model("User", userSchema)
export default SkemaUser;
