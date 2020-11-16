const decode = require('urldecode');
const gtdCountryList = require('../resources/gtd_country_list.json');
const GTD = require('../resources/gtd.json')
    .map(incident => ({
        ...incident,
        latitude: parseFloat(incident.latitude),
        longitude: parseFloat(incident.longitude),
        iyear: incident.iyear ? parseInt(incident.iyear) : 0,
        nkill: incident.nkill ? parseInt(incident.nkill) : 0,
    }))
    .filter(incident => Object.keys(gtdCountryList).includes(incident.country_txt))

const express = require('express');
const router = express.Router();

const filterData = (req) => {
    let data = GTD;
    const country = req.query.country ? decode(req.query.country) : undefined;
    const year = req.query.year ? parseInt(req.query.year) : undefined;
    const minCasualties = req.query.minCasualties ? parseInt(req.query.minCasualties) : 0;

    if (country && country.length > 0) {
        console.log('Filter Countries', JSON.stringify(country))
        data = data.filter(i => i.country_txt === country)
    }
    if (year) {
        console.log('Filter Years', year)
        data = data.filter(i => {
            console.log('iyear', i.iyear, year)
            return i.iyear === year
        })
    }
    if (minCasualties) {
        console.log('Filter Min Casualties', minCasualties);
        data = data.filter(i => i.nkill > minCasualties);
    }

    return data;
}
/**
 * Get Incidents API
 */
router.get('/country', async function (req, res, next) {
    console.log('country', JSON.stringify(req.query))
    const data = filterData(req)
    const country = data
        .reduce((countries, incident) => {
            const id = gtdCountryList[incident.country_txt].id;
            if (countries[id]) {
                countries[id].totalCasualties += incident.nkill;
                countries[id].totalIncidents += 1;
                countries[id].mostFatal = Math.max(countries[id].mostFatal, incident.nkill);
                countries[id].incidents.push(incident.eventid);
            } else {
                countries[id] = {
                    name: incident.country_txt,
                    totalCasualties: incident.nkill ? incident.nkill : 0,
                    totalIncidents: 1,
                    mostFatal: incident.nkill ? incident.nkill : 0,
                    incidents: [incident.eventid]
                }
            }
            return countries;
        }, {});
    res.send(country);
});

router.get('/incident', async function (req, res, next) {
    console.log('incident', JSON.stringify(req.query))
    const data = filterData(req);
    res.send(data)

});
module.exports = router;
