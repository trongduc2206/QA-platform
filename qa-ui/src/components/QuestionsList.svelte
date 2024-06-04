<script>
    import { userUuid } from "../stores/stores.js";
    import Loading from "./Loading.svelte";
    export let courseId;

    import { onMount } from "svelte";

    let questions = [];
    let ws;
    let totalQuestion = 0;
    let loading = false;
    let completed = false;

    const loadQuestions = async () => {
        loading = true
        const currentNumOfQuestions = questions.length;
        const moreQuestions = await fetch(`/api/questions?limit=20&offset=${currentNumOfQuestions}&courseId=${courseId}`);
        const moreQuestionsJsonData = await moreQuestions.json();
        for(let i = 0; i < moreQuestionsJsonData.questions.length; i++) {
            questions.push(moreQuestionsJsonData.questions[i]);
        }
        await new Promise(resolve => setTimeout(resolve, 1500));
        questions = questions;
        loading = false;
    }

    const handleScroll = async () => {
        const { scrollTop, clientHeight, scrollHeight } = document.documentElement;

        if (scrollTop + clientHeight >= scrollHeight) {
            // Load more data when user scrolls near the bottom (within 20px)
            // loadData();
            if(questions.length >= totalQuestion) {
                // alert("All questions are loaded")
                completed = true;
                window.removeEventListener('scroll', handleScroll);
            } else {
                if(!loading) {
                    loadQuestions();
                }
            }
            console.log("the end of the screen")
            // questionInfoPromise = loadMoreAnswers();
        }
    }

    const getCourseInfo = async () => {
        questions = [];
        completed = false;
        window.addEventListener('scroll', handleScroll);
        const response = await fetch(`/api/course/${courseId}`);
        const jsonData = await response.json();
        console.log(jsonData);
        for(let i = 0; i < jsonData.questions.length; i++) {
            questions.push(jsonData.questions[i]);
        }
        console.log(questions)
        totalQuestion = jsonData.totalQuestion;
        return jsonData;
    }

    onMount(() => {
        const host = window.location.hostname;
            ws = new WebSocket("ws://" + host + ":7800/ws/question/" + courseId);

            ws.onmessage = (event) => {
                if(event.data !== "ping") {
                    console.log("ws event:")
                    console.log(event)
                    const newQuestion = event.data;
                    const newQuestionObj = JSON.parse(newQuestion)
                    if(newQuestionObj['user_uuid'] !== $userUuid) {
                        // courseInfoPromise = getCourseInfo();
                        questions = [newQuestionObj, ...questions];
                    }
                }
                // questions = [...questions, event.data];
            };
        window.addEventListener('scroll', handleScroll);
        return () => {
            if (ws.readyState === 1) {
                ws.close();
            };
            window.removeEventListener('scroll', handleScroll);;
        };
    });

    const closeConnection = () => {
        ws.close();
    };

    
    
    let question = "";
    

    const addQuestion = async () => {
        if (question.length == 0) {
            return;
        }

        const newQuestion = { 
            userUuid: $userUuid,
            courseId: courseId,
            question: question
         };

        const addQuestionResult = await fetch("/api/questions", {
            method: "POST",
            body: JSON.stringify(newQuestion),
        });

        const addQuestionResultJsonData = await addQuestionResult.json();
        console.log(addQuestionResultJsonData)
        if(addQuestionResultJsonData.result) {
            questions = [];
            courseInfoPromise = getCourseInfo();
        } else {
            alert("Please wait about a minute before posting another question")
        }
        question = "";

        
    };

    const upvoteQuestion = async(questionId) => {
        console.log(questionId)
        const upvoteData = {
            questionId: questionId,
            userUuid: $userUuid
        }
        console.log(upvoteData)
        const upvoteResponse = await fetch("/api/questions/upvote", {
            method: "POST",
            body: JSON.stringify(upvoteData),
        });
        const upvoteJsonData = await upvoteResponse.json();
        console.log(upvoteJsonData);
        if(upvoteJsonData.result) {
            questions = [];
            courseInfoPromise = getCourseInfo();
        } else {
            alert("You have already upvoted this question")
        }
        
    };



    let courseInfoPromise = getCourseInfo();
</script>
{#await courseInfoPromise}
{:then courseInfo}
<h3 class="ml-10 mb-5 text-xl">Course: {courseInfo.course.title}</h3>
{/await}
<div class="ml-10 mb-5">
    <h1 class="font-bold text-3xl">Add Question</h1>
    <input type="text" bind:value={question} class="border-black border-2"/>
    <button on:click={addQuestion} class="text-white bg-gray-800 hover:bg-gray-900 focus:outline-none focus:ring-4 focus:ring-gray-300 font-medium rounded-lg text-sm px-5 py-2.5 mb-2 dark:bg-gray-800 dark:hover:bg-gray-700 dark:focus:ring-gray-700 dark:border-gray-700">
        Add
    </button>
</div>
<div class="ml-10">
    {#await courseInfoPromise}
    <p>Loading questions</p>
    {:then courseInfo}
        <div class="flex flex-col">
            <h1 class="font-bold text-3xl">Questions</h1>

            <ul class="ml-10 mt-6 list-none">
                <!-- {#each courseInfo.questions  as question} -->
                {#each questions as question}
                <li class="mb-3">
                    <hr class="border-t-2 border-t-gray mb-5 ">
                    <div class="flex">
                        <div class="flex flex-col">
                            <button on:click={() => upvoteQuestion(question.id)} type="button" class="text-white bg-gray-800 hover:bg-gray-900 focus:outline-none focus:ring-4 focus:ring-gray-300 font-medium rounded-lg text-sm px-5 py-2.5 mb-2 dark:bg-gray-800 dark:hover:bg-gray-700 dark:focus:ring-gray-700 dark:border-gray-700">
                                Upvote
                            </button>
                            <div class="flex items-center justify-center ">
                                <div class="text-xl border-2 rounded-full h-10 w-10 flex items-center justify-center">
                                  <p>{question.upvotes}</p>  
                                </div>
                            </div>
                        </div>
                        <a href="/questions/{question.id}" class="ml-5 text-2xl hover:font-semibold hover:cursor-pointer">
                            {question.question}  
                        </a>
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
                <span class="text-xl">All questions are loaded</span>
            </div>
            {/if}
        </div>
    {/await}
</div>
  
  
  
  