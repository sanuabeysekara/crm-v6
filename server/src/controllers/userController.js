require("dotenv").config();
const User = require("../models/user");
const User_type = require("../models/user_type");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

async function getUsers(req, res) {
  // fetch all users with user_type populated
  try {
    const users = await User.find().populate({
      path: "user_type",
      model: "User_type",
    });
    res.status(200).json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

async function createUser(req, res) {
  try {
    const { name, password, email, user_type } = req.body;

    // Check if user_type exists in the user_type collection
    const user_type_document = await User_type.findOne({ name: user_type });

    if (!user_type_document) {
      return res
        .status(400)
        .json({ error: `user_type not found: ${user_type}` });
    }

    // Hash the password before saving
    const hashedPassword = await bcrypt.hash(password, 10);

    // Assign the user_type _id and hashed password to the user before saving
    const user = new User({
      name,
      password: hashedPassword,
      email,
      user_type: user_type_document._id,
    });

    // Save and return user with success message
    await user.save();
    res.status(201).json({ user, message: "User created!" });
  } catch (error) {
    console.error("Error creating user:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

async function login(req, res) {
  try {
    const { email, password } = req.body;

    // Find the user with the given email and populate the 'user_type' field
    const user = await User.findOne({ email }).populate({
      path: "user_type",
      model: "User_type",
    });

    // Check if the user exists
    if (!user) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    // Compare the provided password with the stored hashed password
    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    // Extract relevant information for the token payload
    const { _id, name: userName, email: userEmail, user_type: userType } = user;

    // Extract permissions from user_type
    const permissions = userType
      ? {
          lead: userType.lead,
          user: userType.user,
          student: userType.student,
          branch: userType.branch,
          course: userType.course,
        }
      : {};

    // Create JWT token with user information and permissions
    const token = jwt.sign(
      { userId: _id, userName, userEmail, userType, permissions },
      process.env.JWT_SECRET,
      { expiresIn: "3h" }
    );

    // Attach the decoded user information to the req object
    req.user = jwt.decode(token);

    // Return the token along with success message and user data
    res.status(200).json({
      message: "Login successful",
      token,
      _id,
      userName,
      userEmail,
      userType,
      permissions,
    });
  } catch (error) {
    console.error("Error during login:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

async function getUserById(req, res) {
  try {
    const { id } = req.params;

    // check if the id is valid object id
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ error: "Invalid id" });
    }

    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.status(200).json(user);
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

// update user by id
async function updateUserById(req, res) {
  try {
    const { id } = req.params;
    const { name, password, email, user_type } = req.body;

    // check if the id is valid object id
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ error: "Invalid id" });
    }

    // Check if user_type exists in the user_type collection
    const user_type_document = await User_type.findOne({ name: user_type });

    if (!user_type_document) {
      return res
        .status(400)
        .json({ error: `user_type not found: ${user_type}` });
    }

    // Hash the password before updating
    const hashedPassword = await bcrypt.hash(password, 10);

    // Update the user by ID
    const updatedUser = await User.findByIdAndUpdate(
      id,
      {
        name,
        password: hashedPassword,
        email,
        user_type: user_type_document._id,
      },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ error: "User not found" });
    }

    res.status(200).json({ user: updatedUser, message: "User updated!" });
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

// update user by id username and password only. should request name, password, conform_password

async function updateUserByIdUsernamePassword(req, res) {
  try {
    const { id } = req.params;
    const { name, email, password } = req.body;

    // check if the id is valid object id
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ error: "Invalid id" });
    }

    // Hash the password before updating
    const hashedPassword = await bcrypt.hash(password, 10);

    // Update the user by ID
    const updatedUser = await User.findByIdAndUpdate(
      id,
      {
        name,
        email,
        password: hashedPassword,
      },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ error: "User not found" });
    }

    res.status(200).json({ user: updatedUser, message: "User updated successfully!" });
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

//get users by user type
async function getUsersByUserType(req, res) {
  const { user_type } = req.params;

  const user_type_document = await User_type.find({
    name: user_type.toLowerCase(),
  });

  if (!user_type_document) {
    res.status(400).json({ error: `user_type not found: ${user_type}` });
  }

  if (user_type_document[0]._id != null) {
    try {
      const users = await User.find({ user_type: user_type_document[0]._id });
      res.status(200).json(users);
    } catch (error) {
      console.error("Error fetching users by user_type", error);
      res.status(500).json({
        error: "Internal Server Error",
        message: "Error fetching users by user_type",
      });
    }
  }
}

//get counsellors
async function getCounsellors(req, res) {
  const user_type_document = await User_type.find({ name: "counselor" });

  if (!user_type_document) {
    res.status(400).json({ error: `user_type not found: counselor` });
  }

  if (user_type_document[0]._id != null) {
    try {
      const users = await User.find({ user_type: user_type_document[0]._id });
      const counsellorDetails = [];

      for (const counsellor of users) {
        const counsellorDetail = {
          id: counsellor._id,
          label: counsellor.name,
        };
        counsellorDetails.push(counsellorDetail);
      }

      res.status(200).json(counsellorDetails);
    } catch (error) {
      console.error("Error fetching counsellors", error);
      res.status(500).json({
        error: "Internal Server Error",
        message: "Error fetching users by user_type",
      });
    }
  }
}

// handle user enable and disable with status field
async function handleEnableDisable(req, res) {
  try {
    const { id } = req.params;
    const { status } = req.body;

    // check if the id is valid object id
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ error: "Invalid id" });
    }

    // Update the user by ID
    const updatedUser = await User.findByIdAndUpdate(
      id,
      {
        status,
      },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ error: "User not found" });
    }

    res.status(200).json({ user: updatedUser, message: "User updated!" });
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

module.exports = {
  getUsers,
  createUser,
  login,
  getUserById,
  updateUserById,
  getUsersByUserType,
  handleEnableDisable,
  getCounsellors,
  updateUserByIdUsernamePassword,
};
