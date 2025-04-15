import jwt from "jsonwebtoken";

export const authenticate = (req, res, next) => {
  try {
    const access_token =
      req.cookies?.access_token ||
      req.headers?.Autohorization?.replace("Bearer ", "").trim();
    //   req.headers("Autohorization")?.replace("Bearer ", "").trim();

    if (!access_token)
      return res.status(401).json({ success: false, message: "unauthorized" });

    const is_authenticate = jwt.verify(access_token, process.env.JWT_SECRET);

    if (!is_authenticate) {
      return res.status(401).json({ success: false, message: "unauthorized" });
    }
    req.user = is_authenticate;
    next();
  } catch (error) {
    console.log("Error to authenticate", error);
  }
};

export const authorize = (role) => {
  return (req, res) => {
    if (req?.user?.role !== role) {
      return res.status(403).json({ success: false, message: "unauthorized" });
    }
    next();
  };
};
