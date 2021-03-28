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
  this.active = true;
  this.idref = idref;
  this.initial = initial;
  this.mu = mu;
  this.sigma = sigma;
  this.offset = offset;
  this.bound = [lower, upper];
  this.str = function() {
    return `LogNormal [${this.mu}, ${this.sigma}], initial=${this.initial}`
  };
  // TODO: generate operator element
  this.operator = function() {

  }
}


function NormalPrior(idref, initial=0.0, mean=0.0, stdev=1.0, lower=-Infinity, upper=Infinity) {
  this.active = true;
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
  this.active = true;
  this.idref = idref;
  this.initial = initial;
  this.bound = [lower, upper];
  this.str = function() { return `1/x, initial=${this.initial}` };
}

function GammaPrior(idref, initial=2.0, shape=0.5, scale=2, offset=0.0,
                    lower=0, upper=Infinity) {
  this.active = true;
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
  this.active = true;
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
  this.active = true;
  this.idref = idref;
  this.initial = initial;
  this.bound = ['n/a', ];
  this.str = function() { return `Fixed value, value=${this.initial}`; };
}

function UniformPrior(idref, initial=0.5, lower=0, upper=1) {
  this.active = true;
  this.idref = idref;
  this.initial = initial;
  this.bound = [lower, upper];
  this.str = function() {
    return `Uniform [${this.bound[0]}, ${this.bound[1]}], initial=${this.initial}`;
  };
}

function ExponentialPrior(idref, initial=0.5, mean=0.5, offset=0,
                          lower=0, upper=Infinity) {
  this.active = true;
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
  this.active = true;
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
  this.active = true;
  this.idref = idref;
  this.bound = [0, Infinity];
  this.str = function() { return `Using Tree Prior in [0, ∞]`};
}

function PoissonPrior(idref) {
  this.active = true;
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
    description: "HKY transition-transversion parameter"
  },
  {
    parameter: "gtr.rates",
    obj: new DirichletPrior("gtr.rates"),
    description: "GTR transition rates parameter"
  },
  {
    parameter: "kappa1",
    obj: new LogNormalPrior("kappa1"),
    description: "TN93 1st transition-transversion parameter"
  },
  {
    parameter: "kappa2",
    obj: new LogNormalPrior("kappa2"),
    description: "TN93 2nd transition-transversion parameter"
  },
  {
    parameter: "frequencies",
    obj: new DirichletPrior("frequencies"),
    description: "base frequencies"
  },
  {
    parameter: "alpha",
    obj: new ExponentialPrior("alpha"),
    description: "gamma shape parameter"
  },
  {
    parameter: "pInv",
    obj: new UniformPrior("pInv"),
    description: "proportion of invariant sites parameter"
  },

  // Clock models
  {
    parameter: "clock.rate",
    obj: new FixedValuePrior("clock.rate"),
    description: "substitution rate"
  },
  {
    parameter: "ucld.mean",
    obj: new FixedValuePrior("ucld.mean"),
    description:  "uncorrelated lognormal relaxed clock mean"
  },
  {
    parameter: "ucgd.mean",
    obj: new FixedValuePrior("ucgd.mean"),
    description: "uncorrelated gamma relaxed clock mean"
  },
  {
    parameter: "uced.mean",
    obj: new FixedValuePrior("uced.mean"),
    description: "uncorrelated exponential relaxed clock mean"
  },
  {
    parameter: "ucld.stdev",
    obj: new ExponentialPrior(idref="ucld.stdev", initial=0.3333333, mean=0.333333, offset=0),
    description: "uncorrelated lognormal relaxed clock stdev"
  },
  {
    parameter: "ucgd.shape",
    obj: new ExponentialPrior(initial=0.3333333, mean=0.333333, offset=0),
    description: "uncorrelated gamma relaxed clock shape"
  },
  {
    parameter: "rateChanges",
    obj: new PoissonPrior("rateChanges"),
    description: "number of random local clocks"
  },
  {
    parameter: "localClock.relativeRates",
    obj: new GammaPrior('localClock.relativeRates'),
    description: "random local clock relative rates"
  },

  // Tree models
  {
    parameter: "treeModel.rootHeight",
    obj: new DefaultPrior('treeModel.rootHeight'),
    description: "root height of the tree"
  },
  {
    parameter: "constant.popSize",
    obj: new InversePrior('constant.popSize'),
    description: "coalescent population size parameter"
  },
  {
    parameter: "skyline.popSize",
    obj: new UniformPrior(idref='skyline.popSize', initial=1, lower=0, upper=1E100),
    description: "Bayesian Skyline population sizes"
  }
];


function getPriorValues() {
  var rows = [],
      prior_parameters = [];

  // Sites Tab
  let objIndex,
      site_model = $("#select-submodel").val();


  if (site_model !== "JC") {
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
  if (site_model !== "uncorrelated") {
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

  let tree_model = $("#select-treeModel").val();
  if (tree_model !== "skyline") {
    prior_parameters.push(tree_model + ".popSize");
  }
  else
    prior_parameters.push("skyline.popSize");

  // TODO: replace with d3
  prior_parameters.forEach( function(param) {
    objIndex = priors.findIndex(obj => obj.parameter === param);
    let [lower, upper] = priors[objIndex].obj.bound;
    let curr_row = [
      priors[objIndex].parameter,
      priors[objIndex].obj.str(),
      (lower !== "n/a") ? (`[${lower}, ${upper===Infinity ? "∞" : upper}]`) : "n/a",
      priors[objIndex].description
    ];
    rows.push(curr_row);
  });

  return rows;
}