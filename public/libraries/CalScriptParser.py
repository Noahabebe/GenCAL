import re
from datetime import datetime, timedelta

class CalScriptParser:
    def __init__(self):
        self.events = []

    def parse(self, script):
        lines = script.split('\n')
        for line in lines:
            line = line.strip()
            if line.startswith("Event:"):
                self._parse_event(line)
            elif line.startswith("Repeat:"):
                self._parse_repeat(line)

    def _parse_event(self, line):
        pattern = r'Event: "(.*?)" -> Day: "(.*?)" @ Time: "(.*?)"( Duration: "(.*?)")?'
        match = re.match(pattern, line)
        if match:
            name, day, time, _, duration = match.groups()
            self.events.append({
                'name': name,
                'day': day,
                'time': time,
                'duration': duration if duration else "00:00"
            })

    def _parse_repeat(self, line):
        pattern = r'Repeat: "(.*?)" -> Every: "(.*?) Days" @ Time: "(.*?)"'
        match = re.match(pattern, line)
        if match:
            name, days, time = match.groups()
            self.events.append({
                'name': name,
                'repeat_every': int(days),
                'time': time
            })

    def get_events(self):
        return self.events

# Example Usage
if __name__ == "__main__":
    script = """
    Event: "Meeting" -> Day: "Monday" @ Time: "09:00"
    Event: "Workout" -> Day: "Wednesday" @ Time: "18:00"
    Repeat: "Daily Standup" -> Every: "1 Days" @ Time: "10:00"
    """
    parser = CalScriptParser()
    parser.parse(script)
    print(parser.get_events())
