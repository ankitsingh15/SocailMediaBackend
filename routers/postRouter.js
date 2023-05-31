const router = require("express").Router();
const PostsController = require("../controllers/postsController");
const requireUser = require("../middlewares/requireUser");

router.get("/all", requireUser, PostsController.getAllPostController);
router.post("/", requireUser, PostsController.createPostController);
router.post("/like", requireUser, PostsController.likeAndUnlikePost);
router.put("/", requireUser, PostsController.updatePostController);
router.delete("/", requireUser, PostsController.deletePost);

module.exports = router;
