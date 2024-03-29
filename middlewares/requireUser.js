const jwt = require("jsonwebtoken");
const { error } = require("../utils/responsiveWrapper");

module.exports = async (req, res, next) => {
  if (
    !req.headers ||
    !req.headers.authorization ||
    !req.headers.authorization.startsWith("Bearer")
  ) {
    // return res.send("Authorization Header is required");
    return res.send(error(401, "Authorization Header is required"));
  }
  const accessToken = req.headers.authorization.split(" ")[1];

  try {
    const decoded = jwt.verify(
      accessToken,
      process.env.ACCESS_TOKEN_PRIVATE_KEY
    );
    req._id = decoded._id;
    next();
  } catch (e) {
    console.log(e);
    // return res.send("Invalid access key");
    return res.send(error(401, "Invalid access key"));
  }
};
