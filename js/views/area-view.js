/*global Backbone, jQuery, _, ENTER_KEY, ESC_KEY */
var app = app || {};

(function ($) {
	'use strict';

	app.AreaView = Backbone.View.extend({
		tagName:  'li',

		template: _.template($('#item-template').html()),

		events: {
			'click label': 'select',
			'click .modify': 'edit',
			'click .destroy': 'clear',
			'keydown .edit': 'handleKeyPress',
			'blur .edit': 'close'
		},

		initialize: function () {
			this.listenTo(this.model, 'change', this.render);
			this.listenTo(this.model, 'destroy', this.remove);
		},

		render: function () {
			// Backbone LocalStorage is adding `id` attribute instantly after
			// creating a model.  This causes our TodoView to render twice. Once
			// after creating a model and once on `id` change.  We want to
			// filter out the second redundant render, which is caused by this
			// `id` change.  It's known Backbone LocalStorage bug, therefore
			// we've to create a workaround.
			// https://github.com/tastejs/todomvc/issues/469
			if (this.model.changed.id !== undefined) {
				return;
			}

			this.$el.html(this.template(this.model.toJSON()));
			this.$input = this.$('.edit');
			if(app.selectedAreaID == this.model.id){
				this.$el.addClass('selected');
				app.projects.trigger('new-area-selected');
			}

			return this;
		},

		select: function() {
			app.areas.each(this.clearSelection, this);
			app.selectedAreaID = this.model.id;
			$('.areas .selected').removeClass('selected');
			this.model.set({selected: true});
			this.updateNavigation(this);
		},

		clearSelection: function(area){
			area.select(false);
		},

		edit: function () {
			this.$el.addClass('editing');
			this.$input.focus();
		},

		close: function () {
			var value = this.$input.val();
			var trimmedValue = value.trim();

			if (!this.$el.hasClass('editing')) {
				return;
			}

			if (trimmedValue) {
				this.model.save({ title: trimmedValue });
			} else {
				this.clear();
			}

			this.$el.removeClass('editing');
			this.updateNavigation(this);
		},


		handleKeyPress: function (e) {
			if (e.which === ESC_KEY) {
				this.$el.removeClass('editing');
				this.$input.val(this.model.get('title'));
			}else if (e.which === ENTER_KEY) {
				this.close();
			}
		},

		clear: function () {
			this.model.destroy();
		},

		updateNavigation: function(area){
			if(app.ProjectFilter){
				app.AreaRouter.navigate(area.model.get('title')+'/'+app.ProjectFilter, {trigger: true});
			}else{
				app.AreaRouter.navigate(area.model.get('title'), {trigger: true});
			}
		}
	});
})(jQuery);