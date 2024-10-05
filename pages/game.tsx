import { useState } from "react";

export default function Game() {
  const [result, setResult] = useState(""); // State for the coin flip result
  const [message, setMessage] = useState(""); // Message to show if the user won or lost
  const [userChoice, setUserChoice] = useState(""); // User's choice (heads or tails)

  // Function to flip the coin
  const flipCoin = (choice: string) => {
    const outcomes = ["heads", "tails"];
    const randomOutcome = outcomes[Math.floor(Math.random() * 2)]; // Randomly generate "heads" or "tails"

    setUserChoice(choice); // Store the user's choice
    setResult(randomOutcome); // Store the flip result

    if (choice === randomOutcome) {
      setMessage("Congratulations! You guessed correctly!"); // The user guessed correctly
    } else {
      setMessage("Sorry! You guessed wrong!"); // The user guessed wrong
    }
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "100vh",
        backgroundColor: "black",
        color: "white",
        textAlign: "center",
      }}
    >
      <h1>Coin Flip</h1>
      <p>Choose Heads or Tails:</p>

      <div style={{ margin: "20px" }}>
        <button
          style={{
            padding: "10px 20px",
            margin: "10px",
            fontSize: "20px",
            cursor: "pointer",
            backgroundColor: "#32cd32",
            border: "none",
            borderRadius: "10px",
          }}
          onClick={() => flipCoin("heads")}
        >
          Heads
        </button>
        <button
          style={{
            padding: "10px 20px",
            margin: "10px",
            fontSize: "20px",
            cursor: "pointer",
            backgroundColor: "#ff4500",
            border: "none",
            borderRadius: "10px",
          }}
          onClick={() => flipCoin("tails")}
        >
          Tails
        </button>
      </div>

      {result && (
        <div style={{ marginTop: "20px" }}>
          <h2>Result: {result.toUpperCase()}</h2>
          <p>{message}</p>
          <p>You chose: {userChoice.toUpperCase()}</p>
        </div>
      )}

      {result && (
        <button
          style={{
            marginTop: "20px",
            padding: "10px 20px",
            fontSize: "20px",
            cursor: "pointer",
            backgroundColor: "#0066ff",
            color: "white",
            border: "none",
            borderRadius: "10px",
          }}
          onClick={() => {
            setResult(""); // Reset the result for a new game
            setMessage("");
            setUserChoice("");
          }}
        >
          Play Again
        </button>
      )}
    </div>
  );
}
