import Final from "./final.js";
import Question from "./question.js";


let username = localStorage.getItem("username");

class Quiz {
  constructor(quizElement, amount, questions) {
    // Initialize DOM elements
    this.quizElement = quizElement;
    this.currentElement = document.querySelector(".current");
    this.totalElement = document.querySelector(".total");
    this.nextButton = document.querySelector("#next");
    this.finalElement = document.querySelector(".final");
    this.questionElement = document.getElementById("question");
    this.containerElement = document.getElementsByClassName("container");
    this.resultElement = document.getElementById("result");

    this.timerElement = document.getElementById("timer");

    // Initialize quiz state variables
    this.totalAmount = amount;
    this.answeredAmount = 0; // Number of answered questions
    this.correctTotal = 0; // Number of correct answers
    this.questions = this.setQuestions(questions); // Set the first question

    // this.nextButton.addEventListener('click', this.nextQuestion.bind(this));
    //Render the first question
    this.renderQuestion();
  }

  // save the data
  saveLeaderboard(data) {
    fetch("/saveLeaderboard", {
      // Send a POST request to the server to save the route of the leaderboard data
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to save leaderboard data");
        }
        console.log("okok :>> ");
      })
      .catch((error) => {
        console.error("Error saving leaderboard data:", error);
      });
  }


  setQuestions(question) {
    return new Question(question);
  }

  renderQuestion() {
    this.questions.render();
    this.currentElement.innerHTML = this.answeredAmount;
    this.totalElement.innerHTML = this.totalAmount;
    this.quizElement.appendChild(this.nextButton);
    this.nextButton.textContent = "Submit";
    this.nextButton.removeEventListener("click", this.handleClickNext);
    this.nextButton.addEventListener("click", this.handleClick);
  }

  // Handle the click event for submitting an answer
  handleClick = () => {
    this.nextQuestion();
    this.showResult();
  };

  // Handle the click event for moving to the next question
  handleClickNext = () => {
    this.resultElement.textContent = "";
    this.answeredAmount++;
    if (this.answeredAmount < this.totalAmount) {
      // send the message event to the server
      socket.emit("message", this.answeredAmount);
      // The flag indicates that the next button has been clicked
      this.nextButtonClicked = true;

      // Receive server messages and render
      socket.on("chat_message", (data) => {
        //console.log('Received broadcast data:', data);
        // If the next button has been clicked, then execute the following logic
        if (this.nextButtonClicked) {
          //console.log('data :>> ', data);
          this.questions = this.setQuestions(data);
          // Data broadcast on the server side can be processed here
          this.renderQuestion();
          // Reset flag
          this.nextButtonClicked = false;
        }
      });
    } else {
      this.endQuiz();
    }
  };

  
  nextQuestion() {
    // Gets the answer element selected by the user
    const checkedElement = this.questions.answerElements.filter((el) => {
      const dom = el.querySelector('input[type="radio"]');
      //console.log('chec', dom && dom.checked, dom)
      return dom && el.querySelector('input[type="radio"]').checked;
    });
    //console.log('111', checkedElement, this.questions)

    // debugger
    if (checkedElement.length == 0) {
      if (!this.questions.timedOut) {
        alert("You need to select an answer");
      } else {
        const fakeCheckedElement = [
          {
            textContent: "",
          },
        ];

        this.showResult(fakeCheckedElement);
      }
    } else {
      this.questions.stopTimer();
      if (this.questions.answer(checkedElement)) {
        this.correctTotal += 1
      };
      this.showResult(checkedElement);
    }
    this.questions.timedOut = false; // Reset timedOut flag
  }


  showResult(checkedElement) {
    if (!checkedElement) return;
    const submitData = {
      answer: checkedElement[0].textContent.trim(),
      question: this.questions.question,
    };

    socket.emit("answer", submitData);

    socket.on("chat_result", (data) => {
      //console.log('Received broadcast data:', data);
      this.resultElement.textContent = data;

      this.questionElement.innerHTML = this.resultElement.textContent; 
      // Empty the contents of each element in containerElement
      Array.from(this.containerElement).forEach((element) => {
        element.innerHTML = "";
      });

      if (this.answeredAmount < this.totalAmount) {

        this.nextButton.removeEventListener("click", this.handleClick);

        this.nextButton.textContent = "Next"; // Change the button text to "Next"

        this.nextButton.addEventListener("click", this.handleClickNext);
      } else {
        this.endQuiz();
      }

      // Clear the questionElement content
      this.questionElement.innerHTML = "";
      this.questionElement.appendChild(this.resultElement); // 显示结果提示
      this.questionElement.appendChild(this.nextButton); // 显示下一题按钮
    });

    // Input box information sending server

    // this.resultElement.textContent = checkedElement[0].textContent.trim() === this.questions.correctAnswer ? 'Correct answer :)' : 'Wrong answer :(';
  }

  // submit
  endQuiz() {
    this.quizElement.style.visibility = "hidden";
    this.finalElement.style.visibility = "visible";

    // calculate the correctrate
    const correctRate = Number((this.correctTotal / this.totalAmount * 100).toFixed(2));


    // Render result
    console.log(Question.times);
    new Final(this.correctTotal,Question.times,this.totalAmount);

    const averageTime = Number(
      ((Question.times) / this.totalAmount).toFixed(2)
    );

    // Save leaderboard data
    this.saveLeaderboard({
      personname: username,
      correctscore: correctRate,
      averagetime: averageTime,
    });
  }

  hideLeaderboard = () => {
    document.querySelector(".main").style.display = "block";
    document.getElementById("leaderboard-page").classList.add("hidden");
  };
}

export default Quiz;
