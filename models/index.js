import BaseModel from "./common/baseModel.js";
import UserSchema from "./schema/user.schema.js";

export const UserService = new BaseModel("User", UserSchema);