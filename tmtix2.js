/*
https://oss.ticketmaster.com/aps/braves/EN
etickets@spotlighttms.com
fssrocks

export PATH=./node_modules/phantomjs/bin:$PATH
./node_modules/casperjs/bin/casperjs   --ignore-ssl-errors=true  --ssl-protocol=any   ./tmp/tmtix.js

phantom.casperPath = '{PATH_TO_CASPER_JS}';
*/

var system = require('system');
var fs = require('fs');
var _ = require('lodash');
var moment = require('moment');
var count = 0;
var error2 = null;
/*
for (var i in y) {
    console.log(i + '=>' + y[i]);
}
*/
var ss_path = './ss/'
var next_step = 'home';
var that = this;
var counter = 0;

var action = null;
var events = '';


var casper = require('casper').create({
    verbose: true,
    logLevel: "debug",
    pageSettings: {
        loadImages: true,
        loadPlugins: false,
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_9_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/42.0.2311.90 Safari/537.36'
    },
    onDie: function (c, msg, status) {
        console.log('Exit Complete: ', status, ' => ', msg);
    },
    onPageInitialized: function (p) {
        console.log('++++++++ Page initiated...', p.url);
        this.then(function () { });
    }
});



var ai = system.args[4].replace(/====/g, '&')
try {
    console.log('Parsing: ', ai);
    var a = JSON.parse(ai);
    for (var i in a) {
        console.log('AI = ', i, ' => ', a[i]);
        this[i] = a[i];
    }
} catch (e) {
    console.log('Error in ARGS: ', e);
    casper.exit();
}

try {
    var cb_ticket_id = ticket_id.split('__');
    var seat = cb_ticket_id[1];
    cb_ticket_id = cb_ticket_id[0];
} catch (e) { }


function post_data(o) {

    var data = 'action=' + action + '&smonth=' + smonth + '&syear=' + syear;
    for (var i in o.data) {
        data += '&' + i + '=' + JSON.stringify(o.data[i]);
    }

    var page1 = require('webpage').create();
    var server = https + post_back;
    console.log('POST to ', https + post_back)

    page1.open(server, 'post', data, function (status) {

        console.log('STAT ', status);
        if (status !== 'success') {
            console.log('Unable to post! ');
            return casper.exit(1);
        } else {
            console.log('Done');
        }
        return casper.exit();
    });
    casper.wait(10 * 1000, function () {
        console.log('POST DATA TIMEOUT FINISHED');
        return casper.exit(1);
    });
}; // post_data()


function step5() {

    next_step = 'step6';

    console.log("In step 5.........");

    var t = casper.evaluate(function () {
        $('[name="terms-of-use-checkbox"]').click();
    });

    console.log("I clicked");

    casper.waitFor(function check() {
        return this.evaluate(function () {
            return !($('#next-step-btn').hasClass('disButton2'));
        });
    }, function then() {
        console.log("I am ready");
        console.log('+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+');

        console.log("b4 request DATA.");
        this.capture(ss_path + 'final_screenshot.png');

        console.log("CURRENT URL IS: " + casper.getCurrentUrl());


        // This click will cause final printing

        var t = casper.evaluate(function () {
            $('#next-step-btn').click();
        });


        casper.wait((1000 * 10), function () {
            console.log("+++++++++++++++++Done");
        });

    }, function timeout() {
        this.echo("Timed out").exit();
    });

    next_step = null;

}; //step5


function step4() {

    next_step = 'step5';

    console.log('In step 4...');

    casper.wait(3000, function () {
        console.log("I waited 3 seconds...");
    });



    casper.waitFor(function () {

        var t = casper.evaluate(function () {
            return $('a#btn-save').is(':visible')
        });
        console.log('Save Button visible ', t);
        return t;
    }, function then() {
        console.log('Save Button is visible now');
        casper.capture(ss_path + 'tix_confirm1.png');

        var t = casper.evaluate(function () {
            $('a#btn-save').get(0).click();
        });

        casper.wait(5 * 1000, function () { console.log('wait complete before action '); });
        casper.capture(ss_path + 'tix_newset3.png');

    }, function timeout() {
        this.echo("I timed out for action button ");
    }, 40 * 1000);

}; //step4

function step3() {

    console.log("In Step 3");

    next_step = 'step4';

    casper.capture(ss_path + 'step3_start.png');

    casper.waitFor(function () {

        var t = casper.evaluate(function () {
            return $('a#btn-cancel').is(':visible')
        });
        console.log('Button visible ', t);
        return t;
    }, function then() {
        console.log('Button is visible now');
        casper.capture(ss_path + 'tix_confirm1.png');

        /*

        var t = casper.evaluate(function() {
            $('a#btn-cancel').get(0).click();
        });

        */

        step4();

    }, function timeout() {
        this.echo("I timed out");
    }, 40 * 1000);


}; //step3

