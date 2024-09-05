document.addEventListener('DOMContentLoaded', function () {
    const runButton = document.getElementById('run-button');
    const printButton = document.getElementById('print-button');
    const tableColorSelect = document.getElementById('table-color-select');
    const outputContent = document.getElementById('output-content');
    const calendarContent = document.getElementById('calendar-content');
    const uploadImageButton = document.getElementById('upload-image'); 
   

    runButton.addEventListener('click', executeCode);
    printButton.addEventListener('click', printCalendar);
    tableColorSelect.addEventListener('change', function () {
        const table = document.querySelector('.calendar-table');
        if (table) {
            table.style.backgroundColor = this.value;
        }
    });

   
    uploadImageButton.addEventListener('change', handleFileUpload);

    function handleFileUpload(event) {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function (e) {
                const fileContent = e.target.result;

                
                Tesseract.recognize(
                    fileContent,
                    'eng',
                    {
                        logger: (m) => console.log(m),
                    }
                ).then(({ data: { text } }) => {
                    console.log(text); // This is the extracted text

                    // Send extracted text to AI for processing
                    analyzeExtractedText(text);
                });
            };

            reader.readAsDataURL(file);
        }
    }

    function analyzeExtractedText(text) {
        const language = 'english';
        fetch('https://wwww.gencal.noahabebe.com/compile', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ language, code: text }) // Text sent for AI analysis
        })
        .then(response => response.json())
        .then(data => {
            if (Array.isArray(data.events)) {
                const tableHtml = jsonToTable(data.events);
                outputContent.innerHTML = tableHtml;
                applyTableFeatures();
            }
            if (data.calendar) {
                const calendarHtml = renderCalendar(data.calendar);
                calendarContent.innerHTML = calendarHtml;
            }
        })
        .catch(error => {
            console.error('Error processing extracted text:', error);
        });
    }

    document.getElementById('download-ics').addEventListener('click', function () {
        const language = document.getElementById('language-select').value;
        const code = document.getElementById('code-editor').value;
        // Fetch event data and generate ICS file
        fetch('https://wwww.gencal.noahabebe.com/compile', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ language, code }) 
        })
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            const contentType = response.headers.get('Content-Type');
            if (!contentType || !contentType.includes('application/json')) {
                throw new Error(`Expected JSON but received ${contentType}`);
            }
            return response.json();
        })
        .then(data => {
            if (!data.events) {
                throw new Error('No events data found');
            }
            const events = data.events;
            const icsFileContent = jsonToICS(events);
            const blob = new Blob([icsFileContent], { type: 'text/calendar' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'calendar.ics';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url); // Clean up URL object
        })
        .catch(error => {
            console.error('Error fetching events for ICS:', error);
        });
    });



    function executeCode() {
        const language = document.getElementById('language-select').value;
        const code = document.getElementById('code-editor').value;
        const errorContent = document.getElementById('error-content');

        outputContent.innerHTML = '';
        errorContent.innerHTML = '';

        fetch('https://wwww.gencal.noahabebe.com/compile', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ language, code })
        })
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            if (Array.isArray(data.events)) {
                const tableHtml = jsonToTable(data.events);
                outputContent.innerHTML = tableHtml;
                applyTableFeatures();
            }
            if (data.calendar) {
                const calendarHtml = renderCalendar(data.calendar);
                calendarContent.innerHTML = calendarHtml;
            }
            if (data.error) {
                errorContent.textContent = data.error;
            }
        })
        .catch(error => {
            errorContent.textContent = `An error occurred: ${error.message}`;
        });
    }

    function jsonToTable(events) {
        if (!Array.isArray(events) || events.length === 0) {
            return '<p>No events available</p>';
        }

        const table = document.createElement('table');
        table.classList.add('calendar-table'); // Add this line to set the class
        table.style.width = '100%';
        table.setAttribute('border', '1');

        // Create table header
        const thead = table.createTHead();
        const headerRow = thead.insertRow();
        ['Title', 'Date', 'Start Time', 'End Time', 'Description', 'Place', 'Link'].forEach(header => {
            const th = document.createElement('th');
            th.textContent = header;
            headerRow.appendChild(th);
        });

        // Create table body
        const tbody = table.createTBody();
        events.forEach(event => {
            const row = tbody.insertRow();
            ['title', 'date', 'startTime', 'endTime', 'description', 'place', 'link'].forEach(key => {
                const cell = row.insertCell();
                cell.textContent = event[key] || 'N/A';
            });
        });

        return table.outerHTML;
    }
    function renderCalendar(calendar) {
        if (!calendar || typeof calendar !== 'object' || Object.keys(calendar).length === 0) {
            return '<div class="alert alert-warning" role="alert">No events available</div>';
        }
    
        let htmlContent = '<div class="container"><h2>Event Calendar</h2>';
    
        Object.entries(calendar).forEach(([week, events]) => {
            htmlContent += `<div class="row mb-4"><div class="col-md-12"><h4>Week ${week}</h4>`;
            htmlContent += '<div class="table-responsive"><table class="table table-bordered table-calendar"><thead><tr>';
            htmlContent += '<th>Monday</th><th>Tuesday</th><th>Wednesday</th><th>Thursday</th><th>Friday</th><th>Saturday</th><th>Sunday</th>';
            htmlContent += '</tr></thead><tbody><tr>';
    
            const weekEvents = new Array(7).fill(null);
    
            events.forEach(event => {
                const eventDate = new Date(event.date);
                const dayOfWeek = eventDate.getDay();
                weekEvents[dayOfWeek === 0 ? 6 : dayOfWeek] = event;
            });
    
            weekEvents.forEach(event => {
                if (event) {
                    htmlContent += `
                        <td class="event-details">
                            <strong class="event-title">${event.date}</strong><br>
                            <strong>Title:</strong> ${event.title}<br>
                            <strong>Description:</strong> ${event.description || 'N/A'}<br>
                            <strong>Time:</strong> ${event.startTime || 'N/A'} - ${event.endTime || 'N/A'}<br>
                            <strong>Place:</strong> ${event.place || 'N/A'}<br>
                            ${event.link ? `<a href="${event.link}" target="_blank">Link</a>` : ''}
                        </td>`;
                } else {
                    htmlContent += '<td></td>';
                }
            });
    
            htmlContent += '</tr></tbody></table></div></div></div>';
        });
    
        htmlContent += '</div>';
    
        return htmlContent;
    }
    
    
    function applyTableFeatures() {
        const table = document.querySelector('.calendar-table'); // Look for table with class '.calendar-table'

        if (!table) {
            console.error('Table not found. Cannot apply table features.');
            return;
        }

        const rows = table.querySelectorAll('tbody tr');

        rows.forEach(row => {
            row.addEventListener('dragstart', dragStart);
            row.addEventListener('dragover', dragOver);
            row.addEventListener('drop', drop);
        });

        const fontSelect = document.getElementById('font-select');
        const colorSelect = document.getElementById('color-select');

        fontSelect.addEventListener('change', function() {
            table.style.fontFamily = this.value;
        });

        colorSelect.addEventListener('change', function() {
            table.style.color = this.value;
        });
    }

    function dragStart(e) {
        e.dataTransfer.setData('text/plain', e.target.rowIndex);
    }

    function dragOver(e) {
        e.preventDefault();
    }

    function drop(e) {
        e.preventDefault();
        const draggedRowIndex = e.dataTransfer.getData('text/plain');
        const targetRow = e.target.closest('tr');
        const tableBody = targetRow.closest('tbody');
        const draggedRow = tableBody.rows[draggedRowIndex - 1];

        if (draggedRow && draggedRow !== targetRow) {
            tableBody.insertBefore(draggedRow, targetRow.nextSibling);
        }
    }

    function printCalendar() {
        window.print();
    }

    function jsonToICS(events) {
        let icsContent = `BEGIN:VCALENDAR\r\nVERSION:2.0\r\nPRODID:-//GenCAL//EN\r\nCALSCALE:GREGORIAN\r\nMETHOD:PUBLISH\r\n`;
        
        events.forEach(event => {
            const startDateTime = new Date(`${event.date}T${event.startTime}`);
            const endDateTime = new Date(`${event.date}T${event.endTime}`);
            
            icsContent += `
BEGIN:VEVENT\r\n
UID:${event.id || new Date().getTime()}@noahabebe.com\r\n
SUMMARY:${event.title || 'No Title'}\r\n
DESCRIPTION:${event.description || ''}\r\n
DTSTAMP:${formatDateTime(new Date())}\r\n
DTSTART:${formatDateTime(startDateTime)}\r\n
DTEND:${formatDateTime(endDateTime)}\r\n
LOCATION:${event.place || ''}\r\n
URL:${event.link || ''}\r\n
END:VEVENT\r\n
    `;
        });
        
        icsContent += 'END:VCALENDAR\r\n';
        return icsContent;
    }
    
    function formatDateTime(date) {
        const currentDate = new Date();
        const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
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
        
        
        const formattedDate = currentDate.toLocaleString('en-US', options);
        const formattedDateICS = formattedDate.replace(/[\/,:]/g, '').replace(' ', 'T') + 'Z'; 
        return formattedDateICS; 
    }
    
    
});
