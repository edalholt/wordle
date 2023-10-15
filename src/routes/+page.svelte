<script>
	import { onMount } from 'svelte';

    $: word = ""
    /** @type {import('./$types').PageData} */
    export let data;

    $: wrongLetters = ""
    $: prevGuesses = data.prevGuesses.words
    $: correct = data.prevGuesses.correct
    $: usedLetterColor = "#225633"
    $: unusedLetterColor = "#2d3339"
    $: invalidWord = false;

    // Get wrong previously guessed letters from cookie
    // Using onMount to avoid problems with SSR
    onMount(() => {
      const cookie = document.cookie.split(';').find(cookie => cookie.includes('wrongLetters'))
      if (cookie) {
        wrongLetters = cookie.split('=')[1]
      }
    })

    // Function for handling button click and send post request to server
    const handleGuess = async () => {
      const response = await fetch('/guess', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ guess: word })
      })
      const data = await response.json()
      
      if (!data.validWord){
        invalidWord = true;
        setTimeout(() => {
          invalidWord = false;
        }, 1500);
        return
      }
      prevGuesses = [...prevGuesses, data.letters];

      // Store and skip the letters already iterated over to avoid correct duplicate letters to be flagged as wrong.
      let checkedLetters = ""
      for (const letter of data.letters) {
        if (letter.status === 0 && !wrongLetters.includes(letter.letter) && !checkedLetters.includes(letter.letter)) {
          wrongLetters += letter.letter;
        }
        checkedLetters += letter.letter;
      }
      
      if (data.correct) {
        correct = true
      }
      word = ""
      // Store wrong letters in cookie, until end of day when a new game is started.
      document.cookie = `wrongLetters=${wrongLetters}; expires=${new Date(new Date().setHours(23, 59, 59, 0))}`
    }

    // Event listener for key press and capture letter
    const onKeyDown = (/** @type {{ key: string; }} */ event) => {
      if (correct) return
      if (event.key === 'Enter') {
        if (word.length < 5) return
        handleGuess()
        return
      }
      if (event.key === 'Backspace') {
        word = word.slice(0, -1)
        return
      }
      if (event.key.length > 1) {
        return
      }
      if (word.length >= 5) return
      word += event.key.toLowerCase()
    }
  </script>
  
  <main>

    <h1 class="heading">Yet Another Wordle</h1>

    <div id="game">
      {#each prevGuesses as word}
      <div class="wordRow">
      {#each word as letter}
        <div class="letter" style="border-color: {letter.placement === 1 ? '#005c26' : letter.status === 1 ? '#b59f3b' : '#689cc5'}">{letter.letter.toUpperCase()}</div>
      {/each}
      </div>
      {/each}

      {#if !correct}
      <div class="wordRow">
      {#each word.split('') as letter}
        <div class="letter">{letter.toUpperCase()}</div>
      {/each}
      {#if (word.length < 5)}
      {#each Array.from({ length: 5 - word.length }) as _}
        <div class="letter"> </div>
      {/each}
      {/if}
      </div>
      {/if}
      {#if correct}
      <h1 class="heading">Correct word!</h1>
      {/if}
      <div style="visibility: {invalidWord ? "visible" : "hidden"};" id="notInListNotification">
        Word not in list
      </div>

      <div class="keyboard">
        <div class="keyboardRow">
        {#each "qwertyuiop".split('') as letter} 
          <button style="background-color: {wrongLetters.includes(letter) ? unusedLetterColor : usedLetterColor};"  on:click={() => onKeyDown({key: letter})}>{letter.toUpperCase()}</button>

        {/each}
        </div>
        <div class="keyboardRow">
          {#each "asdfghjkl".split('') as letter} 
            <button style="background-color: {wrongLetters.includes(letter) ? unusedLetterColor : usedLetterColor};"  on:click={() => onKeyDown({key: letter})}>{letter.toUpperCase()}</button>
    
          {/each}
          </div>
          <div class="keyboardRow">
            <button id="enterBtn" on:click={() => onKeyDown({key: "Enter"})}></button>
            {#each "zxcvbnm".split('') as letter} 
              <button style="background-color: {wrongLetters.includes(letter) ? unusedLetterColor : usedLetterColor};" on:click={() => onKeyDown({key: letter})}>{letter.toUpperCase()}</button>
      
            {/each}
            <button id="backBtn" on:click={() => onKeyDown({key: "Backspace"})}></button>
          </div>
        </div>
    </div>

  </main>
  
  <style>

    * {
      margin: 0;
      padding: 0;
    }
    .heading {
      color: white;
      font-family: 'Times New Roman', Times, serif;
    }
    :global(body){
      background-color: #19242f;
      background-image: url('/waveBg.svg');
      background-repeat: no-repeat;
      background-size: cover;
      min-height: 100vh;
      background-position: bottom;
    }
    main {
      text-align: center;
      margin-top: 30vh;
      margin-right: 40vw;
    }
    #game {
      margin-top: 5vh;
    }

    #notInListNotification {
      color: wheat;
      font-family: 'Times New Roman', Times, serif;
      display: block;
    }
    .wordRow {
      display: flex;
      justify-content: center;
      align-items: center;
      margin: 2rem;
    }
    .letter {
      border: 4px solid #689cc5;
      border-radius: 5px;
      font-family: Verdana, Geneva, Tahoma, sans-serif;
      color: white;
      width: 2rem;
      height: 2rem;
      margin: 0 0.5rem;
      display: flex;
      justify-content: center;
      align-items: center;
    }

    .keyboard {
      margin-top: 10vh;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      gap: 1rem;
    }

    .keyboardRow {
      max-width: 90vw;
      display: flex;
      justify-content: center;
      align-items: center;
    }
    .keyboardRow button {
      background-color: #225633;
      border: 0;
      font-family: Verdana, Geneva, Tahoma, sans-serif;
      color: white;
      width: 2rem;
      height: 2rem;
      margin: 0 0.2rem;
      display: flex;
      justify-content: center;
      align-items: center;
      border-radius: 3px;
    }

    #enterBtn {
      background-image: url("/enter.svg");
      background-size: 1.2em;
      background-position: center;
      background-repeat: no-repeat;
    }

    #backBtn {
      background-image: url("/backspace.svg");
      background-size: 1.2em;
      background-position: center;
      background-repeat: no-repeat;
    }


    @media only screen and (max-width: 850px) {
      main {
        margin-right: 0;
        margin-top: 25vw;
      }

      :global(body){
        background-position: 65% 50%;
        touch-action: manipulation;
      }

      .keyboard {
        margin-top: 5vh;
      }
    }
  </style>
  <svelte:window on:keydown|preventDefault={onKeyDown} />