// const config = [
//     {
//         criterionName: 'hate',
//         isUsed: true,
//         useScore: false,
//         score: 0.5
//     },
//     {
//         criterionName: 'violence/graphic',
//         isUsed: true,
//         useScore: false,
//         score: 0.5
//     }
// ]


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

async function fetchConfig() {
    const result = await fetch('http://localhost:3000/config/modCriteria').then(response => response.json())
    return result.value
}

async function moderationEvaluate(content) {
    const gptAnalysis = await fetchGPT(content)
    const config = await fetchConfig()
    const criteria = config.filter((criterion) => {return criterion.isUsed})
    let result = {toCensor: false, criteria: []}
    criteria.forEach((criterion) => {
        const gptCriterionFlagged = gptAnalysis[0].categories[criterion.criterionName]
        const gptScore = Number(gptAnalysis[0].category_scores[criterion.criterionName])

        const isCriterionFlagged = criterion.isUsed && !criterion.useScore && gptCriterionFlagged
        const isScoreFlagged = criterion.useScore && (gptScore >= Number(criterion.score))
        const isFlagged = isCriterionFlagged || isScoreFlagged
        
        isFlagged && result.criteria.push(criterion.criterionName)
    })
    if(result.criteria.length > 0) {result.toCensor = true}
    return result
}

module.exports = { moderationEvaluate }
