const express = require("express");
const Plan = require("../models/Plan");
const auth = require("../middleware/auth")

const router = new express.Router();


// Setting up the router to accept post requests for saving plans to the DB
router.post("/plans", auth, async (req, res) => {
    const plan = new Plan({...req.body,
        User: req.user._id,
    })

    try {
        await plan.save();
        res.status(201).send(plan);
      } catch (e) {
        res.status(400).send(e);
      }

})

// Setting up routet to allow users to view all their plans
router.get("/plans", auth, async (req, res) => {
    try {
        const plans = await Plan.find({"User": req.user._id});
        res.status(200).send(plans)
     }
     catch {
        res.status(500).send("Unable to find any plans registered to this user.");
    }
})

// Allowing for a user to retreive singular plan
router.get("/plan", auth, async (req, res) => {
    try {
        const plan = await Plan.findOne({"name": req.body.name, "User": req.user._id})
        if (plan == null) {
            res.status(500).send("Undefined Plan")
        }
        res.status(200).send(plan)
    }
    catch {
        res.status(400).send("Unable to find any plans with that name registered to this user.")
    }
})


// Allowing users to update existing plans
router.patch("/plan/:id", auth, async (req, res) => {
    const updates = Object.keys(req.body);
    const allowedUpdates = ["name", "Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];
    const validUpdate = updates.every((update) => {
      return  allowedUpdates.includes(update);
    })
    
    if(!validUpdate) {
        return res.status(400).send("Invalid Updates")
    }

    try {
        const plan = await Plan.findOne({
            _id: req.params.id,
            "User": req.user._id,
        })

        if(!plan) {
            return res.status(404).send()
        }

        updates.forEach((update) => {plan[update] = req.body[update]})
        
        await plan.save()
        
        res.send(plan)
    } 
    
    catch(e) {
        res.status(400).send(e)
    }
})

// Lets a user delete a plan
router.delete("/plan", auth, async (req, res) => {{
    try {
        const plan = await Plan.findOneAndDelete({"name": req.body.name, "User": req.user._id})
        res.status(200).send(plan);
    }
    catch {
     res.status(400).send("Unable to find any plan with that name registered to this user.")
    }
}})

module.exports = router;