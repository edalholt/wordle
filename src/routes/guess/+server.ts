import { getCollection } from '$lib/db';
const words = await getCollection('words');

export async function POST({ request }) {
	let validWord = true;
	const { guess } = await request.json();
	const findValidWord = await words.find({ word: guess }).toArray();
	if (findValidWord.length < 1) {
		return new Response(JSON.stringify({ letters: null, validWord: false }), {
			headers: { 'Content-Type': 'application/json' }
		});
	}

	const resultArray = await words
		.find()
		.skip(await getDailyWordIndex())
		.limit(1)
		.toArray();
	let word = '';
	if (resultArray.length > 0) {
		word = resultArray[0].word;
	} else {
		return new Response(JSON.stringify({ error: 'Daily word not found in DB' }), {
			headers: { 'Content-Type': 'application/json' },
			status: 500
		});
	}

	let wordWithoutCorrect = word;

	const result = [];

	for (let i = 0; i < word.length; i++) {
		if (word[i] === guess[i]) {
			// Remove correct guesses to avoid wrong feedback when there is words with more instances of the same letter.
			// New word without correct guesses.
			for (let x = 0; x < wordWithoutCorrect.length; x++) {
				if (wordWithoutCorrect[x] == word[i]) {
					wordWithoutCorrect = wordWithoutCorrect.slice(0, x) + wordWithoutCorrect.slice(x + 1);
					break;
				}
			}

			result.push({
				letter: guess[i],
				status: 1,
				placement: 1
			});
		} else {
			result.push({ letter: guess[i], status: 0, placement: 0 });
		}
	}

	// Check for correct letters with wrong placement after knowing which one has correct placement.
	for (let i = 0; i < word.length; i++) {
		if (word[i] !== guess[i]) {
			if (wordWithoutCorrect.includes(guess[i])) {
				result[i] = { letter: guess[i], status: 1, placement: 0 };

				for (let x = 0; x < wordWithoutCorrect.length; x++) {
					if (wordWithoutCorrect[x] == guess[i]) {
						wordWithoutCorrect = wordWithoutCorrect.slice(0, x) + wordWithoutCorrect.slice(x + 1);
						break;
					}
				}
			} else {
				result[i] = { letter: guess[i], status: 0, placement: 0 };
			}
		}
	}

	return new Response(
		JSON.stringify({ letters: result, validWord: validWord, correct: guess === word }),
		{
			headers: { 'Content-Type': 'application/json' }
		}
	);
}

const getDailyWordIndex = async () => {
	const wordCount = await words.countDocuments();
	const randomWordIndex = getDailyInt(0, wordCount);
	return randomWordIndex;
};

function getDailyInt(min: number, max: number): number {
	const currentDate = new Date();
	const seed =
		currentDate.getFullYear() * 10000 + (currentDate.getMonth() + 1) * 100 + currentDate.getDate();
	const randomValue = Math.sin(seed) * 10000;
	const randomInRange = Math.floor((randomValue % (max - min + 1)) + min);
	return randomInRange;
}
