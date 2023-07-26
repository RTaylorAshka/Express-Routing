const express = require('express');
const app = express();
const ExpressError = require('./expressError');

function getNumbers(query) {
    if (!query['nums'] || query['nums'].length == 0) {
        return new Error('Input invalid: no numbers in query string detected. Please pass variable "nums" with numbers seperated by commas.')
    }

    const queryArray = query['nums'].split(',');
    const numbers = queryArray.map((n) => (isNaN(Number(n))) ? n = 'n/a' : n = Number(n));

    console.log(numbers)
    if (numbers.includes('n/a')) {
        const issue = numbers.indexOf('n/a')

        return new Error(`Input invalid: '${queryArray[issue]}' is not a number.`)
    }
    return numbers
}

app.get('/mean', (req, res) => {
    const numbers = getNumbers(req.query);
    if (numbers instanceof Error) {
        throw new ExpressError(numbers.message, 400)
    }
    const mean = (numbers.reduce((acc, num) => acc + num, 0)) / numbers.length;
    return res.send(`<h1>Mean: ${mean.toFixed(2)}</h1>`);
})

app.get('/median', function (req, res) {
    const numbers = getNumbers(req.query);
    if (numbers instanceof Error) {
        throw new ExpressError(numbers.message, 400)
    }
    numbers.sort((a, b) => a - b);
    const center = Math.floor(numbers.length / 2);

    let median;
    if (numbers.length % 2) {
        median = numbers[center];
    } else {
        median = (numbers[center - 1] + numbers[center]) / 2.0;
    }

    return res.send(`<h1>Median: ${median.toFixed(2)}</h1>`);
})

app.get('/mode', (req, res) => {
    const numbers = getNumbers(req.query);
    if (numbers instanceof Error) {
        throw new ExpressError(numbers.message, 400)
    }
    let occ = {};
    numbers.forEach((n) => occ[n] ? (occ[n]++) : (occ[n] = 1))
    let mode = occ[numbers[0]]
    for (let n in occ) {
        if (occ[mode] < occ[n]) mode = n;
    }

    return res.send(`<h1>Mode: ${mode}</h1>`)
})

app.use(function (req, res, next) {
    const err = new ExpressError("Page not found", 404);

    return next(err);
});


app.use(function (err, req, res, next) {
    res.status(err.status || 500);

    return res.json({
        error: err,
        message: err.message
    });
});

app.listen(3000, () => {
    console.log('Running on port 3000')
})


