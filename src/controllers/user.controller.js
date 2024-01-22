import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js";
import { User } from "../models/user.models.js"
import { uploadCloudinary } from "../utils/cloudinary.js"
const registerUser = asyncHandler(async (req, res) => {
    //get user details from frontEnd .
    //validation
    //check if user already exists
    //check for images and avatar
    //upload them to cludinary
    //create user object - create entry in db
    //remove password and refresh token field from response
    //check for user creataion
    //return res

    const { fullName, email, username, password } = req.body
    console.log("email", email)
    if ([
        fullName, email, username, password
    ].some((fieled) => (
        fieled?.trim() === ""
    ))) {
        throw new ApiError(400, "All fields are required.")
    }

    const existedUser = User.findOne({
        $or: [{ username }, { email }]
    })
    if (existedUser) {
        throw new ApiError(409, "User with email or username already exists")
    }

    const avatarLocaPath = req.files?.avatar[0]?.path;
    const coverImageLocalPath = req.files?.coverImage[0]?.path;

    if (!avatarLocaPath) {
        throw new ApiError(400, "Avatar is file required.")
    }
    const avatar = await uploadCloudinary(avatarLocaPath)
    const coverImage = await uploadCloudinary(coverImageLocalPath)
    if (!avatar) {
        throw new ApiError(400, "Avatar is file required.")
    }

    const user = await User.create(
        {
            fullName,
            avatar: avatar.url,
            coverImage: coverImage?.url || "",
            email,
            passsword,
            username: username.toLowerCase()
        }
    )
    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )

    if (!createdUser) {
        throw new ApiError(500, "Something went wrong while registering the User.")
    }
    return res.status(201).json(
        new ApiResponse(200, createdUser, "User registered successfully")
    )
})


export { registerUser }