const Post = require("../models/Post");
const User = require("../models/User");
const { error, success } = require("../utils/responsiveWrapper");
const mapPostOutput = require("../utils/Utils");
const cloudinary = require("cloudinary").v2;

const followOrUnfollowuser = async (req, res) => {
  try {
    const { userIdToFollow } = req.body;
    const currUserId = req._id;
    const currUser = await User.findById(currUserId);
    const userToFollow = await User.findById(userIdToFollow);

    if (currUserId === userIdToFollow) {
      return res.send(error(409, "Users cannot Follow Themselves"));
    }

    if (!userIdToFollow) {
      return res.send(error(404, "User to follow not found"));
    }
    if (currUser.followings.includes(userIdToFollow)) {
      //already followed
      const followingIndex = currUser.followings.indexOf(userIdToFollow);
      currUser.followings.splice(followingIndex, 1);
      const followerIndex = userToFollow.followers.indexOf(currUser);
      userToFollow.followers.splice(followerIndex, 1);
      await userToFollow.save();
      await currUser.save();
    } else {
      userToFollow.followers.push(currUserId);
      currUser.followings.push(userIdToFollow);
      await userToFollow.save();
      await currUser.save();
    }
    return res.send(success(200, { user: userToFollow }));
  } catch (e) {
    console.log(e);
    return res.send(error(500, e.message));
  }
};

const getPostsOfFollowing = async (req, res) => {
  try {
    const currUserId = req._id;
    const curUser = await User.findById(currUserId).populate("followings");
    const fullposts = await Post.find({
      owner: {
        $in: curUser.followings,
      },
    }).populate("owner");
    const posts = fullposts
      .map((item) => mapPostOutput(item, req._id))
      .reverse();
    const followingsIds = curUser.followings.map((item) => item._id);
    followingsIds.push(req._id);
    console.log("Following Ids", followingsIds);
    const suggestions = await User.find({
      _id: {
        $nin: followingsIds,
      },
    });

    return res.send(success(200, { ...curUser._doc, suggestions, posts }));
  } catch (e) {
    return res.send(error(500, e.message));
  }
};

const getMyPosts = async (req, res) => {
  try {
    const userId = req._id;
    const myPosts = await Post.find({
      owner: userId,
    }).populate("likes");
    if (!myPosts) {
      return res.send(success(201, "No post Found"));
    }
    return res.send(success(201, myPosts));
  } catch (e) {
    return res.send(error(500, e.message));
  }
};

const getUserPosts = async (req, res) => {
  try {
    const { userId } = req.body;
    const curUserId = req._id;
    const user = await User.findById(userId);
    const curUser = await User.findById(curUserId);
    if (!userId) {
      return res.send(error(400, "UserId is Required"));
    }
    if (
      !curUser.followings.includes(userId) ||
      !user.followers.includes(curUserId)
    ) {
      return res.send(success(201, "You do not follow the User"));
    }
    const userPost = await Post.find({
      owner: userId,
    }).populate("likes");
    return res.send(success(201, userPost));
  } catch (e) {
    return res.send(error(500, e.message));
  }
};

const deleteMyProfile = async (req, res) => {
  try {
    const userId = req._id;
    await Post.updateMany({ $pull: { likes: userId } });
    await Post.deleteMany({ owner: userId });
    await User.updateMany({ $pull: { followers: userId } });
    await User.updateMany({ $pull: { followings: userId } });

    // await Post.save();
    const user = await User.findById(userId);

    await User.remove(user);
    res.clearCookie("jwt", {
      httpOnly: true,
      secure: true,
    });

    return res.send(success(201, "User Deleted and Likes removed"));
  } catch (e) {
    console.log(e);
    res.send(error(500, e.message));
  }
};

const getMyInfo = async (req, res) => {
  const userId = req._id;
  const user = await User.findById(userId);
  try {
    return res.send(success(200, { user }));
  } catch (e) {
    return res.send(error(401, e.message));
  }
};
const updateMyProfile = async (req, res) => {
  try {
    // console.log("updateprofilebody", req.body);
    const { name, bio, userImg } = req.body;
    const user = await User.findById(req._id);
    // console.log("Log in controller", userImage);
    if (name) {
      user.name = name;
    }
    if (bio) {
      user.bio = bio;
    }
    if (userImg) {
      const cloudImg = await cloudinary.uploader.upload(userImg, {
        folder: "ProfileImage",
      });
      user.avatar = {
        url: cloudImg.secure_url,
        publicId: cloudImg.public_id,
      };
    }
    await user.save();
    return res.send(success(200, { user }));
  } catch (e) {
    return res.send(error(401, e.message));
  }
};

const getUserProfile = async (req, res) => {
  try {
    const userId = req.body.userId;
    const user = await User.findById(userId).populate({
      path: "posts",
      populate: {
        path: "owner",
      },
    });
    // console.log("user data getUserProfile", user);

    const fullPosts = user.posts;
    const posts = fullPosts
      .map((item) => mapPostOutput(item, req._id))
      .reverse();
    // console.log("DOC LOG", { ...user._doc }, "END LOG");
    return res.send(success(200, { ...user._doc, posts }));
  } catch (e) {
    return res.send(error(500, e.message));
  }
};

module.exports = {
  followOrUnfollowuser,
  getPostsOfFollowing,
  getMyPosts,
  getUserPosts,
  deleteMyProfile,
  getMyInfo,
  updateMyProfile,
  getUserProfile,
};
