/* global Module */

/* Magic Mirror
 * Module: MMM-SchoolLunch
 *
 * By William Skellenger http://github.com/skelliam
 * MIT Licensed.
 */

Module.register("MMM-SchoolLunch",{

    // Default module config.
    defaults: {
        interval: 7200000,  /* 120 minutes */
        url: '',      /* url to get school lunch schedule in JSON format */
    },

    getScripts: function() {
        return [this.file('vendor/jquery.min.js')];
    },

    getStyles: function() {
        return ['schoollunch.css', 'font-awesome.css'];
    },

    start: function() {
        console.log("Starting MMM-SchoolLunch");
        this.loaded = false;
        this.urlenc = encodeURI(this.config.url);
        this.lunchdata = null;
        this.date = null;
        this.update(this); 
    },

    update: function(self) {
        console.log("inside update");

        self.date = new Date(),
           locale = "en-us",
           self.month = self.date.toLocaleString(locale, { month: "long" }),
           self.weekday = self.date.toLocaleString(locale, {weekday: "long"});

        self.day = self.date.getDate();

        $.getJSON(self.urlenc, "", function(data) {
            self.lunchdata = data;  //raw json data
            self.updateDom();
        });

        setTimeout(self.update, self.config.interval, self);
    },

    getDom: function() {
        var weeknum;
        var wrapper = $('<div class="normal small">');
        var table = $('<table class="small">');
        var symbol = $('<td class="symbol"><span class="fa fa-cutlery"></span></td>');
        var row = $('<tr>').append(symbol);

        console.log(this.lunchdata);

        //if anything not initialized then return right now
        if ((this.lunchdata == null) || (this.date == null)) {
            return wrapper.get(0);
        }

        for (let week of Object.keys(this.lunchdata.calendarweek_calc[this.month])) {
            for (let day of this.lunchdata.calendarweek_calc[this.month][week]) {
                if (day == this.day) {
                    weeknum = week;
                    break;
                }
            }
        }

        //if Saturday or Sunday, nothing to do
        if ((this.weekday == "Saturday") || (this.weekday == "Sunday")) {
            $(table).append("<tr>").append("<td>No School!</td>");
        }
        else {
            console.log(weeknum);

            //append three choices
            $(table).append(row.clone().append("<td>" + this.lunchdata.lunch_choices["choice1"][this.weekday]));
            $(table).append(row.clone().append("<td>" + this.lunchdata.lunch_choices["choice2"][weeknum][this.weekday]));
            $(table).append(row.clone().append("<td>" + this.lunchdata.lunch_choices["choice3"][this.weekday]));
        }

        wrapper.append(table);

        //return DOM object
        return wrapper.get(0);
    }
});
