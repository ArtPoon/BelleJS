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

});



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

function addDates(table, dates){

}


$( function() {

  function parseDates(){
    if ($('#parser_order_prefix').is(":checked")){
      //Prefix and order
      //Function to parse dates based on field values
      target_field = $("#parser_order_choice").val() //Indexing on 0
      delimeter = $('#delimeter').val() 
      if (target_field < 0 ){
        target_field = alignment[0]['header'].split(delimeter).length + parseInt(target_field)
      }
      dates = alignment.map( function(x){
                    row = { "header": x['header'], 
                            "date": x['header'].split(delimeter)[target_field]
                          } 
                    return row
                    });
    }


  //Assuming dates are parsed as dates = [{name:"abcd_yyyy/mm/dd", Value: 'date'}, {...}]
  //Generate tip lengths

  max_date = d3.max(dates, d=> d.date)
  new_data = dates.map( function(x){
                  row = { "Name": x["header"],
                          "Date": x["date"],
                          'Uncertainty': 0.0,
                          "Height": (Date.parse(max_date) - Date.parse(x["date"])) / 86400000 / 365
                  }
                  return row
                  });    
  console.log(new_data)

  //Change tip table with new data
  let tips_table = d3.select("#tab-tips tbody"),
      columns = ['Name', 'Date', 'Uncertainty', 'Height']

  // make row for each sequence
  let rows = tips_table.selectAll("tr")
      .data(new_data)
      .enter()
      .append("tr");

  let cells = rows.selectAll("td")
      .data(function(row) {
        return columns.map(function(column) {
          return {column: column, value: row[column]};
        })
      })
      .enter()
      .append("td")
      .text( function(d) {
        return(d.value);
      });


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

