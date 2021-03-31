$( function() {
  $( "#tabs" ).tabs();
} );


// sites
function changeSubModel() {
  let submod = $("#select-submodel").val(),
      kappa = priors.filter(x => x.parameter === 'kappa')[0],
      freq = $("#select-basefreq");

  if (submod === "JC") {
    freq.val("Equal");
    freq[0].disabled = true;
  }
  else {
    freq.val("Estimated");
    freq[0].disabled = false;
  }
  kappa.active = submod !== "JC";
  changeBaseFreq();
}

function changeBaseFreq() {
  let freq = priors.filter(x => x.parameter === 'frequencies')[0];
  if ($("#select-submodel").val() !== "JC") {
    // turn of deltaExchange operator if Empirical or All equal
    freq.active = ($("#select-basefreq").val() === "Estimated");
  } else {
    freq.active = false;
  }
}

function changeClockType() {
  let strict = priors.filter(x => x.parameter === 'clock.rate'),
      relaxed = priors.filter(x => x.parameter.startsWith('uc')),
      relaxed_dist = $("#select-relaxed-dist")[0],
      use_tip_dates = $("#use_tip_dates")[0].checked;

  // turn off everything related to relaxed clock models
  strict.map(x => x.active = false);
  relaxed.map(x => x.active = false);

  if ($("#select-clock").val() === "strict") {
    relaxed_dist.disabled = true;

    strict.filter(x => x.obj.constructor.name === "FixedValuePrior")[0].active = !use_tip_dates;
    strict.filter(x => x.obj.constructor.name === "CTMCScalePrior")[0].active = use_tip_dates;
  }
  else {
    // uncorrelated
    relaxed_dist.disabled = false;

    switch (relaxed_dist.value) {
      case "lognormal":
        let ucld_mean = priors.filter(x => x.parameter === "ucld.mean");

        ucld_mean.filter(x => x.obj.constructor.name === "FixedValuePrior")[0].active = !use_tip_dates;
        ucld_mean.filter(x => x.obj.constructor.name === "CTMCScalePrior")[0].active = use_tip_dates;

        let ucld_var = priors.filter(x => x.parameter === "ucld.stdev")[0];
        ucld_var.active = true;
        break;
    }
  }
}


function changeTreePrior() {
  let select_tree_prior = $("#select-treeModel")[0],
      constant = priors.filter(x => x.parameter === 'constant.popSize')[0],
      skyline = priors.filter(x => x.parameter === 'skyline.popSize')[0],
      rows = $("table.treePriorTable tr");

  if (select_tree_prior.value === "constant") {
    constant.active = true;
    skyline.active = false;
    rows.filter(".parGrow").hide();
    rows.filter(".parSkyline").hide();
  }
  else if (select_tree_prior.value === "skyline") {
    constant.active = false;
    skyline.active = true;
    rows.filter(".parGrow").hide();
    rows.filter(".parSkyline").show();
  }
  else {
    // exponential, logistic, expansion
    rows.filter(".parGrow").show();
    rows.filter(".parSkyline").hide();
  }
}


function updateNCat(val) {
  $( '#ncat-display' )[0].innerHTML=val;
}

function activateNCat(val) {
  $('#ncat-range')[0].disabled = !(val === 'G' || val === 'GI');
}


$( document ).ready(function() {
  $( '#ncat-range' ).trigger("change");
  $( '#select-treeModel' ).trigger("change");
  // tips

  //parser
  $("#parser_order_prefix").change(swap_parseOpts);
  $("#parser_order_only").change(swap_parseOpts);
  swap_parseOpts();

  //Active tip labels
  $('#use_tip_dates').change(Unlock_tipOpts);

  // trigger event handlers to activate/inactivate priors
  changeSubModel();
  changeBaseFreq();
  changeClockType();
  changeTreePrior();
});


function Unlock_tipOpts(){
  //If selected, enable buttons
  let parser = $('#Parser').removeClass(),
      unlock = !document.getElementById('use_tip_dates').checked;

  parser.attr("disabled", unlock);
  $("#dates_as_units").attr("disabled", unlock);
  $("#dates_as_direction").attr("disabled", unlock);
  //$("#specify_origin_date").attr("disabled", unlock);
  //$("#origin_date").attr("disabled", unlock);

  changeClockType();
}


