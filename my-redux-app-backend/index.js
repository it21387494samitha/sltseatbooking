import express from 'express';
import session from 'express-session';
import cors from 'cors';
import passport from 'passport';
import dotenv from 'dotenv';
import connectDB from './config/db.js'; 
import './config/passport.js'; 
import eventRouter from './Routers/EventRoutes.js';
import seatRouter from './Routers/seatRoutes.js';
import userRouter from './Routers/UserRouter.js';
import feedbackRouter from './Routers/FeedbackRouter.js';
import UserModel from './Models/UserModel.js';
// import "../frontend/build"



dotenv.config(); 

const app = express();


app.use(cors({
    origin: 'http://localhost:3000', 
    credentials: true
}));
app.use(express.json());




// Connect to the database
connectDB()
    .then(() => {
        app.use(session({
            secret: 'your_secret_key',
            resave: false,
            saveUninitialized: true,
        }));

        app.use(passport.initialize());
        app.use(passport.session());

       
        app.get('/', (req, res) => {
            res.send('Welcome to the Home Page!'); 
        });

        app.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

        app.get('/auth/google/callback',
            passport.authenticate('google', { failureRedirect: '/' }),
            (req, res) => {
                // On success, redirect with the token
                const token = req.user.token;
                const profilePicture = req.user.profilePicture || 'https://img.freepik.com/premium-photo/stylish-man-flat-vector-profile-picture-ai-generated_606187-310.jpg';
                res.redirect(`http://localhost:3000/auth/google/success?token=${token}&profilePicture=${encodeURIComponent(profilePicture)}`);
            }
        );


        
        
        


/////////////////////////////////////////////





        app.use('/events',eventRouter);
        app.use('/api/seats',seatRouter);
        app.use('/users',userRouter);
        app.use('/api/feedback',feedbackRouter);


        app.use(express.static("../frontend/build"));
        app.get("*",(req, res)=>{
            res.sendFile(path.resolve(_dirname, "frontend","build","index.html") )
        });




        

        const PORT = process.env.PORT || 5000;
        app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
    })
    .catch(err => {
        console.error('Failed to connect to the database:', err);
        process.exit(1); // Exit if the connection fails
    });




