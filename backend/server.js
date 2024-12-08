// require('dotenv').config();
// const express = require('express');
// const cors = require('cors');
// const bodyParser = require('body-parser');
// const connectDB = require('./config/db');

// const app = express();
// connectDB();

// app.use(cors());
// app.use(bodyParser.json());

// app.use('/api/auth', require('./routes/auth'));
// app.use('/api/audio', require('./routes/audio'));

// const PORT =  5000;

// app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');


const app = express();
const port = 5000;

app.use(cors());
app.use(express.json());

app.use('/api/auth', require('./routes/auth'));
app.use('/api/audio', require('./routes/audio'));

mongoose.connect('mongodb://localhost:27017/audiosummarizer', { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.log(err));

app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});