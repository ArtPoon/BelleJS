var xmlReader = new DOMParser();

/**
 * Create element to append to BEAST XML based on site model settings.
 * @returns {HTMLElement}
 */
function generate_site_model() {
  let frequencies = document.createElementNS("", "frequencies"),
      freq_model = document.createElementNS("", "frequencyModel"),
      aln = document.createElementNS("", "alignment"),
      fm_freq = document.createElementNS("", "frequencies"),
      fm_param = document.createElementNS("", "parameter"),
      site_model,
      model_name = $("#select-submodel").val(),
      basefreq_option = $("#select-basefreq").val();

  // <parameter>
  fm_param.setAttribute("id", "frequencies");

  if (basefreq_option === "Empirical") {
    fm_param.setAttribute("dimension", "4");
  } else {
    // estimated or all-equal
    fm_param.setAttribute("value", "0.25 0.25 0.25 0.25");
  }

  // <frequencies>
  if (basefreq_option === "Empirical") {
    aln.setAttribute("idref", "alignment");
    fm_freq.appendChild(aln);
  }
  fm_freq.appendChild(fm_param);

  freq_model.setAttributeNS("", "dataType", "nucleotide");
  freq_model.appendChild(fm_freq);
  frequencies.appendChild(freq_model);

  let kappa = document.createElement("kappa"),
      kpar = document.createElement("parameter");

  kpar.setAttribute("id", "kappa");
  kpar.setAttribute("value", model_name==="JC"?"1.0":"2.0");
  kpar.setAttribute("lower", "0.0")
  kappa.appendChild(kpar);

  if (model_name === 'JC' || model_name === 'HKY') {
    site_model = document.createElementNS("", "HKYModel");
    site_model.setAttribute("id", model_name==='HKY' ? "hky" : "jc");
    site_model.appendChild(frequencies);
    site_model.appendChild(kappa);
  }

  return(site_model);
}


function filterHTMLCollection(collection, attr, value) {
  return Array.from(collection.children)
      .filter(x=>x.getAttribute(attr) === value);
}

function filterHTMLCollectionByChild(collection, attr, value) {
  return Array.from(collection.children)
      .filter(x => x.children.length > 0)
      .filter(x => x.children[0].getAttribute(attr) === value);
}


/**
 * Convenience function - modify contents of <log> (fileLog) based on
 * active prior distributions.
 * @param html_collection
 * @param idref
 */
function update_log_settings(html_collection, idref) {
  let el = filterHTMLCollection(html_collection, "idref", idref),
      this_prior = priors.filter(x => x.parameter===idref),
      active = this_prior.filter(x => x.active);

  if (active.length > 0 && el.length === 0) {
    // restore element
    let nel = document.createElement("parameter");
    nel.setAttribute("idref", idref);
    html_collection.appendChild(nel);
  }
  if (active.length === 0 && el.length > 0) {
    // delete element
    html_collection.removeChild(el[0]);
  }
}


/**
 * FIXME: there has to be a better way to do this!
 * @param beast
 */
