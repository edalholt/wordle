import wordlist from '$lib/words.json';

export async function POST({ request, cookies }) {
	let validWord = true;
	const { guess } = await request.json();
	const findValidWord = wordlist.includes(guess);
	if (!findValidWord) {
		return new Response(JSON.stringify({ letters: null, validWord: false }), {
			headers: { 'Content-Type': 'application/json' }
		});
	}

	const word = wordlist[await getDailyWordIndex()];

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

	// Date for the cookie to expire one second before the next day, when there is a new word.
	const cookieExpiry = new Date().setHours(23, 59, 59, 0);
	const prevGuesses = cookies.get('guess') || JSON.stringify({ words: [], correct: false });
	cookies.set(
		'guess',
		JSON.stringify({ words: [...JSON.parse(prevGuesses).words, result], correct: guess == word }),
		{
			path: '/',
			expires: new Date(cookieExpiry)
		}
	);

	return new Response(
		JSON.stringify({ letters: result, validWord: validWord, correct: guess === word }),
		{
			headers: { 'Content-Type': 'application/json' }
		}
	);
}

const getDailyWordIndex = () => {
	const wordCount = wordlist.length - 1;
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
