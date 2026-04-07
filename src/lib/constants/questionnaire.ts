export interface QuestionnaireQuestion {
  key: string;
  label: string;
  type: "text" | "checkbox" | "table" | "number";
  hint?: string;
}

export interface QuestionnaireSection {
  number: number;
  name: string;
  nameEn: string;
  questions: QuestionnaireQuestion[];
}

export const TOTAL_SECTIONS = 14 as const;

export const QUESTIONNAIRE_SECTIONS: QuestionnaireSection[] = [
  // ── 1. Γενικά Στοιχεία Επιχείρησης ──────────────────────────────
  {
    number: 1,
    name: "Γενικά Στοιχεία Επιχείρησης",
    nameEn: "Business Overview",
    questions: [
      { key: "legal_entity", label: "Νομική μορφή επιχείρησης", type: "text" },
      { key: "employee_count", label: "Αριθμός εργαζομένων", type: "number" },
      { key: "erp_users", label: "Αριθμός χρηστών ERP", type: "number" },
      { key: "departments", label: "Τμήματα επιχείρησης", type: "text" },
      {
        key: "sales_channels",
        label: "Κανάλια πωλήσεων",
        type: "checkbox",
        hint: "B2C / B2B / κατάστημα / marketplaces / τηλεφωνικές",
      },
      {
        key: "channel_breakdown",
        label: "Ανάλυση τζίρου ανά κανάλι",
        type: "table",
      },
      {
        key: "countries_selling",
        label: "Χώρες στις οποίες πουλάτε",
        type: "text",
      },
      {
        key: "countries_expansion",
        label: "Χώρες για μελλοντική επέκταση",
        type: "text",
      },
      {
        key: "import_countries",
        label: "Χώρες εισαγωγών",
        type: "text",
      },
      {
        key: "export_countries",
        label: "Χώρες εξαγωγών",
        type: "text",
      },
    ],
  },

  // ── 2. Προϊόντα & Κατάλογος ──────────────────────────────────────
  {
    number: 2,
    name: "Προϊόντα & Κατάλογος",
    nameEn: "Products & Catalog",
    questions: [
      { key: "active_skus", label: "Ενεργά SKUs", type: "number" },
      { key: "categories_count", label: "Αριθμός κατηγοριών", type: "number" },
      { key: "product_types", label: "Τύποι προϊόντων", type: "text" },
      { key: "variants", label: "Παραλλαγές προϊόντων", type: "text" },
      {
        key: "serial_numbers",
        label: "Διαχείριση serial numbers",
        type: "checkbox",
      },
      {
        key: "batch_numbers",
        label: "Διαχείριση batch/lot numbers",
        type: "checkbox",
      },
      {
        key: "expiry_dates",
        label: "Ημερομηνίες λήξης",
        type: "checkbox",
      },
      { key: "coding_system", label: "Σύστημα κωδικοποίησης", type: "text" },
      {
        key: "multiple_barcodes",
        label: "Πολλαπλά barcodes ανά προϊόν",
        type: "checkbox",
      },
      {
        key: "cross_reference",
        label: "Cross-reference κωδικών",
        type: "checkbox",
      },
      { key: "fitment", label: "Fitment / συμβατότητα", type: "text" },
      {
        key: "motorcycle_models_count",
        label: "Αριθμός μοντέλων μοτοσυκλετών",
        type: "number",
      },
    ],
  },

  // ── 3. Τιμολογιακή Πολιτική ──────────────────────────────────────
  {
    number: 3,
    name: "Τιμολογιακή Πολιτική",
    nameEn: "Pricing Policy",
    questions: [
      {
        key: "price_lists_count",
        label: "Αριθμός τιμοκαταλόγων",
        type: "number",
      },
      {
        key: "channel_pricing",
        label: "Τιμολόγηση ανά κανάλι",
        type: "checkbox",
      },
      {
        key: "multi_currency",
        label: "Πολλαπλά νομίσματα",
        type: "checkbox",
      },
      {
        key: "price_change_frequency",
        label: "Συχνότητα αλλαγών τιμών",
        type: "text",
      },
      {
        key: "discount_types",
        label: "Τύποι εκπτώσεων",
        type: "checkbox",
      },
      {
        key: "credit_limits",
        label: "Πιστωτικά όρια πελατών",
        type: "checkbox",
      },
      { key: "payment_terms", label: "Όροι πληρωμής", type: "text" },
      {
        key: "dealer_contracts",
        label: "Συμβόλαια dealers",
        type: "checkbox",
      },
      {
        key: "consignment",
        label: "Εμπορεύματα σε παρακαταθήκη",
        type: "checkbox",
      },
    ],
  },

  // ── 4. Αγορές & Προμηθευτές ──────────────────────────────────────
  {
    number: 4,
    name: "Αγορές & Προμηθευτές",
    nameEn: "Purchasing & Suppliers",
    questions: [
      {
        key: "active_suppliers",
        label: "Ενεργοί προμηθευτές",
        type: "number",
      },
      {
        key: "top_suppliers",
        label: "Κορυφαίοι προμηθευτές",
        type: "text",
      },
      {
        key: "order_methods",
        label: "Μέθοδοι παραγγελίας",
        type: "checkbox",
      },
      {
        key: "auto_reorder",
        label: "Αυτόματη αναπαραγγελία",
        type: "checkbox",
      },
      {
        key: "non_eu_imports",
        label: "Εισαγωγές εκτός ΕΕ",
        type: "checkbox",
      },
      { key: "intrastat", label: "Intrastat αναφορές", type: "checkbox" },
      {
        key: "landed_cost",
        label: "Υπολογισμός landed cost",
        type: "checkbox",
      },
      {
        key: "customs_handler",
        label: "Εκτελωνιστής / διαχείριση τελωνείων",
        type: "text",
      },
      {
        key: "receiving_process",
        label: "Διαδικασία παραλαβής",
        type: "checkbox",
      },
      {
        key: "receiving_volume",
        label: "Όγκος παραλαβών",
        type: "text",
      },
    ],
  },

  // ── 5. Αποθήκη & WMS ─────────────────────────────────────────────
  {
    number: 5,
    name: "Αποθήκη & WMS",
    nameEn: "Warehouse & WMS",
    questions: [
      {
        key: "warehouse_count",
        label: "Αριθμός αποθηκών",
        type: "number",
      },
      {
        key: "warehouse_sqm",
        label: "Τετραγωνικά μέτρα αποθηκών",
        type: "number",
      },
      {
        key: "warehouse_infrastructure",
        label: "Υποδομή αποθήκης",
        type: "checkbox",
      },
      {
        key: "location_coding",
        label: "Σύστημα κωδικοποίησης θέσεων",
        type: "text",
      },
      { key: "bin_count", label: "Αριθμός θέσεων (bins)", type: "number" },
      {
        key: "multi_location_product",
        label: "Προϊόν σε πολλαπλές θέσεις",
        type: "checkbox",
      },
      {
        key: "picking_method",
        label: "Μέθοδος picking",
        type: "checkbox",
      },
      {
        key: "picking_staff",
        label: "Προσωπικό picking",
        type: "number",
      },
      {
        key: "batch_picking",
        label: "Batch picking",
        type: "checkbox",
      },
      {
        key: "packing_process",
        label: "Διαδικασία packing",
        type: "checkbox",
      },
      { key: "couriers", label: "Μεταφορικές εταιρείες", type: "text" },
      {
        key: "courier_api",
        label: "API σύνδεση μεταφορικών",
        type: "checkbox",
      },
      {
        key: "inventory_count_frequency",
        label: "Συχνότητα απογραφής",
        type: "text",
      },
      {
        key: "inventory_method",
        label: "Μέθοδος απογραφής",
        type: "text",
      },
      {
        key: "min_stock_levels",
        label: "Ελάχιστα επίπεδα αποθέματος",
        type: "checkbox",
      },
      {
        key: "inter_warehouse_transfers",
        label: "Μεταφορές μεταξύ αποθηκών",
        type: "checkbox",
      },
      {
        key: "write_offs",
        label: "Διαγραφές / write-offs",
        type: "checkbox",
      },
    ],
  },

  // ── 6. Πωλήσεις & Παραγγελίες ────────────────────────────────────
  {
    number: 6,
    name: "Πωλήσεις & Παραγγελίες",
    nameEn: "Sales & Orders",
    questions: [
      {
        key: "b2c_order_flow",
        label: "Ροή παραγγελίας B2C",
        type: "text",
      },
      {
        key: "b2b_order_methods",
        label: "Μέθοδοι παραγγελίας B2B",
        type: "checkbox",
      },
      {
        key: "b2b_approval",
        label: "Έγκριση παραγγελιών B2B",
        type: "checkbox",
      },
      {
        key: "backorder",
        label: "Backorder διαχείριση",
        type: "checkbox",
      },
      {
        key: "document_types",
        label: "Τύποι παραστατικών",
        type: "checkbox",
      },
      {
        key: "mydata_integration",
        label: "Διασύνδεση myDATA",
        type: "text",
      },
      {
        key: "returns_volume",
        label: "Όγκος επιστροφών",
        type: "text",
      },
      {
        key: "returns_process",
        label: "Διαδικασία επιστροφών",
        type: "text",
      },
    ],
  },

  // ── 7. Πελάτες & CRM ─────────────────────────────────────────────
  {
    number: 7,
    name: "Πελάτες & CRM",
    nameEn: "Customers & CRM",
    questions: [
      {
        key: "b2c_customers",
        label: "Αριθμός B2C πελατών",
        type: "number",
      },
      {
        key: "b2b_customers",
        label: "Αριθμός B2B πελατών",
        type: "number",
      },
      {
        key: "customer_info",
        label: "Πληροφορίες πελατών που τηρούνται",
        type: "text",
      },
      {
        key: "customer_categories",
        label: "Κατηγορίες πελατών",
        type: "checkbox",
      },
      {
        key: "communication_channels",
        label: "Κανάλια επικοινωνίας",
        type: "checkbox",
      },
      {
        key: "loyalty_program",
        label: "Πρόγραμμα πιστότητας",
        type: "checkbox",
      },
      {
        key: "newsletter_tool",
        label: "Εργαλείο newsletter",
        type: "text",
      },
    ],
  },

  // ── 8. Φυσικό Κατάστημα ──────────────────────────────────────────
  {
    number: 8,
    name: "Φυσικό Κατάστημα",
    nameEn: "Physical Store",
    questions: [
      { key: "store_count", label: "Αριθμός καταστημάτων", type: "number" },
      { key: "pos_system", label: "Σύστημα POS", type: "text" },
      {
        key: "realtime_stock",
        label: "Real-time απόθεμα σε κατάστημα",
        type: "checkbox",
      },
      {
        key: "click_collect",
        label: "Click & Collect",
        type: "checkbox",
      },
      {
        key: "special_orders",
        label: "Ειδικές παραγγελίες καταστήματος",
        type: "checkbox",
      },
      {
        key: "separate_store_stock",
        label: "Ξεχωριστό απόθεμα καταστήματος",
        type: "checkbox",
      },
      {
        key: "replenishment",
        label: "Αναπλήρωση καταστήματος",
        type: "text",
      },
    ],
  },

  // ── 9. Λογιστήριο & Οικονομικά ───────────────────────────────────
  {
    number: 9,
    name: "Λογιστήριο & Οικονομικά",
    nameEn: "Accounting & Finance",
    questions: [
      {
        key: "accountant_type",
        label: "Τύπος λογιστηρίου",
        type: "text",
      },
      {
        key: "accounting_software",
        label: "Λογιστικό λογισμικό",
        type: "text",
      },
      {
        key: "accountant_data_needs",
        label: "Δεδομένα που χρειάζεται ο λογιστής",
        type: "checkbox",
      },
      {
        key: "payment_methods",
        label: "Τρόποι πληρωμής",
        type: "checkbox",
      },
      {
        key: "open_balances",
        label: "Ανοιχτά υπόλοιπα",
        type: "checkbox",
      },
      {
        key: "payment_reminders",
        label: "Υπενθυμίσεις πληρωμών",
        type: "checkbox",
      },
      {
        key: "reports_used",
        label: "Αναφορές που χρησιμοποιούνται",
        type: "checkbox",
      },
      {
        key: "reports_audience",
        label: "Αποδέκτες αναφορών",
        type: "text",
      },
    ],
  },

  // ── 10. Τρέχον Entersoft Setup ────────────────────────────────────
  {
    number: 10,
    name: "Τρέχον Entersoft Setup",
    nameEn: "Current Entersoft Setup",
    questions: [
      {
        key: "entersoft_modules",
        label: "Modules Entersoft σε χρήση",
        type: "text",
      },
      {
        key: "entersoft_version",
        label: "Έκδοση Entersoft",
        type: "text",
      },
      {
        key: "entersoft_customizations",
        label: "Customizations Entersoft",
        type: "text",
      },
      {
        key: "entersoft_annual_cost",
        label: "Ετήσιο κόστος Entersoft",
        type: "text",
      },
      {
        key: "entersoft_good",
        label: "Τι δουλεύει καλά στο Entersoft",
        type: "text",
      },
      {
        key: "entersoft_daily_reports",
        label: "Καθημερινές αναφορές Entersoft",
        type: "text",
      },
      {
        key: "entersoft_bad",
        label: "Τι δεν δουλεύει καλά στο Entersoft",
        type: "text",
      },
      {
        key: "entersoft_missing",
        label: "Τι λείπει από το Entersoft",
        type: "text",
      },
      {
        key: "entersoft_time_waste",
        label: "Πού χάνεται χρόνος με το Entersoft",
        type: "text",
      },
      {
        key: "entersoft_manual_tasks",
        label: "Χειροκίνητες εργασίες λόγω Entersoft",
        type: "text",
      },
    ],
  },

  // ── 11. Άνθρωποι & Ρόλοι ─────────────────────────────────────────
  {
    number: 11,
    name: "Άνθρωποι & Ρόλοι",
    nameEn: "People & Roles",
    questions: [
      {
        key: "role_breakdown",
        label: "Ανάλυση ρόλων και αρμοδιοτήτων",
        type: "table",
      },
      {
        key: "price_change_permission",
        label: "Δικαίωμα αλλαγής τιμών",
        type: "text",
      },
      {
        key: "writeoff_permission",
        label: "Δικαίωμα διαγραφών",
        type: "text",
      },
      {
        key: "margin_view_permission",
        label: "Δικαίωμα προβολής margin",
        type: "text",
      },
      {
        key: "return_approval_permission",
        label: "Δικαίωμα έγκρισης επιστροφών",
        type: "text",
      },
    ],
  },

  // ── 12. Integrations ──────────────────────────────────────────────
  {
    number: 12,
    name: "Integrations",
    nameEn: "Integrations",
    questions: [
      {
        key: "current_integrations",
        label: "Τρέχουσες διασυνδέσεις",
        type: "checkbox",
      },
      {
        key: "desired_integrations",
        label: "Επιθυμητές διασυνδέσεις",
        type: "text",
      },
    ],
  },

  // ── 13. Προτεραιότητες ────────────────────────────────────────────
  {
    number: 13,
    name: "Προτεραιότητες",
    nameEn: "Priorities",
    questions: [
      {
        key: "module_priorities",
        label: "Προτεραιότητες modules",
        type: "table",
      },
      {
        key: "top3_problems",
        label: "Top 3 προβλήματα",
        type: "text",
      },
      {
        key: "top3_wishes",
        label: "Top 3 επιθυμίες",
        type: "text",
      },
      {
        key: "warehouse_devices",
        label: "Συσκευές αποθήκης",
        type: "checkbox",
      },
      {
        key: "warehouse_wifi",
        label: "WiFi αποθήκης",
        type: "checkbox",
      },
      {
        key: "barcode_scanners",
        label: "Barcode scanners",
        type: "text",
      },
      {
        key: "label_printer",
        label: "Εκτυπωτής ετικετών",
        type: "checkbox",
      },
      {
        key: "offline_needed",
        label: "Ανάγκη offline λειτουργίας",
        type: "checkbox",
      },
    ],
  },

  // ── 14. Data Migration & Μέλλον ───────────────────────────────────
  {
    number: 14,
    name: "Data Migration & Μέλλον",
    nameEn: "Data Migration & Future",
    questions: [
      {
        key: "data_to_migrate",
        label: "Δεδομένα προς μεταφορά",
        type: "checkbox",
      },
      {
        key: "export_format",
        label: "Μορφή εξαγωγής δεδομένων",
        type: "text",
      },
      {
        key: "future_needs",
        label: "Μελλοντικές ανάγκες",
        type: "checkbox",
      },
    ],
  },
];
