import java.util.ArrayList;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

class Event {
    String name;
    String day;
    String time;
    String duration;
    int repeatEvery;

    Event(String name, String day, String time, String duration) {
        this.name = name;
        this.day = day;
        this.time = time;
        this.duration = duration;
    }

    Event(String name, int repeatEvery, String time) {
        this.name = name;
        this.repeatEvery = repeatEvery;
        this.time = time;
    }

    @Override
    public String toString() {
        if (repeatEvery > 0) {
            return "Repeat Event: " + name + " every " + repeatEvery + " days at " + time;
        }
        return "Event: " + name + " on " + day + " at " + time + " for " + duration;
    }
}

public class CalScriptParser {
    private List<Event> events;

    public CalScriptParser() {
        events = new ArrayList<>();
    }

    public void parse(String script) {
        String[] lines = script.split("\n");
        for (String line : lines) {
            line = line.trim();
            if (line.startsWith("Event:")) {
                parseEvent(line);
            } else if (line.startsWith("Repeat:")) {
                parseRepeat(line);
            }
        }
    }

    private void parseEvent(String line) {
        Pattern pattern = Pattern.compile("Event: \"(.*?)\" -> Day: \"(.*?)\" @ Time: \"(.*?)\"( Duration: \"(.*?)\")?");
        Matcher matcher = pattern.matcher(line);
        if (matcher.find()) {
            String name = matcher.group(1);
            String day = matcher.group(2);
            String time = matcher.group(3);
            String duration = matcher.group(5) != null ? matcher.group(5) : "00:00";
            events.add(new Event(name, day, time, duration));
        }
    }

    private void parseRepeat(String line) {
        Pattern pattern = Pattern.compile("Repeat: \"(.*?)\" -> Every: \"(\\d+) Days\" @ Time: \"(.*?)\"");
        Matcher matcher = pattern.matcher(line);
        if (matcher.find()) {
            String name = matcher.group(1);
            int days = Integer.parseInt(matcher.group(2));
            String time = matcher.group(3);
            events.add(new Event(name, days, time));
        }
    }

    public List<Event> getEvents() {
        return events;
    }

    public static void main(String[] args) {
        String script = """
        Event: "Meeting" -> Day: "Monday" @ Time: "09:00"
        Repeat: "Daily Standup" -> Every: "1 Days" @ Time: "10:00"
        """;

        CalScriptParser parser = new CalScriptParser();
        parser.parse(script);
        for (Event event : parser.getEvents()) {
            System.out.println(event);
        }
    }
}
