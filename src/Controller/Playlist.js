import mongoose, { isValidObjectId } from "mongoose";
import { Playlist } from "../Models/Playlist.js";
import { ApiError } from "../utility/Apierroe.js";
import { ApiResponse } from "../utility/ApiRespone.js";
import { asyncHandler } from "../utility/AsyHandler.js";
import { application } from "express";
import { Video } from "../Models/Video.js";

const isUserOwnerofPlaylist = async (playlistId, userId) => {
  try {
    const playlist = await Playlist.findById(playlistId);

    // console.log(playlist);
    if (!playlist) {
      throw new ApiError(400, "playlist doesn't exist");
    }
    // console.log(playlist.owner);
    if (playlist?.owner.toString() !== userId?.toString()) {
      return false;
    }

    return true;
  } catch (e) {
    throw new ApiError(400, e.message || "Playlist Not Found");
  }
};

const createPlaylist = asyncHandler(async (req, res) => {
  const { name, description } = req.body;

  if (!name && !description) {
    throw new ApiError(403, "the all the data should be there ");
  }
  const platlist = await Playlist.create({
    name,
    description,
    owner: req?.user._id,
  });
  if (!platlist) {
    throw new ApiError(400, "Playlist is not craeted ");
  }
  //   console.log(platlist)
  return res
    .status(200)
    .json(new ApiResponse(200, platlist, "Created Succesfully!"));

  //TODO: create playlist
});

const getUserPlaylists = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  //TODO: get user playlists
});

const getPlaylistById = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;
  //TODO: get playlist by id

  if (!playlistId) {
    throw new ApiError(401, "the id is not proper ");
  }
  const playlist = await Playlist.findById(playlistId);
  if (!playlist) {
    throw new ApiError(401, "the id is not proper ");
  }

  return res
    .status(202)
    .json(new ApiResponse(200, playlist, "fetch complete "));
});

const addVideoToPlaylist = asyncHandler(async (req, res) => {
  const { playlistId, videoId } = req.params;

  if (!playlistId && !videoId) {
    throw new ApiError(401, "all parameter is required");
  }
  const video = await Video.findById(videoId);
  //if the video is not published but video owner and current user is same then owner can add to playlist only
  if (
    !video ||
    (!(video.owner.toString() === req.user?._id.toString()) &&
      !video?.isPublished)
  ) {
    throw new ApiError(404, "Video Not Found");
  }
  const userOwner = await isUserOwnerofPlaylist(playlistId, req?.user?._id);
  if (!userOwner) {
    throw new ApiError(300, "Unauthorized Access");
  }

  const platlist = await Playlist.findById(playlistId);
  if (!platlist) {
    throw new ApiError(490, "playlist is not found");
  }
  platlist.videos = platlist.videos.push(videoId);
  platlist.save({ validateBeforeSave: false });

  return res.status(201).json(new ApiResponse(200, platlist, "video added "));
});

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
  const { playlistId, videoId } = req.params;

  if (!playlistId || !videoId) {
    throw new ApiError(400, "PlaylistId and videoId both are required!!");
  }
  try {
    const userOwner = await isUserOwnerofPlaylist(playlistId, req?.user?._id);
    if (!userOwner) {
      throw new ApiError(300, "Unauthorized Access");
    }
    //check video is present actually or published
    const video = await Video.findById(videoId);
    if (!video) {
      throw new ApiError(404, "Video Not found");
    }

    //check video is added in playlist or not
    const playlist = await Playlist.findById(playlistId);
    if (!playlist.videos.includes(videoId)) {
      throw new ApiError(404, "No Video Found in Playlist");
    }
    
    
      const removedVideoFromPlaylist = await Playlist.updateOne(
        {
          _id: new mongoose.Types.ObjectId(playlistId),
        },
        {
          $pull: { videos: videoId },
        }
      );
      if (!removedVideoFromPlaylist) {
        throw new ApiError(500, "Unable to remove ,Retry!!!!!");
      }
      return res
        .status(200)
        .json(new ApiResponse(200, {}, "video removed "));
    
  } catch (error) {
    throw new ApiError(
      500,
      error.message || "Unable to remove video from playlist"
    );
  }
});

const deletePlaylist = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;
  //TODO: get playlist by id
  if (!playlistId) {
    throw new ApiError(400, "playlistId is required!!!");
  }

  const userOwner = await isUserOwnerofPlaylist(playlistId, req?.user?._id);
  if (!userOwner) {
    throw new ApiError(300, "Unauthorized Access");
  }
  const deletedPlaylist = await Playlist.findByIdAndDelete(playlistId);
  if (!deletedPlaylist) {
    throw new ApiError(500, "Unable to delete the Playlist");
  }
  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Playlist Deleted Successfully"));
});

const updatePlaylist = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;
  const { name, description } = req.body;

  if ([name, description, playlistId].some((field) => field?.trim() === "")) {
    throw new ApiError(400, "All fields are required");
  }
  const userOwner = await isUserOwnerofPlaylist(playlistId, req?.user?._id);
  if (!userOwner) {
    throw new ApiError(300, "Unauthorized Access");
  }
  const playlist = await Playlist.findByIdAndUpdate(
    playlistId,
    {
      $set: {
        name: name,
        description: description,
      },
    },
    {
      new: true,
    }
  );
  if (!playlist) {
    throw new ApiError(400, "not update ");
  }
  return res
    .status(202)
    .json(new ApiResponse(200, playlist, "update sucessfully "));
  //TODO: update playlist
});

export {
  createPlaylist,
  getUserPlaylists,
  getPlaylistById,
  addVideoToPlaylist,
  removeVideoFromPlaylist,
  deletePlaylist,
  updatePlaylist,
};
