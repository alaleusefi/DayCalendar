eventsData = null;
events = null;
moments = null;
noOfColumns = 0;
const colours = ["#6ca0dc", "#dbb2d1", "#F5B7B1", "#EDBB99", "#D1F2EB", "#A9CCE3"]
const calendar = document.getElementById('Calendar');

window.onload = function () {
    // const exampleData = [{ start: 30, end: 120 }, { start: 70, end: 200 }, { start: 150, end: 230 }, { start: 190, end: 400 }];
    // const exampleData = [{start:30, end:120}, {start:120, end:200}, {start: 290, end:400}, {start: 10, end: 540}];
    const exampleData = [{ start: 30, end: 120 }, { start: 120, end: 290 }, { start: 240, end: 400 }, { start: 10, end: 540 }, { start: 10, end: 540 }];
    //const exampleData = [{ start: 130, end: 120 }, { start: 120, end: 290 }, { start: 240, end: 400 }, { start: 10, end: 540 }, { start: 10, end: 540 }];
    // const exampleData = [{ start: 30, end: 600 }, { start: 120, end: 290 }, { start: 240, end: 400 }, { start: 10, end: 540 }, { start: 10, end: 540 }];
    //const exampleData = [{ start: -30, end: 60 }, { start: 120, end: 290 }, { start: 240, end: 400 }, { start: 10, end: 540 }, { start: 10, end: 540 }];
    // const exampleData = [{ start: 50, end: 120 }, { start: 120, end: 290 }, { start: 240, end: 400 }, { start: 10, end: 40 }, { start: 10, end: 40 }];
    renderDay(exampleData);
}

function renderDay(data) {
    eventsData = data;
    clearDay();
    generateEvents();
    generateEventDemarcationMoments();
    determineNeighbours();
    sortEventsByNumberOfNeighbours();
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
        let color = colours[i % colours.length];
        let top = eventData.start;
        let newEvent = null;
        try {
            newEvent = new event(top, eventData.end, color);
            newEvent.number = i;
            addEventText(newEvent);
            events.push(newEvent);
        }
        catch (err) {
            window.alert(err);
        }
    };
}

function generateEventDemarcationMoments() {
    events.forEach(event => {
        moments.push(new moment(event.start, +1, event));
        moments.push(new moment(event.end, -1, event));
    });
    moments.sort((m1, m2) => m1.minute - m2.minute);
}

function determineNeighbours() {
    events.forEach(event => {
        event.maxNumberOfNeighbours = 0;
        let neighbourCounter = 0;

        for (i = 0; i < moments.length; i++) {
            let moment = moments[i];
            if (moment.minute < event.end) {
                neighbourCounter += moment.eventChange;
                if (moment.minute >= event.start)
                    event.maxNumberOfNeighbours = Math.max(event.maxNumberOfNeighbours, neighbourCounter);
            }
        }
        event.maxNumberOfNeighbours--;

        events.forEach(neighbouringEvent => {
            if (neighbouringEvent.end > event.start & event.end > neighbouringEvent.start & event != neighbouringEvent)
                event.neighbours.push(neighbouringEvent);
        });
    });
}

function sortEventsByNumberOfNeighbours() {
    events.sort((e1, e2) => e2.neighbours.length - e1.neighbours.length);
}

function drawEvents() {
    for (column = 0; column < 10; column++) {
        let lastDrawnMoment = 0;

        events.forEach(event => {
            if (event.drawn == false & event.start >= lastDrawnMoment) {
                let widthPercent = 100 / (event.maxNumberOfNeighbours + 1);
                let rightMostNeighbour = event.rightMostDrawnNeighbour;
                let right = rightMostNeighbour == null
                    ? 0
                    : rightMostNeighbour.offsetLeft + rightMostNeighbour.offsetWidth;

                event.style.left = right + "px";
                if (event.allNeighboursDrawn) {
                    event.style.width = calendar.offsetWidth - right + "px";
                }
                else {
                    event.style.width = widthPercent + "%";
                }
                event.drawn = true;
                calendar.appendChild(event);
                lastDrawnMoment = event.end;
            }
        });
    }
}

function event(start, end, color) {
    if (start > end) {
        throw "Please make sure your event start point is less than end point.";
    }
    if (end > 540) {
        throw "Please change the end point, event after 18:00 can not be set.";
    }
    if (start < 0) {
        throw "Please change the start point, event befor 09:00 can not be set.";
    }
    let newElement = document.createElement('div');

    newElement.start = start;
    newElement.style.top = start + "px";

    newElement.end = end;
    newElement.style.height = end - start + "px";

    newElement.className = 'event';
    newElement.style.borderColor = color;
    newElement.style.borderWidth = "1px";
    newElement.style.background = color;
    newElement.style.borderRadius = "5px";

    newElement.drawn = false;
    newElement.neighbours = [];
    return newElement;
};

Object.defineProperties(HTMLDivElement.prototype, {
    drawnNeighbours: { get: function () { return this.neighbours.filter(n => n.drawn == true) } },
    allNeighboursDrawn: {
        get: function () {
            if (this.neighbours.length == 0) return true;
            return this.drawnNeighbours.length == this.neighbours.length;
        }
    },
    rightMostDrawnNeighbour: {
        get: function () {
            if (this.drawnNeighbours.length == 0) return null;
            return this.drawnNeighbours.sort((n1, n2) => n2.offsetLeft - n1.offsetLeft)[0];
        }
    }
});

function moment(minute, change, event) {
    return { minute: minute, eventChange: change, event: event }
}


function addEventText(event) {
    let startH = Math.floor(event.start / 60) + 9;
    let startM = event.start % 60;
    let endtH = Math.floor(event.end / 60) + 9;
    let endtM = event.end % 60;
    let eventText = document.createTextNode(startH + ':' + startM + ' - ' + endtH + ':' + endtM);
    event.appendChild(eventText);
}
