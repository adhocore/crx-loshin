// globals for easy access by interval'ed callback
var LastIcon = 'default', notifer, 
    icon = 'default', within = '',
    group = 'group_1';

function swapIcon() {
    var schedule = JSON.parse(localStorage.loshinCache || '[0]')[0], newDate = new Date(),
        today = 'sunday monday tuesday wednesday thursday friday saturday'.split(' ')[newDate.getDay()],
        alertThreshold = localStorage.loshinAlertBefore * 1 || 15, 
        minutes = [], blackOut, minute = newDate.getHours() * 60 + newDate.getMinutes(),
        group = localStorage.loshinMyGroup || 'group_1'
    ;

    if (! schedule) {
        chrome.browserAction.setIcon({ path: 'icons/default.png' });
        chrome.browserAction.setTitle({ title:'loshin: Could not fetch data, Click to reload' });
        return;
    }

    blackOut = schedule[group][today];
    ['morning', 'evening'].forEach(function(shift){
        blackOut[shift].split('-').forEach(function(tym){
            var tyms = tym.split(':');
            minutes.push((tyms[0] < 1 ? 24 : tyms[0]) * 60 + tyms[1] * 1);              
        });
    }); 

    // quick fix:
    if (minutes[0] > minutes[1]) minutes[1] += 1440;
    if (minutes[2] > minutes[3]) minutes[3] += 1440;
    
    if ( ( (diff1 = minutes[0] - minute) >= 0 && diff1 < alertThreshold) 
        ||
        ( (diff1 = minutes[2] - minute) >= 0 && diff1 < alertThreshold)
    ) icon = 'going';
    else if ( ( (diff2 = minutes[1] - minute) >= 0 && diff2 < alertThreshold) 
        ||
        ( (diff2 = minutes[3] - minute) >= 0 && diff2 < alertThreshold)
    ) icon = 'coming';
    else if (minute < minutes[0] || minute > minutes[3] || (minute > minutes[1] && minute < minutes[2]))
        icon = 'on';
    else icon = 'off';
        
    if (icon == 'going') within = ' within ' + diff1 + ' minute(s)';
    else if (icon == 'coming') within = ' within ' + diff2 + ' minute(s)';
    else within = '';

    chrome.browserAction.setIcon({ path: 'icons/' + icon + '.png' });
    chrome.browserAction.setTitle({ title:'loshin: Light is ' + icon + within });

    if (icon !== LastIcon) {
        clearInterval(notifer);
        notifer = null;
        notify();
    }

    function notify() {
        LastIcon = icon;
        // revoke as per https://developer.mozilla.org/en/docs/Web/API/notification
        var notif = new Notification(
                new Date().toLocaleTimeString().replace(/:\d+ /, ' '),
                {
                    icon: 'icons/' + icon + '.png',
                    body: 'loshin: Light is ' + icon + within
                }
            )
        ;
    }

    if (! notifer) {
        var inter = localStorage.loshinNoticeInterval;
        notifer = setInterval(
            function() {
                notify();
            }, 
            (inter || 30) * 60000
        );
    }
}

function ping() {   
    var tymr = setInterval(swapIcon, 10000);
    swapIcon();     
}

ping();

