# Copyright (c) 2024, Quantbit Technologies Pvt. Ltd and contributors
# For license information, please see license.txt

import frappe
from frappe.model.document import Document

class ComponentWorkOrder(Document):

	# Fetch Child table from Component Manifest doctype to Component Work Order Doctype
	@frappe.whitelist()
	def get_raw_materials(self):
		if self.finished_item_code:
			doc_name = frappe.get_value('Component Manifest',{'finished_item_code': self.finished_item_code, "enable": True}, "name")
			if doc_name:
				doc = frappe.get_doc('Component Manifest', doc_name)
				self.quantity_to_manufacturing=doc.quantity_to_manufacturing
				self.rate_of_quantity = doc.rate_of_quantity
				for d in doc.get("raw_materials"):
					self.append('component_raw_item', {	
						"item_code": d.item_code,
						"item_name": d.item_name,
						"quantity": d.quantity,
						"actual_quantity":d.quantity,
						"percentage_input":d.percentage_input,
						"uom": d.uom,
						"check":d.check,
						"total": d.total,
					})
			else:
				frappe.throw(("Component Manifest not found for item code {0}").format(self.finished_item_code))



	# Calculate Available Quantity in source warehouse In Component Raw Item			
	@frappe.whitelist()
	def available_qty(self):
		for row in self.get("component_raw_item"):
			if row.source_warehouse and row.item_code:
				doc_name = frappe.get_value('Bin',{'item_code':row.item_code,'warehouse': row.source_warehouse}, "actual_qty")
				row.available_qty = doc_name


	#Calculate Updated Quantity depends on OK Quantity and Rejected Quantity
	@frappe.whitelist()
	def calculate_Updated_quantity(self):
		self.updated_quantity_to_manufacturing = self._calculate_total(self.ok_quantity, self.rejected_quantity)
		self.calculate_quantity_in_component_row_item()
	
	def _calculate_total(self, *values):
		return sum(value for value in values if value is not None)


	# Calculate Quantity and Used Quantity In Component Raw Item			
	@frappe.whitelist()
	def calculate_quantity_in_component_row_item(self):
		for row in self.get("component_raw_item"):
			row.quantity = (self.updated_quantity_to_manufacturing * row.actual_quantity)/self.quantity_to_manufacturing
			row.used_quantity = (self.updated_quantity_to_manufacturing * row.actual_quantity)/self.quantity_to_manufacturing


	# If Source Warehouse is same for all Raw Item then Set selected source warehouse for all child entries
	@frappe.whitelist()
	def set_source_warehouse(self):
		if self.source_warehouse:
			for i in self.get('component_raw_item'):			
				i.source_warehouse = self.source_warehouse
    
    # calculating power consumption
	@frappe.whitelist()
	def calculating_power_consumption(self):
		if self.power_reading_initial and  self.power_reading_final:
			self.power_consumed = self.power_reading_final - self.power_reading_initial
			if self.power_consumed < 0 :
				frappe.throw("The 'Power Consumed' should not be negative")

	
	# get scrap quantity based on percentage input and checked component raw item 
	@frappe.whitelist()
	def get_quantity_per(self,d):
		total = sum(i.used_quantity for i in self.get('component_raw_item') if i.check)
		percentage_items = [i for i in self.get('scrap_items') if i.percentage_input]

		for i in percentage_items:
			i.used_quantity = (i.percentage_input * total) / 100


	def on_submit(self):
		self.Manufacturing_stock_entry()
		self.mi_stock_entry_scrap_details()


	# After Submitting Component Work Order Manufacturing Stock Entry will be created 
	@frappe.whitelist()
	def Manufacturing_stock_entry(self):
		doc = frappe.new_doc("Stock Entry")
		doc.stock_entry_type = "Manufacture"
		doc.company = self.company
		doc.posting_date =self.posting_date
		for i in self.get("component_raw_item"):
			doc.append("items", {
				"s_warehouse": i.source_warehouse,
				"item_code": i.item_code,
				"item_name": i.item_name,
				"qty": self.ok_quantity * i.actual_quantity ,
			})
		
		doc.append("items", {
			"item_code": self.finished_item_code,
			"qty": self.ok_quantity,
			"t_warehouse": self.target_warehouse,
			"is_finished_item": True,
		})
		for j in self.get("operational_cost"):
			doc.append("additional_costs", {
				"expense_account": j.operations,
				"description": j.description,
				"amount": j.cost,
			})

		doc.custom_component_work_order = self.name
		doc.insert()
		doc.save()
		doc.submit()
  

	# After Submitting Component Work Order Material Issue Stock Entry of Scrap Information will be created 
	@frappe.whitelist()
	def mi_stock_entry_scrap_details(self):
		doc = frappe.new_doc("Stock Entry")
		doc.stock_entry_type = "Material Issue"
		doc.company = self.company
		doc.posting_date =self.posting_date
		for i in self.get("scrap_items"):
			doc.append("items", {
				"s_warehouse": i.source_warehouse,
				"item_code": i.item_code,
				"item_name": i.item_name,
				"qty": i.used_quantity,
			})

		doc.custom_component_work_order = self.name
		doc.insert()
		doc.save()
		doc.submit()


	