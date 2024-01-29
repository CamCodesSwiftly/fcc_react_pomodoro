import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import reportWebVitals from "./reportWebVitals";

const root = ReactDOM.createRoot(document.getElementById("root"));

class Timer extends React.Component {
	render() {
		return (
			<div id="timer">
				<div id="timer-label">{this.props.timerLabel}</div>
				<div id="timer-container">
					<i
						onClick={this.props.onToggle}
						id="start_stop"
						className="fa-solid fa-play"
					></i>
					<div id="time-left">{formatTime(this.props.timeLeft)}</div>
					<i
						onClick={this.props.onReset}
						id="reset"
						className="fa-solid fa-rotate-right"
					></i>
				</div>
			</div>
		);
	}
}

class Session extends React.Component {
	render() {
		return (
			<div id="session">
				<div id="session-label">Session Length</div>
				<div id="session-container">
					<i
						onClick={(e) => this.props.onSessionChange(e, 60)}
						id="session-increment"
						className="fa-solid fa-plus"
					></i>
					<div id="session-length">
						{formatTime(this.props.sessionLength, true)}
					</div>
					<i
						onClick={(e) => this.props.onSessionChange(e, -60)}
						id="session-decrement"
						className="fa-solid fa-minus"
					></i>
				</div>
			</div>
		);
	}
}

class Break extends React.Component {
	render() {
		return (
			<div id="break">
				<div id="break-label">Break Length</div>
				<div id="break-container">
					<i
						onClick={(e) => this.props.onBreakChange(e, 60)}
						id="break-increment"
						className="fa-solid fa-plus"
					></i>
					<div id="break-length">
						{formatTime(this.props.breakLength, true)}
					</div>
					<i
						onClick={(e) => this.props.onBreakChange(e, -60)}
						id="break-decrement"
						className="fa-solid fa-minus"
					></i>
				</div>
			</div>
		);
	}
}

class Clock extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			timeLeft: 1500,
			sessionLength: 1500,
			breakLength: 300,
			sessionRunning: false,
			breakRunning: false,
			timeRunning: false,
			timerLabel: "Session",
		};
		this.defaultState = this.state;
	}

	// * ------------------------------- HANDLER FUNCTIONS ------------------------------
	// ! SUSPECTING THE PROBLEM TO BE HERE
	toggleClock = (e) => {
		// * CLOCK STARTING FOR THE FIRST TIME
		if (this.state.timeRunning === false) {
			animatePlayButton(e);

			this.setState({
				timeRunning: true,
				sessionRunning: true,
				breakRunning: false,
			});

			this.clockID = setInterval(() => this.tick(), 1000);
		}
		// * CLOCK WAS PAUSED AND IS IN SESSION MODE
		else if (
			this.state.timeRunning === false &&
			this.state.sessionRunning === true
		) {
			animatePlayButton(e);

			this.setState({
				timeRunning: true,
				sessionRunning: true,
				breakRunning: false,
			});

			this.clockID = setInterval(() => this.tick(), 1000);
		}
		// * CLOCK WAS PAUSED AND IS IN BREAK MODE
		else if (
			this.state.timeRunning === false &&
			this.state.breakRunning === true
		) {
			animatePlayButton(e);

			this.setState({
				timeRunning: true,
				sessionRunning: false,
				breakRunning: true,
			});

			this.clockID = setInterval(() => this.tick(), 1000);
		}
		// * PAUSE THE CLOCK
		else {
			animatePlayButton(e, true);

			this.setState({
				sessionRunning: false,
				breakRunning: false,
				timeRunning: false,
			});

			clearInterval(this.clockID);
		}

		//* DISABLE ELEMENTS----------------------------------------------------
		const controlElements = document.getElementsByClassName("fa-solid");
		for (let i = 0; i <= 3; i++) {
			controlElements[i].classList.add("disable");
		}
	};

	resetClock = (e) => {
		stopAudio();
		clearInterval(this.clockID);
		this.setState(this.defaultState);
		removeStyles();

		const startStop = document.getElementById("start_stop");
		// * PLAY/PAUSE BUTTON
		if (this.state.timeRunning) {
			startStop.classList.remove("fa-pause");
			startStop.classList.add("fa-play");
		} else if (!this.state.timeRunning) {
			startStop.classList.remove("fa-play");
			startStop.classList.add("fa-pause");
		}

		// * ENABLE ELEMENTS-----------------------------------------------------
		const controlElements = document.getElementsByClassName("fa-solid");
		for (let i = 0; i <= 3; i++) {
			controlElements[i].classList.remove("disable");
		}
		return;
	};

	tick = () => {
		if (this.state.timeLeft === 0) {
			if (this.state.sessionRunning) {
				colorTimerLabels();

				playAudio();
				this.setState({
					timerLabel: "Break",
					timeLeft: this.state.breakLength,
					sessionRunning: false,
					breakRunning: true,
				});
				return;
			} else if (this.state.breakRunning) {
				colorTimerLabels("session");

				playAudio();
				this.setState({
					timerLabel: "Session",
					timeLeft: this.state.sessionLength,
					sessionRunning: true,
					breakRunning: false,
				});
				return;
			}
		} else {
			this.setState({ timeLeft: this.state.timeLeft - 1 });
			return;
		}
	};

	setSessionLength = (e, amount) => {
		colorLabels("session-length");

		// * LIMITS---------------------------------------------------
		if (this.state.sessionLength < 120 && amount < 0) return;
		if (this.state.sessionLength >= 3600 && amount > 0) return;
		// * LIMITS---------------------------------------------------

		this.setState((prevState) => {
			return {
				timeLeft: prevState.sessionLength + amount,
				sessionLength: prevState.sessionLength + amount,
			};
		});
	};

	setBreakLength = (e, amount) => {
		colorLabels("break-length");

		// * LIMITS----------------------------------------------------
		if (this.state.breakLength < 120 && amount < 0) return;
		if (this.state.breakLength >= 3600 && amount > 0) return;
		// * LIMITS----------------------------------------------------

		this.setState((prevState) => {
			return {
				breakLength: prevState.breakLength + amount,
			};
		});
	};

	// * ----------------------------- RENDER SECTION ----------------------------------

	render() {
		return (
			<div>
				<div id="wristband-upper"></div>
				<div id="clock">
					<h1>25 + 5 Clock</h1>
					<div id="breaksession-container">
						<Break
							onBreakChange={this.setBreakLength}
							breakLength={this.state.breakLength}
						/>
						<Session
							onSessionChange={this.setSessionLength}
							sessionLength={this.state.sessionLength}
						/>
					</div>
					<Timer
						timeLeft={this.state.timeLeft}
						timerLabel={this.state.timerLabel}
						onReset={this.resetClock}
						onToggle={this.toggleClock}
					/>
					<div id="credits-container">
						<div className="credits">Designed and coded by</div>
						<div className="credits">Kamran Babazadeh</div>
					</div>
					<audio
						id="beep"
						className="audio"
						src="https://bigsoundbank.com/UPLOAD/mp3/0024.mp3"
						type="audio/mpeg"
					></audio>
				</div>
				<div id="wristband-lower"></div>
			</div>
		);
	}
}
root.render(<App />);
// !--------------------------UTILITY SECTION-----------------------------------

