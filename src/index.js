'use strict';
const fs = require('fs');
const {DateTime} = require('luxon');
const path = require('path');

const FILESDIR = './inputs/';
const YEARS_TO_KEEP = 1;

/**
 * Main fonction
 */
const main = () => {
    const filesList = fs.readdirSync(FILESDIR);

    for (const filename of filesList) {
        const extension = path.extname(filename);

        if (filename === '.gitkeep' || extension !== '.ics') {
            console.error(`The file ${filename} was ignored`);
            continue;
        }

        console.log(`Working on file ${filename}`);
        let fileContent = fs.readFileSync(FILESDIR + filename, {encoding: 'utf8'});
        fileContent = fileContent.split(/\r?\n/);
        fileContent = browseFile(fileContent);
        console.log(`End of file ${filename}`);
        fs.writeFileSync(`${FILESDIR}new-${filename}`, fileContent);
    }
};

/**
 * Analyse the line and exec action
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
                console.log(`Delete event "${eventName[1]} (${eventFormatedDate.toLocaleString(DateTime.DATETIME_SHORT_WITH_SECONDS)})"`);

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
 * Browse the current file
 * @param {string[]} file
 */
const browseFile = file => {
    let parameters = {
        newEventsList: [],
        currentEvent: [],
        beginFileFinish: false,
        skipCurrent: false,
        limitDate: DateTime.now().minus({year: YEARS_TO_KEEP}).set({hour: 0, minute: 0, second: 0, millisecond: 0})
    };

    for (let line of file) {
        parameters = lineAnalyse(line, parameters);
    }

    parameters.newEventsList = parameters.newEventsList.concat(parameters.currentEvent);
    parameters.currentEvent = [];

    return parameters.newEventsList.join('\n');
};

main();