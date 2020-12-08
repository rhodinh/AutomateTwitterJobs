const Twit = require('twit'); 
const ObjectsToCsv = require('objects-to-csv');
require('dotenv').config()

var T = new Twit({
  consumer_key:    process.env.API_KEY,
  consumer_secret: process.env.API_SECRET_KEY,
  access_token: process.env.ACCESS_TOKEN,
  access_token_secret:  process.env.ACCESS_TOKEN_SECRET
});

T.get('search/tweets', { q: 'looking for product manager', count: 100 }, async (err, data, response) => {
  const accountSid =  process.env.ACCOUNT_SID
  const authToken  =  process.env.AUTH_TOKEN
  const client = require('twilio')(accountSid, authToken);

  try {
    const statuses = data.statuses;
    const tweets = [];

    statuses.map(status => {
      tweets.push({
        time: status.created_at,
        text: status.text,
        name: status.user.name,
        screen_name: status.user.screen_name,
        tweet_url: `https://twitter.com/${status.user.screen_name}/status/${status.id_str}`
      });
  });

  const csv = await new ObjectsToCsv(tweets)
  await csv.toDisk('./tweets.csv', { append: true })

    client.messages
    .create({
      body: `Your Tweets are ready to review! Go Job Hunting! - ${new Date().toLocaleString()}`,
      from: '+17697597365',
      to: '+15123005380'
    })
    .then(message => console.log(message.sid));
  } catch(e) {
    client.messages
    .create({
      body: `Oops! something is wrong - ${new Date().toLocaleString()}`,
      from: '+17697597365',
      to: '+15123005380'
    })
    .then(message => console.log(message.sid));
  }
});