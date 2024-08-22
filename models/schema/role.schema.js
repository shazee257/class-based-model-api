import { Schema } from "mongoose";

export default RoleSchema = new Schema({
    name: { type: String, required: true },
    description: { type: String, required: true }
}, { timestamps: true, versionKey: false });