// * CONVERT INTEGER TO TIME FORMAT------------------------------------------------
function formatTime(timeLeft, onlyMinutes) {
	const minutes = Math.floor(timeLeft / 60);
	const seconds = timeLeft % 60;

	return onlyMinutes
		? `${minutes.toString()}`
		: `${minutes.toString().padStart(2, "0")}:${seconds
				.toString()
				.padStart(2, "0")}`;
}

// * STYLING SECTION----------------------------------------------------------------
function colorLabels(elementString) {
	let element = document.getElementById(elementString);
	element.classList.add("colored");
	setTimeout(() => {
		element.classList.remove("colored");
	}, 100);
	return;
}

const timerLabelElement = document.getElementById("timer-label");
const timeLeftElement = document.getElementById("time-left");
function colorTimerLabels(session) {
	const classToRemove = session ? "colored-blue" : "colored";
	const classToAdd = session ? "colored" : "colored-blue";

	timerLabelElement.classList.remove(classToRemove);
	timeLeftElement.classList.remove(classToRemove);
	setTimeout(() => {
		timerLabelElement.classList.add(classToAdd);
		timeLeftElement.classList.add(classToAdd);
	}, 200);
}

function removeStyles(session) {
	timerLabelElement.classList.remove("colored-blue");
	timerLabelElement.classList.remove("colored");
	timeLeftElement.classList.remove("colored-blue");
	timeLeftElement.classList.remove("colored");
	return;
}

function animatePlayButton(e, running) {
	const classToAdd = running ? "fa-play" : "fa-pause";
	const classToRemove = running ? "fa-pause" : "fa-play";

	e.target.classList.remove(classToRemove);
	e.target.classList.add(classToAdd);
	e.target.classList.add("colored");
	setTimeout(() => {
		e.target.classList.remove("colored");
	}, 100);

	running && timerLabelElement.classList.remove("colored");
	running && timeLeftElement.classList.remove("colored");

	timerLabelElement.classList.add("colored");
	timeLeftElement.classList.add("colored");
	return;
}
// * AUDIO SECTION------------------------------------------------------------------
function playAudio() {
	let audio = document.getElementById("beep");
	audio.currentTime = 0;
	audio.play();
	return;
}
function stopAudio() {
	let audio = document.getElementById("beep");
	audio.pause();
	audio.currentTime = 0;
	return;
}

root.render(
	<React.StrictMode>
		<Clock />
	</React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
