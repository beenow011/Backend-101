import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
    getVideoComments,
    addComment,
    updateComment,
    deleteComment
} from "../controllers/comment.controller.js";

const router = Router();

router.route("/getAllComents/:videoId").get(getVideoComments);
router.route("/addComment").post(verifyJWT, addComment);
router.route("/updateComment/:commentID").patch(verifyJWT, updateComment);
router.route("/deleteComment/:commentID").delete(verifyJWT, deleteComment)


export default router;