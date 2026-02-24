const jwt = require("jsonwebtoken");

// Verify JWT Token
exports.verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ success: false, message: "No token provided" });
  }

  const token = authHeader.startsWith("Bearer ")
    ? authHeader.slice(7)
    : authHeader;

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ success: false, message: "Invalid or expired token" });
  }
};

// Role-based access control
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: "Not authenticated" });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Access restricted to roles: ${roles.join(", ")}`
      });
    }

    next();
  };
};

// Approved vendor access control
exports.authorizeApprovedVendor = async (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ success: false, message: "Not authenticated" });
  }

  if (req.user.role !== "vendor") {
    return res.status(403).json({
      success: false,
      message: "Access restricted to vendors"
    });
  }

  // Check if vendor is approved
  const Vendor = require("../models/Vendor");
  const vendor = await Vendor.findOne({ user: req.user.id });

  if (!vendor) {
    return res.status(404).json({
      success: false,
      message: "Vendor profile not found"
    });
  }

  if (!vendor.isApproved) {
    return res.status(403).json({
      success: false,
      message: "Your vendor account is pending approval. Please wait for admin approval."
    });
  }

  next();
};

// Optional authentication (user logged in or not)
exports.optionalAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (authHeader) {
    const token = authHeader.startsWith("Bearer ")
      ? authHeader.slice(7)
      : authHeader;

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded;
    } catch (error) {
      // Token is invalid but that's okay for optional auth
    }
  }

  next();
};
