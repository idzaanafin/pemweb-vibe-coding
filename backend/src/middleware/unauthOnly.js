import jwt from "jsonwebtoken";

export function unauthOnly(req, res, next) {
  try {
    const auth = req.headers.authorization;

    // jika ada token → tolak
    if (auth && auth.startsWith("Bearer ")) {
      const token = auth.split(" ")[1];

      try {
        jwt.verify(token, process.env.JWT_SECRET);
        return res.status(400).json({
          message: "Already logged in",
        });
      } catch (err) {
        // token invalid: lanjut saja sebagai unauth
        return next();
      }
    }

    // tidak ada token → boleh akses
    next();

  } catch (err) {
    next();
  }
}
