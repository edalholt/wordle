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
      {#each prevWords as word}
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
      background-image: url('waveBg.svg');
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

    @media only screen and (max-width: 600px) {
      main {
        margin-right: 0;
      }
    }

    #game {
      margin-top: 5vh;
      margin-bottom: 60vh;
    }
    .wordRow {
      display: flex;
      justify-content: center;
      align-items: center;
      margin: 2rem;
    }
    .letter {
      border: 4px solid #689cc5;
      font-family: Verdana, Geneva, Tahoma, sans-serif;
      color: white;
      width: 2rem;
      height: 2rem;
      margin: 0 0.5rem;
      display: flex;
      justify-content: center;
      align-items: center;
    }
  </style>
  <svelte:window on:keydown|preventDefault={onKeyDown} />