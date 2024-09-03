document.addEventListener('DOMContentLoaded', function () {
    const runButton = document.getElementById('run-button');
    runButton.addEventListener('click', executeCode);
});

function executeCode() {
    const language = document.getElementById('language-select').value;
    const code = document.getElementById('code-editor').value;
    const outputContent = document.getElementById('output-content');
    const errorContent = document.getElementById('error-content');

    // Clear previous outputs and errors
    outputContent.textContent = '';
    errorContent.textContent = '';

    // Send the code to the server for execution
    fetch('http://localhost:3004/execute', { // Adjust URL to your server's address
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ language, code })
    })
    .then(response => response.json())
    .then(data => {
        if (data.output) {
            outputContent.textContent = data.output;
        }
        if (data.error) {
            errorContent.textContent = data.error;
        }
    })
    .catch(error => {
        errorContent.textContent = `An error occurred: ${error}`;
    });
}
