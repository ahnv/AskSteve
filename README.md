# AskSteve    
![Tests Result](/tests_result.jpg?raw=true "Tests Result")

# Pre-reqs
To build and run this app locally you will need a few things:
- Install [Node.js](https://nodejs.org/en/)
- Install [MongoDB](https://docs.mongodb.com/manual/installation/) for local Database only.  

# Getting started
- Clone the repository
```
git clone https://github.com/ahnv/AskSteve
```
- Install dependencies
```
cd AskSteve
npm install
```
- Build and run the project
```
npm run build
npm start
```
- Setup Environment Variables
```
Copy .env.example to .env
Update the variables MONGODB_URI, FACEBOOK_ID, FACEBOOK_ACCESS_TOKEN, FACEBOOK_VERIFY_TOKEN
TEST_USER and BOT_USER_ID are only for test purposes
```
Finally, navigate to `http://localhost:3000` and you should see the home Json!

### Running tests

Simply run `npm run test`.
Note this will also generate a coverage report.
