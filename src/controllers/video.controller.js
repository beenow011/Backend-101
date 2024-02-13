import mongoose from "mongoose";
import { asyncHandler } from "../utils/asyncHandler.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { deleteFileFromCloudinary, uploadCloudinary } from "../utils/cloudinary.js";
import { Video } from "../models/video.models.js";



const publishAVideo = asyncHandler(async (req, res) => {
    const { title, description } = req.body
    const videoFilePath = req.files?.videoFile[0]?.path;
    const thumbnailPath = req.files?.thumbnail[0]?.path;
    const owner = req.user?._id;
    if (!videoFilePath) {
        throw new ApiError(400, "Video file is required.")
    }
    if (!thumbnailPath) {
        throw new ApiError(400, "Thumbnail is required.")
    }
    const videoFile = await uploadCloudinary(videoFilePath)
    const thumbnail = await uploadCloudinary(thumbnailPath)

    if (!videoFile || !thumbnail) {
        throw new ApiError(500, "Failed to upload in cloudinary.")
    }
    const video = await Video.create(
        {
            videoFile: videoFile.url,
            thumbnail: thumbnail.url,
            title,
            description,
            duration: videoFile.duration,
            owner
        }
    )
    if (!video) {
        throw new ApiError(500, "Something went wrong while publishing the video.")
    }

    return res.status(202).json(new ApiResponse(202, video, "Video successfully uploaded"))
})

const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: get video by id
    const video = await Video.findById(videoId)
    if (!video) {
        throw new ApiError(501, "Couln't get the video from database.")
    }
    res.status(202).json(new ApiResponse(202, video, "Video fetched"))
})

const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    const video = await Video.findById(videoId)
    if (!video) {
        throw new ApiError(401, "Could not get the video from database.")
    }
    const videoFileId = video.videoFile.split('/').pop().replace(/\.[^/.]+$/, '');

    const thumbnailId = video.thumbnail.split('/').pop().replace(/\.[^/.]+$/, '');
    const deleteResponse = await Video.findByIdAndDelete(videoId)
    if (!deleteResponse) {
        throw new ApiError(500, "Failed to delete the video")
    }
    const videoDltResponse = await deleteFileFromCloudinary(videoFileId, "video")
    const thumbnailDltResponse = await deleteFileFromCloudinary(thumbnailId)

    return res.status(200).json(new ApiResponse(200, deleteResponse, "video successfully deleted"))

    //TODO: delete video
})

const getAllVideos = asyncHandler(async (req, res) => {
    //    const {page} = req.query
    const allVideos = await Video.find({ isPublished: true })
    if (!allVideos) {
        throw new ApiError(401, "Could not get the videos from database.")
    }
    return res.status(200).json(new ApiResponse(200, allVideos, "All videos successfully fetched"))



})

const updateVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    const { title, description } = req.body;

    const thumbnail = req.files?.thumbnail[0]?.path;
    const oldVideoFile = await Video.findById(videoId)
    const publicId = oldVideoFile.thumbnail.split('/').pop().replace(/\.[^/.]+$/, '');
    console.log(req.body)
    if (req.user._id.equals(oldVideoFile.owner)) {
        // They are equal
        const thumbnailCloudinary = await uploadCloudinary(thumbnail)

        const newVideoFile = await Video.findByIdAndUpdate(
            videoId,
            {
                $set: {
                    title: title, description: description,
                    thumbnail: thumbnailCloudinary?.url
                }
            })
        if (!newVideoFile) {
            throw new ApiError(500, "Failed to update the details")
        }
        const response = await deleteFileFromCloudinary(publicId)
        console.log(response)
        return res.status(200).json(new ApiResponse(200, newVideoFile, "Account updated successfully"))
    } else {
        // They are not equal
        throw new ApiError(400, "Only owner can update the video")
    }

    //TODO: update video details like title, description, thumbnail

})



const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    const oldVideoFile = await Video.findById(videoId)
    if (req.user._id.equals(oldVideoFile.owner)) {


        const newVideoFile = await Video.findByIdAndUpdate(
            videoId,
            {
                $set: {
                    isPublished: !oldVideoFile?.isPublished
                }
            })
        if (!newVideoFile) {
            throw new ApiError(500, "Failed to update the details")
        }

        return res.status(200).json(new ApiResponse(200, newVideoFile, "Toggled successfully"))
    } else {
        // They are not equal
        throw new ApiError(400, "Only owner can update the video")
    }

})

export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus
}