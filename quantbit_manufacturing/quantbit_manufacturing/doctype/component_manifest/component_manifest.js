// Copyright (c) 2024, Quantbit Technologies Pvt. Ltd and contributors
// For license information, please see license.txt

frappe.ui.form.on('Component Manifest', {
	// refresh: function(frm) {

	// }
});


frappe.ui.form.on('Raw Materials for Component Manifest', {
	check: function(frm) {
		frm.call({
			method:'get_quantity_per',
			doc:frm.doc
		})
	}
});

frappe.ui.form.on('Raw Materials for Component Manifest', {
	percentage_input: function(frm) {
		frm.call({
			method:'get_quantity_per',
			doc:frm.doc
		})
	}
});

frappe.ui.form.on('Raw Materials for Component Manifest', {
	quantity: function(frm) {
		frm.call({
			method:'get_quantity_per',
			doc:frm.doc
		})
	}
});

