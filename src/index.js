const path = require('path')
const exphbs = require('express-handlebars')
const Handlebars = require('handlebars')
const {allowInsecurePrototypeAccess} = require('@handlebars/allow-prototype-access')
const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser')
const express = require('express')
require('./db/mongoose')
const userRouter = require('./routers/user')
const taskRouter = require('./routers/task')
const weatherRouter = require('./routers/weather')
const app = express()

app.use(express.json())
app.use(cookieParser())

const port = process.env.PORT

// Handlebars
app.engine('handlebars', exphbs({ 
    defaultLayout: 'main', 
    handlebars: allowInsecurePrototypeAccess(Handlebars)}));
app.set('view engine', 'handlebars');

// Define paths for Express config
const publicDirectoryPath = path.join(__dirname, '../public')

// Body Parser
app.use(express.urlencoded({ extended: false }));

// Setup static directory to serve
app.use(express.static(publicDirectoryPath))

// Index route
app.get('/', (req, res) => res.render('index', { layout: 'landing' }))

app.use(userRouter)
app.use(taskRouter)
app.use(weatherRouter)

app.listen(port, () => {
    console.log('Server is up on port ' + port)
})