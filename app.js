var createError = require('http-errors');
var express = require('express');
var path = require('path');
var logger = require('morgan');
const expressValidator = require('express-validator');
var exphbs = require('express-handlebars');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const session = require('express-session');

var app = express();
const indexRouter = require('./routes/index');
const userRouter = require('./routes/user');

// view engine setup
var hbs = exphbs.create({
  extname: 'hbs',
  defaultLayout: __dirname + '/views/layouts/layout',
  layoutsDir: __dirname + '/views/layouts/',
  partialsDir: __dirname + '/views/partials/',
});
app.engine('.hbs', hbs.engine);

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', '.hbs');

app.use(express.static(path.join(__dirname, 'public')));

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(expressValidator());
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(session({
  key: 'user_sid',
  secret: 'thisisnotasecret',
  saveUninitialized: false,
  secure:true,
  cookie:{
    expires:24*60*60*1000
  },
  resave: false
}));

app.use('/', indexRouter);
app.use('/signup', indexRouter);
app.use('/user', userRouter);
app.use('/user/profile', userRouter);
app.use('/user/contact', userRouter);

app.use((req,res,next)=>{
  if(req.cookies.user_sid && !req.session.user){
    res.clearCookie('user_sid');
  }
  next();
})

app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});



module.exports = app;
