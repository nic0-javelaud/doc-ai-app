export const url = $state({value:"/"});

export const _$ = $state({
    api_key: localStorage.getItem("api_key") || "",
    document: "",
    files: {
        adhoc: null,
        demo: null,
    },
    configuration: {
        schemas: {
            root: [{
                name: "root",
                parent: null,
                fields: [
                    {
                        name: "",
                        type: "string",
                        isArray: false, 
                        description: ""
                    }
                ],
                results:null
            }],
            custom: [],
        },
        properties: [],
    },
    upload: null,
});

// JSONSchema(
//     name='InvoiceDetail', 
//     schema_definition={
//         '$defs': {
//             'InvoiceItem': {'
//                 properties': {
//                     'qty': {
//                         'description': 'Quantity of item purchased', 'title': 'Qty', 'type': 'integer'
//                     }, 
//                     'description': {
//                         'description': 'Description of item', 'title': 'Description', 'type': 'string'
//                     }
//                 }, 
//                 'required': [
//                     'qty', 'description'
//                 ], 
//                 'title': 'InvoiceItem', 
//                 'type': 'object', 
//                 'additionalProperties': False
//             }
//         }, 
//         'properties': {
//             'items': {
//                 'description': 'All items present in the receipt', 
//                 'items': {
//                     '$ref': '#/$defs/InvoiceItem'
//                 }, 
//                 'title': 'Items', 
//                 'type': 'array'
//             }
//         }, 
//         'required': [
//             'items'
//         ], 
//         'title': 'InvoiceDetail', 
//         'type': 'object', 
//         'additionalProperties': False
//     }, 
//     description=Unset(), 
//     strict=True
// )