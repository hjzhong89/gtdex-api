const gtdCountryList = require('../../gtdex/src/assets/gtd_country_list.json');
const GTD = require('../resources/gtd.json')
    .map(incident => ({
        ...incident,
        latitude: parseFloat(incident.latitude),
        longitude: parseFloat(incident.longitude),
        nkill: parseInt(incident.nkill),
    }))
    .filter(incident => Object.keys(gtdCountryList).includes(incident.country_txt))
const GTD_MAP = require('../resources/index_map.json');

const express = require('express');
const router = express.Router();
const MAX_RESULTS = 1000

const getCasualties = async () => {
    return GTD
        .reduce((countries, incident) => {
            const id = gtdCountryList[incident.country_txt].id;
            if (countries[id]) {
                countries[id] += incident.nkill;
            } else {
                countries[id] = incident.nkill;
            }
            return countries;
        }, {})
};

const getIncidents = async (country,
                            count = MAX_RESULTS,
                            lastId = undefined,
                            minNkill = 0) => {
    const start = GTD_MAP[lastId] ? GTD_MAP[lastId] + 1 : 0;
    return GTD
        .filter(incident => incident.country_txt === country && incident.nkill >= minNkill)
        .sort((a, b) => b.nkill - a.nkill)
        .slice(start, start + count);
};

/**
 * Get Incidents API
 */
router.get('/incidents', async function (req, res, next) {
    const country = req.query.country;
    const count = req.query.count;
    const lastId = req.query.lastId;

    const incidents = await getIncidents(country, count, lastId);

    res.send(incidents);
});

router.get('/casualties', async function (req, res) {
    const casualties = await getCasualties();
    res.send(casualties);
});

module.exports = router;
