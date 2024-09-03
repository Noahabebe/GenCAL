#include <iostream>
#include <vector>
#include <regex>
#include <string>

struct Event {
    std::string name;
    std::string day;
    std::string time;
    std::string duration;
    int repeatEvery = 0;

    void print() {
        if (repeatEvery > 0) {
            std::cout << "Repeat Event: " << name << " every " << repeatEvery << " days at " << time << std::endl;
        } else {
            std::cout << "Event: " << name << " on " << day << " at " << time << " for " << duration << std::endl;
        }
    }
};

class CalScriptParser {
private:
    std::vector<Event> events;

public:
    void parse(const std::string& script) {
        std::regex eventPattern("Event: \"(.*?)\" -> Day: \"(.*?)\" @ Time: \"(.*?)\"( Duration: \"(.*?)\")?");
        std::regex repeatPattern("Repeat: \"(.*?)\" -> Every: \"(\\d+) Days\" @ Time: \"(.*?)\"");
        std::smatch match;

        std::istringstream stream(script);
        std::string line;
        while (std::getline(stream, line)) {
            line = std::regex_replace(line, std::regex("^ +| +$|( ) +"), "$1"); // trim

            if (std::regex_search(line, match, eventPattern)) {
                Event event = {match[1], match[2], match[3], match[5].str().empty() ? "00:00" : match[5]};
                events.push_back(event);
            } else if (std::regex_search(line, match, repeatPattern)) {
                Event event = {match[1], "", match[3], "00:00", std::stoi(match[2])};
                events.push_back(event);
            }
        }
    }

    std::vector<Event> getEvents() {
        return events;
    }
};

int main() {
    std::string script = R"(
    Event: "Meeting" -> Day: "Monday" @ Time: "09:00"
    Repeat: "Daily Standup" -> Every: "1 Days" @ Time: "10:00"
    )";

    CalScriptParser parser;
    parser.parse(script);
    auto events = parser.getEvents();
    for (auto& event : events) {
        event.print();
    }

    return 0;
}
