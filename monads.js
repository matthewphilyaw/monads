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

var orderUnit = function(orderModel) {
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

// needs to be tweaked. If product is not found you will get empty lines, and no total.
// should it just return an empty order?
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

    return {
        model: model,
        order: {}
    };
}

// --------------------------------------------------- end order monadic thingys

var validationUnit = function(odr) {
    return {
        order: odr,
        isValid: undefined,
        log: ""
    };
};

var validationBind = function(m, fn) {
    var order = m.order,
        log = m.log,
        result;

    // if last monad was not valid, then stop processing rules.
    if (m.isValid !== undefined && !m.isValid) return m;

    result = fn(order);
    return {
        order: result.order,
        isValid: result.isValid,
        log: log + result.log
    };
}

var totalGreaterThanZero = function(order) {
    var isValid = false,
        log = "";

    isValid = order.total > 0;

    if (!isValid) log = "total is less than zero\n";

    return {
        order: order,
        isValid: isValid,
        log: log
    };
}

var totalUnderTwoHundredThousand = function(order) {
    var isValid = false,
        log = "";

    isValid = order.total < 200000;

    if (!isValid) log = "total is over 200000\n";

    return {
        order: order,
        isValid: isValid,
        log: log
    };
}

// --------------------------------------------------- end validation monadic thingys

// create pipe function will produce a pipe function for a particular bind and set of functions.
var createPipe = function(bind, functions) {
    return function(unit) {
        for(i in functions) {
            unit = bind(unit, functions[i]);
        }
        return unit;
    }
}

var processOrderModels = function(orderModels) {
    var buildOrder = createPipe(orderBind, [addOrderLines, addCustomer]),
        validateOrder = createPipe(validationBind, [totalGreaterThanZero, totalUnderTwoHundredThousand]);

    var orders = [];
    for (i in orderModels) {
        var orderU = buildOrder(orderUnit(orderModels[i])),
            validatedOrder = validateOrder(validationUnit(orderU.order));

        console.log("Customer: " + orderU.order.customer.name.last + ", " + orderU.order.customer.name.first);
        console.log(orderU);
        console.log(validatedOrder);
        orders.push(validatedOrder);
    }
}

var orderModels = [
    {
        productIds: [35, 45],
        customerId: 45
    },
    {
        productIds: [12, 12, 35],
        customerId: 33
    },
    {
        productIds: [12, 12, 12, 12, 12, 45, 45, 45, 45, 45, 45],
        customerId: 45
    },
    {
        productIds: [],
        customerId: 33
    }];

// have a list of validated orders now....
var validatedOrders = processOrderModels(orderModels);