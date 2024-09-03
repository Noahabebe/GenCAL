const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const { exec } = require('child_process');
const path = require('path');
const axios = require('axios');

const app = express();
app.use(bodyParser.json());
app.use(express.static('public'));

// Function to extract required Python packages from a library file
function extractPythonPackages(libraryFile) {
    const content = fs.readFileSync(libraryFile, 'utf8');
    const matches = content.match(/import (\w+)/g) || [];
    return Array.from(new Set(matches.map(m => m.replace('import ', ''))));
}

// Function to install packages via Code Converter API
async function installPackages(packages) {
    try {
        const response = await axios.post('https://code-converter-api.example.com/install', { packages });
        return response.data;
    } catch (error) {
        throw new Error(`Failed to install packages: ${error.message}`);
    }
}

app.post('/execute', async (req, res) => {
    const { language, code } = req.body;
    const tempFile = `temp_script`;
    let libraryFile;
    let command;

    try {
        switch (language) {
            case 'python':
                libraryFile = 'public/libraries/CalScriptParser.py';
                fs.writeFileSync(`${tempFile}.py`, code);
                const libraryCode = fs.readFileSync(libraryFile, 'utf8');
                fs.appendFileSync(`${tempFile}.py`, '\n' + libraryCode);

                // Extract packages needed by the library
                const packages = extractPythonPackages(libraryFile);
                if (packages.length > 0) {
                    await installPackages(packages);
                }

                command = `python3 ${tempFile}.py`;
                break;

            case 'java':
                libraryFile = 'public/libraries/CalScriptParser.java';
                fs.writeFileSync('Main.java', code);
                fs.writeFileSync('CalScriptParser.java', fs.readFileSync(libraryFile));
                command = 'javac Main.java CalScriptParser.java && java Main';
                break;

            case 'cpp':
                libraryFile = 'public/libraries/CalScriptParser.cpp';
                fs.writeFileSync('main.cpp', code);
                fs.writeFileSync('CalScriptParser.cpp', fs.readFileSync(libraryFile));
                command = 'g++ main.cpp CalScriptParser.cpp -o main && ./main';
                break;

            default:
                return res.status(400).json({ error: 'Unsupported language' });
        }

        // Execute the code
        exec(command, (error, stdout, stderr) => {
            if (error) {
                return res.status(500).json({ error: stderr });
            }
            res.json({ output: stdout });
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.listen(3004, () => {
    console.log('Server listening on port 3004');
});
