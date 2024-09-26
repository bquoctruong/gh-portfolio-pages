// const port = process.env.PORT || 8080;
const express = require('express');
const path = require('path');
const app = express();

app.use(express.static(path.join(__dirname, 'public')));

const userRoutes = require('./routes/mainRoutes');
app.use('/', mainRoutes);

// app.use(express.json());
// app.use(express.urlencoded({ extended: false }));

// app.set('views', path.join(__dirname, 'views'));
// app.set('view engine', 'pug');

// app.use('/users', userRoutes);

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});