import mongoose from "mongoose"
import { Comment } from "../models/comment.models.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"

const getVideoComments = asyncHandler(async (req, res) => {
    //TODO: get all comments for a video
    const { videoId } = req.params;
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;
    const comment = await Comment.aggregate([
        {
            $match: {
                video: new mongoose.Types.ObjectId(videoId)
            }
        },
        {
            $lookup: {
                from: "users",
                localField: "owner",
                foreignField: "_id",
                as: "owner",
                pipeline: [
                    {
                        $project: {
                            fullName: 1,
                            username: 1,
                            avatar: 1
                        }
                    }
                ]
            }
        }, {
            $addFields: {
                owner: {
                    $first: "$owner"
                }
            }
        },
        {
            $skip: skip
        },
        {
            $limit: limit
        },
    ]);

    if (!comment) {
        throw new ApiError(500, "Comments failed to fetch!");
    }
    return res.status(200).json(new ApiResponse(200, comment, "Comments fetched"));
})

const addComment = asyncHandler(async (req, res) => {
    // TODO: add a comment to a video
    const { comment, videoID } = req.body;
    if (!comment) {
        throw new ApiError(400, "No Content to comment")
    }
    const commentRes = await Comment.create(
        {
            content: comment,
            video: videoID,
            owner: req.user?._id
        }
    )
    if (!commentRes) {
        throw new ApiError(500, "Failed to store comment in database");
    }
    return res.status(201).json(new ApiResponse(201, commentRes, "Successfully commented"))
})

const updateComment = asyncHandler(async (req, res) => {
    // TODO: update a comment
    const { commentID } = req.params;
    const { newComment } = req.body;
    if (!newComment) {
        throw new ApiError(400, "No content to change!");
    }
    const newCommentRes = await Comment.findByIdAndUpdate(
        commentID,
        {
            content: newComment
        },
        { new: true, runValidators: true }
    )
    if (!newCommentRes) {
        throw new ApiError(500, "Failed to store comment in database");
    }
    if (!newCommentRes.owner.equals(req.user?._id)) {
        throw new ApiError(403, "Unauthorized: You are not the owner of this Comment");
    }
    return res.status(200).json(new ApiResponse(200, newCommentRes, "Comment updated successfully!"));
})

const deleteComment = asyncHandler(async (req, res) => {
    // TODO: delete a comment
    const { commentID } = req.params;
    const comment = await Comment.findById(commentID);
    if (!comment.owner.equals(req.user._id)) {
        throw new ApiError(403, "Unauthorized: You are not the owner of this Comment");
    }
    const deletedRes = await Comment.findByIdAndDelete(commentID);
    if (!deletedRes) {
        throw new ApiError(404, "Comment not found");
    }
    return res.status(200).json(new ApiResponse(200, deletedRes, "Successfully deleted the comment!"));
})

export {
    getVideoComments,
    addComment,
    updateComment,
    deleteComment
}