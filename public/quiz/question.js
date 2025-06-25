class Question {
  static times=0;
  constructor(question) {
    this.questionElement = document.querySelector('#question');
    this.answerElements = [
      document.querySelector('#a1'),
      document.querySelector('#a2'),
      document.querySelector('#a3'),
      document.querySelector('#a4'),
    ];
    this.correctAnswer = question.correctanswer;
    this.question = question.question;
    this.isCorrect = false;
    //console.log('aaa', question);
    this.answers = this.shuffleAnswers([
      question.correctanswer,
      ...question.incorrect_answers
    ]);


    this.timerElement = document.querySelector('#timer');
    this.timeLimit = 15; // 15 seconds time limit
    this.timer = null;
    this.timedOut = false; // Add this line
    this.timeStart = null; // record the start time

    this.startTimer();

  }
  shuffleAnswers(answers) {
    for (let i = answers.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * i)
      const temp = answers[i]
      answers[i] = answers[j]
      answers[j] = temp
    }
    return answers;
  }

  // Display the timer and start counting down
  startTimer() {
    this.timerElement.style.display = 'block';
    let timeRemaining = this.timeLimit;
    this.timeStart = Date.now(); // record the start time
    this.timerElement.textContent = `Time remaining: ${timeRemaining}s`;

    this.timer = setInterval(() => {
      timeRemaining -= 1;
      Question.times++;
      this.timerElement.textContent = `Time remaining: ${timeRemaining}s`;

      if (timeRemaining <= 0) {
        clearInterval(this.timer);
        this.timedOut = true; // Add this line
        this.handleTimeOut();
      }
    }, 1000);
  }

  // Handle what happens when time runs out
  handleTimeOut() {
    this.timerElement.style.display = 'none';
    document.querySelector('#next').click();
  }

   // Stop the timer and calculate the time spent on the question
  stopTimer() {
    clearInterval(this.timer);
    this.times = Math.floor((Date.now() - this.timeStart) / 1000); 
    this.timerElement.style.display = 'none';
  }

  // Check if the selected answer is correct
  answer(checkedElement) {
    this.isCorrect = (checkedElement[0].textContent === this.correctAnswer) ? true : false;
    return this.isCorrect
  }

  // Render the question and answers on the page
  render() {
    this.questionElement.innerHTML = this.question;
    //console.log(111, this.answers, this.question)
    this.answerElements.forEach((el, index) => {
      el.innerHTML = '<input type="radio" name="radio"><span class="checkmark"></span>' + this.answers[index];
    });
  }
}

export default Question;