function swap_parseOpts(){
  if ($('#parser_order_prefix').is(":checked")){
    $('#parser_order_choice').prop('disabled', false)
    $('#delimeter').prop('disabled', false)
  }
  else {
    $('#parser_order_choice').prop('disabled', 'disabled')
    $('#delimeter').prop('disabled', 'disabled')
  }
}


function daysIntoYear(date){
  return (Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) - Date.UTC(date.getFullYear(), 0, 0)) / 24 / 60 / 60 / 1000;
}


function loadPriors(prior){
  //Takes prior object, and modifies form to show fields that can be changed
  $('#prior_form_description').html(prior.Description);
  d3.select("#ui-id-13").text(`Prior for parameter ${prior.Parameter}`);
  d3.select("#prior_form_Parameter").text(`Select prior distribution for ${prior.Parameter}`);
  d3.selectAll(".ui-icon-closethick").remove();

  row = priors.filter(x => x.parameter===prior.Parameter)[0];

  d3.select('#prior-distribution')
    .selectAll('option').remove();

  var options = d3.select('#prior-distribution')
    .selectAll('option')
    .data([row.distribution])
    .enter()
    .append('option')
    .attr('value', d => d)
    .text(function(d) { console.log(d); return d});

  var options = distribution_values.filter(x => x.distribution===row.distribution)[0];

  var formTable = d3.select("#change-parameters");
  formTable.selectAll("div").remove();
  let rows = formTable.selectAll("div")
      .data(options.values)
      .enter()
      .append("div")
      .append('label')
      .text(function(d, i) {return d})
      .append('input')
      .attr("id", function(d) {
        return d.split(" ")[0]
      })
      .attr("type", "text");
}

$( function() {
  /* Code for parsing date form
  */
  function parseDates(){
    //:TODO: Add 'just by its order date processing algorithm'
    if ($('#parser_order_prefix').is(":checked")){
      //Prefix and order
      //Function to parse dates based on field values
      target_field = $("#parser_order_choice").val() //Indexing on 0
      delimeter = $('#delimeter').val() 
      if (target_field < 0 ){
        target_field = alignment[0]['header'].split(delimeter).length + parseInt(target_field)
      }
      for (let i=0; i<alignment.length; i++) {
        alignment[i]["date"] = alignment[i]['header'].split(delimeter)[target_field];
      }
    }

  var days = new Date().getFullYear() % 4 === 0 ? 366 : 365;
  //Assuming dates are parsed as dates = [{name:"abcd_yyyy/mm/dd", Value: 'date'}, {...}]
  //Generate tip lengths

  let max_date = d3.max(alignment, d=> d.date),
      new_data = alignment.map( function(x) {
        return {"Name": x["header"],
          "Date": new Date(x["date"]).getFullYear() +
              daysIntoYear(new Date(x["date"])) /
              (new Date(x["date"]).getFullYear() % 4 === 0 ? 366 : 365),
          'Uncertainty': 0.0,
          "Height": (Date.parse(max_date) - Date.parse(x["date"])) /
              86400000 / (new Date(x["date"]).getFullYear() % 4 === 0 ? 366 : 365)
        };
      })

  //Change tip table with new data
  let tips_table = d3.select("#tab-tips tbody"),
      columns = ['Name', 'Date', 'Uncertainty', 'Height'];

  let rows = tips_table.selectAll("tr")
      .data(new_data);

  // Clear old tds
  let cells = rows.selectAll("td")
      .data(function(row) {
        return columns.map(function(column) {
          return {column: column, value: row[column]};
        })
      })
      .text( function(d) {
        return(d.value);
      })
      .exit()
      .remove();

    dialog.dialog( "close" );
  }

  var dialog, form,

  dialog = $( "#parse-dates-form" ).dialog({
    autoOpen: false,
    height: 400,
    width: 400,
    modal: true,
    buttons: {
      "ok": parseDates,
      Cancel: function() {
        dialog.dialog( "close" );
      }
    },
    close: function() {
      form[ 0 ].reset();
    }
  });

  form = dialog.find( "form" ).on( "submit", function( event ) {
    event.preventDefault();
  });

  $( "#Parser" ).button().on( "click", function() {
    dialog.dialog( "open" );
  });

  $('#priors-tab').on("click", function() {
    // refresh priors table
    $("#priorTable tbody").empty();

    let prior_table = d3.select("#priorTable tbody"),
        columns = ['Parameter', 'Prior', 'Bound', 'Description'],
        row_data = priors.filter(x => x.active)
            .map(function(row) {
          let [lower, upper] = row.obj.bound;
          return {
            'Parameter': row.parameter,
            'Prior': row.obj.str(),
            'Bound': (lower !== "n/a") ? (`[${lower}, ${upper===Infinity ? "∞" : upper}]`) : "n/a",
            'Description': row.description
          }
        });

    let rows = prior_table.selectAll("tr")
        .data(row_data)
        .enter()
        .append("tr")
        .on("click", function(d) {
          prior_dialog.dialog("open")
          loadPriors(d)
          prior = d
          // TODO: spawn modal window to change prior hyperparameters
          console.log(d);
        })
        .on("mouseover", function(){
          d3.select(this).style("background-color", "#e2e2e2");}) //mouseover highlight
        .on("mouseout", function(){
          d3.select(this).style("background-color", null);});  //mouseout unhighlight

    let cells = rows.selectAll("td")
        .data(function(row) {
          return columns.map(function(column) {
            return {column: column, value: row[column]};
          })
        })
        .enter()
        .append("td")
        .text(function(d) { return (d.value); });
  });

} );

