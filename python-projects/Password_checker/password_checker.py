import re
import string
from getpass import getpass

def calculate_password_strength(password):
    """Calculate password strength score (0-100) and provide feedback"""
    if not password:
        return 0, "Empty password"
    
    score = 0
    feedback = []
    
    # Length check
    length = len(password)
    if length < 8:
        feedback.append("Password is too short (minimum 8 characters)")
    elif length < 12:
        score += 10
        feedback.append("Consider making your password longer (12+ characters recommended)")
    else:
        score += 25
    
    # Character variety
    has_upper = any(c.isupper() for c in password)
    has_lower = any(c.islower() for c in password)
    has_digit = any(c.isdigit() for c in password)
    has_special = any(c in string.punctuation for c in password)
    
    char_types = has_upper + has_lower + has_digit + has_special
    
    if char_types == 1:
        feedback.append("Only one character type used - very weak")
    elif char_types == 2:
        score += 15
        feedback.append("Two character types used - could be stronger")
    elif char_types == 3:
        score += 25
        feedback.append("Three character types used - good")
    else:
        score += 35
        feedback.append("All character types used - excellent")
    
    # Common patterns check
    if password.lower() in ['password', '123456', 'qwerty', 'letmein']:
        feedback.append("Common password detected - very insecure")
        score = max(0, score - 30)
    
    if re.search(r'(.)\1{2,}', password):  # Repeated characters
        feedback.append("Repeated characters detected - weakens security")
        score = max(0, score - 15)
    
    if re.search(r'123|abc|987|zyx', password.lower()):  # Simple sequences
        feedback.append("Simple sequence detected - weakens security")
        score = max(0, score - 15)
    
    # Final score adjustment
    score = min(100, max(0, score))  # Ensure score is between 0-100
    
    # Strength rating
    if score >= 80:
        strength = "Very Strong"
    elif score >= 60:
        strength = "Strong"
    elif score >= 40:
        strength = "Moderate"
    elif score >= 20:
        strength = "Weak"
    else:
        strength = "Very Weak"
    
    feedback.insert(0, f"Password Strength: {strength} ({score}/100)")
    return score, "\n".join(feedback)

def main():
    print("Password Strength Checker")
    print("------------------------")
    
    # Use getpass to hide input (comment this line and uncomment the next if you want visible input)
    password = getpass("Enter password to check: ")
    # password = input("Enter password to check: ")
    
    score, feedback = calculate_password_strength(password)
    print("\nResults:")
    print(feedback)

if __name__ == "__main__":
    main()