// define only schema & index here

import { Schema } from "mongoose";

const UserSchema = new Schema({
    email: { type: String },
    password: { type: String },
}, { timestamps: true, versionKey: false });

UserSchema.index({ email: 1 }, { unique: true });

export default UserSchema;

