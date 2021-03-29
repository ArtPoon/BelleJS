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
}

function changeBaseFreq() {
  let freq = priors.filter(x => x.parameter === 'frequencies')[0];
  if ($("#select-submodel").val() !== "JC") {
    freq.active = ($("#select-basefreq").val() === "Estimated");
  } else {
    freq.active = false;
  }
}

function changeClockType() {
  let clock_rate = priors.filter(x => x.parameter === 'clock.rate')[0],
      relaxed = priors.filter(x => x.parameter.startsWith('uc')),
      relaxed_dist = $("#select-relaxed-dist")[0];

  relaxed.map(x => x.active = false);
  if ($("#select-clock").val() === "strict") {
    clock_rate.active = true;
    relaxed_dist.disabled = true;
  }
  else {
    // uncorrelated
    relaxed_dist.disabled = false;
    clock_rate.active = false;
    switch (relaxed_dist.value) {
      case "lognormal":
        priors.filter(x => x.parameter.startsWith('ucld'))
            .map(x => x.active = true);
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
  $('#prior_form_description').html(prior.Description) 
  $('#prior_form_Parameter').html('Modify ' + prior.Parameter + ' below')
  if (prior.Bound == 'n/a'){
   $('#prior_form_lower_bound').attr('disabled', 'disabled')
   $('#prior_form_upper_bound').attr('disabled', 'disabled')
   $('#prior_form_bound_title').html('Bound: n/a')
  }
  else{
   $('#prior_form_lower_bound').removeAttr('disabled')
   $('#prior_form_upper_bound').removeAttr('disabled')
   $('#prior_form_bound_title').html('Bound:')
   parsed_bounds = prior.Bound.replace(/[\[\] ']+/g,'').split(',')
   $('#prior_form_lower_bound').val(parsed_bounds[0])
   $('#prior_form_upper_bound').val(parsed_bounds[1])
  }


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
 
  function changePriors(prior){
    
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

  /*
  $( "#Parser" ).button().on( "click", function() {
    prior_dialog.dialog( "open" );
  });
  */



} );