(function(module) {
	"use strict";

	var async = require('async'),
		categories = module.parent.require('./categories'),
		privileges = module.parent.require('./privileges'),
		meta = module.parent.require('./meta');

	var Plugin = {};

	function renderHomepage(req, res, next) {
		var uid = req.user ? req.user.uid : 0;


		/*
		* For reference, this is taken straight from controllers/index.js (controllers.home)
		*/
		async.parallel({
			header: function (next) {
				res.locals.metaTags = [{
					name: "title",
					content: meta.config.title || 'NodeBB'
				}, {
					name: "description",
					content: meta.config.description || ''
				}, {
					property: 'og:title',
					content: 'Index | ' + (meta.config.title || 'NodeBB')
				}, {
					property: 'og:type',
					content: 'website'
				}];

				if(meta.config['brand:logo']) {
					res.locals.metaTags.push({
						property: 'og:image',
						content: meta.config['brand:logo']
					});
				}

				next(null);
			},
			categories: function (next) {
				var uid = req.user ? req.user.uid : 0;
				categories.getVisibleCategories(uid, function (err, categoryData) {
					if (err) {
						return next(err);
					}

					/*
					* This is the modified function for getting category topics, instead of category posts
					*/
					function getRecentTopics(category, callback) {
						categories.getCategoryTopics(category.cid, 0, parseInt(category.numRecentReplies, 10), uid, function (err, data) {
							var topics = data.topics;
							category.topics = topics;
							category.topic_count = topics.length;
							callback(null);
						});
					}

					async.each(categoryData, getRecentTopics, function (err) {
						next(err, categoryData);
 					});
				});
			}
		}, function (err, data) {
			res.render('home', data);
		});
	}

	Plugin.init = function(params, callback) {
		params.get('/api/home', renderHomepage);
		callback();
	};

	module.exports = Plugin;

}(module));