const path = require("path");
const fs = require("fs");
const express = require("express");
const mongoose = require("mongoose");
const session = require("express-session");
const flash = require("connect-flash");
const helmet = require("helmet");
const compression = require("compression");
const morgan = require("morgan");
require("dotenv").config();
const mongoDBstore = require("connect-mongodb-session")(session);
const store = new mongoDBstore({
  uri: 'mongodb://localhost:27017/e-shop',
  collection: "sessions",
});

const errorController = require("./controllers/error");
const User = require("./models/user");
const accessLogStreams = fs.createWriteStream(
  path.join(__dirname, "access.log"),
  { flags: "a" }
);
const app = express();

app.set("view engine", "ejs");
app.set("views", "views");

const adminRoutes = require("./routes/admin");
const shopRoutes = require("./routes/shop");
const authRoutes = require("./routes/auth");
const { collection, db } = require("./models/user");
app.use(helmet());
app.use(compression());
app.use(morgan("combined", { stream: accessLogStreams }));
app.use(express.urlencoded({ extended: false }));
/* app.use(
  multer({ storage: XStorageEngine, fileFilter: filefilter }).single("image")
); */
app.use(express.static(path.join(__dirname, "public")));
app.use("/images", express.static(path.join(__dirname, "images")));
app.use(
  session({
    secret: "myNameisDhanush",
    resave: false,
    saveUninitialized: false,
    store: store,
  })
);

app.use((req, res, next) => {
  if (!req.session.user) {
    return next();
  }
  User.findById(req.session.user._id)
    .then((user) => {
      req.user = user;
      next();
    })
    .catch((err) => {
      throw new Error(err);
    });
});
app.use(flash());

app.use("/admin", adminRoutes);
app.use(shopRoutes);
app.use(authRoutes);

app.use(errorController.get404);

mongoose
  .connect('mongodb://localhost:27017/e-shop', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then((result) => {
    app.listen(process.env.PORT || 3000);
    console.log('Mongo is connected...')
    console.log('server is running...')
  })
  .catch((err) => {
    console.log(err);
  });
