/** @type {import('./$types').PageLoad} */
export function load({ cookies }) {
	const prevGuessesCookie = cookies.get('guess') || JSON.stringify({ words: [], correct: false });

	/** @type {words: { letter: string, status: number, placement: number }[][], correct: boolean} */
	const prevGuesses = JSON.parse(prevGuessesCookie);
	return { prevGuesses };
}
