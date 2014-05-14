var Loshin = Loshin || {
    
    init: function(force){
        if (force || (localStorage.getItem('loshinCacheDate') != new Date().toLocaleDateString())) {
            var req = new XMLHttpRequest();
            req.open("GET", 'http://api.battigayo.com/', true);
            req.onload = this.load.bind(this);
            req.onerror = this.cache.bind(this);
            req.send(null);
        } else this.cache();
    },
    
    load: function(xhrEvt){
        var data = xhrEvt.target.responseText, 
            schedule = JSON.parse(data || '[0]')
        ;
        localStorage.setItem('loshinCache', data);
        localStorage.setItem('loshinCacheDate', new Date().toLocaleDateString())
        this.build(schedule[0]);
    },
    
    cache: function(){
        var schedule = JSON.parse(localStorage.getItem('loshinCache') || '[0]');
        this.build(schedule[0]);
    },
    
    build: function(schedule) {
        var myGroup = localStorage.getItem('loshinMyGroup') || 'group_1',
            days = 'sunday monday tuesday wednesday thursday friday saturday'.split(' ')
            today = new Date().getDay(), tHead = ''
        ;

        days.forEach(function(day, j){
            tHead += '<th' + (j == today ? ' class="today" >' : '>') 
                + day.charAt(0).toUpperCase() + day.slice(1) + '</th>'
            ;
        });
        
        $('my-group-table').innerHTML 
            = $('other-group-table').innerHTML 
            = '<tr><th>Group</th>' + tHead + '</tr>'
        ;

        $('my-group').value = myGroup;
        $('alert-before').value = localStorage.getItem('loshinAlertBefore') || 15;
        
        if (! schedule) {
            errMsg = '<td colspan="8">Error loading, Please check connection </td>';
            $('my-group-table').innerHTML += errMsg;
            $('other-group-table').innerHTML += errMsg;
            return;
        }

        $('updated').innerHTML = schedule.updated.nepali + ' BS';
        $('updated').title = schedule.updated.english + ' AD';
        for (i = 1; i <= 7; i++) {
            var group = 'group_' + i, 
                outHtml = '<tr><td>' + i + '</td>'
            ;
            for (j = 0; j < 7; j++) {
                outHtml += '<td' + (j == today ? ' class="today" >' : '>') 
                    + schedule[group][days[j]]['morning'] 
                    + '<br />' + schedule[group][days[j]]['evening'] 
                    + '</td>';
            }
            outHtml += '</tr>';
            $(group == myGroup ? 'my-group-table' : 'other-group-table').innerHTML += outHtml;
        }

    }
};

function $(i) {
    return document.getElementById(i);
}

document.addEventListener('DOMContentLoaded', function () {
  Loshin.init();
});

$('save-setting').addEventListener('click', function(){
    var alertBefore = $('alert-before').value * 1;
    localStorage.setItem('loshinMyGroup', $('my-group').value);
    localStorage.setItem('loshinAlertBefore', 
        alertBefore < 10 ? 10 : alertBefore > 90 ? 90 : alertBefore
    );
    $('save-setting').value = 'Saved';
    if ($('force-update').checked) {
        Loshin.init(true);
        document.location.hash = 'box-one';
        $('force-update').checked = false;
    } else {
        var saver = setTimeout(function(){
            $('save-setting').value = 'Save';
            clearInterval(saver);
        }, 1234);
    }
})

var tabAnchors = document.getElementsByClassName('tab-anchor');
for (i = 0; i < tabAnchors.length; i++) {
    tabAnchors[i].addEventListener('click', function(){
        for (j = 0; j < tabAnchors.length; j++) {
            tabAnchors[j].className = tabAnchors[j].className.replace(' active', '');
        }
        this.className += ' active';
    });
}