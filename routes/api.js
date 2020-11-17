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

const filterCountry = (data, country) => {
    if (country) {
        data = data.filter(i => i.country_txt === country);
        console.log('Filtered Country', country, data.length)
    }
    return data;
}
const filterYears = (data, params) => {
    if (params.startYear && params.endYear) {
        data = data.filter(i => i.iyear >= params.startYear && i.iyear <= params.endYear)
        console.log('Filtered Year', data[0].iyear, params.startYear, params.endYear, data.length)
    }
    return data;
}
const filterCasualties = (data, minCasualties) => {
    if (minCasualties) {
        data = data.filter(i => i.nkill >= minCasualties)
        console.log('Filtered Min Casualties', minCasualties, data.length)
    }
    return data;
}
const filterData = (req) => {
    const country = req.query.country ? decode(req.query.country) : undefined;
    const startYear = req.query.startYear ? parseInt(req.query.startYear) : undefined;
    const endYear = req.query.endYear ? parseInt(req.query.endYear) : undefined;
    const minCasualties = req.query.minCasualties ? parseInt(req.query.minCasualties) : 0;

    let data = GTD;
    console.log('Total records', data.length)
    data = filterCountry(data, country)
    data = filterYears(data, {startYear, endYear});
    data = filterCasualties(data, minCasualties)
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
