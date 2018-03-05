var axios = require('axios');
const cheerio = require('cheerio');
var querystring = require('querystring');
var stringify = require('json-stringify-safe');
var moment = require('moment');

const WEBSOC_URL = 'https://www.reg.uci.edu/perl/WebSoc';

const TERMS = [
    {
        val: '2018-03',
        start: moment('2018-01-08'),
        end: moment('2018-03-16'),
        holidays: ['2018-01-15', '2018-02-19']
    },
    {
        val: '2018-14',
        start: moment('2018-04-02'),
        end: moment('2018-06-08'),
        holidays: ['2018-03-30', '2018-05-28']
    }
];

const DEPARTMENTS = ['AC ENG', 'AFAM', 'ANATOMY', 'ANESTH', 'ANTHRO', 'ARABIC', 'ART', 'ART HIS', 'ART STU', 'ARTS', 'ARTSHUM', 'ASIANAM', 'BANA', 'BATS', 'BIO SCI', 'BIOCHEM', 'BME', 'BSEMD', 'CAMPREC', 'CBEMS', 'CEM', 'CHC/LAT', 'CHEM', 'CHINESE', 'CLASSIC', 'CLT&amp;THY', 'COGS', 'COM LIT', 'COMPSCI', 'CRITISM', 'CRM/LAW', 'CSE', 'DANCE', 'DERM', 'DEV BIO', 'DRAMA', 'E ASIAN', 'EARTHSS', 'ECO EVO', 'ECON', 'ECPS', 'ED AFF', 'EDUC', 'EECS', 'EHS', 'ENGLISH', 'ENGR', 'ENGRCEE', 'ENGRMAE', 'ENGRMSE', 'EPIDEM', 'ER MED', 'EURO ST', 'FAM MED', 'FIN', 'FLM&amp;MDA', 'FRENCH', 'GEN&amp;SEX', 'GERMAN', 'GLBL ME', 'GLBLCLT', 'GREEK', 'HEBREW', 'HINDI', 'HISTORY', 'HUMAN', 'HUMARTS', 'I&amp;C SCI', 'IN4MATX', 'INT MED', 'INTL ST', 'ITALIAN', 'JAPANSE', 'KOREAN', 'LATIN', 'LAW', 'LINGUIS', 'LIT JRN', 'LPS', 'M&amp;MG', 'MATH', 'MED', 'MED ED', 'MED HUM', 'MGMT', 'MGMT EP', 'MGMT FE', 'MGMT HC', 'MGMTMBA', 'MGMTPHD', 'MIC BIO', 'MOL BIO', 'MPAC', 'MUSIC', 'NET SYS', 'NEURBIO', 'NEUROL', 'NUR SCI', 'OB/GYN', 'OPHTHAL', 'PATH', 'PED GEN', 'PEDS', 'PERSIAN', 'PHARM', 'PHILOS', 'PHRMSCI', 'PHY SCI', 'PHYSICS', 'PHYSIO', 'PLASTIC', 'PM&amp;R', 'POL SCI', 'PORTUG', 'PP&amp;D', 'PSY BEH', 'PSYCH', 'PUB POL', 'PUBHLTH', 'RADIO', 'REL STD', 'ROTC', 'RUSSIAN', 'SOC SCI', 'SOCECOL', 'SOCIOL', 'SPANISH', 'SPPS', 'STATS', 'SURGERY', 'TAGALOG', 'TOX', 'UCDC', 'UNI AFF', 'UNI STU', 'VIETMSE', 'VIS STD', 'WOMN ST', 'WRITING'];

function stripSpaces(s) {
    return s.replace('\n', ' ')
            .replace('\r', ' ')
            .replace('\t', ' ')
            .replace(/\s+/g, ' ')
            .trim();
}

class webSOC {
    constructor (setAPI) {
        this.api = setAPI;
    }

    getClassesInDepartment(html, term) {
        var $ = cheerio.load(html);
        var classes = []

        var table = $('.course_list>table')[0];
        var currName = null;
        var c = { };

        $('tr', table).each((i, tr) => {
            var isLecture = false;

            $('td', tr).each((i, td) => {
                if (i == 0 && $(td).attr('class') == 'CourseTitle') {
                    currName = stripSpaces($(td).text().replace('(Prerequisites)', ''));
                    return false;
                }

                if (i == 1) {
                    if (!$(td).text().match(/\s*Lec\s*/i)) {
                        return false;
                    } else {
                        isLecture = true;
                        c = { name: currName, term: term };
                    }
                }

                switch (i) {
                    case 2: c.sec       = stripSpaces($(td).text()); break;
                    case 5: c.time      = stripSpaces($(td).text()); break;
                    case 6: c.place     = stripSpaces($(td).text()); break;
                    case 8: c.enrolled  = stripSpaces($(td).text()); break;
                }
            });

            if (isLecture)
                classes.push(c);
        });
        
        return classes;
    }

    async save(classes) {
        this.api.connect();

        var inserts = Array();

        for (let c of classes) {
            var schemaEvent = this.api.schemas.Events.fromWebSOC(c);

            inserts[inserts.length] = this.api.schemas.Events.model.findOneAndUpdate(
                { 'event_ids' : schemaEvent.event_ids[0] },
                schemaEvent,
                { 'upsert': true, new: true }
            );
        }

        return await Promise.all(inserts);
    }

    async get() {
        var classes = [];

        for (let t of TERMS) {
            var termReqs = DEPARTMENTS.map(d => axios.post(WEBSOC_URL, querystring.stringify({ YearTerm: t.val, Dept: d })));
            var responses = await Promise.all(termReqs);

            for (let r of responses) {
                classes = classes.concat(this.getClassesInDepartment(r.data, t));
            }
        }

        return classes;
    }
}

module.exports = api => new webSOC(api);
