const express = require("express")
const cors = require("cors");
const passport = require("passport");
const cookieParser = require("cookie-parser");
// const bcrypt = require("bcryptjs");
const session = require("express-session");
const bodyParser = require("body-parser");
const morgan = require("morgan");
const path = require("path");
const app = express();
const dotenv = require("dotenv")
const routes = require("./api/routes/index")
const router = require("express").Router();
const mongoose = require("mongoose");
dotenv.config();


app.use(morgan("dev"));


//database connection
require("./db_connection");

// Auto-create admin user
const createAdminUser = async () => {
    try {
        const Admin = require("./api/models/admin");
        const bcrypt = require("bcryptjs");
        
        // Check if admin already exists
        const existingAdmin = await Admin.findOne({ username: "admin" });
        
        if (!existingAdmin) {
            // Hash password
            const hashedPassword = await bcrypt.hash("admin123", 12);
            
            // Create admin user
            const admin = new Admin({
                username: "admin",
                password: hashedPassword,
                email: "admin@library.com",
                role: "admin",
                isActive: true
            });
            
            await admin.save();
            console.log("✅ Admin user created successfully!");
            console.log("   Username: admin");
            console.log("   Password: admin123");
        } else {
            console.log("✅ Admin user already exists");
        }
    } catch (error) {
        console.error("❌ Error creating admin user:", error);
    }
};

// Create admin user after database connection
mongoose.connection.once('open', () => {
    console.log("Database connected, creating admin user...");
    createAdminUser();
});


// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(
    cors({
        origin: ["http://localhost:3000", "http://127.0.0.1:3000"],
        credentials: true,
    })
);
app.use(
    session({
        secret: "secretcode",
        resave: true,
        saveUninitialized: true,
        cookie: { secure: false, maxAge: 24 * 60 * 60 * 1000, prioroty: "High" }
    })
);
app.use(cookieParser(process.env.SECRET));
app.use(passport.initialize());
app.use(passport.session());
require("./config/passportConfig")(passport);

// Serve static files for PDF uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

//Middleware End

//Route

app.use(routes);




const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log("Server Is Connected to Port " + PORT);
})