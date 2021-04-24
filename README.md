# Calendar-Prune
## Purpose
This little script was created to remove old events in the Google Calendar using export / import. 
He wasn't test on other calendar application (Microsoft, ...).  
Actually, it keep the last one year events.

## Use script
The first step, export your calendar and put your ICS file in the directory "inputs".

Next, just need to execute two commands :
 - **npm install** to install the only one dependence
 - **npm start** to run the script

The script put the new calendar in a file who have the same name with the prefix "new-".

The last step, import this new file in your calendar.

## Other informations
**Github repository :** https://github.com/daisi-app/Calendar-Prune  
**Dependencies :** fs, luxon & path