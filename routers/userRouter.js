const router = require("express").Router();
const UserController = require("../controllers/userController");
const requireUser = require("../middlewares/requireUser");
//To get all the posts of Mine
router.get("/getMyPosts", requireUser, UserController.getMyPosts);
//req:userIdToFollow
router.post("/follow", requireUser, UserController.followOrUnfollowuser);
router.get("/getFeedData", requireUser, UserController.getPostsOfFollowing);
//Getting all the  post of user,Req:userId
router.post("/getUserPosts", requireUser, UserController.getUserPosts);
router.delete("/", requireUser, UserController.deleteMyProfile);
router.get("/getMyInfo", requireUser, UserController.getMyInfo);
router.put("/updateMyProfile", requireUser, UserController.updateMyProfile);
router.post("/getUserProfile", requireUser, UserController.getUserProfile);
module.exports = router;
