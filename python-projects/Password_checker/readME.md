Password Strength Checker 🔒
A Python tool that evaluates password security by analyzing multiple factors and providing a comprehensive strength score with actionable feedback.

Features
Multi-factor analysis: Checks length, complexity, and common patterns

Strength scoring: Rates passwords from 0-100 with clear strength categories

Detailed feedback: Provides specific suggestions for improvement

Security-conscious: Uses getpass to hide input by default

Common password detection: Flags weak and frequently used passwords

Pattern recognition: Identifies sequences, repeats, and keyboard patterns

Usage
bash
Copy
python password_checker.py
Then enter your password when prompted to receive an instant security assessment.

Example Output
Copy
Password Strength: Strong (78/100)
- 12+ characters - good length
- Three character types used - good
- Consider adding special characters for even stronger security
Requirements
Python 3.x

No external dependencies

Contributing
Contributions welcome! Please open an issue or pull request for:

Additional password checks

Improved scoring algorithms

Language translations

Better common password detection