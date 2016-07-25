var request = require('request-promise'),
    json2csv = require('json2csv'), 
    fs = require('fs'),
    progress = require('progress'),
    results = [],
    uri = "";
    //headers & auth specifications
    var options = {
        json: true,
        headers: {
            'Accept': '*/*',
            'Accept': 'application/vnd.urbanairship+json; version=3;',
            'Authorization': 'Basic ' + new Buffer('AbE6XXxYSNKhU2x9SkEuCQ' + ':' + 'k52B-jsLSMquSBth79cslQ').toString('base64'),
            'Connection': 'keep-alive',
            'Content-Type': 'application/json',
            'Host': 'go.urbanairship.com'
        }
    };
// for terminal progress bar when hitting api
var bar = new progress('  hitting api [:bar] :percent :etas', {
    complete: '=',
    incomplete: ' ',
    width: 163,
    total: 163
});

//hit api
function get(options, url) {
    options.uri = url
    request(options)
    .then(function(response) {
        
        bar.tick();
        options.uri = response.next_page;
        var data = response.device_tokens

        data.forEach(function(dataObj){
            var payload = {};
            if(dataObj.alias)
                payload.alias = dataObj.alias;
            else
                payload.alias ='None'
            payload.device_token = dataObj.device_token;
            results.push(payload)
        });

        //more URIs to hit
        if(results.length < 162820){
            get(options, response.next_page)
        } else {
            //no more URIs to hit
            console.log("done getting....");
            //write job
            save(results, 'devices.csv')
        }
    })
    .catch(function(error){
        console.log(error)
    });
}

//save as a csv
function save(results, filename) {
    console.log("saving file to devices.csv..")
    var fields = ['alias', 'device_token'] //column headers
    csv = json2csv({
        data: results,
        fields: fields
    });
    fs.writeFile(filename, csv, function(err) {
        if (err)
            console.log(err)
        else
            console.log('file saved')
    });
}

get(options, 'https://go.urbanairship.com/api/device_tokens/');







// 'https://go.urbanairship.com/api/device_tokens/?start=018a0607-5a15-484c-bce9-a667853e8190&limit=1000'
// console.log('@: '+results.length);
// console.log('current url: '+ url );
// console.log('next url: '+ response.next_page);