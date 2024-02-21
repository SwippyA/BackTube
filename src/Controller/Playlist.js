import mongoose, { isValidObjectId } from "mongoose";
import { Playlist } from "../Models/Playlist.js";
import { ApiError } from "../utility/Apierroe.js";
import { ApiResponse } from "../utility/ApiRespone.js";
import { asyncHandler } from "../utility/AsyHandler.js";
import { application } from "express";

const isUserOwnerofPlaylist = async (playlistId, userId) => {
  try {
    const playlist = await Playlist.findById(playlistId);

    console.log(playlist);
    if (!playlist) {
      throw new ApiError(400, "playlist doesn't exist");
    }
    console.log(playlist.owner);
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
});

const addVideoToPlaylist = asyncHandler(async (req, res) => {
  const { playlistId, videoId } = req.params;
});

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
  const { playlistId, videoId } = req.params;
  // TODO: remove video from playlist
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