function step2() {
    console.log('In STEP 2');

    casper.capture(ss_path + 'tix_print.png');

    var t = casper.evaluate(function () {
        $('#manage-continue-edp').get(0).click();
    });

    step3();

}; //step2

function print_ticket() {
    console.log('===== PRINTING TICKET ', ticket_id);

    if (tickets[ticket_id] == undefined) {
        console.log('Ticket is NOT in scrpped list ', ticket_id);
        casper.exit();
    }
    console.log('EXISTS: ', tickets[ticket_id]);

    var t = casper.evaluate(function () {
        $('[data-inventory-action="ACTION_PRINT"]').get(0).click();
    });

    next_step = 'step3';

    casper.waitFor(function () {
        var t = casper.evaluate(function (o) {
            $('[data-block-id="' + o.cb_ticket_id + '"][value="' + o.seat + '"]').prop('disabled');
        }, { cb_ticket_id: cb_ticket_id, seat: seat });
        console.log('cb disabled ', t);
        return !t;
    }, function then() {
        console.log('CB is enabled now');

        var t = casper.evaluate(function (o) {
            $('[data-block-id="' + o.cb_ticket_id + '"][value="' + o.seat + '"]').get(0).click();
        }, { cb_ticket_id: cb_ticket_id, seat: seat });

        //step2();


        casper.wait(4000, function () {
            step2();
        });

    }, function timeout() {
        this.echo("Timed out").exit();
    }, 40 * 1000);

    return;
}; //print_ticket

function collect_tickets() {

    console.log('collecting tickets ');

    casper.capture(ss_path + 'curr_page.png');


    var t = casper.evaluate(function () {

        var total = [];
        var t = $('span.badge');

        for (var i = 0; i < t.length; i++) {
            var c = $(t[i]).text();
            var d = c.match(/You have ([0-9]*) seat/)
            total.push(parseInt(d[1]));
        }
        return total;
    });

    console.log('Total is ', t);
    total_tickets_found = _.sum(t);
    console.log('Total ', total_tickets_found);


    var t = casper.evaluate(function () {
        var t = $('.block.seat-block');
        var r = { len: t.length, data: [] };
        for (var i = 0; i < t.length; i++) {
            var section = $(t[i]).attr('data-section');
            var row = $(t[i]).attr('data-row');
            var sl = $(t[i]).find('table>tbody>tr').length;
            var str = $(t[i]).find('table>tbody>tr');
            var s = [];
            for (var j = 0; j < sl; j++) {
                var y = $(str[j]).find('td.seats').find('a').text();
                var st = $(str[j]).find('td.event-method').text();
                var c = $(str[j]).find('td.seats').find('input[type="checkbox"]');
                var d = {};
                if (c.length == 1) {
                    d.block_id = $(c[0]).attr('data-block-id');
                    d.value = $(c[0]).attr('value');
                    d.status = st;
                }
                s.push({ name: y, data: d })
            }
            r.data.push({ section: section, row: row, total_seats: sl, seats: s })
        }
        return r;
    });

    console.log('TObj ', t);
    console.log('Total ', t.len);

    tickets = {};
    for (var i in t.data) {
        console.log(i, '=>', t.data[i].section, t.data[i].row, t.data[i].total_seats)
        for (var j in t.data[i].seats) {


            t.data[i].seats[j].data.status = _.trim(t.data[i].seats[j].data.status);

            //tickets[t.data[i].seats[j].data.block_id+'__'+t.data[i].seats[j].data.value] = {event_id:event_id,seat_id:t.data[i].seats[j].data.block_id+'__'+t.data[i].seats[j].data.value,section_type:tickets[j].isp,section_num:t.data[i].section,row:t.data[i].row, seat:t.data[i].seats[j].data.value};

            var psid = (t.data[i].seats[j].data.status.indexOf('Action required') >= 0) ? 20 : 21;
            // var isp = (t.data[i].seats[j].name.indexOf('Parking') <= -1) ? 13 : 14;

            function strEndsWith(str, suffix) {
                return str.match(suffix) == suffix;
            }

            var isp = (strEndsWith(event_id, 'P')) ? 14 : 13;



            var g = {
                event_id: event_id,
                seat_id: t.data[i].seats[j].data.block_id + '__' + t.data[i].seats[j].data.value,
                section_type: isp,
                section_num: t.data[i].section,
                row: t.data[i].row,
                seat: t.data[i].seats[j].data.value,
                status: t.data[i].seats[j].data.status,
                psid: psid
            };
            tickets[t.data[i].seats[j].data.block_id + '__' + t.data[i].seats[j].data.value] = g;
            console.log(i, j, '=>', t.data[i].seats[j].name, t.data[i].seats[j].data.value, t.data[i].seats[j].data.block_id, t.data[i].seats[j].data.status)
        }

    }
    console.log('Printing tickets: ')
    for (var i in tickets) {
        console.log(i, '=>', tickets[i].event_id, tickets[i].seat_id, tickets[i].section_type, tickets[i].section_num, tickets[i].row, tickets[i].seat)
    }

    var tth = tickets.length;

    if (tth > total_tickets_found) {
        console.log('ERROR: Tickets total not matching ', total_tickets_found, tth);
        casper.exit();
    }

    if (action == 'SCRAPE_EVENT_RESULT') {
        post_data({ data: { tickets: tickets } });
    } else if (action == 'PRINT') {
        print_ticket();
    } else {
        console.log('Action not supported ', action);
        casper.exit();
    }

}; // collect_tickets

