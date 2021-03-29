var priors;

/**
 * Utility functions to create Objects that represent prior distributions.
 * @param {String} idref:  name of parameter to write idref in XML, e.g., "constant.popSize"
 * @param {number} initial:  initial value
 * @param {number} mu:  log mean hyperparameter
 * @param {number} sigma:  log standard deviation hyperparameter
 * @param {number} offset:  offset hyperparameter
 * @param {number} lower:  truncate to lower bound
 * @param {number} upper: truncate to upper bound
 * @returns {Object}
 */
function LogNormalPrior(idref, initial=1.0, mu=1.0, sigma=1.0, offset=0.0, lower=0, upper=Infinity) {
  this.idref = idref;
  this.initial = initial;
  this.mu = mu;
  this.sigma = sigma;
  this.offset = offset;
  this.bound = [lower, upper];
  this.str = function() {
    return `LogNormal [${this.mu}, ${this.sigma}], initial=${this.initial}`
  };
  
  this.operator = function() {
    let op = document.createElement("scaleOperator"),
        par = document.createElement("parameter");
    op.setAttribute("scaleFactor", "0.75");
    op.setAttribute("weight", "1");

    par.setAttribute("idref", this.idref);
    op.appendChild(par);
    return op;
  }

  this.element = function() {
    let el = document.createElement("logNormalPrior"),
        par = document.createElement("parameter");

    el.setAttribute("mu", this.mu.toString());
    el.setAttribute("sigma", this.sigma.toString());
    el.setAttribute("offset", this.offset.toString());

    par.setAttribute("idref", this.idref);
    el.appendChild(par);
    return el;
  }
}


function NormalPrior(idref, initial=0.0, mean=0.0, stdev=1.0, lower=-Infinity, upper=Infinity) {
  this.idref = idref;
  this.initial = initial;
  this.mean = mean;
  this.stdev = stdev;
  this.bound = [lower, upper];
  this.str = function() { return `Normal [${obj.mean}, ${obj.stdev}], initial=${obj.initial}` };
}


function InversePrior(idref, initial=1.0, lower=0, upper=Infinity) {
  // reciprocal distribution
  // used for constant population size under coalescent
  this.idref = idref;
  this.initial = initial;
  this.bound = [lower, upper];
  this.str = function() { return `1/x, initial=${this.initial}` };
}

function GammaPrior(idref, initial=2.0, shape=0.5, scale=2, offset=0.0,
                    lower=0, upper=Infinity) {
  this.idref = idref;
  this.initial = initial;
  this.shape = shape;
  this.scale = scale;
  this.offset = offset;
  this.bound = [lower, upper];

  this.str = function() { return `Gamma [${this.shape}, ${this.scale}], initial=${this.initial}` };
}

function LaplacePrior(idref, initial=0.1, mean=0.0, scale=1.0, lower=0,
                      upper=Infinity) {
  this.idref = idref;
  this.initial = initial;
  this.mean = mean;
  this.scale = scale;
  this.bound = [lower, upper];

  this.str = function() {
    return `Laplace [${this.mean}, ${this.scale}], initial=${this.initial}`;
  };
}

function FixedValuePrior(idref, initial=1.0) {
  this.idref = idref;
  this.initial = initial;
  this.bound = ['n/a', ];
  this.str = function() { return `Fixed value, value=${this.initial}`; };
}

function UniformPrior(idref, initial=0.5, lower=0, upper=1) {
  this.idref = idref;
  this.initial = initial;
  this.bound = [lower, upper];
  this.str = function() {
    return `Uniform [${this.bound[0]}, ${this.bound[1]}], initial=${this.initial}`;
  };
}

function ExponentialPrior(idref, initial=0.5, mean=0.5, offset=0,
                          lower=0, upper=Infinity) {
  this.idref = idref;
  this.initial=initial;
  this.mean = mean;
  this.offset = offset;
  this.bound = [lower, upper];
  this.str = function() {
    return `Exponential [${this.mean}], initial=${this.initial}`;
  };
}