function updateStartingTree(beast) {
  let startingTree = beast.getElementsByTagName("constantSize")[0],
      param = startingTree.getElementsByTagName("parameter")[0],
      skyline = priors.filter(x=>x.parameter==="skyline.popSize")[0],
      constant = priors.filter(x=>x.parameter==="constant.popSize")[0],
      treeModel = beast.getElementsByTagName("treeModel")[0],
      coalescentTree = treeModel.getElementsByTagName("coalescentTree"),
      upgmaTree = treeModel.getElementsByTagName("upgmaTree"),
      coalescentSimulator = beast.getElementsByTagName("coalescentSimulator"),
      rescaledTree = beast.getElementsByTagName("rescaledTree"),
      id = skyline.active ? "initialDemo" : "constant",
      coalescentLikelihood = beast.getElementsByTagName("coalescentLikelihood"),
      generalizedSkyLineLikelihood = beast.getElementsByTagName("generalizedSkyLineLikelihood");

  // Constant size or Bayesian Skyline
  startingTree.setAttribute("id", id);
  param.setAttribute("id", `${id}.popSize`);

  if (skyline.active) {
    param.setAttribute("value", "100.0");
    if (param.hasAttribute("lower")) {
      param.removeAttribute("lower");
    }
  }
  else {
    param.setAttribute("value", constant.obj.initial.toFixed(1).toString());
    if (!param.hasAttribute("lower")) {
      param.setAttribute("lower", "0.0");
    }
  }

  if ($('#UPGMA-starting-tree').is(":checked")) {
    // UPGMA Starting Tree
    if (coalescentSimulator.length > 0) {
      let new_rescaledTree = document.createElementNS("", "rescaledTree"),
          patterns = document.createElement("patterns"),
          distanceMatrix = document.createElementNS("", "distanceMatrix"),
          new_upgmaTree = document.createElementNS("", "upgmaTree"),
          alignment = document.createElement("alignment");
      
      new_rescaledTree.setAttribute("id", "startingTree");
      distanceMatrix.setAttribute("correction", "JC");
      alignment.setAttribute("idref", "alignment");
      patterns.appendChild(alignment);
      distanceMatrix.appendChild(patterns);
      new_upgmaTree.appendChild(distanceMatrix);
      new_rescaledTree.appendChild(new_upgmaTree);
      beast.replaceChild(new_rescaledTree, coalescentSimulator[0]);
    }

    if (coalescentTree.length > 0) {
      let treeModel_upgma = document.createElementNS("", "upgmaTree");
      treeModel_upgma.setAttribute("idref", "startingTree");
      treeModel.replaceChild(treeModel_upgma, coalescentTree[0]);
    }
  }
  else {
    // Random Starting Tree
    if (rescaledTree.length > 0) {
      let new_coalescentSimulator = document.createElementNS("", "coalescentSimulator"),
          taxa = document.createElementNS("", "taxa"),
          constantSize = document.createElementNS("", "constantSize");
      new_coalescentSimulator.setAttribute("id", "startingTree");
      taxa.setAttribute("idref", "taxa");
      constantSize.setAttribute("idref", id);
      new_coalescentSimulator.appendChild(taxa);
      new_coalescentSimulator.appendChild(constantSize);
      beast.replaceChild(new_coalescentSimulator, rescaledTree[0]);
    }
    else {
      coalescentSimulator[0].getElementsByTagName("constantSize")[0].setAttribute("idref", id);
    }

    if (upgmaTree.length > 0) {
      let treeModel_coalescentTree = document.createElementNS("", "coalescentTree");
      treeModel_coalescentTree.setAttribute("idref", "startingTree");
      treeModel.replaceChild(treeModel_coalescentTree, upgmaTree[0]);
    }
  }

  let new_populationTree = document.createElementNS("", "populationTree"),
      new_treeModel = document.createElementNS("", "treeModel");

  new_treeModel.setAttribute("idref", "treeModel");
  new_populationTree.appendChild(new_treeModel);
  
  if (constant.active) {
    // Generate a Coalescent likelihood
    if (generalizedSkyLineLikelihood.length > 0) {
      beast.removeChild(beast.getElementsByTagName("exponentialMarkovLikelihood")[0]);

      let new_coalescentLikelihood = document.createElementNS("", "coalescentLikelihood"),
          new_model = document.createElement("taxa"),
          new_constantSize = document.createElementNS("", "constantSize");

      new_constantSize.setAttribute("idref", id);
      new_model.appendChild(new_constantSize);
      new_coalescentLikelihood.appendChild(new_model);
      new_coalescentLikelihood.appendChild(new_populationTree);
      beast.replaceChild(new_coalescentLikelihood, generalizedSkyLineLikelihood[0]);
    }
  }
  else {
    var num_groups = parseInt($("#skygridNumParam").val());

    // Generate a generalizedSkyLineLikelihood for Bayesian Skyline
    if (coalescentLikelihood.length > 0 && coalescentLikelihood[0].parentElement.nodeName === "beast") {
      let generalizedSkyline= xmlReader.parseFromString(`
<generalizedSkyLineLikelihood id="skyline" linear="true">
  <populationSizes>
    <parameter id="skyline.popSize" dimension="${$("#select-skyline").val() === "skylinePWConst" ? num_groups.toString() : (num_groups + 1).toString()}" value="${skyline.obj.initial.toFixed(1).toString()}" lower="${skyline.obj.bound[0].toFixed(1).toString()}"/>
  </populationSizes>
  <groupSizes>
    <parameter id="skyline.groupSize" dimension="${num_groups}"/>
  </groupSizes>
  <populationTree>
    <treeModel idref="treeModel"/>
  </populationTree>
</generalizedSkyLineLikelihood>
              `, 'text/xml').children[0],
      exponentialMarkovLikelihood = xmlReader.parseFromString(`
<exponentialMarkovLikelihood id="eml1" jeffreys="true">
  <chainParameter>
    <parameter idref="skyline.popSize"/>
  </chainParameter>
</exponentialMarkovLikelihood>
              `, 'text/xml').children[0];


      beast.replaceChild(exponentialMarkovLikelihood, coalescentLikelihood[0]);
      beast.insertBefore(generalizedSkyline, beast.getElementsByTagName("exponentialMarkovLikelihood")[0]);

    }
    else {
      let popSiz_param = generalizedSkyLineLikelihood[0].getElementsByTagName("populationSizes")[0].getElementsByTagName("parameter")[0],
          groupSiz_param = generalizedSkyLineLikelihood[0].getElementsByTagName("groupSizes")[0].getElementsByTagName("parameter")[0];
      popSiz_param.setAttribute("dimension", $("#select-skyline").val() === "skylinePWConst" ? num_groups.toString() : (num_groups + 1).toString());
      popSiz_param.setAttribute("value", skyline.obj.initial.toFixed(1).toString());
      popSiz_param.setAttribute("lower", skyline.obj.bound[0].toFixed(1).toString());
      groupSiz_param.setAttribute("dimension", num_groups);
    }
  }
}


