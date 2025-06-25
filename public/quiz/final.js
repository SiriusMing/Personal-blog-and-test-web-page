class Final {
  constructor(count,time,totalAmount) {
    // Selecting the DOM elements for displaying score, time, and buttons
    this.scoreElement = document.querySelector('#score');
    this.timeElement = document.querySelector('#totaltime');
    this.againButton = document.querySelector('#again');
    this.backButton = document.querySelector('#back');
    this.rankButton = document.querySelector('#userrank');
    this.leaderboardPage = document.querySelector('#leaderboard-page');
    this.quizPage = document.querySelector('#quiz-page');
    
    
    // Rendering the score and time
    this.render(count,time,totalAmount);
    this.againButton.addEventListener('click', () => {
      //reload the page
      location.reload();
    });

    // Adding event listeners to buttons
    this.rankButton.addEventListener('click', () => {
      //Shows the leaderboard page
      this.showLeaderboard();
    });

    this.backButton.addEventListener('click', () => { 
      //reload the page
      location.reload();
    });

  }

  render(count,time,totalAmount) {
    // Displaying the score and time
    this.scoreElement.innerHTML = `You answered ${count} out of ${totalAmount} correct!`;
    this.timeElement.innerHTML = `The total time is ${time}s!`;

  }

  showLeaderboard() {
    // Hiding the final score page and showing the leaderboard page
    document.querySelector('.final').classList.add('hidden');
    this.leaderboardPage.classList.remove('hidden');
    this.loadLeaderboard();
  }

  loadLeaderboard() {
    // Fetch leaderboard data and render it
    fetch('/getLeaderboard')
      .then(response => response.json())
      .then(data => {
        // Rendering the leaderboard data into the table
        const tbody = this.leaderboardPage.querySelector('tbody');
        tbody.innerHTML = '';
        data.forEach(item => {
          const row = document.createElement('tr');
          row.innerHTML = `
            <td>${item.personname}</td>
            <td>${item.correctscore}%</td>
            <td>${item.averagetime}</td>
          `;
          tbody.appendChild(row);
        });
      });
  }

}

export default Final;