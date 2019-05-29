## Hey!

This is the "Mini Trello" application written a month earlier, aka "Trinnoninno", but this time it employs Angular and a couple of different APIs.

## How do I run it?

1. `git pull` the repo
2. `npm install`
3. configure your `.env` file according to the suggestive specifications found in `example.env` (and have an appropriate PostgreSQL server live)

Now, your server is ready to run!

## Available scripts

* `npm run backend` runs the API server
* `npm run backend-nodemon` also runs the API server, but with nodemon for hot loading!
* `npm run backend-test` rolls the API test suites, ensuring everything's cool!

### Trivia

If you have a sharp eye and the curiosity to check out `/backend/test.js`, you might notice there's a whooole bunch of unused, commented test cases. What's up with those? Well, in my rush to finish the application asap I skipped what later proved to be a rather important part of our planning: the API schema, ie: what comes in and what comes out of the APIs (duh). Now, although we had a general idea of what should be done, we've only later written down exactly what I should get and what I should give back to the client. So, all my test cases ended up being pretty inaccurate (noooo) and I just wrote them over again. Heh.

Fun times, right?