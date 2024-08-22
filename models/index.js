import BaseModel from "./common/baseModel";
import RoleSchema from "./schema/role.schema.js";

export const RoleService = new BaseModel("Role", RoleSchema);