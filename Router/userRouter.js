const express = require("express");
const router = express.Router();
const User = require("../models/userSchema");
const authenticateToken = require("../liabrary/jwt");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const secretkey = 'mysecretkey' ;
const upload = require("../liabrary/multer");
const accountSid = "AC92e42f7e05d40b756dde24e5e7a8bfb5";
const authToken = "aacfc831da24bc2b402975f48e33841a";
const client = require("twilio")(accountSid, authToken);
// const twilioClient = twilio();
let otp, user;

//signup api
router.post('/signUp', async (req, res) => {
    try {
        const { Name, PhoneNumber, Email, Password } = req.body;

        if (Name.length < 4) {
            return res.status(400).send('Name must be at least 4 letters');
        }


        if (Password.length < 8 || !/[A-Z]/.test(Password) || !/[!@#$%^&*()_+{}\[\]:;<>,.?~\\-]/.test(Password)) {
            return res.status(400).send('Password must be at least 8 characters with one capital letter and one symbol.');
        }


        const existingUser = await User.findOne({ $or: [{ Email }, { PhoneNumber }] });
        if (existingUser) {
            return res.status(400).send('Email or Phone Number already exites');
        }
        const hashPassword = await bcrypt.hash(Password, 10);

        user = new User({ Name, PhoneNumber, Email, Password: hashPassword });

        otp = Math.floor(100000 + Math.random() * 900000);

        await client.messages.create({
            body: `Your OTP for signup is: ${otp}`,
            from: '+16592563992',
            to: PhoneNumber,
        });

        // await user.save();
        res.status(201).send('User created successfully. Please check your phone for OTP.');
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});

//verify otp
router.post('/signUp/verify', async (req, res) => {
    try {
        console.log(req.body);
        const { OTP } = req.body;

        if (OTP != otp) {
            return res.status(400).json({ msg: "Incorrect OTP." });
        }
        await user.save();
        // const token = jwt.sign({ id: user._id }, "mysecretkey");
        // res.status(200).json({ token, ...user._doc });
        jwt.sign({ user }, 'mysecretkey', { expiresIn: '24h' }, (err, token) => {
            if (err) {
                console.log('Error signing JWT:', err.message);
                res.status(500).json({ error: 'Internal server error' });
            } else {
                res.status(201).json({
                    data: user,
                    token
                });
            }
        });
        otp = "";
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    };
});

//resend otp
router.post('/resend-otp', async (req, res) => {
    try {
        const { PhoneNumber } = req.body;
        // const user = await User.findOne({PhoneNumber});

        // if (!user) {
        //     return res.status(400).send('User not find whith this phone number');
        // }
        otp = Math.floor(100000 + Math.random() * 900000);
        // otp = newOtp;

        await client.messages.create({
            body: `Your new OTP for signup is: ${otp}`,
            from: '+16592563992',
            to: PhoneNumber,
        });
        res.status(200).send('New OTP sent successfully');
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});

//Forget Password
router.post('/forget-password', async (req, res) => {
    try {
        const { PhoneNumber } = req.body;
        const user = await User.findOne({ PhoneNumber });

        if (!user) {
            return res.status(400).send('User not find whith this phone number');
        }
        otp = Math.floor(100000 + Math.random() * 900000);
        await client.messages.create({
            body: `Your new OTP for reset password is: ${otp}`,
            from: '+16592563992',
            to: PhoneNumber,
        });
        res.status(200).send('New OTP sent successfully');
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});

//Reset password
// router.post('/reset-password', async (req, res) => {
//     const PhoneNumber = req.body.PhoneNumber;
//     const newPassword = req.body.newPassword;
//     const confirmPassword = req.body.confirmPassword;

//     try {

//         if (newPassword.length < 8 || !/[A-Z]/.test(newPassword) || !/[!@#$%^&*()_+{}\[\]:;<>,.?~\\-]/.test(newPassword)) {
//             return res.status(400).send('Password must be at least 8 characters with one capital letter and one symbol.');
//         }

//         if (newPassword !== confirmPassword) {
//             return res.status(400).json({ error: 'Password does not match' });
//         }

//         const hashedPassword = await bcrypt.hash(newPassword, 10);


//         const user = await User.findOneAndUpdate({ PhoneNumber: PhoneNumber }, { Password: hashedPassword }, { new: true });

//         if (!user) {
//             return res.status(404).json({ erroe: 'User not found' });
//         }
//         res.json({ messages: 'Password reset successfully' });
//     } catch (error) {
//         console.error('Error resetting password:', error);
//         res.status(500).json({ error: 'Interal Server Error' });
//     }
// });

router.put('/reset-password', authenticateToken, async (req, res) => {
    try {
        const { newPassword,confirmPassword, } = req.body;
        const userId = req.user._id;
        user = await User.findById(userId);

        if (!user) {
            return res.status(404).send('User not found');
        }

        if (newPassword.length < 8 || !/[A-Z]/.test(newPassword) || !/[!@#$%^&*()_+{}\[\]:;<>,.?~\\-]/.test(newPassword)) {
            return res.status(400).send('Password must be at least 8 characters with one capital letter and one symbol.');
        }

        if (newPassword !== confirmPassword) {
            return res.status(400).json({ error: 'Password does not match' });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);

        if (newPassword) {
            user.Password = hashedPassword;
        }
        
        
        await user.save();

        res.status(200).send('User profile updated successfully');

    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});

//create profile
router.put('/create-profile', authenticateToken,upload.single('image'), async (req, res) => {
    try {
        const { Age,location, } = req.body;
        const userId = req.user._id;
        user = await User.findById(userId);

        if (!user) {
            return res.status(404).send('User not found');
        }

        if (Age) {
            user.Age = Age;
        }

        if (location) {
            user.location = location;
        }

        if (req.file) {
            user.image = req.file.filename;
        }
        
        await user.save();

        res.status(200).send('User profile updated successfully');

    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});

//login api
router.post('/login', async (req,res) => {
    try {
        const {Email , Password} = req.body;

        user = await User.findOne({ Email });
        if (!user) {
            return res.status(404).send('User not found');
        }

        const isPasswordValid = await bcrypt.compare(Password, user.Password);
        if (!isPasswordValid) {
            return res.status(401).send('Incorrect Password');
        }

         jwt.sign({user},secretkey, { expiresIn: '24h' }, (err, token) => {
            if (err) {
                console.log('Error signing JWT:', err.message);
                res.status(500).json({ error: 'Internal server error' });
            } else {
                res.status(201).json({
                    data: user,
                    token
                });
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});

//Edit profile
router.put('/edit-profile', authenticateToken, async (req,res) => {
    try {
        const { Name, Age, Email, PhoneNumber } = req.body;

        if (Name.length < 4) {
            return res.status(400).send('Name must be at least 4 letters');
        }
        
        const updatedUser = await User.findByIdAndUpdate(
            req.user._id,
            { Name, Age, Email, PhoneNumber },
            {new:true}
        );
        res.status(200).json(updatedUser)
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});

module.exports = router


