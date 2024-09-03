document.addEventListener('DOMContentLoaded', function () {
    const events = document.querySelectorAll('.event');
    const calendar = document.getElementById('calendar');

    // Enable dragging for each event
    events.forEach(event => {
        event.draggable = true;
        event.addEventListener('dragstart', dragStart);
    });

    // Enable drop zones in the calendar
    calendar.addEventListener('dragover', dragOver);
    calendar.addEventListener('drop', dropEvent);

    function dragStart(e) {
        e.dataTransfer.setData('text/plain', e.target.innerText);
    }

    function dragOver(e) {
        e.preventDefault(); // Allow the drop
    }

    function dropEvent(e) {
        e.preventDefault();
        const data = e.dataTransfer.getData('text/plain');
        const newEvent = document.createElement('div');
        newEvent.className = 'event';
        newEvent.innerText = data;
        calendar.appendChild(newEvent);
    }

    document.getElementById('ai-extract-button').onclick = function () {
        alert("Simulating AI Extraction for events from image!");
        // Future: Implement AI extraction of events from image/file
    };
});
