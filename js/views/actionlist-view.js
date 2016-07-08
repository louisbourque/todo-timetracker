/*global Backbone, jQuery, _, ENTER_KEY */
var app = app || {};

(function ($) {
	'use strict';

	app.ActionListView = Backbone.View.extend({

		el: '.actions',
		statusTemplate: _.template($('#status-filter-template').html()),
		events: {
			'keypress .new-action': 'createOnEnter',
			'click .clear-completed': 'clearCompleted',
			'click .toggle-all': 'toggleAllComplete',
			'click .filter-all': 'setFilterAll',
			'click .filter-active': 'setFilterActive',
			'click .filter-completed': 'setFilterCompleted'
		},

		initialize: function () {
			this.$input = this.$('.new-action');
			this.$statusfilter = this.$('.status-filter');
			this.$list = $('.action-list');
			this.allCheckbox = this.$('.toggle-all')[0];
			this.$el.removeClass('hidden');
			this.selectedID = '';

			this.listenTo(app.actions, 'add', this.addOne);
			this.listenTo(app.actions, 'reset', this.addAll);
			this.listenTo(app.actions, 'filter', this.render);
			this.listenTo(app.actions, 'toggleCompleted', this.render);

			app.actions.fetch({reset: true});

			this.render();
		},

		render: function () {
			console.log('action render');
			var completed = app.actions.completed().length;
			var remaining = app.actions.remaining().length;

			if (app.selectedProjectID) {
				this.$el.show();

				this.$statusfilter.html(this.statusTemplate({
									completed: completed,
									remaining: remaining
				}));

				this.$('.filters li button')
					.removeClass('selected-filter')
					.filter('.filter-' + (app.ActionStatusFilter || 'all'))
					.addClass('selected-filter');

			} else {
				this.$el.hide();
			}
			this.allCheckbox.checked = !remaining;

			this.filterAll();
			this.selectAction();
		},

		selectAction: function () {
			$('.actions .selected').removeClass('selected');
			app.selectedActionID = '';
			app.actions.each(function(action){
				action.select(false);
				if(app.ActionFilter && action.get('title').toLowerCase() === app.ActionFilter.toLowerCase()){
					app.selectedActionID = action.id;
					action.select(true);
				}
			});
		},

		filterOne: function (action) {
			action.trigger('visible');
		},

		filterAll: function () {
			app.actions.each(this.filterOne, this);
		},

		setFilterAll: function() {
			app.AreaRouter.navigate(app.AreaFilter+'/p'+app.ProjectFilter+'/fall', {trigger: true});
		},
		setFilterActive: function() {
			app.AreaRouter.navigate(app.AreaFilter+'/p'+app.ProjectFilter+'/factive', {trigger: true});
		},
		setFilterCompleted: function() {
			app.AreaRouter.navigate(app.AreaFilter+'/p'+app.ProjectFilter+'/fcompleted', {trigger: true});
		},

		addOne: function (action) {
			var view = new app.ActionView({ model: action });
			this.$list.append(view.render().el);
		},

		// Add all items in the **Todos** collection at once.
		addAll: function () {
			this.$list.html('');
			//TODO: get selected area, call .each on
			app.actions.each(this.addOne, this);
		},

		// Generate the attributes for a new Todo item.
		newAttributes: function () {
			return {
				title: this.$input.val().trim(),
				order: app.actions.nextOrder(),
				project: app.selectedProjectID,
			};
		},

		// If you hit return in the main input field, create new **Todo** model,
		// persisting it to *localStorage*.
		createOnEnter: function (e) {
			if (e.which === ENTER_KEY && this.$input.val().trim()) {
				app.actions.create(this.newAttributes());
				this.$input.val('');
			}
		},

		// Clear all completed todo items, destroying their models.
		clearCompleted: function () {
			_.invoke(app.actions.completed(), 'destroy');
			app.actions.trigger('toggleCompleted');
			return false;
		},

		toggleAllComplete: function () {
			var completed = this.allCheckbox.checked;

			app.actions.each(function (action) {
				action.save({
					completed: completed
				});
			});
			app.actions.trigger('toggleCompleted');
		}

	});
})(jQuery);
