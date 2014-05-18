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
				categories.getAllCategories(uid, function (err, data) {
					if (err) {
						return next(err);
					}

					data.categories = data.categories.filter(function (category) {
						return !category.disabled;
					});

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

					async.filter(data.categories, function (category, next) {
						privileges.categories.can('read', category.cid, uid, function(err, canRead) {
							next(!err && canRead);
						});
					}, function(visibleCategories) {
						data.categories = visibleCategories;

						async.each(data.categories, getRecentTopics, function (err) {
							next(err, data.categories);
						});
					});
				});
			}
		}, function (err, data) {
			res.render('home', data);
		});
	}

	Plugin.init = function(app, middleware, controllers) {
		app.get('/api/home', renderHomepage);
	};

	module.exports = Plugin;

}(module));