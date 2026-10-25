import jwt from 'jsonwebtoken'

// Checks the "Authorization: Bearer <token>" header and stores the user on req.user
export function authenticate(req, res, next) {
    const [scheme, token] = (req.headers.authorization || '').split(' ')

    if (scheme !== 'Bearer' || !token) {
        return res.status(401).json({ message: 'Authentication required' })
    }

    try {
        const payload = jwt.verify(token, process.env.JWT_SECRET)
        req.user = { id: payload.id, role: payload.role }
        return next()
    } catch (error) {
        return res.status(401).json({ message: 'Invalid or expired token' })
    }
}

// Use after authenticate: only lets admins through
export function requireAdmin(req, res, next) {
    if (req.user?.role !== 'ADMIN') {
        return res.status(403).json({ message: 'Admin access required' })
    }

    return next()
}
