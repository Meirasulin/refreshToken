import express, { json, Response, Request, NextFunction } from "express";
import cookieParser from "cookie-parser";
import dayjs from "dayjs";
import jwt from "jsonwebtoken";
import "dotenv/config";
const app = express();
app.use(express.json());
app.use(cookieParser());

type userType = {
  email: string;
  password: string;
};







const getUserFromDB = ({ email, password }: userType) => {
  if (email === password) return { email, password };
  return false;
};
const findEmail = ({ email }: { email: string }): userType => {
  return { email, password: "1234" };
};
const getProducts = (req: Request, res: Response) => {
  res.send("Products should to be here");
};














const login = (req: Request, res: Response) => {
  console.log("inlogin");

  const userLoginInfo = req.body as userType;
  const userExists = getUserFromDB(userLoginInfo);

  if (!userExists) return res.send("invalid email or password").sendStatus(401);

  const accessToken = jwt.sign(
    userExists,
    process.env.ACCESS_TOKEN_SECRET as string,
    {
      expiresIn: "10m",
    }
  );
  const refreshToken = jwt.sign(
    { email: userExists.email },
    process.env.REFRESH_TOKEN_SECRET as string,
    { expiresIn: "1d" }
  );

  res.cookie("refreshToken", refreshToken, {
    secure: true,
    httpOnly: true,
    expires: dayjs().add(30, "days").toDate(),
  });
  return res.send({ toekn: accessToken });
};





const CheckRefreshToken = (req: Request, res: Response, next: NextFunction) => {
  const refreshToken = req.cookies.refreshToken;
  if (!refreshToken) return res.sendStatus(401);
  const userEmail = jwt.decode(refreshToken) as string;
  jwt.verify(
    refreshToken,
    process.env.REFRESH_TOKEN_SECRET as string,
    {},
    (err) => {
      if (err) {
        return res.status(406).json({ message: "Unauthorized" });
      } else {
        const checkIfUserExists = findEmail({ email: userEmail });
        const accessToken = jwt.sign(
          checkIfUserExists,
          process.env.ACCESS_TOKEN_SECRET as string,
          {
            expiresIn: "10m",
          }
        );
        return res.json({ accessToken });
      }
    }
  );
  next();
};






app.get("/login", login);
app.get("/get_products", CheckRefreshToken, getProducts);

app.listen(process.env.PORT, () => {
  console.log("server in listening on http://localhost:8000  ✨🚀");
});
