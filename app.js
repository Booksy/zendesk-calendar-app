(function() {
    'use strict';

    var oauth_url = 'https://domain.tld/google_login/';
    var fields = {
        start_date: 'custom_field_24462829',
        start_time: 'custom_field_24435179',
        end_date: 'custom_field_24524155',
        end_time: 'custom_field_24500385'
    };

    var can_sync = false;

    return {
        events: {
            'app.activated': 'init',
            'app.registered': 'ticket_location',
            'iframe.datetime': 'update_fields',
            // events below need same ids as in fields object
            'ticket.custom_field_24462829.changed': 'send_data',
            'ticket.custom_field_24435179.changed': 'send_data',
            'ticket.custom_field_24524155.changed': 'send_data',
            'ticket.custom_field_24500385.changed': 'send_data'
        },

        update_fields: function(data) {
            var ticket = this.ticket();
            ticket.customField(fields.start_date, data.start_date);
            ticket.customField(fields.start_time, data.start_time);
            ticket.customField(fields.end_date, data.end_date);
            ticket.customField(fields.end_time, data.end_time);
        },

        datefield_to_iso: function(field) {
            var ticket = this.ticket();
            var date = moment(Date.parse(ticket.customField(field))).format('YYYY-MM-DD');
            return date !== 'Invalid date' ? date : null;
        },

        send_data: function() {
            // make sure the app.registered has fired
            if(!can_sync) {
                return;
            }

            var ticket = this.ticket();

            this.postMessage('datetime', {
                start_date: this.datefield_to_iso(fields.start_date),
                start_time: ticket.customField(fields.start_time),
                end_date: this.datefield_to_iso(fields.end_date),
                end_time: ticket.customField(fields.end_time)
            });
        },

        ticket_location: function() {
            can_sync = true;
            // https://github.com/zendesk/zendesk_app_framework_sdk/issues/7
            var location = this.currentLocation();
            if(location === 'new_ticket_sidebar') {
                this.postMessage('new_ticket');
            } else if(location === 'ticket_sidebar') {
                this.send_data();
            }
        },

        init: function() {
            var location = this.currentLocation();
            if(location === 'nav_bar') {
                this.switchTo('readme', {
                    oauth_url: oauth_url + this.currentUser().id()
                });
            } else if(location === 'ticket_sidebar' ||
                    location === 'new_ticket_sidebar') {
                this.switchTo('ticket');
            }
        }
    };

}());
