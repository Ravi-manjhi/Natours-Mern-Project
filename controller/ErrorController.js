const handleCastError = (err) => {
  return new AppError(`Invalid ${err.path}: ${err.value}`, 404);
};

const handleDuplicateFieldDB = (err) => {
  const value = err.keyValue.name;
  return new AppError(`${value} Already Exit in Database! Try new`, 400);
};

const handleValidationErrorDB = (err) => {
  const errorMessage = Object.values(err.errors).map((el) => el.message);
  return new AppError(`Invalid Input Data! ${errorMessage.join(".")}`, 400);
};

const handleJsonWebTokenError = (err) => {
  const message = "Incorrect Login Details! Please Login again...";
  return new AppError(message, 401);
};

const handleTokenExpiredError = (err) => {
  const message = "Session Expired! Please Login Again...";
  return new AppError(message, 401);
};

// --------------------------------------- Global Error Controller --------------------------------------
const developmentError = (err, req, res) => {
  if (req.originalUrl.startsWith("/api")) {
    return res.status(err.statusCode).json({
      Status: err.status,
      Error: err,
      Message: err.message,
      Stack: err.stack,
    });
  }
  return res
    .status(err.statusCode)
    .render("error", { title: "Something went wrong!", msg: err.message });
};

const productionError = (err, req, res) => {
  if (req.originalUrl.startsWith("/api")) {
    if (err.isOperational) {
      return res
        .status(err.statusCode)
        .json({ status: err.status, message: err.message });
    }
    return res
      .status(500)
      .json({ status: "Error", message: "Something Went Wrong!" });
  }
  if (err.isOperational) {
    return res
      .status(err.statusCode)
      .render("error", { title: "Something went wrong!", msg: err.message });
  }
  return res
    .status(err.statusCode)
    .render("error", {
      title: "Something went wrong!",
      msg: "Please Try Again later",
    });
};

const globalErrorController = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "Internal Error";

  if (process.env.NODE_ENV === "development") {
    developmentError(err, req, res);
  } else {
    let error = { ...err };

    if (err.name === "CastError") error = handleCastError(error);
    if (err.code === 11000) error = handleDuplicateFieldDB(error);
    if (err.name === "ValidationError") error = handleValidationErrorDB(error);
    if (err.name === "JsonWebTokenError")
      error = handleJsonWebTokenError(error);
    if (err.name === "TokenExpiredError")
      error = handleTokenExpiredError(error);

    productionError(err, req, res);
  }
};

export default globalErrorController;
