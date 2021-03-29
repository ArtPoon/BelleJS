/**
 * Create element to append to BEAST XML based on site model settings.
 * @returns {HTMLElement}
 */
function generate_site_model() {
  let frequencies = document.createElement("frequencies"),
      freq_model = document.createElement("frequencyModel"),
      fm_freq = document.createElement("frequencies"),
      fm_param = document.createElement("parameter"),
      site_model,
      model_name = $("#select-submodel").val();

  fm_param.setAttribute("id", "frequencies");
  fm_param.setAttribute("value", "0.25 0.25 0.25 0.25");

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
    site_model.setAttribute("id", "hky");
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
  let el = filterHTMLCollection(html_collection, "idref", idref);
  if (priors.filter(x=>x.parameter===idref)[0].active) {
    if (el.length === 0) {
      // restore element
      let nel = document.createElement("parameter");
      nel.setAttribute("idref", idref);
      html_collection.appendChild(nel);
    } // otherwise no action necessary
  } else {
    if (el.length > 0) {
      // delete element
      html_collection.removeChild(el[0]);
    } // otherwise no action necessary
  }
}

function updateStartingTree(beast) {
  let startingTree = beast.getElementsByTagName("constantSize")[0],
      param = startingTree.getElementsByTagName("parameter")[0],
      skyline = priors.filter(x=>x.parameter==="skyline.popSize")[0],
      constant = priors.filter(x=>x.parameter==="constant.popSize")[0];

  // Constant size or Bayesian Skyline
  if (skyline.active) {
    startingTree.setAttribute("id", "initialDemo");
    param.setAttribute("value", "100.0");
    param.setAttribute("id", "initialDemo.popSize");
    if (param.hasAttribute("lower")) {
      param.removeAttribute("lower");
    }
  }
  else {
    startingTree.setAttribute("id", "constant");
    var val = priors.filter(x=>x.parameter==="constant.popSize")[0].obj.initial;
    param.setAttribute("value", val.toFixed(1).toString());
    param.setAttribute("id", "constant.popSize");
    if (!param.hasAttribute("lower")) {
      param.setAttribute("lower", "0.0");
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
      this_prior = priors.filter(x=>x.parameter===idref)[0];

  if (this_prior.active) {
    if (el.length === 0) {
      // restore element
      let nel = this_prior.obj.element();
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


/**
 * Update <operators> element of XML based on active prior distributions.
 * @param beast:  parent Element
 */
function update_operators(beast) {
  let operators = beast.getElementsByTagName("operators")[0];

  for (let this_prior of priors) {
    let el = filterHTMLCollectionByChild(operators, "idref", this_prior.parameter);
    if (this_prior.active) {
      if (el.length === 0) {
        let nel = this_prior.obj.operator();
        if (nel !== null) {
          operators.appendChild(nel);
        }
      }
    }
    else {
      if (el.length > 0) {
        operators.removeChild(el[0]);
      }
    }
  }
}


/**
 * Update <strictClockBranchRates> or <discretizedBranchRates> elements
 * throughout XML.  Since tagName is not writable, we have to create new
 * Elements and replace the existing ones.
 *
 * @param beast:  parent Element
 */
function updateBranchRates(beast) {
  let clock_option = $("#select-clock").val();

  let scbr = document.createElementNS("", "strictClockBranchRates");
  scbr.setAttributeNS("", "idref", "branchRates");

  let dbr = document.createElementNS("", "discretizedBranchRates");
  dbr.setAttributeNS("", "idref", "branchRates");

  // ========= update <rateStatistic> ==========
  let rateStatistic = beast.getElementsByTagName("rateStatistic")[0],
      rs_el = filterHTMLCollection(rateStatistic, "idref", "branchRates");
  if (rs_el.length === 0)
    alert("Failed to locate branchRates element in rateStatistic");

  if (clock_option === 'strict') {
    if (rs_el[0].tagName === 'discretizedBranchRates') {
      rateStatistic.removeChild(rs_el[0]);
      rateStatistic.appendChild(scbr);
    }
  }
  else {
    if (rs_el[0].tagName === 'strictClockBranchRates') {
      rateStatistic.removeChild(rs_el[0]);
      rateStatistic.appendChild(dbr);
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
      treeDataLikelihood.appendChild(scbr);
    }
  }
  else {
    if (tdl_el[0].tagName === "strictClockBranchRates") {
      treeDataLikelihood.removeChild(tdl_el[0]);
      treeDataLikelihood.appendChild(dbr);
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
      logs[1].appendChild(scbr);
    }
    if (lt_el[0].tagName === "discretizedBranchRates") {
      lt_trait.removeChild(lt_el[0]);
      lt_trait.appendChild(scbr);
    }
    if (pr_el[0].tagName === "discretizedBranchRates") {
      prior.removeChild(pr_el[0]);
      prior.appendChild(scbr);
    }
  }
  else {
    // uncorrelated relaxed clock
    if (el[0].tagName === "strictClockBranchRates") {
      logs[1].removeChild(el[0]);
      logs[1].appendChild(dbr);
    }
    if (lt_el[0].tagName === "strictClockBranchRates") {
      lt_trait.removeChild(lt_el[0]);
      lt_trait.appendChild(dbr);
    }
    if (pr_el[0].tagName === "strictClockBranchRates") {
      prior.removeChild(pr_el[0]);
      prior.appendChild(dbr);
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
  priors.map(x => update_prior_xml(prior, x.parameter));

  // screen log settings
  logs[0].setAttribute("logEvery", $("#echo_to_screen").val());

  // === file log settings ======================
  logs[1].setAttribute("logEvery", $("#log_parameters_every").val());
  logs[1].setAttribute("fileName", $("#log_file_name").val());

  priors.map(x => update_log_settings(logs[1], x.parameter));

  // === tree log settings ====================
  treelog.setAttribute("logEvery", $("#log_parameters_every").val());
  treelog.setAttribute("fileName", $("#trees_file_name").val());
}


/**
 * export_xml
 * Bind event handler to "Generate BEAST XML" button
 * Map values of input elements to populate XML template, serialize
 * and write the result to a file.
 */
function export_xml() {
  // transfer sequence alignment
  let beast = beast_xml.children[0],
      taxa = beast.getElementsByTagName('taxa').taxa,  // HTMLCollection
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

  update_tree_prior(beast);

  // replace substitution model
  let site_model = generate_site_model(),
      default_model = beast.getElementsByTagName("HKYModel")[0];
  beast.replaceChild(site_model, default_model);

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
