window.onmessage = (e) => {
  console.log("Message received from main script");
  const workerResult = `Result: ${JSON.stringify(e.data)}`;
  console.log("Posting message back to main script");
  postMessage(workerResult);
};
