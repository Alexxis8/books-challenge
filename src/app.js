const express = require('express');
const mainRouter = require('./routes/main');
const cookieParser = require("cookie-parser");
const session = require("express-session");

const app = express();

app.use(express.urlencoded({ extended: false }));
app.use(express.json());

app.set('view engine', 'ejs');
app.set('views', 'src/views');


app.use(cookieParser());

app.use(
  session({
    secret: "secret",
    resave: false,
    saveUninitialized: true,
    cookie: { secure: true }
  })
);
app.use(require("./middleware/auth-middleware"))

app.use('/', mainRouter);

app.listen(3000, () => {
  console.log('listening in http://localhost:3000');
});
