var mongoose = require('mongoose');
var loc = mongoose.model('location');

sendJsonResponse = function (res, status, content) {
    res.status(status);
    res.json(content)
};

theEarth = (function () {
    var earthRadius = 6371; //km,miles 3959
    var getDistanceFromRads = function (rads) {
        return parseFloat(rads * earthRadius);
    };
    var getRadsFromDistance = function (distance) {
        return parseFloat(distance / earthRadius);
    };
    return {
        getDistanceFromRads: getDistanceFromRads,
        getRadsFromDistance: getRadsFromDistance
    }
})();
module.exports.locationsListByDistance = function (req, res) {
    var lng = parseFloat(req.query.lng);
    var lat = parseFloat(req.query.lat);
    var point = {
        type: "Point",
        coordinates: [lng, lat]
    };

    var geoOptions = {
        spherical: true,
        maxDistance: theEarth.getRadsFromDistance(20),
        num: 10
    };


    if ((!lng && lng !== 0) || (!lat && lat !== 0)) {
        sendJsonResponse(res, 404, {
            "message": "Lng and lat query parameters are required"
        });
        return;
    }

    loc.geoNear(point, geoOptions, function (err, results, stats) {
        var locations = [];
        if (err) {
            sendJsonResponse(res, 404, err);
            return;
        } else {
            console.log('number of results - ' + results.length);
            results.forEach(function (doc) {
                locations.push({
                    distance: theEarth.getDistanceFromRads(doc.dis),
                    name: doc.obj.name,
                    address: doc.obj.address,
                    rating: doc.obj.rating,
                    facilities: doc.obj.facilities,
                    _id: doc.obj._id
                });
            });
            sendJsonResponse(res, 200, locations);
        }

    });



};

module.exports.locationsCreate = function (req, res) {
    console.log(req);
    var locationObject = {
        name: req.body.name,
        address: req.body.address,
        facilities: req.body.facilities.split(","),
        coords: [parseFloat(req.body.lng), parseFloat(req.body.lat)],
        openingTimes: [
            {
                days: req.body.days1,
                opening: req.body.opening1,
                closing: req.body.closing1,
                closed: req.body.closed1
           }, {
                days: req.body.days2,
                opening: req.body.opening2,
                closing: req.body.closing2,
                closed: req.body.closed2
        }]
    };
    loc.create(locationObject, function (err, location) {
        if (err) {
            sendJsonResponse(res, 404, err);
        } else {
            sendJsonResponse(res, 200, location);
        }
    });
};

module.exports.locationsReadOne = function (req, res) {
    if (req.params && req.params.locationid) {
        loc.findById(req.params.locationid)
            .exec(function (err, location) {
                if (!location) {
                    sendJsonResponse(res, 404, {
                        "message": "Location id not found"
                    });
                } else if (err) {
                    sendJsonResponse(res, 404, err);
                }
                sendJsonResponse(res, 200, location);
            });

    } else {
        sendJsonResponse(res, 404, {
            "message": "No location id in request"
        });
    }


};

module.exports.locationsUpdateOne = function (req, res) {
    if (!req.params.locationid) {
        sendJsonResponse(res, 404, {
            "message": "Not found, locationid is required"
        });
        return;
    }

    loc
        .findById(req.params.locationid)
        .select('-reviews -rating')
        .exec(function (err, location) {
            if (!location) {
                sendJsonResponse(res, 404, {
                    "message": "locationid is required"
                });
                return;
            } else if (err) {
                sendJsonResponse(res, 404, err);
                return;

            }

            location.name = req.body.name;
            location.address = req.body.address;
            location.facilities = req.body.facilities.split(',');
            location.coords = [parseInt(req.body.lng), parseInt(req.body.lat)];
            openingTimes: [
                {
                    days: req.body.days1,
                    opening: req.body.opening1,
                    closing: req.body.closing1,
                    closed: req.body.closed1
            }, {
                    days: req.body.days2,
                    opening: req.body.opening2,
                    closing: req.body.closing2,
                    closed: req.body.closed2
            }];

            location.save(function (err, location) {
                if (err) {
                    sendJsonResponse(res, 404, err);
                } else {
                    sendJsonResponse(res, 404, location);
                }
            });
        });
};

module.exports.locationsDeleteOne = function (req, res) {
    var locationid = req.params.locationid;
    if (locationid) {
        loc
            .findByIdAndRemove(locationid)
            .exec(
                function (err, location) {
                    if (err) {
                        sendJsonResponse(res, 404, err);
                        return;
                    }
                    sendJsonResponse(res, 204, null);
                }
            );
    } else {
        sendJsonResponse(res, 404, {
            "message": "No locationid"
        });
    }
};
