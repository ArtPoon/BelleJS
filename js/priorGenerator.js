var priors, distribution_values;

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
    let op = document.createElementNS("", "scaleOperator"),
        par = document.createElementNS("", "parameter");
    op.setAttribute("scaleFactor", "0.75");
    op.setAttribute("weight", "1");

    par.setAttribute("idref", this.idref);
    op.appendChild(par);
    return [op];
  }

  this.element = function() {
    let el = document.createElementNS("", "logNormalPrior"),
        par = document.createElementNS("", "parameter");

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

  this.str = function() {
    return `Normal [${obj.mean}, ${obj.stdev}], initial=${obj.initial}`
  };

  this.operator = function() {
    let op = document.createElementNS("", "scaleOperator"),
        par = document.createElementNS("", "parameter");
    op.setAttribute("scaleFactor", "0.75");
    op.setAttribute("weight", "1");
    par.setAttribute("idref", this.idref);
    op.appendChild(par);
    return [op];
  }

  this.element = function() {
    let el = document.createElementNS("", "normalPrior"),
        par = document.createElementNS("", "parameter");
    el.setAttribute("mean", this.mean.toString());
    el.setAttribute("stdev", this.stdev.toString());
    par.setAttribute("idref", this.idref);
    el.appendChild(par);
    return el;
  }
}


function InversePrior(idref, initial=1.0, lower=0, upper=Infinity) {
  // reciprocal distribution
  // used for constant population size under coalescent
  this.idref = idref;
  this.initial = initial;
  this.bound = [lower, upper];

  this.str = function() { return `1/x, initial=${this.initial}` };

  this.element = function() {
    let el = document.createElementNS("", "oneOnXPrior"),
        par = document.createElementNS("", "parameter");
    par.setAttribute("idref", this.idref);
    el.appendChild(par);
    return el;
  }

  this.operator = function() {
    let op = document.createElementNS("", "scaleOperator"),
        par = document.createElementNS("", "parameter");
    op.setAttribute("scaleFactor", "0.75");
    op.setAttribute("weight", "3");
    par.setAttribute("idref", this.idref);
    op.appendChild(par);
    return [op];
  }
}

function GammaPrior(idref, initial=2.0, shape=0.5, scale=2, offset=0.0,
                    lower=0, upper=Infinity) {
  this.idref = idref;
  this.initial = initial;
  this.shape = shape;
  this.scale = scale;
  this.offset = offset;
  this.bound = [lower, upper];

  this.str = function() {
    return `Gamma [${this.shape}, ${this.scale}], initial=${this.initial}`;
  };

  this.operator = function() {
    let op = document.createElementNS("", "scaleOperator"),
        par = document.createElementNS("", "parameter");
    op.setAttributeNS("", "scaleFactor", "0.75");
    op.setAttribute("weight", "1");
    par.setAttribute("idref", this.idref);
    op.appendChild(par);
    return [op];
  }

  this.element = function() {
    let el = document.createElementNS("", "gammaPrior"),
        par = document.createElementNS("", "parameter");
    el.setAttribute("shape", this.shape.toString());
    el.setAttribute("scale", this.scale.toString());
    el.setAttribute("offset", this.offset.toString());
    par.setAttribute("idref", this.idref);
    el.appendChild(par);
    return el;
  }
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

  this.operator = function() {
    let op = document.createElementNS("", "scaleOperator"),
        par = document.createElementNS("", "parameter");
    op.setAttributeNS("", "scaleFactor", "0.75");
    op.setAttribute("weight", "1");
    par.setAttribute("idref", this.idref);
    op.appendChild(par);
    return [op];
  }

  this.element = function() {
    let el = document.createElementNS("", "laplacePrior"),
        par = document.createElementNS("", "parameter");
    el.setAttribute("mean", this.mean.toString());
    el.setAttribute("scale", this.scale.toString());
    par.setAttribute("idref", this.idref);
    el.appendChild(par);
    return el;
  }
}

function FixedValuePrior(idref, initial=1.0) {
  this.idref = idref;
  this.initial = initial;
  this.bound = ['n/a', ];

  this.str = function() { return `Fixed value, value=${this.initial}`; };
  this.operator = function() { return [null]; }
  this.element = function() { return null; }
}

