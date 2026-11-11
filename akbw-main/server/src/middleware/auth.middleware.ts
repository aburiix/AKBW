import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

export const auth = (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      console.warn("Auth failed: No token provided");
      return res
        .status(401)
        .json({ message: "Unauthorized: No token provided", ok: false });
    }
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      throw new Error("JWT_SECRET is not defined");
    }

    const decodedToken: any = jwt.verify(token, jwtSecret);

    console.log("DECODED-TOKEN: ", decodedToken);

    if (decodedToken.id) {
      req.user = decodedToken.id;

      next();
    } else {
      console.warn("Auth failed: Invalid token decoded");
      return res
        .status(401)
        .json({ message: "Unauthorized: Invalid token", ok: false });
    }
  } catch (error: any) {
    console.log(error, "json error");
    if (error.message.includes("jwt")) {
      console.warn(`Auth failed: ${error.message}`);
      return res
        .status(401)
        .json({ message: `Unauthorized: ${error.message}`, ok: false });
    };
    
    next(error);
  }
};
