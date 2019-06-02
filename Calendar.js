eventsData = null;
events = null;
moments = null;
noOfColumns = 0;
const colors = ["red", "green", "yellow", "blue", "pink", "purple"]
const calendar = document.getElementById('Calendar');

window.onload = function () {
    const exampleData = [{ start: 30, end: 120 }, { start: 70, end: 200 }, { start: 150, end: 230 }, { start: 190, end: 400 }];
    renderDay(exampleData);
}

function renderDay(data) {
    eventsData = data;
    clearDay();
    generateEvents();
    determineOverlaps();
    drawEvents();
}

function clearDay() {
    events = [];
    moments = [];
    while (calendar.firstChild)
        calendar.removeChild(calendar.firstChild);
}

function generateEvents() {
    for (i = 0; i < eventsData.length; i++) {
        let eventData = eventsData[i];
        let color = colors[i % colors.length];
        let top = eventData.start;
        events.push(new event(top, eventData.end, color));
    };
}

function determineOverlaps() {
    events.forEach(event => {
        moments.push(new moment(event.start, +1));
        moments.push(new moment(event.end, -1));
    });
    moments.sort((m1, m2) => m1.minute - m2.minute);
    events.forEach(event => {
        event.numberOfNeighbours = 0;
        event.maxNumberOfNeighbours = 0;
        let neighbourCounter = 0;
        for (i = 0; i < moments.length; i++) {
            let moment = moments[i];
            neighbourCounter += moment.eventChange;
            if (moment.minute >= event.start & moment.minute < event.end) {
                event.maxNumberOfNeighbours = Math.max(event.maxNumberOfNeighbours, neighbourCounter);
                noOfColumns = Math.max(event.maxNumberOfNeighbours);
            }
        }
        console.log(event.maxNumberOfNeighbours);
    });
}

function drawEvents() {
    for (column = 0; column < noOfColumns; column++) {
        let lastDrawnMoment = 0;
        events.forEach(event => {

            if (event.drawn == false & event.start >= lastDrawnMoment) {
                let widthPercent = 100 / noOfColumns;
                event.style.width = widthPercent + "%";
                console.log(column);
                event.style.left = column * widthPercent + "%";
                event.drawn = true;
                calendar.appendChild(event);
                lastDrawnMoment = event.end;
            }
        });
    }
}

function event(start, end, color) {
    //Todo: Validate that start is always smaller than end
    //Todo: Validate that event falls entirely within work hours
    let newElement = document.createElement('div');

    newElement.start = start;
    newElement.style.top = start + "px";

    newElement.end = end;
    newElement.style.height = end - start + "px";

    newElement.className = 'event';
    newElement.style.borderColor = color;
    newElement.style.borderWidth = "10px";
    newElement.style.borderRadius = "20px";

    newElement.drawn = false;
    addEventText(newElement);
    return newElement;
};

function moment(minute, change) {
    return { minute: minute, eventChange: change }
}

function addEventText(event) {
    let startH = Math.floor(event.start / 60) + 9;
    let startM = event.start % 60;
    let endtH = Math.floor(event.end / 60) + 9;
    let endtM = event.end % 60;
    let eventText = document.createTextNode('Event : ' + startH + ':' + startM + ' - ' + endtH + ':' + endtM);
    event.appendChild(eventText);
}
