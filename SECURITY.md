# Security Policy

## Security Improvements Implemented

### 1. Content Security Policy (CSP)
- Added comprehensive CSP meta tag to prevent XSS attacks
- Restricts content sources to trusted domains only
- Enforces secure connection to Firebase and CDN resources

### 2. Security Headers
- `X-Content-Type-Options: nosniff` - Prevents MIME type sniffing
- `X-Frame-Options: DENY` - Prevents clickjacking attacks
- `Referrer Policy: no-referrer` - Protects user privacy

### 3. Input Validation and Sanitization
- Username input is sanitized to prevent injection attacks
- Only alphanumeric characters and Turkish characters are allowed
- Maximum length limit enforced (20 characters)
- Empty or whitespace-only usernames are rejected
- All Firebase operations validate input before database queries

### 4. Firebase Security
- Firebase API keys are intentionally public (this is safe per Firebase documentation)
- Security is enforced through Firebase Security Rules on the backend
- Added error handling to all Firebase operations
- Limited leaderboard queries to prevent excessive data retrieval (100 records max)

### 5. Data Validation
- Score data type validation (must be number)
- Username data type validation (must be string)
- All user input is validated before storage or transmission
- Error handling added to prevent silent failures

## Firebase Security Rules Recommendations

To ensure complete security, configure Firebase Security Rules as follows:

```json
{
  "rules": {
    "users": {
      "$userId": {
        ".read": true,
        ".write": "!data.exists() || (data.child('device').val() === newData.child('device').val() && newData.child('score').val() > data.child('score').val())",
        ".validate": "newData.hasChildren(['name', 'score', 'date', 'device'])",
        "name": {
          ".validate": "newData.isString() && newData.val().length <= 20"
        },
        "score": {
          ".validate": "newData.isNumber() && newData.val() >= 0"
        },
        "date": {
          ".validate": "newData.isString()"
        },
        "device": {
          ".validate": "newData.isString()"
        }
      }
    }
  }
}
```

These rules ensure:
- Users can only update their own scores
- Scores must be higher than previous scores
- All required fields must be present
- Username length is limited
- Scores must be non-negative numbers

## Reporting Security Issues

If you discover a security vulnerability, please report it to the repository maintainer privately rather than opening a public issue.

## Best Practices for Deployment

1. **Enable Firebase Security Rules** as documented above
2. **Use HTTPS** for all deployments
3. **Keep dependencies updated** to patch known vulnerabilities
4. **Regular security audits** using tools like CodeQL
5. **Monitor Firebase usage** for unusual activity
6. **Implement rate limiting** on Firebase if high traffic is expected
