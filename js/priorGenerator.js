var bound_default = [0, Infinity]
var priors;  //bound_default = "[0, ∞]";


/**
 * Utility functions to create Objects that represent prior distributions.
 * @param {String} name:  name of parameter
 * @param {float} initial:  initial value
 * @param {float} mu:  log mean hyperparameter
 * @param {float} sigma:  log standard deviation hyperparameter
 * @param {float} offset:  offset hyperparameter
 * @param {float} lower:  truncate to lower bound
 * @param {float} upper: truncate to upper bound
 * @returns {Object}
 */
function createLogNormal(name, initial=2.0, mu=1.0, sigma=1.25, offset=0.0, lower=0, upper=Infinity) {
    const obj = {};
    obj.name = name;
    obj.initial = initial;
    obj.mu = mu;
    obj.sigma = sigma;
    obj.offset = offset;
    obj.str = `LogNormal [${obj.mu}, ${obj.sigma}], initial=${obj.initial}`;
    obj.bound = bound_default;
    return obj;
}

function createInverse(initial=1.0) {
    // reciprocal distribution
    // used for constant population size under coalescent
    const obj = {};
    obj.initial=initial;
    obj.bound = bound_default;
    obj.str = `1/x, initial=${obj.initial}`;
    return obj;
}

function createGamma(initial=2.0, shape=0.5, scale=2, offset=0.0) {
    const obj = {};
    obj.initial = initial;
    obj.shape = shape;
    obj.scale = scale;
    obj.offset = offset;
    obj.str = `Gamma [${obj.shape}, ${obj.scale}], initial=${obj.initial}`;
    obj.bound = bound_default;
    return obj;
}

function createLaplace(initial=0.1, mean=0.0, scale=1.0) {
    const obj = {};
    obj.initial = initial;
    obj.mean = mean;
    obj.scale = scale;
    obj.str = `Laplace [${obj.mean}, ${obj.scale}], initial=${obj.initial}`;
    obj.bound = bound_default;
    return obj;
}

function createFixedValue(initial=1.0) {
    const obj = {};
    obj.initial = initial;
    obj.str = `Fixed value, value=${initial}`;
    obj.bound = bound_default;
    return obj; 
}

function createUniform(initial=0.5, lower=0, upper=1) {
    const obj = {};
    obj.initial=initial;
    obj.lower=lower;
    obj.upper=upper;
    obj.str = `Uniform [${obj.lower}, ${obj.upper}], initial=${obj.initial}`;
    obj.bound = [lower, upper];
    return obj;   
}

function createExponential(initial=0.5, mean=0.5, offset=0) {
    const obj = {};
    obj.initial=initial;
    obj.mean=mean;
    obj.offset=offset;
    obj.str = `Exponential [${obj.mean}], initial=${obj.initial}`;
    obj.bound = bound_default;
    return obj;
}

function createDirichlet(initial=1.0) {
    const obj = {};
    obj.initial = initial;
    obj.str = `Dirichlet [${obj.initial}, ${obj.initial}]`;
    obj.bound = bound_default;
    return obj;
}

function createDefault() {
    const obj = {};
    obj.str = `Using Tree Prior in [0, ∞]`
    obj.bound = bound_default;
    return obj;
}

function createPoisson(val = 0.693147) {
    const obj = {};
    obj.val = val;
    obj.str = `Poisson [${obj.val}]`;
    obj.bound = ["n/a"];
    return obj;
}

