const Log = require("../models/log");

async function logFunctionExecution(req, res, next) {
  try {
    const { method, originalUrl, body, params } = req;

    // Extract user information from server-side state
    const { userId, userType } = req.user || {};
    const userAccessType = userType || null;

    // Extract the last two segments from the URL to form the function name
    const urlSegments = originalUrl.split("/");
    const lastSegment = urlSegments.pop();
    const secondLastSegment = urlSegments.pop();
    const functionName = `${secondLastSegment}_${lastSegment}`;

    const moduleNameSegments = originalUrl.split("/").slice(1, 3);
    const moduleName = moduleNameSegments.join("_"); // Extract module name from URL

    // Log function entry
    const logEntry = await Log.create({
      userId,
      userAccessType,
      functionName,
      moduleName,
      data: { body, params },
      status: "In Progress",
    });

    res.on("finish", async () => {
      // Log function exit
      await Log.findByIdAndUpdate(logEntry._id, {
        $set: { status: "Completed" },
      });
    });

    next();
  } catch (error) {
    console.error("Error logging function execution:", error);
    next(error);
  }
}

module.exports = logFunctionExecution;
