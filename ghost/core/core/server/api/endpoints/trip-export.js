const errors = require('@tryghost/errors');
const models = require('../../models');
const PDFDocument = require('pdfkit');

const CATEGORY_LABELS = {
    sight: 'Sight',
    museum: 'Museum',
    restaurant: 'Restaurant',
    hotel: 'Hotel',
    park: 'Park',
    custom: 'Custom'
};

const TRAVEL_MODE_LABELS = {
    car: 'Car',
    foot: 'Walking',
    bike: 'Bike',
    public_transport: 'Public Transport'
};

/**
 * Express request handler for PDF export.
 * Bypasses the API framework pipeline to return binary PDF data.
 */
module.exports.handler = async function tripExportHandler(req, res, next) {
    try {
        const tripId = req.params.id;

        const trip = await models.Trip.findOne({id: tripId}, {
            withRelated: ['waypoints', 'route']
        });

        if (!trip) {
            return next(new errors.NotFoundError({message: 'Trip not found.'}));
        }

        const tripData = trip.toJSON();
        const waypoints = (tripData.waypoints || []).sort((a, b) => a.order_index - b.order_index);
        const route = tripData.route;

        const doc = new PDFDocument({
            size: 'A4',
            margin: 50,
            info: {
                Title: tripData.title,
                Author: 'Snowelephant Trip Planner'
            }
        });

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(tripData.title)}.pdf"`);

        doc.pipe(res);

        // Title
        doc.fontSize(24).font('Helvetica-Bold').text(tripData.title, {align: 'center'});
        doc.moveDown(0.5);

        // Location
        if (tripData.city || tripData.country) {
            const location = [tripData.city, tripData.country].filter(Boolean).join(', ');
            doc.fontSize(14).font('Helvetica').fillColor('#666666').text(location, {align: 'center'});
        }

        // Dates
        if (tripData.start_date || tripData.end_date) {
            const fmt = (d) => {
                return d ? new Date(d).toLocaleDateString('en-US', {year: 'numeric', month: 'short', day: 'numeric'}) : '';
            };
            const dateRange = [fmt(tripData.start_date), fmt(tripData.end_date)].filter(Boolean).join(' – ');
            doc.fontSize(11).text(dateRange, {align: 'center'});
        }

        doc.moveDown(0.3);
        doc.fontSize(11).text(`Travel mode: ${TRAVEL_MODE_LABELS[tripData.travel_mode] || tripData.travel_mode}`, {align: 'center'});
        doc.moveDown(1);

        // Description
        if (tripData.description) {
            doc.fillColor('#000000').fontSize(11).font('Helvetica').text(tripData.description);
            doc.moveDown(1);
        }

        // Divider
        doc.moveTo(50, doc.y).lineTo(545, doc.y).stroke('#cccccc');
        doc.moveDown(1);

        // Route summary
        if (route) {
            doc.fontSize(16).font('Helvetica-Bold').fillColor('#000000').text('Route Summary');
            doc.moveDown(0.5);
            doc.fontSize(11).font('Helvetica');

            if (route.total_distance_meters) {
                doc.text(`Total distance: ${(route.total_distance_meters / 1000).toFixed(1)} km`);
            }
            if (route.total_duration_minutes) {
                doc.text(`Travel time: ${route.total_duration_minutes} minutes`);
            }
            if (route.is_feasible !== null && route.is_feasible !== undefined) {
                doc.text(`Feasibility: ${route.is_feasible ? 'Feasible' : 'Not feasible'}`);
                if (route.feasibility_message) {
                    doc.fontSize(10).fillColor('#666666').text(route.feasibility_message);
                }
            }
            doc.moveDown(1);
        }

        // Waypoints
        if (waypoints.length > 0) {
            doc.fontSize(16).font('Helvetica-Bold').fillColor('#000000').text('Itinerary');
            doc.moveDown(0.5);

            waypoints.forEach((wp, index) => {
                if (doc.y > 700) {
                    doc.addPage();
                }

                doc.fontSize(12).font('Helvetica-Bold').fillColor('#333333')
                    .text(`${index + 1}. ${wp.name}`);

                doc.fontSize(10).font('Helvetica').fillColor('#666666');
                const details = [];
                details.push(CATEGORY_LABELS[wp.category] || wp.category);
                details.push(`${wp.duration_minutes} min`);
                if (wp.address) {
                    details.push(wp.address);
                }
                doc.text(details.join(' • '));

                if (wp.description) {
                    doc.fontSize(10).fillColor('#444444').text(wp.description);
                }

                doc.text(`GPS: ${wp.latitude}, ${wp.longitude}`);
                doc.moveDown(0.5);
            });
        }

        // Footer
        doc.moveDown(2);
        doc.moveTo(50, doc.y).lineTo(545, doc.y).stroke('#cccccc');
        doc.moveDown(0.5);
        doc.fontSize(9).font('Helvetica').fillColor('#999999')
            .text(`Generated by Snowelephant Trip Planner on ${new Date().toLocaleDateString('en-US', {year: 'numeric', month: 'long', day: 'numeric'})}`, {align: 'center'});

        doc.end();
    } catch (err) {
        next(err);
    }
};
