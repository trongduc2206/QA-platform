<script>
    import { userUuid } from "../stores/stores.js";
    
    const getCourses = async () => {
        const response = await fetch(`/api/courses`);
        const jsonData = await response.json();
        console.log(jsonData);
        return jsonData;
    }   

    let coursesPromise = getCourses();
</script>

<div class="ml-10">
    <h1 class="text-3xl font-bold">Welcome to Q&A Platform</h1>
    <p class="text-xl mb-10">Select a course from the list below to start</p>
    {#await coursesPromise}
    <p>Loading courses</p>
    {:then courses}
        <div class="flex flex-col">
            <h1 class="font-bold text-3xl">Courses</h1>

            <ul class="ml-10 mt-6 list-disc">
                {#each courses as course}
                <li class="text-2xl hover:font-semibold hover:cursor-pointer mb-5">
                 <a href="/courses/{course.id}">
                    {course.title}  
                 </a>
                </li>
            {/each}
            </ul>
        </div>
    {/await}
</div>
  
  
  
  