/*global Backbone, jQuery, _, ENTER_KEY */
var app = app || {};

(function ($) {
	'use strict';

	app.AreaListView = Backbone.View.extend({

		el: '.areas',

		events: {
			'keypress .new-area': 'createOnEnter'
		},

		initialize: function () {
			this.$input = this.$('.new-area');
			this.$areas = this.$('.areas');
			this.$list = $('.area-list');

			this.listenTo(app.areas, 'add', this.addOne);
			this.listenTo(app.areas, 'reset', this.addAll);
			this.listenTo(app.areas, 'filter', this.render);

			$('.new-area').focus(function(){
				$('.area-hint').removeClass('hidden');
			}).blur(function(){
				$('.area-hint').addClass('hidden');
			});

			// Suppresses 'add' events with {reset: true} and prevents the app view
			// from being re-rendered for every model. Only renders when the 'reset'
			// event is triggered at the end of the fetch.
			app.areas.fetch({reset: true});
			this.render();
		},

		render: function () {
			if (app.areas.length) {
				this.$areas.show();
			} else {
				this.$areas.hide();
			}
			this.selectArea();
		},

		selectArea: function () {
			$('.areas .selected').removeClass('selected');
			app.selectedAreaID = '';
			app.areas.each(function(area){
				area.select(false);
				if(app.AreaFilter && area.get('title').toLowerCase() === app.AreaFilter.toLowerCase()){
					app.selectedAreaID = area.id;
					area.select(true);
				}
			});
		},

		addOne: function (area) {
			var view = new app.AreaView({ model: area });
			this.$list.append(view.render().el);
		},

		addAll: function () {
			this.$list.html('');
			app.areas.each(this.addOne, this);
		},

		newAttributes: function () {
			return {
				title: this.$input.val().trim(),
				order: app.areas.nextOrder(),
			};
		},

		createOnEnter: function (e) {
			if (e.which === ENTER_KEY && this.$input.val().trim()) {
				app.areas.create(this.newAttributes());
				this.$input.val('');
			}
		},

		clearCompleted: function () {
			_.invoke(app.areas.completed(), 'destroy');
			return false;
		},

	});
})(jQuery);
