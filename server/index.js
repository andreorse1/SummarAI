const express = require('express');
const axios = require('axios');
const fs = require('fs');
const fileUploader = require('express-fileupload');
const pdfParse = require('pdf-parse');
const bodyParser = require('body-parser');
const { OpenAI } = require('openai');

const app = express();
app.use(cors());
const port = 3000;

app.use(bodyParser.json());
app.use(express.static('public'));
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});
app.use(fileUploader());

app.post('/read-pdf', (request, response) => {
    if (!request.files && !request.files.pdfFile) {
        response.status(400);
        response.end;
    }

    pdfParse(request.files.pdfFile).then(result => {
        response.send(result.text)
    })
});

app.post('/generate-summary', async (req, res) => {
    const userInput = req.body.userInput;
    const lingua = req.body.lingua;
    const nParole = req.body.nParole;
    const percRiassunto = req.body.percRiassunto;
    const tipoRiassunto = req.body.tipoRiassunto;
    const keyword = req.body.keyword;

    var system;
    switch (tipoRiassunto) {
        case "1":
            system = "Make an informative summary of the text provided";
            break;
        case "2":
            system = "Make an analytical summary of the text provided";
            break;
        case "3":
            system = "Make a narrative summary of the text provided";
            break;
        case "4":
            system = "Make a descriptive summary of the text provided";
            break;
        case "5":
            system = "Make an explanatory summary of the text provided";
            break;
        case "6":
            system = "Make a critical summary of the text provided";
            break;
        default:
            system = "Summarize the provided text";
            break;
    }

    switch (lingua) {
        case "en":
            system += " in English";
            break;
        case "it":
            system += " in Italian";
            break;
        case "sp":
            system += " in Spanish";
            break;
        case "fr":
            system += " in French";
            break;
        case "ge":
            system += " in German";
            break;
        default:
            system += " in the original language";
            break;
    }

    switch (nParole) {
        case "100":
            system += " in less than 100 words";
            break;
        case "100-200":
            system += " in 100-200 words";
            break;
        case "200-300":
            system += " in 200-300 words";
            break;
        case "300-400":
            system += " in 300-400 words";
            break;
        case "400-500":
            system += " in 400-500 words";
            break;
        case "500":
            system += " in 500 or more words";
            break;
        default:
            system += "";
            break;
    }

    switch (percRiassunto) {
        case "10":
            system += " using 10% of the words in the original";
            break;
        case "20":
            system += " using 20% of the words in the original";
            break;
        case "30":
            system += " using 30% of the words in the original";
            break;
        case "40":
            system += " using 40% of the words in the original";
            break;
        case "50":
            system += " using 50% of the words in the original";
            break;
        case "60":
            system += " using 60% of the words in the original";
            break;
        case "70":
            system += " using 70% of the words in the original";
            break;
        case "80":
            system += " using 80% of the words in the original";
            break;
        case "90":
            system += " using 90% of the words in the original";
            break;
        default:
            system += "";
            break;
    }

    if (keyword)
        system += "and add some keywords (preceded by #) inside or at the end of the summary";

    const completion = await openai.chat.completions.create({
        messages: [
            {
                "role": "system",
                "content": system,
            },
            {
                "role": "user",
                "content": userInput,
            }
        ],
        model: "gpt-3.5-turbo",
    });

    res.json({ completion: completion.choices[0].message.content });
});

app.post('/generate-image', async (req, res) => {
    const text = req.body.summary;

    const response = await openai.images.generate({
        model: "dall-e-3",
        prompt: text,
        n: 1,
        size: "1024x1024",
    });

    const image_url = response.data;
    res.json({ completion: image_url });

});

app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    next();
});

// Gestore di route per la richiesta del feed RSS
app.post('/rss', async (req, res) => {
    const rssFeedUrl = req.body.url;
    console.log(rssFeedUrl);
    //const s = 'https://corrieredibologna.corriere.it/notizie/cronaca/24_aprile_10/vittime-centrale-suviana-chi-erano-889216ee-5fd9-423c-bcc2-36ee4a2a1xlk.shtml';


    try {
        const response = await fetch(rssFeedUrl);
        const xmlData = await response.text();
        res.send(xmlData);
    } catch (error) {
        console.error('Si Ã¨ verificato un errore durante il recupero del feed RSS:', error);
        res.status(500).send('Errore durante il recupero del feed RSS.');
    }
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
