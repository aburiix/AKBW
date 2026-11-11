import type { Request, Response, NextFunction } from "express";

const uzumCheckToken = (req: Request, res: Response, next: NextFunction) => {
    const extractTokenFromHeader = (req: Request) => {
        const authHeader = req.headers['authorization']
        if (!authHeader) return undefined
        const [type, token] = authHeader.split(' ')
        return type === 'Basic' ? token : undefined
    }

    const decodeToken = (token: string) => {
        try {
            return Buffer.from(token, 'base64').toString('utf-8')
        } catch (err) {
            return undefined
        }
    }

    const token = extractTokenFromHeader(req)

    if (!token) {
        return res.status(401).json({ message: "Token doesn't exist" })
    }

    try {
        const decoded = decodeToken(token)
        if (!decoded) {
            return res.status(401).json({ message: "Basic token doesn't exist" })
        }

        const [username, password] = decoded.split(':')

        const isValidUsername = process.env.UZUM_USERNAME === username
        const isValidPassword = process.env.UZUM_PASSWORD === password

        if (!isValidUsername || !isValidPassword) {
            return res.status(401).json({ message: 'Unauthorized' })
        }
    } catch (err) {
        return res.status(401).json({ message: 'Unauthorized' })
    }

    next()
};

export default uzumCheckToken;