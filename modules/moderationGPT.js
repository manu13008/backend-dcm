const config = [
    {
        criterionName: 'hate',
        isUsed: true,
        useScore: false,
        score: 0.5
    },
    {
        criterionName: 'violence/graphic',
        isUsed: true,
        useScore: false,
        score: 0.5
    }
]

const criteria = config.filter((criterion) => {return criterion.isUsed})


async function fetchGPT(string){
    const result = await  fetch('https://api.openai.com/v1/moderations', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.GPT_SECRET}`
        },
        body: JSON.stringify({input: string})
    })
    .then(response => response.json())
    return result.results
}



async function moderationEvaluate(content) {
    const gptAnalysis = await fetchGPT(content)
    let result = {toCensor: false, criteria: []}
    criteria.forEach((criterion) => {
        const isCriterionFlagged = !criterion.useScore && gptAnalysis[0].categories[criterion.criterionName]
        const isScoreFlagged = criterion.useScore && gptAnalysis[0].category_scores[criterion.criterionName] >= criterion.score
        const isFlagged = isCriterionFlagged || isScoreFlagged
        isFlagged && result.criteria.push(criterion.criterionName)
    })
    if(result.criteria.length > 0) {result.toCensor = true}
    return result
}

module.exports = { moderationEvaluate }
