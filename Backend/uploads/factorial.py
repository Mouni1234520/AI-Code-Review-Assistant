# Paste your Python code here to analyze it!
def calculate_factorial(n):
    if n < 0:
        return None
    elif n == 0:
        return 1
    else:
        # A simple recursive implementation
        result = 1
        for i in range(1, n + 1):
            result *= i
        return result

print(calculate_factorial(5))
