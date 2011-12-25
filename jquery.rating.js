/**
 * jQuery Rating Plugin
 *
 * Turns a select box into a star rating control.
 *
 * Author:       Chris Richards
 * Contributors: Dovy Paukstys
 *               Adrian Macneil
 */

(function ($) {

	$.fn.rating = function(options) {
		//
		// Settings
		//
		var settings = {
			split: 1,
			showCancel: true,
			cancelValue: null,
			cancelTitle: "Cancel",
			cancelBefore: false,
			startValue: null,
			disabled: false
		};

		// if options exist, merge with our settings
		if (options) { $.extend( settings, options); }
		
		if (settings.split < 1)
			settings.split = 1;

		//
		// Methods
		//
		var methods = {
			hoverOver: function(evt) {
				var elm = $(evt.target.parentNode);

				// Are we over the cancel or a star?
				if (elm.hasClass("ui-rating-cancel")) {
					elm.addClass("ui-rating-cancel-hover");
				} else {
					elm.prevAll().andSelf()
						.not(".ui-rating-cancel")
						.addClass("ui-rating-star-hover");
				}
			},
			hoverOut: function(evt) {
				var elm = $(evt.target.parentNode);
				// Are we over the cancel or a star?
				if (elm.hasClass("ui-rating-cancel")) {
					elm.removeClass("ui-rating-cancel-hover");
				} else {
					elm.prevAll().andSelf()
						.not(".ui-rating-cancel")
						.removeClass("ui-rating-star-hover");
				}
			},
			click: function(evt) {
				var elm = $(evt.target).parent();
				var value = settings.cancelValue;

				// Are we over the cancel or a star?
				if (elm.hasClass("ui-rating-cancel")) {
					// remove all stars
					elm.siblings(".ui-rating-star")
						.removeClass("ui-rating-star-full");
				} else {
					// Set current and stars on the left to full
					elm.prevAll().andSelf()
						.not(".ui-rating-cancel")
						.addClass("ui-rating-star-full");
					// Set the stars after us as empty
					elm.nextAll()
						.not(".ui-rating-cancel")
						.removeClass("ui-rating-star-full");
					// Use our value
					value = elm.attr("data-value");
				}

				// Set the select box to the new value
				if (!evt.data.hasChanged) {
					$(evt.data.selectBox).val(value).trigger("change");
				}
			},
			change: function(evt) {
				methods.setValue($(this).val(), evt.data.container, evt.data.selectBox);
			},
			setValue: function(value, container, selectBox) {
				// Set a new target and let the method know the select has already changed
				var evt = {"target": null, "data": {}};

				evt.target = $(".ui-rating-star[data-value="+ value +"] a", container);
				evt.data.selectBox = selectBox;
				evt.data.hasChanged = true;
				methods.click(evt);
			}
		};

		//
		// Process the matched elements
		//
		return this.each(function() {
			var self = $(this);

			// we only want to process single selects
			if ('select-one' !== this.type) { return; }
			// don't process the same control more than once
			if (self.data('rating-loaded')) { return; }

			// hide the select box because we are going to replace it with our control
			self.hide();
			// mark the element so we don't process it more than once
			self.data('rating-loaded', true);

			//
			// create the new HTML element
			//

			// create a div and add it after the select box
			var elm = $(document.createElement("div")).attr({
				"title": this.title,	// if there was a title, preserve it
				"class": "ui-rating"
			}).insertAfter(self);

			// create all of the stars
			var index = 0;
			$('option', self).each(function() {
				// only convert options with a value
				if (this.value !== "") {
					var star = $('<div class="ui-rating-star"><a></div>').attr({
						"title": $(this).text(),
						"data-value": this.value,
					}).appendTo(elm);

					if (settings.split > 1) {
						var splitIndex = (index % settings.split);
						var splitWidth = Math.floor(star.width() / settings.split);
						star
							.width(splitWidth)
							.find("a").css('margin-left', '-' + (splitIndex * splitWidth) + 'px');
					}

					index++;
				}
			});

			// Create the cancel
			if (settings.showCancel) {
				var cancel = $('<div class="ui-rating-cancel"><a></div>').attr({
					"title": settings.cancelTitle,
				});
				if (settings.cancelBefore) {
					cancel.prependTo(elm);
				} else {
					cancel.appendTo(elm);
				}
			}

			// Preserve the selected value
			if (self.val() !== "") {
				methods.setValue(self.val(), elm, self);
			} else {
				// Use a start value if we have it, otherwise use the cancel value
				var value = settings.startValue !== null ? settings.startValue : settings.cancelValue;
				methods.setValue(value, elm, self);
				// Make sure the selectbox knows our decision
				self.val(value);
			}

			// Should we do any binding?
			if (settings.disabled === false && self.is(":disabled") === false) {
				// Bind our events to the container
				elm.find("a")
					.bind("mouseover", methods.hoverOver)
					.bind("mouseout", methods.hoverOut)
					.bind("click", {"selectBox": self}, methods.click);
			} else {
				elm.addClass('ui-rating-disabled');
			}

			// Update the stars if the selectbox value changes
			self.bind("change", {"selectBox": self, "container": elm}, methods.change);

		});

	};

})(jQuery);
