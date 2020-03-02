$( function() {
  $( "#tabs" ).tabs();
} );

// partitions
function addPartition() {
  console.log("click");
}

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
  console.log(val);

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
  console.log('ready!');
  $( '#ncat-range' ).trigger("change");
  $( '#select-treeModel' ).trigger("change");
  // tips

  // sites
  d3.select("#select-submodel").on("change", function() {
    console.log(this.value);
  });
});

