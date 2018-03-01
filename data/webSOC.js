var axios = require('axios');
const cheerio = require('cheerio');
var querystring = require('querystring');
var stringify = require('json-stringify-safe');

var DEPARTMENTS = ['AC ENG', 'AFAM', 'ANATOMY', 'ANESTH', 'ANTHRO', 'ARABIC', 'ART', 'ART HIS', 'ART STU', 'ARTS', 'ARTSHUM', 'ASIANAM', 'BANA', 'BATS', 'BIO SCI', 'BIOCHEM', 'BME', 'BSEMD', 'CAMPREC', 'CBEMS', 'CEM', 'CHC/LAT', 'CHEM', 'CHINESE', 'CLASSIC', 'CLT&amp;THY', 'COGS', 'COM LIT', 'COMPSCI', 'CRITISM', 'CRM/LAW', 'CSE', 'DANCE', 'DERM', 'DEV BIO', 'DRAMA', 'E ASIAN', 'EARTHSS', 'ECO EVO', 'ECON', 'ECPS', 'ED AFF', 'EDUC', 'EECS', 'EHS', 'ENGLISH', 'ENGR', 'ENGRCEE', 'ENGRMAE', 'ENGRMSE', 'EPIDEM', 'ER MED', 'EURO ST', 'FAM MED', 'FIN', 'FLM&amp;MDA', 'FRENCH', 'GEN&amp;SEX', 'GERMAN', 'GLBL ME', 'GLBLCLT', 'GREEK', 'HEBREW', 'HINDI', 'HISTORY', 'HUMAN', 'HUMARTS', 'I&amp;C SCI', 'IN4MATX', 'INT MED', 'INTL ST', 'ITALIAN', 'JAPANSE', 'KOREAN', 'LATIN', 'LAW', 'LINGUIS', 'LIT JRN', 'LPS', 'M&amp;MG', 'MATH', 'MED', 'MED ED', 'MED HUM', 'MGMT', 'MGMT EP', 'MGMT FE', 'MGMT HC', 'MGMTMBA', 'MGMTPHD', 'MIC BIO', 'MOL BIO', 'MPAC', 'MUSIC', 'NET SYS', 'NEURBIO', 'NEUROL', 'NUR SCI', 'OB/GYN', 'OPHTHAL', 'PATH', 'PED GEN', 'PEDS', 'PERSIAN', 'PHARM', 'PHILOS', 'PHRMSCI', 'PHY SCI', 'PHYSICS', 'PHYSIO', 'PLASTIC', 'PM&amp;R', 'POL SCI', 'PORTUG', 'PP&amp;D', 'PSY BEH', 'PSYCH', 'PUB POL', 'PUBHLTH', 'RADIO', 'REL STD', 'ROTC', 'RUSSIAN', 'SOC SCI', 'SOCECOL', 'SOCIOL', 'SPANISH', 'SPPS', 'STATS', 'SURGERY', 'TAGALOG', 'TOX', 'UCDC', 'UNI AFF', 'UNI STU', 'VIETMSE', 'VIS STD', 'WOMN ST', 'WRITING'];

class webSOC {
    constructor (setAPI) {
        this.api = setAPI;
    }

    getClassesInDepartment(html) {
        var $ = cheerio.load(html);
        var classes = []
        $('.CourseTitle').each((i, elem) => {
            var c = {};

            c.name = $(elem).text()
                            .replace('(Prerequisites)', '')
                            .replace('\n\t', '')
                            .replace(/\s+/g, ' ')
                            .trim();

            var tr = $(elem).parent();
            var lecTR = $(tr).next().next();

            $('td', lecTR).each((i, elem) => {
                if (i != 5)
                    return true;

                var place = $(elem).next();
                var final = $(place).next();
                var enrolled = $(final).next().next();

                c.time = $(elem).text();
                c.place = $(place).text();
                c.final = $(final).text();
                c.enrolled = $(enrolled).text();

                return false;
            });

            classes[i] = c;
        });

        return classes;
    }

    async get() {
        var requests = DEPARTMENTS.map(d =>
            axios.post('https://www.reg.uci.edu/perl/WebSoc', querystring.stringify({
                YearTerm: '2018-14',
                Dept: d
            }))
        );

        var responses = await Promise.all(requests);

        var classes = [];
        for (let r of responses) {
            classes = classes.concat(this.getClassesInDepartment(r.data));
        }

        return classes;
    }
}

module.exports = api => new webSOC(api);
