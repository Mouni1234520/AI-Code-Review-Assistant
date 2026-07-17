// Paste your JavaScript code here to analyze it!
function calculateFactorial(n) {
  if (n < 0) return null;
  if (n === 0) return 1;
  
  let result = 1;
  for (let i = 1; i <= n; i++) {
    result *= i;
  }
  return result;
}

console.log(calculateFactorial(5));
