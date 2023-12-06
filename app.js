const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const Book = require('./model/bookModel');
const User = require('./model/user');
const bcrypt = require('bcryptjs');

const app = express();
app.set('view engine', 'ejs');

app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));

const port = process.env.PORT || 7000;

// Connect to MongoDB
mongoose.connect('mongodb://127.0.0.1:27017/booksApi', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

// Define book routes
const bookRouter = express.Router();
bookRouter.route('/books').get(async (req, res, next) => {
    try {
        const books = await Book.find();
        res.render('./index', { books });
    } catch (err) {
        return res.status(500).send(err);
    }
});

app.use('/api', bookRouter);

// Book detail route
app.get('/api/books/:id', async (req, res) => {
    const id = req.params.id;
    try {
        const book = await Book.findById(id);
        return res.render('bookDetail', { book });
    } catch (err) {
        return res.status(500).send(err);
    }
});

// Login route
app.route('/')
    .get((req, res) => {
        res.render('loginPage', { message: "" });
    })
    .post(async (req, res) => {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.render('loginPage', { message: "Enter a correct password or email" });
        }

        try {
            const user = await User.findOne({ email: email });

            if (user) {
                const isUser = await bcrypt.compare(password, user.hashedPassword);

                if (isUser) {
                    return res.redirect("/api/books");
                }
            }
        } catch (err) {
            console.error(err);
            return res.status(500).send(err.message);
        }

        return res.render('loginPage', { message: "Invalid email or password" });
    });

// Signup route
app.route('/signup')
    .get((req, res) => {
        res.render('signup', { message: "" });
    })
    .post(async (req, res) => {
        const { name, lastname, email, password, conpassword } = req.body;

        const user = await User.findOne({ email: email });

        if (!user) {
            if (password !== conpassword) {
                return res.render('signup', { message: 'Check password' });
            }

            try {
                const hashedPassword = await bcrypt.hash(password, 8);
                const newUser = await User.create({ name, lastname, email, hashedPassword });
                return res.redirect('/');
            } catch (err) {
                console.error(err);
                return res.status(500).send(err.message);
            }
        } else {
            return res.render('signup', { message: 'Email exists' });
        }
    });

// Book form route
app.get('/bookForm', (req, res) => {
    res.render('bookForm');
});

// Save book route
app.post('/bookSave', async (req, res) => {
    try {
        const book = await Book.create(req.body);
        res.redirect("/api/books");
    } catch (err) {
        res.status(500).send(err);
    }
});


// Start the server
app.listen(port, () => {
    console.log('App listening at port ' + port);
});
