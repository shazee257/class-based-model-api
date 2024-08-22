import { Types } from 'mongoose';
import moment from 'moment';

// generate response with status code
export const generateResponse = (data, message, res, code = 200) => {
    return res.status(code).json({
        statusCode: code,
        message,
        data,
    });
}

// parse body to object or json (if body is string)
export const parseBody = (body) => {
    let obj;
    if (typeof body === "object") obj = body;
    else obj = JSON.parse(body);
    return obj;
}

// async handler for express routes
export const asyncHandler = (requestHandler) => {
    return (req, res, next) => Promise.resolve(requestHandler(req, res, next)).catch((err) => next(err));
}

// get mongo id
export const getMongoId = (id = null) => new Types.ObjectId(id);

// format date
export function formatDate(date) {
    return moment(date).format("MM/DD/YYYY");
}

// function to check if a string is a valid MongoDB ObjectId
export const isValidObjectId = (id) => {
    return Types.ObjectId.isValid(id);
}
