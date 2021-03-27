$( function() {
  $( "#tabs" ).tabs();
} );

// sites
function changeSubModel(val) {
  json.beast.siteModel.substitutionModel
}

function updateNCat(val) {
  $( '#ncat-display' )[0].innerHTML=val;
}

function activateNCat(val) {
  if (val == 'G' | val=='GI') {
    $( '#ncat-range' )[0].disabled = false;
  } else {
    $( '#ncat-range' )[0].disabled = true;
  }
}

function activateRelaxed(val) {
  if (val=='uncorrelated') {
    $( '#select-relaxed-dist' )[0].disabled = false;
  } else {
    $( '#select-relaxed-dist' )[0].disabled = true;
  }
}

function configureTreeModel(val) {
  var rows = $("table.treePriorTable tr");

  if (val=='constant') {
    rows.filter(".parGrow").hide();
    rows.filter(".parSkyline").hide();
  }
  else if (val=='skyline') {
    rows.filter(".parGrow").hide();
    rows.filter(".parSkyline").show();
  }
  else {
    // exponential, logistic, expansion
    rows.filter(".parGrow").show();
    rows.filter(".parSkyline").hide();
  }
}

$( document ).ready(function() {
  $( '#ncat-range' ).trigger("change");
  $( '#select-treeModel' ).trigger("change");
  // tips

  // sites
  d3.select("#select-submodel").on("change", function() {
    console.log(this.value);
  });

  //parser
  $("#parser_order_prefix").change(swap_parseOpts);
  $("#parser_order_only").change(swap_parseOpts);
  swap_parseOpts()

  //Active tip labels
  $('#use_tip_dates').change(Unlock_tipOpts)
 

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


$( function() {

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


  dialog = $( "#dialog-form" ).dialog({
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
    addUser();
  });

  $( "#Parser" ).button().on( "click", function() {
    dialog.dialog( "open" );
  });
} );

