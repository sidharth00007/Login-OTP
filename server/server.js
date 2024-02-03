import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import connect from './database/connection.js';
import router from './router/route.js';

const app = express();

/** middlewares */
app.use(express.json({ limit: '50mb' }));
app.use(cors());
app.use(morgan('tiny'));
app.disable('x-powered-by'); // less hackers know about our stack

// Set up CORS options
const corsOptions = {
  origin: 'https://login-otp-eight.vercel.app',
  methods: 'GET,PUT,POST',
  credentials: true,
};

app.use(cors(corsOptions));

const port = 8080;

/** HTTP GET Request */
app.get('/', (req, res) => {
  res.status(201).json("Home GET Request");
});

/** api routes */
app.use('/api', router);

/** start server only when we have a valid connection */
connect()
  .then(() => {
    try {
      app.listen(port, () => {
        console.log(`Server connected to http://localhost:${port}`);
      });
    } catch (error) {
      console.log('Cannot connect to the server');
    }
  })
  .catch((error) => {
    console.log('Invalid database connection...!');
  });
