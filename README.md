# Yet another daily wordle

Yes, it exists many wordle games already. Therefore i have created one more. The objective is simple: guess the hidden five-letter word. With each guess, you'll receive feedback on which letters are correct and in the right position (green), which letters are correct but in the wrong position (yellow), and which letters are not in the word at all. It's a brain-teasing game that will test your word-finding skills. Because the word are not revealed after a given amount of tries, and all kind of uncommon words can be the word of the day, there are no limit in number of guesses. A simple algorithm picks out a new word every day, have fun!

## Developing

This project are created using SvelteKit and a MongoDB database.

Create a MongoDB database, for example by using docker

`docker run -d --name wordle-mongodb -p 27017:27017 mongo`

The database need to include all allowed 5-letter words in a collection named `words`.  
Words can be imported from this [wordlist](/wordlist/words.json).

Create a .env in the root of this project containing the database connection string

Example:  
`DB_URI = mongodb://localhost:27017
DB_NAME = wordle`

Install dependencies

`npm i`

Start the server

`npm run dev`

## Buildng

To create a production version of your app:

```bash
npm run build
```

You can preview the production build with `npm run preview`.

> To deploy your app, you may need to install an [adapter](https://kit.svelte.dev/docs/adapters) for your target environment.
