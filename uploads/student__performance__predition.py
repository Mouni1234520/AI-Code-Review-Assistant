# Student Performance Prediction using Machine Learning

# Import libraries
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LinearRegression
from sklearn.metrics import mean_squared_error, r2_score

# Create dataset
data = {
    'StudyHours': [2,3,4,5,6,7,8,3,5,6],
    'Attendance': [60,65,70,75,80,85,90,68,78,82],
    'PreviousScore': [50,55,60,65,70,75,80,58,68,72],
    'FinalScore': [55,58,63,68,72,78,85,60,70,75]
}

df = pd.DataFrame(data)

print("Dataset Preview:")
print(df)

# Features and target
X = df[['StudyHours', 'Attendance', 'PreviousScore']]
y = df['FinalScore']

# Train-test split
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42
)

# Model training
model = LinearRegression()
model.fit(X_train, y_train)

# Prediction
y_pred = model.predict(X_test)

print("\nPredicted Scores:")
print(y_pred)

# Evaluation
mse = mean_squared_error(y_test, y_pred)
r2 = r2_score(y_test, y_pred)

print("\nModel Evaluation:")
print("Mean Squared Error:", mse)
print("R2 Score:", r2)

# Visualization 1: Study Hours vs Final Score
plt.scatter(df['StudyHours'], df['FinalScore'])
plt.xlabel("Study Hours")
plt.ylabel("Final Score")
plt.title("Study Hours vs Final Score")
plt.grid(True)
plt.show()

# Visualization 2: Attendance vs Final Score
plt.scatter(df['Attendance'], df['FinalScore'])
plt.xlabel("Attendance (%)")
plt.ylabel("Final Score")
plt.title("Attendance vs Final Score")
plt.grid(True)
plt.show()