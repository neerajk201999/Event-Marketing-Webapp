require('dotenv').config();
const express = require("express");
const app = express();
const path = require("path");
require("./connection");
const hbs = require("hbs");
const bcrypt = require("bcryptjs");
const Register = require("./models/registers");
const jwt = require("jsonwebtoken");
const port = process.env.PORT || 3000;

const static_path = path.join(__dirname, "./public");
const template_path = path.join(__dirname, "./templates/views");
const partials_path = path.join(__dirname, "./templates/partials");

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(express.static(static_path));
app.set("view engine", "hbs");
app.set("views", template_path);
hbs.registerPartials(partials_path);

app.get("/", (req, res) => {
    res.render("index")
});

//create a new user
app.get("/register", (req, res) => {
    res.render("register")
})


app.get("/login", (req, res) => {
    res.render("login")
})

app.post("/register", async(req, res) => {
    try {
        const password = req.body.password;
        const cpassword = req.body.cpassword;
        if (password === cpassword) {
            const registerUser = new Register({
                name: req.body.name,
                email: req.body.email,
                password: req.body.password,
                cpassword: req.body.cpassword
            });

            console.log("the success part :" + registerUser);
            const token = await registerUser.generateAuthToken();

            const registered = await registerUser.save();
            res.status(201).render("index");

        } else {
            res.send("password are not matching");
        }
    } catch (error) {
        res.status(400).send(error);
    }
})

//login validation

app.post("/login", async(req, res) => {
    try {
        const email = req.body.email;
        const password = req.body.password;

        const useremail = await Register.findOne({ email: email });
        const isMatch = await bcrypt.compare(password, useremail.password);

        const token = await useremail.generateAuthToken();
        console.log("the token part" + token);

        if (isMatch) {
            res.status(201).render("index");
        } else {
            res.send("Invalid login details");
        }

    } catch (error) {
        res.status(400).send("Invalid login details");
    }
})



app.listen(port, () => {
    console.log(`server is running at port no. ${port}`);
});