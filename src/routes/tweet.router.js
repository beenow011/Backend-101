import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { createTweet, deleteTweet, getUserTweets, updateTweet } from "../controllers/tweet.controller.js";

const router = Router();

router.route("/createTweet").post(verifyJWT, createTweet)
router.route("/getTweets/:userID").get(verifyJWT, getUserTweets)
router.route("/updateTweet/:tweetID").patch(verifyJWT, updateTweet)
router.route("/deleteTweet/:tweetID").delete(verifyJWT, deleteTweet)

export default router;