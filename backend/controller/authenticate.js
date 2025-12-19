
import jwt from "jsonwebtoken";

export function authenticate(req, res, next)
{
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(" ")[1];
    if (!token) { return res.status(401).json({ error:"Unauthorized" }); }
    try {
        req.user = jwt.verify(token, process.env.JWT_SECRET);
        next();
    } catch (err) {
        if (err.name === "TokenExpiredError") { return res.status(401).json({ error:"TOKEN_EXPIRED" }); }
        return res.status(403).json({ error:"Invalid Token" });
    }
}
