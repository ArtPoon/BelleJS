function createLogNormal() {
    const obj = {};
    obj.initial=2.0;
    obj.mu=1.0;
    obj.sigma=1.25;
    obj.offset=0.0;
    return obj;
}

function createInverse() {
    const obj = {};
    obj.initial=1;
    return obj;
}

function createGamma(shape=0.5, scale=2) {
    const obj = {};
    obj.initial=1.0;
    obj.shape=shape;
    obj.scale=scale;
    obj.offset=0.0;
    return obj;
}

function createLaplace(initial=0.1) {
    const obj = {};
    obj.initial=initial;
    obj.mean=0.0;
    obj.scale=1.0;
    return obj;    
    
}

function createFixedValue() {
    const obj = {};
    obj.initial=1;
    return obj; 
}

function createUniform(lower=0, upper=1, initial=0.5) {
    const obj = {};
    obj.initial=initial;
    obj.upper=upper;
    obj.lower=lower;
    return obj;   
}

function createExponential(initial=0.5, mean=0.5, offset=0) {
    const obj = {};
    obj.initial=initial;
    obj.mean=mean;
    obj.offset=offset;
    return obj;
}

function createDirichlet() {
    const obj = {};
    obj.initial = 1;
    return obj;
}

function getPriorValues() {
    var rows = [];

    // Sites Tab
    var obj;
    switch($("#select-submodel").val()) {
        case "HKY":
            obj = createLogNormal();
            let hky_detail = [
                "kappa",
                "LogNormal [" + obj.mu + ", " + obj.sigma + "] initial=" + obj.initial,
                "[0,∞]",
                "HKY transition-transversion parameter"
            ];
            rows.push(hky_detail);
            break;
        case "GTR":
            obj = createDirichlet();
            let gtr_detail = [
                "gtr.rates",
                "Dirichlet [" + obj.initial + ", " + obj.initial + "]",
                "[0,∞]",
                "GTR transition rates parameter"
            ];
            rows.push(gtr_detail);
            break;
        case "TN93":
            obj = createLogNormal();
            let tn93_detail = [
                "kappa1",
                "LogNormal [" + obj.mu + ", " + obj.sigma + "] initial=" + obj.initial,
                "[0,∞]",
                "TN93 1st transition-transversion parameter"
            ];
            rows.push(tn93_detail);
            obj = createLogNormal();
            let tn93_detailk2 = [
                "kappa2",
                "LogNormal [" + obj.mu + ", " + obj.sigma + "] initial=" + obj.initial,
                "[0,∞]",
                "TN93 2nd transition-transversion parameter"
            ];
            rows.push(tn93_detailk2);
            break;
    }

    if ($("#select-submodel").val() != "JC") {
        switch($("#select-basefreq").val()) {
            case "Empirical":
            case "Equal":
                break;
            case "Estimated":
                obj = createDirichlet();
                let freq = [
                    "frequencies",
                    "Dirichlet [" + obj.initial + ", " + obj.initial + "]",
                    "[0,∞]",
                    "base frequencies"
                ];
                rows.push(freq);
                break;
        }
    }

    switch($("#select-sitehetero").val()) {
        case "GI":
            obj = createExponential();
            let gi = [
                "alpha",
                "Exponential [" + obj.mean + "], initial= " + obj.initial,
                "[0,∞]",
                "gamma shape parameter"
            ];
            rows.push(gi);
        case "I":
            obj = createUniform();
            let inv = [
                "pInv",
                "Uniform [" + obj.lower + ", "+ obj.upper +"], initial= " + obj.initial,
                "[" + obj.lower + ", " + obj.upper + "]",
                "proportion of invariant sites parameter"
            ];
            rows.push(inv);
            break;
        case "G":
            obj = createExponential();
            let gamma = [
                "alpha",
                "Exponential [" + obj.mean + "], initial= " + obj.initial,
                "[0,∞]",
                "gamma shape parameter"
            ];
            rows.push(gamma);
            break;
        default:
            break;
    }

    // TODO
    switch($("#select-codonpos").val()) {
        case "2":
            break;
        case "3":
            break;
        default:
            break;
    }

    // Clock Tab
    if ($("#select-clock").val() !== "uncorrelated") {
        obj = createFixedValue();
        let strictc = [
            "clock.rate",
            "Fixed Value, value= " + obj.initial,
            "[0,∞]",
            "substitution rate"
        ];
        rows.push(strictc); 
    }

    switch($("#select-clock").val()) {
        case "uncorrelated":
            obj = createFixedValue();
            var parameter;
            switch($("#select-relaxed-dist").val()) {
                case "lognormal":
                    parameter = "ucld.mean";
                    break;
                case "gamma" :
                    parameter = "ucgd.mean";
                    break;
                case "exponential":
                    parameter = "uced.mean";
                    break;
            }
            let uncorrClock = [
                parameter,
                "Fixed value, value=" + obj.initial,
                "[0,∞]",
                "uncorrelated " + $("#select-relaxed-dist").val() + " relaxed clock mean"
            ];
            rows.push(uncorrClock);
            switch($("#select-relaxed-dist").val()) {
                case "lognormal":
                    obj = createExponential(initial=0.3333333, mean=0.333333, offset=0);
                    let uncorrStdev = [
                        "ucld.stdev",
                        "Exponential [" + obj.mean + "], initial= " + obj.initial,
                        "[0,∞]",
                        "uncorrelated lognormal relaxed clock stdev"
                    ];
                    rows.push(uncorrStdev);
                    break;
                case "gamma" :
                    obj = createExponential(initial=0.3333333, mean=0.333333, offset=0);
                    let uncorrShape = [
                        "ucgd.shape",
                        "Exponential [" + obj.mean + "], initial= " + obj.initial,
                        "[0,∞]",
                        "uncorrelated gamma relaxed clock shape"
                    ];
                    rows.push(uncorrShape);
                    break;
            }
            break;
        case "random-local":
            let rateChanges = [
                "rateChanges",
                "Poisson [0.693147]",
                "n/a",
                "number of random local clocks"
            ];
            rows.push(rateChanges);
            obj = createGamma();
            let relativeRates = [
                "localClock.relativeRates",
                "Gamma [" + obj.shape + ", " + obj.scale + "], initial=" + obj.initial,
                "[0,∞]",
                "random local clock relative rates"
            ];
            rows.push(relativeRates);
            break;
    }

    // Trees Tab
    let treeModel = [
        "treeModel.rootHeight",
        "Using Tree Prior in [0, ∞]",
        "[0, ∞]",
        "root height of the tree"
    ];
    rows.push(treeModel);

    if ($("#select-treeModel").val() != "skyline") {
        obj = createInverse();
        let popSize = [
            $("#select-treeModel").val() + ".popSize",
            "1/x, initial=" + obj.initial,
            "[0, ∞]",
            "coalescent population size parameter"
        ];
        rows.push(popSize);

        if ($("#select-treeModel").val() !== "constant") {
            if ($('#select-parGrow').val() === "parGrowGR") {
                if ($("#select-treeModel").val() === "exponential") 
                    obj = createLaplace(initial=0);
                else
                    obj = createLaplace();
            
                let gr = [
                    $("#select-treeModel").val() + ".growthRate",
                    "Laplace [" + obj.mean + ", " + obj.scale + "], Initial = " + obj.initial,
                    "[-∞, ∞]",
                    "coalescent "+ $("#select-treeModel").val() + " growth rate parameter"
                ];
                rows.push(gr); 
            }
            else {
                obj = createGamma(shape=0.001, scale=1000);
                let gr = [
                    $("#select-treeModel").val() + ".doublingTime",
                    "Gamma [" + obj.shape + ", " + obj.scale + "], initial=" + obj.initial,
                    "[0, ∞]",
                    "coalescent "+ $("#select-treeModel").val() + " doubling time parameter"
                ];
                rows.push(gr); 
            }
        }
    }


    switch($("#select-treeModel").val()) {
        case "expansion":
            obj = createUniform(lower=0, upper=1, initial=0.1);
            let anc = [
                "expansion.ancestralProportion",
                "Uniform [" + obj.lower + ", " + obj.upper + "], initial=" + obj.initial,
                "["+obj.lower + ", " + obj.upper + "]",
                "ancestral population proportion"
            ];
            rows.push(anc); 
            break;
        case "logistic":
            obj = createGamma(shape=0.001, scale=1000);
            let logShape = [
                "logistic.t50",
                "Gamma [" + obj.shape + ", " + obj.scale + "], initial=" + obj.initial,
                "[0, ∞]",
                "logistic shape parameter"
            ];
            rows.push(logShape); 
            break;
        case "skyline":
            obj = createUniform(lower=0, upper=1E100, initial=1)
            let sky = [
                "skyline.popSize",
                "Uniform [" + obj.lower + ", " + obj.upper + "], initial=" + obj.initial,
                "["+obj.lower + ", " + obj.upper + "]",
                "Bayesian Skyline population sizes"
            ];
            rows.push(sky); 
            break;
    }

    return rows;
}