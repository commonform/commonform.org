module.exports = process.env.NODE_ENV === 'production'
? 'https://api.commonform.org'
: 'http://localhost:8080'
