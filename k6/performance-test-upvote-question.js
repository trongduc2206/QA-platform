import http from "k6/http";

export const options = {
  duration: "10s",
  vus: 10,
  summaryTrendStats: ["avg", "p(99)"],
};

export default function () {
    for(let id=1; id <= 9; id++) {
        http.post("http://localhost:7800/api/questions/upvote",
            JSON.stringify({
                userUuid: `5929f943-ef36-43e6-9a3f-c8085602343${id}`,
                questionId: 1,
            })
        );
    }
}