function UniformPrior(idref, initial=0.5, lower=0, upper=1) {
  this.idref = idref;
  this.initial = initial;
  this.bound = [lower, upper];

  this.str = function() {
    return `Uniform [${this.bound[0]}, ${this.bound[1]}], initial=${this.initial}`;
  };

  this.operator = function() {
    let op = document.createElementNS("", "scaleOperator"),
        par = document.createElementNS("", "parameter");
    op.setAttribute("scaleFactor", "0.75");
    op.setAttribute("weight", "1");
    par.setAttribute("idref", this.idref);
    op.appendChild(par);
    return [op];
  }

  this.element = function() {
    let el = document.createElementNS("", "uniformPrior"),
        par = document.createElementNS("", "parameter");
    el.setAttribute("lower", this.bound[0].toString());
    el.setAttribute("upper", this.bound[1].toString());
    par.setAttribute("idref", this.idref);
    el.appendChild(par);
    return el;
  }
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

  this.operator = function() {
    let op = document.createElementNS("", "scaleOperator"),
        par = document.createElementNS("", "parameter");
    op.setAttributeNS("", "scaleFactor", "0.75");
    op.setAttribute("weight", "1");
    par.setAttribute("idref", this.idref);
    op.appendChild(par);
    return [op];
  }

  this.element = function() {
    let el = document.createElementNS("", "exponentialPrior"),
        par = document.createElementNS("", "parameter");
    el.setAttribute("mean", this.mean.toString());
    el.setAttribute("offset", this.offset.toString());
    par.setAttribute("idref", this.idref);
    el.appendChild(par);
    return el;
  }
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

  this.element = function() {
    let el = document.createElementNS("", "dirichletPrior"),
        par = document.createElementNS("", "parameter");
    el.setAttribute("alpha", this.alpha.toString());
    el.setAttributeNS("", "sumsTo", this.sumsto.toString());
    par.setAttribute("idref", this.idref);
    el.appendChild(par);
    return el;
  }

  this.operator = function() {
    let op = document.createElementNS("", "deltaExchange"),
        par = document.createElementNS("", "parameter");
    op.setAttribute("delta", "0.01");
    op.setAttribute("weight", "1");
    par.setAttribute("idref", this.idref);
    op.appendChild(par);
    return [op];
  }
}

function DefaultPrior(idref) {
  // use tree prior only (tree model rootheight)
  this.idref = idref;
  this.bound = [0, Infinity];
  this.str = function() { return `Using Tree Prior in [0, ∞]`};
  this.element = function() { return null; };

  this.operator = function() {
    let op = document.createElementNS("", "scaleOperator"),
        par = document.createElementNS("", "parameter");
    op.setAttribute("scaleFactor", "0.75");
    op.setAttribute("weight", "3");
    par.setAttribute("idref", this.idref);
    op.appendChild(par);
    return [op];
  }

  this.element = function() { return null; };
}


// FIXME: this is incomplete
function PoissonPrior(idref) {
  this.idref = idref;
  this.rate = 0.693147;  // BEAUti v.1.10.4 does not allow this to change
  this.bound = ['n/a', ];
  this.str = function() { return `Poisson [${this.rate}]`};
}