/**
 * Update <prior> element within <mcmc>.  Members of <prior> carry <parameter>
 *   children that we associate with active or inactive prior distributions.
 *
 * @param html_collection
 * @param idref
 */
function update_prior_xml(html_collection, idref) {
  let el = filterHTMLCollectionByChild(html_collection, "idref", idref),
      this_prior = priors.filter(x=>x.parameter===idref);

  if (idref === "clock.rate" || idref === "ucld.mean") {
    let active = this_prior.filter(x => x.active);
    if (active.length > 0) {
      // FIXME: this gets called twice - for now I am using Set() in calling function.
      // remove all related elements
      for (let this_el of el) {
        html_collection.removeChild(this_el);
      }
      // append active element
      let nel = active[0].obj.element();
      if (nel !== null) {
        html_collection.appendChild(nel);
      }
    }
  }
  else {
    if (this_prior[0].active) {
      if (el.length === 0) {
        // restore element
        let nel = this_prior[0].obj.element();
        if (nel !== null) {
          html_collection.appendChild(nel);
        }
      } // otherwise no action necessary
    }
    else {
      // prior is not active
      if (el.length > 0) {
        // delete element
        html_collection.removeChild(el[0]);
      } // otherwise no action necessary
    }
  }

}


/**
 * Update <operators> element of XML based on active prior distributions.
 * @param beast:  parent Element
 */
