
        public class Factorial {
            public static int getFact(int n) {
                if (n <= 1) return 1;
                return n * getFact(n - 1);
            }
        }
        