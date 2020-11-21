const decode = require('urldecode');
const gtdCountryList = require('../resources/gtd_country_list.json');
const GTD = require('../resources/gtd.json')
    .filter(i => Object.keys(gtdCountryList).includes(i.country_txt) && i.latitude && i.longitude)
const express = require('express');
const router = express.Router();

const filterCountry = (data, country) => {
    if (country) {
        data = data.filter(i => i.country_txt === country);
    }
    return data;
}
const filterYears = (data, params) => {
    if (params.startYear && params.endYear) {
        data = data.filter(i => i.iyear >= params.startYear && i.iyear <= params.endYear)
    }
    return data;
}
const filterCasualties = (data, minCasualties) => {
    if (minCasualties) {
        data = data.filter(i => i.nkill >= minCasualties)
    }
    return data;
}
const filterGTD = (req) => {
    const country = req.query.country ? decode(req.query.country) : undefined;
    const startYear = req.query.startYear ? parseInt(req.query.startYear) : undefined;
    const endYear = req.query.endYear ? parseInt(req.query.endYear) : undefined;
    const minCasualties = req.query.minCasualties ? parseInt(req.query.minCasualties) : 0;

    let data = GTD;
    data = filterCountry(data, country)
    data = filterYears(data, {startYear, endYear});
    data = filterCasualties(data, minCasualties)
    return data;
}
/**
 * Get Incidents grouped by country with total incidents, total casualties, and most fatal count
 */
router.get('/country', async function (req, res, next) {
    let data = filterGTD(req)
    let country = data
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
    data = undefined;
    country = undefined;
});

/**
 * Get incidents
 */
router.get('/incident', async function (req, res, next) {
    let data = filterGTD(req);
    res.send(data)
    data = undefined;

});
module.exports = router;
