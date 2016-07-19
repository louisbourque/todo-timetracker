/*global Backbone */
var app = app || {};

(function () {
	'use strict';

	app.ActionStatusFilter = 'all';
	var AreaRouter = Backbone.Router.extend({
		routes: {
			':area(/p:project)(/a:action)(/f:filter)': 'setFilter'
		},

		setFilter: function (area,project,action,filter) {
			app.selectedAreaID = area || '';
			app.selectedProjectID = project || '';
			app.selectedActionID = action || '';
			app.ActionStatusFilter = filter || 'all';

			app.areas.trigger('filter');
			app.projects.trigger('filter');
			app.actions.trigger('filter');
		}
	});

	app.AreaRouter = new AreaRouter();
	Backbone.history.start();
})();
