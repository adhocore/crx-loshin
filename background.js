
function swapIcon() {
    var schedule = JSON.parse(localStorage.getItem('loshinCache') || '[0]')[0], newDate = new Date(),
        today = 'sunday monday tuesday wednesday thursday friday saturday'.split(' ')[newDate.getDay()],
        alertThreshold = localStorage.getItem('loshinAlertBefore') * 1 || 15, 
        icon = 'default',  minutes = [], blackOut, within = '',
        minute = newDate.getHours() * 60 + newDate.getMinutes() 
    ;

    if (! schedule) {
        chrome.browserAction.setIcon({ path: 'icons/default.png' });
        chrome.browserAction.setTitle({ title:'loshin: Could not fetch data, Click to reload' });
        return;
    }

    blackOut = schedule[localStorage.getItem('loshinMyGroup') || 'group_1'][today];
    ['morning', 'evening'].forEach(function(shift){
        blackOut[shift].split('-').forEach(function(tym){
            var tyms = tym.split(':');
            minutes.push((tyms[0] < 1 ? 24 : tyms[0]) * 60 + tyms[1] * 1);              
        });
    }); 

    // quick fix:
    if (minutes[0] > minutes[1]) minutes[1] += 1440;
    if (minutes[2] > minutes[3]) minutes[3] += 1440;
    
    if ( ( (diff1 = minutes[0] - minute) > 0 && diff1 < alertThreshold) 
        ||
        ( (diff1 = minutes[2] - minute) > 0 && diff1 < alertThreshold)
    ) icon = 'going';
    else if ( ( (diff2 = minutes[1] - minute) > 0 && diff2 < alertThreshold) 
        ||
        ( (diff2 = minutes[3] - minute) > 0 && diff2 < alertThreshold)
    ) icon = 'coming';
    else if (minute < minutes[0] || minute > minutes[3] || (minute > minutes[1] && minute < minutes[2]))
        icon = 'on';
    else icon = 'off';
        
    if (icon == 'going') within = ' within ' + diff1 + ' minutes';
    else if (icon == 'coming') within = ' within ' + diff2 + ' minutes';

    chrome.browserAction.setIcon({ path: 'icons/' + icon + '.png' });
    chrome.browserAction.setTitle({ title:'loshin: Light is ' + icon + within })
}

function ping() {   
    var tymr = setInterval(swapIcon, 12345);
    swapIcon();     
}

ping();

