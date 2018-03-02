var axios = require('axios');
const cheerio = require('cheerio');
var querystring = require('querystring');
var stringify = require('json-stringify-safe');

var TERMS = ['2018-03', '2018-14'];

var DEPARTMENTS = ['AC ENG']//, 'AFAM', 'ANATOMY', 'ANESTH', 'ANTHRO', 'ARABIC', 'ART', 'ART HIS', 'ART STU', 'ARTS', 'ARTSHUM', 'ASIANAM', 'BANA', 'BATS', 'BIO SCI', 'BIOCHEM', 'BME', 'BSEMD', 'CAMPREC', 'CBEMS', 'CEM', 'CHC/LAT', 'CHEM', 'CHINESE', 'CLASSIC', 'CLT&amp;THY', 'COGS', 'COM LIT', 'COMPSCI', 'CRITISM', 'CRM/LAW', 'CSE', 'DANCE', 'DERM', 'DEV BIO', 'DRAMA', 'E ASIAN', 'EARTHSS', 'ECO EVO', 'ECON', 'ECPS', 'ED AFF', 'EDUC', 'EECS', 'EHS', 'ENGLISH', 'ENGR', 'ENGRCEE', 'ENGRMAE', 'ENGRMSE', 'EPIDEM', 'ER MED', 'EURO ST', 'FAM MED', 'FIN', 'FLM&amp;MDA', 'FRENCH', 'GEN&amp;SEX', 'GERMAN', 'GLBL ME', 'GLBLCLT', 'GREEK', 'HEBREW', 'HINDI', 'HISTORY', 'HUMAN', 'HUMARTS', 'I&amp;C SCI', 'IN4MATX', 'INT MED', 'INTL ST', 'ITALIAN', 'JAPANSE', 'KOREAN', 'LATIN', 'LAW', 'LINGUIS', 'LIT JRN', 'LPS', 'M&amp;MG', 'MATH', 'MED', 'MED ED', 'MED HUM', 'MGMT', 'MGMT EP', 'MGMT FE', 'MGMT HC', 'MGMTMBA', 'MGMTPHD', 'MIC BIO', 'MOL BIO', 'MPAC', 'MUSIC', 'NET SYS', 'NEURBIO', 'NEUROL', 'NUR SCI', 'OB/GYN', 'OPHTHAL', 'PATH', 'PED GEN', 'PEDS', 'PERSIAN', 'PHARM', 'PHILOS', 'PHRMSCI', 'PHY SCI', 'PHYSICS', 'PHYSIO', 'PLASTIC', 'PM&amp;R', 'POL SCI', 'PORTUG', 'PP&amp;D', 'PSY BEH', 'PSYCH', 'PUB POL', 'PUBHLTH', 'RADIO', 'REL STD', 'ROTC', 'RUSSIAN', 'SOC SCI', 'SOCECOL', 'SOCIOL', 'SPANISH', 'SPPS', 'STATS', 'SURGERY', 'TAGALOG', 'TOX', 'UCDC', 'UNI AFF', 'UNI STU', 'VIETMSE', 'VIS STD', 'WOMN ST', 'WRITING'];

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

    getClassesInDepartment(html) {
        var $ = cheerio.load(html);
        var classes = []
        $('.CourseTitle').each((i, elem) => {   // for each course
            var className = stripSpaces($(elem).text().replace('(Prerequisites)', ''));
            var table = $(elem).parent().parent();

            $('tr:not([class!=""])', table).each((j, tr) => {   // for each lecture for the course
                var isLecture = false;
                var c = { name: className };

                $('td', tr).each((i, td) => {
                    if (i == 1)
                        if (!$(td).text().match(/\s*Lec\s*/i))
                            return false;
                        else
                            isLecture = true;

                    switch (i) {
                        case 2: c.sec       = stripSpaces($(td).text()); break;
                        case 5: c.time      = stripSpaces($(td).text()); break;
                        case 6: c.place     = stripSpaces($(td).text()); break;
                        case 7: c.final     = stripSpaces($(td).text()); break;
                        case 9: c.enrolled  = stripSpaces($(td).text()); break;
                    }
                });

                if (isLecture)
                    classes.push(c);
            })
        });

        return classes;
    }

    async get() {
        var requests = [];

        for (let t of TERMS) {
            var termReqs = DEPARTMENTS.map(d =>
                axios.post('https://www.reg.uci.edu/perl/WebSoc', querystring.stringify({
                    YearTerm: t,
                    ShowFinals: true,
                    Dept: d
                }))
            );

            requests = requests.concat(termReqs);
        }

        var responses = await Promise.all(requests);

        var classes = [];
        for (let r of responses) {
            classes = classes.concat(this.getClassesInDepartment(r.data));
        }

        return classes;
    }
}

module.exports = api => new webSOC(api);
