// Import the express module
import express from 'express';
import http from 'http';
import fs from 'fs'
import { Server } from 'socket.io';
// Import the file path-related modules from Node.js
import { fileURLToPath } from 'url';
import path from 'path';
import { dirname, join } from 'path';



// Convert to a file path
const __filename = fileURLToPath(import.meta.url);

// Get the directory name of the current file
const __dirname = dirname(__filename);

// Create an instance of the Express application
const app = express();
//Set cross-domain 
// Use the express.static middleware to serve static files 
app.use(express.static(join(__dirname, 'public')));




// Parse the request body in JSON format
app.use(express.json());

// Read leaderboard data
const leaderboardFilePath = path.join(__dirname, 'public', 'data', 'leaderboard.txt');

// Process POST requests to save leaderboard data to a file
app.post('/saveLeaderboard', (req, res) => {
  const leaderboardData = req.body;

  const oldData = fs.readFileSync(leaderboardFilePath, 'utf-8') || '[]';
  console.log('newBoard :>> ', JSON.parse(oldData), leaderboardData);

  const newBoard = [...JSON.parse(oldData), leaderboardData]

  // sort
  newBoard.sort((a, b) => {
      if (b.correctscore === a.correctscore) {
          return a.averagetime - b.averagetime; 
      }
      return b.correctscore - a.correctscore; 
  });

  // read the leaderboardfilepath once more
  fs.writeFile(leaderboardFilePath, JSON.stringify(newBoard), (err) => {
    if (err) {
      console.error('Error appending leaderboard data:', err);
      res.status(500).send('Failed to save leaderboard data');
    } else {
      res.sendStatus(200);
    }
  });

});

// get the data
app.get('/getLeaderboard', (req, res) => {
  const data = fs.readFileSync(leaderboardFilePath, 'utf-8') || '[]';
  res.status(200).json(JSON.parse(data));
});


// access the path. send the main HTML file
app.get('*', (req, res) => {
  res.sendFile(join(__dirname, 'public', 'index.html'));
});

const server = http.createServer(app);
const socketServer = new Server(server);

socketServer.on("connection", function (client) {
  console.log('Client connected');
  let questionData = [];

  const findIndexAsync = async (data) => {
    return new Promise(resolve => {
        const index = questionData.questions.findIndex(item => item.question == data.question && item.correctanswer === data.answer);
        resolve(index);
    });
};


  client.on('collegeQuestion', async data => {
    let collegeId = data
    const url = `./public/data/college_${collegeId}.json`; // Use a local JSON file
    const questions = fs.readFileSync(url);
    questionData = JSON.parse(questions);
    client.emit('question', questionData.questions[0]);
  });
  client.on('message', (data) => {
    console.log('Received data from client:', data);
    client.emit('chat_message', questionData.questions[data]);
    // This is where client data can be processed and recovered
  });

  //The following function is used to ensure the order of asynchronous processing instead of this one
  //client.on('answer', (data) => {
    //const index = questionData.questions.findIndex(item => item.question == data.question && item.correctanswer === data.answer )
    //const msg = index == -1 ? 'Wrong answer :(' : 'Correct answer :)'
    //client.emit('chat_result', msg)
    //console.log('Server is judging the answer');


  //})

  client.on('answer', async (data) => {
    const index = await findIndexAsync(data);
    const msg = index == -1 ? 'Wrong answer :(' : 'Correct answer :)';
    client.emit('chat_result', msg);
    console.log('Server is judging the answer');

    
});


  client.on('disconnect', () => {
    console.log('Client disconnected');
  });
});


//the Port
// to specify the server port in order to run successfully on codio, use 8080
const PORT = 8080;

//Event listener
// Start the server and listen on the specified port
server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});