var parameters = [
    {
        parameter: "kappa",
        obj: createLogNormal(),
        description: "HKY transition-transversion parameter"
    },
    {
        parameter: "gtr.rates",
        obj: createDirichlet(),
        description: "GTR transition rates parameter"
    },
    {
        parameter: "kappa1",
        obj: createLogNormal(),
        description: "TN93 1st transition-transversion parameter"
    },
    {
        parameter: "kappa2",
        obj: createLogNormal(),
        description: "TN93 2nd transition-transversion parameter"
    },
    {
        parameter: "frequencies",
        obj: createDirichlet(),
        bound: bound_default,
        description: "base frequencies"
    },
    {
        parameter: "alpha",
        obj: createExponential(),
        description: "gamma shape parameter"
    },
    {
        parameter: "pInv",
        obj: createUniform(),
        description: "proportion of invariant sites parameter"
    },
    {
        parameter: "clock.rate",
        obj: createFixedValue(),
        description: "substitution rate"
    },
    {
        parameter: "clock.rate",
        obj: createFixedValue(),
        description: "substitution rate"        
    },
    {
        parameter: "ucld.mean",
        obj: createFixedValue(),
        description:  "uncorrelated lognormal relaxed clock mean"
    },
    {
        parameter: "ucgd.mean",
        obj: createFixedValue(),
        description: "uncorrelated gamma relaxed clock mean"
    },
    {
       parameter: "uced.mean",
       obj: createFixedValue(),
       description: "uncorrelated exponential relaxed clock mean"
    },
    {
        parameter: "ucld.stdev",
        obj: createExponential(initial=0.3333333, mean=0.333333, offset=0),
        description: "uncorrelated lognormal relaxed clock stdev"
    },
    {
        parameter: "ucgd.shape",
        obj: createExponential(initial=0.3333333, mean=0.333333, offset=0),
        description: "uncorrelated gamma relaxed clock shape"
    },
    {
        parameter: "rateChanges",
        obj: createPoisson(),
        description: "number of random local clocks"
    },
    {
        parameter: "localClock.relativeRates",
        obj: createGamma(),
        description: "random local clock relative rates"
    },
    {
        parameter: "treeModel.rootHeight",
        obj: createDefault(),
        description: "root height of the tree"
    },
    {
        parameter: "constant.popSize",
        obj: createInverse(),
        description: "coalescent population size parameter"
    },
    {
        parameter: "skyline.popSize",
        obj: createUniform(lower=0, upper=1E100, initial=1),
        description: "Bayesian Skyline population sizes"
    }
];


function getPriorValues() {
    var rows = [];
    priors = [
        // sites models
        // HKY
        createLogNormal()

    ];    

    var prior_parameters = [];

    // Sites Tab
    var objIndex;
    switch($("#select-submodel").val()) {
        case "HKY":
            prior_parameters.push("kappa");
            break;
    }

    if ($("#select-submodel").val() != "JC") {
        switch($("#select-basefreq").val()) {
            case "Empirical":
            case "Equal":
                break;
            case "Estimated":
                prior_parameters.push("frequencies");
                break;
        }
    }

    // Clock Tab
    if ($("#select-clock").val() !== "uncorrelated") {
        prior_parameters.push("clock.rate");
    }

    switch($("#select-clock").val()) {
        case "uncorrelated":
            switch($("#select-relaxed-dist").val()) {
                case "lognormal":
                    prior_parameters.push("ucld.mean");
                    prior_parameters.push("ucld.stdev");
                    break;
            }
            break;
    }

    // Trees Tab
    prior_parameters.push("treeModel.rootHeight");

    if ($("#select-treeModel").val() != "skyline") {
        prior_parameters.push($("#select-treeModel").val() + ".popSize");
    }
    else
        prior_parameters.push("skyline.popSize");

    prior_parameters.forEach( function(param) {
        objIndex = parameters.findIndex(obj => obj.parameter === param);
        let curr_row = [
            parameters[objIndex].parameter,
            parameters[objIndex].obj.str,
            parameters[objIndex].obj.bound[0] !== "n/a" ? (`[${parameters[objIndex].obj.bound[0]}, ${(parameters[objIndex].obj.bound[1]) == Infinity ? "∞" : parameters[objIndex].obj.bound[1]}]`) : parameters[objIndex].obj.bound[0],
            parameters[objIndex].description
        ]
        rows.push(curr_row);
    });

    return rows;
}