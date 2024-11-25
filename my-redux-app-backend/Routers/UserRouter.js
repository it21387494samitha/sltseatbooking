import express from 'express';
import VerifyToken from '../Middleware/VerifyToken.js'; 
import { getAllUsers, getUserProfile,  RegisterUser,  UserLogin } from '../Controllers/UserController.js'; 
import multer from 'multer';
          


const router = express.Router();
const upload = multer({ dest: 'uploads/' });



// Public routes
router.post('/register', RegisterUser); 
router.post('/login',UserLogin);     
router.get('/all', getAllUsers);



// Protected routes
router.get('/profile', VerifyToken, getUserProfile );


router.get('/settings', (req, res) => {
    res.json({ message: "Access to settings", user: req.user });
});


router.post('/', async (req, res) => {
    console.log("Received request body:", req.body);  // Log the entire request body
    const { token } = req.body;
    console.log("Received token:", token);  // Log the received token

    // Proceed with the token verification and other logic...
});







  












export default router;
    