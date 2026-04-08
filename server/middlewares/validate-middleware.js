const validate = (schema) => async (req, res, next) => {
    try {
        const parseBody = await schema.parseAsync(req.body);
        req.body = parseBody;
        next();
    } catch (err) {
        const status = 422;
        const message = "Fill the input Properly";
        const extraDetails = err.errors[0].message;

        const error = {
            status,
            message,
            extraDetails,
        };

        console.log(error);
        next(error);
    }
};

// Validate query parameters
const validateQuery = (schema) => async (req, res, next) => {
    try {
        const parseQuery = await schema.parseAsync(req.query);
        req.query = parseQuery;
        next();
    } catch (err) {
        const status = 422;
        const message = "Invalid query parameters";
        const extraDetails = err.errors[0].message;

        const error = {
            status,
            message,
            extraDetails,
        };

        console.log(error);
        next(error);
    }
};

// Validate URL parameters
const validateParams = (schema) => async (req, res, next) => {
    try {
        const parseParams = await schema.parseAsync(req.params);
        req.params = parseParams;
        next();
    } catch (err) {
        const status = 422;
        const message = "Invalid URL parameters";
        const extraDetails = err.errors[0].message;

        const error = {
            status,
            message,
            extraDetails,
        };

        console.log(error);
        next(error);
    }
};

module.exports = { validate, validateQuery, validateParams };