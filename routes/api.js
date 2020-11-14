const decode = require('urldecode');
const gtdCountryList = require('../resources/gtd_country_list.json');
const GTD = require('../resources/gtd.json')
    .map(incident => ({
        ...incident,
        latitude: parseFloat(incident.latitude),
        longitude: parseFloat(incident.longitude),
        nkill: incident.nkill ? parseInt(incident.nkill) : 0,
    }))
    .filter(incident => Object.keys(gtdCountryList).includes(incident.country_txt))

const express = require('express');
const router = express.Router();

/**
 * Groups incidents by country and calculates country level statistics
 * @returns {Promise<*>}
 */
const getCountry = async ({
                              countries = undefined,
                              minCasualties = 0,
                          } = {}) => {
    let data = GTD;
    if (countries) {
        data = data.filter(i => countries.includes(i.country_txt))
    }
    if (minCasualties) {
        data = data.filter(i => i.nkill > minCasualties);
    }

    return data
        .reduce((countries, incident) => {
            const id = gtdCountryList[incident.country_txt].id;
            if (countries[id]) {
                countries[id].totalCasualties += incident.nkill;
                countries[id].totalIncidents += 1;
                countries[id].incidents.push(incident.eventid);
            } else {
                countries[id] = {
                    name: incident.country_txt,
                    totalCasualties: incident.nkill ? incident.nkill : 0,
                    totalIncidents: 1,
                    incidents: [incident.eventid]
                }
            }
            return countries;
        }, {});
};

/**
 * Get Incidents API
 */
router.get('/country', async function (req, res, next) {
    const countries = req.query.countries ? JSON.parse(decode(req.query.countries)) : undefined;
    const minCasualties = req.query.minCasualties ? parseInt(req.query.minCasualties) : 0;

    const country = await getCountry({countries, minCasualties});

    res.send(country);
});

router.get('/incident', async function (req, res, next) {
    let data = GTD;


    if (req.query.country) {
        const country = req.query.country;
        data = data.filter(i => i.country_txt === country)
    }
    if (req.query.minCasualties) {
        const minCasualties = req.query.minCasualties;
        data = data.filter(i => i.nkill > minCasualties)
    }
    res.send(data)
});
module.exports = router;
