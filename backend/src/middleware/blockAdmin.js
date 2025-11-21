export function blockAdmin(req, res, next) {
  if (req.user && req.user.role === "admin") {
    return res.status(403).json({
      success: false,
      message: "Operation not permitted."
    });
  }
  next();
}
