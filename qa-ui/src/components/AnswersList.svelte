<script>
    import { userUuid } from "../stores/stores.js";
    import Loading from "./Loading.svelte";
    export let questionId;

    import { onMount } from "svelte";
    let ws;
    let answers = [];
    let totalAnswer = 0;
    let courseId = "";
    let loading = false;
    let completed = false;

    const loadAnswers = async () => {
        loading = true;
        console.log("load more answers");
        console.log(answers)
        const currentNumOfAnswers = answers.length;
        const moreAnswers = await fetch(`/api/answers?limit=20&questionId=${questionId}&offset=${currentNumOfAnswers}`);
        const moreAnswersJsonData = await moreAnswers.json();
        for(let i = 0; i < moreAnswersJsonData.answers.length; i++) {
                answers.push(moreAnswersJsonData.answers[i]);
        }
        
        await new Promise(resolve => setTimeout(resolve, 1500));
        answers = answers;
        loading = false;
    }

    const handleScroll = async () => {
        const { scrollTop, clientHeight, scrollHeight } = document.documentElement;

        if (scrollTop + clientHeight >= scrollHeight) {
            // Load more data when user scrolls near the bottom (within 20px)
            // loadData();
            if(answers.length >= totalAnswer && !loading) {
                completed = true;
                window.removeEventListener('scroll', handleScroll);
                // alert("All answers are loaded")
            } else {
                if(!loading) {
                    loadAnswers();
                }
            }
            console.log("the end of the screen")
            // questionInfoPromise = loadMoreAnswers();
        }
    }

    const getQuestionInfo = async () => {
        answers = [];
        completed = false;
        window.addEventListener('scroll', handleScroll);
        const response = await fetch(`/api/question/${questionId}`);
        const jsonData = await response.json();
        console.log(answers);
        console.log(jsonData);
        for(let i = 0; i < jsonData.answers.length; i++) {
            answers.push(jsonData.answers[i]);
        }
        console.log(answers)
        totalAnswer = jsonData.totalAnswer;

        courseId = jsonData.question['course_id'];
        return jsonData;
    }

    onMount(() => {
        const host = window.location.hostname;
            ws = new WebSocket("ws://" + host + ":7800/ws/answer/" + questionId);

            ws.onmessage = (event) => {
                console.log("ws event:")
                
                // const addingUserUuid = event.data;
                if(event.data !== "ping") {
                    const newAnswer = event.data
                    console.log(newAnswer);
                    const newAnswerObj = JSON.parse(newAnswer)
                    console.log(newAnswerObj)
                    console.log($userUuid)
                    if(newAnswerObj['user_uuid'] && newAnswerObj['user_uuid'] !== $userUuid) {
                    // if(addingUserUuid !== $userUuid) {
                        console.log("add new answer from ws " + newAnswerObj)
                        // questionInfoPromise = getQuestionInfo();
                        // answers.push(newAnswerObj);
                        // answers = answers;
                        // addAnswerToRender(newAnswerObj)
                        answers = [ newAnswerObj, ...answers,];
                        console.log(answers);
                    }
                }
                // answers = [...questions, event.data];
            };

            ws.onclose = (e) => {
                console.log("ws is closed");
            }
        window.addEventListener('scroll', handleScroll);
        return () => {
            if (ws.readyState === 1) {
                console.log("close ws");
                ws.close();
            };
            window.removeEventListener('scroll', handleScroll);
        };
    });

    const closeConnection = () => {
        ws.close();
    };
    
    let answer = "";

    const addAnswer = async () => {
        if (answer.length == 0) {
            return;
        }

        const newAnswer = { 
            userUuid: $userUuid,
            questionId: questionId,
            answer: answer
         };

        const addAnswerResponse = await fetch("/api/answers", {
            method: "POST",
            body: JSON.stringify(newAnswer),
        });

        const addAnswerResponseJsonData = await addAnswerResponse.json();
        if(addAnswerResponseJsonData.result) {
            answers = []
            questionInfoPromise = getQuestionInfo();
            // answerPromise = loadAnswers();
        } else {
            alert("Please wait about a minute before posting another answer")
        }

        answer = "";

        
    };

    const upvoteAnswer = async(answerId) => {
        console.log(answerId)
        const upvoteData = {
            answerId: answerId,
            userUuid: $userUuid
        }
        console.log(upvoteData)
        const upvoteResponse = await fetch("/api/answers/upvote", {
            method: "POST",
            body: JSON.stringify(upvoteData),
        });
        const upvoteJsonData = await upvoteResponse.json();
        console.log(upvoteJsonData);
        if(upvoteJsonData.result) {
            answers = [];
            questionInfoPromise = getQuestionInfo();
        } else {
            alert("You have already upvoted this answer")
        }
        
    };

    let questionInfoPromise = getQuestionInfo();

    // let answerPromise = loadAnswers();
</script>


{#await questionInfoPromise}
{:then questionInfo}
<a href="/courses/{courseId}" class=" ml-10 mb-10 text-xl hover:underline hover:font-bold">Back to course</a>
<h3 class="ml-10 mb-5 text-3xl font-bold">Question: {questionInfo.question.question}</h3>
{/await}
<div class="ml-10 mb-5">
    <h1 class="font-bold text-3xl">Add Answer</h1>
    <input type="text" bind:value={answer} class="border-black border-2"/>
    <button on:click={addAnswer} class="text-white bg-gray-800 hover:bg-gray-900 focus:outline-none focus:ring-4 focus:ring-gray-300 font-medium rounded-lg text-sm px-5 py-2.5 mb-2 dark:bg-gray-800 dark:hover:bg-gray-700 dark:focus:ring-gray-700 dark:border-gray-700">
        Add
    </button>
</div>
<div class="ml-10">
    {#await questionInfoPromise}
    <p>Loading answers</p>
    {:then questionInfo}
        <div class="flex flex-col">
            <h1 class="font-bold text-3xl">Answers</h1>

            <ul class="ml-10 mt-6 list-none">
                <!-- {#each questionInfo.answers as answer} -->
                {#each answers as answer}
                <li class="mb-3">
                    <hr class="border-t-2 border-t-gray mb-5 ">
                    <div class="flex">
                        <div class="flex flex-col">
                            <button on:click={() => upvoteAnswer(answer.id)} type="button" class="text-white bg-gray-800 hover:bg-gray-900 focus:outline-none focus:ring-4 focus:ring-gray-300 font-medium rounded-lg text-sm px-5 py-2.5 mb-2 dark:bg-gray-800 dark:hover:bg-gray-700 dark:focus:ring-gray-700 dark:border-gray-700">
                                Upvote
                            </button>
                            <div class="flex items-center justify-center ">
                                <div class="text-xl border-2 rounded-full h-10 w-10 flex items-center justify-center">
                                  <p>{answer.upvotes}</p>  
                                </div>
                            </div>
                        </div>
                        <!-- <a href="/questions/{answer.id}" class="ml-5 text-2xl hover:font-semibold hover:cursor-pointer">
                            {answer.answer}  
                        </a> -->
                        <p class="ml-5 text-2xl">
                            {answer.answer}
                        </p>
                    </div>    
                </li>
            {/each}
            </ul>
            {#if loading}
            <div class="m-4 flex items-center justify-center">
            <Loading/>
            </div>
            {/if}
            {#if completed && !loading}
            <div class="m-4 flex items-center justify-center">
                <span class="text-xl">All answers are loaded</span>
            </div>
            {/if}
        </div>
    {/await}
</div>
  
  
  
  