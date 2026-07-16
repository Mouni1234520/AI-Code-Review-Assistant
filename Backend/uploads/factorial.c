// Paste your C code here to analyze it!
#include <stdio.h>

long calculateFactorial(int n) {
    if (n < 0) return -1;
    if (n == 0) return 1;
    
    long result = 1;
    for (int i = 1; i <= n; i++) {
        result *= i;
    }
    return result;
}

int main() {
    printf("%ld\n", calculateFactorial(5));
    return 0;
}
