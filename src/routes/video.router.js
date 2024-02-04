import { Router } from "express";
import { deleteVideo, getVideoById, publishAVideo } from "../controllers/video.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/publish").post(verifyJWT, upload.fields(
    [
        {
            name: "videoFile",
            maxCount: 1
        }, {
            name: "thumbnail",
            maxCount: 1
        }
    ]), publishAVideo)
router.route("/fetchVideo/:videoId").get(verifyJWT, getVideoById)
router.route("/delete/:videoId").post(verifyJWT, deleteVideo)

export default router;