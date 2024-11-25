import mongoose from "mongoose";
import UserModel from "../Models/UserModel.js";
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import multer from 'multer';
import fs from 'fs';
import path from 'path';





const secretKey = "samitha"; // Use a secure secret key


const storage = multer.memoryStorage(); // Store the image in memory as a buffer
const upload = multer({ storage: storage }); // Use memory storage for multer

// Helper function to validate Google email
const isGoogleEmail = (email) => {
    const emailDomain = email.split('@')[1];
    return emailDomain === 'gmail.com' || emailDomain.endsWith('.google.com');
};






// Register User
export function RegisterUser(req, res) {
    const { firstName, lastName, phone, email, age, subscription, password, isAdmin } = req.body;

    // Debug log to check request body data
    console.log('Registering user with:', req.body);

    if (!firstName || !lastName || !phone || !email || !age || !password) {
        return res.status(400).json({ message: "All fields are required." });
    }

    if (!isGoogleEmail(email)) {
        return res.status(400).json({ message: "Please use a valid Google email (e.g., @gmail.com)." });
    }

    if (!email || typeof email !== 'string' || email.trim() === '') {
        return res.status(400).json({ message: "Email cannot be null or empty." });
    }

    UserModel.findOne({ email })
        .then(existingUser => {
            if (existingUser) {
                return res.status(400).json({ message: "Email already registered." });
            }

            bcrypt.hash(password, 10, (err, hash) => {
                if (err) {
                    return res.status(500).json({ message: "Error hashing password", error: err });
                }

                const newUser = new UserModel({
                    firstName,
                    lastName,
                    phone,
                    email,
                    age,
                    subscription,
                    password: hash,
                    isAdmin: isAdmin || false,
                    
                });

                newUser.save()
                    .then(response => {
                        res.status(201).json(response);
                        console.log("User successfully registered");
                    })
                    .catch(err => {
                        if (err.code === 11000) {
                            res.status(400).json({ message: "Duplicate email entry." });
                        } else {
                            res.status(500).json({ message: "Error saving user", error: err });
                        }
                        console.log(err);
                    });
            });
        })
        .catch(err => res.status(500).json({ message: "Error checking user existence", error: err }));
}




// User Login
export const UserLogin = async (req, res) => {
    const { email, password } = req.body;
    try {
      const user = await UserModel.findOne({ email });
      if (!user) return res.status(400).json({ message: 'User not found' });
  
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });
  
      const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
      res.json({ token });
    } catch (error) {
      res.status(500).json({ message: 'Error logging in user' });
    }
  };


export function CreateAdmin(req, res) {
    const { email, password } = req.body;

    UserModel.findOne({ email })
        .then(existingUser => {
            if (existingUser) {
                return res.status(400).json({ message: "User already exists" });
            }

            bcrypt.hash(password, 10, (err, hash) => {
                if (err) {
                    return res.status(500).json({ message: "Error hashing password", error: err });
                }

                const newAdmin = new UserModel({
                    email,
                    password: hash,
                    isAdmin: true
                });

                newAdmin.save()
                    .then(user => res.status(201).json(user))
                    .catch(err => res.status(500).json({ message: "Error saving user", error: err }));
            });
        })
        .catch(err => res.status(500).json({ message: "Error finding user", error: err }));
}





export function getAllUsers(req, res) {
    UserModel.find({})
        .then(users => {
            res.status(200).json(users); // Return all users
        })
        .catch(err => {
            res.status(500).json({ message: "Error fetching users", error: err });
        });
}



// Fetch user profile
export const getUserProfile = async (req, res) => {
    try {
        const user = await UserModel.findById(req.user.id);  // req.user.id should come from the middleware
        if (!user) return res.status(404).json({ message: 'User not found' });

        res.status(200).json({
            username: user.username,
            email: user.email,
            profilePicture: user.profilePicture|| 'https://img.freepik.com/premium-photo/stylish-man-flat-vector-profile-picture-ai-generated_606187-310.jpg'
        });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching profile', error });
        console.log(user);
    }
};




export const uploadProfileImage = async (req, res) => {
    try {
      const userId = req.user.id;
      const user = await UserModel.findById(userId);
  
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
  
      // Save image data
      user.profileImage = {
        data: fs.readFileSync(path.join(__dirname, '../uploads/' + req.file.filename)),
        contentType: req.file.mimetype,
      };
  
      await user.save();
  
      res.json({ message: 'Profile image uploaded successfully.' });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Failed to upload image.' });
    }
  };




  