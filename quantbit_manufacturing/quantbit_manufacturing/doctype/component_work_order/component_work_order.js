// Copyright (c) 2024, Quantbit Technologies Pvt. Ltd and contributors
// For license information, please see license.txt


// after getting finished Item code raw mnaterial for that finished item appended in child table
frappe.ui.form.on('Component Work Order', {
	finished_item_code: function(frm) {
		frm.clear_table("component_raw_item");
		frm.refresh_field('component_raw_item');
		frm.call({
			method:'get_raw_materials',
			doc:frm.doc
		})
	}
});

// setting value of updated quantity based on ok quantity 
frappe.ui.form.on('Component Work Order', {
	ok_quantity: function(frm) {
		frm.refresh_field('updated_quantity_to_manufacturing');
		frm.call({
			method:'calculate_Updated_quantity',
			doc:frm.doc
		})
	}
});

// setting value of updated quantity based on rejected_quantity
frappe.ui.form.on('Component Work Order', {
	rejected_quantity: function(frm) {
		frm.refresh_field('updated_quantity_to_manufacturing');
		frm.call({
			method:'calculate_Updated_quantity',
			doc:frm.doc
		})
	}
});

//  setting source warehouse in Component Raw Item child table after selected source warehouse field
frappe.ui.form.on('Component Work Order', {
	source_warehouse: function(frm) {
		frm.call({
			method:'set_source_warehouse',
			doc:frm.doc
		})
	}
});

// calculate power consumption
frappe.ui.form.on('Component Work Order', {
	power_reading_initial: function(frm) {
		frm.call({
			method:'calculating_power_consumption',
			doc:frm.doc
		})
	}
});

frappe.ui.form.on('Component Work Order', {
	power_reading_final: function(frm) {
		frm.call({
			method:'calculating_power_consumption',
			doc:frm.doc
		})
	}
});

//  filter designation list for operator
frappe.ui.form.on("Component Work Order", {
	setup: function(frm) {
			frm.set_query("operator", function() { // Replace with the name of the link field
				return {
					filters: [
						["Employee", "company", '=', frm.doc.company],// Replace with your actual filter criteria
						["Employee", "designation", '=', 'Operator'],
					]
				};
			});

		}
});

//  filter designation list for supervisor	
frappe.ui.form.on("Component Work Order", {
	setup: function(frm) {
			frm.set_query("supervisor", function() { // Replace with the name of the link field
				return {
					filters: [
						["Employee", "company", '=', frm.doc.company],// Replace with your actual filter criteria
						["Employee", "designation", '=', 'Supervisor'],
					]
				};
			});

		}
});


//  filter warehouse based on company
frappe.ui.form.on("Component Work Order", {
	setup: function(frm) {
			frm.set_query("target_warehouse", function() { // Replace with the name of the link field
				return {
					filters: [
						["Warehouse", "company", '=', frm.doc.company]
						
					]
				};
			});

		}
});


//  filter warehouse based on company in child table component raw item
frappe.ui.form.on('Component Work Order', {
    refresh: function(frm) {
        frm.fields_dict['component_raw_item'].grid.get_field('source_warehouse').get_query = function(doc, cdt, cdn) {
            var child = locals[cdt][cdn];
            return {
                filters: [
                    ["Warehouse", "company", '=', frm.doc.company]
                ]
            };
        };
    }
});

//  filter Item based on company in child table component raw item
frappe.ui.form.on('Component Work Order', {
    refresh: function(frm) {
        frm.fields_dict['component_raw_item'].grid.get_field('item_code').get_query = function(doc, cdt, cdn) {
            var child = locals[cdt][cdn];
            return {
                filters: [
                    ["Item", "company", '=', frm.doc.company]
                ]
            };
        };
    }
});

// filter warehouse based on company in child table scrap details
frappe.ui.form.on('Component Work Order', {
    refresh: function(frm) {
        frm.fields_dict['scrap_items'].grid.get_field('source_warehouse').get_query = function(doc, cdt, cdn) {
            var child = locals[cdt][cdn];
            return {
                filters: [
                    ["Warehouse", "company", '=', frm.doc.company]
                ]
            };
        };
    }
});




frappe.ui.form.on('Scrap Details', {
	check: function(frm) {
		frm.call({
			method:'get_quantity_per',
			doc:frm.doc
		})
	}
});

frappe.ui.form.on('Scrap Details', {
	percentage_input: function(frm) {
		frm.call({
			method:'get_quantity_per',
			doc:frm.doc
		})
	}
});

frappe.ui.form.on('Scrap Details', {
	used_quantity: function(frm) {
		frm.call({
			method:'get_quantity_per',
			doc:frm.doc
		})
	}
});

frappe.ui.form.on('Component Raw Item', {
	source_warehouse: function(frm) {
		frm.call({
			method:'available_qty',
			doc:frm.doc
		})
	}
});

frappe.ui.form.on('Component Work Order', {
	source_warehouse: function(frm) {
		frm.call({
			method:'available_qty',
			doc:frm.doc
		})
	}
});