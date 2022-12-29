const  mongoose = require("mongoose");
const Plan = require("./Plan");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const validator = require("validator");


// Setting up user Schema
const userSchema = new mongoose.Schema({
    name: {type: String, required: true, trim: true},
    lastName: {type:String, trim: true},
    email: {
        type: String,
        required: true,
        unique: true,
        validate(value) {
            if(!validator.isEmail(value)) {
                throw new Error("Email is invalid.");
            }
        },
        trim: true,
        lowercase: true,
    },
    password: {
        type: String,
        required: true, 
        minlength: 7,
        trim: true,
        validate(value) {
            if(value.toLowerCase().includes("password")) {
                throw new Error (
                    "Password should not include the word password in it."
                )
            }
        }
    }, 
    age: {
        type: Number,
        default: 0,
        validate(value) {
            if(value < 0) {
                throw new Error("Age must be a positive number.")
            }
        }
    },

    tokens: [
        {token: {
            type: String,
            required: true,
        }}
    ]
},
{timestamps: true});


// Creating a virtual connection between plans and users
userSchema.virtual("Plans", {
    ref: "Plan",
    localField: "_id",
    foreignField: "User",
})

// deleting uSer password and tokens from the res when account data is requested
userSchema.methods.toJSON = function () {
    user = this;
    const userObject = this.toObject();
    delete userObject.password;
    delete userObject.tokens;

    return userObject;
  };

  // Generating Authentication tokens when a user logs in or signs up
  userSchema.methods.generateAuthToken = async function () {
    const user = this;
    const token = jwt.sign({ _id: user._id.toString() }, process.env.JWT_SECRET);
  
    user.tokens = user.tokens.concat({ token });
  
    await user.save();
  
    return token;
  };

  // Loging user in to account
  userSchema.statics.findByCredentials = async (email, password) => {
    const user = await User.findOne({ email });
  
    if (!user) {
      throw new Error("Unable to log in");
    }
  
    const isMatch = await bcrypt.compare(password, user.password);
  
    if (!isMatch) {
      throw new Error("Unable to login");
    }
  
    return user;
  };

  // Hash the plane text password before saving
userSchema.pre("save", async function (next) {
    const user = this;
  
    if (user.isModified("password")) {
      user.password = await bcrypt.hash(user.password, 8);
    }
  
    next();
  });

// Removing all plans registered to user when account is deleted
  userSchema.pre("remove", async function (next) {
    const user = this;
    await Plan.deleteMany({ "User": user._id });
  });

  const User = mongoose.model("User", userSchema);

module.exports = User;