function check_filter() {
    console.log('checking filter....')

    var t1 = casper.evaluate(function () {
        return $('.filter-header').length
    });

    t1 = parseInt(t1);
    console.log('filter exists: ', t1);

    if (t1 >= 1) {

        var t = casper.evaluate(function () {
            $('[type="checkbox"]').click();
            $('a#filters-search.button.primary.primary-gradient-color.primary-border-color').get(0).click();
        });
        console.log('Boxes checked');

        casper.waitFor(function () {
            var t = casper.evaluate(function () {
                return ($('#overlay-processing.overlay').is(':visible')) ? false : true;
            });
            console.log('!Mask is ', t);
            return t;
        }, function () {
            console.log('Mask is removed')
            collect_tickets();
        }, function () { }, 30 * 1000);
    } else {
        collect_tickets();
    }
}; // check_filter

function collect_events() {

    // Check for existence of selector. If it does not exist, this means
    // that we are on the previous page. In that case, click the selector 
    // that navigates us to the correct page. 

    casper.evaluate(function () {
        ($('.active-month').length) ? console.log('Length is there!') : $('.button.buttonalt.noMgn[href$="/EN/inventory/manage/browse"]').get(0).click();
    });

    casper.capture(ss_path + 'test_test.png');

    var t = casper.evaluate(function () {
        var l = 0;
        var p = 0;
        var o = [];
        var t = $('.event-name.primary-border-color');

        /*

            If calendar view is not present, the code below will handle
            the list view appropriately

        */

        if (t.length == 0) {
            console.log('Found list view instead of calendar view...');
            console.log('Still here!');
            var z = $('#manage-tickets-module').find('#inventory-container')[0];
            z = z.childNodes[1].childNodes;
            p = z.length;
            for (var i = 0; i < p; i++) {
                var a = z[i].childNodes[1].childNodes[1];
                var text = a.innerHTML;
                var eid = a.getAttribute('data-event');
                var eday = a.getAttribute('data-day');
                var time = z[i].childNodes[1].childNodes[3].innerHTML;
                time = time.split('||')[0].trim();
                console.log(text, " ", eid, " ", eday, " ", time);

                o.push({ event_id: eid, event_day: eday, name: text, time_value: time });

            }

            var o = { len: p, data: o };
            return o;
        }

        else {

            l = t.length;

            for (var i = 0; i < l; i++) {
                try {
                    var a = $(t[i]).children();
                    if (!a) continue;
                    if (a.length != 1) continue;

                    a = $(a.get(0));
                    var eid = a.attr('data-event');
                    var eday = a.attr('data-day');
                    var ename = a.text();
                    var time = $(t[i]).next().attr('title').split('|')[0].trim();
                    time = time.replace(ename, '').trim();



                    o.push({ event_id: eid, event_day: eday, name: ename, time_value: time });






                } catch (e) {
                    console.log('ERROR', e);
                }
            }

            var o = { len: l, data: o };
            return o;
        }
    });

    // console.log('TObj ', t);
    console.log('Total events ', t.len);

    t.data = _.uniq(t.data, 'event_id');

    // console.log(jsonedArr);
    // console.log('TData ', t.data);



    for (var i in t.data) {

        t.data[i].name = t.data[i].name.replace(/\&/g, ' and ');
        t.data[i].dt_str = syear + '/' + smonth + '/' + t.data[i].event_day + ' ' + t.data[i].time_value;

        t.data[i].date = moment(t.data[i].dt_str, "YYYY-MM-DD hh:mm a").unix();

        // t.data[i].date = moment({ year: syear, month: smonth - 1, day: t.data[i].event_day }).unix();
        // console.log(t.data[i].date);

        console.log(i, '=>', t.data[i].event_id, t.data[i].name, t.data[i].event_day, '=>', t.data[i].date);


    }

    events = t.data;
    console.log("EVENTS' VALUE IS: " + events);

    casper.capture(ss_path + 'last_screenshot.png');


    if (action == 'SCRAPE_EVENTS') {
        post_data({ data: { events: events } });
    } else {
        console.log('EventID: ', event_id);
        if (event_id == '') {
            console.log('No event id found!');
            casper.exit(1);
        }

        //console.log("Did I reach here?");

        casper.evaluate(function (o) {
            $('[data-event="' + o + '"]').click();
        }, { event_id: event_id });

        next_step = null;

        console.log('Event clicked ', event_id);
        //casper.capture(ss_path + 'curr2_page.png');

        casper.waitFor(function () {
            var t = this.evaluate(function () {
                return ($('div#actions a[data-inventory-action="ACTION_PRINT"]').is(':visible')) ? true : false;
            });
            console.log('!Mask is ', t);
            return t;
        }, function () {
            console.log('Mask is removed')
            casper.capture(ss_path + 'curr3_page.png');

            casper.wait(10000, check_filter());

        }, function () { console.log('Timeout after 20 sec'); }, 20 * 1000);

        casper.then(function () {
            casper.capture(ss_path + 'test_screenshot.png');
            var x = casper.evaluate(function () {
                return ($('div#actions a[data-inventory-action="ACTION_PRINT"]').is(':visible')) ? true : false;
            });
            console.log('Return X = ', x);

            if (x) {
                check_filter();
            }

            else {
                casper.exit(1);
            }
        });//then


    } // else

}; // collect_events()

