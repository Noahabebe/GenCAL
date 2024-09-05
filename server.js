const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const { Groq } = require('groq-sdk');
require('dotenv').config();

const app = express();


app.use(cors({
    origin: 'https://gen-cal.vercel.app',
    methods: ['GET', 'POST'], 
    credentials: true 
}));

app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));


if (!process.env.GROQ_API_KEY) {
    throw new Error("The GROQ_API_KEY environment variable is not set.");
} 

// Groq API credentials
const client = new Groq({
    apiKey: process.env.GROQ_API_KEY
});

const MODEL = 'llama3-70b-8192';

async function compileCode(code, language) {
    try {
        const currentDate = new Date();
        const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone; // Detect the user's local timezone
        const options = {
            timeZone,
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false
        };
        
        // Format date-time with detected timezone
        const formattedDate = currentDate.toLocaleString('en-US', options);

        const response = await client.chat.completions.create({
            model: MODEL,
            messages: [
                { role: "system", content: `You are a gregorian calendar webapp that converts event-related sentences into JSON-formatted calendar data according to the current date and time is ${formattedDate}, the timezone is ${timeZone}` },
                { role: "user", content: `Only provide json no description. Convert the following data into JSON: ${code}. Date and Time is ${formattedDate}, the timezone is ${timeZone}. Example Format:
                {
                  "events": [
                    {
                      "id": 1,
                      "title": "Team Meeting",
                      "date": "2024-09-15",
                      "startTime": "09:00",
                      "endTime": "10:00",
                      "description": "Monthly team meeting to discuss project progress.",
                      "place": "Conference Room A",
                      "link": "https://zoom.us/j/123456789"
                    }
                  ]
                }`
                }
            ]
        });

        // Log raw response for debugging
        console.log('Raw response from Groq:', response.choices[0].message.content);
        
        return response.choices[0].message.content;
    } catch (error) {
        console.error('Error in Groq API:', error.response ? error.response.data : error.message);
        throw new Error('Failed to compile code');
    }
}

// Custom calendar rendering logic
const getISOWeekNumber = (date) => {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() + 4 - (d.getDay() || 7));
    return Math.ceil(((+d - +new Date(d.getFullYear(), 0, 1)) / 86400000 + 1) / 7);
};

function groupEventsByWeek(events) {
    return events.reduce((acc, event) => {
        const week = getISOWeekNumber(event.date);
        if (!acc[week]) acc[week] = [];
        acc[week].push(event);
        return acc;
    }, {});
}

function renderCalendar(events) {
    const groupedByWeek = groupEventsByWeek(events);
    return groupedByWeek;
}

app.post('/compile', async (req, res) => {
    const { code, language } = req.body;

    try {
        const compiledCode = await compileCode(code, language);

        let jsonOutput;
        try {
           
            jsonOutput = JSON.parse(compiledCode);
        } catch (e) {
            console.error('Error parsing JSON:', e.message);
            return res.status(400).json({
                error: "Failed to parse the compiled code as JSON",
                rawOutput: compiledCode
            });
        }

      
        if (jsonOutput.events) {
            const calendar = renderCalendar(jsonOutput.events);
            return res.json({ events: jsonOutput.events, calendar });
        } else {
            return res.json(jsonOutput);
        }
    } catch (error) {
        console.error('Error compiling code:', error.message);
        res.status(500).json({ error: 'Code compilation failed', details: error.message });
    }
});

const PORT = process.env.PORT || 443;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
