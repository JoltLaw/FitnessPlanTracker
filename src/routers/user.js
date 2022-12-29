const express = require("express");
const auth = require("../middleware/auth")
const User = require("../models/User");


const router = new express.Router();


// Allowing a user to create an account
router.post("/users", async (req, res) => {
    const user = new User(req.body);

    try {
      await user.save();
      const token = await user.generateAuthToken();
      res.status(201).send({ user, token });
    } catch (e) {
      res.status(400).send(e);
    }
})

// Allowing user to login to existing accounts
router.post("/users/login", async (req, res) => {
    try {
      const user = await User.findByCredentials(
        req.body.email,
        req.body.password
      );
      const token = await user.generateAuthToken();
      res.send({ user, token });
    } catch (e) {
      res.status(400).send();
    }
  });

  // Allowing user to logout of singular device
  router.post("/users/logout", auth, async (req, res) => {
    try {
      req.user.tokens = req.user.tokens.filter((token) => {
        return token.token !== req.token;
      });
  
      await req.user.save();
  
      res.send();
    } catch (e) {
      res.status(500).send();
    }
  });

  // Allowing user to logout of all devices
  router.post("/users/logoutAll", auth, async (req, res) => {
    try {
      req.user.tokens = [];
      await req.user.save();
      res.send();
    } catch (e) {
      res.status(500).send();
    }
  });

  // Allows user to view acount data
  router.get("/users/me", auth, async (req, res) => {
    res.send(req.user);
  });

  // Allowing user to update acount data
  router.patch("/users/me", auth, async (req, res) => {
    const updates = Object.keys(req.body);
    const allowedUpdates = ["name", "lastName", "email", "password", "age"];
    const isValidOperation = updates.every((update) =>
      allowedUpdates.includes(update)
    );
  
    if (!isValidOperation) {
      return res.status(400).send({ error: "Invalid updates!" });
    }
  
    try {
      updates.forEach((update) => (req.user[update] = req.body[update]));
      await req.user.save();
      res.send(req.user);
    } catch (e) {
      res.status(400).send(e);
    }
  });

  // allows user to delete their acount from DB
  router.delete("/users/me", auth, async (req, res) => {
    try {
      await req.user.remove();
      res.send(req.user);
    } catch (e) {
      res.status(500).send();
    }
  });

module.exports = router;