function month() {
    next_step = null;
    // casper.error1 = null;
    // var error = null;
    if (smonth.toString().length == 1)
        smonth = '0' + smonth;

    var t = casper.evaluate(function (o) {
        try {
            $('#' + o.m + '-' + o.y + ' a').get(0).click();
            $('#cal-months-img').get(0).click();
            return false;
        } catch (e) {   
            console.log('I am in catch');
            return true;
            // console.log('ERROR VALUE IN CATCH STATEMENT: ', error2);
        }
    }, { m: smonth, y: syear });

    console.log('T is: ', t);

    casper.then(function() {
        console.log('Can I reach here?');
        if (t) {
            console.log('I FOUND T: ', t);
            casper.exit(1);
        }
    });

    // casper.then(function () {
    //     console.log('Value of error in casper then: ', t);
    //     if (t) {
    //         this.exit();
    //     }
    // });

    // casper.exit(0);

    casper.wait(10 * 1000, function () {
        console.log('Month selection complete, going to events collection ');
        casper.capture(ss_path + 'curr5_page.png');
        collect_events();
    });
}; // month

function URLToArray(url) {
    var request = {};
    var pairs = url.substring(url.indexOf('?') + 1).split('&');
    for (var i = 0; i < pairs.length; i++) {
        if (!pairs[i])
            continue;
        var pair = pairs[i].split('=');
        request[decodeURIComponent(pair[0])] = decodeURIComponent(pair[1]);
    }
    return request;
} //URLToArray

function dashboard() {
    next_step = 'month';
    casper.wait(12000, function () {
        console.log('I waited 12 seconds');
    });

    // Ensures that it waits before the mentioned selector is 
    // visible in the DOM 

    casper.thenClick('.button.buttonalt.noMgn[href$="/EN/inventory/manage/browse"]');
    casper.waitUntilVisible('.active-month');

}; // dashboard

function home() {
    next_step = 'dashboard';

    casper.evaluate(function (o) {
        $('#login_id').val(o.email);
        $('#password').val(o.pass);
        $('#btn-login-continue').get(0).click();
    }, { email: username, pass: password });

}; // home


casper.start(url, function () { });

casper.on('load.finished', function (status) {
    console.log('Finished::: ', status, ' => ', casper.page.url);
    this.capture(ss_path + next_step + '.png');

    if (that[next_step] != undefined) {
        console.log('Calling ', next_step);
        that[next_step]();
    } // if
    else {
        console.log("Made it to the final page...");
    } // else



})

casper.on('resource.requested', function (resource) {
    'use strict';
    //console.log('+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++');
    //var utils = require('utils');
    //utils.dump(resource);
});

casper.on('remote.message', function (message) {
    console.log(message);
});

casper.on('resource.received', function (resource) {
    'use strict';
    if ((resource.contentType.indexOf("application/pdf") >= 0) && (resource.stage.indexOf("end") >= 0)) {
        console.log("WORKS");
        casper.download(resource.url, ss_path + 'tix_' + ticket_id + '.pdf');
        console.log('File Exists: ', ss_path + 'tix_' + ticket_id + '.pdf', ' => ', fs.existsSync(ss_path + 'tix_' + ticket_id + '.pdf'));
        casper.wait(3 * 1000, function () { console.log('File download complete!!! ') });
    }
});

casper.run();
