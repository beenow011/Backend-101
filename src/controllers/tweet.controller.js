import mongoose, { isValidObjectId } from "mongoose"
import { Tweet } from "../models/tweet.models.js"
import { User } from "../models/user.models.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"

const createTweet = asyncHandler(async (req, res) => {
    //TODO: create tweet
    console.log("inside contoller")
    const { content } = req.body;
    const owner = req.user?._id;
    console.log(" content", content)

    if (!content) {
        throw new ApiError(400, "No content");
    }
    const tweet = await Tweet.create(
        {
            content,
            owner
        }
    )

    if (!tweet) {
        throw new ApiError(500, "Couldnt add tweet to database");
    }

    return res.status(200).json(new ApiResponse(200, tweet, "Tweet added successfully"))

})

const getUserTweets = asyncHandler(async (req, res) => {
    // TODO: get user tweets
    const { userID } = req.params;

    const tweets = await Tweet.find({ owner: userID })
    if (!tweets) {
        throw new ApiError(500, "Failed to fetch tweets from database");
    }
    return res.status(200).json(new ApiResponse(200, tweets, "Successfully fetched tweets"))
})

const updateTweet = asyncHandler(async (req, res) => {
    //TODO: update tweet
    const { newContent } = req.body;
    const { tweetID } = req.params;
    const userID = req.user?._id;
    if (!newContent) {
        throw new ApiError(400, "No Content");
    }

    const tweet = await Tweet.findByIdAndUpdate(
        tweetID,
        { content: newContent },
        { new: true, runValidators: true }
    );

    if (!tweet) {
        throw new ApiError(404, "Tweet not found");
    }

    if (!tweet.owner.equals(userID)) {
        throw new ApiError(403, "Unauthorized: You are not the owner of this tweet");
    }

    return res.status(200).json(new ApiResponse(200, tweet, "Tweet updated Successfully"))

})

const deleteTweet = asyncHandler(async (req, res) => {
    //TODO: delete tweet
    const { tweetID } = req.params;
    const tweet = await Tweet.findById(tweetID);
    if (tweet.owner.equals(req.user?._id)) {

        const deletedResponse = await Tweet.findByIdAndDelete(tweetID)
        if (!deletedResponse) {
            throw new ApiError(404, "Tweet not found");
        }
        return res.status(200).json(new ApiResponse(200, deletedResponse, "Successfully deleted"));
    } else {
        throw new ApiError(403, "Unauthorized: You are not the owner of this tweet");
    }



})

export {
    createTweet,
    getUserTweets,
    updateTweet,
    deleteTweet
}