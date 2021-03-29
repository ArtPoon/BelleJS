/**
 * Create element to append to BEAST XML based on site model settings.
 * @param model_name
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


function update_mcmc(default_mcmc) {
  let prior = default_mcmc.getElementsByTagName("prior")[0],
      logs = default_mcmc.getElementsByTagName("log"),
      treelog = default_mcmc.getElementsByTagName("logTree")[0];

  // modify top element attributes
  default_mcmc.setAttribute("chainLength", $("#length_of_chain").val());
  if ($("#create_ops_file")[0].checked) {
    default_mcmc.setAttribute("operatorAnalysis", $("#ops_file_name").val());
  } else {
    default_mcmc.removeAttribute("operatorAnalysis");
  }

  // screen log settings
  logs[0].setAttribute("logEvery", $("#echo_to_screen").val());

  // === file log settings ======================
  logs[1].setAttribute("logEvery", $("#log_parameters_every").val());
  logs[1].setAttribute("fileName", $("#log_file_name").val());

  priors.map(x => update_log_settings(logs[1], x.parameter));

  // strictClockBranchRates or discretizedBranchRates?
  let el1 = filterHTMLCollection(logs[1], "idref", "strictClockBranchRates"),
      el2 = filterHTMLCollection(logs[1], "idref", "discretizedBranchRates");
  if ($("#select-clock").val() === "strict") {
    if (el1.length > 0) {

    }
  }

  // === tree log settings ====================
  treelog.setAttribute("logEvery", $("#log_parameters_every").val());
  treelog.setAttribute("fileName", $("#trees_file_name").val());



  //

  return default_mcmc;
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

  // replace substitution model
  let site_model = generate_site_model(),
      default_model = beast.getElementsByTagName("HKYModel")[0];
  beast.replaceChild(site_model, default_model);

  // update MCMC settings - FIXME: replaceChild might be unnecessary
  let default_mcmc = beast.getElementsByTagName("mcmc")[0],
      user_mcmc = update_mcmc(default_mcmc);
  beast.replaceChild(user_mcmc, default_mcmc);

  // serialize XML to write to file
  let serializer = new XMLSerializer();
  let xmlString = serializer.serializeToString(beast_xml);

  let blob = new Blob([xmlString],
      {type: "text/plain;charset=utf-8"});
  saveAs(blob, $("#filename_stem").val()+".xml");
}
