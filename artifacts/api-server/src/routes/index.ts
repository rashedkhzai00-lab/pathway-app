import { Router, type IRouter } from "express";
import healthRouter from "./health";
import pinRouter from "./pin";

const router: IRouter = Router();

router.use(healthRouter);
router.use(pinRouter);

export default router;
