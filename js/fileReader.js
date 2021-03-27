/**
 * Created by art on 2014-09-18.
 */
// Event handlers.........................................

var filename,
    alignment = [];

var maxlen = 0;  // maximum sequence length


window.onload = function() {
  // Check for the various File API support.
  if (window.File && window.FileReader && window.FileList && window.Blob) {
    // Great success! All the File APIs are supported.
  } else {
    alert('The File APIs are not fully supported in this browser.');
  }

  // bind file browser to HTML5 FileReader
  $('#id_inputFile').on('change', function (e) {
    let files = e.target.files,  // FileList object
        f = files[0];

    filename = f.name;
    // TODO: check file MIME type, should be a plain text file
    let reader = new FileReader();
    reader.readAsText(f);
    reader.onload = fileReadComplete;
  });

};


/**
 * Parse FASTA from file contents
 * @param f: ProgressEvent
 */

function fileReadComplete (f) {
  var contents = f.target.result,
      lines = contents.split(/\r\n|\r|\n/g),
      header = '',
      sequence = '';

  // parse FASTA file
  for (let line, i = 0; i < lines.length; i++) {
    line = lines[i];
    if (line[0] === '>') {
      if (sequence.length > 0) {
        alignment.push({'header': header, 'rawseq': sequence});
        if (sequence.length > maxlen) {
          maxlen = sequence.length;
        }
        sequence = '';
      }
      header = line.slice(1);  // drop leading '>'
    } else {
      sequence += line.toUpperCase();
    }
  }
  // add last entry
  alignment.push({'header': header, 'rawseq': sequence, 'date': 0.});


  // clear table rows
  $("#part-table tbody > tr").remove();
  // TODO: detect nucleotide/amino acid

  // update partitions table
  $("#tab-partitions tbody")
      .append(`<tr style="vertical-align: top; "><td>${filename.split('.')[0]}</td><td>${filename}</td><td>${alignment.length}</td><td>${maxlen}</td><td>nucleotide</td><td>default</td><td>default</td><td>default</td></tr>`);

  // trigger update events in other panels
  updateTips();

  let stem = filename.split('.')[0];
  $("#filename_stem").val(stem);
  $("#log_file_name").val(stem+'.log');
  $("#trees_file_name").val(stem+'.trees');
}


function updateTips() {
  // http://bl.ocks.org/jfreels/6734025
  $("#Parser").removeAttr("disabled") 
  let tips_table = d3.select("#tab-tips tbody"),
      columns = ['Name', 'Date', 'Uncertainty', 'Height'],
      tip_data = alignment.map(function(row) {
        return {'Name': row['header'], 'Date': 0.0, 'Uncertainty': 0.0, 'Height': 0.0};
      });

  // make row for each sequence
  let rows = tips_table.selectAll("tr")
      .data(tip_data)
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
}
