import Quiz from './quiz.js';

class Settings {
  constructor() {
    // Initialize DOM elements
    this.quizElement = document.querySelector('.quiz');
    this.settingsElement = document.querySelector('.settings');
    this.college = document.querySelector('#college');
    this.numberOfQuestions = document.querySelector('#questions');
    this.startButton = document.querySelector('#start');

    this.quiz = {};

    // Add event listeners for start button and number of questions input
    this.startButton.addEventListener('click', this.startQuiz.bind(this));
    this.numberOfQuestions.addEventListener('input', this.validateInput.bind(this));
  }

  async startQuiz() {
    try {
      const amount = this.validateInput(); // Use validateInput to get the number of questions
      const collegeId = this.college.value; // Corresponding local file name
      // const url = `./data/college_${collegeId}.json`; 
      // let response = await fetch(url);
      // let data = await response.json();

      // Emit a message to the server to get questions for the selected college
      socket.emit('collegeQuestion', collegeId);
      // console.log('qes', data.questions)\

      // Listen for the server response with the questions
      socket.on('question', data => {
        this.toggleVisibility();
        this.quiz = new Quiz(this.quizElement, amount, data); 
      });
    } catch (error) {
      alert(error.message); 
    }
  }

  // Method to toggle visibility between settings and quiz
  toggleVisibility() {
    this.settingsElement.style.visibility = 'hidden';
    this.quizElement.style.visibility = 'visible';
  }

  // Method to validate the number of questions input
  validateInput() {
    const input = this.numberOfQuestions.value;
    const errorMessage = document.getElementById('error-message');
    const inputNumber = parseFloat(input);

    // Check if the input is a valid integer between 10 and 15
    if (isNaN(inputNumber) || !Number.isInteger(inputNumber) || inputNumber > 15 || inputNumber < 10) {
      errorMessage.style.display = 'block';// Show error message
      throw new Error('Please enter a valid integer number of questions between 10 and 15!');
    } else {
      errorMessage.style.display = 'none';
      return inputNumber;
    }
  }

}


export default Settings;