function update_operators(beast) {
  let operators = beast.getElementsByTagName("operators")[0],
      clocks = priors.filter(x => x.parameter==="clock.rate" || x.parameter==="ucld.mean"),
      active = clocks.filter(x => x.active);

  if (active.length > 0) {
    if (active[0].obj.constructor.name === "CTMCScalePrior") {
      // need to remove default operator for treeModel.allInternalNodeHeights
      let op = Array.from(operators.children).filter(x => x.hasAttribute("ignoreBounds"));
      if (op.length === 0)
        alert("Failed to locate default treeModel.allInternalNodeHeights scaleOperator");
      else
        operators.removeChild(op[0]);
    }
    else {
      // fixed prior, restore default operator
      let sOp = document.createElementNS("", "scaleOperator"),
          par = document.createElement("parameter");
      sOp.setAttributeNS("", "scaleFactor", "0.75");
      sOp.setAttributeNS("", "scaleAll", "true");
      sOp.setAttributeNS("", "ignoreBounds", "true");
      sOp.setAttribute("weight", "3");
      par.setAttribute("idref", "treeModel.allInternalNodeHeights");
      sOp.appendChild(par);
      operators.appendChild(sOp);
    }
  }

  for (let this_prior of priors) {
    let el = filterHTMLCollectionByChild(operators, "idref", this_prior.parameter);
    if (this_prior.active) {
      if (el.length === 0) {
        // operators not loaded for this prior
        let ops = this_prior.obj.operator();
        // FIXME: need to handle situation where prior has multiple operators
        for (let op of ops) {
          if (op !== null) {
            operators.appendChild(op);
          }
        }
      }
    }
    else {
      if (el.length > 0) {
        // need to unload operators for this prior
        for (let op of el) {
          operators.removeChild(op);
        }
      }
    }
  }
}


/**
 * Update <strictClockBranchRates> or <discretizedBranchRates> elements
 * throughout XML.  Since tagName is not writable, we have to create new
 * Elements and replace the existing ones.
 * There must be a simpler way to do this...
 *
 * @param beast:  parent Element
 */
