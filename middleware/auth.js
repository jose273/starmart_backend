// backend/middleware/auth.js
// JWT authentication + role-based access control middleware

const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET || "change_this_in_production";

/**
 * Verify JWT token and attach user to request.
 * Usage: router.get("/route", authenticate, handler)
 */
function authenticate(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith("Bearer ")) {
    return res.status(401).json({ error: "No token provided" });
  }

  const token = header.split(" ")[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;   // { id, email, role, name }
    next();
  } catch (err) {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
}

/**
 * Require specific role(s).
 * Usage: router.post("/route", authenticate, requireRole("admin"), handler)
 *        router.post("/route", authenticate, requireRole(["admin","manager"]), handler)
 */
function requireRole(roles) {
  const allowed = Array.isArray(roles) ? roles : [roles];
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ error: "Not authenticated" });
    if (!allowed.includes(req.user.role)) {
      return res.status(403).json({
        error: `Access denied. Required role: ${allowed.join(" or ")}`,
        yourRole: req.user.role,
      });
    }
    next();
  };
}

/**
 * Helper to generate a JWT for a user.
 */
function generateToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role, name: user.name },
    JWT_SECRET,
    { expiresIn: "7d" }
  );
}

module.exports = { authenticate, requireRole, generateToken };