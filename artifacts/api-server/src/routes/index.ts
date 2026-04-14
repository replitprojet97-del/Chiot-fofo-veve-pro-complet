import { Router, type IRouter } from "express";
import healthRouter from "./health.js";
import puppiesRouter from "./puppies.js";
import contactRouter from "./contact.js";
import adminRouter from "./admin.js";
import reviewsRouter from "./reviews.js";

const router: IRouter = Router();

router.use(healthRouter);
router.use(puppiesRouter);
router.use(contactRouter);
router.use(adminRouter);
router.use(reviewsRouter);

export default router;