function updateBranchRates(beast) {
  let clock_option = $("#select-clock").val();

  let scbr = document.createElementNS("", "strictClockBranchRates");
  scbr.setAttributeNS("", "idref", "branchRates");

  let dbr = document.createElementNS("", "discretizedBranchRates");
  dbr.setAttributeNS("", "idref", "branchRates");

  // ========= update clock model ==========
  let branch_rates = beast.getElementsByTagName("strictClockBranchRates"),
      clock_model;

  if (branch_rates.length > 0) {
    if (clock_option !== 'strict') {
      clock_model = Array.from(branch_rates).filter(x => x.id==="branchRates")[0];

      let ucld_mean = priors.filter(x => x.parameter==='ucld.mean')[0],
          ucld_stdev = priors.filter(x => x.parameter==='ucld.stdev')[0],
          big_dbr = xmlReader.parseFromString(`
<discretizedBranchRates id="branchRates">
  <treeModel idref="treeModel"/>
  <distribution>
    <logNormalDistributionModel meanInRealSpace="true">
    <mean><parameter id="ucld.mean" value="${ucld_mean.obj.initial}"/></mean>
    <stdev><parameter id="ucld.stdev" value="${ucld_stdev.obj.initial}" lower="0.0"/></stdev>
    </logNormalDistributionModel>
  </distribution>
  <rateCategories><parameter id="branchRates.categories"/></rateCategories>
</discretizedBranchRates>`,
              'text/xml').children[0];

      beast.replaceChild(big_dbr, clock_model);
    }
  }
  else {
    branch_rates = beast.getElementsByTagName("discretizedBranchRates");
    if (branch_rates.length === 0) {
      alert("Could not retrieve either type of branchRates element!");
    }

    if (clock_option === 'strict') {
      clock_model = Array.from(branch_rates).filter(x => x.id==="branchRates")[0];

      let clock_rate = priors.filter(x => x.parameter==='clock.rate')[0],
          big_scbr = xmlReader.parseFromString(`
<strictClockBranchRates id="branchRates">
  <rate><parameter id="clock.rate" value="${clock_rate.obj.initial}"/></rate>
</strictClockBranchRates>`,
              'text/xml').children[0];

      beast.replaceChild(big_scbr, clock_model);
    }
  }

  // ========= update <rateStatistic> ==========
  let rateStatistic = beast.getElementsByTagName("rateStatistic"),
      rs_el = filterHTMLCollection(rateStatistic[0], "idref", "branchRates");
  if (rs_el.length === 0)
    alert("Failed to locate branchRates element in rateStatistic");

  if (clock_option === 'strict') {
    if (rs_el[0].tagName === 'discretizedBranchRates') {
      rateStatistic[0].removeChild(rs_el[0]);
      rateStatistic[0].appendChild(scbr);
    }

    if (rateStatistic.length > 1) {
      if (rateStatistic[1].parentElement.nodeName === "beast") {
        beast.removeChild(rateStatistic[1]);
        beast.removeChild(beast.getElementsByTagName("rateCovarianceStatistic")[0]);
      }
    }

  }
  else {
    if (rs_el[0].tagName === 'strictClockBranchRates') {
      rateStatistic[0].removeChild(rs_el[0]);
      rateStatistic[0].appendChild(dbr);
    }
    
    // Assume Lognormal Relaxed Distribution
    if (beast.getElementsByTagName("rateCovarianceStatistic").length === 0) {
      let covarianceStat = xmlReader.parseFromString(`
<rateCovarianceStatistic id="covariance" name="covariance">
  <treeModel idref="treeModel"/>
  <discretizedBranchRates idref="branchRates"/>
</rateCovarianceStatistic>`,
                'text/xml').children[0],
      coef_variation = xmlReader.parseFromString(`
<rateStatistic id="coefficientOfVariation" name="coefficientOfVariation" mode="coefficientOfVariation" internal="true" external="true">
  <treeModel idref="treeModel"/>
  <discretizedBranchRates idref="branchRates"/>
</rateStatistic>`,
                'text/xml').children[0],
      getHKY = beast.getElementsByTagName("HKYModel")[0];
      
      beast.insertBefore(covarianceStat, getHKY);
      beast.insertBefore(coef_variation, beast.getElementsByTagName("rateCovarianceStatistic")[0])
    }
  }

  // ========= update <treeDataLikelihood> =========
  let treeDataLikelihood = beast.getElementsByTagName("treeDataLikelihood")[0],
      tdl_el = filterHTMLCollection(treeDataLikelihood, "idref", "branchRates");
  if (tdl_el.length === 0)
    alert("Failed to locate branchRates element in treeDataLikelihood");

  if (clock_option === 'strict') {
    if (tdl_el[0].tagName === 'discretizedBranchRates') {
      treeDataLikelihood.removeChild(tdl_el[0]);
      treeDataLikelihood.appendChild(scbr.cloneNode());
    }
  }
  else {
    if (tdl_el[0].tagName === "strictClockBranchRates") {
      treeDataLikelihood.removeChild(tdl_el[0]);
      treeDataLikelihood.appendChild(dbr.cloneNode());
    }
  }

  // ========= update <mcmc> ========
  let mcmc = beast.getElementsByTagName("mcmc")[0],
      prior = mcmc.getElementsByTagName("prior")[0],
      logs = mcmc.getElementsByTagName("log"),
      treelog = mcmc.getElementsByTagName("logTree")[0];

  let el = filterHTMLCollection(logs[1], "idref", "branchRates"),
      lt_trait = treelog.getElementsByTagName("trait")[0],
      lt_el = filterHTMLCollection(lt_trait, "idref", "branchRates"),
      pr_el = filterHTMLCollection(prior, "idref", "branchRates");

  if (el.length === 0 || lt_el.length === 0) {
    alert("Failed to match element with idref 'branchRates' in <log>.");
  }

  if (clock_option === "strict") {
    if (el[0].tagName === "discretizedBranchRates") {
      logs[1].removeChild(el[0]);
      logs[1].appendChild(scbr.cloneNode());
    }
    if (lt_el[0].tagName === "discretizedBranchRates") {
      lt_trait.removeChild(lt_el[0]);
      lt_trait.appendChild(scbr.cloneNode());
    }
    if (pr_el[0].tagName === "discretizedBranchRates") {
      prior.removeChild(pr_el[0]);
      prior.appendChild(scbr.cloneNode());
    }
  }
  else {
    // uncorrelated relaxed clock
    if (el[0].tagName === "strictClockBranchRates") {
      logs[1].removeChild(el[0]);
      logs[1].appendChild(dbr.cloneNode());
    }
    if (lt_el[0].tagName === "strictClockBranchRates") {
      lt_trait.removeChild(lt_el[0]);
      lt_trait.appendChild(dbr.cloneNode());
    }
    if (pr_el[0].tagName === "strictClockBranchRates") {
      prior.removeChild(pr_el[0]);
      prior.appendChild(dbr.cloneNode());
    }
  }
}


