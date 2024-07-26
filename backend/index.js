require('dotenv').config();

const cookie = require('cookie');

const express = require("express");

const bcrypt = require('bcryptjs');

const path = require("path");

require("./db/conn");

const auth = require("./middleware/auth")

const Register = require("./models/register")

const Appointment = require("./models/appointment")

const port = process.env.PORT || 3000;


const session = require("express-session");

const cookieParser = require("cookie-parser");

const jwt = require('jsonwebtoken');

const flash = require("connect-flash");
const { log } = require("console");

const app = express();


app.use(express.static(path.join(__dirname, '../public')));
app.use('/stylesheet', express.static(__dirname + "../public/stylesheet"))
app.use('/js', express.static(__dirname + "../public/js"))
app.use('/images', express.static(__dirname + "../public/images"))

app.use(cookieParser());
app.use(session({
    secret : 'keyboard cat',
    resave : false,
    saveUninitialized : true,
    cookie : { secure : false, maxAge : 60000 }
}))
app.use(flash());

app.set('view engine', 'hbs');
app.set('views', "./views");


app.use(express.json());
app.use(express.urlencoded({extended : false}));

// console.log(process.env.SECRET_KEY);


app.get("/", (req, res) => {
    res.render('index')
});

app.get("/index", (req, res) => {
    // res.send("Hello Buddy Server is Connected...!")
    res.render("index", {
        serverSuccess : req.flash('server-success')
    });
});

app.get("/signup", (req, res) =>{
    res.render("signup", {
        serverError : req.flash('server-error')
    });
});

app.get("/signin", (req, res) =>{
    res.render("signin", {
        serverSuccess : req.flash('server-success'),
        serverError : req.flash('server-error')
    });
});

app.get("/atc", auth, (req, res) => {
    // console.log(`this is the cookies awesome ${req.cookies.jwt}`);
    res.render("atc")
})

app.get("/appointment", auth, (req, res) => {
    // console.log(`this is the cookies awesome ${req.cookies.jwt}`);
    res.render("appointment")
});

app.get("/signout", auth, async (req, res) => {
    try {
        console.log(req.user);
        // for single signout
        // req.user.tokens = req.user.tokens.filter((currElem) => {
            // return currElem.token !== req.token
        // })

        // for all devices signout
        req.user.tokens = [];

        res.clearCookie("jwt");
        console.log("SignOut Successfully");
        await req.user.save();
        res.redirect('signin');
    } catch (error) {
        res.status(500).send(error);
    }
})

// user register
app.post("/signup", async (req, res) => {
    try {
        const password = req.body.password;
        const confirmpassword = req.body.confirmpassword;

        if(password === confirmpassword){
            const userregister = new Register({
                firstname : req.body.firstname,
                lastname : req.body.lastname,
                emailid : req.body.emailid,
                contact : req.body.contact,
                gender : req.body.gender,
                password : password,
                confirmpassword : confirmpassword
            })

            console.log("the success part" + userregister);
            
            const token  = await userregister.gernerateAuthToken();
            console.log("the token part" + token);

            res.cookie("jwt", token, {
                expires : new Date(Date.now() + 600000),
                httpOnly : true,
                // secure : true
            });
            console.log(cookie);
            
            const registered = await userregister.save();
            res.status(201)
            req.flash('server-success', "User Register Successfully")
            res.redirect('signin')
        }
        else{
            // res.send("password not matching")
            req.flash('server-error', "Password Not Matching")
            res.redirect('signup')
        }
    } catch (error) {
        // res.status(400).send(error);
        req.flash('server-error', error.message)
        res.redirect('signup')

    }
});

// user singnin
app.post("/signin", async(req, res) => {
    try {
        const username = req.body.username;
        const password = req.body.password;

        const useremail = await Register.findOne({emailid : username});

        const isMatch = await bcrypt.compare(password, useremail.password);

        const token  = await useremail.gernerateAuthToken();
        console.log("the token part" + token);

        res.cookie("jwt", token, {
            expires : new Date(Date.now() + 600000),
            httpOnly : true,
            // secure : true
        });

        
        if(isMatch){
            res.status(201)
            req.flash('server-success', "User SignIn Successfully")
            res.redirect("index")
        }
        else{
            // res.send("Invalid username and password")
            req.flash('server-error', "Invalid Username/password")
            res.redirect('signin')
        }

    } catch (error) {
        // res.status(400)
        req.flash('server-error', error.message)
        res.redirect('signin')
    }
});


app.get("/appointment", async (req, res) => {
    try {
        const availableTimeSlots = ['9:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00', '22:00'];
        
        // Fetch booked time slots from the database
        const bookedTimeSlots = await Appointment.find({ date: req.query.date });
        
        // Remove booked time slots from available ones
        const filteredTimeSlots = availableTimeSlots.filter(slot => !bookedTimeSlots.includes(slot));
    
        res.json({ availableTimeSlots: filteredTimeSlots });
      } catch (error) {
        console.error(error);
        // res.status(500)
        req.flash('server-error', error.message)
        res.redirect('appointment')
      }
});

app.post('/appointment', async (req, res) => {
    try {
      const { name, email, contact, state, city, date, time } = req.body;
      
      // Check if the selected time slot is available
      const isSlotAvailable = await Appointment.findOne({ date, time });
  
      if (isSlotAvailable) {
        res.status(400)
        // .json({ error: 'Selected time slot is not available' });
        req.flash('server-error', "Selected time slot is not available")
        res.redirect('appointment')

      } 
      else {
        // Book the appointment
        const newAppointment = new Appointment({ name, email, contact, state, city, date, time });
        await newAppointment.save();
        // res.json({ message: 'Appointment booked successfully' });
        req.flash('server-success', "Appointment Booked Successfully")
        res.redirect('index')

      }
    } catch (error) {
    //   console.error(error);
    //   res.status(500).json({ error: 'Internal Server Error' });
    req.flash('server-error', error.message)
    res.redirect("appointment")

    }
  });


app.listen(port, () => {
    console.log(`Hello Buddy Your Server is Running Now on ${port}`);
});
