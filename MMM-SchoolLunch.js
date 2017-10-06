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
        this.showtomorrow = false;
        this.update(this); 
    },

    getHeader: function() {
        var header = this.data.header;
        header += (this.showtomorrow ? " TOMORROW" : " TODAY");
        return header;
    },

    update: function(self) {
        console.log("inside update");

        self.date = new Date(),
        locale = "en-us";

        if (self.date.getHours() >= 14) {
            self.date.setDate(self.date.getDate() + 1);
            self.showtomorrow = true;
        }
        else {
            self.showtomorrow = false;
        }

        //for testing
        //self.date.setDate(self.date.getDate() - 1);
        //self.showtomorrow = true;

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
        var foodsymbol =     $('<td class="symbol"><span class="fa fa-cutlery"></span></td>');
        var noschoolsymbol = $('<td class="symbol"><span class="fa fa-info-circle"></span></td>');
        var row = $('<tr class="normal">');

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

        console.log("Weeknum: " + weeknum);

        if (weeknum === undefined)  //weekend or summer break or school holiday
        {   
            row.append(noschoolsymbol);
            $(table).append(row.clone().append("<td>No school"
                        + (this.showtomorrow ? " tomorrow" : " today") + "</td>"));
        }
        else {
            row.append(foodsymbol);

            for (choice of ["choice1", "choice2", "choice3"]) {
                var food = undefined;
                if (food == undefined)
                    food = this.lunchdata.lunch_choices[choice][this.weekday];
                if (food == undefined)
                    food = this.lunchdata.lunch_choices[choice][weeknum][this.weekday];
                if (food) {
                    $(table).append(row.clone().append("<td>" + food + "</td>"));
                }
            }
        }

        wrapper.append(table);

        //return DOM object
        return wrapper.get(0);
    }
});