function DirichletPrior(idref) {
  // unusual prior in that BEAUti does not permit user to change hyperparameters
  this.idref = idref;
  this.alpha = 1.0;
  this.sumsto = 1.0;
  this.bound = [0, Infinity];
  this.str = function() {
    return `Dirichlet [${this.alpha}, ${this.sumsto}]`;
  };
}

function DefaultPrior(idref) {
  // use tree prior only
  this.idref = idref;
  this.bound = [0, Infinity];
  this.str = function() { return `Using Tree Prior in [0, ∞]`};
}

function PoissonPrior(idref) {
  this.idref = idref;
  this.rate = 0.693147;  // BEAUti v.1.10.4 does not allow this to change
  this.bound = ['n/a', ];
  this.str = function() { return `Poisson [${this.rate}]`};
}



// Listing of all possible prior distributions associated with various model settings.
priors = [
  // Sites models
  {
    parameter: "kappa",
    obj: new LogNormalPrior('kappa'),
    description: "HKY transition-transversion parameter",
    active: true
  },
  {
    parameter: "gtr.rates",
    obj: new DirichletPrior("gtr.rates"),
    description: "GTR transition rates parameter",
    active: false
  },
  {
    parameter: "kappa1",
    obj: new LogNormalPrior("kappa1"),
    description: "TN93 1st transition-transversion parameter",
    active: false
  },
  {
    parameter: "kappa2",
    obj: new LogNormalPrior("kappa2"),
    description: "TN93 2nd transition-transversion parameter",
    active: false
  },
  {
    parameter: "frequencies",
    obj: new DirichletPrior("frequencies"),
    description: "base frequencies",
    active: true
  },
  {
    parameter: "alpha",
    obj: new ExponentialPrior("alpha"),
    description: "gamma shape parameter",
    active: false
  },
  {
    parameter: "pInv",
    obj: new UniformPrior("pInv"),
    description: "proportion of invariant sites parameter",
    active: false
  },

  // Clock models
  {
    parameter: "clock.rate",
    obj: new FixedValuePrior("clock.rate"),
    description: "substitution rate",
    active: true
  },
  {
    parameter: "ucld.mean",
    obj: new FixedValuePrior("ucld.mean"),
    description:  "uncorrelated lognormal relaxed clock mean",
    active: true
  },
  {
    parameter: "ucgd.mean",
    obj: new FixedValuePrior("ucgd.mean"),
    description: "uncorrelated gamma relaxed clock mean",
    active: true
  },
  {
    parameter: "uced.mean",
    obj: new FixedValuePrior("uced.mean"),
    description: "uncorrelated exponential relaxed clock mean",
    active: true
  },
  {
    parameter: "ucld.stdev",
    obj: new ExponentialPrior(idref="ucld.stdev", initial=0.3333333, mean=0.333333, offset=0),
    description: "uncorrelated lognormal relaxed clock stdev",
    active: true
  },
  {
    parameter: "ucgd.shape",
    obj: new ExponentialPrior(initial=0.3333333, mean=0.333333, offset=0),
    description: "uncorrelated gamma relaxed clock shape",
    active: true
  },
  {
    parameter: "rateChanges",
    obj: new PoissonPrior("rateChanges"),
    description: "number of random local clocks",
    active: false
  },
  {
    parameter: "localClock.relativeRates",
    obj: new GammaPrior('localClock.relativeRates'),
    description: "random local clock relative rates",
    active: false
  },

  // Tree models
  {
    parameter: "treeModel.rootHeight",
    obj: new DefaultPrior('treeModel.rootHeight'),
    description: "root height of the tree",
    active: true
  },
  {
    parameter: "constant.popSize",
    obj: new InversePrior('constant.popSize'),
    description: "coalescent population size parameter",
    active: true
  },
  {
    parameter: "skyline.popSize",
    obj: new UniformPrior(idref='skyline.popSize', initial=1, lower=0, upper=1E100),
    description: "Bayesian Skyline population sizes",
    active: true
  }
];

