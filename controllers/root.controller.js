export const defaultHandler = async (req, res, next) => {
    res.json({
        message: "Welcome to the API",
    });
};