function CTMCScalePrior(idref, initial) {
  // CTMC Rate Reference
  this.idref = idref;
  this.initial = initial;
  this.bound = [0, Infinity];
  this.str = function() { return `Approx. Reference Prior, initial=${this.initial}`};

  // TODO: this has to replace scaleOperator for allInternalNodeHeights
  this.operator = function() {
    let sOp = document.createElementNS("", "scaleOperator"),
        par1 = document.createElementNS("", "parameter"),
        udOp = document.createElementNS("", "upDownOperator"),
        up = document.createElementNS("", "up"),
        par2 = document.createElementNS("", "parameter"),
        down = document.createElementNS("", "down"),
        par3 = document.createElementNS("", "parameter");

    sOp.setAttributeNS("", "scaleFactor", "0.75");
    sOp.setAttributeNS("", "weight", "3");
    par1.setAttributeNS("", "idref", `${this.idref}`);  // clock.rate or ucld.mean
    sOp.appendChild(par1);

    udOp.setAttributeNS("", "scaleFactor", "0.75");
    udOp.setAttributeNS("", "weight", "3");
    par2.setAttributeNS("", "idref", "treeModel.allInternalNodeHeights");
    up.appendChild(par2);
    par3.setAttributeNS("", "idref", `${this.idref}`);
    down.appendChild(par3);
    udOp.appendChild(up);
    udOp.appendChild(down);

    return [sOp, udOp];
  };

  this.element = function() {
    return xmlReader.parseFromString(`<ctmcScalePrior>
  <ctmcScale>
    <parameter idref="${this.idref}"/>
  </ctmcScale>
  <treeModel idref="treeModel"/>
</ctmcScalePrior>`, 'text/xml').children[0];
  };
}