/**
 * Update <mcmc> element in BEAST XML
 * @param beast:  parent Element
 */
function update_mcmc(beast) {
  let mcmc = beast.getElementsByTagName("mcmc")[0],
      prior = mcmc.getElementsByTagName("prior")[0],
      logs = mcmc.getElementsByTagName("log"),
      treelog = mcmc.getElementsByTagName("logTree")[0];

  // modify top element attributes
  mcmc.setAttribute("chainLength", $("#length_of_chain").val());
  if ($("#create_ops_file")[0].checked) {
    mcmc.setAttribute("operatorAnalysis", $("#ops_file_name").val());
  } else {
    mcmc.removeAttribute("operatorAnalysis");
  }

  // modify <prior> tag contents
  let params = new Set(priors.map(x => x.parameter));
  Array.from(params).map(x => update_prior_xml(prior, x));


  // ==== screen log settings ========
  logs[0].setAttribute("logEvery", $("#echo_to_screen").val());

  // if dated tips, report `age(root)`; otherwise `rootHeight`
  let els = filterHTMLCollection(logs[0], "label", "rootHeight");

  if (els.length === 0) {
    els = filterHTMLCollection(logs[0], "label", "age(root)");
    if (els.length === 0) {
      alert("ERROR: failed to retrieve rootHeight or age(root) column from screen log settings")
    }
    else {
      if (!$("#use_tip_dates")[0].checked) {
        // age(root) -> rootHeight
        let par = document.createElement("parameter");
        par.setAttribute("idref", "treeModel.rootHeight");
        els[0].setAttribute("label", "rootHeight");
        els[0].replaceChild(par, els[0].children[0]);

        // assume file log is affected the same way
        let fels = filterHTMLCollection(logs[1], "idref", "age(root)");
        logs[1].replaceChild(par, fels[0]);
      }
    }
  }
  else {
    if ($("#use_tip_dates")[0].checked) {
      // rootHeight -> age(root)
      let par = document.createElement("tmrcaStatistic");
      par.setAttribute("idref", "age(root)");
      els[0].setAttribute("label", "age(root)")
      els[0].replaceChild(par, els[0].children[0]);

      // update file log
      let fels = filterHTMLCollection(logs[1], "idref", "treeModel.rootHeight");
      logs[1].replaceChild(par, fels[0]);
    }
  }

  // if using dated tips, report clock.rate or ucld.mean to screen
  let clocks = priors.filter(x => x.parameter==="clock.rate" || x.parameter==="ucld.mean"),
      active = clocks.filter(x => x.active);

  if (active.length > 0) {
    let this_clock = active[0].parameter,
        els = filterHTMLCollectionByChild(logs[0], "idref", this_clock);

    if (active[0].obj.constructor.name === "CTMCScalePrior") {
      // add ucld.mean to screen log if not present
      if (els.length === 0) {
        let column = document.createElementNS("", "column"),
            par = document.createElement("parameter");
        column.setAttribute("label", this_clock);
        column.setAttribute("sf", "6");
        column.setAttribute("width", "12");
        par.setAttribute("idref", this_clock);
        column.appendChild(par);
        logs[0].appendChild(column);
      }
    }
    else {
      // remove ucld.mean from screen log if present
      if (els.length > 0) {
        logs[0].removeChild(els[0]);
      }
    }
  }

  // === file log settings ======================
  logs[1].setAttribute("logEvery", $("#log_parameters_every").val());
  logs[1].setAttribute("fileName", $("#log_file_name").val());

  priors.map(x => update_log_settings(logs[1], x.parameter));


  // === tree log settings ====================
  treelog.setAttribute("logEvery", $("#log_parameters_every").val());
  treelog.setAttribute("fileName", $("#trees_file_name").val());
}


