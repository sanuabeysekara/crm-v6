const express = require("express");
const userController = require("../controllers/userController");

const router = express.Router();

router.get("/users", userController.getUsers);
router.post("/users/add-new", userController.createUser);
router.post("/login", userController.login);
router.get("/users/:id", userController.getUserById);
router.put("/users/:id", userController.updateUserById);
router.get("/users_by_type/:user_type", userController.getUsersByUserType);
router.put("/disable-enable-user/:id", userController.handleEnableDisable);
router.get("/getCounsellors", userController.getCounsellors);
router.put("/updatePassword/:id", userController.updateUserByIdUsernamePassword);

module.exports = router;
