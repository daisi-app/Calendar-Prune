'use strict';
const {DateTime} = require('luxon');
const fs = require('fs');

const FILE_TO_CHECK = './inputs/__FILE__';

const main = () => {
    let file;

    file = fs.readFileSync(FILE_TO_CHECK, {encoding: 'utf8'});
    file = file.split(/\r?\n/);

    file = browseFile(file);

    fs.writeFileSync('./calendar.ics', file);
};

/**
 * Analyse de la ligne et exécution de l'action
 * @param {string} line
 * @param {object} parameters
 * @returns {object}
 */
const lineAnalyse = (line, parameters) => {
    if (!parameters.beginFileFinish) {
        parameters.newEventsList.push(line);
        parameters = checkEndBeginFile(line, parameters);
    } else {
        parameters.currentEvent.push(line);

        if (line.startsWith('DTSTART')) {
            let splittedLine = line.split(':');
            const eventDate = DateTime.fromISO(splittedLine[1]);

            if (eventDate < parameters.limitDate) {
                parameters.skipCurrent = true;
            }
        }

        if (line === 'END:VEVENT') {
            if (!parameters.skipCurrent) {
                parameters.newEventsList = parameters.newEventsList.concat(parameters.currentEvent);
            } else {
                const eventName = parameters.currentEvent.find(e => e.startsWith('SUMMARY')).split(':');
                const eventDate = parameters.currentEvent.find(e => e.startsWith('DTSTART')).split(':');
                const eventFormatedDate = DateTime.fromISO(eventDate[1]);
                console.log(`Suppression de l'évenement ${eventName[1]} (${eventFormatedDate.toLocaleString(DateTime.DATETIME_SHORT_WITH_SECONDS)})`);

                parameters.skipCurrent = false;
            }

            parameters.currentEvent = [];
        }
    }

    return parameters;
};

/**
 * Check if the line is the end of headers
 * @param {string} line
 * @param {object} parameters
 * @returns {object}
 */
const checkEndBeginFile = (line, parameters) => {
    if (line === "END:VTIMEZONE") {
        parameters.beginFileFinish = true;
    }

    return parameters;
};

/**
 * Parcours du fichier
 * @param {string} file
 */
const browseFile = file => {
    let parameters = {
        newEventsList: [],
        currentEvent: [],
        beginFileFinish: false,
        skipCurrent: false,
        limitDate: DateTime.now().minus({year: 1}).set({hour: 0, minute: 0, second: 0, millisecond: 0})
    };

    // Parcours du fichier
    for (let line of file) {
        parameters = lineAnalyse(line, parameters);
    }

    parameters.newEventsList = parameters.newEventsList.concat(parameters.currentEvent);
    parameters.currentEvent = [];

    return parameters.newEventsList.join('\n');
};

main();