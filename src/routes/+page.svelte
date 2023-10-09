<script>
    $: word = ""
    /** @type {{ letter: string, status: number, placement: number }[][]} */
    $: prevWords = []
    $: correct = false

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
      console.log(data)
      if (!data.validWord){
        return
      }
      prevWords = [...prevWords, data.letters];
      if (data.correct) {
        correct = true
      }
      word = ""
    }

    // Event listener for key press and capture letter
    const onKeyDown = (/** @type {{ key: string; }} */ event) => {
      if (event.key === 'Enter') {
        if (word.length < 5) return
        handleGuess()
        return
      }
      if (event.key === 'Backspace') {
        word = word.slice(0, -1)
        return
      }
      if (word.length >= 5) return
      word += event.key
    }
  </script>
  
  <main>
    <h1>Guess the word!</h1>


    {#each prevWords as word}
    <div class="wordRow">
    {#each word as letter}
      <div class="letter" style="border-color: {letter.placement === 1 ? 'green' : letter.status === 1 ? 'yellow' : 'black'}">{letter.letter}</div>
    {/each}
    </div>
    {/each}

    {#if !correct}
    <div class="wordRow">
    {#each word.split('') as letter}
      <div class="letter">{letter}</div>
    {/each}
    {#if (word.length < 5)}
    {#each Array.from({ length: 5 - word.length }) as _}
      <div class="letter"> </div>
    {/each}
    {/if}
    </div>
    {/if}
    {#if correct}
    <h1>Correct word!</h1>
    {/if}
  </main>
  
  <style>
    main {
      text-align: center;
      padding: 2rem;
    }
    .wordRow {
      display: flex;
      justify-content: center;
      align-items: center;
      margin: 2rem;
    }
    .letter {
      border: 4px solid black;
      width: 2rem;
      height: 2rem;
      margin: 0 0.5rem;
      display: flex;
      justify-content: center;
      align-items: center;
    }
  </style>
  <svelte:window on:keydown|preventDefault={onKeyDown} />