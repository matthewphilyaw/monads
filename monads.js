var products = [
    {
        id: 12,
        name: "batMobile",
        price: 56000
    },
    {
        id: 35,
        name: "toothBrush",
        price: 345
    },
    {
        id: 45,
        name: "toiletPaperGoodKind",
        price: 1000
    }];

var customers = [
    {
        id: 45,
        name: {
            first: "bruce",
            last: "wayne"
        },
        address: {
            street: "1007 Mountain Drive",
            city: "gothem"
        }
    },
    {
        id: 33,
        name: {
            first: "roger",
            last: "rabbit"
        },
        address: {
            street: "hollywood blvd",
            city: "hollywood"
        }
    }];

// --------------------------------------------------------------------- end of data

var mergeOrder = function(a,b) {
    var c = {};
    for(attr in a) { c[attr] = a[attr]; };
    for(attr in b) { c[attr] = b[attr]; };
    return c;
}

var unit = function(orderModel) {
    return {
        model: orderModel,
        order: {}
    }
};

var orderBind = function(orderMonad, fn) {
    var model = orderMonad.model,
        order = orderMonad.order,
        result,
        newOrder;

    result = fn(model);
    newOrder = mergeOrder(order, result.order);

    return {
        model: result.model,
        order: newOrder
    };
};

var addOrderLines = function(model) {
    var lines = [],
        total = 0;

    for (i in model.productIds) {
        for (p in products) {
            if (model.productIds[i] == products[p].id) lines.push(products[p]);
        }
    }

    for(p in lines) {
        total += lines[p].price;
    }

    return {
        model: model,
        order: {
            lines: lines,
            total: total
        }
    };
}

var addCustomer = function(model) {
    for (c in customers) {
        if (customers[c].id == model.customerId) {
            return {
                model: model,
                order: {
                    customer: customers[c]
                }
            };
        }
    }
}

// --------------------------------------------------- end order monadic thingys

// create pipe function will produce a pipe function for a particular bind and set of functions.
var createPipe = function(bind, functions) {
    return function(unit) {
        for(i in functions) {
            unit = bind(unit, functions[i]);
        }
        return unit;
    }
}

var buildOrder = createPipe(orderBind, [addOrderLines, addCustomer]);

var batmanModel = {
    productIds: [35, 45],
    customerId: 45
};

var rogerRabit = {
    productIds: [12, 12, 35],
    customerId: 33
}

console.log("batman:");
var batmanOrder = buildOrder(unit(batmanModel));
console.log(batmanOrder);

console.log("roger rabbit");
var rogerOrder = buildOrder(unit(rogerRabit));
console.log(rogerOrder);