$( function() {
  /* Code for changing prior
  */
 
  function changePriors(){
    //Update bound information
    // bound = Array($('#prior_form_lower_bound').val(), $('#prior_form_upper_bound').val())
    // priors.filter(x=> x.parameter===prior.Parameter)[0].obj.bound = bound
    
    // Update hyperparameters
    let row;
    switch(prior.Parameter) {
      case "kappa":
      {
        row = priors.filter(x => x.parameter==="kappa")[0];
        if ($("#Initial").val())
          row.obj.initial = parseFloat($("#Initial").val());
        if ($("#mu").val())
          row.obj.mu = parseFloat($("#mu").val());
        if ($("#sigma").val())
          row.obj.sigma = parseFloat($("#sigma").val());
        if ($("#Offset").val())
          row.obj.offset = parseFloat($("#Offset").val());
        break;
      }
      case "ucld.stdev":
      {
        row = priors.filter(x => x.parameter==="ucld.stdev")[0];
        if ($("#Initial").val())
          row.obj.initial = parseFloat($("#Initial").val());
        if ($("#Mean").val())
          row.obj.mean = parseFloat($("#Mean").val());
        if ($("#Offset").val())
          row.obj.offset = parseFloat($("#Offset").val());
        break;
      }
      case "clock.rate":
      case "ucld.mean":
      {
        row = priors.filter(x => x.parameter===prior.Parameter)[prior.Prior.split(" ")[0] === "Fixed" ? 0 : 1];
        if ($("#Initial").val())
          row.obj.initial = parseFloat($("#Initial").val());
        break;
      }
      case "constant.popSize":
      {
        row = priors.filter(x => x.parameter==="constant.popSize")[0];
        if ($("#Initial").val())
          row.obj.initial = parseFloat($("#Initial").val());
        break;
      }
      case "skyline.popSize":
      {
        row = priors.filter(x => x.parameter===prior.Parameter)[0];
        if ($("#Initial").val())
          row.obj.initial = parseFloat($("#Initial").val());
        if ($("#Upper").val())
          row.obj.bound[1] = parseFloat($("#Upper").val());
        if ($("#Lower").val())
          row.obj.bound[0] = parseFloat($("#Lower").val());
        break;
      }
    }

    //update Table
    changeSubModel();
    changeBaseFreq();
    changeClockType();
    changeTreePrior();
    $('#priors-tab').click();
    prior_dialog.dialog( "close" );
  }


  prior_dialog = $( "#change-priors-form" ).dialog({
    autoOpen: false,
    height: 400,
    width: 400,
    modal: true,
    buttons: {
      "ok": changePriors,
      Cancel: function() {
        prior_dialog.dialog( "close" );
      }
    },
    close: function() {
      form[ 0 ].reset();
    }
  });

  form = prior_dialog.find( "form" ).on( "submit", function( event ) {
    event.preventDefault();
  });




} );