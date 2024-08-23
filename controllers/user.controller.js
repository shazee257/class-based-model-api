import { UserService } from "../models/index.js";

export const fetchAllUsers = async (req, res, next) => {
    const users = await UserService.getAll({}, 1, 10);
    res.json(users);
}

export const createUser = async (req, res, next) => {
    const user = await UserService.create({
        email: "abc@gmail.com",
        password: "123456",
    });
    res.json(user);
}