// Listing of all possible prior distributions associated with various model settings.
priors = [
  // Sites models
  {
    parameter: "kappa",
    distribution: "Lognormal",
    obj: new LogNormalPrior('kappa'),
    description: "HKY transition-transversion parameter",
    active: true,
    prior_distribution: ["Fixed value", "Infinite Uniform (Improper)", "Uniform", "Exponential", "Laplace", "Normal", "Lognormal", "Gamma", "Inverse Gamma", "1/x"]
  },
  {
    parameter: "gtr.rates",
    distribution: "Dirichlet",
    obj: new DirichletPrior("gtr.rates"),
    description: "GTR transition rates parameter",
    active: false,
    prior_distribution: ["Fixed value", "Infinite Uniform (Improper)", "Dirichlet", "Uniform", "Exponential", "Normal", "Lognormal", "Gamma", "Inverse Gamma"]
  },
  {
    parameter: "kappa1",
    distribution: "Lognormal",
    obj: new LogNormalPrior("kappa1"),
    description: "TN93 1st transition-transversion parameter",
    active: false,
    prior_distribution: ["Lognormal"]
  },
  {
    parameter: "kappa2",
    distribution: "Lognormal",
    obj: new LogNormalPrior("kappa2"),
    description: "TN93 2nd transition-transversion parameter",
    active: false,
    prior_distribution: ["Lognormal"]
  },
  {
    parameter: "frequencies",
    distribution: "Dirichlet",
    obj: new DirichletPrior("frequencies"),
    description: "base frequencies",
    active: true,
    prior_distribution: ["Fixed value", "Infinite Uniform (Improper)", "Dirichlet", "Uniform", "Exponential", "Normal", "Lognormal", "Gamma", "Inverse Gamma"]
  },
  {
    parameter: "alpha",
    distribution: "Exponential",
    obj: new ExponentialPrior("alpha"),
    description: "gamma shape parameter",
    active: false,
    prior_distribution: ["Exponential"]
  },
  {
    parameter: "pInv",
    distribution: "Uniform",
    obj: new UniformPrior("pInv"),
    description: "proportion of invariant sites parameter",
    active: false,
    prior_distribution: ["Uniform"]
  },

  // Clock models
  {
    parameter: "clock.rate",
    distribution: "Fixed value",
    obj: new FixedValuePrior("clock.rate"),
    description: "substitution rate",
    active: true,
    prior_distribution: ["Fixed value", "CTMC Rate Reference", "Infinite Uniform (Improper)", "Uniform", "Exponential", "Normal", "Lognormal", "Gamma", "Inverse Gamma", "1/x"]
  },
  {
    parameter: "clock.rate",
    distribution: "CTMC Rate Reference",
    obj: new CTMCScalePrior("clock.rate"),
    description: "substitution rate",
    active: false
  },
  {
    parameter: "ucld.mean",
    distribution: "Fixed value",
    obj: new FixedValuePrior("ucld.mean"),
    description:  "uncorrelated lognormal relaxed clock mean",
    active: true,
    prior_distribution: ["Fixed value", "CTMC Rate Reference", "Infinite Uniform (Improper)", "Uniform", "Exponential", "Normal", "Lognormal", "Gamma", "Inverse Gamma", "1/x"]
  },
  {
    parameter: "ucld.mean",
    distribution: "CTMC Rate Reference",
    obj: new CTMCScalePrior("ucld.mean"),
    description: "uncorrelated lognormal relaxed clock mean",
    active: false,
    prior_distribution: ["Fixed value", "Infinite Uniform (Improper)", "Uniform", "Exponential", "Normal", "Lognormal", "Gamma", "Inverse Gamma", "1/x"]
  },
  {
    parameter: "ucgd.mean",
    distribution: "Fixed value",
    obj: new FixedValuePrior("ucgd.mean"),
    description: "uncorrelated gamma relaxed clock mean",
    active: true,
    prior_distribution: ["Fixed value"]
  },
  {
    parameter: "uced.mean",
    distribution: "Fixed value",
    obj: new FixedValuePrior("uced.mean"),
    description: "uncorrelated exponential relaxed clock mean",
    active: true,
    prior_distribution: ["Fixed value"]
  },
  {
    parameter: "ucld.stdev",
    distribution: "Exponential",
    obj: new ExponentialPrior(idref="ucld.stdev", initial=0.3333333, mean=0.333333, offset=0),
    description: "uncorrelated lognormal relaxed clock stdev",
    active: true,
    prior_distribution: ["Exponential"]
  },
  {
    parameter: "ucgd.shape",
    distribution: "Exponential",
    obj: new ExponentialPrior(initial=0.3333333, mean=0.333333, offset=0),
    description: "uncorrelated gamma relaxed clock shape",
    active: true,
    prior_distribution: ["Exponential"]
  },
  {
    parameter: "rateChanges",
    distribution: "Poisson",
    obj: new PoissonPrior("rateChanges"),
    description: "number of random local clocks",
    active: false,
    prior_distribution: ["Poisson"]
  },
  {
    parameter: "localClock.relativeRates",
    distribution: "Gamma",
    obj: new GammaPrior('localClock.relativeRates'),
    description: "random local clock relative rates",
    active: false,
    prior_distribution: ["Gamma"]
  },

  // Tree models
  {
    parameter: "treeModel.rootHeight",
    distribution: "None (Tree Prior Only)",
    obj: new DefaultPrior('treeModel.rootHeight'),
    description: "root height of the tree",
    active: true,
    prior_distribution: ["None (Tree Prior Only)", "Infinite Uniform (Improper)", "Dirichlet", "Uniform", "Exponential", "Normal", "Lognormal", "Gamma", "Inverse Gamma"]
  },
  {
    parameter: "constant.popSize",
    distribution: "1/x",
    obj: new InversePrior('constant.popSize'),
    description: "coalescent population size parameter",
    active: true,
    prior_distribution: ["Fixed value", "Infinite Uniform (Improper)", "Uniform", "Exponential", "Normal", "Lognormal", "Gamma", "Inverse Gamma", "1/x"]
  },
  {
    parameter: "skyline.popSize",
    distribution: "Uniform",
    obj: new UniformPrior(idref='skyline.popSize', initial=1, lower=0, upper=1E100),
    description: "Bayesian Skyline population sizes",
    active: true,
    prior_distribution: ["Fixed value", "Infinite Uniform (Improper)", "Uniform", "Exponential", "Normal", "Lognormal", "Gamma", "Inverse Gamma", "1/x"]
  }
];


distribution_values = [
  {
    distribution: "Uniform",
    values:["Initial value :", "Upper :" , "Lower :"]
  },
  {
    distribution: "Lognormal",
    values: ["Initial value : ", "mu : ", "sigma : ", "Offset : "]
  },
  {
    distribution: "Fixed value",
    values: ["Initial value : "]
  },
  {
    distribution: "Exponential",
    values: ["Initial value : ", "Mean : ", "Offset : "]
  },
  {
    distribution: "1/x",
    values: ["Initial value : "]
  },
  {
    distribution: "Dirichlet",
    values: []
  },
  {
    distribution: "CTMC Rate Reference",
    values: ["Initial value :"]
  },
  {
    distribution: "None (Tree Prior Only)",
    values: []
  },
];