/**
 * Write taxa and sequence information into XML.
 * @param beast
 */
function update_alignment(beast) {
  let taxa = beast.getElementsByTagName('taxa').taxa,  // HTMLCollection
      aln = beast.getElementsByTagName('alignment').alignment;  // HTMLCollection

  // append user taxa and sequences
  for (let i=0; i < alignment.length; i++) {
    let taxon = document.createElement('taxon');
    taxon.setAttribute("id", alignment[i]['header']);

    // apply tip date settings
    if ($("#use_tip_dates")[0].checked) {
      let date = document.createElement('date');
      date.setAttribute("value", alignment[i]['date']);
      if ($("#dates_as_direction").val() === 'since') {
        date.setAttribute("direction", "forwards");
      }
      else {
        date.setAttribute("direction", "backwards");
      }
      date.setAttribute("units", $("#dates_as_units").val());
      taxon.appendChild(date);
    }

    taxa.appendChild(taxon);

    let seq = document.createElement('sequence'),
        seq_taxon = document.createElement('taxon');
    seq_taxon.setAttribute("idref", alignment[i]['header']);

    // setting textContent wipes out all child nodes
    if ($("#sample_prior_only")[0].checked) {
      seq.textContent = "???";
    }
    else {
      seq.textContent = alignment[i]["rawseq"];
    }
    seq.appendChild(seq_taxon);
    aln.appendChild(seq);
  }
}

/**
 * export_xml
 * Bind event handler to "Generate BEAST XML" button
 * Map values of input elements to populate XML template, serialize
 * and write the result to a file.
 */
function export_xml() {
  // transfer sequence alignment
  let beast = beast_xml.children[0];

  update_alignment(beast);
  updateStartingTree(beast);

  // replace substitution model
  let sub_model = generate_site_model(),
      default_model = beast.getElementsByTagName("HKYModel")[0];
  beast.replaceChild(sub_model, default_model);

  let site_model = beast.getElementsByTagName("siteModel")[0];
  site_model.children[0].children[0]
      .setAttribute("idref", $("#select-submodel").val()==="HKY" ? "hky" : "jc");

  // is this a dated tip analysis?  if not, omit tmrcaStatistic
  let tmrca = beast.getElementsByTagName("tmrcaStatistic");
  if ($("#use_tip_dates")[0].checked && tmrca.length === 0) {
    let el = document.createElement("tmrcaStatistic"),
        tm = document.createElement("treeModel");

    el.setAttribute("id", "age(root)");
    el.setAttribute("absolute", "true");
    tm.setAttribute("idref", "treeModel");
    el.appendChild(tm);
    beast.appendChild(el);
  }

  // update operators
  update_operators(beast);

  // update MCMC settings
  update_mcmc(beast);

  updateBranchRates(beast);

  // serialize XML to write to file
  let serializer = new XMLSerializer();
  let xmlString = serializer.serializeToString(beast_xml);

  let blob = new Blob([xmlString],
      {type: "text/plain;charset=utf-8"});
  saveAs(blob, $("#filename_stem").val()+".xml");
}
