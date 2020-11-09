const gtdCountryList = require('../../gtdex/src/assets/gtd_country_list.json');
const GTD = require('../resources/gtd.json')
    .filter(incident => Object.keys(gtdCountryList).includes(incident.country_txt))
const GTD_MAP = require('../resources/index_map.json');

const express = require('express');
const router = express.Router();


const getCasualties = async ({
                                 countries = [],
                             } = {}) => {


    const casualties = GTD
        // .filter(incident => countries.includes(incident.country_txt))
        .reduce((countries, incident) => {
            const id = gtdCountryList[incident.country_txt].id;
            if (countries[id]) {
                countries[id] += 1;
            } else {
                countries[id] = 1;
            }
            return countries;
        }, {})
    console.log('casualties', casualties)
    return casualties
};

const getIncidents = async ({
                                // countries = gtdCountryList,
                                count = MAX_RESULTS,
                                lastId = undefined,
                            }) => {

    const start = GTD_MAP[lastId] ? GTD_MAP[lastId] + 1 : 0;
    return GTD
        // .filter(incident => countries.includes(incident.country_txt))
        .slice(start, start + count);
};

/**
 * Get Incidents API
 */
router.get('/incidents', async function (req, res, next) {
    console.log('/incidents', req.query.count, req.query.lastId);
    const params = {
        count: req.query.count ? req.query.count : 1000,
        lastId: req.query.lastId ? req.query.lastId.toString() : req.query.lastId,
    };
    const incidents = await getIncidents(params);
    res.send(incidents);
});

router.get('/casualties', async function (req, res) {
    const casualties = await getCasualties();
    console.log('casualties', JSON.stringify(casualties))
    res.send(casualties);
});

module.exports = router;
